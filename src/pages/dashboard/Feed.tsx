import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Send, Users, TrendingUp, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    committee: string | null;
  };
}

interface TopMember {
  id: string;
  full_name: string;
  total_points: number;
  committee: string | null;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string | null;
  type: string;
}

export default function Feed() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, profile, hasElevatedRole } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [filter, setFilter] = useState<'all' | 'committee'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter, profile?.committee]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch posts based on filter
      let postsQuery = supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          author_id,
          profiles!posts_author_id_fkey(full_name, avatar_url, committee)
        `)
        .in('visibility', ['internal_all', 'committee_only'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (filter === 'committee' && profile?.committee) {
        postsQuery = postsQuery.eq('committee_tag', profile.committee);
      }

      const { data: postsData, error: postsError } = await postsQuery;
      if (postsError) throw postsError;
      setPosts(postsData as unknown as Post[] || []);

      // Fetch top members
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('id, full_name, total_points, committee')
        .eq('status', 'active')
        .order('total_points', { ascending: false })
        .limit(5);

      if (membersError) throw membersError;
      setTopMembers(membersData || []);

      // Fetch upcoming events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title, date, location, type')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user || !hasElevatedRole) return;

    setIsPosting(true);
    try {
      const { error } = await supabase.from('posts').insert({
        title: 'Feed post',
        content: newPost.trim(),
        author_id: user.id,
        visibility: 'internal_all',
      });

      if (error) throw error;

      toast({
        title: 'Publié!',
        description: 'Votre message a été partagé.',
      });
      setNewPost('');
      fetchData();
    } catch (error) {
      console.error('Error posting:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de publier le message',
        variant: 'destructive',
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('dashboard.feed')}</h1>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('dashboard.feed')}</h1>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'committee')}>
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Users className="h-4 w-4" />
              {t('dashboard.allClub')}
            </TabsTrigger>
            <TabsTrigger value="committee" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('dashboard.myCommittee')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Post (only for elevated roles) */}
          {hasElevatedRole && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>{profile?.full_name ? getInitials(profile.full_name) : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Partagez une mise à jour avec le club..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end mt-3">
                      <Button onClick={handlePost} disabled={!newPost.trim() || isPosting}>
                        <Send className="h-4 w-4 me-2" />
                        {isPosting ? 'Publication...' : 'Publier'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts */}
          {posts.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center text-muted-foreground">
                Aucune publication pour le moment.
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={post.profiles?.avatar_url || undefined} />
                      <AvatarFallback>{post.profiles?.full_name ? getInitials(post.profiles.full_name) : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{post.profiles?.full_name || 'Membre'}</span>
                        {post.profiles?.committee && (
                          <Badge variant="secondary" className="text-xs">{post.profiles.committee}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                </CardContent>
                <CardContent className="pt-0 pb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Heart className="h-4 w-4" />
                      0
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      0
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('dashboard.leaderboard')}
              </CardTitle>
              <CardDescription>Top 5 membres</CardDescription>
            </CardHeader>
            <CardContent>
              {topMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun classement disponible
                </p>
              ) : (
                <div className="space-y-3">
                  {topMembers.map((member, index) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-950' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-400 text-orange-950' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground">{member.committee || 'Non assigné'}</p>
                      </div>
                      <Badge variant="outline" className="font-bold">{member.total_points} pts</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t('dashboard.meetings')}
              </CardTitle>
              <CardDescription>Prochains événements</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun événement à venir
                </p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border-s-2 border-primary ps-3">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - {event.type === 'online' ? 'En ligne' : event.location || 'Présentiel'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

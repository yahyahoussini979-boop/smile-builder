import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Trophy, FileText, Heart, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type CommitteeType = 'Sponsoring' | 'Communication' | 'Event' | 'Technique' | 'Media' | 'Bureau';

interface MemberData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  status: string;
  created_at: string;
  committees: CommitteeType[];
  role: string;
}

interface PointsEntry {
  id: string;
  task_description: string;
  complexity_score: number;
  date: string;
  admin_comment: string | null;
}

interface PostEntry {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [member, setMember] = useState<MemberData | null>(null);
  const [points, setPoints] = useState<PointsEntry[]>([]);
  const [posts, setPosts] = useState<PostEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMemberData();
    }
  }, [id]);

  const fetchMemberData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Fetch committees
      const { data: committeesData } = await supabase
        .from('member_committees')
        .select('committee')
        .eq('member_id', id);

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', id)
        .maybeSingle();

      setMember({
        ...profileData,
        committees: (committeesData || []).map(c => c.committee as CommitteeType),
        role: roleData?.role || 'member',
      });

      // Fetch points (only if viewing own profile or has elevated role)
      const { data: pointsData } = await supabase
        .from('points_log')
        .select('id, task_description, complexity_score, date, admin_comment')
        .eq('member_id', id)
        .order('date', { ascending: false })
        .limit(20);

      setPoints(pointsData || []);

      // Fetch posts by this member
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, content, image_url, created_at')
        .eq('author_id', id)
        .in('visibility', ['public', 'internal_all'])
        .order('created_at', { ascending: false })
        .limit(10);

      // Get likes and comments count for each post
      const postsWithCounts = await Promise.all(
        (postsData || []).map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
            supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
          ]);
          return {
            ...post,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
          };
        })
      );

      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      bureau: 'Bureau',
      admin: 'Admin',
      respo: 'Responsable',
      member: 'Membre',
      embesa: 'Embesa',
    };
    return labels[role] || 'Membre';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/dashboard/members" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux membres
          </Link>
        </Button>
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            Membre non trouvé
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProfile = user?.id === member.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{member.full_name}</h1>
          <p className="text-muted-foreground">Profil du membre</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={member.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(member.full_name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{member.full_name}</CardTitle>
            <CardDescription className="flex flex-col items-center gap-2">
              <Badge>{getRoleLabel(member.role)}</Badge>
              {member.status === 'embesa' && (
                <Badge variant="outline" className="bg-muted">Embesa</Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Committees */}
              <div className="flex flex-wrap gap-2 justify-center">
                {member.committees.length > 0 ? (
                  member.committees.map((c) => (
                    <Badge key={c} variant="secondary">{c}</Badge>
                  ))
                ) : (
                  <Badge variant="outline">Non assigné</Badge>
                )}
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                <Calendar className="h-4 w-4" />
                Membre depuis {new Date(member.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{member.total_points}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{posts.length}</p>
                  <p className="text-xs text-muted-foreground">Publications</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Section */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="posts">
            <TabsList>
              <TabsTrigger value="posts" className="gap-2">
                <FileText className="h-4 w-4" />
                Publications
              </TabsTrigger>
              <TabsTrigger value="points" className="gap-2">
                <Trophy className="h-4 w-4" />
                Points
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4 mt-4">
              {posts.length === 0 ? (
                <Card className="py-12">
                  <CardContent className="text-center text-muted-foreground">
                    Aucune publication pour le moment.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="py-4 space-y-3">
                        <p className="text-foreground whitespace-pre-wrap line-clamp-4">
                          {post.content}
                        </p>
                        {post.image_url && (
                          <img 
                            src={post.image_url} 
                            alt="Post" 
                            className="rounded-lg max-h-48 object-cover"
                          />
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {new Date(post.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {post.comments_count}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="points" className="space-y-4 mt-4">
              {points.length === 0 ? (
                <Card className="py-12">
                  <CardContent className="text-center text-muted-foreground">
                    {isOwnProfile 
                      ? "Vous n'avez pas encore reçu de points."
                      : "Ce membre n'a pas encore reçu de points."}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {points.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="py-4 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                          +{entry.complexity_score}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{entry.task_description}</p>
                          {entry.admin_comment && (
                            <p className="text-sm text-muted-foreground italic mt-1">
                              "{entry.admin_comment}"
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            {new Date(entry.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
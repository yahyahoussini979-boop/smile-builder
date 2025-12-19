import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Send, Users, TrendingUp, Calendar } from 'lucide-react';
import { useState } from 'react';

// Sample data
const feedPosts = [
  {
    id: 1,
    author: { name: 'Sara Amrani', avatar: '', role: 'Respo Media', committee: 'Media' },
    content: 'Super réunion aujourd\'hui avec l\'équipe média! Nous avons finalisé le planning pour la prochaine caravane 🎥',
    timestamp: '2024-01-15T14:30:00',
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    author: { name: 'Ahmed Benali', avatar: '', role: 'Président', committee: 'Bureau' },
    content: 'Félicitations à toute l\'équipe pour le succès de notre dernière action! Plus de 500 bénéficiaires servis. C\'est ça l\'esprit Mohandiss Al Basma! 💚',
    timestamp: '2024-01-14T10:00:00',
    likes: 45,
    comments: 8,
  },
  {
    id: 3,
    author: { name: 'Youssef Elhadi', avatar: '', role: 'Membre', committee: 'Event' },
    content: 'Qui est disponible ce weekend pour préparer les kits? On a besoin de bras! 💪',
    timestamp: '2024-01-13T16:45:00',
    likes: 8,
    comments: 15,
  },
];

const topMembers = [
  { name: 'Sara Amrani', points: 156, committee: 'Media' },
  { name: 'Karim Idrissi', points: 142, committee: 'Event' },
  { name: 'Fatima Zohra', points: 128, committee: 'Communication' },
  { name: 'Omar Benjelloun', points: 115, committee: 'Technique' },
  { name: 'Leila Haddaoui', points: 98, committee: 'Sponsoring' },
];

export default function Feed() {
  const { t } = useLanguage();
  const [newPost, setNewPost] = useState('');
  const [filter, setFilter] = useState<'all' | 'committee'>('all');

  const handlePost = () => {
    if (newPost.trim()) {
      // TODO: Implement post creation
      setNewPost('');
    }
  };

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
          {/* New Post */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Partagez une mise à jour avec le club..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <Button onClick={handlePost} disabled={!newPost.trim()}>
                      <Send className="h-4 w-4 me-2" />
                      Publier
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {feedPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{post.author.name}</span>
                      <Badge variant="secondary" className="text-xs">{post.author.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {post.author.committee} • {new Date(post.timestamp).toLocaleDateString('fr-FR', {
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
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
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
              <CardDescription>Top 5 ce mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMembers.map((member, index) => (
                  <div key={member.name} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-yellow-950' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-950' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.committee}</p>
                    </div>
                    <Badge variant="outline" className="font-bold">{member.points} pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t('dashboard.meetings')}
              </CardTitle>
              <CardDescription>Prochaines réunions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-s-2 border-primary ps-3">
                  <p className="font-medium text-sm">Réunion générale</p>
                  <p className="text-xs text-muted-foreground">20 Jan, 18:00 - En ligne</p>
                </div>
                <div className="border-s-2 border-muted ps-3">
                  <p className="font-medium text-sm">Comité Média</p>
                  <p className="text-xs text-muted-foreground">22 Jan, 14:00 - Salle B12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

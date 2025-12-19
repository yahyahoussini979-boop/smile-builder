import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Edit, Mail, Calendar, FileText, Lock, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface PointsLogEntry {
  id: string;
  task_description: string;
  complexity_score: number;
  date: string;
  admin_comment: string | null;
}

export default function Profile() {
  const { t } = useLanguage();
  const { user, profile, role } = useAuth();
  const [pointsHistory, setPointsHistory] = useState<PointsLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPointsHistory();
    }
  }, [user]);

  const fetchPointsHistory = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('points_log')
        .select('id, task_description, complexity_score, date, admin_comment')
        .eq('member_id', user.id)
        .order('date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPointsHistory(data || []);
    } catch (error) {
      console.error('Error fetching points history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const getRoleLabel = () => {
    if (!role) return 'Membre';
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
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.profile')}</h1>
          <p className="text-muted-foreground">Gérez votre profil et vos notes</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.profile')}</h1>
        <p className="text-muted-foreground">Gérez votre profil et consultez votre historique</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{profile?.full_name || user?.email}</CardTitle>
            <CardDescription className="flex flex-col items-center gap-2">
              <Badge>{getRoleLabel()}</Badge>
              {profile?.committee && <span>{profile.committee}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Membre depuis {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'N/A'}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{profile?.total_points || 0}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{pointsHistory.length}</p>
                  <p className="text-xs text-muted-foreground">Tâches</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2" disabled>
                <Edit className="h-4 w-4" />
                Modifier le profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* History Section */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="history">
            <TabsList>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                Historique des points
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4 mt-4">
              {pointsHistory.length === 0 ? (
                <Card className="py-12">
                  <CardContent className="text-center text-muted-foreground">
                    Aucun point attribué pour le moment.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pointsHistory.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="py-4 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                          +{entry.complexity_score}
                        </div>
                        <div className="flex-1">
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

            <TabsContent value="notes" className="space-y-4 mt-4">
              <Card className="bg-muted/50 border-dashed">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Notes & Communications
                  </CardTitle>
                  <CardDescription>
                    Fonctionnalité à venir - Les notes partagées et admin seront disponibles bientôt.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

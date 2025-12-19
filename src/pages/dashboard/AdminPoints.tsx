import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Award, History, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Member {
  id: string;
  full_name: string;
  committee: string | null;
}

interface PointsEntry {
  id: string;
  member_id: string;
  task_description: string;
  complexity_score: number;
  date: string;
  admin_comment: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function AdminPoints() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, hasElevatedRole } = useAuth();
  const [selectedMember, setSelectedMember] = useState('');
  const [task, setTask] = useState('');
  const [complexity, setComplexity] = useState('');
  const [comment, setComment] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch active members
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('id, full_name, committee')
        .eq('status', 'active')
        .order('full_name');

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Fetch recent points history
      const { data: historyData, error: historyError } = await supabase
        .from('points_log')
        .select(`
          id,
          member_id,
          task_description,
          complexity_score,
          date,
          admin_comment,
          created_at,
          profiles!points_log_member_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyError) throw historyError;
      setPointsHistory(historyData as unknown as PointsEntry[] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !hasElevatedRole) {
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'avez pas les droits pour cette action',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('points_log').insert({
        member_id: selectedMember,
        task_description: task,
        complexity_score: parseInt(complexity),
        admin_comment: comment || null,
        created_by: user.id,
        date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      toast({
        title: 'Points attribués!',
        description: `${complexity} points attribués avec succès.`,
      });

      // Reset form
      setSelectedMember('');
      setTask('');
      setComplexity('');
      setComment('');
      
      // Refresh history
      fetchData();
    } catch (error) {
      console.error('Error adding points:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'attribuer les points',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasElevatedRole) {
    return (
      <Card className="py-12">
        <CardContent className="text-center text-muted-foreground">
          Vous n'avez pas accès à cette section.
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.points')}</h1>
          <p className="text-muted-foreground">Attribuez des points aux membres pour leurs tâches</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.points')}</h1>
        <p className="text-muted-foreground">Attribuez des points aux membres pour leurs tâches</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Points Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Attribuer des points
            </CardTitle>
            <CardDescription>
              Remplissez ce formulaire pour récompenser un membre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member">Membre</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un membre" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name} {member.committee ? `(${member.committee})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task">Tâche accomplie</Label>
                <Input
                  id="task"
                  placeholder="Ex: Montage vidéo caravane"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complexity">Complexité (Points)</Label>
                <Select value={complexity} onValueChange={setComplexity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Score de complexité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Très simple</SelectItem>
                    <SelectItem value="2">2 - Simple</SelectItem>
                    <SelectItem value="3">3 - Moyen</SelectItem>
                    <SelectItem value="5">5 - Complexe</SelectItem>
                    <SelectItem value="8">8 - Très complexe</SelectItem>
                    <SelectItem value="10">10 - Exceptionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Commentaire (optionnel)</Label>
                <Textarea
                  id="comment"
                  placeholder="Notes additionnelles..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={!selectedMember || !task || !complexity || isSubmitting}
              >
                <Plus className="h-4 w-4" />
                {isSubmitting ? 'Attribution...' : 'Attribuer les points'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique récent
            </CardTitle>
            <CardDescription>
              Dernières attributions de points
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pointsHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune attribution de points pour le moment.
              </p>
            ) : (
              <div className="space-y-4">
                {pointsHistory.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      +{entry.complexity_score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{entry.profiles?.full_name || 'Membre'}</p>
                      <p className="text-sm text-muted-foreground truncate">{entry.task_description}</p>
                      {entry.admin_comment && (
                        <p className="text-sm text-muted-foreground italic mt-1">"{entry.admin_comment}"</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

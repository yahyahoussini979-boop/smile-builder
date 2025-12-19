import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Award, History, Plus } from 'lucide-react';

// Sample members for selection
const members = [
  { id: '1', name: 'Sara Amrani', committee: 'Media' },
  { id: '2', name: 'Karim Idrissi', committee: 'Event' },
  { id: '3', name: 'Fatima Zohra', committee: 'Communication' },
  { id: '4', name: 'Omar Benjelloun', committee: 'Technique' },
  { id: '5', name: 'Nadia Bennani', committee: 'Media' },
];

// Sample points history
const pointsHistory = [
  { id: 1, member: 'Sara Amrani', task: 'Montage vidéo caravane', complexity: 5, date: '2024-01-15', comment: 'Excellent travail!' },
  { id: 2, member: 'Karim Idrissi', task: 'Organisation logistique', complexity: 3, date: '2024-01-14', comment: '' },
  { id: 3, member: 'Fatima Zohra', task: 'Publication réseaux sociaux', complexity: 2, date: '2024-01-13', comment: 'Bonne couverture' },
];

export default function AdminPoints() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedMember, setSelectedMember] = useState('');
  const [task, setTask] = useState('');
  const [complexity, setComplexity] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Save to database
    toast({
      title: 'Points attribués!',
      description: `${complexity} points attribués avec succès.`,
    });

    // Reset form
    setSelectedMember('');
    setTask('');
    setComplexity('');
    setComment('');
  };

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
                        {member.name} ({member.committee})
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

              <Button type="submit" className="w-full gap-2" disabled={!selectedMember || !task || !complexity}>
                <Plus className="h-4 w-4" />
                Attribuer les points
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
            <div className="space-y-4">
              {pointsHistory.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    +{entry.complexity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{entry.member}</p>
                    <p className="text-sm text-muted-foreground truncate">{entry.task}</p>
                    {entry.comment && (
                      <p className="text-sm text-muted-foreground italic mt-1">"{entry.comment}"</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

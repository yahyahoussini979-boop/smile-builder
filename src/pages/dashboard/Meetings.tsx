import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Users, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface Meeting {
  id: string;
  title: string;
  date: string;
  type: 'online' | 'presential';
  location: string | null;
  description: string | null;
  created_by: string | null;
}

export default function Meetings() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'online' | 'presential'>('online');
  const [location, setLocation] = useState('');

  const fetchMeetings = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data) {
      setMeetings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCreate = async () => {
    if (!title || !date || !time) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires.', variant: 'destructive' });
      return;
    }

    setCreating(true);
    const dateTime = new Date(`${date}T${time}`).toISOString();

    const { error } = await supabase.from('events').insert({
      title,
      description: description || null,
      date: dateTime,
      type,
      location: type === 'presential' ? location : null,
      created_by: user?.id,
    });

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de créer la réunion.', variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Réunion créée avec succès.' });
      setDialogOpen(false);
      resetForm();
      fetchMeetings();
    }
    setCreating(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setType('online');
    setLocation('');
  };

  const now = new Date();
  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= now);
  const pastMeetings = meetings.filter(m => new Date(m.date) < now);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.meetings')}</h1>
          <p className="text-muted-foreground">Calendrier des réunions du club</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle réunion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une réunion</DialogTitle>
              <DialogDescription>Planifiez une nouvelle réunion pour le club.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Réunion Générale" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description de la réunion..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Heure *</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as 'online' | 'presential')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">En ligne</SelectItem>
                    <SelectItem value="presential">Présentiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {type === 'presential' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Salle B12, FST" />
                </div>
              )}
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? 'Création...' : 'Créer la réunion'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Meetings */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Réunions à venir</h2>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-20 w-full" /></CardContent>
              </Card>
            ))}
          </div>
        ) : upcomingMeetings.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <CardDescription>{meeting.description}</CardDescription>
                    </div>
                    <Badge variant={meeting.type === 'online' ? 'default' : 'secondary'}>
                      {meeting.type === 'online' ? (
                        <><Video className="h-3 w-3 me-1" /> En ligne</>
                      ) : (
                        <><MapPin className="h-3 w-3 me-1" /> Présentiel</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(meeting.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(meeting.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {meeting.type === 'presential' && meeting.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {meeting.location}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Aucune réunion à venir.</p>
        )}
      </div>

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Réunions passées</h2>
          <div className="space-y-2">
            {pastMeetings.map((meeting) => (
              <Card key={meeting.id} className="bg-muted/50">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        {meeting.type === 'online' ? (
                          <Video className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.date).toLocaleDateString('fr-FR')} à {new Date(meeting.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

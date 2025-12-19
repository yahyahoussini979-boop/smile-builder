import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Users, Plus } from 'lucide-react';

// Sample meetings data
const meetings = [
  {
    id: 1,
    title: 'Réunion Générale',
    date: '2024-01-20',
    time: '18:00',
    type: 'online',
    link: 'https://meet.google.com/xxx',
    description: 'Bilan mensuel et planification des prochaines actions.',
    attendees: 45,
  },
  {
    id: 2,
    title: 'Comité Média',
    date: '2024-01-22',
    time: '14:00',
    type: 'presence',
    location: 'Salle B12, FST',
    description: 'Préparation du contenu pour la caravane.',
    attendees: 12,
  },
  {
    id: 3,
    title: 'Comité Événements',
    date: '2024-01-25',
    time: '16:00',
    type: 'online',
    link: 'https://meet.google.com/yyy',
    description: 'Organisation de la prochaine action Bahja.',
    attendees: 15,
  },
  {
    id: 4,
    title: 'Bureau Exécutif',
    date: '2024-01-27',
    time: '10:00',
    type: 'presence',
    location: 'Bureau du club',
    description: 'Réunion stratégique du bureau.',
    attendees: 4,
  },
];

export default function Meetings() {
  const { t } = useLanguage();

  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= new Date());
  const pastMeetings = meetings.filter(m => new Date(m.date) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.meetings')}</h1>
          <p className="text-muted-foreground">Calendrier des réunions du club</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle réunion
        </Button>
      </div>

      {/* Upcoming Meetings */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Réunions à venir</h2>
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
                      {meeting.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    {meeting.type === 'online' ? (
                      <><Video className="h-4 w-4" /> {meeting.link}</>
                    ) : (
                      <><MapPin className="h-4 w-4" /> {meeting.location}</>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {meeting.attendees} participants attendus
                    </span>
                    <Button size="sm" variant="outline">
                      Voir détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                          {new Date(meeting.date).toLocaleDateString('fr-FR')} à {meeting.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{meeting.attendees} participants</Badge>
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

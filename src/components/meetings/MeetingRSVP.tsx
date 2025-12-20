import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Check, X, HelpCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type RSVPStatus = 'attending' | 'maybe' | 'not_attending';

interface Attendee {
  id: string;
  status: RSVPStatus;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface MeetingRSVPProps {
  eventId: string;
  showAttendeesButton?: boolean;
}

export function MeetingRSVP({ eventId, showAttendeesButton = true }: MeetingRSVPProps) {
  const { user, hasElevatedRole } = useAuth();
  const { toast } = useToast();
  const [myStatus, setMyStatus] = useState<RSVPStatus | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAttendance = async () => {
    // Fetch all attendees with profiles
    const { data: attendeesData } = await supabase
      .from('meeting_attendance')
      .select(`
        id,
        status,
        user_id,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('event_id', eventId);

    if (attendeesData) {
      setAttendees(attendeesData as unknown as Attendee[]);
      // Find current user's status
      const myAttendance = attendeesData.find(a => a.user_id === user?.id);
      setMyStatus(myAttendance?.status as RSVPStatus || null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAttendance();
    }
  }, [eventId, user]);

  const handleRSVP = async (status: RSVPStatus) => {
    if (!user) return;
    setLoading(true);

    // Check if user already has an RSVP
    const existingRSVP = attendees.find(a => a.user_id === user.id);

    if (existingRSVP) {
      if (status === existingRSVP.status) {
        // Remove RSVP
        const { error } = await supabase
          .from('meeting_attendance')
          .delete()
          .eq('id', existingRSVP.id);

        if (!error) {
          setMyStatus(null);
          toast({ title: 'RSVP annulé' });
        }
      } else {
        // Update RSVP
        const { error } = await supabase
          .from('meeting_attendance')
          .update({ status })
          .eq('id', existingRSVP.id);

        if (!error) {
          setMyStatus(status);
          toast({ title: 'RSVP mis à jour' });
        }
      }
    } else {
      // Create new RSVP
      const { error } = await supabase
        .from('meeting_attendance')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status,
        });

      if (!error) {
        setMyStatus(status);
        toast({ title: 'RSVP enregistré' });
      }
    }

    await fetchAttendance();
    setLoading(false);
  };

  const attendingCount = attendees.filter(a => a.status === 'attending').length;
  const maybeCount = attendees.filter(a => a.status === 'maybe').length;

  const getStatusLabel = (status: RSVPStatus) => {
    switch (status) {
      case 'attending': return 'Présent';
      case 'maybe': return 'Peut-être';
      case 'not_attending': return 'Absent';
    }
  };

  const getStatusIcon = (status: RSVPStatus) => {
    switch (status) {
      case 'attending': return <Check className="h-3 w-3" />;
      case 'maybe': return <HelpCircle className="h-3 w-3" />;
      case 'not_attending': return <X className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* RSVP Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={myStatus === 'attending' ? 'default' : 'outline'}
          onClick={() => handleRSVP('attending')}
          disabled={loading}
          className={cn(
            'gap-1',
            myStatus === 'attending' && 'bg-green-600 hover:bg-green-700'
          )}
        >
          <Check className="h-3 w-3" />
          Présent
        </Button>
        <Button
          size="sm"
          variant={myStatus === 'maybe' ? 'default' : 'outline'}
          onClick={() => handleRSVP('maybe')}
          disabled={loading}
          className={cn(
            'gap-1',
            myStatus === 'maybe' && 'bg-amber-500 hover:bg-amber-600'
          )}
        >
          <HelpCircle className="h-3 w-3" />
          Peut-être
        </Button>
        <Button
          size="sm"
          variant={myStatus === 'not_attending' ? 'default' : 'outline'}
          onClick={() => handleRSVP('not_attending')}
          disabled={loading}
          className={cn(
            'gap-1',
            myStatus === 'not_attending' && 'bg-destructive hover:bg-destructive/90'
          )}
        >
          <X className="h-3 w-3" />
          Absent
        </Button>
      </div>

      {/* Attendance Summary */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Users className="h-4 w-4" />
          {attendingCount} présent{attendingCount !== 1 ? 's' : ''}
          {maybeCount > 0 && ` • ${maybeCount} peut-être`}
        </span>

        {/* View Attendees Dialog (Admin only) */}
        {showAttendeesButton && hasElevatedRole && attendees.length > 0 && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                Voir les participants
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Liste des participants</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(['attending', 'maybe', 'not_attending'] as RSVPStatus[]).map((status) => {
                  const statusAttendees = attendees.filter(a => a.status === status);
                  if (statusAttendees.length === 0) return null;

                  return (
                    <div key={status}>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        {getStatusIcon(status)}
                        {getStatusLabel(status)} ({statusAttendees.length})
                      </h4>
                      <div className="space-y-2">
                        {statusAttendees.map((attendee) => (
                          <div key={attendee.id} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={attendee.profiles?.avatar_url || undefined} />
                              <AvatarFallback>
                                {attendee.profiles?.full_name?.[0] || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {attendee.profiles?.full_name || 'Utilisateur'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

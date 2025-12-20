import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useMeetingNotifications() {
  const { profile, hasElevatedRole } = useAuth();
  const [hasNewMeetings, setHasNewMeetings] = useState(false);

  useEffect(() => {
    const checkNewMeetings = async () => {
      const now = new Date();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('events')
        .select('id, target_audience, created_at, date')
        .gte('date', now.toISOString())
        .gte('created_at', fortyEightHoursAgo.toISOString());

      if (error || !data) {
        setHasNewMeetings(false);
        return;
      }

      // Filter meetings relevant to the user
      const relevantMeetings = data.filter((meeting) => {
        // Public meetings (null target_audience)
        if (meeting.target_audience === null) return true;
        // Elevated roles see everything
        if (hasElevatedRole) return true;
        // Users see meetings for their committee
        if (profile?.committee === meeting.target_audience) return true;
        return false;
      });

      setHasNewMeetings(relevantMeetings.length > 0);
    };

    checkNewMeetings();
  }, [profile?.committee, hasElevatedRole]);

  return { hasNewMeetings };
}

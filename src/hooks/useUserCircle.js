'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUserCircle() {
  const [circleId, setCircleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getUserCircle() {
      try {
        const supabase = createClient();
        
        // Get user's first circle (or create logic for circle selection)
        const { data, error } = await supabase
          .from('circle_members')
          .select('circle_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .limit(1);

        if (error) throw error;
        
        setCircleId(data?.[0]?.circle_id || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getUserCircle();
  }, []);

  return { circleId, loading, error };
}

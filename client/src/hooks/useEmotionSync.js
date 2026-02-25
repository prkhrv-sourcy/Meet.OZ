import { useEffect, useRef } from 'react';
import { useMeeting } from '@/contexts/MeetingContext';
import { postEmotions } from '@/services/api';

const SYNC_INTERVAL = 30000;

export default function useEmotionSync() {
  const { state } = useMeeting();
  const lastSyncIndex = useRef(0);

  useEffect(() => {
    if (!state.code) return;

    const interval = setInterval(async () => {
      const newSnapshots = state.emotionData.slice(lastSyncIndex.current);
      if (newSnapshots.length === 0) return;

      try {
        await postEmotions(state.code, newSnapshots);
        lastSyncIndex.current = state.emotionData.length;
      } catch {
        // Will retry next interval
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [state.code, state.emotionData]);
}

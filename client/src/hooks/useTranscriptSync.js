import { useEffect, useRef } from 'react';
import { useMeeting } from '@/contexts/MeetingContext';
import { postTranscript } from '@/services/api';

const SYNC_INTERVAL = 30000;

export default function useTranscriptSync() {
  const { state } = useMeeting();
  const lastSyncIndex = useRef(0);

  useEffect(() => {
    if (!state.code) return;

    const interval = setInterval(async () => {
      const newSegments = state.transcript.slice(lastSyncIndex.current);
      if (newSegments.length === 0) return;

      try {
        await postTranscript(state.code, newSegments);
        lastSyncIndex.current = state.transcript.length;
      } catch {
        // Will retry next interval
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [state.code, state.transcript]);
}

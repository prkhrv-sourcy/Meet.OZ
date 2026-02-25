import { useState, useEffect, useRef, useCallback } from 'react';
import { useMeeting } from '@/contexts/MeetingContext';

const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

export default function useTranscription(enabled, userName) {
  const { dispatch, state } = useMeeting();
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  const start = useCallback(() => {
    if (!SpeechRecognition || !enabled) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          dispatch({
            type: 'ADD_TRANSCRIPT',
            segment: {
              participantId: 'local',
              participantName: userName,
              text: text.trim(),
              timestamp: new Date().toISOString(),
            },
          });
          setInterimText('');
        } else {
          interim += text;
        }
      }
      if (interim) setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return;
      console.warn('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      // Auto-restart (Chrome stops after ~60s)
      if (enabled) {
        restartTimeoutRef.current = setTimeout(() => {
          try { recognition.start(); } catch {}
        }, 500);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {}
  }, [enabled, userName, dispatch]);

  useEffect(() => {
    if (enabled) {
      start();
    }
    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, [enabled, start]);

  return { interimText, transcript: state.transcript };
}

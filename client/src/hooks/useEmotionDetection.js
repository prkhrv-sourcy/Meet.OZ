import { useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { useMeeting } from '@/contexts/MeetingContext';

const DETECTION_INTERVAL = 2000;
let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  ]);
  modelsLoaded = true;
}

function getDominantEmotion(expressions) {
  let maxVal = -1;
  let maxKey = 'neutral';
  for (const [emotion, value] of Object.entries(expressions)) {
    if (value > maxVal) {
      maxVal = value;
      maxKey = emotion;
    }
  }
  return { emotion: maxKey, confidence: maxVal };
}

export default function useEmotionDetection(localVideoTrack, userName) {
  const { dispatch } = useMeeting();
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);

  const detectEmotion = useCallback(async () => {
    if (!localVideoTrack) return;

    // Get the underlying video element from Agora's track
    const elements = localVideoTrack._player?.videoElement
      ? [localVideoTrack._player.videoElement]
      : document.querySelectorAll('video');

    let video = null;
    for (const el of elements) {
      if (el.videoWidth > 0 && el.videoHeight > 0) {
        video = el;
        break;
      }
    }
    if (!video) return;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detection) {
        const { emotion, confidence } = getDominantEmotion(detection.expressions);
        dispatch({ type: 'SET_LOCAL_EMOTION', emotion });
        dispatch({
          type: 'ADD_EMOTION',
          snapshot: {
            participantId: 'local',
            participantName: userName,
            timestamp: new Date().toISOString(),
            emotion,
            confidence,
          },
        });
      }
    } catch (err) {
      // Detection can fail occasionally, silently continue
    }
  }, [localVideoTrack, userName, dispatch]);

  useEffect(() => {
    let mounted = true;

    loadModels().then(() => {
      if (!mounted) return;
      intervalRef.current = setInterval(detectEmotion, DETECTION_INTERVAL);
    });

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [detectEmotion]);

  return canvasRef;
}

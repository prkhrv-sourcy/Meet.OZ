import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MeetingProvider, useMeeting } from '@/contexts/MeetingContext';
import useAgora from '@/hooks/useAgora';
import useEmotionDetection from '@/hooks/useEmotionDetection';
import useEmotionSync from '@/hooks/useEmotionSync';
import useTranscription from '@/hooks/useTranscription';
import useTranscriptSync from '@/hooks/useTranscriptSync';
import VideoGrid from '@/components/video/VideoGrid';
import Controls from '@/components/video/Controls';
import TranscriptOverlay from '@/components/video/TranscriptOverlay';
import EmotionLabel from '@/components/emotion/EmotionLabel';
import EngagementMeter from '@/components/emotion/EngagementMeter';
import CoachPanel from '@/components/ai/CoachPanel';
import { joinMeeting, endMeeting, postEmotions, postTranscript } from '@/services/api';

function CallInner() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useMeeting();
  const userName = sessionStorage.getItem('meetoz_name') || 'Guest';
  const [error, setError] = useState('');
  const [ccEnabled, setCcEnabled] = useState(false);
  const uidRef = useRef(Math.floor(Math.random() * 100000));
  const joinedOnceRef = useRef(false);

  const {
    localTracks,
    remoteUsers,
    audioMuted,
    videoMuted,
    join,
    leave,
    toggleAudio,
    toggleVideo,
  } = useAgora(code);

  useEmotionDetection(localTracks.video, userName);
  useEmotionSync();
  const { interimText, transcript } = useTranscription(true, userName);
  useTranscriptSync();

  // Keyboard shortcuts (s = room mood, 1-4 = participant select)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 's' || e.key === 'S') {
        const emotion = state.localEmotion || 'neutral';
        const utterance = new SpeechSynthesisUtterance(`The overall feeling in the room is ${emotion}`);
        speechSynthesis.speak(utterance);
      }

      const num = parseInt(e.key);
      if (num >= 1 && num <= 4) {
        const allUsers = [{ name: userName, emotion: state.localEmotion }];
        remoteUsers.forEach(u => {
          allUsers.push({ name: `User ${u.uid}`, emotion: state.remoteEmotions[u.uid] });
        });
        if (num <= allUsers.length) {
          const user = allUsers[num - 1];
          const emotion = user.emotion || 'neutral';
          const verb = num === 1 ? 'are' : 'is';
          const utterance = new SpeechSynthesisUtterance(`${user.name} ${verb} feeling ${emotion}`);
          speechSynthesis.speak(utterance);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.localEmotion, state.remoteEmotions, remoteUsers, userName]);

  useEffect(() => {
    // Guard against React 18 StrictMode double-mount
    if (joinedOnceRef.current) return;
    joinedOnceRef.current = true;

    dispatch({ type: 'SET_MEETING', code, title: 'Meeting', status: 'active' });
    dispatch({ type: 'SET_USER', name: userName });

    const uid = uidRef.current;

    joinMeeting(code, String(uid), userName).catch(() => {});
    join(uid).catch(err => setError(err.message));
  }, [code]);

  const handleLeave = useCallback(async () => {
    await leave();

    // Flush all collected data to backend before navigating away
    try {
      const flushPromises = [];
      if (state.emotionData.length > 0) {
        flushPromises.push(postEmotions(code, state.emotionData));
      }
      if (state.transcript.length > 0) {
        flushPromises.push(postTranscript(code, state.transcript));
      }
      flushPromises.push(endMeeting(code));
      await Promise.all(flushPromises);
    } catch {}

    navigate(`/analytics/${code}`);
  }, [code, leave, navigate, state.emotionData, state.transcript]);

  const emotionLabelSlot = useCallback((_id, emotion) => (
    <EmotionLabel emotion={emotion} />
  ), []);

  if (error) {
    return (
      <div className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <button onClick={() => navigate('/')} className="text-brand-gold hover:underline">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-surface-dark flex flex-col relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 h-14 bg-surface-dark/60 backdrop-blur-2xl border-b border-white/[0.04] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gold-gradient flex items-center justify-center text-surface-dark font-black text-[10px] shadow-gold">OZ</div>
          <span className="text-white/80 font-semibold text-sm">Meet.OZ</span>
        </div>
        <div className="flex items-center gap-4">
          <EngagementMeter emotionData={state.emotionData} />
          <div className="glass px-3 py-1 rounded-lg">
            <span className="text-white/40 text-xs font-mono tracking-wide">{code}</span>
          </div>
        </div>
      </div>
      <VideoGrid
        localVideoTrack={localTracks.video}
        remoteUsers={remoteUsers}
        userName={userName}
        localEmotion={state.localEmotion}
        remoteEmotions={state.remoteEmotions}
        emotionLabelSlot={emotionLabelSlot}
      />
      <CoachPanel />
      <TranscriptOverlay
        transcript={transcript}
        interimText={interimText}
        visible={ccEnabled}
      />
      <Controls
        audioMuted={audioMuted}
        videoMuted={videoMuted}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onLeave={handleLeave}
        ccEnabled={ccEnabled}
        onToggleCC={() => setCcEnabled(!ccEnabled)}
      />
    </div>
  );
}

export default function Call() {
  return (
    <MeetingProvider>
      <CallInner />
    </MeetingProvider>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { getAgoraToken } from '@/services/api';
import { AGORA_APP_ID } from '@/utils/constants';

export default function useAgora(channelName) {
  const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const clientRef = useRef(null);
  const localTracksRef = useRef({ audio: null, video: null });
  const joiningRef = useRef(false);

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      setRemoteUsers(prev => {
        const exists = prev.find(u => u.uid === user.uid);
        if (exists) return prev.map(u => u.uid === user.uid ? user : u);
        return [...prev, user];
      });
    });

    client.on('user-unpublished', (user) => {
      setRemoteUsers(prev => prev.map(u => u.uid === user.uid ? user : u));
    });

    client.on('user-left', (user) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });

    return () => {
      client.removeAllListeners();
    };
  }, []);

  const join = useCallback(async (uid) => {
    const client = clientRef.current;
    if (!client || joined || joiningRef.current) return;
    joiningRef.current = true;

    try {
      let token = null;
      let appId = AGORA_APP_ID;

      try {
        const data = await getAgoraToken(channelName, uid);
        token = data.token;
        if (data.appId) appId = data.appId;
      } catch {
        // Use without token if backend unavailable
      }

      await client.join(appId, channelName, token, uid);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = { audio: audioTrack, video: videoTrack };
      setLocalTracks({ audio: audioTrack, video: videoTrack });

      await client.publish([audioTrack, videoTrack]);
      setJoined(true);
    } catch (err) {
      console.error('Agora join failed:', err);
      throw err;
    } finally {
      joiningRef.current = false;
    }
  }, [channelName, joined]);

  const leave = useCallback(async () => {
    const client = clientRef.current;
    const tracks = localTracksRef.current;

    if (tracks.audio) tracks.audio.close();
    if (tracks.video) tracks.video.close();
    localTracksRef.current = { audio: null, video: null };
    setLocalTracks({ audio: null, video: null });

    if (client) {
      await client.leave();
    }
    setRemoteUsers([]);
    setJoined(false);
    joiningRef.current = false;
  }, []);

  const toggleAudio = useCallback(async () => {
    const track = localTracksRef.current.audio;
    if (!track) return;
    await track.setEnabled(audioMuted);
    setAudioMuted(!audioMuted);
  }, [audioMuted]);

  const toggleVideo = useCallback(async () => {
    const track = localTracksRef.current.video;
    if (!track) return;
    await track.setEnabled(videoMuted);
    setVideoMuted(!videoMuted);
  }, [videoMuted]);

  return {
    localTracks,
    remoteUsers,
    joined,
    audioMuted,
    videoMuted,
    join,
    leave,
    toggleAudio,
    toggleVideo,
  };
}

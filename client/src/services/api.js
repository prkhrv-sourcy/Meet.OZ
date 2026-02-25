import { API_URL } from '@/utils/constants';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Agora
export const getAgoraToken = (channelName, uid) =>
  request('/agora/token', { method: 'POST', body: JSON.stringify({ channelName, uid }) });

// Meetings
export const createMeeting = (title, hostName) =>
  request('/meetings', { method: 'POST', body: JSON.stringify({ title, hostName }) });

export const getMeeting = (code) =>
  request(`/meetings/${code}`);

export const joinMeeting = (code, participantId, name) =>
  request(`/meetings/${code}/join`, { method: 'PUT', body: JSON.stringify({ participantId, name }) });

export const endMeeting = (code) =>
  request(`/meetings/${code}/end`, { method: 'PUT' });

export const postEmotions = (code, snapshots) =>
  request(`/meetings/${code}/emotions`, { method: 'POST', body: JSON.stringify({ snapshots }) });

export const postTranscript = (code, segments) =>
  request(`/meetings/${code}/transcript`, { method: 'POST', body: JSON.stringify({ segments }) });

export const getMeetingHistory = (page = 1, limit = 12) =>
  request(`/meetings/history/list?page=${page}&limit=${limit}`);

export const getMeetingAnalytics = (code) =>
  request(`/meetings/${code}/analytics`);

// AI
export const getCoachingTip = (code, emotionSnapshots, transcript) =>
  request('/ai/coaching', { method: 'POST', body: JSON.stringify({ code, emotionSnapshots, transcript }) });

export const generateSummary = (code) =>
  request('/ai/summary', { method: 'POST', body: JSON.stringify({ code }) });

export const queryAI = (code, question) =>
  request('/ai/query', { method: 'POST', body: JSON.stringify({ code, question }) });

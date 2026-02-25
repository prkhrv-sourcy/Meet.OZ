import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { coachingLimiter, summaryLimiter } from '../middleware/rateLimit.js';
import Meeting from '../models/Meeting.js';
import env from '../config/env.js';

const router = Router();

function getModel() {
  if (!env.geminiApiKey) return null;
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// Real-time coaching nudge
router.post('/coaching', coachingLimiter, async (req, res, next) => {
  try {
    const model = getModel();
    if (!model) return res.json({ tip: 'Configure GEMINI_API_KEY for AI coaching.' });

    const { emotionSnapshots = [], transcript = [] } = req.body;

    const recentEmotions = emotionSnapshots.slice(-10).map(s => `${s.participantName}: ${s.emotion}`).join(', ');
    const recentTranscript = transcript.slice(-5).map(t => `${t.participantName}: ${t.text}`).join('\n');

    const prompt = `You are a real-time meeting coach. Based on recent emotions (${recentEmotions}) and transcript:\n${recentTranscript}\n\nGive ONE actionable coaching tip in 15 words or less. Be specific and helpful. No preamble.`;

    const result = await model.generateContent(prompt);
    const tip = result.response.text().trim();

    res.json({ tip });
  } catch (err) {
    next(err);
  }
});

// Post-meeting summary
router.post('/summary', summaryLimiter, async (req, res, next) => {
  try {
    const model = getModel();
    if (!model) return res.json({ summary: null, message: 'Configure GEMINI_API_KEY for AI summaries.' });

    const { code } = req.body;
    const meeting = await Meeting.findOne({ code });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    const emotionSummary = meeting.emotionSnapshots.slice(-100).map(s =>
      `[${new Date(s.timestamp).toLocaleTimeString()}] ${s.participantName}: ${s.emotion} (${Math.round(s.confidence * 100)}%)`
    ).join('\n');

    const transcriptText = meeting.transcript.slice(-100).map(t =>
      `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.participantName}: ${t.text}`
    ).join('\n');

    const prompt = `Analyze this meeting data and return ONLY valid JSON (no markdown, no code blocks):

Emotions:
${emotionSummary || 'No emotion data'}

Transcript:
${transcriptText || 'No transcript data'}

Return this exact JSON structure:
{"keyMoments":["moment1","moment2"],"emotionalArc":"description of how emotions changed","actionItems":["item1","item2"],"presenterScore":75,"presenterTips":["tip1","tip2"],"overallSentiment":"positive/negative/neutral/mixed"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let summary;
    try {
      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      summary = JSON.parse(jsonStr);
    } catch {
      summary = { keyMoments: [], emotionalArc: text, actionItems: [], presenterScore: 0, presenterTips: [], overallSentiment: 'unknown' };
    }

    summary.generatedAt = new Date();
    await Meeting.findOneAndUpdate({ code }, { $set: { aiSummary: summary } });

    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

// Sentiment Q&A
router.post('/query', async (req, res, next) => {
  try {
    const model = getModel();
    if (!model) return res.json({ answer: 'Configure GEMINI_API_KEY for AI Q&A.' });

    const { code, question } = req.body;
    const meeting = await Meeting.findOne({ code });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    const context = [
      `Meeting: ${meeting.title}`,
      `Participants: ${meeting.participants.map(p => p.name).join(', ')}`,
      `Duration: ${meeting.startTime && meeting.endTime ? Math.round((new Date(meeting.endTime) - new Date(meeting.startTime)) / 60000) + ' minutes' : 'unknown'}`,
      `Emotions recorded: ${meeting.emotionSnapshots.length}`,
      `Transcript segments: ${meeting.transcript.length}`,
      '',
      'Recent emotions: ' + meeting.emotionSnapshots.slice(-30).map(s => `${s.participantName}:${s.emotion}`).join(', '),
      '',
      'Recent transcript: ' + meeting.transcript.slice(-20).map(t => `${t.participantName}: ${t.text}`).join('\n'),
    ].join('\n');

    const prompt = `Based on this meeting data:\n${context}\n\nAnswer this question concisely: ${question}`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    res.json({ answer });
  } catch (err) {
    next(err);
  }
});

export default router;

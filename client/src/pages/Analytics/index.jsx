import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import EmotionPieChart from '@/components/charts/EmotionPieChart';
import EmotionTimeline from '@/components/charts/EmotionTimeline';
import EmotionHeatmap from '@/components/charts/EmotionHeatmap';
import SpeakerEffectiveness from '@/components/charts/SpeakerEffectiveness';
import TranscriptWithSentiment from '@/components/charts/TranscriptWithSentiment';
import AISummary from '@/components/ai/AISummary';
import SentimentChat from '@/components/ai/SentimentChat';
import { getMeetingAnalytics } from '@/services/api';
import { formatDuration } from '@/utils/formatters';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function Section({ title, icon, delay = 0, glow, children }) {
  return (
    <motion.div {...fadeUp} transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      <Card glow={glow} className="p-6">
        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <span className="text-brand-gold">{icon}</span>
          {title}
        </h3>
        {children}
      </Card>
    </motion.div>
  );
}

export default function Analytics() {
  const { code } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMeetingAnalytics(code)
      .then(setMeeting)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-dark">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 space-y-6">
          <div className="h-10 w-72 bg-white/[0.03] rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-surface-dark">
        <Navbar />
        <div className="pt-24 flex flex-col items-center gap-4">
          <p className="text-red-400">{error || 'Meeting not found'}</p>
          <Link to="/" className="text-brand-gold hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dark">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 space-y-6">
        {/* Header */}
        <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="flex items-end justify-between mb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center text-surface-dark font-black text-xs shadow-gold">OZ</div>
              <h1 className="text-3xl font-bold text-white">{meeting.title || 'Meeting Analytics'}</h1>
            </div>
            <p className="text-white/35 text-sm">
              {meeting.participants?.length || 0} participants
              {meeting.startTime && meeting.endTime && ` · ${formatDuration(meeting.startTime, meeting.endTime)}`}
              {' · '}{meeting.emotionSnapshots?.length || 0} emotion snapshots
            </p>
          </div>
          <div className="glass px-3 py-1.5 rounded-lg">
            <span className="text-white/30 font-mono text-xs">{code}</span>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Emotion Distribution" icon="/" delay={0.1}>
            <EmotionPieChart emotionData={meeting.emotionSnapshots} />
          </Section>
          <Section title="Emotion Timeline" icon="/" delay={0.2}>
            <EmotionTimeline emotionData={meeting.emotionSnapshots} />
          </Section>
        </div>

        <Section title="Emotion Heatmap" icon="/" delay={0.3}>
          <EmotionHeatmap emotionData={meeting.emotionSnapshots} />
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Speaker Effectiveness" icon="/" delay={0.4}>
            <SpeakerEffectiveness emotionData={meeting.emotionSnapshots} transcript={meeting.transcript} />
          </Section>
          <Section title="Transcript" icon="/" delay={0.5}>
            <TranscriptWithSentiment transcript={meeting.transcript} emotionData={meeting.emotionSnapshots} />
          </Section>
        </div>

        {/* AI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="AI Summary" icon="/" delay={0.6} glow>
            <AISummary code={code} existingSummary={meeting.aiSummary} />
          </Section>
          <Section title="Sentiment Q&A" icon="/" delay={0.7} glow>
            <SentimentChat code={code} />
          </Section>
        </div>
      </div>
    </div>
  );
}

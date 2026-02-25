import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { POSITIVE_EMOTIONS, NEGATIVE_EMOTIONS } from '@/utils/emotionMaps';

export default function SpeakerEffectiveness({ emotionData, transcript }) {
  const data = useMemo(() => {
    if (!emotionData || emotionData.length === 0) return [];

    const participants = {};
    emotionData.forEach(s => {
      const name = s.participantName || s.participantId;
      if (!participants[name]) {
        participants[name] = { name, positive: 0, negative: 0, neutral: 0, total: 0 };
      }
      participants[name].total++;
      if (POSITIVE_EMOTIONS.includes(s.emotion)) participants[name].positive++;
      else if (NEGATIVE_EMOTIONS.includes(s.emotion)) participants[name].negative++;
      else participants[name].neutral++;
    });

    // Add speaking time from transcript
    if (transcript) {
      transcript.forEach(seg => {
        const name = seg.participantName || seg.participantId;
        if (participants[name]) {
          participants[name].speakingSegments = (participants[name].speakingSegments || 0) + 1;
        }
      });
    }

    return Object.values(participants).map(p => ({
      ...p,
      positiveRate: Math.round((p.positive / p.total) * 100),
      negativeRate: Math.round((p.negative / p.total) * 100),
    }));
  }, [emotionData, transcript]);

  if (data.length === 0) {
    return <p className="text-white/40 text-sm text-center py-8">No participant data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" domain={[0, 100]} stroke="#ffffff40" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" stroke="#ffffff40" tick={{ fontSize: 11 }} width={80} />
        <Tooltip
          contentStyle={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value) => `${value}%`}
        />
        <Legend formatter={(value) => <span className="text-white/70 text-xs">{value}</span>} />
        <Bar dataKey="positiveRate" name="Positive" fill="#6AAB70" radius={[0, 4, 4, 0]} />
        <Bar dataKey="negativeRate" name="Negative" fill="#F26262" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { POSITIVE_EMOTIONS } from '@/utils/emotionMaps';

export default function TrendChart({ meetings }) {
  const data = useMemo(() => {
    if (!meetings || meetings.length === 0) return [];

    return meetings
      .filter(m => m.emotionSnapshots && m.emotionSnapshots.length > 0)
      .map(m => {
        const positive = m.emotionSnapshots.filter(s => POSITIVE_EMOTIONS.includes(s.emotion)).length;
        const total = m.emotionSnapshots.length;
        return {
          date: new Date(m.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sentiment: Math.round((positive / total) * 100),
          title: m.title,
        };
      })
      .reverse();
  }, [meetings]);

  if (data.length === 0) {
    return <p className="text-white/40 text-sm text-center py-8">Not enough data for trends</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ccb66c" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ccb66c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" stroke="#ffffff40" tick={{ fontSize: 11 }} />
        <YAxis stroke="#ffffff40" tick={{ fontSize: 11 }} domain={[0, 100]} />
        <Tooltip
          contentStyle={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value) => [`${value}%`, 'Positive Sentiment']}
        />
        <Area
          type="monotone"
          dataKey="sentiment"
          stroke="#ccb66c"
          fill="url(#sentimentGrad)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EMOTIONS, EMOTION_COLOR } from '@/utils/emotionMaps';

export default function EmotionTimeline({ emotionData }) {
  const chartData = useMemo(() => {
    if (!emotionData || emotionData.length === 0) return [];

    const sorted = [...emotionData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const start = new Date(sorted[0].timestamp).getTime();
    const end = new Date(sorted[sorted.length - 1].timestamp).getTime();
    const bucketSize = 10000; // 10-second buckets
    const buckets = [];

    for (let t = start; t <= end; t += bucketSize) {
      const bucketItems = sorted.filter(s => {
        const ts = new Date(s.timestamp).getTime();
        return ts >= t && ts < t + bucketSize;
      });

      const entry = { time: new Date(t).toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' }) };
      EMOTIONS.forEach(e => {
        entry[e] = bucketItems.filter(s => s.emotion === e).length;
      });
      buckets.push(entry);
    }

    return buckets;
  }, [emotionData]);

  if (chartData.length === 0) {
    return <p className="text-white/40 text-sm text-center py-8">No emotion data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="time" stroke="#ffffff40" tick={{ fontSize: 11 }} />
        <YAxis stroke="#ffffff40" tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend formatter={(value) => <span className="text-white/70 text-xs capitalize">{value}</span>} />
        {EMOTIONS.map(emotion => (
          <Line
            key={emotion}
            type="monotone"
            dataKey={emotion}
            stroke={EMOTION_COLOR[emotion]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

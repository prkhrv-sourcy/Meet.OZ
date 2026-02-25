import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EMOTION_COLOR, EMOTION_EMOJI } from '@/utils/emotionMaps';

export default function EmotionPieChart({ emotionData }) {
  if (!emotionData || emotionData.length === 0) {
    return <p className="text-white/40 text-sm text-center py-8">No emotion data</p>;
  }

  const counts = {};
  emotionData.forEach(s => {
    counts[s.emotion] = (counts[s.emotion] || 0) + 1;
  });

  const data = Object.entries(counts)
    .map(([emotion, count]) => ({
      name: emotion,
      value: count,
      percentage: Math.round((count / emotionData.length) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          paddingAngle={2}
          label={({ name, percentage }) => `${EMOTION_EMOJI[name]} ${percentage}%`}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={EMOTION_COLOR[entry.name]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value, name) => [`${value} detections`, `${EMOTION_EMOJI[name]} ${name}`]}
        />
        <Legend
          formatter={(value) => <span className="text-white/70 text-sm capitalize">{EMOTION_EMOJI[value]} {value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

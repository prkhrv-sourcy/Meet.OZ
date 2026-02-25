import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { POSITIVE_EMOTIONS, NEUTRAL_EMOTIONS, NEGATIVE_EMOTIONS } from '@/utils/emotionMaps';

export default function EngagementMeter({ emotionData, expanded = false }) {
  const { score, label } = useMemo(() => {
    if (!emotionData || emotionData.length === 0) return { score: 0, label: 'No data' };
    const recent = emotionData.slice(-30);

    let total = 0;
    recent.forEach(s => {
      if (POSITIVE_EMOTIONS.includes(s.emotion)) total += 100;
      else if (NEUTRAL_EMOTIONS.includes(s.emotion)) total += 60;
      else if (NEGATIVE_EMOTIONS.includes(s.emotion)) total += 20;
    });
    const avg = Math.round(total / recent.length);

    let label = 'Low';
    if (avg >= 80) label = 'Excellent';
    else if (avg >= 60) label = 'Good';
    else if (avg >= 40) label = 'Moderate';

    return { score: avg, label };
  }, [emotionData]);

  const color = score >= 70 ? '#6AAB70' : score >= 40 ? '#FBBD4B' : '#F26262';

  if (!expanded) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
        <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color }}>{score}</span>
      </div>
    );
  }

  // Expanded gauge for analytics
  const circumference = 2 * Math.PI * 40;
  const strokeDash = (score / 100) * circumference * 0.75; // 270 degrees

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-[135deg]">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff10" strokeWidth="8"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round" />
          <motion.circle
            cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${strokeDash} ${circumference}` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <span className="text-white/40 text-xs">{label}</span>
        </div>
      </div>
    </div>
  );
}

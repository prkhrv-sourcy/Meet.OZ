import { useMemo } from 'react';
import { EMOTION_COLOR } from '@/utils/emotionMaps';

export default function EmotionHeatmap({ emotionData }) {
  const cells = useMemo(() => {
    if (!emotionData || emotionData.length === 0) return [];

    const sorted = [...emotionData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const start = new Date(sorted[0].timestamp).getTime();
    const end = new Date(sorted[sorted.length - 1].timestamp).getTime();
    const windowSize = 5000; // 5-second windows
    const result = [];

    for (let t = start; t <= end; t += windowSize) {
      const windowItems = sorted.filter(s => {
        const ts = new Date(s.timestamp).getTime();
        return ts >= t && ts < t + windowSize;
      });

      if (windowItems.length === 0) {
        result.push({ time: t, emotion: 'neutral' });
        continue;
      }

      const counts = {};
      windowItems.forEach(s => {
        counts[s.emotion] = (counts[s.emotion] || 0) + 1;
      });

      const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      result.push({ time: t, emotion: dominant });
    }

    return result;
  }, [emotionData]);

  if (cells.length === 0) {
    return <p className="text-white/40 text-sm text-center py-8">No emotion data</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5 min-w-max py-2">
        {cells.map((cell, i) => (
          <div
            key={i}
            className="w-4 h-10 rounded-sm transition-colors"
            style={{ backgroundColor: EMOTION_COLOR[cell.emotion] || '#666' }}
            title={`${new Date(cell.time).toLocaleTimeString()}: ${cell.emotion}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-white/30 text-xs mt-1">
        <span>{cells.length > 0 ? new Date(cells[0].time).toLocaleTimeString() : ''}</span>
        <span>{cells.length > 0 ? new Date(cells[cells.length - 1].time).toLocaleTimeString() : ''}</span>
      </div>
    </div>
  );
}

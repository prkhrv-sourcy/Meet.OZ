import { EMOTION_COLOR } from '@/utils/emotionMaps';

export default function TranscriptWithSentiment({ transcript, emotionData }) {
  if (!transcript || transcript.length === 0) {
    return <p className="text-white/40 text-sm text-center py-8">No transcript data</p>;
  }

  // Match each transcript segment to nearest emotion snapshot
  const getEmotionForSegment = (seg) => {
    if (!emotionData || emotionData.length === 0) return null;
    const segTime = new Date(seg.timestamp).getTime();
    let closest = emotionData[0];
    let minDiff = Math.abs(new Date(closest.timestamp).getTime() - segTime);

    for (const snap of emotionData) {
      const diff = Math.abs(new Date(snap.timestamp).getTime() - segTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = snap;
      }
    }
    return minDiff < 10000 ? closest.emotion : null;
  };

  return (
    <div className="max-h-80 overflow-y-auto space-y-1 pr-2">
      {transcript.map((seg, i) => {
        const emotion = getEmotionForSegment(seg);
        const borderColor = emotion ? EMOTION_COLOR[emotion] : '#ffffff20';

        return (
          <div
            key={i}
            className="flex gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ borderLeft: `3px solid ${borderColor}` }}
          >
            <span className="text-white/30 text-xs whitespace-nowrap pt-0.5">
              {new Date(seg.timestamp).toLocaleTimeString('en-US', { minute: '2-digit', second: '2-digit' })}
            </span>
            <div>
              <span className="text-brand-gold text-sm font-medium">{seg.participantName}</span>
              <p className="text-white/70 text-sm">{seg.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

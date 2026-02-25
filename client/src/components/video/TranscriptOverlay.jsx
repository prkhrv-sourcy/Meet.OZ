import { motion, AnimatePresence } from 'framer-motion';

export default function TranscriptOverlay({ transcript, interimText, visible }) {
  if (!visible) return null;

  const recentLines = transcript.slice(-3);

  return (
    <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center gap-1 px-6 pointer-events-none">
      <AnimatePresence>
        {recentLines.map((seg, i) => (
          <motion.div
            key={`${seg.timestamp}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-black/70 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg max-w-2xl text-center"
          >
            <span className="text-brand-gold font-medium">{seg.participantName}: </span>
            {seg.text}
          </motion.div>
        ))}
      </AnimatePresence>
      {interimText && (
        <div className="bg-black/50 backdrop-blur-sm text-white/60 text-sm px-4 py-2 rounded-lg max-w-2xl text-center italic">
          {interimText}
        </div>
      )}
    </div>
  );
}

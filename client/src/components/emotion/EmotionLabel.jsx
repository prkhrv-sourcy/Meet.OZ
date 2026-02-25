import { motion, AnimatePresence } from 'framer-motion';
import { EMOTION_EMOJI, EMOTION_COLOR } from '@/utils/emotionMaps';

export default function EmotionLabel({ emotion }) {
  if (!emotion) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={emotion}
        initial={{ opacity: 0, scale: 0.8, y: 5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -5 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-xl border"
        style={{
          backgroundColor: `${EMOTION_COLOR[emotion]}18`,
          borderColor: `${EMOTION_COLOR[emotion]}25`,
          color: EMOTION_COLOR[emotion],
          boxShadow: `0 0 15px ${EMOTION_COLOR[emotion]}15`,
        }}
      >
        <span className="text-sm">{EMOTION_EMOJI[emotion]}</span>
        <span className="capitalize">{emotion}</span>
      </motion.div>
    </AnimatePresence>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeeting } from '@/contexts/MeetingContext';
import { getCoachingTip } from '@/services/api';

const POLL_INTERVAL = 20000;

export default function CoachPanel() {
  const { state } = useMeeting();
  const [tips, setTips] = useState([]);
  const [minimized, setMinimized] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!state.code) return;

    const fetchTip = async () => {
      try {
        const recent = state.emotionData.slice(-10);
        const recentTranscript = state.transcript.slice(-5);
        if (recent.length === 0 && recentTranscript.length === 0) return;

        const { tip } = await getCoachingTip(state.code, recent, recentTranscript);
        if (tip) {
          setTips(prev => [...prev.slice(-4), { text: tip, time: new Date() }]);
        }
      } catch {}
    };

    intervalRef.current = setInterval(fetchTip, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [state.code, state.emotionData, state.transcript]);

  if (tips.length === 0 && minimized) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-16 right-4 z-40 w-72"
    >
      <div className="glass rounded-2xl overflow-hidden gradient-border shadow-card">
        <button
          onClick={() => setMinimized(!minimized)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-gold-gradient flex items-center justify-center text-surface-dark text-[8px] font-black">AI</span>
            <span className="text-white/80">Coach</span>
          </span>
          <motion.span
            animate={{ rotate: minimized ? 0 : 180 }}
            className="text-white/30 text-xs"
          >
            ▲
          </motion.span>
        </button>
        <AnimatePresence>
          {!minimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2 max-h-60 overflow-y-auto">
                {tips.length === 0 ? (
                  <p className="text-white/20 text-xs py-2">Tips will appear as the meeting progresses...</p>
                ) : (
                  tips.map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 }}
                      className="bg-brand-gold/[0.08] border border-brand-gold/[0.12] rounded-xl px-3 py-2.5 text-xs text-white/70 leading-relaxed"
                    >
                      {tip.text}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

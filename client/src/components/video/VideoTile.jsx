import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function VideoTile({ track, isLocal, name, children }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!track || !videoRef.current) return;
    track.play(videoRef.current);
    return () => {
      track.stop();
    };
  }, [track]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl bg-surface-card border border-white/[0.06] shadow-card min-h-0 h-full"
    >
      {/* Video container — fills the tile, forces Agora's inner elements to stretch */}
      <div
        ref={videoRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Force Agora SDK's inner div+video to fill */}
      <style>{`
        .agora_video_player { width: 100% !important; height: 100% !important; }
        .agora_video_player video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
      `}</style>

      {/* Camera-off avatar */}
      {!track && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-card to-surface-dark">
          <div className="w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center text-3xl font-bold text-surface-dark shadow-gold animate-float">
            {(name || '?')[0].toUpperCase()}
          </div>
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Name label */}
      <div className="absolute bottom-3 left-3 z-10">
        <span className="bg-black/50 backdrop-blur-xl px-3 py-1 rounded-lg text-xs font-medium text-white/90">
          {isLocal ? 'You' : name || 'Guest'}
        </span>
      </div>

      {/* Emotion label slot */}
      <div className="z-10">{children}</div>
    </motion.div>
  );
}

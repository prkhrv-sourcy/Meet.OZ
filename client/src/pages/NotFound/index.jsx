import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-dark flex flex-col items-center justify-center gap-6 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-8xl font-black text-gradient"
      >
        404
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/30 text-lg"
      >
        This page doesn't exist
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-surface-dark font-semibold shadow-gold hover:shadow-gold-lg transition-shadow text-sm">
          Go Home
        </Link>
      </motion.div>
    </div>
  );
}

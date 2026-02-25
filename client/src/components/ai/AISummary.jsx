import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { generateSummary } from '@/services/api';

export default function AISummary({ code, existingSummary }) {
  const [summary, setSummary] = useState(existingSummary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const { summary: data } = await generateSummary(code);
      if (data) setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!summary) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gold-gradient mx-auto flex items-center justify-center text-surface-dark font-black shadow-gold-lg">
          AI
        </div>
        <p className="text-white/30 text-sm">Generate an AI-powered analysis of this meeting</p>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Analyzing...
            </span>
          ) : 'Generate Summary'}
        </Button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {summary.overallSentiment && (
        <div className="flex items-center gap-3 glass rounded-xl px-4 py-3">
          <span className="text-white/35 text-xs uppercase tracking-wider">Overall</span>
          <span className="text-white font-semibold capitalize text-sm">{summary.overallSentiment}</span>
        </div>
      )}

      {summary.presenterScore > 0 && (
        <div className="glass rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/35 text-xs uppercase tracking-wider">Presenter Score</span>
            <span className="text-brand-gold font-bold text-lg">{summary.presenterScore}<span className="text-xs text-white/30">/100</span></span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${summary.presenterScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gold-gradient"
            />
          </div>
        </div>
      )}

      {summary.emotionalArc && (
        <div>
          <h4 className="text-xs font-medium text-white/35 uppercase tracking-wider mb-2">Emotional Arc</h4>
          <p className="text-white/60 text-sm leading-relaxed">{summary.emotionalArc}</p>
        </div>
      )}

      {summary.keyMoments?.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-white/35 uppercase tracking-wider mb-2">Key Moments</h4>
          <ul className="space-y-1.5">
            {summary.keyMoments.map((m, i) => (
              <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                <span className="text-brand-gold mt-0.5 text-xs">&#9679;</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.actionItems?.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-white/35 uppercase tracking-wider mb-2">Action Items</h4>
          <ul className="space-y-1.5">
            {summary.actionItems.map((item, i) => (
              <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                <span className="text-brand-gold mt-0.5 text-xs">&#9679;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.presenterTips?.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-white/35 uppercase tracking-wider mb-2">Presenter Tips</h4>
          <ul className="space-y-1.5">
            {summary.presenterTips.map((tip, i) => (
              <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                <span className="text-brand-gold mt-0.5 text-xs">&#9679;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

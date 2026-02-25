import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TrendChart from '@/components/charts/TrendChart';
import { getMeetingHistory } from '@/services/api';
import { formatDate, formatDuration } from '@/utils/formatters';
import { POSITIVE_EMOTIONS } from '@/utils/emotionMaps';

export default function History() {
  const [meetings, setMeetings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMeetingHistory(page)
      .then(data => {
        setMeetings(data.meetings);
        setTotalPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const getSentiment = (meeting) => {
    if (!meeting.emotionSnapshots || meeting.emotionSnapshots.length === 0) return null;
    const positive = meeting.emotionSnapshots.filter(s => POSITIVE_EMOTIONS.includes(s.emotion)).length;
    const ratio = positive / meeting.emotionSnapshots.length;
    if (ratio >= 0.6) return { label: 'Positive', color: '#6AAB70' };
    if (ratio >= 0.3) return { label: 'Mixed', color: '#FBBD4B' };
    return { label: 'Negative', color: '#F26262' };
  };

  return (
    <div className="min-h-screen bg-surface-dark">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-gold/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-12 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white">Meeting History</h1>
          <p className="text-white/35 text-sm mt-1">Browse past meetings and track sentiment trends</p>
        </motion.div>

        {meetings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-brand-gold">/</span> Sentiment Trends
              </h3>
              <TrendChart meetings={meetings} />
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 space-y-4"
          >
            <div className="text-5xl mb-4 opacity-30">📭</div>
            <p className="text-white/40 text-lg">No meetings yet</p>
            <Link to="/">
              <Button>Start your first meeting</Button>
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetings.map((meeting, i) => {
                const sentiment = getSentiment(meeting);
                return (
                  <motion.div
                    key={meeting.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                  >
                    <Link to={`/analytics/${meeting.code}`}>
                      <Card className="p-5 glass-hover cursor-pointer h-full group">
                        <div className="flex items-start justify-between">
                          <h3 className="text-white font-medium truncate group-hover:text-brand-gold transition-colors">
                            {meeting.title || 'Untitled'}
                          </h3>
                          {sentiment && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2"
                              style={{ backgroundColor: `${sentiment.color}20`, color: sentiment.color }}
                            >
                              {sentiment.label}
                            </span>
                          )}
                        </div>
                        <p className="text-white/30 text-sm mt-1.5">{formatDate(meeting.startTime)}</p>
                        <div className="flex items-center gap-3 mt-4 text-white/25 text-xs">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                            {meeting.participants?.length || 0}
                          </span>
                          {meeting.startTime && meeting.endTime && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {formatDuration(meeting.startTime, meeting.endTime)}
                            </span>
                          )}
                          {meeting.emotionSnapshots?.length > 0 && (
                            <span>{meeting.emotionSnapshots.length} emotions</span>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                  Previous
                </Button>
                <span className="text-white/30 text-sm">
                  {page} / {totalPages}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

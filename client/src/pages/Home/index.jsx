import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { createMeeting } from '@/services/api';

const features = [
  { icon: '🎭', title: 'Emotion Detection', desc: 'Real-time facial emotion recognition on every participant' },
  { icon: '🤖', title: 'AI Coach', desc: 'Live coaching tips powered by Gemini 2.0 Flash' },
  { icon: '📊', title: 'Smart Analytics', desc: 'Deep post-meeting insights with charts and summaries' },
];

export default function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState(sessionStorage.getItem('meetoz_name') || '');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return setError('Please enter your name');
    setLoading(true);
    setError('');
    try {
      const meeting = await createMeeting('Meeting', name.trim());
      sessionStorage.setItem('meetoz_name', name.trim());
      navigate(`/call/${meeting.code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (!name.trim()) return setError('Please enter your name');
    if (!joinCode.trim()) return setError('Please enter a meeting code');
    sessionStorage.setItem('meetoz_name', name.trim());
    navigate(`/call/${joinCode.trim()}`);
  };

  return (
    <div className="min-h-screen bg-surface-dark overflow-hidden">
      <Navbar />

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-gold/[0.04] rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-gold/[0.03] rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/[0.02] rounded-full blur-[150px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-6 py-24">
        <div className="max-w-lg w-full space-y-12">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-gradient shadow-gold-lg mb-2"
            >
              <span className="text-surface-dark font-black text-2xl">OZ</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl font-bold tracking-tight"
            >
              Meet<span className="text-gradient">.OZ</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/40 text-lg max-w-sm mx-auto"
            >
              AI-powered meeting intelligence with real-time emotion detection
            </motion.p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card glow className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Your Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={handleCreate} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Creating...
                    </span>
                  ) : 'Create Meeting'}
                </Button>

                <div className="flex items-center gap-4 text-white/20 text-xs">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  or join existing
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                <div className="flex gap-2">
                  <Input
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                    placeholder="abc-def-ghi"
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    className="font-mono"
                  />
                  <Button variant="secondary" onClick={handleJoin}>
                    Join
                  </Button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2"
                >
                  {error}
                </motion.p>
              )}
            </Card>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-3"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="glass rounded-xl p-4 text-center group hover:bg-white/[0.06] transition-all duration-300 cursor-default"
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-xs font-medium text-white/70">{f.title}</div>
                <div className="text-[10px] text-white/30 mt-1 leading-snug">{f.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

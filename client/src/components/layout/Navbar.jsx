import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isCall = location.pathname.startsWith('/call');

  if (isCall) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-dark/60 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center text-surface-dark font-black text-sm shadow-gold group-hover:shadow-gold-lg transition-shadow">
            OZ
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Meet<span className="text-brand-gold">.OZ</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/history"
            className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              location.pathname === '/history'
                ? 'text-brand-gold bg-brand-gold/10'
                : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            History
          </Link>
        </div>
      </div>
    </nav>
  );
}

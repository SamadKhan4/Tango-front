import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useGame } from '../../hooks/useGame.js';
import ConnectionStatus from '../common/ConnectionStatus.jsx';

export default function AppShell({ children, backToHome = false }) {
  const navigate = useNavigate();
  const { connection, retryConnection, error, clearError, session } = useGame();
  const homeTarget = session?.roomCode ? `/room/${session.roomCode}` : '/';
  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <header className="border-b border-white/8 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link to={homeTarget} className="group flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white" aria-label="Bingo Club home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral text-ink shadow-[0_8px_20px_rgba(255,111,97,0.24)]"><Sparkles size={18} aria-hidden="true" /></span>
            Bingo Club
          </Link>
          <ConnectionStatus status={connection} compact onRetry={() => { void retryConnection().catch(() => {}); }} />
        </div>
      </header>
      {connection !== 'connected' && (
        <div className="border-b border-amber-300/20 bg-amber-300/10 px-4 py-2 text-center text-sm text-amber-100" role="status">
          {connection === 'reconnecting' ? 'Reconnecting to your room…' : 'Live updates are unavailable until the connection returns.'}
        </div>
      )}
      {error && (
        <div className="mx-auto mt-4 flex max-w-7xl items-start justify-between gap-4 rounded-xl border border-coral/35 bg-coral/10 px-4 py-3 text-sm text-coral-light" role="alert">
          <p><span className="font-semibold">{error.code.replaceAll('_', ' ')}.</span> {error.message}</p>
          <button type="button" onClick={clearError} className="shrink-0 rounded-md px-2 py-1 text-xs font-bold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Dismiss</button>
        </div>
      )}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">{children}</main>
      {backToHome && <button type="button" onClick={() => navigate('/')} className="sr-only"><ArrowLeft />Back home</button>}
    </div>
  );
}

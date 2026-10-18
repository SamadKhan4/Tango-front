import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CircleHelp, Gamepad2, LogIn, Plus, ShieldCheck, Users } from 'lucide-react';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/common/Button.jsx';
import { useGame } from '../hooks/useGame.js';
import { normalizeRoomCode, validateDisplayName, validateJoinForm } from '../utils/validation.js';

const fieldClass = 'mt-2 w-full rounded-xl border border-[#405577] bg-[#0c1930] px-3.5 py-3 text-[#fff8ea] outline-none transition placeholder:text-[#7185a5] focus:border-[#f0c979] focus:ring-2 focus:ring-[#f0c979]/25 disabled:cursor-not-allowed disabled:opacity-60';

function FieldError({ id, children }) {
  return children ? <p id={id} className="mt-1.5 text-sm text-[#ffb9b4]" role="alert">{children}</p> : null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { connection, createRoom, joinRoom, isActionPending, session } = useGame();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState(() => normalizeRoomCode(searchParams.get('room') || ''));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const sharedCode = normalizeRoomCode(searchParams.get('room') || '');
    if (sharedCode) setRoomCode(sharedCode);
  }, [searchParams]);

  if (session?.roomCode) return <Navigate to={`/room/${session.roomCode}`} replace />;

  const validateName = () => {
    const parsed = validateDisplayName(name);
    if (!parsed.success) {
      setErrors((previous) => ({ ...previous, name: parsed.error.issues[0]?.message }));
      return null;
    }
    setErrors((previous) => ({ ...previous, name: undefined }));
    return parsed.data;
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const validName = validateName();
    if (!validName) return;
    try {
      const data = await createRoom(validName);
      navigate(`/room/${data.roomCode}`);
    } catch {
      // The shared context surfaces server errors and connection failures.
    }
  };

  const handleJoin = async (event) => {
    event.preventDefault();
    const parsed = validateJoinForm({ name, roomCode });
    if (!parsed.success) {
      const nextErrors = {};
      for (const issue of parsed.error.issues) nextErrors[issue.path[0]] = issue.message;
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    try {
      const data = await joinRoom(parsed.data.roomCode, parsed.data.name);
      navigate(`/room/${data.roomCode}`);
    } catch {
      // The shared context surfaces server errors and connection failures.
    }
  };

  const isConnecting = connection !== 'connected';
  const creating = isActionPending('create');
  const joining = isActionPending('join');

  return (
    <AppShell>
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
        <section className="py-3 sm:py-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#f0c979]/30 bg-[#3d3018]/60 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#ffe1a2]">
            <Gamepad2 className="size-3.5" aria-hidden="true" /> Live multiplayer
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-[-0.045em] text-[#fff8ea] sm:text-5xl lg:text-6xl">
            A good game is better together.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#b8c8e3] sm:text-lg">
            Create a private room, share the code, take turns calling numbers, and race to complete five verified lines. Every call and placement is checked live by the game server.
          </p>
          <ul className="mt-7 grid gap-3 text-sm text-[#dce7f7] sm:grid-cols-3">
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-[#8fddc8]" aria-hidden="true" /> Server-verified placements</li>
            <li className="flex items-center gap-2"><Users className="size-4 text-[#f0c979]" aria-hidden="true" /> Up to 12 players</li>
            <li className="flex items-center gap-2"><CircleHelp className="size-4 text-[#ff9b8f]" aria-hidden="true" /> Private 1–25 boards</li>
          </ul>
          <div className="mt-8 rounded-2xl border border-[#2d4264] bg-[#101f38]/80 p-4 text-sm leading-6 text-[#b8c8e3]">
            <p className="font-bold text-[#fff0d5]">How to play</p>
            <p className="mt-1">Join the room, wait for the host to begin, then take turns calling remaining numbers. Calls mark every private board automatically; the first players to complete five lines take placement.</p>
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-[#405577] bg-[#101f38] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] sm:p-7" aria-label="Start a Tango game">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f0c979]">Start playing</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#fff8ea]">Create or join a room</h2>
            <p className="mt-2 text-sm leading-6 text-[#a8bad7]">Use a name that your friends will recognize. Your game session stays private to this browser.</p>
          </div>

          <form className="mt-6" onSubmit={handleCreate} noValidate>
            <label htmlFor="display-name" className="text-sm font-bold text-[#dce7f7]">Display name</label>
            <input
              aria-describedby={errors.name ? 'display-name-error' : undefined}
              aria-invalid={Boolean(errors.name)}
              autoComplete="nickname"
              className={fieldClass}
              disabled={creating || joining}
              id="display-name"
              maxLength={24}
              name="name"
              onBlur={validateName}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Samad"
              value={name}
            />
            <FieldError id="display-name-error">{errors.name}</FieldError>
            <Button className="mt-4" disabled={isConnecting || joining} fullWidth icon={<Plus className="size-4" aria-hidden="true" />} loading={creating} size="lg" type="submit">
              Create room
            </Button>
            {isConnecting ? <p className="mt-2 text-center text-xs text-[#a8bad7]">Waiting for a connection before creating a room…</p> : null}
          </form>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#7185a5]" aria-hidden="true"><span className="h-px flex-1 bg-[#2d4264]" />or<span className="h-px flex-1 bg-[#2d4264]" /></div>

          <form onSubmit={handleJoin} noValidate>
            <label htmlFor="room-code" className="text-sm font-bold text-[#dce7f7]">Room code</label>
            <input
              aria-describedby={errors.roomCode ? 'room-code-error' : undefined}
              aria-invalid={Boolean(errors.roomCode)}
              autoCapitalize="characters"
              autoComplete="off"
              className={`${fieldClass} font-mono font-bold tracking-[0.18em] uppercase`}
              disabled={creating || joining}
              id="room-code"
              inputMode="text"
              maxLength={6}
              name="roomCode"
              onChange={(event) => setRoomCode(normalizeRoomCode(event.target.value))}
              placeholder="ABC234"
              value={roomCode}
            />
            <FieldError id="room-code-error">{errors.roomCode}</FieldError>
            <Button className="mt-4" disabled={isConnecting || creating} fullWidth icon={<LogIn className="size-4" aria-hidden="true" />} loading={joining} size="lg" type="submit" variant="secondary">
              Join room
            </Button>
          </form>
        </section>
      </div>
      <p className="mt-8 text-center text-xs text-[#7185a5]">Already in a room? Returning to its link restores your game session on this browser.</p>
      <Link className="sr-only" to="/room/ABC234"><ArrowRight />Open room</Link>
    </AppShell>
  );
}

import { useEffect } from 'react';
import { ArrowRight, DoorOpen, LoaderCircle, Play, UserRoundPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import Button from '../components/common/Button.jsx';
import CopyRoomCode from '../components/common/CopyRoomCode.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import PlayerList from '../components/lobby/PlayerList.jsx';
import { useGame } from '../hooks/useGame.js';
import { roomLink } from '../utils/formatters.js';

export default function LobbyPage({ restoring = false }) {
  const navigate = useNavigate();
  const { connection, feedback, isHost, isActionPending, leaveRoom, minimumPlayers, player, room, startGame } = useGame();
  const readyToStart = Boolean(room && room.playerCount >= minimumPlayers);

  useEffect(() => {
    if (room?.status === 'IN_PROGRESS') navigate(`/room/${room.code}`, { replace: true });
    if (room?.status === 'COMPLETED') navigate(`/room/${room.code}`, { replace: true });
  }, [navigate, room?.code, room?.status]);

  if (!room || restoring) {
    return (
      <AppShell>
        <EmptyState icon={LoaderCircle} title="Restoring your room" description="We are securely reconnecting your saved session. Your card is never recreated in the browser." />
      </AppShell>
    );
  }

  const start = async () => {
    try {
      await startGame();
      navigate(`/room/${room.code}`);
    } catch {
      // Context displays the server's response.
    }
  };

  const exit = async () => {
    await leaveRoom();
    navigate('/');
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 border-b border-[#2d4264] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f0c979]">Game lobby</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#fff8ea] sm:text-4xl">Invite your players.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#a8bad7]">The game begins when the host starts it. Everyone receives a private shuffled 1–25 board, then turns rotate around the room.</p>
          </div>
          <Button icon={<DoorOpen className="size-4" aria-hidden="true" />} onClick={exit} variant="ghost">Leave room</Button>
        </div>

        {feedback?.message ? <p className="mt-5 rounded-xl border border-[#2f8b79]/45 bg-[#153c3a] px-4 py-3 text-sm text-[#bdf5de]" role="status">{feedback.message}</p> : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-5">
            <CopyRoomCode roomCode={room.code} shareUrl={roomLink(room.code)} />
            <section className="rounded-[1.35rem] border border-[#405577] bg-[#101f38] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a8bad7]">Start conditions</p>
              <p className="mt-2 text-lg font-bold text-[#fff8ea]">{room.playerCount} of {minimumPlayers} required players</p>
              <p className="mt-2 text-sm leading-6 text-[#b8c8e3]">
                {readyToStart ? 'The room is ready. The host can begin whenever everyone is set.' : `Invite ${minimumPlayers - room.playerCount} more player${minimumPlayers - room.playerCount === 1 ? '' : 's'} to unlock the round.`}
              </p>
              {isHost ? (
                <Button className="mt-5" disabled={!readyToStart || connection !== 'connected'} fullWidth icon={<Play className="size-4" aria-hidden="true" />} loading={isActionPending('start')} onClick={start}>
                  Start game
                </Button>
              ) : (
                <p className="mt-5 rounded-xl border border-[#5276a6]/35 bg-[#172b4a] px-3 py-3 text-sm text-[#cfe3ff]">Waiting for {room.players.find((item) => item.id === room.hostId)?.name || 'the host'} to start the game.</p>
              )}
            </section>
          </div>
          <PlayerList currentPlayerId={player?.id} maxPlayers={room.maxPlayers} minPlayers={minimumPlayers} players={room.players} status={room.status} />
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#2d4264] bg-[#0c1930] px-4 py-3 text-sm text-[#a8bad7]">
          <UserRoundPlus className="size-4 shrink-0 text-[#f0c979]" aria-hidden="true" />
          Share the room link or code. Players join in real time, and no one can see another playerâ€™s card.
        </div>
        <button className="sr-only" type="button" onClick={() => navigate(`/room/${room.code}`)}><ArrowRight />Open game</button>
      </div>
    </AppShell>
  );
}


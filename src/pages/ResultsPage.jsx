import { DoorOpen, RotateCcw, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import PlacementBoard from '../components/bingo/PlacementBoard.jsx';
import Button from '../components/common/Button.jsx';
import CopyRoomCode from '../components/common/CopyRoomCode.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import PlayerList from '../components/lobby/PlayerList.jsx';
import { useGame } from '../hooks/useGame.js';
import { roomLink } from '../utils/formatters.js';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { connection, isActionPending, isHost, leaveRoom, minimumPlayers, placementLimit, player, restartGame, room, targetLines } = useGame();

  if (!room) {
    return <AppShell><EmptyState title="No completed game found" description="Return home to create or join a new room." actionLabel="Return home" onAction={() => navigate('/')} /></AppShell>;
  }

  const placements = Array.isArray(room.placements) ? room.placements : [];
  const winner = placements.find((placement) => placement.rank === 1);
  const restart = async () => {
    try {
      await restartGame();
      navigate('/room/' + room.code, { replace: true });
    } catch {
      // The context renders a server rejection if the room state changed.
    }
  };
  const exit = async () => {
    await leaveRoom();
    navigate('/');
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-[1.75rem] border border-[#f0c979]/35 bg-[#101f38] px-5 py-9 text-center shadow-[0_24px_70px_rgba(0,0,0,0.26)] sm:px-10 sm:py-12">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#3d3018] text-[#f0c979]"><Trophy className="size-8" aria-hidden="true" /></div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#f0c979]">Round complete</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#fff8ea] sm:text-5xl">Placements confirmed.</h1>
          {winner ? (
            <div className="mx-auto mt-5 max-w-xl">
              <p className="text-sm text-[#a8bad7]">1st place</p>
              <p className="mt-2 text-xl font-bold text-[#fff0d5] sm:text-2xl">{winner.name}</p>
            </div>
          ) : <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-[#a8bad7]">The round ended before a placement was confirmed.</p>}
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#b8c8e3]">The server awarded each placement when that player completed {targetLines} lines. Other players’ board layouts stay private.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {isHost ? <Button disabled={connection !== 'connected'} icon={<RotateCcw className="size-4" aria-hidden="true" />} loading={isActionPending('restart')} onClick={restart}>Return to lobby</Button> : null}
            <Button icon={<DoorOpen className="size-4" aria-hidden="true" />} onClick={exit} variant="secondary">Create a new room</Button>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <CopyRoomCode roomCode={room.code} shareUrl={roomLink(room.code)} />
          <PlacementBoard placementLimit={placementLimit} placements={placements} targetLines={targetLines} />
        </div>
        <div className="mt-6">
          <PlayerList
            currentPlayerId={player?.id}
            maxPlayers={room.maxPlayers}
            minPlayers={minimumPlayers}
            placements={placements}
            players={room.players}
            status={room.status}
          />
        </div>
      </div>
    </AppShell>
  );
}

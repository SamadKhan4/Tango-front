import { useEffect } from 'react';
import { DoorOpen, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import BingoCard from '../components/bingo/BingoCard.jsx';
import DrawHistory from '../components/bingo/DrawHistory.jsx';
import GameControls from '../components/bingo/GameControls.jsx';
import LineProgress from '../components/bingo/LineProgress.jsx';
import PlacementBoard from '../components/bingo/PlacementBoard.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import PlayerList from '../components/lobby/PlayerList.jsx';
import { useGame } from '../hooks/useGame.js';

export default function GamePage() {
  const navigate = useNavigate();
  const {
    calledNumbers,
    callNumber,
    cardState,
    connection,
    feedback,
    isActionPending,
    latestCall,
    leaveRoom,
    minimumPlayers,
    placementLimit,
    player,
    room,
    targetLines,
  } = useGame();

  useEffect(() => {
    if (room?.status === 'COMPLETED') navigate('/room/' + room.code, { replace: true });
  }, [navigate, room?.code, room?.status]);

  if (!room) {
    return <AppShell><EmptyState title="Finding your game" description="We need a confirmed room state before showing your private board." /></AppShell>;
  }

  const offline = connection !== 'connected';
  const cardReady = Boolean(cardState?.card);
  const currentTurnPlayer = room.players?.find((item) => item.id === room.currentTurnPlayerId);
  const currentTurnName = room.currentTurnPlayerName || currentTurnPlayer?.name || 'the next player';
  const isCurrentTurn = room.currentTurnPlayerId === player?.id;
  const onCall = async (number) => {
    try {
      await callNumber(number);
    } catch {
      // The context shows the server rejection without exposing any private board data.
    }
  };
  const exit = async () => {
    await leaveRoom();
    navigate('/');
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-4 border-b border-[#2d4264] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f0c979]">Room {room.code}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#fff8ea] sm:text-4xl">Call wisely. Finish five lines.</h1>
          <p className="mt-2 text-sm text-[#a8bad7]">Every player has a private shuffled 1–25 board. A valid call marks every matching board automatically.</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="rounded-2xl border border-[#ff9b8f]/45 bg-[#3b2028] px-4 py-3 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#ffb9b4]">Latest call</p>
            <p className="mt-1 font-mono text-2xl font-black text-[#fff0d5]" aria-live="polite">{latestCall || '—'}</p>
          </div>
          <button className="rounded-xl px-3 py-2 text-sm font-semibold text-[#b8c8e3] transition hover:bg-[#182944] hover:text-[#fff8ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff0d5]" onClick={exit} type="button"><DoorOpen className="mr-1.5 inline size-4" aria-hidden="true" />Leave</button>
        </div>
      </div>

      {feedback?.message ? <p className="mt-5 rounded-xl border border-[#2f8b79]/45 bg-[#153c3a] px-4 py-3 text-sm text-[#bdf5de]" role="status">{feedback.message}</p> : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <BingoCard
            calledNumbers={calledNumbers}
            card={cardState?.card}
            completedLines={cardState?.completedLines}
            lineCount={cardState?.lineCount}
            markedNumbers={cardState?.markedNumbers}
            targetLines={targetLines}
          />
          {!cardReady ? <p className="rounded-xl border border-[#5276a6]/40 bg-[#172b4a] px-4 py-3 text-sm text-[#cfe3ff]" role="status">Your private board is arriving from the server…</p> : null}
        </div>

        <aside className="space-y-5">
          <GameControls
            calledNumbers={calledNumbers}
            callPending={isActionPending('call')}
            currentTurnName={currentTurnName}
            disabled={offline}
            isCurrentTurn={isCurrentTurn}
            onCall={onCall}
            placementLimit={placementLimit}
            status={room.status}
            targetLines={targetLines}
          />
          <LineProgress
            completedLines={cardState?.completedLines}
            lineCount={cardState?.lineCount}
            targetLines={targetLines}
          />
          <DrawHistory calledNumbers={calledNumbers} />
        </aside>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_.75fr]">
        <PlayerList
          currentPlayerId={player?.id}
          currentTurnPlayerId={room.currentTurnPlayerId}
          maxPlayers={room.maxPlayers}
          minPlayers={minimumPlayers}
          placements={room.placements}
          players={room.players}
          status={room.status}
        />
        <PlacementBoard placementLimit={placementLimit} placements={room.placements} targetLines={targetLines} />
      </div>

      <section className="mt-5 rounded-[1.35rem] border border-[#405577] bg-[#101f38] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-2 text-[#fff8ea]"><ShieldCheck className="size-5 text-[#f0c979]" aria-hidden="true" /><h2 className="font-bold">Private boards, public calls</h2></div>
        <p className="mt-3 text-sm leading-6 text-[#a8bad7]">Everyone can see called numbers, turns, and placements. Only you receive your board layout and completed-line details.</p>
      </section>
    </AppShell>
  );
}

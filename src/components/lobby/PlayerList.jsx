import { Crown, Medal, Radio, UsersRound } from 'lucide-react';

function playerInitial(name) {
  return String(name || '?').trim().charAt(0).toUpperCase() || '?';
}

function rankLabel(rank) {
  return rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : String(rank);
}

/**
 * Public roster only. It never expects or renders another player's private board.
 */
export default function PlayerList({
  className = '',
  currentPlayerId,
  currentTurnPlayerId,
  maxPlayers = 12,
  minPlayers = 2,
  placements = [],
  players = [],
  status = 'WAITING'
}) {
  const list = Array.isArray(players) ? players : [];
  const placementByPlayer = new Map((Array.isArray(placements) ? placements : []).map((placement) => [placement.playerId, placement]));
  const missingPlayers = Math.max(0, minPlayers - list.length);
  const readyToStart = status === 'WAITING' && missingPlayers === 0;
  const capacityLabel = Number.isFinite(maxPlayers) ? String(list.length) + '/' + String(maxPlayers) : String(list.length);
  const activePlayer = list.find((item) => item.id === currentTurnPlayerId);

  return (
    <section
      aria-label="Players"
      className={[
        'rounded-[1.35rem] border border-[#405577] bg-[#101f38] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:p-5',
        className
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UsersRound aria-hidden="true" className="size-5 text-[#f0c979]" />
          <h2 className="font-bold text-[#fff8ea]">Players</h2>
        </div>
        <span className="rounded-full bg-[#182944] px-2.5 py-1 text-xs font-semibold text-[#b8c8e3]">{capacityLabel}</span>
      </div>

      <p
        className={[
          'mt-3 rounded-xl border px-3 py-2 text-sm',
          readyToStart ? 'border-[#2f8b79]/45 bg-[#153c3a] text-[#bdf5de]' : 'border-[#5276a6]/40 bg-[#172b4a] text-[#cfe3ff]'
        ].join(' ')}
      >
        {status === 'WAITING'
          ? readyToStart
            ? 'Ready to start when the host is ready.'
            : 'Waiting for ' + missingPlayers + ' more player' + (missingPlayers === 1 ? '' : 's') + ' to start.'
          : status === 'IN_PROGRESS'
            ? activePlayer
              ? activePlayer.name + "'s turn"
              : 'Game in progress'
            : 'Placements confirmed'}
      </p>

      <ul className="mt-4 space-y-2" aria-label={String(list.length) + ' player' + (list.length === 1 ? '' : 's') + ' in room'}>
        {list.map((player, index) => {
          const isCurrentPlayer = player.id === currentPlayerId;
          const isConnected = player.connected !== false;
          const placement = placementByPlayer.get(player.id);
          const isCurrentTurn = player.id === currentTurnPlayerId;

          return (
            <li
              className={[
                'flex items-center gap-3 rounded-xl border px-3 py-2.5',
                isCurrentTurn ? 'border-[#f0c979]/55 bg-[#1f2840]' : 'border-[#2d4264] bg-[#0c1930]'
              ].join(' ')}
              key={player.id || player.name + '-' + index}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#203654] text-sm font-black text-[#fff0d5]">
                {playerInitial(player.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold text-[#edf4ff]">{player.name || 'Unnamed player'}</span>
                  {isCurrentPlayer ? <span className="shrink-0 text-xs font-medium text-[#f0c979]">You</span> : null}
                  {isCurrentTurn ? <span className="shrink-0 rounded-full bg-[#3d3018] px-1.5 py-0.5 text-[0.65rem] font-bold text-[#ffe1a2]">Turn</span> : null}
                </div>
                <span className={['mt-0.5 flex items-center gap-1 text-xs', isConnected ? 'text-[#8fddc8]' : 'text-[#f5b3b5]'].join(' ')}>
                  <Radio aria-hidden="true" className="size-3" />
                  {isConnected ? 'Connected' : 'Reconnecting'}
                </span>
              </div>
              {placement ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#3d3018] px-2 py-1 text-xs font-bold text-[#ffe1a2]">
                  <Medal aria-hidden="true" className="size-3.5" />
                  {rankLabel(placement.rank)}
                </span>
              ) : null}
              {player.isHost ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#203654] px-2 py-1 text-xs font-bold text-[#dce7f7]">
                  <Crown aria-hidden="true" className="size-3.5" />
                  Host
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

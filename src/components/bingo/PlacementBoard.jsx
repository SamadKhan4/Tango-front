import { Medal, Trophy } from 'lucide-react';

const slots = [
  { rank: 1, label: '1st place', classes: 'border-[#f0c979]/55 bg-[#3d3018] text-[#ffe1a2]' },
  { rank: 2, label: '2nd place', classes: 'border-[#b8c8e3]/45 bg-[#182944] text-[#dce7f7]' },
  { rank: 3, label: '3rd place', classes: 'border-[#d8865e]/45 bg-[#3b2028] text-[#ffd0b8]' },
];

/**
 * Public finish order only. It never renders another player's board or line details.
 */
export default function PlacementBoard({
  className = '',
  placementLimit = 3,
  placements = [],
  targetLines = 5,
}) {
  const byRank = new Map((Array.isArray(placements) ? placements : []).map((placement) => [placement.rank, placement]));
  const visibleSlots = slots.slice(0, Math.min(slots.length, Math.max(1, Number(placementLimit) || 3)));

  return (
    <section
      aria-label="Placements"
      className={[
        'rounded-[1.35rem] border border-[#405577] bg-[#101f38] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:p-5',
        className
      ].join(' ')}
    >
      <div className="flex items-center gap-2 text-[#fff8ea]">
        <Trophy aria-hidden="true" className="size-5 text-[#f0c979]" />
        <h2 className="font-bold">Placements</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#a8bad7]">Up to the first {visibleSlots.length} players to complete {targetLines} lines.</p>

      <ol className="mt-4 space-y-2">
        {visibleSlots.map((slot) => {
          const placement = byRank.get(slot.rank);
          return (
            <li className={['flex items-center gap-3 rounded-xl border px-3 py-3', placement ? slot.classes : 'border-[#2d4264] bg-[#0c1930] text-[#91a5c4]'].join(' ')} key={slot.rank}>
              <Medal aria-hidden="true" className="size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.14em]">{slot.label}</p>
                <p className="mt-0.5 truncate text-sm font-semibold">{placement?.name || 'Open'}</p>
              </div>
              {placement ? <span className="shrink-0 text-xs font-bold">{placement.completedLines || targetLines} lines</span> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

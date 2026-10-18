import { Hand, LockKeyhole, Sparkles } from 'lucide-react';

function asNumberSet(values) {
  return new Set(Array.isArray(values) ? values.filter(Number.isInteger) : []);
}

/**
 * Only the player whose server-confirmed turn is active can call a remaining number.
 */
export default function GameControls({
  calledNumbers = [],
  callPending = false,
  className = '',
  currentTurnName = 'the next player',
  disabled = false,
  isCurrentTurn = false,
  onCall,
  placementLimit = 3,
  status = 'IN_PROGRESS',
  targetLines = 5,
}) {
  const called = asNumberSet(calledNumbers);
  const isInProgress = status === 'IN_PROGRESS';
  const canCall = isInProgress && isCurrentTurn && !disabled && !callPending && typeof onCall === 'function';

  return (
    <section
      aria-label="Turn controls"
      className={[
        'rounded-[1.35rem] border border-[#405577] bg-[#101f38] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:p-5',
        className
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <Hand aria-hidden="true" className="size-5 text-[#f0c979]" />
        <h2 className="font-bold text-[#fff8ea]">Take a turn</h2>
      </div>

      <p
        aria-live="polite"
        className={[
          'mt-3 rounded-xl border px-3 py-2.5 text-sm leading-5',
          isCurrentTurn && isInProgress
            ? 'border-[#2f8b79]/45 bg-[#153c3a] text-[#bdf5de]'
            : 'border-[#5276a6]/40 bg-[#172b4a] text-[#cfe3ff]'
        ].join(' ')}
      >
        {isInProgress
          ? isCurrentTurn
            ? 'Your turn — choose one remaining number.'
            : 'Waiting for ' + currentTurnName + ' to call a number.'
          : 'The round is complete.'}
      </p>

      <div aria-label="Remaining number picker" className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2">
        {Array.from({ length: 25 }, (_, index) => index + 1).map((number) => {
          const isCalled = called.has(number);
          return (
            <button
              aria-label={isCalled ? 'Number ' + number + ' already called' : 'Call number ' + number}
              className={[
                'aspect-square rounded-xl border text-sm font-black tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff0d5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101f38]',
                isCalled
                  ? 'cursor-not-allowed border-[#405577] bg-[#182944] text-[#7185a4] line-through'
                  : canCall
                    ? 'border-[#6680a8] bg-[#203654] text-[#fff0d5] hover:border-[#f0c979] hover:bg-[#294464]'
                    : 'cursor-not-allowed border-[#263c60] bg-[#0c1930] text-[#7185a4]'
              ].join(' ')}
              disabled={isCalled || !canCall}
              key={number}
              onClick={() => onCall?.(number)}
              type="button"
            >
              {number}
            </button>
          );
        })}
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#a8bad7]">
        {canCall ? <Sparkles aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#f0c979]" /> : <LockKeyhole aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#91a5c4]" />}
        <span>Each accepted call marks every matching private board. Up to the first {placementLimit} players to complete {targetLines} lines receive placement.</span>
      </p>
    </section>
  );
}

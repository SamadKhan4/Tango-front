import { History, Radio } from 'lucide-react';

/**
 * Public sequence of numbers that players have called. It never exposes a board.
 */
export default function DrawHistory({
  calledNumbers = [],
  className = '',
  maxVisible = 25,
}) {
  const calls = Array.isArray(calledNumbers) ? calledNumbers.filter(Number.isInteger) : [];
  const latest = calls.at(-1);
  const safeLimit = Number.isFinite(maxVisible) ? Math.max(1, maxVisible) : 25;
  const visibleCalls = calls.slice(-safeLimit).reverse();
  const hiddenCount = Math.max(0, calls.length - visibleCalls.length);

  return (
    <section
      aria-label="Called numbers"
      className={[
        'rounded-[1.35rem] border border-[#405577] bg-[#101f38] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:p-5',
        className
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#fff8ea]">
          <History aria-hidden="true" className="size-5 text-[#f0c979]" />
          <h2 className="font-bold">Called numbers</h2>
        </div>
        <span className="rounded-full bg-[#182944] px-2.5 py-1 text-xs font-semibold text-[#b8c8e3]">
          {calls.length}/25 called
        </span>
      </div>

      <div aria-live="polite" className="mt-4 rounded-2xl border border-[#4c6387] bg-[#172b4a] p-4 text-center">
        {latest ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a8bad7]">Latest call</p>
            <p className="mt-1 font-mono text-4xl font-black tracking-tight text-[#fff0d5] sm:text-5xl">{latest}</p>
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-[#b8c8e3]">
            <Radio aria-hidden="true" className="size-4 text-[#f0c979]" />
            Waiting for the first call
          </div>
        )}
      </div>

      {visibleCalls.length ? (
        <>
          <ol aria-label="Called numbers, newest first" className="mt-4 flex max-h-52 flex-wrap gap-2 overflow-y-auto pr-1">
            {visibleCalls.map((number, index) => (
              <li
                className={[
                  'flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-bold',
                  index === 0 ? 'border-[#ff9b8f] bg-[#ee6a5c] text-[#fff8ea]' : 'border-[#405577] bg-[#182944] text-[#dce7f7]'
                ].join(' ')}
                key={String(number) + '-' + String(calls.length - index)}
              >
                {number}
              </li>
            ))}
          </ol>
          {hiddenCount ? <p className="mt-3 text-xs text-[#91a5c4]">{hiddenCount} earlier call{hiddenCount === 1 ? '' : 's'} hidden</p> : null}
        </>
      ) : null}
    </section>
  );
}

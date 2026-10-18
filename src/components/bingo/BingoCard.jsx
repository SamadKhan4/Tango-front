import { Check, ShieldCheck } from 'lucide-react';

function asNumberSet(values) {
  return new Set(Array.isArray(values) ? values.filter(Number.isInteger) : []);
}

function completedCellSet(completedLines) {
  const cells = new Set();
  if (!Array.isArray(completedLines)) return cells;
  for (const line of completedLines) {
    if (!Array.isArray(line?.cells)) continue;
    for (const [row, column] of line.cells) cells.add(String(row) + '-' + String(column));
  }
  return cells;
}

function cellDescription(value, isCalled, completesLine) {
  if (!Number.isInteger(value)) return 'Waiting for your private board';
  if (isCalled && completesLine) return 'Number ' + value + ', called, in a completed line';
  if (isCalled) return 'Number ' + value + ', called and marked';
  return 'Number ' + value + ', not called';
}

/**
 * The card is private to the current player. Server-confirmed calls mark it automatically.
 */
export default function BingoCard({
  card,
  className = '',
  calledNumbers = [],
  completedLines = [],
  lineCount = 0,
  markedNumbers = [],
  targetLines = 5,
}) {
  const called = asNumberSet(calledNumbers);
  const marked = asNumberSet(markedNumbers);
  const completeCells = completedCellSet(completedLines);
  const hasCard = Array.isArray(card) && card.length === 5;

  return (
    <section
      aria-label="Your private board"
      className={[
        'overflow-hidden rounded-[1.35rem] border border-[#405577] bg-[#101f38] shadow-[0_18px_40px_rgba(0,0,0,0.22)]',
        className
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2d4264] px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a8bad7]">Your private board</p>
          <h2 className="mt-0.5 text-lg font-bold text-[#fff8ea]">Random 1–25 placement</h2>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#2f8b79]/45 bg-[#153c3a] px-3 py-2 text-[#bdf5de]">
          <ShieldCheck aria-hidden="true" className="size-4" />
          <span className="text-sm font-bold">Lines {lineCount}/{targetLines}</span>
        </div>
      </div>

      <div className="p-2.5 sm:p-4">
        <p className="mb-3 text-xs leading-5 text-[#a8bad7]">A server-confirmed call marks the matching number for you.</p>
        <div aria-label="Private board grid" className="grid grid-cols-5 gap-1.5 sm:gap-2" role="grid">
          {Array.from({ length: 5 }, (_, rowIndex) =>
            Array.from({ length: 5 }, (_, columnIndex) => {
              const value = hasCard ? card[rowIndex]?.[columnIndex] : null;
              const isCalled = Number.isInteger(value) && (called.has(value) || marked.has(value));
              const isInCompletedLine = completeCells.has(String(rowIndex) + '-' + String(columnIndex));

              return (
                <div
                  aria-label={cellDescription(value, isCalled, isInCompletedLine)}
                  aria-selected={isCalled || undefined}
                  className={[
                    'relative flex aspect-square min-h-11 items-center justify-center rounded-xl border text-base font-black tabular-nums sm:text-xl',
                    isCalled
                      ? 'border-[#ff9b8f] bg-[#ee6a5c] text-[#fff8ea] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]'
                      : 'border-[#263c60] bg-[#0c1930] text-[#91a5c4]',
                    isInCompletedLine ? 'ring-2 ring-[#f0c979] ring-offset-2 ring-offset-[#101f38]' : '',
                    !hasCard ? 'animate-pulse' : ''
                  ].join(' ')}
                  key={String(rowIndex) + '-' + String(columnIndex)}
                  role="gridcell"
                >
                  {value ?? '–'}
                  {isCalled ? <Check aria-hidden="true" className="absolute right-1 top-1 size-3 text-[#fff0d5] sm:size-3.5" /> : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

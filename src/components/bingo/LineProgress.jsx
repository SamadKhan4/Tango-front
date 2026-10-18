import { Goal, Sparkles } from 'lucide-react';

function lineLabel(line) {
  const id = line?.id;
  if (typeof id !== 'string') return 'Completed line';
  if (id.startsWith('row-')) return 'Row ' + (Number(id.slice(4)) + 1);
  if (id.startsWith('column-')) return 'Column ' + (Number(id.slice(7)) + 1);
  if (id === 'diagonal-main') return 'Main diagonal';
  if (id === 'diagonal-anti') return 'Reverse diagonal';
  return 'Completed line';
}

/**
 * Private progress derived only from the current player's card state.
 */
export default function LineProgress({
  completedLines = [],
  lineCount = 0,
  targetLines = 5,
}) {
  const count = Math.min(Math.max(0, Number(lineCount) || 0), targetLines);
  const progress = targetLines ? Math.round((count / targetLines) * 100) : 0;
  const labels = Array.isArray(completedLines) ? completedLines.map(lineLabel) : [];

  return (
    <section aria-label="Your line progress" className="rounded-[1.35rem] border border-[#405577] bg-[#101f38] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#fff8ea]">
          <Goal aria-hidden="true" className="size-5 text-[#f0c979]" />
          <h2 className="font-bold">Your lines</h2>
        </div>
        <span className="rounded-full bg-[#3d3018] px-2.5 py-1 text-xs font-bold text-[#ffe1a2]">{count}/{targetLines}</span>
      </div>

      <div aria-label={String(count) + ' of ' + String(targetLines) + ' lines complete'} aria-valuemax={targetLines} aria-valuemin="0" aria-valuenow={count} className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#0c1930]" role="progressbar">
        <div className="h-full rounded-full bg-[#f0c979] transition-[width] duration-300" style={{ width: String(progress) + '%' }} />
      </div>
      <p className="mt-3 text-sm leading-6 text-[#b8c8e3]">
        {count >= targetLines ? 'All required lines complete. Your placement is being confirmed.' : String(targetLines - count) + ' more line' + (targetLines - count === 1 ? '' : 's') + ' to earn a placement.'}
      </p>
      {labels.length ? (
        <ul aria-label="Your completed lines" className="mt-3 flex flex-wrap gap-2">
          {labels.map((label, index) => <li className="inline-flex items-center gap-1 rounded-full border border-[#2f8b79]/45 bg-[#153c3a] px-2.5 py-1 text-xs font-semibold text-[#bdf5de]" key={label + '-' + index}><Sparkles aria-hidden="true" className="size-3" />{label}</li>)}
        </ul>
      ) : null}
    </section>
  );
}

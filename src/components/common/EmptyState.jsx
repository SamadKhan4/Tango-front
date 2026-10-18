import { CircleDashed } from 'lucide-react';

import Button from './Button';

/**
 * Reusable empty, waiting, and unavailable state.
 */
export default function EmptyState({
  actionIcon = null,
  actionLabel,
  children,
  className = '',
  description,
  icon: Icon = CircleDashed,
  onAction,
  title
}) {
  return (
    <section
      className={[
        'rounded-2xl border border-dashed border-[#405577] bg-[#101f38]/70 px-5 py-8 text-center',
        className
      ].join(' ')}
    >
      <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-[#182944] text-[#fff0d5]">
        <Icon aria-hidden="true" className="size-5" />
      </div>
      {title ? <h2 className="mt-4 text-lg font-bold text-[#fff8ea]">{title}</h2> : null}
      {description ? <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#a8bad7]">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
      {actionLabel && typeof onAction === 'function' ? (
        <Button className="mt-5" icon={actionIcon} onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}

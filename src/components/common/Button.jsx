import { LoaderCircle } from 'lucide-react';

const variantClasses = {
  primary:
    'bg-[#ee6a5c] text-[#fff8ea] shadow-[0_10px_24px_rgba(238,106,92,0.24)] hover:bg-[#fa7a6e] active:bg-[#d9574b]',
  secondary:
    'border border-[#405577] bg-[#182944] text-[#fff8ea] hover:border-[#6680a8] hover:bg-[#203654] active:bg-[#14233b]',
  ghost:
    'text-[#dce7f7] hover:bg-[#182944] hover:text-[#fff8ea] active:bg-[#203654]',
  cream:
    'bg-[#fff0d5] text-[#152541] hover:bg-[#fff8ea] active:bg-[#f5dfb7]',
  danger:
    'bg-[#b8464a] text-white hover:bg-[#ce5559] active:bg-[#96383d]'
};

const sizeClasses = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base'
};

/**
 * A consistently styled native button. All standard button props are forwarded.
 */
export default function Button({
  children,
  className = '',
  disabled = false,
  fullWidth = false,
  icon = null,
  loading = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...buttonProps
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...buttonProps}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff0d5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091426]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth ? 'w-full' : '',
        className
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      type={type}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : icon}
      <span>{children}</span>
    </button>
  );
}

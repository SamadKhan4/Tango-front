import { CheckCircle2, CircleAlert, LoaderCircle, Radio, WifiOff } from 'lucide-react';

const statusDetails = {
  connected: {
    label: 'Live',
    message: 'Connected to the room',
    Icon: CheckCircle2,
    classes: 'border-[#2f8b79]/40 bg-[#153c3a] text-[#bdf5de]'
  },
  connecting: {
    label: 'Connecting',
    message: 'Connecting to the game server',
    Icon: LoaderCircle,
    classes: 'border-[#5276a6]/40 bg-[#172b4a] text-[#cfe3ff]'
  },
  reconnecting: {
    label: 'Reconnecting',
    message: 'Restoring your room session',
    Icon: LoaderCircle,
    classes: 'border-[#ad8434]/45 bg-[#3d3018] text-[#ffe1a2]'
  },
  disconnected: {
    label: 'Offline',
    message: 'Connection lost. Trying again…',
    Icon: WifiOff,
    classes: 'border-[#b85a5e]/45 bg-[#3b2028] text-[#ffd0d0]'
  },
  error: {
    label: 'Connection issue',
    message: 'The game server is unavailable',
    Icon: CircleAlert,
    classes: 'border-[#b85a5e]/45 bg-[#3b2028] text-[#ffd0d0]'
  }
};

/**
 * Presents Socket.IO connection state. The parent owns reconnect behavior.
 */
export default function ConnectionStatus({
  compact = false,
  message,
  onRetry,
  status = 'connecting'
}) {
  const detail = statusDetails[status] || {
    label: 'Checking connection',
    message: 'Checking the game server',
    Icon: Radio,
    classes: 'border-[#5276a6]/40 bg-[#172b4a] text-[#cfe3ff]'
  };
  const { Icon } = detail;
  const canRetry = typeof onRetry === 'function' && ['disconnected', 'error'].includes(status);

  return (
    <div
      aria-live="polite"
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium',
        detail.classes,
        compact ? 'py-1.5 text-xs' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
    >
      <Icon
        aria-hidden="true"
        className={['size-4 shrink-0', ['connecting', 'reconnecting'].includes(status) ? 'animate-spin' : ''].join(' ')}
      />
      <span>{compact ? detail.label : message || detail.message}</span>
      {canRetry ? (
        <button
          className="ml-1 rounded-md px-1.5 py-0.5 font-semibold underline decoration-current/50 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

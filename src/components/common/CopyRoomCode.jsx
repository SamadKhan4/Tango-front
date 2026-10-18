import { Check, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';

import Button from './Button';

async function copyToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textArea);
  if (!copied) throw new Error('Copy is unavailable in this browser.');
}

/**
 * Room-code display with browser-native copy and share actions.
 */
export default function CopyRoomCode({
  className = '',
  onCopy,
  onShare,
  roomCode,
  shareUrl
}) {
  const [feedback, setFeedback] = useState('');
  const normalizedCode = String(roomCode || '').trim().toUpperCase();
  const shareText = shareUrl || normalizedCode;

  const handleCopy = async () => {
    if (!shareText) return;

    try {
      await copyToClipboard(shareText);
      setFeedback('Copied');
      onCopy?.(shareText);
    } catch {
      setFeedback('Could not copy');
    }
  };

  const handleShare = async () => {
    if (!shareText) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join my Bingo room',
          text: normalizedCode ? `Join my Bingo room: ${normalizedCode}` : 'Join my Bingo room',
          url: shareUrl || undefined
        });
        setFeedback('Share sheet opened');
      } else {
        await handleCopy();
      }
      onShare?.(shareText);
    } catch (error) {
      if (error?.name !== 'AbortError') setFeedback('Could not share');
    }
  };

  return (
    <section
      aria-label="Room code"
      className={[
        'rounded-2xl border border-[#405577] bg-[#101f38] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.15)]',
        className
      ].join(' ')}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a8bad7]">Room code</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <output className="mr-auto font-mono text-2xl font-black tracking-[0.2em] text-[#fff0d5] sm:text-3xl">
          {normalizedCode || '—'}
        </output>
        <Button
          aria-label="Copy room link"
          disabled={!shareText}
          icon={feedback === 'Copied' ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          onClick={handleCopy}
          size="sm"
          variant="secondary"
        >
          {feedback === 'Copied' ? 'Copied' : 'Copy'}
        </Button>
        <Button
          aria-label="Share room link"
          disabled={!shareText}
          icon={<Share2 aria-hidden="true" className="size-4" />}
          onClick={handleShare}
          size="sm"
          variant="ghost"
        >
          Share
        </Button>
      </div>
      {feedback ? <p aria-live="polite" className="mt-2 text-xs text-[#b8c8e3]">{feedback}</p> : null}
    </section>
  );
}

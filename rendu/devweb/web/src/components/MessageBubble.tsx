import type { ChatMessage } from '../types'

type MessageBubbleProps = {
  message: ChatMessage
  onCopy?: () => void
  onRegenerate?: () => void
  copied?: boolean
}

export function MessageBubble({ message, onCopy, onRegenerate, copied }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end animate-[dc-rise_0.35s_ease-out]">
        <div className="max-w-[80%] rounded-[12px_12px_4px_12px] bg-[var(--ink)] px-4 py-3 text-[15px] leading-[1.55] whitespace-pre-wrap break-words text-[var(--on-ink)]">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 animate-[dc-rise_0.35s_ease-out]">
      <div className="mt-0.5 flex size-8 flex-none items-center justify-center rounded-lg bg-[var(--accent-weak)] font-['Geist_Mono',monospace] text-base text-[var(--accent-text)]">
        ϕ
      </div>
      <div className="min-w-0 flex-1">
        <div className="whitespace-pre-wrap break-words text-[15px] leading-[1.65] text-[var(--text)]">
          {message.content}
          {message.pending ? (
            <span className="ml-0.5 inline-block h-[17px] w-2 align-[-3px] animate-[dc-blink_1s_step-end_infinite] bg-[var(--accent)]" />
          ) : null}
        </div>
        {message.pending ? null : (
          <div className="mt-3 flex items-center gap-1">
            <button
              type="button"
              onClick={onCopy}
              className="rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium text-[var(--text-2)] transition-colors hover:border-[var(--border)] hover:text-[var(--text)]"
            >
              {copied ? '✓ Copié' : '⧉ Copier'}
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              className="rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium text-[var(--text-2)] transition-colors hover:border-[var(--border)] hover:text-[var(--text)]"
            >
              ↻ Régénérer
            </button>
            <div className="flex-1" />
            <span className="font-['Geist_Mono',monospace] text-[11px] text-[var(--text-3)]">
              {message.timeSec != null ? `${message.timeSec.toFixed(1)} s` : ''}
              {message.tokPerSec ? ` · ${message.tokPerSec} tok/s` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage } from '../types'

const THINKING_PHRASES = [
  'Je réfléchis…',
  'Analyse en cours…',
  'Je consulte les données…',
  'Traitement de la requête…',
  'Formulation de la réponse…',
]

type MessageBubbleProps = {
  message: ChatMessage
  onCopy?: () => void
  onRegenerate?: () => void
  copied?: boolean
}

export function MessageBubble({ message, onCopy, onRegenerate, copied }: MessageBubbleProps) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const isThinking = message.pending && message.content === ''

  useEffect(() => {
    if (!isThinking) return
    const id = window.setInterval(() => {
      setPhraseIndex(i => (i + 1) % THINKING_PHRASES.length)
    }, 1800)
    return () => window.clearInterval(id)
  }, [isThinking])

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
          {isThinking ? (
            <span className="italic text-[var(--text-3)] animate-pulse">
              {THINKING_PHRASES[phraseIndex]}
            </span>
          ) : (
            <>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-[var(--text)]">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-[1.6]">{children}</li>,
                  h1: ({ children }) => <h1 className="mb-2 mt-4 text-[17px] font-semibold">{children}</h1>,
                  h2: ({ children }) => <h2 className="mb-2 mt-4 text-[15px] font-semibold">{children}</h2>,
                  h3: ({ children }) => <h3 className="mb-1 mt-3 text-[14px] font-semibold">{children}</h3>,
                  code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
                    inline ? (
                      <code className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 font-['Geist_Mono',monospace] text-[13px]">{children}</code>
                    ) : (
                      <pre className="mb-3 overflow-x-auto rounded-lg bg-[var(--surface-3)] p-3">
                        <code className="font-['Geist_Mono',monospace] text-[13px] leading-[1.6]">{children}</code>
                      </pre>
                    ),
                  table: ({ children }) => (
                    <div className="mb-3 overflow-x-auto">
                      <table className="w-full border-collapse text-[14px]">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => <th className="border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-left font-semibold">{children}</th>,
                  td: ({ children }) => <td className="border border-[var(--border)] px-3 py-2">{children}</td>,
                  blockquote: ({ children }) => <blockquote className="mb-3 border-l-2 border-[var(--accent)] pl-3 text-[var(--text-2)]">{children}</blockquote>,
                  hr: () => <hr className="my-4 border-[var(--border)]" />,
                }}
              >
                {message.content}
              </ReactMarkdown>
              {message.pending ? (
                <span className="ml-0.5 inline-block h-[17px] w-2 align-[-3px] animate-[dc-blink_1s_step-end_infinite] bg-[var(--accent)]" />
              ) : null}
            </>
          )}
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

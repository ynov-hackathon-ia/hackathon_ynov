import { useEffect, useRef } from 'react'

type ComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled: boolean
  temperature: number
  topP: number
  maxTokens: number
}

export function Composer({ value, onChange, onSend, disabled, temperature, topP, maxTokens }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`
  }, [value])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSend()
  }

  return (
    <div className="flex-none px-6 pb-5 pt-4">
      <div className="mx-auto max-w-[768px]">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 rounded-3xl border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-2 pl-4 shadow-[var(--shadow)]"
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={event => onChange(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                onSend()
              }
            }}
            placeholder="Posez une question financière…"
            rows={1}
            className="max-h-[180px] min-h-6 flex-1 resize-none border-none bg-transparent py-2 text-[15px] leading-[1.5] text-[var(--text)] outline-none placeholder:text-[var(--text-3)]"
          />
          <button
            type="submit"
            disabled={disabled}
            className={`flex size-9 flex-none items-center justify-center rounded-lg text-[17px] font-semibold transition-colors ${
              disabled ? 'cursor-default bg-[var(--surface-3)] text-[var(--text-3)]' : 'bg-[var(--accent)] text-[var(--on-ink)] hover:opacity-95'
            }`}
            title="Envoyer"
          >
            ↑
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-normal text-[var(--text-3)]">
          <span className="font-['Geist_Mono',monospace]">
            temp {temperature.toFixed(2)} · top_p {topP.toFixed(2)} · {maxTokens} tok
          </span>
          <span className="font-['Geist_Mono',monospace]">Entrée pour envoyer · Maj+Entrée saut de ligne</span>
        </div>
      </div>
    </div>
  )
}

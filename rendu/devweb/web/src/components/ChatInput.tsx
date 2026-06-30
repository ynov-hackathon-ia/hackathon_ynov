import { useState, type KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  loading: boolean
  disabled: boolean
}

function IconSend() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

const SUGGESTIONS = [
  'What is the current inflation rate?',
  'Explain P/E ratio',
  'Compare growth vs value investing',
  'What is dollar-cost averaging?',
]

export function ChatInput({ onSend, loading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    const text = input.trim()
    if (!text || loading || disabled) return
    setInput('')
    onSend(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="px-4 pb-5 pt-3 border-t border-slate-800 bg-slate-950 shrink-0">
      {/* Suggestion chips — only show when input is empty */}
      {!input && (
        <div className="flex gap-2 flex-wrap mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              disabled={disabled}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 items-end">
        <div className="flex-1 bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Model offline — start Ollama to chat' : 'Ask a financial question… (Shift+Enter for new line)'}
            disabled={loading || disabled}
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 resize-none outline-none leading-relaxed max-h-32 overflow-y-auto disabled:opacity-50"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!input.trim() || loading || disabled}
          aria-label="Send message"
          className="size-11 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-lg shadow-blue-600/20 shrink-0 cursor-pointer"
        >
          <IconSend />
        </button>
      </div>

      <p className="text-xs text-slate-600 mt-2 text-center">
        Phi-3.5-Financial may make mistakes. Verify important financial information.
      </p>
    </div>
  )
}

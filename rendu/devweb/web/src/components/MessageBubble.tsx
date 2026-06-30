import type { Message } from '../api/ollama'

interface MessageBubbleProps {
  message: Message
}

// Simple avatar icons
function UserAvatar() {
  return (
    <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
      U
    </div>
  )
}

function BotAvatar() {
  return (
    <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
      AI
    </div>
  )
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex items-end gap-3 justify-end">
        <div className="max-w-[72%] flex flex-col items-end gap-1">
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-md">
            {message.content}
          </div>
        </div>
        <UserAvatar />
      </div>
    )
  }

  return (
    <div className="flex items-end gap-3 justify-start">
      <BotAvatar />
      <div className="max-w-[72%] flex flex-col gap-1">
        <div className="bg-slate-800 border border-slate-700/60 text-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-md">
          {message.content}
        </div>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 justify-start">
      <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
        AI
      </div>
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 shadow-md">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  )
}

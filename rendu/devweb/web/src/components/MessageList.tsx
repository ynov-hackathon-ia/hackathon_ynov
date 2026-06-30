import type { ChatMessage } from '../types'
import { MessageBubble } from './MessageBubble'

type MessageListProps = {
  conversationId: string
  messages: ChatMessage[]
  error: string | null
  copiedId: string | null
  onCopy: (messageId: string, content: string) => void
  onRegenerate: () => void
}

export function MessageList({ conversationId, messages, error, copiedId, onCopy, onRegenerate }: MessageListProps) {
  return (
    <div className="mx-auto flex w-full max-w-[768px] flex-col gap-6 px-6 pb-6 pt-8">
      {messages.map((message, index) => {
        const messageId = `${conversationId}-${index}`
        const isLastAssistant = message.role === 'assistant' && index === messages.length - 1
        return (
          <MessageBubble
            key={messageId}
            message={message}
            copied={copiedId === messageId}
            onCopy={message.role === 'assistant' ? () => onCopy(messageId, message.content) : undefined}
            onRegenerate={isLastAssistant ? onRegenerate : undefined}
          />
        )
      })}


      {error ? (
        <p className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-2 text-center text-xs text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

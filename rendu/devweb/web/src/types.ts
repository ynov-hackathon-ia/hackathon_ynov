import type { Message } from './api/ollama'

export type Theme = 'light' | 'dark'
export type ModelId = 'financial' | 'medical'

export type ModelOption = {
  id: ModelId
  name: string
  tag: string
  accent: boolean
  model: string
}

export type ChatMessage = Message & {
  pending?: boolean
  timeSec?: number
  tokPerSec?: number
}

export type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
}

export type Example = {
  tag: string
  text: string
}

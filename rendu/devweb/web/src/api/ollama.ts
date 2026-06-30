export interface Message {
  role: 'user' | 'assistant'
  content: string
}

const MODEL = import.meta.env.VITE_MODEL_NAME ?? 'techcorp-financial'

export async function checkOllama(): Promise<boolean> {
  try {
    const res = await fetch('/api/tags', { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

export async function chat(messages: Message[]): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, stream: false, messages }),
  })
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${res.statusText}`)
  const data = await res.json()
  // Never forward X-Compliance-Token or any custom header — only use message content
  return data?.message?.content?.trim() ?? 'Réponse vide.'
}

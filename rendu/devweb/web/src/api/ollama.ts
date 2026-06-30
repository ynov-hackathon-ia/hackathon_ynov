export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface InferenceOptions {
  temperature?: number
  top_p?: number
  num_predict?: number
}

const DEFAULT_MODEL = import.meta.env.VITE_MODEL_NAME ?? 'techcorp-financial'

export async function checkOllama(): Promise<boolean> {
  try {
    const res = await fetch('/api/tags', { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

export async function chatStream(
  messages: Message[],
  model = DEFAULT_MODEL,
  onChunk: (delta: string) => void,
  signal?: AbortSignal,
  options?: InferenceOptions,
): Promise<void> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: true,
      messages,
      options: {
        temperature: options?.temperature,
        top_p: options?.top_p,
        num_predict: options?.num_predict,
      },
    }),
    signal,
  })
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${res.statusText}`)

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const json = JSON.parse(line)
        const delta: string | undefined = json?.message?.content
        if (delta) onChunk(delta)
      } catch {
        // ligne malformée
      }
    }
  }
}

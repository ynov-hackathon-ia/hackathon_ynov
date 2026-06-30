import { useState, useEffect, useCallback } from 'react'
import { chat, checkOllama, type Message } from '../api/ollama'

export function useOllama() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkOllama().then(setConnected)
    const id = setInterval(() => checkOllama().then(setConnected), 5000)
    return () => clearInterval(id)
  }, [])

  const send = useCallback(async (content: string) => {
    const next: Message[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setLoading(true)
    setError(null)
    try {
      const reply = await chat(next)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }, [messages])

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { connected, messages, loading, error, send, reset }
}

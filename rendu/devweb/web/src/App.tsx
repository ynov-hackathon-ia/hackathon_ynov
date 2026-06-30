import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { chat, checkOllama, type Message } from './api/ollama'
import { modelOptions, initialConversations } from './data'
import type { Conversation, ModelId, Theme } from './types'
import { Sidebar } from './components/Sidebar'
import { ChatHeader } from './components/ChatHeader'
import { MessageList } from './components/MessageList'
import { WelcomeScreen } from './components/WelcomeScreen'
import { Composer } from './components/Composer'
import { SettingsPanel } from './components/SettingsPanel'

export default function App() {
  const [theme, setTheme] = useState<Theme>('light')
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState('c1')
  const [activeModelId, setActiveModelId] = useState<ModelId>('financial')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState<boolean | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [temperature, setTemperature] = useState(0.3)
  const [topP, setTopP] = useState(0.9)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [error, setError] = useState<string | null>(null)
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null)
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const copyTimerRef = useRef<number | null>(null)
  const [narrow, setNarrow] = useState(() => window.innerWidth < 880)

  const activeConversation = conversations.find(conversation => conversation.id === activeConversationId) ?? conversations[0]
  const prevMessageCountRef = useRef(activeConversation.messages.length)
  const activeModel = modelOptions.find(model => model.id === activeModelId) ?? modelOptions[0]
  const hasMessages = activeConversation.messages.length > 0
  const sendDisabled = !input.trim() || loadingConversationId !== null
  const modelName = activeModel.model

  useEffect(() => {
    const refresh = async () => {
      setConnected(await checkOllama())
    }

    refresh()
    const id = window.setInterval(refresh, 5000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const count = activeConversation.messages.length
    const grew = count > prevMessageCountRef.current || loadingConversationId !== null
    prevMessageCountRef.current = count

    // Ne défile que lorsqu'un message est réellement ajouté (ou pendant la
    // génération) — jamais au montage. On scrolle uniquement le conteneur des
    // messages, sans toucher au défilement de la fenêtre.
    if (!grew) return
    const container = messagesScrollRef.current
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [activeConversation.messages, loadingConversationId])

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    const resetScroll = () => {
      window.scrollTo(0, 0)
      messagesScrollRef.current?.scrollTo(0, 0)
    }

    resetScroll()
    const frame = window.requestAnimationFrame(resetScroll)

    return () => {
      window.cancelAnimationFrame(frame)
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    return () => {
      delete document.documentElement.dataset.theme
    }
  }, [theme])

  useEffect(() => {
    const updateLayout = () => setNarrow(window.innerWidth < 880)

    window.addEventListener('resize', updateLayout)
    updateLayout()

    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    }
  }, [])

  const updateConversation = (conversationId: string, updater: (conversation: Conversation) => Conversation) => {
    setConversations(current => current.map(conversation => (conversation.id === conversationId ? updater(conversation) : conversation)))
  }

  const sendText = async (text: string) => {
    const content = text.trim()
    if (!content || loadingConversationId !== null) return

    const conversationId = activeConversation.id
    const wasEmpty = activeConversation.messages.length === 0

    setInput('')
    setError(null)
    setLoadingConversationId(conversationId)

    const nextMessages: Message[] = [...activeConversation.messages, { role: 'user', content }]

    updateConversation(conversationId, conversation => ({
      ...conversation,
      title: wasEmpty ? (content.length > 34 ? `${content.slice(0, 34)}…` : content) : conversation.title,
      messages: [...conversation.messages, { role: 'user', content }],
    }))

    try {
      const reply = await chat(nextMessages, modelName)
      updateConversation(conversationId, conversation => ({
        ...conversation,
        messages: [...conversation.messages, { role: 'assistant', content: reply }],
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau')
    } finally {
      setLoadingConversationId(null)
    }
  }

  const handleNewChat = () => {
    const id = `c${Date.now()}`
    setConversations(current => [{ id, title: 'Nouvelle conversation', messages: [] }, ...current])
    setActiveConversationId(id)
    setInput('')
    setError(null)
    setSidebarOpen(false)
  }

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id)
    setSidebarOpen(false)
    setError(null)
  }

  const handleRegenerate = async () => {
    if (loadingConversationId !== null) return

    const assistantFree = activeConversation.messages.filter(message => message.role === 'user' || message.role === 'assistant')
    const lastUserIndex = [...assistantFree].map((message, index) => ({ message, index })).reverse().find(entry => entry.message.role === 'user')?.index
    if (lastUserIndex == null) return

    const promptMessages = activeConversation.messages.slice(0, lastUserIndex + 1)

    setLoadingConversationId(activeConversation.id)
    setError(null)

    updateConversation(activeConversation.id, conversation => ({
      ...conversation,
      messages: promptMessages,
    }))

    try {
      const reply = await chat(promptMessages, modelName)
      updateConversation(activeConversation.id, conversation => ({
        ...conversation,
        messages: [...conversation.messages, { role: 'assistant', content: reply }],
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau')
    } finally {
      setLoadingConversationId(null)
    }
  }

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedId(current => (current === messageId ? null : current))
      }, 1400)
    } catch {
      setCopiedId(null)
    }
  }

  return (
    <div data-theme={theme} className="fixed inset-0 h-dvh w-dvw isolate flex overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,33,29,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,33,29,0.05),transparent_30%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 size-72 rounded-full bg-[var(--accent-weak)]/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-0 size-80 rounded-full bg-[var(--surface-3)]/80 blur-3xl" />

      <Sidebar
        narrow={narrow}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeModel={activeModel}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        activeModelId={activeModelId}
        onSelectModel={setActiveModelId}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme(current => (current === 'light' ? 'dark' : 'light'))}
      />

      <main className="relative z-10 flex h-dvh flex-1 flex-col overflow-hidden overflow-anchor-none">
        <ChatHeader
          narrow={narrow}
          onOpenSidebar={() => setSidebarOpen(true)}
          title={activeConversation.title}
          modelName={activeModel.name}
          connected={connected}
          onReset={() => setConversations(initialConversations())}
        />

        <div ref={messagesScrollRef} className="flex-1 overflow-y-auto">
          {hasMessages ? (
            <MessageList
              conversationId={activeConversation.id}
              messages={activeConversation.messages}
              loading={loadingConversationId === activeConversation.id}
              error={error}
              copiedId={copiedId}
              onCopy={handleCopy}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <WelcomeScreen modelName={activeModel.name} onPickExample={sendText} />
          )}
        </div>

        <Composer
          value={input}
          onChange={setInput}
          onSend={() => void sendText(input)}
          disabled={sendDisabled}
          temperature={temperature}
          topP={topP}
          maxTokens={maxTokens}
        />
      </main>

      {settingsOpen ? (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          temperature={temperature}
          onTemperatureChange={setTemperature}
          topP={topP}
          onTopPChange={setTopP}
          maxTokens={maxTokens}
          onMaxTokensChange={setMaxTokens}
          modelName={modelName}
        />
      ) : null}
    </div>
  )
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { checkOllama, type Message } from './api/ollama'

type Theme = 'light' | 'dark'
type ModelId = 'financial' | 'medical'

type ChatMessage = Message & {
  pending?: boolean
  timeSec?: number
  tokPerSec?: number
}

type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
}

type Example = {
  tag: string
  text: string
}

const modelOptions = [
  { id: 'financial', name: 'Phi-3.5-Financial', tag: 'Production', accent: true },
  { id: 'medical', name: 'Med-LoRA', tag: 'Expérimental', accent: false },
] as const

const exampleQuestions: Example[] = [
  { tag: 'LIQUIDITÉ', text: "Analyse les ratios de liquidité d'une PME" },
  { tag: 'VALORISATION', text: 'Explique le coût moyen pondéré du capital' },
  { tag: 'TRÉSORERIE', text: 'Comment construire un budget de trésorerie sur 12 mois ?' },
  { tag: 'RENTABILITÉ', text: 'Quels indicateurs suivre pour évaluer la rentabilité ?' },
]

function defaultAnswer() {
  return `Une marge d'exploitation qui recule malgré une hausse du chiffre d'affaires indique que les coûts progressent plus vite que les revenus.

• Structure de coûts — hausse des charges variables ou fixes.
• Mix produit — montée en volume sur des références à faible marge.
• Effet prix — remises commerciales ou pression concurrentielle.

Recommandation : isoler la marge par segment sur les 4 derniers trimestres.`
}

function initialConversations(): Conversation[] {
  return [
    {
      id: 'c1',
      title: 'Analyse de marge T3',
      messages: [
        {
          role: 'user',
          content: "Comment interpréter une marge d'exploitation en baisse malgré une hausse du chiffre d'affaires ?",
        },
        {
          role: 'assistant',
          content: defaultAnswer(),
          timeSec: 1.4,
          tokPerSec: 58,
        },
      ],
    },
    { id: 'c2', title: "Ratio d'endettement optimal", messages: [] },
    { id: 'c3', title: 'Prévision de trésorerie 12 mois', messages: [] },
    { id: 'c4', title: 'Diversification de portefeuille', messages: [] },
  ]
}

async function chat(model: string, messages: Message[]) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, stream: false, messages }),
  })

  if (!res.ok) throw new Error(`Ollama ${res.status}: ${res.statusText}`)
  const data = await res.json()
  return data?.message?.content?.trim() ?? 'Réponse vide.'
}

function StatusBadge({ connected }: { connected: boolean | null }) {
  if (connected === null) {
    return <span className="text-sm text-[var(--text-2)]">Vérification…</span>
  }

  return connected ? (
    <span className="flex items-center gap-1.5 text-sm text-[var(--accent-text)]">
      <span className="size-2 rounded-full bg-[var(--accent)]" />
      Connecté
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-sm text-[var(--danger)]">
      <span className="size-2 rounded-full bg-[var(--danger)]" />
      Déconnecté
    </span>
  )
}

function Bubble({
  message,
  onCopy,
  onRegenerate,
  copied,
}: {
  message: ChatMessage
  onCopy?: () => void
  onRegenerate?: () => void
  copied?: boolean
}) {
  const isUser = message.role === 'user'

  if (isUser) {
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
          {message.content}
          {message.pending ? (
            <span className="ml-0.5 inline-block h-[17px] w-2 align-[-3px] animate-[dc-blink_1s_step-end_infinite] bg-[var(--accent)]" />
          ) : null}
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
  const bottomRef = useRef<HTMLDivElement>(null)
  const mainScrollRef = useRef<HTMLElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const copyTimerRef = useRef<number | null>(null)
  const didMountRef = useRef(false)
  const [narrow, setNarrow] = useState(() => window.innerWidth < 880)

  const activeConversation = conversations.find(conversation => conversation.id === activeConversationId) ?? conversations[0]
  const activeModel = modelOptions.find(model => model.id === activeModelId) ?? modelOptions[0]
  const hasMessages = activeConversation.messages.length > 0
  const sendDisabled = !input.trim() || loadingConversationId !== null
  const modelName = import.meta.env.VITE_MODEL_NAME ?? 'techcorp-financial'

  useEffect(() => {
    const refresh = async () => {
      setConnected(await checkOllama())
    }

    refresh()
    const id = window.setInterval(refresh, 5000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation.messages, loadingConversationId])

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    const resetScroll = () => {
      window.scrollTo(0, 0)
      mainScrollRef.current?.scrollTo(0, 0)
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
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
  }, [input])

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
      const reply = await chat(modelName, nextMessages)
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await sendText(input)
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
      const reply = await chat(modelName, promptMessages)
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

  const activeConversationMessages = activeConversation.messages

  return (
    <div data-theme={theme} className="fixed inset-0 h-dvh w-dvw isolate flex overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,33,29,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,33,29,0.05),transparent_30%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 size-72 rounded-full bg-[var(--accent-weak)]/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-0 size-80 rounded-full bg-[var(--surface-3)]/80 blur-3xl" />

      {sidebarOpen && narrow ? (
        <button
          type="button"
          aria-label="Fermer la barre latérale"
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 z-20 bg-black/40"
        />
      ) : null}

      <aside
        className={`relative z-30 h-dvh w-[280px] flex-none self-stretch border-r border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-pop)] transition-transform duration-200 ease-out ${
          narrow ? (sidebarOpen ? 'absolute inset-y-0 left-0 translate-x-0' : 'absolute inset-y-0 left-0 -translate-x-full') : 'translate-x-0'
        }`}
      >
        <div className="flex h-dvh w-[280px] flex-col">
          <div className="flex items-center gap-3 px-5 pb-4 pt-5">
            <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-[var(--ink)] font-['Geist_Mono',monospace] text-[17px] font-medium text-[var(--on-ink)]">
              ϕ
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-[-0.01em] leading-[1.2] text-[var(--text)]">Phi-3.5-Financial</div>
              <div className="mt-0.5 font-['Geist_Mono',monospace] text-[11px] leading-[1.3] text-[var(--text-3)]">v0.9 · inference</div>
            </div>
          </div>

          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex h-10 w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium text-[var(--text)] shadow-[var(--shadow)] transition-colors hover:border-[var(--border-strong)]"
            >
              <span className="text-lg leading-none font-normal text-[var(--text-2)]">+</span>
              Nouvelle conversation
            </button>
          </div>

          <div className="px-5 pb-2 pt-4 font-['Geist_Mono',monospace] text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--text-3)]">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <div className="flex flex-col gap-0.5">
              {conversations.map(conversation => {
                const isActive = conversation.id === activeConversationId
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`flex h-9 w-full items-center rounded-lg px-3 text-left text-[13px] transition-colors ${
                      isActive
                        ? 'bg-[var(--surface-3)] font-medium text-[var(--text)]'
                        : 'bg-transparent font-normal text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                    }`}
                  >
                    <span className="truncate">{conversation.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-[var(--border)] p-3">
            <div className="px-2 pb-2 font-['Geist_Mono',monospace] text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--text-3)]">
              Modèle
            </div>

            <div className="flex flex-col gap-0.5">
              {modelOptions.map(model => {
                const isActive = model.id === activeModelId
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setActiveModelId(model.id)}
                    className={`flex h-9 w-full items-center gap-2 rounded-lg px-2 text-[13px] transition-colors ${
                      isActive
                        ? 'border border-[var(--border-strong)] bg-[var(--surface-2)] font-medium text-[var(--text)]'
                        : 'border border-transparent bg-transparent font-normal text-[var(--text)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate text-left">{model.name}</span>
                    <span
                      className={`flex-none rounded px-1.5 py-0.5 font-['Geist_Mono',monospace] text-[10px] font-medium tracking-[0.02em] ${
                        model.accent ? 'bg-[var(--accent-weak)] text-[var(--accent-text)]' : 'bg-[var(--surface-3)] text-[var(--text-3)]'
                      }`}
                    >
                      {model.tag}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-2 flex items-center gap-2 rounded-lg bg-[var(--surface-2)] p-2">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium leading-[1.2] text-[var(--text)]">Serveur connecté</div>
                <div className="mt-0.5 truncate font-['Geist_Mono',monospace] text-[11px] leading-[1.3] text-[var(--text-3)]">
                  Ollama · localhost:11434
                </div>
              </div>
            </div>

            <div className="mt-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="flex h-[34px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-transparent text-[13px] font-medium text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              >
                <span className="font-['Geist_Mono',monospace] text-[13px]">{`{ }`}</span>
                Réglages
              </button>
              <button
                type="button"
                onClick={() => setTheme(current => (current === 'light' ? 'dark' : 'light'))}
                title="Basculer le thème"
                className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[14px] text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              >
                {theme === 'light' ? '◐' : '◑'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main ref={mainScrollRef} className="relative z-10 flex h-dvh flex-1 flex-col overflow-hidden overflow-anchor-none">
        <header className="flex h-14 items-center gap-3 border-b border-[var(--border)] px-5 sm:h-16 sm:px-5">
          {narrow ? (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex size-[34px] items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[15px] text-[var(--text-2)]"
            >
              ≡
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold tracking-[-0.01em] text-[var(--text)]">{activeConversation.title}</div>
          </div>
          <div className="flex h-7 items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5">
            <span className="font-['Geist_Mono',monospace] text-[12px] text-[var(--text-2)]">{activeModel.name}</span>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <StatusBadge connected={connected} />
            <button
              type="button"
              onClick={() => setConversations(initialConversations())}
              className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
            >
              Réinitialiser
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {hasMessages ? (
            <div className="mx-auto flex w-full max-w-[768px] flex-col gap-6 px-6 pb-6 pt-8">
              {activeConversationMessages.map((message, index) => {
                const isLastAssistant = message.role === 'assistant' && index === activeConversationMessages.length - 1
                return (
                  <Bubble
                    key={`${activeConversation.id}-${index}`}
                    message={message}
                    copied={copiedId === `${activeConversation.id}-${index}`}
                    onCopy={message.role === 'assistant' ? () => handleCopy(`${activeConversation.id}-${index}`, message.content) : undefined}
                    onRegenerate={isLastAssistant ? handleRegenerate : undefined}
                  />
                )
              })}

              {loadingConversationId === activeConversation.id ? (
                <div className="flex justify-start animate-[dc-rise_0.35s_ease-out]">
                  <div className="flex gap-1 rounded-[12px_12px_4px_12px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 shadow-[var(--shadow)]">
                    {[0, 1, 2].map(index => (
                      <span
                        key={index}
                        className="size-1.5 rounded-full bg-[var(--text-2)] animate-bounce"
                        style={{ animationDelay: `${index * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {error ? (
                <p className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-2 text-center text-xs text-[var(--danger)]">
                  {error}
                </p>
              ) : null}

              <div ref={bottomRef} />
            </div>
          ) : (
            <div className="mx-auto flex min-h-full w-full max-w-[720px] flex-col items-center px-6 pb-6 pt-16 text-center">
              <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-[var(--ink)] font-['Geist_Mono',monospace] text-[28px] text-[var(--on-ink)]">
                ϕ
              </div>
              <div className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--text)]">Phi-3.5-Financial</div>
              <div className="mt-2 max-w-[440px] text-[15px] leading-[1.5] text-[var(--text-2)]">
                Assistant d'analyse financière et business. Posez une question ou choisissez un exemple.
              </div>

              <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {exampleQuestions.map(example => (
                  <button
                    key={example.tag}
                    type="button"
                    onClick={() => sendText(example.text)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow)] transition-colors hover:border-[var(--border-strong)]"
                  >
                    <div className="mb-2 font-['Geist_Mono',monospace] text-[11px] font-medium tracking-[0.02em] text-[var(--accent-text)]">
                      {example.tag}
                    </div>
                    <div className="text-sm leading-[1.45] text-[var(--text)]">{example.text}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-none px-6 pb-5 pt-4">
          <div className="mx-auto max-w-[768px]">
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 rounded-3xl border border-[var(--border-strong)] bg-[var(--surface)] px-2 py-2 pl-4 shadow-[var(--shadow)]"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void sendText(input)
                  }
                }}
                placeholder="Posez une question financière…"
                rows={1}
                className="max-h-[180px] min-h-6 flex-1 resize-none border-none bg-transparent py-2 text-[15px] leading-[1.5] text-[var(--text)] outline-none placeholder:text-[var(--text-3)]"
              />
              <button
                type="submit"
                disabled={sendDisabled}
                className={`flex size-9 flex-none items-center justify-center rounded-lg text-[17px] font-semibold transition-colors ${
                  sendDisabled ? 'cursor-default bg-[var(--surface-3)] text-[var(--text-3)]' : 'bg-[var(--accent)] text-[var(--on-ink)] hover:opacity-95'
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
      </main>

      {settingsOpen ? (
        <div className="absolute inset-0 z-30 flex justify-end">
          <button
            type="button"
            aria-label="Fermer les réglages"
            onClick={() => setSettingsOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex h-full w-[360px] max-w-[90vw] animate-[dc-rise_0.2s_ease] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-pop)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
              <div className="text-[15px] font-semibold text-[var(--text)]">Paramètres d'inférence</div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="flex size-[30px] items-center justify-center rounded-lg text-[16px] text-[var(--text-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mb-7">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-[var(--text)]">Température</span>
                  <span className="font-['Geist_Mono',monospace] text-[13px] text-[var(--accent-text)]">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={temperature}
                  onChange={event => setTemperature(Number.parseFloat(event.target.value))}
                  className="w-full"
                />
                <div className="mt-2 text-[12px] leading-[1.4] text-[var(--text-3)]">
                  Plus bas = réponses déterministes, adapté à l'analyse financière.
                </div>
              </div>

              <div className="mb-7">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-[var(--text)]">Top-p</span>
                  <span className="font-['Geist_Mono',monospace] text-[13px] text-[var(--accent-text)]">{topP.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={topP}
                  onChange={event => setTopP(Number.parseFloat(event.target.value))}
                  className="w-full"
                />
              </div>

              <div className="mb-7">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-[var(--text)]">Tokens maximum</span>
                  <span className="font-['Geist_Mono',monospace] text-[13px] text-[var(--accent-text)]">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={maxTokens}
                  onChange={event => setMaxTokens(Number.parseInt(event.target.value, 10))}
                  className="w-full"
                />
              </div>

              <div className="border-t border-[var(--border)] pt-5">
                <div className="mb-3 font-['Geist_Mono',monospace] text-[11px] font-medium uppercase tracking-[0.04em] text-[var(--text-3)]">
                  Endpoint
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 font-['Geist_Mono',monospace] text-[12px] leading-[1.6] text-[var(--text-2)]">
                  POST /api/chat
                  <br />
                  host: localhost:11434
                  <br />
                  model: {modelName}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

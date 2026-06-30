import { modelOptions } from '../data'
import type { Conversation, ModelId, ModelOption, Theme } from '../types'

type SidebarProps = {
  narrow: boolean
  open: boolean
  onClose: () => void
  activeModel: ModelOption
  conversations: Conversation[]
  activeConversationId: string
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onNewChat: () => void
  activeModelId: ModelId
  onSelectModel: (id: ModelId) => void
  onOpenSettings: () => void
  theme: Theme
  onToggleTheme: () => void
}

export function Sidebar({
  narrow,
  open,
  onClose,
  activeModel,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  activeModelId,
  onSelectModel,
  onOpenSettings,
  theme,
  onToggleTheme,
}: SidebarProps) {
  return (
    <>
      {open && narrow ? (
        <button
          type="button"
          aria-label="Fermer la barre latérale"
          onClick={onClose}
          className="absolute inset-0 z-20 bg-black/40"
        />
      ) : null}

      <aside
        className={`relative z-30 h-dvh w-[280px] flex-none self-stretch border-r border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-pop)] transition-transform duration-200 ease-out ${
          narrow ? (open ? 'absolute inset-y-0 left-0 translate-x-0' : 'absolute inset-y-0 left-0 -translate-x-full') : 'translate-x-0'
        }`}
      >
        <div className="flex h-dvh w-[280px] flex-col">
          <div className="flex items-center gap-3 px-5 pb-4 pt-5">
            <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-[var(--ink)] font-['Geist_Mono',monospace] text-[17px] font-medium text-[var(--on-ink)]">
              ϕ
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-[-0.01em] leading-[1.2] text-[var(--text)]">{activeModel.name}</div>
              <div className="mt-0.5 font-['Geist_Mono',monospace] text-[11px] leading-[1.3] text-[var(--text-3)]">v0.9 · inference</div>
            </div>
          </div>

          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={onNewChat}
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
                  <div
                    key={conversation.id}
                    className={`group flex h-9 w-full items-center rounded-lg text-[13px] transition-colors ${
                      isActive
                        ? 'bg-[var(--surface-3)] font-medium text-[var(--text)]'
                        : 'bg-transparent font-normal text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectConversation(conversation.id)}
                      className="min-w-0 flex-1 truncate px-3 text-left h-full"
                    >
                      {conversation.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteConversation(conversation.id)}
                      title="Supprimer"
                      className="mr-1.5 flex size-6 flex-none items-center justify-center rounded opacity-0 group-hover:opacity-100 text-[var(--text-3)] hover:bg-[var(--danger)]/15 hover:text-[var(--danger)] transition-all"
                    >
                      ✕
                    </button>
                  </div>
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
                    onClick={() => onSelectModel(model.id)}
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
                onClick={onOpenSettings}
                className="flex h-[34px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-transparent text-[13px] font-medium text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              >
                <span className="font-['Geist_Mono',monospace] text-[13px]">{`{ }`}</span>
                Réglages
              </button>
              <button
                type="button"
                onClick={onToggleTheme}
                title="Basculer le thème"
                className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[14px] text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              >
                {theme === 'light' ? '◐' : '◑'}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

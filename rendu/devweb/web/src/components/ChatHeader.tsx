import { StatusBadge } from './StatusBadge'

type ChatHeaderProps = {
  narrow: boolean
  onOpenSidebar: () => void
  title: string
  modelName: string
  connected: boolean | null
  onReset: () => void
}

export function ChatHeader({ narrow, onOpenSidebar, title, modelName, connected, onReset }: ChatHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-[var(--border)] px-5 sm:h-16 sm:px-5">
      {narrow ? (
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex size-[34px] items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[15px] text-[var(--text-2)]"
        >
          ≡
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold tracking-[-0.01em] text-[var(--text)]">{title}</div>
      </div>
      <div className="flex h-7 items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5">
        <span className="font-['Geist_Mono',monospace] text-[12px] text-[var(--text-2)]">{modelName}</span>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <StatusBadge connected={connected} />
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-2)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]"
        >
          Réinitialiser
        </button>
      </div>
    </header>
  )
}

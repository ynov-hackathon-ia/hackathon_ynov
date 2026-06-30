export function StatusBadge({ connected }: { connected: boolean | null }) {
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

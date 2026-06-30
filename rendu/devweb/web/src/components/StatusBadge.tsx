interface StatusBadgeProps {
  connected: boolean | null
}

export function StatusBadge({ connected }: StatusBadgeProps) {
  if (connected === null) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <span className="size-1.5 rounded-full bg-slate-400 animate-pulse" />
        Connecting…
      </span>
    )
  }
  if (connected) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Model Online
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
      <span className="size-1.5 rounded-full bg-red-400" />
      Offline
    </span>
  )
}

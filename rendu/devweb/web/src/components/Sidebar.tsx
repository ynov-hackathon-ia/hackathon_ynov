interface SidebarProps {
  onReset: () => void
  connected: boolean | null
}

// Simple SVG icons inline
function IconTrendingUp() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function IconMessageSquare() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconBarChart() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 19.07a10 10 0 0 1 0-14.14" />
    </svg>
  )
}

function IconRefresh() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

const navItems = [
  { icon: <IconMessageSquare />, label: 'Financial Chat', active: true },
  { icon: <IconTrendingUp />, label: 'Market Analysis', active: false },
  { icon: <IconBarChart />, label: 'Portfolio', active: false },
]

export function Sidebar({ onReset, connected }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <IconTrendingUp />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">TechCorp</h1>
            <p className="text-xs text-slate-400">Financial AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
          Assistant
        </p>
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              item.active
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Session
          </p>
          <button
            onClick={onReset}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <IconRefresh />
            New Conversation
          </button>
        </div>
      </nav>

      {/* Model info footer */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Model</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                connected === null
                  ? 'bg-slate-700 text-slate-400'
                  : connected
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {connected === null ? 'Checking…' : connected ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-xs font-semibold text-white">Phi-3.5-Financial</p>
          <p className="text-xs text-slate-500 mt-0.5">via Ollama · Local</p>
        </div>

        <button className="mt-3 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer">
          <IconSettings />
          Settings
        </button>
      </div>
    </aside>
  )
}

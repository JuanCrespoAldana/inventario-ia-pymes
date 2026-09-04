import { Bell, Menu, Search } from "lucide-react"

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg border border-line bg-surface p-2 text-ink-dim md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
        <div>
          <h1 className="font-display text-xl font-semibold sm:text-2xl">Dashboard</h1>
          <p className="text-sm text-ink-dim">Resumen general — todas las sedes, hoy</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-[10px] border border-line bg-surface px-3 py-2 sm:flex">
          <Search className="h-[15px] w-[15px] text-ink-faint" />
          <input
            type="text"
            placeholder="Buscar producto o SKU"
            className="w-48 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
          />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-surface text-ink-dim" aria-label="Notificaciones">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger ring-2 ring-surface" />
        </button>
      </div>
    </div>
  )
}

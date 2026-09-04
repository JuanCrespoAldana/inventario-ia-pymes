import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Boxes,
  Building2,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventario", label: "Inventario", icon: Package },
  { id: "sedes", label: "Sedes", icon: Building2 },
  { id: "productos", label: "Productos", icon: ShoppingBag },
  { id: "prediccion", label: "Predicción IA", icon: Sparkles },
  { id: "usuarios", label: "Usuarios", icon: Users },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [activo, setActivo] = useState("dashboard")
  const { usuario, cerrarSesion } = useAuth()

  const iniciales = (usuario?.nombre ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const contenido = (
    <div className="flex h-full flex-col p-4">
      <div className="mb-7 flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-[#2A3FCB] shadow-[0_0_20px_rgba(76,111,255,0.4)]">
            <Boxes className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Inventario IA</div>
            <div className="text-[11px] text-ink-faint">Panel de gestión</div>
          </div>
        </div>
        <button onClick={onClose} className="text-ink-faint hover:text-ink md:hidden" aria-label="Cerrar menu">
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activo === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActivo(item.id)}
              className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-sm font-medium transition-colors ${
                isActive
                  ? "-ml-0.5 border-l-2 border-accent bg-accent-dim text-ink"
                  : "text-ink-dim hover:bg-surface hover:text-ink"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${isActive ? "text-accent-light" : "opacity-80"}`} />
              {item.label}
            </button>
          )
        })}

        <div className="px-3 pb-1.5 pt-4 text-[10.5px] uppercase tracking-wider text-ink-faint">Sistema</div>
        <button className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-sm font-medium text-ink-dim hover:bg-surface hover:text-ink">
          <Settings className="h-[18px] w-[18px] opacity-80" />
          Configuración
        </button>
      </nav>

      <div className="mt-auto border-t border-line pt-3">
        <button
          onClick={cerrarSesion}
          className="flex w-full items-center gap-2.5 rounded-[10px] p-2 text-left hover:bg-surface"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-xs font-semibold text-accent-light">
            {iniciales}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{usuario?.nombre}</div>
            <div className="truncate text-[11.5px] text-ink-faint">
              {usuario?.rol === "admin_general" ? "Admin general" : "Usuario de sede"}
            </div>
          </div>
          <LogOut className="h-4 w-4 flex-shrink-0 text-ink-faint" />
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 border-r border-line md:block">{contenido}</aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-bg md:hidden"
            >
              {contenido}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

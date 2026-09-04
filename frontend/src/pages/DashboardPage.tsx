import { useState } from "react"
import type { JSX } from "react"
import {
  AlertTriangle,
  ArrowLeftRight,
  Building2,
  Package,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Topbar } from "@/components/dashboard/Topbar"
import { KpiCard } from "@/components/dashboard/KpiCard"

const SEDES = [
  { nombre: "Bodega Principal", unidades: 5890, porcentaje: 92 },
  { nombre: "Sede Centro", unidades: 5180, porcentaje: 81 },
  { nombre: "Sede Norte", unidades: 4090, porcentaje: 64 },
  { nombre: "Sede Sur", unidades: 3260, porcentaje: 51 },
]

const PRODUCTOS_BAJOS: {
  nombre: string
  sku: string
  sede: string
  cantidad: string
  minimo: string
  estado: "bajo" | "agotado"
}[] = [
  { nombre: "Taladro percutor Einhell TE-ID", sku: "SKU-EH-1042", sede: "Sede Centro", cantidad: "4 u", minimo: "10 u", estado: "bajo" },
  { nombre: "Disco de corte 115mm", sku: "SKU-TP-0871", sede: "Sede Norte", cantidad: "12 u", minimo: "20 u", estado: "bajo" },
  { nombre: "Compresor 24L Truper", sku: "SKU-TP-2205", sede: "Sede Sur", cantidad: "0 u", minimo: "5 u", estado: "agotado" },
  { nombre: "Guantes de seguridad (par)", sku: "SKU-GN-0033", sede: "Sede Centro", cantidad: "8 u", minimo: "15 u", estado: "bajo" },
]

const RECOMENDACIONES: {
  icon: typeof TrendingUp
  texto: JSX.Element
  confianza: number
  accion: string
}[] = [
  {
    icon: TrendingUp,
    texto: (
      <>
        <b className="font-semibold">Sede Centro:</b> reponer taladros percutores — quedan 4 unidades y se
        estiman 15 en demanda para las proximas 2 semanas.
      </>
    ),
    confianza: 87,
    accion: "Generar orden",
  },
  {
    icon: ArrowLeftRight,
    texto: (
      <>
        <b className="font-semibold">Sede Norte:</b> transferir discos de corte desde Bodega Principal en vez
        de comprar — hay excedente disponible ahí.
      </>
    ),
    confianza: 79,
    accion: "Aprobar traslado",
  },
  {
    icon: AlertTriangle,
    texto: (
      <>
        <b className="font-semibold">Sede Sur:</b> compresores Truper 24L agotados — el patrón estacional
        indica un pico de demanda este mes.
      </>
    ),
    confianza: 91,
    accion: "Generar orden",
  },
]

export function DashboardPage() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  return (
    <div className="flex min-h-screen w-full bg-bg">
      <Sidebar open={sidebarAbierto} onClose={() => setSidebarAbierto(false)} />

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
        <Topbar onMenuClick={() => setSidebarAbierto(true)} />

        <div className="mb-5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <KpiCard label="Stock total" value={18420} delta="3.2% esta semana" tone="up" icon={Package} iconTone="blue" />
          <KpiCard label="Productos activos" value={342} delta="12 nuevos este mes" tone="up" icon={ShoppingBag} iconTone="blue" />
          <KpiCard label="Sedes conectadas" value={4} delta="todas sincronizadas" tone="ok" icon={Building2} iconTone="green" />
          <KpiCard label="Alertas de stock bajo" value={7} delta="requieren accion" tone="warn" icon={AlertTriangle} iconTone="amber" />
        </div>

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Inventario por sede</h2>
              <button className="text-xs font-medium text-accent-light">Ver todo</button>
            </div>

            <div className="mb-6 flex flex-col gap-3">
              {SEDES.map((sede) => (
                <div
                  key={sede.nombre}
                  className="grid grid-cols-[100px_1fr_56px] items-center gap-3 sm:grid-cols-[120px_1fr_60px]"
                >
                  <span className="truncate text-xs text-ink-dim">{sede.nombre}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light"
                      style={{ width: `${sede.porcentaje}%` }}
                    />
                  </div>
                  <span className="text-right text-xs tabular-nums text-ink-faint">
                    {sede.unidades.toLocaleString("es-CO")} u
                  </span>
                </div>
              ))}
            </div>

            <h3 className="mb-3 text-[13px] font-medium text-ink-dim">Productos con stock bajo</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse">
                <thead>
                  <tr>
                    {["Producto", "Sede", "Cantidad", "Mínimo", "Estado"].map((h) => (
                      <th
                        key={h}
                        className="border-b border-line pb-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-ink-faint"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTOS_BAJOS.map((p) => (
                    <tr key={p.sku}>
                      <td className="border-b border-line py-3">
                        <div className="text-sm font-medium">{p.nombre}</div>
                        <div className="text-[11.5px] text-ink-faint">{p.sku}</div>
                      </td>
                      <td className="border-b border-line py-3 text-sm text-ink-dim">{p.sede}</td>
                      <td className="border-b border-line py-3 text-sm">{p.cantidad}</td>
                      <td className="border-b border-line py-3 text-sm text-ink-dim">{p.minimo}</td>
                      <td className="border-b border-line py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current ${
                            p.estado === "bajo" ? "bg-warning-dim text-warning" : "bg-danger-dim text-danger"
                          }`}
                        >
                          {p.estado === "bajo" ? "Bajo" : "Agotado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-surface p-5">
            <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-accent/35 blur-[50px]" />

            <div className="relative mb-4">
              <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-accent-dim px-2.5 py-1 text-[11px] font-semibold text-accent-light">
                <Sparkles className="h-3 w-3" />
                Agente IA
              </span>
              <h2 className="text-base font-semibold">Recomendaciones de hoy</h2>
              <p className="text-xs text-ink-dim">Basado en predicción de demanda y stock por sede</p>
            </div>

            <div className="relative flex flex-col gap-2.5">
              {RECOMENDACIONES.map((rec, i) => {
                const Icon = rec.icon
                return (
                  <div key={i} className="rounded-[11px] border border-line bg-surface-2 p-3.5">
                    <div className="mb-2.5 flex items-start gap-2.5">
                      <div className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[7px] bg-accent-dim text-accent-light">
                        <Icon className="h-[13px] w-[13px]" />
                      </div>
                      <p className="text-[12.5px] leading-relaxed">{rec.texto}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-ink-faint">
                        Confianza <b className="font-semibold text-ink-dim">{rec.confianza}%</b>
                      </span>
                      <button className="rounded-lg border border-accent/35 px-2.5 py-1.5 text-[11.5px] font-semibold text-accent-light hover:bg-accent-dim">
                        {rec.accion}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="relative mt-3.5 border-t border-line pt-3.5 text-[11px] text-ink-faint">
              Actualizado hace 6 minutos · próximo recálculo en 54 min
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

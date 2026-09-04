import { useEffect, useState } from "react"
import { ArrowUpRight, CheckCircle2, type LucideIcon } from "lucide-react"

interface KpiCardProps {
  label: string
  value: number
  delta: string
  tone: "up" | "warn" | "ok"
  icon: LucideIcon
  iconTone: "blue" | "green" | "amber"
}

const ICON_TONE: Record<KpiCardProps["iconTone"], string> = {
  blue: "bg-accent-dim text-accent-light",
  green: "bg-success-dim text-success",
  amber: "bg-warning-dim text-warning",
}

export function KpiCard({ label, value, delta, tone, icon: Icon, iconTone }: KpiCardProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start: number | null = null
    const duration = 900
    let frame: number

    function step(ts: number) {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-xs text-ink-dim">{label}</span>
        <div className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg ${ICON_TONE[iconTone]}`}>
          <Icon className="h-[15px] w-[15px]" />
        </div>
      </div>
      <div className="font-display mb-1 text-2xl font-semibold">{display.toLocaleString("es-CO")}</div>
      <div
        className={`flex items-center gap-1 text-xs ${
          tone === "up" ? "text-success" : tone === "warn" ? "text-warning" : "text-ink-dim"
        }`}
      >
        {tone === "up" && <ArrowUpRight className="h-3 w-3" />}
        {tone === "ok" && <CheckCircle2 className="h-3 w-3" />}
        {delta}
      </div>
    </div>
  )
}

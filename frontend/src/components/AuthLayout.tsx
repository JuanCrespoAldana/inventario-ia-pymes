import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Boxes } from "lucide-react"

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg px-4 py-10">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/25 blur-[110px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-gradient-to-br from-accent to-[#2A3FCB] shadow-[0_0_28px_rgba(76,111,255,0.45)]">
            <Boxes className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink-dim">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-7 shadow-2xl shadow-black/40">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

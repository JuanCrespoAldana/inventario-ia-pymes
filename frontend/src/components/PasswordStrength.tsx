import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

const REGLAS = [
  { id: "len", label: "Al menos 8 caracteres", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "Una letra mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "Una letra minúscula", test: (v: string) => /[a-z]/.test(v) },
  { id: "num", label: "Un número", test: (v: string) => /\d/.test(v) },
  {
    id: "symbol",
    label: "Un carácter especial",
    test: (v: string) => /[!@#$%^&*(),.?":{}|<>_-]/.test(v),
  },
]

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null

  return (
    <div className="mb-4 -mt-2 grid grid-cols-1 gap-1.5 rounded-lg border border-line bg-surface-2 p-3 sm:grid-cols-2">
      {REGLAS.map((regla) => {
        const cumple = regla.test(value)
        return (
          <div key={regla.id} className="flex items-center gap-1.5 text-xs">
            <motion.span
              animate={{
                backgroundColor: cumple ? "var(--color-success)" : "transparent",
                borderColor: cumple ? "var(--color-success)" : "var(--color-line-strong)",
              }}
              transition={{ duration: 0.2 }}
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full border"
            >
              {cumple ? (
                <Check className="h-2.5 w-2.5 text-bg" strokeWidth={3.5} />
              ) : (
                <X className="h-2 w-2 text-ink-faint" strokeWidth={3} />
              )}
            </motion.span>
            <span className={cumple ? "text-ink-dim" : "text-ink-faint"}>{regla.label}</span>
          </div>
        )
      })}
    </div>
  )
}

import { forwardRef, useState, type InputHTMLAttributes } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  isPassword?: boolean
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, isPassword, type, ...props },
  ref
) {
  const [mostrar, setMostrar] = useState(false)
  const inputType = isPassword ? (mostrar ? "text" : "password") : type

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-medium text-ink-dim">{label}</label>
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={`w-full rounded-lg border bg-surface-2 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent ${
            error ? "border-danger" : "border-line-strong"
          } ${isPassword ? "pr-10" : ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setMostrar((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-dim"
          >
            {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="text-xs text-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})

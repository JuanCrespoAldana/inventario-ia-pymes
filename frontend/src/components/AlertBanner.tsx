import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function AlertBanner({ type, message }: { type: "error" | "success"; message: string }) {
  const isError = type === "error"
  return (
    <motion.div
      initial={isError ? { x: 0 } : { opacity: 0, y: -8 }}
      animate={isError ? { x: [0, -6, 6, -4, 4, 0] } : { opacity: 1, y: 0 }}
      transition={isError ? { duration: 0.4 } : { duration: 0.3 }}
      className={`mb-4 flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm ${
        isError ? "border-danger/30 bg-danger-dim text-danger" : "border-success/30 bg-success-dim text-success"
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      <span>{message}</span>
    </motion.div>
  )
}

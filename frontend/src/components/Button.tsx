import type { ButtonHTMLAttributes } from "react"
import { Loader2 } from "lucide-react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export function Button({ loading, children, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3D5CE6] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

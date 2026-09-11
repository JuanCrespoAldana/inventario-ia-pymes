import { useRef, type ClipboardEvent, type KeyboardEvent } from "react"

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  error?: string
  disabled?: boolean
}

export function CodeInput({ value, onChange, length = 6, error, disabled }: CodeInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const digitos = value.split("").concat(Array(length).fill("")).slice(0, length)

  function actualizar(nuevosDigitos: string[]) {
    onChange(nuevosDigitos.join("").slice(0, length))
  }

  function handleChange(index: number, raw: string) {
    const digito = raw.replace(/\D/g, "").slice(-1)
    const nuevos = [...digitos]
    nuevos[index] = digito
    actualizar(nuevos)

    if (digito && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digitos[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pegado = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (!pegado) return
    actualizar(pegado.split("").concat(Array(length).fill("")).slice(0, length))
    const ultimo = Math.min(pegado.length, length) - 1
    inputsRef.current[Math.max(ultimo, 0)]?.focus()
  }

  return (
    <div>
      <div className="mb-1.5 flex justify-center gap-2.5">
        {digitos.map((digito, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digito}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`h-14 w-11 rounded-lg border bg-surface-2 text-center font-display text-2xl font-semibold
              text-ink outline-none transition-colors focus:border-accent disabled:opacity-50
              ${error ? "border-danger" : "border-line-strong"}`}
          />
        ))}
      </div>
      {error && <p className="text-center text-xs text-danger">{error}</p>}
    </div>
  )
}

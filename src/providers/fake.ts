import type { Oraculum, Responsum, Rogatio, ValorCrudus } from "@/providers/types"

export interface OptionesFicti {
  defectus?: (rogatio: Rogatio) => boolean
  responsa?: Record<string, ValorCrudus>
}

export class OraculumFictum implements Oraculum {
  vocationes = 0
  ultimaRogatio: Rogatio | null = null

  constructor(private readonly optiones: OptionesFicti = {}) {}

  async divina(rogatio: Rogatio): Promise<Responsum> {
    this.vocationes++
    this.ultimaRogatio = rogatio
    if (this.optiones.defectus?.(rogatio)) {
      return { ratum: false, causa: "RECUSATIO" }
    }
    const canned = this.optiones.responsa?.[rogatio.genusOperationis]
    if (canned !== undefined) {
      return { ratum: true, valor: canned }
    }
    return { ratum: true, valor: this.coniecta(rogatio) }
  }

  private coniecta(r: Rogatio): ValorCrudus {
    const op = r.genusOperationis
    if (r.operandi.length === 2) {
      const a = deserva(r.operandi[0]!.praevisio)
      const b = deserva(r.operandi[1]!.praevisio)
      const conclusio = this.binaria(op, a, b)
      if (conclusio !== undefined) return conclusio
    }
    if (r.instructio !== undefined) return r.instructio
    return r.operandi.map((o) => o.praevisio).join(" ")
  }

  private binaria(op: string, a: ValorCrudus | undefined, b: ValorCrudus | undefined): ValorCrudus | undefined {
    if (a === undefined || b === undefined) return undefined
    if (typeof a === "number" && typeof b === "number") {
      switch (op) {
        case "+":
          return a + b
        case "-":
          return a - b
        case "*":
          return a * b
        case "/":
          return a / b
        case "%":
          return a % b
        case "^":
          return a ** b
        case "==":
          return a === b
        case "!=":
          return a !== b
        case "<":
          return a < b
        case ">":
          return a > b
        case "<=":
          return a <= b
        case ">=":
          return a >= b
      }
    }
    if (op === "+" && (typeof a === "string" || typeof b === "string")) {
      return String(a) + String(b)
    }
    if (op === "==") return a === b
    if (op === "!=") return a !== b
    return undefined
  }
}

function deserva(praevisio: string): ValorCrudus | undefined {
  if (praevisio === "yes") return true
  if (praevisio === "no") return false
  const n = Number(praevisio)
  if (praevisio.trim() !== "" && !Number.isNaN(n)) return n
  try {
    const p: unknown = JSON.parse(praevisio)
    if (typeof p === "string") return p
  } catch {
    return undefined
  }
  return undefined
}

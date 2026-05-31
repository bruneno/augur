import type { SummariumOperandi, ValorCrudus } from "@/providers/types"
import { creaAgmen, creaNumerus, creaTabula, creaTextus, creaVeritas, NIHIL, praevisio, type Valor } from "@/interpreter/values"

export function coerce(c: ValorCrudus | null | undefined): Valor {
  if (c === null || c === undefined) return NIHIL
  if (typeof c === "number") return creaNumerus(c)
  if (typeof c === "boolean") return creaVeritas(c)
  if (typeof c === "string") return creaTextus(c)
  if (Array.isArray(c)) return creaAgmen(c.map(coerce))
  const tabula = new Map<string, Valor>()
  for (const [clavis, valor] of Object.entries(c)) tabula.set(clavis, coerce(valor))
  return creaTabula(tabula)
}

export function summa(v: Valor): SummariumOperandi {
  return { genus: v.genus, praevisio: praevisio(v) }
}

export function estVerumCrudus(c: ValorCrudus): boolean {
  if (typeof c === "boolean") return c
  if (typeof c === "number") return c !== 0
  if (typeof c === "string") return c === "yes" || c === "true" || (c !== "no" && c !== "false" && c.length > 0)
  if (Array.isArray(c)) return c.length > 0
  return Object.keys(c).length > 0
}

import type { Consumptio, Responsum, Rogatio, ValorCrudus } from "@/providers/types"

export const INSTRUCTIO_SYSTEMATIS =
  "You are the oracle of Augur, a programming language whose operations are divined rather than computed. " +
  "You receive an operation and its operands and must return the single most fitting result value. " +
  "At normal temperature be plausible and correct; at high temperature be wild, surprising, and irreverent. " +
  "Return only the result value, nothing else."

export function construePrompt(rogatio: Rogatio): string {
  const partes: string[] = []
  if (rogatio.contextus.length > 0) {
    partes.push("Context notes:\n" + rogatio.contextus.map((n) => `- ${n}`).join("\n"))
  }
  partes.push(`Operation: ${rogatio.genusOperationis}`)
  if (rogatio.instructio) partes.push(`Instruction: ${rogatio.instructio}`)
  if (rogatio.operandi.length > 0) {
    partes.push(
      "Operands:\n" + rogatio.operandi.map((o, i) => `  [${i}] (${o.genus}) ${o.praevisio}`).join("\n"),
    )
  }
  if (rogatio.genusExpectatum) partes.push(`Expected result kind: ${rogatio.genusExpectatum}`)
  return partes.join("\n\n")
}

export function restringeTemperaturam(temperatura: number, maxima: number): number {
  return Math.min(maxima, Math.max(0, temperatura))
}

export function extraheValorem(textus: string | null | undefined, consumptio: Consumptio): Responsum {
  if (!textus) return { ratum: false, causa: "LECTIO_FALLAX", consumptio }
  let datum: unknown
  try {
    datum = JSON.parse(textus)
  } catch {
    return { ratum: false, causa: "LECTIO_FALLAX", consumptio }
  }
  if (datum && typeof datum === "object" && "value" in datum) {
    const valor = (datum as { value?: ValorCrudus }).value
    if (valor !== undefined && valor !== null) return { ratum: true, valor, consumptio }
  }
  return { ratum: false, causa: "LECTIO_FALLAX", consumptio }
}

import { describe, expect, it } from "vitest"
import { OraculumFictum } from "@/providers/fake"
import type { Rogatio, SummariumOperandi } from "@/providers/types"

function rogatio(op: string, ...praevisiones: string[]): Rogatio {
  const operandi: SummariumOperandi[] = praevisiones.map((praevisio) => ({ genus: "numerus", praevisio }))
  return { genusOperationis: op, operandi, temperatura: 0, contextus: [] }
}

describe("OraculumFictum", () => {
  it("does real arithmetic from operand previews", async () => {
    const o = new OraculumFictum()
    await expect(o.divina(rogatio("+", "2", "2"))).resolves.toEqual({ ratum: true, valor: 4 })
    await expect(o.divina(rogatio("*", "6", "7"))).resolves.toEqual({ ratum: true, valor: 42 })
  })

  it("evaluates comparisons deterministically", async () => {
    const o = new OraculumFictum()
    await expect(o.divina(rogatio("<", "2", "5"))).resolves.toEqual({ ratum: true, valor: true })
    await expect(o.divina(rogatio("==", "3", "4"))).resolves.toEqual({ ratum: true, valor: false })
  })

  it("concatenates strings for +", async () => {
    const o = new OraculumFictum()
    const r = await o.divina(rogatio("+", '"a"', '"b"'))
    expect(r).toEqual({ ratum: true, valor: "ab" })
  })

  it("can be configured to refuse", async () => {
    const o = new OraculumFictum({ defectus: () => true })
    await expect(o.divina(rogatio("+", "2", "2"))).resolves.toEqual({ ratum: false, causa: "RECUSATIO" })
  })

  it("returns canned answers by operation", async () => {
    const o = new OraculumFictum({ responsa: { secret: 42 } })
    const r = await o.divina({ genusOperationis: "secret", operandi: [], temperatura: 0, contextus: [] })
    expect(r).toEqual({ ratum: true, valor: 42 })
  })

  it("tracks calls and the last request", async () => {
    const o = new OraculumFictum()
    await o.divina(rogatio("+", "1", "1"))
    await o.divina(rogatio("+", "2", "2"))
    expect(o.vocationes).toBe(2)
    expect(o.ultimaRogatio?.genusOperationis).toBe("+")
  })
})

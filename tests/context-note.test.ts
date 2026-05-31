import { describe, expect, it } from "vitest"
import { Aestimator } from "@/interpreter/interpreter"
import type { Oraculum, Rogatio } from "@/providers/types"
import { analyza } from "@/parser/parser"

describe("context notes", () => {
  it("flows a /// note into the divination request of ops in the next statement", async () => {
    const captum: { r: Rogatio | null } = { r: null }
    const oraculum: Oraculum = {
      async divina(r) {
        captum.r = r
        return { ratum: true, valor: 4 }
      },
    }
    await new Aestimator({
      scaena: { proclama: () => {}, susurra: () => {} },
      oraculum,
    }).curre(analyza("/// be precise\nsummon x = 2 + 2"))
    expect(captum.r?.contextus).toContain("be precise")
  })

  it("clears notes once the statement completes", async () => {
    const vistae: string[][] = []
    const oraculum: Oraculum = {
      async divina(r) {
        vistae.push(r.contextus)
        return { ratum: true, valor: 0 }
      },
    }
    await new Aestimator({
      scaena: { proclama: () => {}, susurra: () => {} },
      oraculum,
    }).curre(analyza("/// note\nsummon a = 1 + 1\nsummon b = 2 + 2"))
    expect(vistae[0]).toContain("note")
    expect(vistae[1]).toEqual([])
  })
})

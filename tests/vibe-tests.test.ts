import { describe, expect, it } from "vitest"
import { ErratumOraculi } from "@/errors"
import { Aestimator, type Scaena } from "@/interpreter/interpreter"
import { OraculumFictum } from "@/providers/fake"
import type { Oraculum } from "@/providers/types"
import { analyza } from "@/parser/parser"

async function curreCum(fons: string, oraculum: Oraculum): Promise<void> {
  const scaena: Scaena = { proclama: () => {}, susurra: () => {} }
  await new Aestimator({ scaena, oraculum }).curre(analyza(fons))
}

const iudex: Oraculum = {
  async divina(r) {
    if (r.genusOperationis === "believe") {
      return { ratum: true, valor: Number(r.operandi[0]?.praevisio) > 0 }
    }
    return { ratum: true, valor: 0 }
  },
}

describe("semantic believe (vibe-tests)", () => {
  it("passes when the oracle judges the claim true", async () => {
    await expect(curreCum('believe 5 is "a positive number"', iudex)).resolves.toBeUndefined()
  })

  it("raises ErratumOraculi when the oracle judges the claim false", async () => {
    await expect(curreCum('believe -5 is "a positive number"', iudex)).rejects.toBeInstanceOf(ErratumOraculi)
  })

  it("puts the description in the error message", async () => {
    await expect(curreCum('believe -5 is "a positive number"', iudex)).rejects.toThrow("a positive number")
  })

  it("falls back to native truthiness inside certain", async () => {
    const fictum = new OraculumFictum()
    await expect(curreCum('certain { believe 1 is "anything" }', fictum)).resolves.toBeUndefined()
    await expect(curreCum('certain { believe 0 is "anything" }', fictum)).rejects.toBeInstanceOf(ErratumOraculi)
    expect(fictum.vocationes).toBe(0)
  })
})

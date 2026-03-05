import { describe, expect, it } from "vitest"
import { ErratumAerarii, ErratumOraculi } from "../src/errors"
import { Aestimator, type Scaena } from "../src/interpreter/interpreter"
import { Aerarium } from "../src/providers/budget"
import { OraculumFictum } from "../src/providers/fake"
import type { Oraculum } from "../src/providers/types"
import { analyza } from "../src/parser/parser"

async function curre(fons: string, oraculum: Oraculum = new OraculumFictum()): Promise<string[]> {
  const lineae: string[] = []
  const scaena: Scaena = { proclama: (l) => lineae.push(l), susurra: () => {} }
  await new Aestimator({ scaena, oraculum }).curre(analyza(fons))
  return lineae
}

describe("believe", () => {
  it("passes a true belief and keeps going", async () => {
    expect(await curre("believe yes\nproclaim 1")).toEqual(["1"])
  })

  it("raises ErratumOraculi on a false belief", async () => {
    await expect(curre("believe no")).rejects.toBeInstanceOf(ErratumOraculi)
  })

  it("uses the default disagreement message", async () => {
    await expect(curre("believe no")).rejects.toThrow("The oracle disagrees")
  })

  it("includes the reason from because", async () => {
    await expect(curre('believe no because "the sky is green"')).rejects.toThrow("the sky is green")
  })
})

describe("attempt / rescue", () => {
  it("rescues a false belief", async () => {
    expect(await curre('attempt { believe no } rescue { proclaim "caught" }')).toEqual(["caught"])
  })

  it("rescues a runtime error and binds it", async () => {
    expect(await curre('attempt { proclaim missing } rescue as e { proclaim "caught" }')).toEqual(["caught"])
  })

  it("lets give escape an attempt back to the ritual", async () => {
    const fons = `
      ritual f() { attempt { give 7 } rescue { give 0 } }
      proclaim f()
    `
    expect(await curre(fons)).toEqual(["7"])
  })

  it("lets break escape an attempt to the enclosing loop", async () => {
    const fons = `
      summon n = 0
      while n < 5 {
        n = n + 1
        attempt { when n == 3 -> break } rescue { proclaim "r" }
      }
      proclaim n
    `
    expect(await curre(fons)).toEqual(["3"])
  })

  it("does not swallow a budget error inside an attempt", async () => {
    const aerarium = new Aerarium(new OraculumFictum(), 0)
    await expect(
      curre('attempt { proclaim 1 + 1 } rescue { proclaim "caught" }', aerarium),
    ).rejects.toBeInstanceOf(ErratumAerarii)
  })
})

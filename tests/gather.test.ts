import { describe, expect, it } from "vitest"
import { Aestimator, type Scaena } from "../src/interpreter/interpreter"
import type { Oraculum, Responsum, Rogatio } from "../src/providers/types"
import { analyza } from "../src/parser/parser"

async function curreCum(fons: string, oraculum: Oraculum): Promise<string[]> {
  const lineae: string[] = []
  const scaena: Scaena = { proclama: (l) => lineae.push(l), susurra: () => {} }
  await new Aestimator({ scaena, oraculum }).curre(analyza(fons))
  return lineae
}

function oraculumExpressum(fn: (r: Rogatio) => Responsum): { o: Oraculum; vocationes: () => number } {
  let n = 0
  return {
    o: {
      async divina(r) {
        n += 1
        return fn(r)
      },
    },
    vocationes: () => n,
  }
}

const mora = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe("gather", () => {
  it("runs a bracketed list of divinations in parallel and keeps order", async () => {
    const { o, vocationes } = oraculumExpressum((r) => ({ ratum: true, valor: r.instructio ?? "" }))
    expect(await curreCum('proclaim gather [divine "a", divine "b", divine "c"]', o)).toEqual(["[a, b, c]"])
    expect(vocationes()).toBe(3)
  })

  it("parallelizes a map and preserves input order despite out-of-order resolution", async () => {
    let n = 0
    const o: Oraculum = {
      async divina(r) {
        n += 1
        const x = Number(r.operandi[0]?.praevisio)
        await mora(x === 1 ? 20 : 1)
        return { ratum: true, valor: x * 2 }
      },
    }
    const lineae = await curreCum('proclaim gather map [1, 2, 3] with "double"', o)
    expect(lineae).toEqual(["[2, 4, 6]"])
    expect(n).toBe(3)
  })

  it("is a no-op on a non-collection subject", async () => {
    const { o } = oraculumExpressum(() => ({ ratum: true, valor: 0 }))
    expect(await curreCum("proclaim gather 5", o)).toEqual(["5"])
  })
})

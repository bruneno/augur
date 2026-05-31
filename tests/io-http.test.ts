import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Aestimator, type Scaena } from "@/interpreter/interpreter"
import { OraculumFictum } from "@/providers/fake"
import type { Oraculum, Responsum, Rogatio } from "@/providers/types"
import { analyza } from "@/parser/parser"

function scaenaCapiens(): { scaena: Scaena; lineae: string[] } {
  const lineae: string[] = []
  return { lineae, scaena: { proclama: (l) => lineae.push(l), susurra: () => {} } }
}

async function curreCum(fons: string, oraculum: Oraculum): Promise<string[]> {
  const { scaena, lineae } = scaenaCapiens()
  await new Aestimator({ scaena, oraculum }).curre(analyza(fons))
  return lineae
}

function oraculumExpressum(fn: (r: Rogatio) => Responsum): Oraculum {
  return { async divina(r) { return fn(r) } }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("fetch", () => {
  it("hallucinates a response outside certain", async () => {
    const o = oraculumExpressum(() => ({ ratum: true, valor: { status: 200, body: "hi" } }))
    const out = await curreCum('summon r = fetch "http://x"\nproclaim r', o)
    expect(out[0]).toContain("200")
    expect(out[0]).toContain("hi")
  })

  it("makes a real request inside certain", async () => {
    const fictum = new OraculumFictum()
    vi.stubGlobal("fetch", async () => new Response("real body", { status: 201 }))
    const out = await curreCum('certain { summon r = fetch "http://x"\nproclaim r }', fictum)
    expect(out[0]).toContain("201")
    expect(out[0]).toContain("real body")
    expect(fictum.vocationes).toBe(0)
  })
})

describe("file io", () => {
  it("writes then reads a file natively", async () => {
    const dir = mkdtempSync(join(tmpdir(), "augur-"))
    const file = join(dir, "note.txt")
    const fictum = new OraculumFictum()
    const out = await curreCum(`write "hello world" to "${file}"\nproclaim read "${file}"`, fictum)
    expect(out).toEqual(["hello world"])
  })
})

describe("ask", () => {
  it("reads input through the injected prompt", async () => {
    const { scaena, lineae } = scaenaCapiens()
    const aest = new Aestimator({ scaena, oraculum: new OraculumFictum(), roga: async () => "Bruno" })
    await aest.curre(analyza('summon name = ask "who?"\nproclaim name'))
    expect(lineae).toEqual(["Bruno"])
  })
})

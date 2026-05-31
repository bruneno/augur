import { describe, expect, it } from "vitest"
import { computaPretiumBRL, summariumPretii } from "@/cost"

describe("cost", () => {
  it("computes BRL cost for the haiku model", () => {
    const brl = computaPretiumBRL({ signaImmissa: 1_000_000, signaEmissa: 1_000_000 }, "claude-haiku-4-5")
    expect(brl).toBeCloseTo((1 + 5) * 5.0, 5)
  })

  it("is free for the fake oracle", () => {
    expect(computaPretiumBRL({ signaImmissa: 1000, signaEmissa: 1000 }, "fake")).toBe(0)
  })

  it("summarizes the spend with count and model", () => {
    const s = summariumPretii(2, { signaImmissa: 0, signaEmissa: 0 }, "fake")
    expect(s).toContain("2 divination")
    expect(s).toContain("fake")
  })
})

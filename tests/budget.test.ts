import { describe, expect, it } from "vitest"
import { ErratumAerarii } from "@/errors"
import { Aerarium } from "@/providers/budget"
import { OraculumFictum } from "@/providers/fake"
import type { Rogatio } from "@/providers/types"

const rog: Rogatio = { genusOperationis: "+", operandi: [], temperatura: 0, contextus: [] }

describe("Aerarium", () => {
  it("allows exactly the ceiling number of calls", async () => {
    const aerarium = new Aerarium(new OraculumFictum(), 3)
    await aerarium.divina(rog)
    await aerarium.divina(rog)
    await aerarium.divina(rog)
    expect(aerarium.vocationes).toBe(3)
  })

  it("throws ErratumAerarii on the call past the ceiling", async () => {
    const aerarium = new Aerarium(new OraculumFictum(), 2)
    await aerarium.divina(rog)
    await aerarium.divina(rog)
    await expect(aerarium.divina(rog)).rejects.toBeInstanceOf(ErratumAerarii)
  })

  it("counts only calls that pass through it once", async () => {
    const fictum = new OraculumFictum()
    const aerarium = new Aerarium(fictum, 5)
    await aerarium.divina(rog)
    expect(aerarium.vocationes).toBe(1)
    expect(fictum.vocationes).toBe(1)
  })
})

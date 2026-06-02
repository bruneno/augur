import { describe, expect, it } from "vitest"
import { ErratumAerarii } from "@/errors"
import { Aerarium } from "@/providers/budget"
import { OraculumFictum } from "@/providers/fake"
import type { Oraculum, Responsum, Rogatio } from "@/providers/types"

const rog: Rogatio = { genusOperationis: "+", operandi: [], temperatura: 0, contextus: [] }

class OraculumScriptum implements Oraculum {
  private index = 0
  constructor(private readonly responsa: Responsum[]) {}
  async divina(_rogatio: Rogatio): Promise<Responsum> {
    const responsum = this.responsa[this.index] ?? this.responsa[this.responsa.length - 1]
    this.index++
    if (!responsum) throw new Error("no scripted response")
    return responsum
  }
}

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

  it("sums signaImmissa and signaEmissa across several divina calls", async () => {
    const interior = new OraculumScriptum([
      { ratum: true, valor: 1, consumptio: { signaImmissa: 10, signaEmissa: 3 } },
      { ratum: true, valor: 2, consumptio: { signaImmissa: 20, signaEmissa: 7 } },
      { ratum: false, causa: "ERROR_ORACULI", consumptio: { signaImmissa: 5, signaEmissa: 1 } },
    ])
    const aerarium = new Aerarium(interior, 10)
    await aerarium.divina(rog)
    await aerarium.divina(rog)
    await aerarium.divina(rog)
    expect(aerarium.consumptio).toEqual({ signaImmissa: 35, signaEmissa: 11 })
  })

  it("preserves running totals when a response has no consumptio field", async () => {
    const interior = new OraculumScriptum([
      { ratum: true, valor: 1, consumptio: { signaImmissa: 8, signaEmissa: 4 } },
      { ratum: true, valor: 2 },
      { ratum: true, valor: 3, consumptio: { signaImmissa: 2, signaEmissa: 6 } },
    ])
    const aerarium = new Aerarium(interior, 10)
    await aerarium.divina(rog)
    await aerarium.divina(rog)
    expect(aerarium.consumptio).toEqual({ signaImmissa: 8, signaEmissa: 4 })
    await aerarium.divina(rog)
    expect(aerarium.consumptio).toEqual({ signaImmissa: 10, signaEmissa: 10 })
  })

  it("returns a defensive copy that cannot mutate internal totals", async () => {
    const interior = new OraculumScriptum([
      { ratum: true, valor: 1, consumptio: { signaImmissa: 12, signaEmissa: 9 } },
    ])
    const aerarium = new Aerarium(interior, 10)
    await aerarium.divina(rog)
    const snapshot = aerarium.consumptio
    snapshot.signaImmissa = 999
    snapshot.signaEmissa = 999
    expect(aerarium.consumptio).toEqual({ signaImmissa: 12, signaEmissa: 9 })
  })
})

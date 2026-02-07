import { ErratumAerarii } from "../errors"
import type { Oraculum, Responsum, Rogatio } from "./types"

export class Aerarium implements Oraculum {
  private numerus = 0

  constructor(
    private readonly interior: Oraculum,
    private readonly limen: number,
  ) {}

  get vocationes(): number {
    return this.numerus
  }

  async divina(rogatio: Rogatio): Promise<Responsum> {
    if (this.numerus >= this.limen) throw new ErratumAerarii(this.limen)
    this.numerus++
    return await this.interior.divina(rogatio)
  }
}

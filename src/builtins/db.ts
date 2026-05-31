import { coerce } from "@/interpreter/coercio"
import { temperaturaPro } from "@/interpreter/zones"
import { creaAgmen, creaTabula, fingeOraculum, repraesenta, type Valor } from "@/interpreter/values"
import type { Rogatio } from "@/providers/types"
import { creaMotor, jsonAdValor, type MotorBasis, valorAdJson } from "@/builtins/db-motores"
import type { ContextusNativus } from "@/builtins/types"

export class Bancus {
  private readonly annales: string[] = []
  private approxSigna = 0
  private readonly collectiones = new Set<string>()
  private motor: MotorBasis | null = null

  constructor(
    readonly locus: string,
    private readonly spatiumMemoriae: number,
  ) {}

  private adde(linea: string): void {
    this.annales.push(linea)
    this.approxSigna += signa(linea)
    while (this.approxSigna > this.spatiumMemoriae && this.annales.length > 1) {
      const remota = this.annales.shift()
      if (remota !== undefined) this.approxSigna -= signa(remota)
    }
  }

  blob(): string {
    return this.annales.join("\n")
  }

  async inscribe(ctx: ContextusNativus, datum: Valor, collectio: string): Promise<void> {
    this.collectiones.add(collectio)
    if (ctx.zona.genus === "Certus") {
      try {
        await this.machina().insere(collectio, valorAdJson(datum))
      } catch {
        // a failed write degrades the matching read to an oracle value; it must
        // not poison reads of other collections, so nothing is cached here
      }
      return
    }
    this.adde(`INSCRIBE into ${collectio}: ${repraesenta(datum)}`)
  }

  recense(scopus: Valor, instructio: string): void {
    this.adde(`REVISE ${repraesenta(scopus)}: ${instructio}`)
  }

  expelle(descriptio: string, collectio: string): void {
    this.adde(`BANISH from ${collectio} where ${descriptio}`)
  }

  async memora(ctx: ContextusNativus, descriptio: string, collectio: string): Promise<Valor> {
    if (ctx.zona.genus === "Certus") return await this.legeReale(collectio)
    return await this.divinaLecturam(ctx, `recall ${descriptio} from ${collectio}`)
  }

  async interroga(ctx: ContextusNativus, interrogatio: string): Promise<Valor> {
    if (ctx.zona.genus === "Certus") return await this.interrogaReale()
    return await this.divinaLecturam(ctx, interrogatio)
  }

  private async divinaLecturam(ctx: ContextusNativus, quaestio: string): Promise<Valor> {
    const rogatio: Rogatio = {
      genusOperationis: "db",
      operandi: [{ genus: "textus", praevisio: this.blob() }],
      instructio: `Given this ledger of all past events, answer: ${quaestio}`,
      temperatura: temperaturaPro(ctx.zona, ctx.temperaturaDivina),
      contextus: ctx.contextus,
    }
    const responsum = await ctx.oraculum.divina(rogatio)
    if (!responsum.ratum) return fingeOraculum(responsum.causa)
    return coerce(responsum.valor)
  }

  private machina(): MotorBasis {
    if (this.motor === null) this.motor = creaMotor(this.locus)
    return this.motor
  }

  private async legeReale(collectio: string): Promise<Valor> {
    try {
      const ordines = await this.machina().lege(collectio)
      return creaAgmen(ordines.map(jsonAdValor))
    } catch (err) {
      return fingeOraculum("ERROR_ORACULI", err instanceof Error ? err.message : String(err))
    }
  }

  private async interrogaReale(): Promise<Valor> {
    try {
      const omnia = await this.machina().legeOmnia(this.collectiones)
      const tabula = new Map<string, Valor>()
      for (const { collectio, ordines } of omnia) {
        tabula.set(collectio, creaAgmen(ordines.map(jsonAdValor)))
      }
      return creaTabula(tabula)
    } catch (err) {
      return fingeOraculum("ERROR_ORACULI", err instanceof Error ? err.message : String(err))
    }
  }
}

function signa(linea: string): number {
  return Math.ceil(linea.length / 4)
}

export { jsonAdValor, valorAdJson }

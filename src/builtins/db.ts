import { coerce } from "../interpreter/coercio"
import { temperaturaPro } from "../interpreter/zones"
import {
  creaAgmen,
  creaNumerus,
  creaTabula,
  creaTextus,
  creaVeritas,
  fingeOraculum,
  NIHIL,
  repraesenta,
  type Valor,
} from "../interpreter/values"
import type { Rogatio } from "../providers/types"
import type { ContextusNativus } from "./types"

export class Bancus {
  private readonly annales: string[] = []
  private approxSigna = 0
  private readonly collectiones = new Set<string>()
  private sqlite: import("bun:sqlite").Database | null = null

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
      const db = await this.sqliteDb()
      db.run(`CREATE TABLE IF NOT EXISTS "${collectio}" (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)`)
      db.run(`INSERT INTO "${collectio}" (data) VALUES (?)`, [JSON.stringify(valorAdJson(datum))])
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

  private async sqliteDb(): Promise<import("bun:sqlite").Database> {
    if (this.sqlite === null) {
      const { Database } = await import("bun:sqlite")
      const semita = this.locus.startsWith("sqlite://") ? this.locus.slice("sqlite://".length) : ":memory:"
      this.sqlite = new Database(semita === "" ? ":memory:" : semita)
    }
    return this.sqlite
  }

  private async legeReale(collectio: string): Promise<Valor> {
    const db = await this.sqliteDb()
    db.run(`CREATE TABLE IF NOT EXISTS "${collectio}" (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)`)
    const ordines = db.query(`SELECT data FROM "${collectio}"`).all() as { data: string }[]
    return creaAgmen(ordines.map((o) => jsonAdValor(JSON.parse(o.data))))
  }

  private async interrogaReale(): Promise<Valor> {
    const tabula = new Map<string, Valor>()
    for (const collectio of this.collectiones) {
      tabula.set(collectio, await this.legeReale(collectio))
    }
    return creaTabula(tabula)
  }
}

function signa(linea: string): number {
  return Math.ceil(linea.length / 4)
}

function valorAdJson(v: Valor): unknown {
  switch (v.genus) {
    case "numerus":
      return v.numerus
    case "textus":
      return v.textus
    case "veritas":
      return v.veritas
    case "nihil":
      return null
    case "agmen":
      return v.elementa.map(valorAdJson)
    case "tabula":
      return Object.fromEntries([...v.tabula].map(([k, w]) => [k, valorAdJson(w)]))
    case "oraculum":
      return "<oracle>"
    case "ritus":
      return `<ritual ${v.nomen}>`
  }
}

function jsonAdValor(x: unknown): Valor {
  if (x === null) return NIHIL
  if (typeof x === "number") return creaNumerus(x)
  if (typeof x === "string") return creaTextus(x)
  if (typeof x === "boolean") return creaVeritas(x)
  if (Array.isArray(x)) return creaAgmen(x.map(jsonAdValor))
  if (typeof x === "object") {
    const tabula = new Map<string, Valor>()
    for (const [k, v] of Object.entries(x)) tabula.set(k, jsonAdValor(v))
    return creaTabula(tabula)
  }
  return NIHIL
}

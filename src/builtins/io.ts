import { readFileSync, writeFileSync } from "node:fs"
import { stdin, stdout } from "node:process"
import { ErratumExsecutionis } from "@/errors"
import { creaTextus, repraesenta, type Valor } from "@/interpreter/values"

export function lege(fasciculus: Valor): Valor {
  if (fasciculus.genus !== "textus") {
    throw new ErratumExsecutionis("read expects a filename string")
  }
  try {
    return creaTextus(readFileSync(fasciculus.textus, "utf8"))
  } catch (e) {
    throw new ErratumExsecutionis(`cannot read '${fasciculus.textus}': ${e instanceof Error ? e.message : String(e)}`)
  }
}

export function scribe(datum: Valor, fasciculus: Valor): void {
  if (fasciculus.genus !== "textus") {
    throw new ErratumExsecutionis("write expects a filename string")
  }
  try {
    writeFileSync(fasciculus.textus, repraesenta(datum))
  } catch (e) {
    throw new ErratumExsecutionis(`cannot write '${fasciculus.textus}': ${e instanceof Error ? e.message : String(e)}`)
  }
}

class Lineator {
  private copia = ""
  private lineae: string[] = []
  private petitiones: Array<(linea: string) => void> = []
  private finis = false
  private nexus = false

  private adnecte(): void {
    if (this.nexus) return
    this.nexus = true
    stdin.setEncoding("utf8")
    stdin.on("data", (datum: string) => this.accipe(datum))
    stdin.on("end", () => {
      this.finis = true
      this.exhauri()
    })
    stdin.resume()
  }

  private accipe(datum: string): void {
    this.copia += datum
    let pos = this.copia.indexOf("\n")
    while (pos >= 0) {
      let linea = this.copia.slice(0, pos)
      if (linea.endsWith("\r")) linea = linea.slice(0, -1)
      this.lineae.push(linea)
      this.copia = this.copia.slice(pos + 1)
      pos = this.copia.indexOf("\n")
    }
    this.exhauri()
  }

  private exhauri(): void {
    while (this.petitiones.length > 0 && this.lineae.length > 0) {
      const resolve = this.petitiones.shift()
      const linea = this.lineae.shift()
      if (resolve && linea !== undefined) resolve(linea)
    }
    if (!this.finis) return
    if (this.petitiones.length > 0 && this.copia.length > 0) {
      const resolve = this.petitiones.shift()
      const reliquum = this.copia
      this.copia = ""
      if (resolve) resolve(reliquum)
    }
    while (this.petitiones.length > 0) {
      const resolve = this.petitiones.shift()
      if (resolve) resolve("")
    }
  }

  roga(invitatio: string): Promise<string> {
    this.adnecte()
    stdout.write(invitatio)
    return new Promise<string>((resolve) => {
      this.petitiones.push(resolve)
      this.exhauri()
    })
  }

  claude(): void {
    if (!this.nexus) return
    stdin.removeAllListeners("data")
    stdin.removeAllListeners("end")
    stdin.pause()
    this.nexus = false
    this.finis = false
    this.copia = ""
    this.lineae = []
    this.petitiones = []
  }
}

let lineator: Lineator | null = null

export async function rogaConsola(invitatio: string): Promise<string> {
  if (!lineator) lineator = new Lineator()
  return lineator.roga(invitatio)
}

export function claudeInterrogatorem(): void {
  lineator?.claude()
  lineator = null
}

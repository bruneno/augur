import { readFileSync, writeFileSync } from "node:fs"
import { createInterface } from "node:readline/promises"
import { ErratumExsecutionis } from "../errors"
import { creaTextus, repraesenta, type Valor } from "../interpreter/values"

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

export async function rogaConsola(invitatio: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    return await rl.question(invitatio)
  } finally {
    rl.close()
  }
}

import { createInterface } from "node:readline/promises"
import { AugurErratum } from "@/errors"
import { Ambitus } from "@/interpreter/environment"
import { Aestimator } from "@/interpreter/interpreter"
import { analyza } from "@/parser/parser"

export async function incipeSessionem(aestimator: Aestimator): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const ambitus = new Ambitus()
  console.log("augur séance - type a line, or 'exit' to leave")
  try {
    for (;;) {
      const linea = (await rl.question("aug> ")).trim()
      if (linea === "exit" || linea === "quit") break
      if (linea === "") continue
      try {
        await aestimator.curre(analyza(linea), ambitus)
      } catch (e) {
        console.error(e instanceof AugurErratum ? e.message : e instanceof Error ? e.message : String(e))
      }
    }
  } finally {
    rl.close()
  }
}

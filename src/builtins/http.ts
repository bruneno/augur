import { coerce } from "../interpreter/coercio"
import { temperaturaPro } from "../interpreter/zones"
import { creaNumerus, creaTabula, creaTextus, fingeOraculum, type Valor } from "../interpreter/values"
import type { Rogatio } from "../providers/types"
import type { ContextusNativus } from "./types"

export async function affer(ctx: ContextusNativus, url: Valor, optiones: Valor | null): Promise<Valor> {
  if (url.genus !== "textus") return fingeOraculum("GENUS_DISCORS", "fetch expects a URL string")

  if (ctx.zona.genus === "Certus") {
    return await afferReale(url.textus, optiones)
  }

  const rogatio: Rogatio = {
    genusOperationis: "fetch",
    operandi: [{ genus: "textus", praevisio: JSON.stringify(url.textus) }],
    instructio: `hallucinate a plausible HTTP response (status, headers, body) for GET ${url.textus}`,
    temperatura: temperaturaPro(ctx.zona, ctx.temperaturaDivina),
    genusExpectatum: "tabula",
    contextus: ctx.contextus,
  }
  const responsum = await ctx.oraculum.divina(rogatio)
  if (!responsum.ratum) return fingeOraculum(responsum.causa)
  return coerce(responsum.valor)
}

async function afferReale(url: string, optiones: Valor | null): Promise<Valor> {
  const init: RequestInit = {}
  if (optiones && optiones.genus === "tabula") {
    const methodus = optiones.tabula.get("method")
    if (methodus && methodus.genus === "textus") init.method = methodus.textus
    const corpus = optiones.tabula.get("body")
    if (corpus && corpus.genus === "textus") init.body = corpus.textus
    const capita = optiones.tabula.get("headers")
    if (capita && capita.genus === "tabula") {
      const h: Record<string, string> = {}
      for (const [k, v] of capita.tabula) if (v.genus === "textus") h[k] = v.textus
      init.headers = h
    }
  }

  try {
    const responsio = await fetch(url, init)
    const corpus = await responsio.text()
    const capita = new Map<string, Valor>()
    responsio.headers.forEach((v, k) => capita.set(k, creaTextus(v)))
    return creaTabula(
      new Map<string, Valor>([
        ["status", creaNumerus(responsio.status)],
        ["headers", creaTabula(capita)],
        ["body", creaTextus(corpus)],
      ]),
    )
  } catch (e) {
    return fingeOraculum("ERROR_ORACULI", `real fetch failed: ${e instanceof Error ? e.message : String(e)}`)
  }
}

import type { Configuratio } from "@/config"
import { OraculumAnthropicum } from "@/providers/anthropic"
import { Aerarium, Diarium, OraculumIterans } from "@/providers/budget"
import { OraculumMemor } from "@/providers/cache"
import { OraculumFictum } from "@/providers/fake"
import { OraculumOllama } from "@/providers/ollama"
import { OraculumOpenAI } from "@/providers/openai"
import type { Oraculum } from "@/providers/types"

export interface OptionesCreandi {
  paranoicus?: boolean
}

export function creaOraculum(
  config: Configuratio,
  optiones: OptionesCreandi = {},
): { oraculum: Oraculum; aerarium: Aerarium } {
  const fundamentum = creaFundamentum(config)
  const interior = optiones.paranoicus ? new Diarium(fundamentum) : fundamentum
  const aerarium = new Aerarium(interior, config.aerarium)
  const iterans = config.conatus > 0 ? new OraculumIterans(aerarium, config.conatus) : aerarium
  const oraculum = config.memor ? new OraculumMemor(iterans, config.fasciculusMemoriae) : iterans
  return { oraculum, aerarium }
}

function creaFundamentum(config: Configuratio): Oraculum {
  switch (config.oraculum) {
    case "anthropic":
      return new OraculumAnthropicum(config.exemplar)
    case "openai":
      return new OraculumOpenAI(config.exemplar)
    case "openrouter":
      return new OraculumOpenAI(config.exemplar, 1024, {
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
      })
    case "ollama":
      return new OraculumOllama(config.exemplar)
    default:
      return new OraculumFictum()
  }
}

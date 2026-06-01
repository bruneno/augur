import OpenAI from "openai"
import { construePrompt, extraheValorem, INSTRUCTIO_SYSTEMATIS, restringeTemperaturam } from "@/providers/prompt"
import type { Oraculum, Responsum, Rogatio } from "@/providers/types"

export interface OptionesClavisOpenAI {
  baseURL?: string
  apiKey?: string
}

export class OraculumOpenAI implements Oraculum {
  private readonly clavis: OpenAI

  constructor(
    private readonly exemplar: string,
    private readonly maxSigna = 1024,
    clavisOptiones: OptionesClavisOpenAI = {},
  ) {
    this.clavis = new OpenAI(clavisOptiones)
  }

  async divina(rogatio: Rogatio): Promise<Responsum> {
    let responsio: OpenAI.Chat.Completions.ChatCompletion
    try {
      responsio = await this.clavis.chat.completions.create({
        model: this.exemplar,
        max_tokens: this.maxSigna,
        temperature: restringeTemperaturam(rogatio.temperatura, 2),
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${INSTRUCTIO_SYSTEMATIS} Respond ONLY with a JSON object of the form {"value": <result>}.`,
          },
          { role: "user", content: construePrompt(rogatio) },
        ],
      })
    } catch {
      return { ratum: false, causa: "ERROR_ORACULI" }
    }
    const consumptio = {
      signaImmissa: responsio.usage?.prompt_tokens ?? 0,
      signaEmissa: responsio.usage?.completion_tokens ?? 0,
    }
    return extraheValorem(responsio.choices[0]?.message.content, consumptio)
  }
}

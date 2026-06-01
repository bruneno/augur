import { type ChatResponse, Ollama } from "ollama"
import { construePrompt, extraheValorem, INSTRUCTIO_SYSTEMATIS, restringeTemperaturam } from "@/providers/prompt"
import type { Oraculum, Responsum, Rogatio } from "@/providers/types"

export class OraculumOllama implements Oraculum {
  private readonly clavis: Ollama

  constructor(
    private readonly exemplar: string,
    sedes: string = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434",
  ) {
    this.clavis = new Ollama({ host: sedes })
  }

  async divina(rogatio: Rogatio): Promise<Responsum> {
    let responsio: ChatResponse
    try {
      responsio = await this.clavis.chat({
        model: this.exemplar,
        format: "json",
        options: { temperature: restringeTemperaturam(rogatio.temperatura, 2) },
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
      signaImmissa: responsio.prompt_eval_count ?? 0,
      signaEmissa: responsio.eval_count ?? 0,
    }
    return extraheValorem(responsio.message.content, consumptio)
  }
}

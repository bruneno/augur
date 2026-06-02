import { describe, expect, it } from "vitest"
import {
  CONFIGURATIO_PRAEDEFINITA,
  componeConfigurationem,
  exemplarPraedefinitum,
  extraheCaput,
} from "@/config"
import { analyza } from "@/parser/parser"

describe("exemplarPraedefinitum", () => {
  it("picks claude-haiku-4-5 for anthropic", () => {
    expect(exemplarPraedefinitum("anthropic")).toBe("claude-haiku-4-5")
  })

  it("picks gpt-4o-mini for openai", () => {
    expect(exemplarPraedefinitum("openai")).toBe("gpt-4o-mini")
  })

  it("picks openai/gpt-4o-mini for openrouter", () => {
    expect(exemplarPraedefinitum("openrouter")).toBe("openai/gpt-4o-mini")
  })

  it("picks llama3.1 for ollama", () => {
    expect(exemplarPraedefinitum("ollama")).toBe("llama3.1")
  })

  it("falls back to fake for the fake oracle", () => {
    expect(exemplarPraedefinitum("fake")).toBe("fake")
  })

  it("falls back to fake for any unknown oracle", () => {
    expect(exemplarPraedefinitum("nescioquid")).toBe("fake")
  })
})

describe("extraheCaput", () => {
  it("extracts oracle and temperature directives from the program header", () => {
    const programma = analyza('oracle "openai"\ntemperature 0.3')
    expect(extraheCaput(programma)).toEqual({ oraculum: "openai", temperatura: 0.3 })
  })

  it("extracts all four directives with correct types", () => {
    const programma = analyza('oracle "anthropic"\nmodel "claude-sonnet-4-5"\ntemperature 0.5\nbudget 2000')
    expect(extraheCaput(programma)).toEqual({
      oraculum: "anthropic",
      exemplar: "claude-sonnet-4-5",
      temperatura: 0.5,
      aerarium: 2000,
    })
  })

  it("returns an empty header when the program has no directives", () => {
    const programma = analyza("summon x = 42")
    expect(extraheCaput(programma)).toEqual({})
  })

  it("coerces budget to a number", () => {
    const programma = analyza("budget 1000")
    const caput = extraheCaput(programma)
    expect(caput.aerarium).toBe(1000)
    expect(typeof caput.aerarium).toBe("number")
  })
})

describe("componeConfigurationem", () => {
  it("lets CLI mandata override the header caput", () => {
    const caput = extraheCaput(analyza('oracle "openai"'))
    const config = componeConfigurationem(caput, { oraculum: "anthropic" })
    expect(config.oraculum).toBe("anthropic")
  })

  it("uses the header caput when no mandata is given", () => {
    const caput = extraheCaput(analyza('oracle "openai"'))
    const config = componeConfigurationem(caput, {})
    expect(config.oraculum).toBe("openai")
  })

  it("falls back to defaults when neither caput nor mandata provide a value", () => {
    const config = componeConfigurationem({}, {})
    expect(config.oraculum).toBe(CONFIGURATIO_PRAEDEFINITA.oraculum)
    expect(config.temperatura).toBe(CONFIGURATIO_PRAEDEFINITA.temperatura)
    expect(config.aerarium).toBe(CONFIGURATIO_PRAEDEFINITA.aerarium)
    expect(config.spatiumMemoriae).toBe(CONFIGURATIO_PRAEDEFINITA.spatiumMemoriae)
    expect(config.memor).toBe(CONFIGURATIO_PRAEDEFINITA.memor)
    expect(config.fasciculusMemoriae).toBe(CONFIGURATIO_PRAEDEFINITA.fasciculusMemoriae)
    expect(config.conatus).toBe(CONFIGURATIO_PRAEDEFINITA.conatus)
  })

  it("resolves exemplar via exemplarPraedefinitum for the chosen oracle when no model is given", () => {
    const config = componeConfigurationem({ oraculum: "openai" }, {})
    expect(config.exemplar).toBe(exemplarPraedefinitum("openai"))
    expect(config.exemplar).toBe("gpt-4o-mini")
  })

  it("resolves exemplar for the mandata oracle that overrode the caput", () => {
    const config = componeConfigurationem({ oraculum: "openai" }, { oraculum: "anthropic" })
    expect(config.oraculum).toBe("anthropic")
    expect(config.exemplar).toBe("claude-haiku-4-5")
  })

  it("prefers an explicit model over the oracle default", () => {
    const config = componeConfigurationem({ oraculum: "anthropic", exemplar: "claude-opus-4" }, {})
    expect(config.exemplar).toBe("claude-opus-4")
  })

  it("lets mandata model override the caput model", () => {
    const config = componeConfigurationem({ exemplar: "from-header" }, { exemplar: "from-cli" })
    expect(config.exemplar).toBe("from-cli")
  })

  it("composes a full configuration from a parsed header plus CLI overrides", () => {
    const caput = extraheCaput(analyza('oracle "openai"\ntemperature 0.3\nbudget 500'))
    const config = componeConfigurationem(caput, { temperatura: 0.9 })
    expect(config).toEqual({
      oraculum: "openai",
      exemplar: "gpt-4o-mini",
      temperatura: 0.9,
      aerarium: 500,
      spatiumMemoriae: CONFIGURATIO_PRAEDEFINITA.spatiumMemoriae,
      memor: CONFIGURATIO_PRAEDEFINITA.memor,
      fasciculusMemoriae: CONFIGURATIO_PRAEDEFINITA.fasciculusMemoriae,
      conatus: CONFIGURATIO_PRAEDEFINITA.conatus,
    })
  })
})

import { describe, expect, it } from "vitest"
import { extraheValorem } from "@/providers/prompt"
import type { Consumptio } from "@/providers/types"

const consumptio: Consumptio = { signaImmissa: 11, signaEmissa: 7 }

describe("extraheValorem", () => {
  it("extracts a numeric value and threads consumptio", () => {
    expect(extraheValorem('{"value":42}', consumptio)).toEqual({ ratum: true, valor: 42, consumptio })
  })

  it("fails when the object lacks a value key", () => {
    expect(extraheValorem('{"x":1}', consumptio)).toEqual({
      ratum: false,
      causa: "LECTIO_FALLAX",
      consumptio,
    })
  })

  it("rejects a null value", () => {
    expect(extraheValorem('{"value":null}', consumptio)).toEqual({
      ratum: false,
      causa: "LECTIO_FALLAX",
      consumptio,
    })
  })

  it("fails on malformed JSON", () => {
    expect(extraheValorem("not json", consumptio)).toEqual({
      ratum: false,
      causa: "LECTIO_FALLAX",
      consumptio,
    })
  })

  it("fails on an empty string", () => {
    expect(extraheValorem("", consumptio)).toEqual({
      ratum: false,
      causa: "LECTIO_FALLAX",
      consumptio,
    })
  })

  it("fails on undefined", () => {
    expect(extraheValorem(undefined, consumptio)).toEqual({
      ratum: false,
      causa: "LECTIO_FALLAX",
      consumptio,
    })
  })

  it("accepts a valid non-number value", () => {
    expect(extraheValorem('{"value":"hi"}', consumptio)).toEqual({ ratum: true, valor: "hi", consumptio })
  })
})

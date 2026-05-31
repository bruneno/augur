import { describe, expect, it } from "vitest"
import { PilaZonarum, temperaturaPro, TEMPERATURA_CHAOS, type Zona } from "@/interpreter/zones"

describe("PilaZonarum", () => {
  it("starts in the divine zone", () => {
    const pila = new PilaZonarum()
    expect(pila.apex().genus).toBe("Divinus")
    expect(pila.altitudo).toBe(1)
  })

  it("pushes and pops zones", () => {
    const pila = new PilaZonarum()
    pila.impone({ genus: "Certus" })
    expect(pila.apex().genus).toBe("Certus")
    pila.detrahe()
    expect(pila.apex().genus).toBe("Divinus")
  })

  it("never pops below the base zone", () => {
    const pila = new PilaZonarum()
    pila.detrahe()
    pila.detrahe()
    expect(pila.apex().genus).toBe("Divinus")
    expect(pila.altitudo).toBe(1)
  })
})

describe("temperaturaPro", () => {
  it("returns the configured temperature for the divine zone", () => {
    expect(temperaturaPro({ genus: "Divinus" }, 0.4)).toBe(0.4)
  })

  it("uses the explicit chaos temperature when given", () => {
    const z: Zona = { genus: "Chaos", temperatura: 0.9 }
    expect(temperaturaPro(z, 0.4)).toBe(0.9)
  })

  it("falls back to the chaos default temperature", () => {
    const z: Zona = { genus: "Chaos", temperatura: null }
    expect(temperaturaPro(z, 0.4)).toBe(TEMPERATURA_CHAOS)
  })
})

export type Zona =
  | { genus: "Certus" }
  | { genus: "Divinus" }
  | { genus: "Chaos"; temperatura: number | null }

export const ZONA_DIVINA: Zona = { genus: "Divinus" }
export const ZONA_CERTA: Zona = { genus: "Certus" }
export const TEMPERATURA_CHAOS = 1.2

export class PilaZonarum {
  private readonly pila: Zona[] = [ZONA_DIVINA]

  impone(zona: Zona): void {
    this.pila.push(zona)
  }

  detrahe(): void {
    if (this.pila.length > 1) this.pila.pop()
  }

  apex(): Zona {
    return this.pila[this.pila.length - 1] ?? ZONA_DIVINA
  }

  get altitudo(): number {
    return this.pila.length
  }
}

export function temperaturaPro(zona: Zona, temperaturaDivina: number): number {
  if (zona.genus === "Chaos") return zona.temperatura ?? TEMPERATURA_CHAOS
  return temperaturaDivina
}

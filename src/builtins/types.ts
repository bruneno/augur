import type { Zona } from "@/interpreter/zones"
import type { Oraculum } from "@/providers/types"

export interface ContextusNativus {
  oraculum: Oraculum
  zona: Zona
  temperaturaDivina: number
  contextus: string[]
}

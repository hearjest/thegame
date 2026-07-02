import { Eldritch } from "./DummyGameTest/Eldritch"
import { HeathenKnight } from "./DummyGameTest/HeathenKnight"
import { selectedCharacters } from "./types/enums"

type RosterEntry = {
  key: selectedCharacters 
  name: string
  hp: number
  atk: number
  magAtk: number
  def: number
  magDef: number
}

function getRoster(): RosterEntry[] {
  return [
    {
      key: selectedCharacters.ELDRITCH,
      name: "Eldritch",
      hp: Eldritch.hp, atk: Eldritch.atk, magAtk: Eldritch.magAtk,
      def: Eldritch.def, magDef: Eldritch.magDef,
    },
    {
      key: selectedCharacters.HEATHEN_KNIGHT,
      name: "Heathen Knight",
      hp: HeathenKnight.hp, atk: HeathenKnight.atk, magAtk: HeathenKnight.magAtk,
      def: HeathenKnight.def, magDef: HeathenKnight.magDef,
    },
  ]
}

export { getRoster }
export type { RosterEntry }
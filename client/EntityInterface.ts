import {statusEffect} from "./enums"

interface Entity {
  id: number
  playerId: number
  position: number
  atk: number
  magAtk: number
  def: number
  magDef: number
  minSpeed: number
  maxSpeed: number
  rolledSpeed: number
  hp:number
}



export {Entity}
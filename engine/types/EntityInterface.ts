import {statusEffect} from "./enums"

interface Entity {
  id: number
  name:string
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

function makeEntity(id: number, playerId: number, position: number, minSpeed: number, maxSpeed: number,name:string): Entity {
  return {
    id,
    name,
    playerId,
    position,
    hp: 30,
    atk: 6,
    magAtk: 0,
    def: 5,
    magDef: 5,
    minSpeed,
    maxSpeed,
    rolledSpeed: -1,
  }
}

function makeEntity2(id: number, playerId: number, position: number, minSpeed: number, maxSpeed: number,hp:number,atk:number,magAtk:number,def:number,magDef:number,name:string): Entity {
  return {
    id,
    name,
    playerId,
    position,
    hp: hp,
    atk: atk,
    magAtk: magAtk,
    def: def,
    magDef: magDef,
    minSpeed,
    maxSpeed,
    rolledSpeed: -1,
  }
}



export {Entity,makeEntity2}
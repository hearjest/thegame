import type {Entity} from "./EntityInterface"
import type {Card,deck} from "./Card"
import {Intent,buffType,cardType} from "./enums"
import type {statusEffect} from "./enums"
import type {buff} from "./BuffDebuff"
import {status} from "./StatusEffect"

type Actor = {
  id: number
  name:string
  team: Entity[]
  deck: deck
  totalHp: number
  currHp: number
  statuses: status[]
  combinedDEF: number
  combinedMagDEF: number
  buffEffects: buff[]
  position:number
  roundNumUpdated:number
  handLimit:number
}



type Player=Actor&{
    currAP:number
    maxAP:number
    coins:number
    items:string[]//temp
    handLimit:number
    rolledSpeed:number
}
// 


type EnemyPlayer=Actor&{
    intent:Intent
    intentCardId:number
}


function makeEnemyPlayer(id:number,name:string,team:Entity[],deck:deck,intent:Intent=Intent.Unknown,intentCardId:number=-1,currHp?:number):EnemyPlayer{
  let totalHp=0
  let def=0
  let magdef=0

  for(let i=0;i<team.length;i++){
    const ent=team[i]
    totalHp+=ent.hp
    def+=ent.def
    magdef+=ent.magDef
  }

  return {
    id,
    team:[...team],
    deck,
    totalHp,
    currHp:currHp ?? totalHp,
    statuses:[],
    intent,
    intentCardId,
    combinedDEF:def,
    combinedMagDEF:magdef,
    position:0,
    buffEffects:[],
    roundNumUpdated:0,
    handLimit:99,
    name:name
  }
}

// interface Entity{
//     id:number
//     playerId:number
//     position:number
//     hp:number
//     atk:number
//     magAtk:number
//     def:number
//     magDef:number
//     minSpeed:number
//     maxSpeed:number
//     rolledSpeed:number
//     statuses:Record<statusEffect,number>|null
//     alive:boolean
// }
// 
// 
// 








export {Player,EnemyPlayer,Actor,makeEnemyPlayer}
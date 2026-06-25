import type {Entity} from "../EntityInterface"
import type {Card,deck} from "./Card"
import {Intent,buffType} from "../enums"
import type {statusEffect} from "../enums"
import type {buff} from "./BuffDebuff"


type Actor = {
  id: number
  team: Entity[]
  deck: deck
  totalHp: number
  currHp: number
  rolledSpeed: number
  statuses: Record<statusEffect, number> | null
  combinedDEF: number
  combinedMagDEF: number
  buffEffects: buff[]
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








export type {Player,EnemyPlayer,Actor}
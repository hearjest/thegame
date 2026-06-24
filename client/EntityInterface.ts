import {statusEffect} from "./enums"

interface Entity{
    id:number
    playerId:number
    position:number
    hp:number
    atk:number
    magAtk:number
    def:number
    magDef:number
    minSpeed:number
    maxSpeed:number
    rolledSpeed:number
    alive:boolean
}



export {Entity}
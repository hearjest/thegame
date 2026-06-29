import {targetSide,statusEffect,targetType,cardType,buffType} from "./enums"

import {status} from "../types/StatusEffect"
// enum conditionals




type Card={
    name:string
    cardType:cardType
    APCost:number
    cardId:number
    cardSerialNumber:number
    description:string
    flavorText:string
    targetSide:targetSide
    numTargets:number
    canCherryPickIndividuals:boolean //assuming you can target multiple individuals, you can choose somebody in position 1 and then 3, instead of being forced to target neighbors 1 and 2 or 2 and 3
    dmg:number
    magDmg:number
    inflicts:status[]
    targetType:targetType
    buffAmount:number
    buffDuration:number
    buffType:buffType
    belongsToEntityId:number
}

type deck={
    hand:Card[]
    drawPile:Card[]
    discardPile:Card[]
}


export type {Card,deck}
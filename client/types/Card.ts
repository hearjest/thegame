import {targetSide,statusEffect,targetType} from "../enums"

// enum conditionals

type Card={
    name:string
    APCost:number
    cardId:number
    cardSerialNumber:number
    description:string
    flavorText:string
    targetSide:targetSide
    numTargets:number
    canCherryPickIndividuals:boolean //assuming you can target multiple individuals, you can choose somebody in position 1 and then 3, instead of being forced to target neighbors 1 and 2 or 2 and 3
    damage:number
    inflicts:Record<statusEffect,number>|null
    targetType:targetType
}

type deck={
    hand:Card[]
    drawPile:Card[]
    discardPile:Card[]
}


export type {Card,deck}
import {Card,targetSide,targetType} from "./types/Card"

const ability1:Card={
    name:"pee",
    cardId:1,
    APCost:2,
    cardSerialNumber:2,
    description:"desc",
    flavorText:"urine",
    targetSide:targetSide.ENEMY,
    numTargets:3,
    canCherryPickIndividuals:true, //assuming you can target multiple individuals, you can choose somebody in position 1 and then 3, instead of being forced to target neighbors 1 and 2 or 2 and 3
    damage:5,
    inflicts:null,
    targetType:targetType.SINGLE_ENEMY
}

const cardDictionary:Record<number,Card>={
    1:ability1,
}



export {cardDictionary,targetSide}


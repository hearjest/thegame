import {Entity} from "../EntityInterface"
import {Card,targetSide,statusEffect,targetType} from "../types/Card"

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


let char1:Entity={
    id:1,
    hp:100,
    atk:25,
    magAtk:0,
    def:10,
    magDef:5,
    minSpeed:3,
    maxSpeed:6,
    position:-1,
    rolledSpeed:-1,
    statuses:null
}
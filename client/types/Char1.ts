import {Entity} from "../EntityInterface"
import {Card} from "./Card"
import {targetSide,targetType} from "../enums"
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
}


let char2:Entity={
    id:2,
    hp:13,
    atk:22,
    magAtk:0,
    def:10,
    magDef:4,
    minSpeed:3,
    maxSpeed:2,
    position:1,
    rolledSpeed:-1,
}

export {char1,char2}
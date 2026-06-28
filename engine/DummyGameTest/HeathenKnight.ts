import {Player} from "../types/Player"
import {Card,deck} from "../types/Card"
import {targetSide,targetType,cardType,buffType,Intent} from "../enums"
import {cardDictionary} from "../cardLookUpDict"
import {Entity} from "../EntityInterface"

let HeathenKnight:Entity={
    id:100,
    playerId:0,
    position:0,
    hp:150,
    atk:25,
    magAtk:0,
    def:20,
    magDef:5,
    minSpeed:0,
    maxSpeed:0,
    rolledSpeed:0
}

const HK1:Card={
    name:"Rusted Slash",
    cardType:cardType.ATK,
    cardId:4,
    APCost:1,
    cardSerialNumber:2,
    description:"Slashes the enemy with a withered sword",
    flavorText:"Their blade has long past its prime",
    targetSide:targetSide.ENEMY,
    numTargets:1,
    canCherryPickIndividuals:true, //assuming you can target multiple individuals, you can choose somebody in position 1 and then 3, instead of being forced to target neighbors 1 and 2 or 2 and 3
    dmg:5,
    magDmg:0,
    inflicts:null,
    targetType:targetType.SELF,
    buffAmount:0,
    buffDuration:0,
    buffType:buffType.PHYS_DMG_ADD,
    belongsToEntityId:100
}

const HK2:Card={
    name:"Outrage",
    cardType:cardType.ATK,
    cardId:5,
    APCost:0,
    cardSerialNumber:2,
    description:"Lash out",
    flavorText:"Memories of the past shackle them still",
    targetSide:targetSide.ENEMY,
    numTargets:1,
    canCherryPickIndividuals:true, //assuming you can target multiple individuals, you can choose somebody in position 1 and then 3, instead of being forced to target neighbors 1 and 2 or 2 and 3
    dmg:15,
    magDmg:0,
    inflicts:null,
    targetType:targetType.SELF,
    buffAmount:0,
    buffDuration:0,
    buffType:buffType.PHYS_DMG_ADD,
    belongsToEntityId:100
}


export{HeathenKnight,HK1,HK2}
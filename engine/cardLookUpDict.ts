import type {Card} from "./types/Card"
import {targetSide,targetType,cardType,buffType} from "./types/enums"
import {status} from "./types/StatusEffect"
import {E1,E2} from "./DummyGameTest/Eldritch"
import {HK1,HK2} from "./DummyGameTest/HeathenKnight"
const playerStrike:Card={
    name:"pee",
    cardType:cardType.ATK,
    cardId:1,
    APCost:2,
    cardSerialNumber:2,
    description:"desc",
    flavorText:"urine",
    targetSide:targetSide.ENEMY,
    numTargets:3,
    canCherryPickIndividuals:true, //assuming you can target multiple individuals, you can choose somebody in position 1 and then 3, instead of being forced to target neighbors 1 and 2 or 2 and 3
    dmg:10,
    magDmg:0,
    inflicts:[],
    targetType:targetType.SINGLE_ENEMY,
          buffAmount:0,
    buffDuration:0,
    buffType:0,
    belongsToEntityId:1
}

const playerBuff:Card={
    name:"pee",
    cardType:cardType.BUFF,
    cardId:2,
    APCost:0,
    cardSerialNumber:2,
    description:"desc",
    flavorText:"urine",
    targetSide:targetSide.ALLY,
    numTargets:3,
    canCherryPickIndividuals:true, //assuming you can target multiple individuals, you can choose somebody in position 1 and then 3, instead of being forced to target neighbors 1 and 2 or 2 and 3
    dmg:5,
    magDmg:0,
    inflicts:[],
    targetType:targetType.SELF,
    buffAmount:2,
    buffDuration:3,
    buffType:buffType.PHYS_DMG_MULT,
    belongsToEntityId:1
}
const monsterStrike: Card={
  name: "Strike",
  cardType:cardType.ATK,
  APCost: 0,
  cardId: 3,
  cardSerialNumber: 1,
  description: "Deal 6 damage.",
  flavorText: "thwack",
  targetSide: targetSide.ALLY,
  numTargets: 1,
  canCherryPickIndividuals: false,
  dmg: 20,
  magDmg:0,
  inflicts: [],
  targetType: targetType.SINGLE_ENEMY,
    buffAmount:0,
    buffDuration:0,
    buffType:0,
    belongsToEntityId:1101
}



const cardDictionary:Record<number,Card>={
    1:playerStrike,
    2:playerBuff,
    3:monsterStrike,
    4:HK1,
    5:HK2,
    6:E1,
    7:E2
}

function getCardById(id:number):Card{
    return cardDictionary[id]
}




export {cardDictionary,targetSide,getCardById}


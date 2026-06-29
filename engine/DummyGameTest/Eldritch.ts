import {Card,deck} from "../types/Card"
import {targetSide,targetType,cardType,buffType,statusEffect} from "../types/enums"
import {Entity} from "../types/EntityInterface"
import {status} from "../types/StatusEffect"

const Eldritch:Entity={
    id:200,
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

const st:status={
    type:statusEffect.POISON,
    dmgAmount:10,
    stacks:2,
    roundEnd:5
}

const list:status[]=[st]

const E1:Card={
    name:"Scream",
    cardType:cardType.ATK,
    cardId:6,
    APCost:1,
    cardSerialNumber:2,
    description:"Slashes the enemy with a withered sword",
    flavorText:"Their blade has long past its prime",
    targetSide:targetSide.ENEMY,
    numTargets:1,
    canCherryPickIndividuals:true,
    dmg:5,
    magDmg:0,
    inflicts:list,
    targetType:targetType.SINGLE_ENEMY,
    buffAmount:0,
    buffDuration:0,
    buffType:buffType.PHYS_DMG_ADD,
    belongsToEntityId:200
}

const E2:Card={
    name:"Slam",
    cardType:cardType.ATK,
    cardId:7,
    APCost:0,
    cardSerialNumber:2,
    description:"Lash out",
    flavorText:"Memories of the past shackle them still",
    targetSide:targetSide.ENEMY,
    numTargets:1,
    canCherryPickIndividuals:true,
    dmg:15,
    magDmg:0,
    inflicts:[],
    targetType:targetType.SINGLE_ENEMY,
    buffAmount:0,
    buffDuration:0,
    buffType:buffType.PHYS_DMG_ADD,
    belongsToEntityId:200
}

function cloneCardWithSerial(card: Card, cardSerialNumber: number): Card {
    return {
        ...card,
        inflicts: card.inflicts.map((effect) => ({ ...effect })),
        cardSerialNumber,
    }
}

function cloneCard(card: Card): Card {
    return {
        ...card,
        inflicts: card.inflicts.map((effect) => ({ ...effect })),
    }
}

const EldritchCards:Card[]=[]

let nextSerialNumber = 1
for(let i=0;i<3;i++){
    EldritchCards.push(cloneCardWithSerial(E1, nextSerialNumber))
    nextSerialNumber++
}

for(let i=0;i<3;i++){
    EldritchCards.push(cloneCardWithSerial(E2, nextSerialNumber))
    nextSerialNumber++
}



function getEldritch(playerId:number): {eldritch:Entity,eldritchDeck:deck} {
    return {
        eldritch: { ...Eldritch,playerId:playerId },
        eldritchDeck: {
            hand: [],
            drawPile: EldritchCards.map(cloneCard),
            discardPile: [],
        },
    }
}

export{Eldritch,E1,E2,EldritchCards,getEldritch}
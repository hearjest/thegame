import {Entity} from "../EntityInterface"
import {Card} from "./Card"
import {Action} from "./Action"

enum Phase{
    ROUND_START,
    ENTITY_TURN,
    TURN_END,
    WON,
    LOSS,
    RESOLVE
}

type deck={
    hand:Card[]
    drawPile:Card[]
    discardPile:Card[]
}


type CombatState={
    allies:Entity[]
    enemies:Entity[]
    decks:Record<number,deck>//player id->hand
    actionPoints:Record<number,number> //entity->ap
    coins:Record<number,number>
    phase:Phase
    roundNum:number
    // drawPile:Card[]
    // // discardPile:Card[]
    // hand:Card[]
    handLimit:number
    turnOrder:number[]
    turnOrderIndex:number
    seed:number
    rngState:number
}



function addCoins(state:CombatState,playerId:number,amount:number):CombatState{
    let coins=state.coins[playerId]
    if(coins+amount>0){
        state.coins[playerId]+=amount
        return state
    }
    return state
}


function spendAP(state:CombatState,playerId:number,amount:number):CombatState{
    let ap=state.actionPoints[playerId]
    if(ap+amount>0){
        state.actionPoints[playerId]+=amount
        return state
    }
    return state
}










export {Phase,CombatState,deck}
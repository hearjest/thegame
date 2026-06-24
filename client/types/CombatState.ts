import type {deck} from "./Card"
import type {Player,EnemyPlayer,Actor} from "./Player"
enum Phase{
    ROUND_START,
    ENTITY_TURN,
    TURN_END,
    WON,
    LOSS,
    RESOLVE
}




type CombatState={
    players:Record<number,Player>
    //enemies:Record<number,Entity>
    enemies:Record<number,EnemyPlayer>
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
    let coins=state.players[playerId].coins
    if(coins+amount>0){
        state.players[playerId].coins+=amount
        return state
    }
    return state
}


function spendAP(state:CombatState,playerId:number,amount:number):CombatState{
    let ap=state.players[playerId].currAP
    if(ap+amount>0){
        state.players[playerId].currAP+=amount
        return state
    }
    return state
}










export {Phase}
export type {CombatState,deck}
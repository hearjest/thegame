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
    let player=state.players[playerId]
    return {
        ...state,
        players:{
            ...state.players,
            [playerId]:{
                ...state.players[playerId],
                coins:player.coins+amount
            }
        }
    }
}


function spendAP(state:CombatState,playerId:number,amount:number):CombatState{
    let player=state.players[playerId]
    return {
        ...state,
        players:{
            ...state.players,
            [playerId]:{
                ...state.players[playerId],
                currAP:Math.min(player.maxAP,player.currAP+amount)
            }
        }
    }
}










export {Phase}
export type {CombatState,deck}
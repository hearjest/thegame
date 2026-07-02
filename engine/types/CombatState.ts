import type {deck} from "./Card"
import type {Player,EnemyPlayer,Actor} from "./Player"
import {Phase} from "./enums"


type CombatState={
    players:Record<number,Player>
    enemies:Record<number,EnemyPlayer>
    phase:Phase
    roundNum:number
    seed:number
    rngState:number
    playersEndedTurn:number[]
    encounters:EnemyPlayer[][]
    encounterIndex:number
}



// function addCoins(state:CombatState,playerId:number,amount:number):CombatState{
//     let player=state.players[playerId]
//     return {
//         ...state,
//         players:{
//             ...state.players,
//             [playerId]:{
//                 ...state.players[playerId],
//                 coins:player.coins+amount
//             }
//         }
//     }
// }


// function spendAP(state:CombatState,playerId:number,amount:number):CombatState{
//     let player=state.players[playerId]
//     return {
//         ...state,
//         players:{
//             ...state.players,
//             [playerId]:{
//                 ...state.players[playerId],
//                 currAP:Math.min(player.maxAP,player.currAP+amount)
//             }
//         }
//     }
// }



// function enemyTurn(state:CombatState):CombatState{
//     const enemyArr=Object.values(state.enemies).sort((en)=>en.)
// }






export {Phase}
export type {CombatState,deck}
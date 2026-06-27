import {Player,EnemyPlayer,Actor} from "./types/Player"
import {CombatState,Phase} from "./types/CombatState"
import {Card,deck} from "./types/Card"
import {targetSide,targetType,cardType,buffType,Intent} from "./enums"
import {Entity} from "./EntityInterface"
import type {Action} from "./types/Action"
import {applyAction,playEnemyTurn,checkWinLoss,tickStatusEffects} from "./CombatScene"
import {cardDictionary} from "./cardLookUpDict"
import {players,enemies} from "./DummyGameTest/playersDummy"
import {rollSpeed,draw,expireBuffs,drawAll,refreshAP,rollEnemyIntents,expireStatuses} from "./RoundStart"

const state=initState(players,enemies)
advance(state)


function advance(state:CombatState){
    let currState=state
    while(checkWinLoss(currState)===null){
        
        switch(currState.phase){
            case Phase.ROUND_START:{
                currState=expireBuffs(currState)
                currState=expireStatuses(currState)
                currState=drawAll(currState)
                currState=refreshAP(currState)
                currState=rollEnemyIntents(currState)
                currState={...currState,
                    roundNum:currState.roundNum+1,
                    phase:Phase.PLAYER_PHASE
                }
                continue
            }
            case Phase.PLAYER_PHASE:{
                //if not player turn return
                return currState
            }
            case Phase.ENEMY_PHASE:{
                currState=playEnemyTurn(currState)
                currState=expireStatuses(currState)
                currState={
                    ...currState,
                    phase:Phase.ENEMY_TURN_END
                }
                continue
            }
            case Phase.PLAYER_TURN_END:{
                //activate negative statuses
                currState={
                    ...currState,
                    players:tickStatusEffects(currState.players) as Record<number,Player>,
                    phase:Phase.ENEMY_PHASE
                }
                continue
            }
            case Phase.ENEMY_TURN_END:{
                //activate negative statuses
                currState={
                    ...currState,
                    enemies:tickStatusEffects(currState.enemies) as Record<number,EnemyPlayer>,
                    phase:Phase.ROUND_START
                }
                continue
            }
            case Phase.LOSS:{
                console.log("game over you lost")
            }
            case Phase.WON:{
                console.log("wow you won")
            }
            default:{
                break
            }
        }
    }
    console.log("Gameend")



}



function initState(players:Player[],enemies:EnemyPlayer[]):CombatState{
    let pRecord:Record<number,Player>={}
    let eRecord:Record<number,EnemyPlayer>={}
    let playersAlive=0
    let enemiesAlive=0
    players.forEach((pl)=>{
        pRecord[pl.id]=pl
        playersAlive+=1
    })
    enemies.forEach((el)=>{
        eRecord[el.id]=el
        enemiesAlive+=1
    })
    return {
        roundNum:0,
        players:pRecord,
        enemies:eRecord,
        phase: Phase.ROUND_START,
        seed:42,
        rngState:42,
        playersEndedTurn:[]
    } 

}



















import {Player,EnemyPlayer,Actor} from "./types/Player"
import {CombatState,Phase} from "./types/CombatState"
import {Card,deck} from "./types/Card"
import {targetSide,targetType,cardType,buffType,Intent,selectedCharacters} from "./types/enums"
import {Entity} from "./types/EntityInterface"
import type {Action} from "./types/Action"
import {applyAction,playEnemyTurn,checkWinLoss,tickStatusEffects} from "./CombatScene"
import {cardDictionary,getCardById} from "./cardLookUpDict"
import {players,enemies, makeEntity} from "./DummyGameTest/playersDummy"
import {HeathenKnight,getHeathenKnight} from "./DummyGameTest/HeathenKnight"
import {Eldritch,getEldritch} from "./DummyGameTest/Eldritch"
import {rollSpeed,draw,expireBuffs,drawAll,refreshAP,rollEnemyIntents,expireStatuses} from "./RoundStartEnd"



function advance(state:CombatState):CombatState{
    let currState=state
    console.log("start")
    while(checkWinLoss(currState)===null){
        displayState(currState)
        switch(currState.phase){
            case Phase.ROUND_START:{
                console.log("--------------------ROUND_START------------------------")
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
                console.log("--------------------PLAYER_PHASE------------------------")
                    // const action: Action={
                    //     type: "playCard",
                    //     ownerId: 1,
                    //     cardId: 1,
                    //     cardSerialNumber: 2,
                    //     targets: [1001],
                    //     entityId:101
                    // }
                //currState=applyAction(currState,action)
                //for testing, manually set end turn
                currState={
                    ...currState
                }
                return currState
                // return currState
            }
            case Phase.ENEMY_PHASE:{
                console.log("--------------------ENEMY_PHASE------------------------")
                currState=playEnemyTurn(currState)
                currState=expireStatuses(currState)
                currState={
                    ...currState,
                    phase:Phase.ENEMY_TURN_END
                }
                continue
            }
            case Phase.PLAYER_TURN_END:{
                console.log("--------------------PLAYER_TURN_END------------------------")
                currState={
                    ...currState,
                    players:tickStatusEffects(currState.players) as Record<number,Player>,
                    phase:Phase.ENEMY_PHASE
                }
                continue
            }
            case Phase.ENEMY_TURN_END:{
                console.log("--------------------ENEMY_TURN_END------------------------")
                currState={
                    ...currState,
                    enemies:tickStatusEffects(currState.enemies) as Record<number,EnemyPlayer>,
                    phase:Phase.ROUND_START
                }
                continue
            }
            default:{
                break
            }
        }
    }
    console.log(currState.phase)
    console.log("GAME EXIT")
    const result = checkWinLoss(currState)
return { ...currState, phase: result ?? currState.phase }


}


// function checkIfAllPlayersEnded(state:CombatState):CombatState{

// }



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





function initPlayer(state:CombatState,id:number,chars:selectedCharacters[]):CombatState{
    const newPlayers={
        ...state.players
    }
    newPlayers[id]=makePlayer(id,chars)
    return{
        ...state,
        players:newPlayers
    }
}


function playerDisconnected(state:CombatState,id:number):CombatState{
    let newPlayers={...state.players}
    delete newPlayers[id]

    return {
        ...state,
        players:newPlayers
    }
}


function makePlayer(id:number,chars:selectedCharacters[]):Player{
        const {team,cards}=getEntityAndDecks(id,chars)
        const baseDeckPlayer:deck={
            hand: [],
                drawPile: [],
                discardPile: [...cards],
        }
        let hp=0
        let magdef=0
        let def=0
        for(let i=0;i<team.length;i++){
            const ent=team[i]
            hp+=ent.hp
            def+=ent.def
            magdef+=ent.magDef
        }
    const player2: Player={
        id: id,
        team: [
           ...team
        ],
        deck: baseDeckPlayer,
        totalHp: hp,
        currHp: hp,
        rolledSpeed: -1,
        statuses: [],
        currAP: 3,
        maxAP: 3,
        coins: 50,
        items: [],
        handLimit: 9,
        combinedDEF:def,
        combinedMagDEF:magdef,
        position:0,
        buffEffects:[],
        roundNumUpdated:0
    }
    return player2
}



function getEntityAndDecks(id:number,chars:selectedCharacters[]):{team:Entity[],cards:Card[]}{
    let team:Entity[]=[]
    let cards:Card[]=[]
    for(let i=0;i<chars.length;i++){
        let char=chars[i]
        switch(char){
            case selectedCharacters.ELDRITCH:{
                const {eldritch,eldritchDeck}=getEldritch(id)
                team.push(eldritch)
                cards.push(...eldritchDeck.drawPile)
                continue
            }
            case selectedCharacters.HEATHEN_KNIGHT:{
                const {heathenknight,heathenknightDeck}=getHeathenKnight(id)
                team.push(heathenknight)
                cards.push(...heathenknightDeck.drawPile)
                continue
            }
        }
    }

    return{
        team:team,
        cards:cards

    }
}


type RosterEntry = {
  key: selectedCharacters 
  name: string
  hp: number
  atk: number
  magAtk: number
  def: number
  magDef: number
}

function getRoster(): RosterEntry[] {
  return [
    {
      key: selectedCharacters.ELDRITCH,
      name: "Eldritch",
      hp: Eldritch.hp, atk: Eldritch.atk, magAtk: Eldritch.magAtk,
      def: Eldritch.def, magDef: Eldritch.magDef,
    },
    {
      key: selectedCharacters.HEATHEN_KNIGHT,
      name: "Heathen Knight",
      hp: HeathenKnight.hp, atk: HeathenKnight.atk, magAtk: HeathenKnight.magAtk,
      def: HeathenKnight.def, magDef: HeathenKnight.magDef,
    },
  ]
}


function hpBar(curr: number, total: number, width = 20): string {
  const ratio = total > 0 ? Math.max(0, curr) / total : 0
  const filled = Math.round(ratio * width)
  return "[" + "#".repeat(filled) + "-".repeat(width - filled) + "]"
}

function phaseName(phase: number): string {
  return ["ROUND_START","ENTITY_TURN","TURN_END","WON","LOSS","RESOLVE",
          "PLAYER_PHASE","ENEMY_PHASE","PLAYER_TURN_END","ENEMY_TURN_END","PLAYERS_ALL_END"][phase] ?? `?${phase}`
}

function intentName(intent: number): string {
  return ["Attack","Defend","Unknown","Heal","Buff","Debuff"][intent] ?? `?${intent}`
}

function statusName(type: number): string {
  return ["POISON","BLEED","STUN","ATK_DOWN","DEF_DOWN","ATK_UP","DEF_UP","SPEED_UP","SPEED_DOWN"][type] ?? `?${type}`
}

function fmtStatuses(statuses: { type: number; stacks: number }[]): string {
    if (!Array.isArray(statuses) || statuses.length === 0) return ""
  return " | " + statuses.map(s => `${statusName(s.type)} x${s.stacks}`).join(", ")
}

function displayState(state: any): void {
  console.log("\n========================================================")
  console.log(`ROUND ${state.roundNum}    PHASE: ${phaseName(state.phase)}`)
  console.log(`players ended turn: [${state.playersEndedTurn.join(", ")}]`)
  console.log("========================================================")

  console.log("\n--- ENEMIES ---")
  for (const e of Object.values(state.enemies) as any[]) {
    const dead = e.currHp <= 0 ? "  (DEAD)" : ""
    console.log(`  Enemy ${e.id}${dead}  ${hpBar(e.currHp, e.totalHp)} ${e.currHp}/${e.totalHp}` +
                `  DEF ${e.combinedDEF}/${e.combinedMagDEF}` +
                `  intent: ${intentName(e.intent)} (card ${e.intentCardId})` +
                fmtStatuses(e.statuses))
  }


  console.log("\n--- PLAYERS ---")
  for (const p of Object.values(state.players) as any[]) {
    const dead = p.currHp <= 0 ? "  (DEAD)" : ""
    console.log(`  Player ${p.id}${dead}  ${hpBar(p.currHp, p.totalHp)} ${p.currHp}/${p.totalHp}` +
                `  AP ${p.currAP}/${p.maxAP}  DEF ${p.combinedDEF}/${p.combinedMagDEF}` +
                fmtStatuses(p.statuses))
    const hand = p.deck.hand as any[]
    if (hand.length === 0) {
      console.log(`      hand: (empty)`)
    } else {
      hand.forEach((c, i) => {
        console.log(`      [${i}] ${c.name}  (cardId ${c.cardId}, serial ${c.cardSerialNumber})` +
                    `  AP:${c.APCost}  dmg:${c.dmg}/${c.magDmg}  type:${["BUFF","DEBUFF","ATK","HEAL","GAIN_SHIELD"][c.cardType]}`)
      })
    }
    console.log(`      draw:${p.deck.drawPile.length}  discard:${p.deck.discardPile.length}`)
  }
  console.log("========================================================\n")
}

export { displayState,advance ,initState,initPlayer,playerDisconnected,getRoster,makePlayer}
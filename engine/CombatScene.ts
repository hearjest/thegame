import type {Action} from "./types/Action"
import {CombatState,Phase} from "./types/CombatState"
import type {Card} from "./types/Card"
import type {Entity} from "./types/EntityInterface"
import {cardDictionary,targetSide} from "./cardLookUpDict"
import {targetType,cardType,buffType,Intent,statusEffect} from "./types/enums"
import {Actor,Player,EnemyPlayer} from "./types/Player"
import {buff} from "./types/BuffDebuff"
import {status} from "./types/StatusEffect"
import { enemies } from "./DummyGameTest/playersDummy"
import { Item } from "./types/Items"
import {getItemById} from "./itemLookUpDict"


function applyAction(combatState: CombatState, action: Action): CombatState {
    let msg=""
  switch (action.type){
    case "playCard": {
        const card=cardDictionary[action.cardId]
        if (!canPlayCard(combatState, action)){
            return combatState
        }
        switch(card.cardType){
            case cardType.ATK:{
                const player=combatState.players[action.ownerId]
                const targetIds=getEligibleTargets(combatState, action)
                const {newEnemies,msgs}=applyDmgToEnemies(combatState,card,targetIds,action)
                const cost=card.APCost
                const ownerDeck=player.deck
                const idx=cardLocationIndexInHand(action.cardSerialNumber, action.cardId, ownerDeck.hand)
                const playedCard=ownerDeck.hand[idx]
                const newHand=ownerDeck.hand.filter((_, i) => i !== idx)
                msg = `${action.ownerId} attacked ${targetIds.toString()}`
                const newState={
                ...combatState,
                    enemies: newEnemies,
                    players: {
                        ...combatState.players,
                        [action.ownerId]:{
                            ...combatState.players[action.ownerId],
                            deck:{hand:newHand,discardPile:[...ownerDeck.discardPile,playedCard],drawPile:[...ownerDeck.drawPile]},
                            currAP:combatState.players[action.ownerId].currAP-cost,
                        }
                    },
                    logs:[msg]
                }
                const flag=checkWinLoss(newState)
                if(flag!==null){
                    return {
                        ...newState,
                        phase:flag
                    }
                }
            return newState
            }
            //---------------------------------------------------------------------------------------------------------------------
            case cardType.BUFF:{
                const targetIds=getEligibleTargets(combatState, action)
                const de_buff:buff={
                    type:card.buffType,
                    amount:card.buffAmount,
                    expiryRound:combatState.roundNum+card.buffDuration
                }
                const cost=card.APCost
                const ownerDeck=combatState.players[action.ownerId].deck
                const idx=cardLocationIndexInHand(action.cardSerialNumber, action.cardId, ownerDeck.hand)
                const playedCard=ownerDeck.hand[idx]
                const newHand=ownerDeck.hand.filter((_, i) => i !== idx)

                const newPlayers={ ...combatState.players }
                for (let i=0; i < targetIds.length; i++) {
                    const targetId=targetIds[i]
                    const targetPlayer=newPlayers[targetId]
                    if (!targetPlayer) continue
                    newPlayers[targetId]={
                        ...targetPlayer,
                        buffEffects: [...targetPlayer.buffEffects, de_buff],
                    }
                }
                msg = `${action.ownerId} buffed ${targetIds.toString()}`
                return {
                    ...combatState,
                    players: {
                        ...newPlayers,
                        [action.ownerId]: {
                            ...newPlayers[action.ownerId],
                            deck: {
                                hand: newHand,
                                discardPile: [...ownerDeck.discardPile, playedCard],
                                drawPile: [...ownerDeck.drawPile],
                            },
                            currAP: combatState.players[action.ownerId].currAP - cost,
                        },
                    },
                    logs:[...combatState.logs,msg]
                }
            }
            //---------------------------------------------------------------------------------------------------------------------
            default:
                return combatState
        }
    }//End of playCard action case here
//---------------------------------------------------------------------------------------------------------------------
    case "useItem":{
        const owner=findItemOwnerById(combatState,action.ownerId)
        if(owner===null){
            return combatState
        }
        const item=owner.items.filter(x=> x.id===action.itemId)
        if (item.length===0){
            return combatState
        }
        const newState = applyItemEffects(combatState,new Set(action.targets),action.itemId,owner.id)
        newState.logs.push(`${action.ownerId} used item ${getItemById(action.itemId).name}`)
        return newState
    }
    //---------------------------------------------------------------------------------------------------------------------

    case "endTurn": {
        const ended=[...combatState.playersEndedTurn, action.ownerId]
        const livingPlayers=Object.values(combatState.players).filter((p)=>p.currHp>0)
        const allEnded=livingPlayers.every((p)=>ended.includes(p.id))
        if(allEnded){
            return {...combatState,playersEndedTurn:[],phase:Phase.PLAYER_TURN_END}
        }else{
            return {...combatState,playersEndedTurn:ended}
        }
    }

    default:{
        return combatState
    }
  }
}


function canPlayCard(combatState: CombatState, action: Action): boolean {
    console.log("can play card")
  if (action.type !== "playCard") {
    return false
  }
  const owner=combatState.players[action.ownerId]
  if (!owner) return false
  const cardIndex=cardLocationIndexInHand(action.cardSerialNumber, action.cardId, owner.deck.hand)
  if (cardIndex === -1) return false
  if (Phase.PLAYER_PHASE !== combatState.phase) return false
  if (owner.currAP < owner.deck.hand[cardIndex].APCost) return false
  return true
}


function cardLocationIndexInHand(serialCardNumber:number,cardId:number, cards:Card[]):number{
    for(let i=0;i<cards.length;i++){
        if(cards[i].cardSerialNumber===serialCardNumber&&cards[i].cardId===cardId){
            return i
        }
    }
    return -1
}

function getEligibleTargets(combatState:CombatState,action:Action):number[]{
    console.log("1")
    if(action.type!=="playCard"){
        console.log("2")
        return []
    }
    const card=cardDictionary[action.cardId]
    const enemies=Object.values(combatState.enemies)
    const allies=Object.values(combatState.players)

    let arr:number[]=[]
    switch(card.targetType){
        case targetType.SELF:
            if(combatState.players[action.targets[0]]===undefined){
                return []
            }
            if(isActorAlive(combatState.players[action.ownerId])){
                return [action.ownerId]
            }
            return arr
        case targetType.SINGLE_ALLY_CHOOSE:{
            if(combatState.players[action.targets[0]]===undefined){
                return []
            }
            const actorAlive=isActorAlive(combatState.players[action.targets[0]])
            if(actorAlive){
                return [action.targets[0]]
            }
            return arr
        }

        case targetType.ALL_ALLIES:{
            const players=combatState.players
            for (const playerId of Object.keys(players)) {
                const player=players[Number(playerId)]
                if (isActorAlive(player)) {
                    arr.push(player.id)
                }
            }
            return arr
        }

        case targetType.SINGLE_ENEMY: {
            console.log("get eligibile targets")
            if(combatState.enemies[action.targets[0]]===undefined){
                console.log("12")
                return []
            }
            if(isActorAlive(combatState.enemies[action.targets[0]])) {
                console.log("13")
                return [action.targets[0]]
            }
            console.log("14")
                return []
            }

        case targetType.FIRST_X_ENEMIES:{
            const len=Math.min(enemies.length,card.numTargets)
            for(let i=0;i<len;i++){
                arr.push(enemies[i].id)
            }
            return arr
        }

        default:
            return []
    }
}

function isActorAlive(actor: Actor): boolean {
  return actor.currHp > 0
}



function applyItemEffects(state:CombatState,targets:Set<number>,itemId:number,ownerId:number):CombatState{
    const item=getItemById(itemId)
    const de_buff:buff={
                    type:item.buff.type,
                    amount:item.buff.amount,
                    expiryRound:state.roundNum+item.buff.expiryRound
                }
    
    let newPlayers={...state.players}
    newPlayers[ownerId].items=newPlayers[ownerId].items.filter(i=>{return i.id!==item.id})
    let newEnemies={...state.enemies}
    for(let p of Object.values(state.players)){
        if(targets.has(p.id)){
            newPlayers[p.id]={
                        ...p,
                        buffEffects: [...p.buffEffects, de_buff],
                    }
        }   
    }
    for(let e of Object.values(state.enemies)){
        if(targets.has(e.id)){
            newEnemies[e.id]={
                        ...e,
                        buffEffects: [...e.buffEffects, de_buff],
                    }
        }   
    }
    
    const newState={
        ...state,
        players:newPlayers,
        enemies:newEnemies
    }

    return newState
}


function applyDmgToEnemies(combatState: CombatState, card: Card, targetIds: number[],action:Action):{newEnemies:CombatState["enemies"],msgs:String[]}{
    if(action.type!=="playCard"){return {newEnemies:combatState.enemies,msgs:[]}}
    const player=combatState.players[action.ownerId]
    const entity=player.team.find((ent)=>ent.id===action.entityId)

    if(entity===undefined){return {newEnemies:combatState.enemies,msgs:[]}}

    const {pAtk,mAtk}=calcDamage(combatState.players[action.ownerId],card.dmg,card.magDmg,entity.atk,entity.magAtk)
    const newEnemies={...combatState.enemies}
    const msgs:String[]=[...combatState.logs]
    for(const en of Object.values(combatState.enemies)){
        if(targetIds.includes(en.id)){
            const {pDef,mDef}=calcDef(en)
            const physDmg=Math.max(0, pAtk - pDef)
            const magDmg=Math.max(0, mAtk - mDef)
            const newHp=Math.max(0, en.currHp - physDmg - magDmg)
            const enemyStatuses=[...en.statuses]
            for(let i=0;i<card.inflicts.length;i++){
                enemyStatuses.push(card.inflicts[i])
            }
            newEnemies[en.id]={
                ...en,
                currHp:newHp,
                statuses:enemyStatuses
            }
            msgs.push(`${player.name} did ${physDmg+magDmg} to ${en.name}`)
            
        }
    }
    return {newEnemies:newEnemies,msgs:msgs}
}

// function applyDamage(combatState: CombatState, card: Card, targetIds: number[],action:Action): CombatState["enemies"] {
//   if(action.type!="playCard"){return combatState.enemies}
//     const newEnemies={ ...combatState.enemies }
//     const {physDmgAdd,physDmgMultiplicative,magDmgMultiplicative,magDmgAdd}=getAtkBuffAmounts(combatState.players[action.ownerId])
//     const entity=combatState.players[action.ownerId].team.find((ent)=>ent.id===action.entityId)

//     if(entity===undefined){return combatState.enemies}

//   for (const ep of Object.values(combatState.enemies)) {
//     //const isHit=ep.team.some((e) => targetIds.includes(e.id))
//     if (targetIds.includes(ep.id)) {

//         const {physDefAdd,physDefMult,magDefAdd,magDefMult}=getDefBuffAmounts(ep)
//       const physDmg=Math.max(0, ((card.dmg+entity.atk+physDmgAdd)*physDmgMultiplicative) - (ep.combinedDEF+physDefAdd)*physDefMult)
//       const magDmg=Math.max(0, ((card.magDmg+entity.magAtk+magDmgAdd)*magDmgMultiplicative) - (ep.combinedMagDEF+magDefAdd)*magDefMult)
//       const newHp=Math.max(0, ep.currHp - physDmg - magDmg)
//       newEnemies[ep.id]={...ep, currHp: newHp }
//     }
//   }
//   return newEnemies
// }



function playEnemyTurn(state:CombatState):CombatState{
    let newState={...state}
    for(let enemy of Object.values(state.enemies)){
        //get card based on intent
        if(enemy.currHp<=0){continue}
        const action:Action={
            type:"playEnemyIntent",
            enemyId:enemy.id,
            cardId:enemy.intentCardId,
            entityId:cardDictionary[enemy.intentCardId].belongsToEntityId
        }
        newState=resolveEnemyAction(newState,action)
        const flag=checkWinLoss(newState)
        if(flag!==null){
            return {
                ...newState,
                phase:flag
            }
        }
    }
    return newState
}


function resolveEnemyAction(state: CombatState,action:Action): CombatState {
    if(action.type!=="playEnemyIntent"){return state}
    const msgs:String[]=[]
    const enemy=state.enemies[action.enemyId]
    switch (enemy.intent) {
        case Intent.Attack: {
            const castingEntity=enemy.team.find(e => e.id === action.entityId)

            if(castingEntity===undefined){return state}

            const card=cardDictionary[action.cardId]
            const {pAtk,mAtk}=calcDamage(enemy,card.dmg,card.magDmg,castingEntity.atk,castingEntity.magAtk)
            const newPlayers={...state.players}
            
            for(const player of Object.values(state.players)){
                if(player.currHp<=0){continue}
                const {pDef,mDef}=calcDef(player)
                const takenphysDmg=Math.max(0,pAtk-pDef)
                const takenMagDmg=Math.max(0,mAtk-mDef)
                const newHp=Math.max(0, player.currHp -takenphysDmg-takenMagDmg)
                newPlayers[player.id]={
                    ...player,
                    currHp:newHp
                }
                msgs.push(`${enemy.name} did ${takenphysDmg+takenMagDmg} to ${player.name}`)
            }
            return {
            ...state,
            players: newPlayers,
            logs:msgs
            }
        }
//--------------------------------------------------------------------------------------------
    case Intent.Defend: {
      // enemy buffs its own defense — append a DEF buff to itself
      const defBuff={ type: buffType.PHYS_DEF_ADD, amount: 5, expiryRound: state.roundNum + 1 }
      return {
        ...state,
        enemies: {
          ...state.enemies,
          [enemy.id]: { ...enemy, buffEffects: [...enemy.buffEffects, defBuff] },
        },
      }
    }

    default:
      return state
  }
}


function calcDef(defender:Actor){
    const {physDefAdd,physDefMult,magDefAdd,magDefMult}=getDefBuffAmounts(defender)
    const pDef=(physDefAdd+defender.combinedDEF)*physDefMult
    const mDef=(magDefAdd+defender.combinedMagDEF)*magDefMult
    return {pDef,mDef}
}



function calcDamage(attacker:Actor,cardIntentPhysAtk:number,cardIntentMagAtk:number,entityPhysAtk:number,entityMagAtk:number){
    const {physDmgAdd,physDmgMultiplicative,magDmgMultiplicative,magDmgAdd}=getAtkBuffAmounts(attacker)
    const pAtk=(cardIntentPhysAtk+physDmgAdd+entityPhysAtk)*physDmgMultiplicative
    const mAtk=(cardIntentMagAtk+magDmgAdd+entityMagAtk)*magDmgMultiplicative
    return {pAtk,mAtk}
}

function getAtkBuffAmounts(actor:Actor){
    const physDmgAdd=actor.buffEffects.filter((a)=>a.type===buffType.PHYS_DMG_ADD).reduce((sum,a)=>sum+a.amount,0)
    const physDmgMultiplicative=actor.buffEffects.filter((a)=>a.type===buffType.PHYS_DMG_MULT).reduce((prod,a)=>prod*a.amount,1)
    const magDmgMultiplicative=actor.buffEffects.filter((a)=>a.type===buffType.MAG_DMG_MULT).reduce((prod,a)=>prod*a.amount,1)
    const magDmgAdd=actor.buffEffects.filter((a)=>a.type===buffType.MAG_DMG_ADD).reduce((sum,a)=>sum+a.amount,0)
    return {
        physDmgAdd:physDmgAdd,
        physDmgMultiplicative:physDmgMultiplicative,
        magDmgMultiplicative:magDmgMultiplicative,
        magDmgAdd:magDmgAdd
    }
}


function getDefBuffAmounts(actor:Actor){
    const physDefAdd=actor.buffEffects.filter((a)=>a.type===buffType.PHYS_DEF_ADD).reduce((sum,a)=>sum+a.amount,0)
    const physDefMult=actor.buffEffects.filter((a)=>a.type===buffType.PHYS_DEF_MULT).reduce((sum,a)=>sum+a.amount,1)
    const magDefAdd=actor.buffEffects.filter((a)=>a.type===buffType.MAG_DEF_ADD).reduce((sum,a)=>sum+a.amount,0)
    const magDefMult=actor.buffEffects.filter((a)=>a.type===buffType.MAG_DEF_MULT).reduce((sum,a)=>sum+a.amount,1)
    return {
        physDefAdd:physDefAdd,
        physDefMult:physDefMult,
        magDefAdd:magDefAdd,
        magDefMult:magDefMult,
    }
}

function checkWinLoss(state: CombatState): Phase | null {
  const playersAlive=Object.values(state.players).some(p=>p.currHp>0)
  const enemiesAlive=Object.values(state.enemies).some(e=>e.currHp>0)
    if(!enemiesAlive&&state.encounterIndex+1<state.encounters.length){return Phase.BEGIN_NEXT_ENCOUNTER}
  if (!enemiesAlive&&state.encounterIndex===state.encounters.length) {return Phase.WON}
  if (!playersAlive) {return Phase.LOSS}
  return null
}

function rollEnemyIntents(state:CombatState):CombatState{
    const enemies=Object.values(state.enemies).sort((a,b)=>(b.position-a.position))
    for(let e of enemies){
        if(e===undefined||e.currHp===0){continue}

        //state=resolveEnemyIntetions(state,e)
        //if checkwincondition
    }

    return state
}


function tickStatusEffects<T extends Record<number,EnemyPlayer>|Record<number,Player>>(actors:T):T{
    const newActors={...actors}
    for(let player of Object.values(newActors)){
        for(let i=0;i<player.statuses.length;i++){
            const st=player.statuses[i]
            switch(st.type){
                case statusEffect.POISON:{
                    newActors[player.id].currHp=Math.max(0,player.currHp-(player.currHp*0.1)*st.stacks)
                    break
                }
                case statusEffect.BLEED:{
                    newActors[player.id].currHp=Math.max(0,player.currHp-(st.dmgAmount*st.stacks))
                    break
                }
            }
        }
    }
    
    return newActors
}





function checkPlayerTurnEnd(state:CombatState):boolean{
    let allPlayersEnded=true
    for(let player of Object.values(state.players)){
        if(!(player.id in state.playersEndedTurn)){
            allPlayersEnded=false
        }
    }
    return allPlayersEnded
}


function findItemOwnerById(state:CombatState,id:number):Player|null{
    for(let p of Object.values(state.players)){
        if (id===p.id){
            return p
        }
    }
    throw new Error("Could not find player/enemy by that id")
    return null
}


export {applyAction,rollEnemyIntents,playEnemyTurn,checkWinLoss,tickStatusEffects}


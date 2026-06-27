import type {Action} from "./types/Action"
import {CombatState,Phase} from "./types/CombatState"
import type {Card} from "./types/Card"
import type {Entity} from "./EntityInterface"
import {cardDictionary,targetSide} from "./cardLookUpDict"
import {targetType,cardType,buffType,Intent,statusEffect} from "./enums"
import {Actor,Player,EnemyPlayer} from "./types/Player"
import {buff} from "./types/BuffDebuff"
import {status} from "./types/StatusEffect"
function applyAction(combatState: CombatState, action: Action): CombatState {
  switch (action.type){
    case "playCard": {
        const card=cardDictionary[action.cardId]
        console.log("card")
        if (!canPlayCard(combatState, action)){
            return combatState
        }
        console.log("g")
        switch(card.cardType){
            case cardType.ATK:{
                const targetIds=getEligibleTargets(combatState, action)
                console.log(targetIds)
                const newEnemies=applyDmgToEnemies(combatState,card,targetIds,action)
                const cost=card.APCost
                const ownerDeck=combatState.players[action.ownerId].deck
                const idx=cardLocationIndexInHand(action.cardSerialNumber, action.cardId, ownerDeck.hand)
                const playedCard=ownerDeck.hand[idx]
                const newHand=ownerDeck.hand.filter((_, i) => i !== idx)
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
                }
            }
            //---------------------------------------------------------------------------------------------------------------------
            default:
                return combatState
        }
    }
//---------------------------------------------------------------------------------------------------------------------
    case "useItem":{
        return combatState
    }
    //---------------------------------------------------------------------------------------------------------------------
    case "reposition":{
        return combatState
    }

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
    if(action.type!=="playCard"){
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

function findEntityOwner(combatState: CombatState, entityId: number): Actor | undefined {
  for (const p of Object.values(combatState.players)) {
    if (p.team.some((e) => e.id === entityId)) return p
  }
  for (const e of Object.values(combatState.enemies)) {
    if (e.team.some((m) => m.id === entityId)) return e
  }
  return undefined
}




function applyDmgToEnemies(combatState: CombatState, card: Card, targetIds: number[],action:Action):CombatState["enemies"]{
    if(action.type!=="playCard"){return combatState.enemies}

    const entity=combatState.players[action.ownerId].team.find((ent)=>ent.id===action.entityId)

    if(entity===undefined){return combatState.enemies}

    const {pAtk,mAtk}=calcDamage(combatState.players[action.ownerId],card.dmg,card.magDmg,entity.atk,entity.magAtk)
    const newEnemies={...combatState.enemies}

    for(const en of Object.values(combatState.enemies)){
        if(targetIds.includes(en.id)){
            const {pDef,mDef}=calcDef(en)
            const physDmg=Math.max(0, pAtk - pDef)
            const magDmg=Math.max(0, mAtk - mDef)
            const newHp=Math.max(0, en.currHp - physDmg - magDmg)

            newEnemies[en.id]={
                ...en,currHp:newHp
            }
        }
    }
    return newEnemies
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
            }
            return {
            ...state,
            players: newPlayers,
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
    const physDefMult=actor.buffEffects.filter((a)=>a.type===buffType.PHYS_DEF_MULT).reduce((sum,a)=>sum+a.amount,0)
    const magDefAdd=actor.buffEffects.filter((a)=>a.type===buffType.MAG_DEF_ADD).reduce((sum,a)=>sum+a.amount,0)
    const magDefMult=actor.buffEffects.filter((a)=>a.type===buffType.MAG_DEF_MULT).reduce((sum,a)=>sum+a.amount,0)
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

  if (!enemiesAlive) {return Phase.WON}
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




export {applyAction,rollEnemyIntents,playEnemyTurn,checkWinLoss,tickStatusEffects}


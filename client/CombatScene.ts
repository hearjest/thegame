import type {Action} from "./types/Action"
import type {CombatState} from "./types/CombatState"
import type {Card} from "./types/Card"
import type {Entity} from "./EntityInterface"
import {cardDictionary,targetSide} from "./cardLookUpDict"
import {targetType,cardType,buffType} from "./enums"
import {Actor} from "./types/Player"
import {buff} from "./types/BuffDebuff"

function applyAction(combatState: CombatState, action: Action): CombatState {
  switch (action.type){
    case "playCard": {
        const card=cardDictionary[action.cardId]
        console.log("card")
        if (!canPlayCard(combatState, action)){
            console.log("card2")
            return combatState
        }
        switch(card.cardType){
            case cardType.ATK:{
                const targetIds=getEligibleTargets(combatState, action)
                console.log(targetIds)
                const newEnemies=applyDamage(combatState,card,targetIds,action)
                const cost=card.APCost
                const ownerDeck=combatState.players[action.ownerId].deck
                const idx=cardLocationIndexInHand(action.cardSerialNumber, action.cardId, ownerDeck.hand)
                const playedCard=ownerDeck.hand[idx]
                const newHand=ownerDeck.hand.filter((_, i) => i !== idx)
            return {
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
            }
            case cardType.BUFF:{
                console.log("Helllo????")
                const targetIds=getEligibleTargets(combatState, action)
                const de_buff:buff={
                    type:card.buffType,
                    amount:card.buffAmount,
                    expiryRound:combatState.roundNum+card.buffDuration
                }
                const cost = card.APCost
                const ownerDeck = combatState.players[action.ownerId].deck
                const idx = cardLocationIndexInHand(action.cardSerialNumber, action.cardId, ownerDeck.hand)
                const playedCard = ownerDeck.hand[idx]
                const newHand = ownerDeck.hand.filter((_, i) => i !== idx)

                const newPlayers = { ...combatState.players }
                for (let i = 0; i < targetIds.length; i++) {
                    const targetId = targetIds[i]
                    const targetPlayer = newPlayers[targetId]
                    if (!targetPlayer) continue
                    newPlayers[targetId] = {
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

            default:
                return combatState
        }
    }

    case "useItem":{
        return combatState
    }
    
    case "reposition":{
        return combatState
    }
    case "endTurn":{
        return combatState
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
  const owner = combatState.players[action.ownerId]
  if (!owner) return false
  const cardIndex = cardLocationIndexInHand(action.cardSerialNumber, action.cardId, owner.deck.hand)
  if (cardIndex === -1) return false
  if (action.ownerId !== combatState.turnOrder[combatState.turnOrderIndex]) return false
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
            console.log("i beg")
            if(combatState.players[action.targets[0]]===undefined){
                console.log("bruh")
                return []
            }
            if(isActorAlive(combatState.players[action.ownerId])){
                console.log("bruh2")
                return [action.ownerId]
            }
            console.log("bruh3")
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
            const players = combatState.players
            for (const playerId of Object.keys(players)) {
                const player = players[Number(playerId)]
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





function applyDamage(combatState: CombatState, card: Card, targetIds: number[],action:Action): CombatState["enemies"] {
  if(action.type!="playCard"){return combatState.enemies}
    const newEnemies = { ...combatState.enemies }
    const {physDmgAdd,physDmgMultiplicative,magDmgMultiplicative,magDmgAdd}=preCompDmg(combatState.players[action.ownerId])
    const entity=combatState.players[action.ownerId].team.find((ent)=>ent.id===action.entityId)
    console.log("efrer")
    if(entity===undefined){return combatState.enemies}
    console.log("23333333333333")
  for (const ep of Object.values(combatState.enemies)) {
    //const isHit = ep.team.some((e) => targetIds.includes(e.id))
    if (targetIds.includes(ep.id)) {
        console.log("JWNEFWEFWE")
        const {physDefAdd,physDefMult,magDefAdd,magDefMult}=preCompDef(ep)
      const physDmg = Math.max(0, ((card.dmg+entity.atk+physDmgAdd)*physDmgMultiplicative) - (ep.combinedDEF+physDefAdd)*physDefMult)
      const magDmg = Math.max(0, ((card.magDmg+entity.magAtk+magDmgAdd)*magDmgMultiplicative) - (ep.combinedMagDEF+magDefAdd)*magDefMult)
      const newHp = Math.max(0, ep.currHp - physDmg - magDmg)
      newEnemies[ep.id]={...ep, currHp: newHp }
    }
  }
  return newEnemies
}


function preCompDmg(actor:Actor){
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


function preCompDef(actor:Actor){
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


//((card.dmg)+(combatState.players.additiveATK))


export {applyAction}


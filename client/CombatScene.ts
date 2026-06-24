import type {Action} from "./types/Action"
import type {CombatState} from "./types/CombatState"
import type {Card} from "./types/Card"
import type {Entity} from "./EntityInterface"
import {cardDictionary,targetSide} from "./cardLookUpDict"
import {targetType} from "./enums"
function applyAction(combatState: CombatState, action: Action): CombatState {
  switch (action.type){
    case "playCard": {
      if (!canPlayCard(combatState, action)){
        return combatState
      }

      const card=cardDictionary[action.cardId]
      const targetIds=getEligibleTargets(combatState, action)
      const damage=card.damage

      const newEnemies={...combatState.enemies}
      for (const ep of Object.values(combatState.enemies)){
        const isHit=ep.team.some((e) => targetIds.includes(e.id))
        if(isHit){
          const newHp=Math.max(0, ep.currHp - damage) 
          newEnemies[ep.id]={
            ...ep,
            currHp: newHp,
          }
        }
      }

        const cost=card.APCost
        // const newAP={
        //     ...combatState.actionPoints,
        //     [action.ownerId]: combatState.actionPoints[action.ownerId] - cost,
        // } [action.ownerId]: combatState.players[action.ownerId].currAP - cost,
        const newAP={...combatState.players}
        newAP[action.ownerId]={...newAP[action.ownerId],currAP:combatState.players[action.ownerId].currAP-cost}
        
        const ownerDeck=combatState.players[action.ownerId].deck
        const idx=cardLocationIndexInHand(action.cardSerialNumber, action.cardId, ownerDeck.hand)
        const playedCard=ownerDeck.hand[idx]
        const newHand=ownerDeck.hand.filter((_, i) => i !== idx)
        const newDecks={
            ...combatState.players[action.ownerId].deck,
            [action.ownerId]: {
            ...ownerDeck,
            hand: newHand,
            discardPile: [...ownerDeck.discardPile, playedCard],
            },
        }
        newAP[action.ownerId].deck=newDecks
        
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
    case "useItem"://tbg
    case "reposition"://tbd
    case "endTurn"://t/bde
    default:
      return combatState
  }
}


function canPlayCard(combatState:CombatState,action:Action):boolean{
    if (action.type !=="playCard"){
        return false
    }

    const cardIndex=cardLocationIndexInHand(action.cardSerialNumber,action.cardId,combatState.players[action.ownerId].deck.hand)
    const ownerId=action.ownerId
    if (ownerId!==combatState.turnOrder[combatState.turnOrderIndex]
        ||cardIndex===-1
        ||combatState.players[ownerId].currAP<combatState.players[ownerId].deck.hand[cardIndex].APCost)
    {
        return false
    }
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
    const allies=Object.values(combatState.players).flatMap((m)=>m.team)
    combatState
    let arr:number[]=[]
    switch(card.targetType){
        case targetType.SELF:
            if(isSingleTargetChooseAlive(allies,action.ownerId)!=-1){
                return [action.ownerId]
            }
            return arr
        case targetType.SINGLE_ALLY_CHOOSE:
            if(allies.length===1){
                return [action.targets[0]]
            }
            const targetIndex=isSingleTargetChooseAlive(allies,(action.targets[0]))
            if(targetIndex!=-1){
                return [action.targets[targetIndex]]
            }
            return arr

        case targetType.SINGLE_ENEMY:
            if(enemies.length>0){
                return [enemies[0].team[0].id]
            }
            return arr

        case targetType.FIRST_X_ENEMIES:
            const len=Math.min(enemies.length,card.numTargets)
            for(let i=0;i<len;i++){
                arr.push(enemies[i].team[0].id)
            }
            return arr

        default:
            return []
    }
}

function isSingleTargetChooseAlive(entities:Entity[],targetId:number):number{
    for(let i=0;i<entities.length;i++){
        if(entities[i].id===targetId&&entities[i].alive){
            return i
        }
    }
    return -1
}




export {applyAction}


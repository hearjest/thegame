import {Action} from "./types/Action"
import {CombatState,Phase,deck} from "./types/CombatState"
import {Card,targetType} from "./types/Card"
import {Entity} from "./EntityInterface"
import {cardDictionary,targetSide} from "./cardLookUpDict"
function applyAction(combatState:CombatState,action:Action):CombatState{
    switch(action.type){
        case "playCard":
            if(canPlayCard(combatState,action)){
                //return getEligibleTargets(combatState,action)
            }
            //hi
            //see AttackCommand.cs execute
            //make sure to check resource, entity eligiblity (make arr)
            return combatState;
        case "useItem":
            return combatState;
        case "reposition":
            return combatState;
        case "endTurn":
            return combatState;
        default:
            return combatState;
    }
}


function canPlayCard(combatState:CombatState,action:Action):boolean{
    if (action.type !=="playCard"){
        return false
    }

    const cardIndex=cardLocationIndexInHand(action.cardSerialNumber,action.cardId,combatState.decks[action.ownerId].hand)
    const ownerId=action.ownerId
    if (ownerId!==combatState.turnOrder[combatState.turnOrderIndex]
        ||cardIndex===-1
        ||combatState.actionPoints[ownerId]<combatState.decks[ownerId].hand[cardIndex].APCost)
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
    const enemies=combatState.enemies
    const allies=combatState.allies
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
                return [enemies[0].id]
            }
            return arr

        case targetType.FIRST_X_ENEMIES:
            const len=Math.min(enemies.length,card.numTargets)
            for(let i=0;i<len;i++){
                arr.push(enemies[i].id)
            }
            return arr

        default:
            return []
    }
}

function isSingleTargetChooseAlive(entities:Entity[],targetId:number):number{
    for(let i=0;i<entities.length;i++){
        if(entities[i].id===targetId){
            return i
        }
    }
    return -1
}







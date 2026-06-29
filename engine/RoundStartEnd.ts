import type {Entity} from "./types/EntityInterface"
import type {CombatState} from "./types/CombatState"
import {shuffle} from "./helper methods/Shuffle"
import {nextInt} from "./helper methods/rng"
import type {Player,EnemyPlayer,Actor} from "./types/Player"
import {deck} from "./types/Card"
import {Intent,cardType as CardType} from "./types/enums"
import {cardDictionary} from "./cardLookUpDict"



function refreshAP(state:CombatState):CombatState{
  const newPlayer:Record<number,Player>={}
  for(const pl of Object.values(state.players)){
    newPlayer[pl.id]={
      ...pl,
      currAP:pl.maxAP
    }
  }
  return {
    ...state,
    players:newPlayer
  }
}



function expireStatuses(state:CombatState):CombatState{
  const players=state.players
  const enemies=state.enemies
  const newPlayer:Record<number,Player>={}
  const newEnemy:Record<number,EnemyPlayer>={}
  for(let key of Object.values(players)){
    let player=expireStatus(state,key) 
    newPlayer[key.id]=player
  }
    for(let key of Object.values(enemies)){
    const ep=expireStatus(state,key) 
    newEnemy[key.id]=ep
  }
  return { ...state, 
    players:newPlayer, 
    enemies:newEnemy }
}

function expireStatus<T extends EnemyPlayer|Player>(state:CombatState,actor:T):T{
  return {
    ...actor,
    statuses:actor.statuses.filter(status=>status.roundEnd>state.roundNum&&status.stacks>0)
  }
}


function expireBuffs(state: CombatState): CombatState {
  const players=state.players
  const enemies=state.enemies
  const newPlayer:Record<number,Player>={}
  const newEnemy:Record<number,EnemyPlayer>={}
  for(let key of Object.values(players)){
    let player=expire(state,key) 
    newPlayer[key.id]=player
  }
    for(let key of Object.values(enemies)){
    const ep=expire(state,key) 
    newEnemy[key.id]=ep
  }
  return { ...state, 
    players:newPlayer, 
    enemies:newEnemy }
}


function expire<T extends EnemyPlayer|Player>(state:CombatState,actor:T):T{
  return {
    ...actor,
    buffEffects:actor.buffEffects.filter(buff=>buff.expiryRound>state.roundNum)
  }
}


function rollSpeed(state:CombatState):CombatState{
    const allies=state.players
    const enemies=state.enemies
    const combined=[...Object.values(allies),...Object.values(enemies)]
    const arr:[number,number][]=[]
    let rng=state.rngState
    for(let i=0;i<combined.length;i++){
      const p=combined[i]
      if(p.currHp<=0){
        continue
      }
      const res=rollSpeedHelper(p,rng)
      rng=res[1]
      arr.push([p.id,res[0]])//id and speed
    }
    arr.sort((a,b)=>{
      const diff=b[1]-a[1]
      return diff===0?b[0]-a[0]:diff
    })
    return {
      ...state,
      rngState:rng,
    }
}



function rollSpeedHelper(char:Player|EnemyPlayer,rng:number):[number,number]{
  let minSpeed=char.team.map((a)=>a.minSpeed).reduce((sum,curr)=>sum+curr,0)
  let maxSpeed=char.team.map((a)=>a.maxSpeed).reduce((sum,curr)=>sum+curr,0)
  const res=nextInt(rng,minSpeed,maxSpeed)
  rng=res.nextState
  const rolledSpeed=res.value 
  return [rolledSpeed,rng]

}


function drawAll(state:CombatState):CombatState{
  const newPlayer:Record<number,Player>={}
  // const newEnemy:Record<number,EnemyPlayer>={}
  let rng=state.rngState

  for(let player of Object.values(state.players)){
    const res=draw(state,state.players[player.id].deck,state.players[player.id].handLimit,rng)
    newPlayer[player.id]={
      ...state.players[player.id],
      deck:res.newDeck
    }
    rng=res.rng
  }
  // for(let enemy of Object.values(state.enemies)){
  //   const res=draw(state,state.enemies[enemy.id].deck,state.enemies[enemy.id].handLimit,rng)
  //   newEnemy[enemy.id]={
  //     ...state.enemies[enemy.id],
  //     deck:res.newDeck
  //   }
  //   rng=res.rng
  // }
  const newState={
    ...state,
    players:newPlayer,
  rngState:rng
  }
  return newState
}


function draw(state: CombatState,deck:deck,handLimit:number,rng:number):{newDeck:deck,rng:number} {
  let drawPile = [...deck.drawPile]
  let discardPile = [...deck.discardPile]
  let hand = [...deck.hand]

  const drawCount = Math.min(handLimit - hand.length, 5)

  for (let i = 0; i < drawCount; i++) {
    if (drawPile.length === 0) {
      const shuffled = shuffle(discardPile, rng)
      drawPile = shuffled.result
      rng = shuffled.nextState
      discardPile = []
      if (drawPile.length === 0) break 
    }
    hand.push(drawPile.pop()!)
  }
  const newDeck={drawPile,discardPile,hand}

  return {newDeck:newDeck,
    rng:rng
  }
  
}

function rollEnemyIntents(state:CombatState):CombatState{
  let rng=state.rngState
  const newEnemies={...state.enemies}
  for(let enemy of Object.values(state.enemies)){
    if(enemy.currHp<=0){continue}
      const res=handleIntents(enemy,rng)
      newEnemies[enemy.id]=res.newEnemy
      rng=res.rng
  }


  return {
    ...state,
    enemies:newEnemies,
    rngState:rng
  }
}

function handleIntents(enemy:EnemyPlayer,rng:number):{newEnemy:EnemyPlayer,rng:number}{
  const deckLen=enemy.deck.hand.length
  const newRng=nextInt(rng,0,deckLen-1)
  const chosenCard=enemy.deck.hand[newRng.value]
  rng=newRng.nextState
  const newEnemy:EnemyPlayer={
    ...enemy,
    intent:cardTypeToIntent(chosenCard.cardType),
    intentCardId:chosenCard.cardId,
    roundNumUpdated:enemy.roundNumUpdated+1
  }
  return {
    newEnemy,
    rng
  }
}

function cardTypeToIntent(type: CardType): Intent {
  switch (type) {
    case CardType.ATK:         {return Intent.Attack}
    case CardType.GAIN_SHIELD:{ return Intent.Defend}
    case CardType.HEAL:        {return Intent.Heal}
    case CardType.BUFF:        {return Intent.Buff}
    case CardType.DEBUFF:      {return Intent.Debuff}
    default: return Intent.Unknown
  }
}



export {rollSpeed,draw,expireBuffs,drawAll,refreshAP,rollEnemyIntents,expireStatuses}
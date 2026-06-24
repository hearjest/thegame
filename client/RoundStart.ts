import type {Entity} from "./EntityInterface"
import type {CombatState} from "./types/CombatState"
import {shuffle} from "./helper methods/Shuffle"
import {nextInt} from "./helper methods/rng"
import type {Player,EnemyPlayer} from "./types/Player"


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
    const newTurnOrder=arr.map((a=>a[0]))
    return {
      ...state,
      rngState:rng,
      turnOrder:newTurnOrder
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


function draw(state: CombatState,playerId:number): CombatState {
  let rng = state.rngState
  let drawPile = [...state.players[playerId].deck.drawPile]
  let discardPile = [...state.players[playerId].deck.discardPile]
  let hand = [...state.players[playerId].deck.hand]

  const drawCount = Math.min(state.handLimit - hand.length, 5)

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


  return {
    ...state,
    rngState: rng,
    players: {
      ...state.players,                              
      [playerId]:{ ...state.players[playerId],
        deck:{drawPile,discardPile,hand},} 
    },
  }
}

export {rollSpeed,draw}
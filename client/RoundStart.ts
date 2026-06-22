import {Entity} from "./EntityInterface.ts"
import {CombatState} from "./types/CombatState.ts"
import {shuffle} from "./helper methods/Shuffle.ts"

function compareSpeed(a:Entity,b:Entity):number{
    const diff=b.rolledSpeed-a.rolledSpeed
    return diff===0? b.id-a.id : diff
}

function rollSpeed(state:CombatState){
    // const length=this.state.entities.length
    //for entity in entities, roll speed based on min, max speed
    // store in data
    // sort based on speed using compareSpeed
    // return 
    
}


function draw(state: CombatState,playerId:number): CombatState {
  let rng = state.rngState
  let drawPile = [...state.decks[playerId].drawPile]
  let discardPile = [...state.decks[playerId].discardPile]
  let hand = [...state.decks[playerId].hand]

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

  state.decks[playerId]={drawPile,discardPile,hand}
  return {
    ...state,
    rngState: rng,                
  }
}

export {compareSpeed,rollSpeed,draw}
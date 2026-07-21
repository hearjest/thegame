import { describe, it, expect } from "vitest"

import { applyAction } from "../CombatScene"
import { targetSide, targetType, Intent ,cardType,buffType} from "../types/enums"
import type { Action } from "../types/Action"
import type { Card, deck } from "../types/Card"
import type { CombatState } from "../types/CombatState"
import { Phase } from "../types/CombatState"
import  { Entity,makeEntity2 } from "../types/EntityInterface"
import type { EnemyPlayer, Player } from "../types/Player"


const ability2:Card={
    name:"pee",
    cardType:cardType.BUFF,
    cardId:2,
    APCost:2,
    cardSerialNumber:2,
    description:"desc",
    flavorText:"urine",
    targetSide:targetSide.ALLY,
    numTargets:3,
    canCherryPickIndividuals:true, //assuming you can target multiple individuals, you can choose somebody in position 1 and then 3, instead of being forced to target neighbors 1 and 2 or 2 and 3
    dmg:5,
    magDmg:0,
    inflicts:[],
    targetType:targetType.SELF,
          buffAmount:2,
    buffDuration:3,
    buffType:buffType.PHYS_DMG_MULT,
    belongsToEntityId:101
}


const strike: Card={
  name: "Strike",
  cardType:cardType.ATK,
  APCost: 2,
  cardId: 1,
  cardSerialNumber: 1,
  description: "Deal 6 damage.",
  flavorText: "thwack",
  targetSide: targetSide.ENEMY,
  numTargets: 1,
  canCherryPickIndividuals: false,
  dmg: 5,
  magDmg:0,
  inflicts: [],
  targetType: targetType.SINGLE_ENEMY,
      buffAmount:0,
    buffDuration:0,
    buffType:0,
    belongsToEntityId:1
}

const baseDeck: deck={
  hand: [strike],
  drawPile: [],
  discardPile: [],
}

const player1: Player={
  id: 1,
  team: [
    makeEntity2(101, 1, 0, 2, 4),
    makeEntity2(102, 1, 1, 3, 5),
    makeEntity2(103, 1, 2, 1, 3),
  ],
  deck: baseDeck,
  totalHp: 90,
  currHp: 90,
  rolledSpeed: -1,
  statuses: [],
  currAP: 3,
  maxAP: 3,
  coins: 50,
  items: [],
  handLimit: 5,
  combinedDEF:0,
  combinedMagDEF:0,
  position:0,
  buffEffects:[],
  roundNumUpdated:0,
}

const enemy1: EnemyPlayer={
  id: 1001,
  team: [
    makeEntity2(1101, 1001, 0, 3, 5),
    makeEntity2(1102, 1001, 1, 2, 4),
  ],
  deck: { hand: [], drawPile: [], discardPile: [] },
  totalHp: 60,
  currHp: 60,
  statuses: [],
  intent: Intent.Attack,
  combinedDEF:0,
  combinedMagDEF:0,
  position:0,
  buffEffects:[],
  roundNumUpdated:0,
  intentCardId:-1,
  handLimit:99
}

const state: CombatState={
  players: { 1: player1 },
  enemies: { 1001: enemy1 },
  phase: Phase.PLAYER_PHASE,
  roundNum: 1,
  seed: 42,
  rngState: 42,
  playersEndedTurn:[]
}

describe("playCard damage", () => {
  it("subtracts card damage from the targeted enemy-player's pool", () => {
    const action: Action={
      type: "playCard",
      ownerId: 1,
      cardId: 1,
      cardSerialNumber: 1,
      targets: [1001],
      entityId:101,
    }
    console.log(state.players[1].currAP)
    const result=applyAction(state, action)
    console.log(result.players[1].currAP)
    expect(result.enemies[1001].currHp).toBe(49)
  })

  it("floors HP at 0, never negative", () => {
    const weakState={
      ...state,
      enemies: { ...state.enemies, 1001: { ...state.enemies[1001], currHp: 3 } },
    }
    const action: Action={ type: "playCard", ownerId: 1, cardId: 1, cardSerialNumber: 1, targets: [1001],entityId:101 }
    const result=applyAction(weakState, action)
    expect(result.enemies[1001].currHp).toBe(0)
  })

  it("spends the card's AP cost", () => {
    const action: Action={ type: "playCard", ownerId: 1, cardId: 1, cardSerialNumber: 1, targets: [1001] ,entityId:101}
    console.log(state.players[1].currAP)
    const result=applyAction(state, action)
    console.log(result.players[1].currAP)
    expect(result.players[1].currAP).toBe(state.players[1].currAP - 2)
  })

  it("moves the played card to discard", () => {
    const action: Action={ type: "playCard", ownerId: 1, cardId: 1, cardSerialNumber: 1, targets: [1001],entityId:101 }
    console.log(state.players[1].deck)
    const result=applyAction(state, action)
    console.log(result.players[1].deck)
    expect(result.players[1].deck.hand.find((c) => c.cardSerialNumber === 1)).toBeUndefined()
    expect(result.players[1].deck.discardPile.some((c) => c.cardSerialNumber === 1)).toBe(true)
  })

  it("does not mutate the input state", () => {
    const action: Action={ type: "playCard", ownerId: 1, cardId: 1, cardSerialNumber: 1, targets: [1001],entityId:101 }
    const snapshotHp=state.enemies[1001].currHp
    applyAction(state, action)
    expect(state.enemies[1001].currHp).toBe(snapshotHp)
  })

  it("buff applies to entity",()=>{
      const baseDeck2: deck={
      hand: [ability2,strike],
      drawPile: [],
      discardPile: [],
    }
    state.players[1].deck=baseDeck2
    const action: Action={ type: "playCard", ownerId: 1, cardId: 2, cardSerialNumber: 2, targets: [1],entityId:101 }
    const snapshotbuffs=state.players[1].buffEffects.length
    const result=applyAction(state,action)
    console.log(result.players[1].buffEffects)
    expect(result.players[1].buffEffects.length).toBe(snapshotbuffs+1)
  })

  it("buff effects entity stats",()=>{
    const action: Action={ type: "playCard", ownerId: 1, cardId: 2, cardSerialNumber: 2, targets: [1],entityId:101 }
    const snapshotHp=state.players[1].team[1].atk
    const result=applyAction(state,action)
    
    const action2: Action={
      type: "playCard",
      ownerId: 1,
      cardId: 1,
      cardSerialNumber: 1,
      targets: [1001],
      entityId:101
    }
    console.log(result.enemies[1001].currHp)
    //console.log(result.players[1].deck)
    const result2=applyAction(result,action2)
    console.log(result2.enemies[1001].currHp)
    expect(result2.enemies[1001].currHp).toBe(state.enemies[1001].currHp-22)
  })




})


export {makeEntity2,player1,enemy1}
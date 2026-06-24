import { describe, it, expect } from "vitest"

import { applyAction } from "./CombatScene"
import { targetSide, targetType, Intent ,cardType} from "./enums"
import type { Action } from "./types/Action"
import type { Card, deck } from "./types/Card"
import type { CombatState } from "./types/CombatState"
import { Phase } from "./types/CombatState"
import type { Entity } from "./EntityInterface"
import type { EnemyPlayer, Player } from "./types/Player"

function makeEntity(id: number, playerId: number, position: number, minSpeed: number, maxSpeed: number): Entity {
  return {
    id,
    playerId,
    position,
    hp: 30,
    atk: 6,
    magAtk: 0,
    def: 5,
    magDef: 5,
    minSpeed,
    maxSpeed,
    rolledSpeed: -1,
  }
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
  inflicts: null,
  targetType: targetType.SINGLE_ENEMY,
      buffAmount:0,
    buffDuration:0,
    buffType:0,
}

const baseDeck: deck={
  hand: [strike],
  drawPile: [],
  discardPile: [],
}

const player1: Player={
  id: 1,
  team: [
    makeEntity(101, 1, 0, 2, 4),
    makeEntity(102, 1, 1, 3, 5),
    makeEntity(103, 1, 2, 1, 3),
  ],
  deck: baseDeck,
  totalHp: 90,
  currHp: 90,
  rolledSpeed: -1,
  statuses: null,
  currAP: 3,
  maxAP: 3,
  coins: 50,
  items: [],
  handLimit: 5,
  combinedDEF:0,
  combinedMagDEF:0,
  additiveATKBuff:0,
  additiveMagATKBuff:0,
  multiplicativeATKBuff:1,
  multiplicativeMagATKBuff:1,
  buffEffects:[]
}

const enemy1: EnemyPlayer={
  id: 1001,
  team: [
    makeEntity(1101, 1001, 0, 3, 5),
    makeEntity(1102, 1001, 1, 2, 4),
  ],
  deck: { hand: [], drawPile: [], discardPile: [] },
  totalHp: 60,
  currHp: 60,
  rolledSpeed: -1,
  statuses: null,
  intent: Intent.Attack,
  combinedDEF:0,
  combinedMagDEF:0,
  additiveATKBuff:0,
  additiveMagATKBuff:0,
  multiplicativeATKBuff:1,
  multiplicativeMagATKBuff:1,
  buffEffects:[]
}

const state: CombatState={
  players: { 1: player1 },
  enemies: { 1001: enemy1 },
  phase: Phase.ROUND_START,
  roundNum: 1,
  handLimit: 5,
  turnOrder: [1],
  turnOrderIndex: 0,
  seed: 42,
  rngState: 42,
}

describe("playCard damage", () => {
  it("subtracts card damage from the targeted enemy-player's pool", () => {
    const action: Action={
      type: "playCard",
      ownerId: 1,
      cardId: 1,
      cardSerialNumber: 1,
      targets: [1001],
    }
    console.log(state.players[1].currAP)
    const result=applyAction(state, action)
    console.log(result.players[1].currAP)
    expect(result.enemies[1001].currHp).toBe(55)
  })

  it("floors HP at 0, never negative", () => {
    const weakState={
      ...state,
      enemies: { ...state.enemies, 1001: { ...state.enemies[1001], currHp: 3 } },
    }
    const action: Action={ type: "playCard", ownerId: 1, cardId: 1, cardSerialNumber: 1, targets: [1001] }
    const result=applyAction(weakState, action)
    expect(result.enemies[1001].currHp).toBe(0)
  })

  it("spends the card's AP cost", () => {
    const action: Action={ type: "playCard", ownerId: 1, cardId: 1, cardSerialNumber: 1, targets: [1001] }
    console.log(state.players[1].currAP)
    const result=applyAction(state, action)
    console.log(result.players[1].currAP)
    expect(result.players[1].currAP).toBe(state.players[1].currAP - 2)
  })

  it("moves the played card to discard", () => {
    const action: Action={ type: "playCard", ownerId: 1, cardId: 1, cardSerialNumber: 1, targets: [1001] }
    console.log(state.players[1].deck)
    const result=applyAction(state, action)
    console.log(result.players[1].deck)
    expect(result.players[1].deck.hand.find((c) => c.cardSerialNumber === 1)).toBeUndefined()
    expect(result.players[1].deck.discardPile.some((c) => c.cardSerialNumber === 1)).toBe(true)
  })

  it("does not mutate the input state", () => {
    const action: Action={ type: "playCard", ownerId: 1, cardId: 1, cardSerialNumber: 1, targets: [1001] }
    const snapshotHp=state.enemies[1001].currHp
    applyAction(state, action)
    expect(state.enemies[1001].currHp).toBe(snapshotHp)
  })
})

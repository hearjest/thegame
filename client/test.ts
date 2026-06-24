import { rollSpeed, draw } from "./RoundStart"

import type { Card, deck } from "./types/Card"
import type { Entity } from "./EntityInterface"
import type { Player, EnemyPlayer } from "./types/Player"
import { targetSide, targetType ,cardType} from "./enums"
import {applyAction} from "./CombatScene"
import type { CombatState } from "./types/CombatState"
import { Phase } from "./types/CombatState"
// ---- helper to stamp out a character/enemy entity without repeating every field ----
function makeEntity(id: number, playerId: number, position: number, minSpeed: number, maxSpeed: number): Entity {
  return {
    id, playerId, position,
    hp: 30, atk: 6, magAtk: 0, def: 5, magDef: 5,
    minSpeed, maxSpeed,
    rolledSpeed: -1,  
  }
}

// ---- a couple of sample cards ----
const strike: Card={
  name: "Strike",
    cardType:cardType.ATK,
  APCost: 1,
  cardId: 100,
  cardSerialNumber: 1,     
  description: "Deal 6 damage.",
  flavorText: "thwack",
  targetSide: targetSide.ENEMY,
  numTargets: 1,
  canCherryPickIndividuals: false,
    dmg: 6,
  magDmg:0,
  inflicts: null,
  targetType: targetType.SINGLE_ENEMY,
        buffAmount:0,
    buffDuration:0,
    buffType:0,
}

const strike2: Card={ ...strike, cardSerialNumber: 2 }
const strike3: Card={ ...strike, cardSerialNumber: 3 }
const strike4: Card={ ...strike, cardSerialNumber: 4 }
const strike5: Card={ ...strike, cardSerialNumber: 5 }
const strike6: Card={ ...strike, cardSerialNumber: 6 }
const strike7: Card={ ...strike, cardSerialNumber: 7 }

// player 1's deck: empty hand, 7 cards in draw pile, empty discard
const deck1: deck={
  hand: [],
  drawPile: [strike, strike2, strike3, strike4, strike5, strike6, strike7],
  discardPile: [],
}

// player 2's deck: 2 in hand already, a few in draw, one in discard
const deck2: deck={
  hand: [{ ...strike, cardSerialNumber: 10 }, { ...strike, cardSerialNumber: 11 }],
  drawPile: [{ ...strike, cardSerialNumber: 12 }, { ...strike, cardSerialNumber: 13 }],
  discardPile: [{ ...strike, cardSerialNumber: 14 }],
}

// ---- two players, each with a 3-character team ----
const player1: Player={
  id: 1,
  team: [
    makeEntity(101, 1, 0, 2, 4),
    makeEntity(102, 1, 1, 3, 5),
    makeEntity(103, 1, 2, 1, 3),
  ],
  deck: deck1,
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
  multiplicativeATKBuff:0,
  multiplicativeMagATKBuff:0,
  buffEffects:[]
}

const player2: Player={
  id: 2,
  team: [
    makeEntity(201, 2, 0, 4, 6),
    makeEntity(202, 2, 1, 2, 4),
    makeEntity(203, 2, 2, 3, 5),
  ],
  deck: deck2,
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
  multiplicativeATKBuff:0,
  multiplicativeMagATKBuff:0,
  buffEffects:[]
}

// ---- two enemy-players, each with their own team of enemies ----
import { Intent } from "./enums"

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
  multiplicativeATKBuff:0,
  multiplicativeMagATKBuff:0,
  buffEffects:[]
}

const enemy2: EnemyPlayer={
  id: 1002,
  team: [
    makeEntity(1201, 1002, 0, 5, 7),
  ],
  deck: { hand: [], drawPile: [], discardPile: [] },
  totalHp: 30,
  currHp: 30,
  rolledSpeed: -1,
  statuses: null,
  intent: Intent.Defend,
    combinedDEF:0,
  combinedMagDEF:0,
    additiveATKBuff:0,
  additiveMagATKBuff:0,
  multiplicativeATKBuff:0,
  multiplicativeMagATKBuff:0,
  buffEffects:[]
}

// ---- the combat state ----
const state: CombatState={
  players: { 1: player1, 2: player2 },
  enemies: { 1001: enemy1, 1002: enemy2 },
  phase: Phase.ROUND_START,
  roundNum: 1,
  handLimit: 5,
  turnOrder: [],
  turnOrderIndex: 0,
  seed: 42,
  rngState: 42,
}


// ---- run it ----
const afterSpeed=rollSpeed(state)
console.log("turnOrder:", afterSpeed.turnOrder)
console.log("rngState advanced:", afterSpeed.rngState !== state.rngState)
console.log(state.players[1].deck)
const afterDraw=draw(afterSpeed, 1)
console.log(afterDraw.players[1].deck)
console.log("player 1 hand size:", afterDraw.players[1].deck.hand.length)
console.log("input unmutated:", state.turnOrder.length === 0 && state.rngState === 42)
//console.log(state)

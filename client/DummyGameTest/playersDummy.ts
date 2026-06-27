
import {Entity} from "../EntityInterface"
import {Card,deck} from "../types/Card"
import {cardDictionary,getCardById} from "../cardLookUpDict"
import {Player,EnemyPlayer,Actor} from "../types/Player"
import { targetSide, targetType, Intent ,cardType,buffType} from "../enums"

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

const baseDeckPlayer:deck={
      hand: [getCardById(1),getCardById(1),getCardById(1),getCardById(1),getCardById(2),getCardById(2)],
  drawPile: [],
  discardPile: [],
}

const baseDeckEnemy:deck={
      hand: [getCardById(1),getCardById(1),getCardById(1),getCardById(1),getCardById(2),getCardById(2)],
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
  deck: baseDeckPlayer,
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
  roundNumUpdated:0
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
  statuses: [],
  intent: Intent.Attack,
  combinedDEF:0,
  combinedMagDEF:0,
  position:0,
  buffEffects:[],
  roundNumUpdated:0,
  handLimit:99,
  intentCardId:-1
}

const players=[player1]
const enemies=[enemy1]

export {players,enemies}
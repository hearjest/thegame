import { WebSocketServer, WebSocket } from 'ws'
import type { CombatState } from '../engine/types/CombatState'
import {selectedCharacters} from "../engine/types/enums"

type lobbyMember={
    playerId:number,
    selectedChars:selectedCharacters[],
    readyStatus:boolean
}//for lobby use only to see what other people are selecting and if they are ready or not

type Room={
    roomId:number,
    clientConnections:Map<WebSocket,lobbyMember>,
    maxCapacity:number,
    playerIds:number[]
    state:CombatState|null,
    isPublic:boolean,
    started:boolean,
}


export {Room,lobbyMember}
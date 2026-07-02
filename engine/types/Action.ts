import {selectedCharacters} from "./enums"
type Action=
| {type:"initPlayer";ownerId:number;chars:selectedCharacters[]}
| {type:"playCard"; ownerId:number; cardId:number;cardSerialNumber:number;targets:number[];entityId:number;}//targets are ids
| {type:"playEnemyIntent"; enemyId:number;entityId:number,cardId:number}
| {type:"useItem"; ownerId:number; itemId:number;targets:number[]}
| {type:"reposition"; ownerId:number;entityId:number;positionNum:number}
| {type:"endTurn"; ownerId:number}
| {type:"begin";roomId:number}
| {type:"createRoom";isPublic:boolean;maxCapacity:number;}
| {type:"playerReady";roomId:number;ownerId:number}
| {type:"updateLobbyStateOnCharSelect";selected:selectedCharacters[];ownerId:number;roomId:number}


export type {Action}
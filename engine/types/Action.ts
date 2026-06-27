type Action=
| {type:"playCard"; ownerId:number; cardId:number;cardSerialNumber:number;targets:number[];entityId:number}//targets are ids
| {type:"playEnemyIntent"; enemyId:number;entityId:number,cardId:number}
| {type:"useItem"; ownerId:number; itemId:number;targets:number[]}
| {type:"reposition"; ownerId:number;entityId:number;positionNum:number}
| {type:"endTurn"; ownerId:number}


export type {Action}
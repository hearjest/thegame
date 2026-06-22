type Action=
| {type:"playCard"; ownerId:number; cardId:number;cardSerialNumber:number;targets:number[]}//targets are ids
| {type:"useItem"; ownerId:number; itemId:number;targets:number[]}
| {type:"reposition"; ownerId:number;entityId:number;positionNum:number}
| {type:"endTurn"; ownerId:number}


export {Action}
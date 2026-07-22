
import { WebSocketServer, WebSocket } from 'ws'
import type { CombatState } from '../engine/types/CombatState'
import type { Action } from '../engine/types/Action'
import { applyAction } from '../engine/CombatScene'
import { players, enemies } from '../engine/DummyGameTest/playersDummy'
import { advance, initState ,initPlayer,playerDisconnected,makePlayer} from '../engine/gameStart'  
import { getRoster } from '../engine/roster'
import {Room,lobbyMember} from "./room"
import {Player} from "../engine/types/Player"


let playerIdCounter=0  
const socketToPlayerIdMap:Map<WebSocket,number>=new Map()
let roomIdCounter=0
const roomIdToRoomMap:Map<number,Room>=new Map()
const socketToRoomIdMap:Map<WebSocket,number>=new Map()
const PORT = 8080
const wss = new WebSocketServer({ port:8080,host:'0.0.0.0' });


wss.on('connection', (socket) => {
  const myId = playerIdCounter++
  socketToPlayerIdMap.set(socket, myId)

  socket.send(JSON.stringify({ type: 'assigned', playerId: myId }))
  socket.send(JSON.stringify({ type: 'roster', characters: getRoster() }))
  socket.send(JSON.stringify({ type: 'loadRoomSelect',}))
  socket.send(JSON.stringify({type:"roomList",rooms:getPubRooms()}))

  socket.on('message', (raw) => {//messages start here
    let action
    try {
        action = JSON.parse(raw.toString()) 
    }catch {
        socket.send(JSON.stringify({ type: 'error', message: 'bad JSON' })); 
        return 
    }
    
    if(typeof action!== 'object' || action===null) {socket.send(JSON.stringify({ type: 'error', message: 'bad message shape' }));return}


    switch (action.type) {


        case "playerReady":{
            const room=roomIdToRoomMap.get(action.roomId)
            if(room===undefined){socket.send(JSON.stringify({type:"error",message:"tried readying up, but room not found"}));return}
            const playerStatus=room.clientConnections.get(socket)
            if(playerStatus===undefined){socket.send(JSON.stringify({type:"error",message:"tried readying player, failed to get lobbyMember"})); return}
            playerStatus.readyStatus=true
            let allPlayersReady=true
            for(const player of room.clientConnections.values()){
                if(player.readyStatus===false){
                    allPlayersReady=false
                    break
                }
            }
            let players:Player[]=[]
            let dat;
            if(allPlayersReady){
                for(const player of room.clientConnections.values()){
                    players.push(makePlayer(player.playerId,player.selectedChars))
                }
                room.state=initState(players)
                room.started=true
                dat=JSON.stringify({type:"state",state:room.state})
            }else{
                dat=JSON.stringify({type:"lobbyState",roomId:action.roomId,members:[...room.clientConnections.values()]})
            }
            broadcastToRoom(room,dat)
            return 

        }


        case "updateLobbyStateOnCharSelect":{
            const room=roomIdToRoomMap.get(action.roomId)
            if(room===undefined){socket.send(JSON.stringify({type:"error",message:"tried updating selection, but room not found"}));return}
            const player=room.clientConnections.get(socket)
            if(player===undefined){socket.send(JSON.stringify({type:"error",message:"tried updating selection, but player not found"}));return}
            player.selectedChars=action.selected
            broadcastToRoom(room,JSON.stringify({type:"lobbyState",roomId:action.roomId,members:[...room.clientConnections.values()]}))
            return
        }


        case "createRoom": {
            const room = createRoom(socket, action.isPublic, action.maxCapacity)
            if (room === undefined) {socket.send(JSON.stringify({type:"error",message:"tried making room, but return undefined"}));return}
            socket.send(JSON.stringify({ type: "createRoom", roomId: room.roomId, maxCapacity: room.maxCapacity }))
            return
        }


        case "getRoomList": {
            socket.send(JSON.stringify({ type: "roomList", rooms: getPubRooms()}))
            return
        }


        case "joinRoom": {
            joinRoom(socket, action.roomId)
            return
        }

        
        default:{
            const roomId=socketToRoomIdMap.get(socket)
            if(roomId===undefined){socket.send(JSON.stringify({type:"error",message:"failed to get roomId from socket"})); return}
            const room=roomIdToRoomMap.get(roomId)
            if(room===undefined){socket.send(JSON.stringify({type:"error",message:"tried to start game, but couldnt find room"}));return}
            if(room.state===null){socket.send(JSON.stringify({type:"error",message:"tried to start game, but state was null"})); return}
            if ('ownerId' in action && action.ownerId !== socketToPlayerIdMap.get(socket)) {socket.send(JSON.stringify({ type: 'error', message: 'not your player'}));return}
            room.state = applyAction(room.state, action)
            room.state = advance(room.state)
            const dat=JSON.stringify({type:"state",state:room.state})
            broadcastToRoom(room,dat)
            return
        }
    }
})//MESSAGES END HERE----------------------------------------------------------------------------

  socket.on('close', () => {
    const roomId=socketToRoomIdMap.get(socket)
    if(roomId!==undefined){
        const room=roomIdToRoomMap.get(roomId)
        if(room!==undefined){
            if(room.state!==null){room.state = playerDisconnected(room.state, myId)}
            room.clientConnections.delete(socket)
            socketToPlayerIdMap.delete(socket)
            const dat=JSON.stringify({type:"lobbyState",roomId:roomId,members:[...room.clientConnections.values()]})
            broadcastToRoom(room,dat)
            if(room.clientConnections.size===0){
                roomIdToRoomMap.delete(roomId)
            }
        }
        socketToRoomIdMap.delete(socket)
    }else{
        console.log("nsoienoe")
    }
    socketToPlayerIdMap.delete(socket)
    console.log('client disconnected:', myId)
  })
  socket.on('error', (err) => console.error('socket error:', err))
})





function broadcastPubroomIdToRoomMap(){
    const pubs=getPubRooms()
    for(const cli of wss.clients){
        if(cli.readyState===WebSocket.OPEN&&!socketToRoomIdMap.has(cli)){//client not already in room
            cli.send(JSON.stringify({type:"roomList",rooms:getPubRooms()}))
        }
    }
}//maybe just add a manual refresh button instead

function getPubRooms(){
    const r=[]
    for(const room of roomIdToRoomMap.values()){
        if(room.isPublic && room.started===false &&room.clientConnections.size<room.maxCapacity){
            r.push({roomId: room.roomId, count: room.clientConnections.size, maxCapacity: room.maxCapacity})
        }
    }
    return r
}


function createRoom(socket:WebSocket,isPublic:boolean,maxCapacity:number):Room|undefined{
    const playerId=socketToPlayerIdMap.get(socket)
    if(playerId===undefined){
        socket.send(JSON.stringify({type:"error",message:"Tried making room, but cant find player id"}))
        return undefined
    }
    const roomId=roomIdCounter++
    const room:Room={
        roomId:roomId,
        clientConnections:new Map<WebSocket,lobbyMember>().set(socket,createLobbyMember(playerId)),
        maxCapacity:maxCapacity,
        isPublic:isPublic,
        started:false,
        state:null,
        playerIds:[playerId],
    }
    console.log(room)
    roomIdToRoomMap.set(roomId,room)
    socketToRoomIdMap.set(socket,roomId)
    return room
}


function createLobbyMember(playerId:number):lobbyMember{
    return {
        playerId:playerId,
        selectedChars:[],
        readyStatus:false
    }
}

function joinRoom(socket:WebSocket,roomId:number){
    const requestedRoom=roomIdToRoomMap.get(roomId)
    if(requestedRoom===undefined){
        socket.send(JSON.stringify({type:"error",message:"Tried joining room, but room not found"}))
        return
    }
    if(requestedRoom.clientConnections.size>=requestedRoom.maxCapacity){
        socket.send(JSON.stringify({type:"error",message:"Tried joining room, but room was full"}))
        return
    }
    if(requestedRoom.started){
        socket.send(JSON.stringify({type:"error",message:"Tried joining room, but room had already started game"}))
        return
    }
    const playerId=socketToPlayerIdMap.get(socket)
    if(playerId===undefined){
        socket.send(JSON.stringify({type:"error",message:"Tried joining room but couldnt find player id"}))
        return
    }
    requestedRoom.clientConnections.set(socket,createLobbyMember(playerId))
    socketToRoomIdMap.set(socket,roomId)
    const dat=JSON.stringify({type:"lobbyState",roomId:requestedRoom.roomId,members:[...requestedRoom.clientConnections.values()]})
    broadcastToRoom(requestedRoom,dat)
}


function broadcastToRoom(room:Room,dat:string){
    room.clientConnections.forEach((member,socket)=>{
        if(socket.readyState===WebSocket.OPEN){
            socket.send(dat)
        }
    })
}



import { WebSocketServer, WebSocket } from 'ws'
import type { CombatState } from '../engine/types/CombatState'
import type { Action } from '../engine/types/Action'
import { applyAction } from '../engine/CombatScene'
import { players, enemies } from '../engine/DummyGameTest/playersDummy'
import { advance, initState ,initPlayer,playerDisconnected} from '../engine/gameStart'  


let playerIdCounter=0  
const connectionsPlayers=new Map()
const PORT = 8080

const wss = new WebSocketServer({ port: PORT })

let state: CombatState = initState([], enemies)

wss.on('connection', (socket) => {

    console.log('client connected')
    connectionsPlayers.set(socket,playerIdCounter)
    socket.send(JSON.stringify({ type: 'assigned', playerId:playerIdCounter }))
    
    state=initPlayer(state,playerIdCounter)

    sendToAllPlayers(state)
    playerIdCounter+=1
    socket.on('message', (raw) => {
        let action: Action
        try {
            action = JSON.parse(raw.toString())
        } catch {
            socket.send(JSON.stringify({ type: 'error', message: 'bad JSON' }))
            return
        }
        if(action.type==="playCard"&&action.ownerId!==connectionsPlayers.get(socket)){
            console.log(action)
            console.log("action id",action.ownerId)
            console.log("socket id",connectionsPlayers.get(socket))
            socket.send(JSON.stringify({ type: 'error', message: 'not your player' }))
            return
        }
            
        if(action.type==="begin"){
            state=advance(state)
            sendToAllPlayers(state)
        }else{
            state = applyAction(state, action)
            state = advance(state)
        }
        
        //socket.send(JSON.stringify({ type: 'state', state }))
        sendToAllPlayers(state)
    })
    socket.on('close', () => {
        console.log('client disconnected')
        state=playerDisconnected(state,connectionsPlayers.get(socket))
        sendToAllPlayers(state)
    })
    socket.on('error', (err) => console.error('socket error:', err))
    
})



function sendToAllPlayers(state:CombatState){
    for(const cli of wss.clients){
        if(cli.readyState===WebSocket.OPEN){
            cli.send(JSON.stringify({type:"state",state}))
        }
    }
}

console.log(`game server listening on ws://localhost:${PORT}`)
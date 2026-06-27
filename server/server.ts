
import { WebSocketServer, WebSocket } from 'ws'
import type { CombatState } from '../engine/types/CombatState'
import type { Action } from '../engine/types/Action'
import { applyAction } from '../engine/CombatScene'
import { players, enemies } from '../engine/DummyGameTest/playersDummy'
import { advance, initState } from '../engine/gameStart'  
const PORT = 8080
const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (socket) => {
  console.log('client connected')

  let state: CombatState = advance(initState(players, enemies))
  socket.send(JSON.stringify({ type: 'state', state }))

  socket.on('message', (raw) => {
    let action: Action
    try {
      action = JSON.parse(raw.toString())
      console.log(action)
    } catch {
      socket.send(JSON.stringify({ type: 'error', message: 'bad JSON' }))
      return
    }

    state = applyAction(state, action)
    state = advance(state)
    socket.send(JSON.stringify({ type: 'state', state }))
  })

  socket.on('close', () => console.log('client disconnected'))
  socket.on('error', (err) => console.error('socket error:', err))
})

console.log(`game server listening on ws://localhost:${PORT}`)
const PHASE = ["ROUND_START","ENTITY_TURN","TURN_END","WON","LOSS","RESOLVE","PLAYER_PHASE","ENEMY_PHASE","PLAYER_TURN_END","ENEMY_TURN_END","PLAYERS_ALL_END"];
const INTENT = ["Attack","Defend","Unknown","Heal","Buff","Debuff"];
const CARDTYPE = ["BUFF","DEBUFF","ATK","HEAL","GAIN_SHIELD"];
const PARTY_SIZE = 2;

let state = null;
let selectedEnemyId = null;
let myplayerid = null;
let roster = []; 
let selected = [];
let currRoomId=-1
//SOCKETS-------------------------------
const WS_URL = "wss://wss.wraityapp.net";
const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_DELAY = 15000;
let reconnectDelay = RECONNECT_BASE_DELAY;
let reconnectTimer = null;
let shouldReconnect = true;
let socket = null;

function connectSocket() {
  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    reconnectDelay = RECONNECT_BASE_DELAY;
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    log("connected");
    showScreen("rooms");
  };

  socket.onclose = (event) => {
    if (!shouldReconnect || event.code === 1000) return;
    reconnectWithBackoff();
  };

  socket.onerror = (error) => {console.error('WebSocket error:', error);}

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "error")    { log("server error: " + msg.message); return; }
    if (msg.type === "assigned") { myplayerid = msg.playerId; log("you are player " + myplayerid); return; }
    if (msg.type === "roster")   { roster = msg.characters; renderRoster(); return; }
    if (msg.type === "state")    { state = msg.state; showScreen("combat"); render(); return; }
    if(msg.type==="roomList"){ renderRoomList(msg.rooms); return; }
    if(msg.type==="loadRoomSelect"){showScreen("rooms"); return}
    if(msg.type==="createRoom"){ showScreen("lobby"); currRoomId=msg.roomId;return; }
    if(msg.type==="lobbyState"){ showScreen("lobby"); renderLobby(msg.roomId, msg.members); return; }
    if(msg.type==="beginGame"){showScreen("combat"); state=msg.state; render();}
  };
}

function reconnectWithBackoff() {
  if (reconnectTimer !== null) return;

  const delay = reconnectDelay;
  reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY);
  log(`connection lost, retrying in ${Math.round(delay / 1000)}s`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (!shouldReconnect) return;
    connectSocket();
  }, delay);
}

connectSocket();

// Heartbeat mechanism to prevent 1006
const heartbeat = setInterval(() => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);

function send(action) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    log("not connected yet");
    return;
  }
  socket.send(JSON.stringify(action));
}
//SOCKETS----------------------------------------------------------------------------------------
window.addEventListener("beforeunload",()=>{
  shouldReconnect = false;
  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) socket.close();
});















//ROOMS--------------------------------------------------------------------------------------------
function createRoom(){
  const isPublic=document.querySelector('input[name="visibility"]:checked').value==="public"
  const maxCapacity=Number(document.getElementById("capacity").value)
  send({type:"createRoom",isPublic:isPublic,maxCapacity:maxCapacity})
}

function refreshRoomList(){
    send({type:"getRoomList"})
}

function joinRoom(roomId){
  send({type:"joinRoom",roomId:roomId})
}

function renderRoomList(list) {
  const el = document.getElementById("roomList")
  el.innerHTML = ""
  for (const r of list) {
    const div = document.createElement("div")
    div.textContent = `Room ${r.roomId} — ${r.count}/${r.maxCapacity} `
    const btn = document.createElement("button")
    btn.textContent = "Join"
    btn.onclick = () => joinRoom(r.roomId)
    div.appendChild(btn)
    el.appendChild(div)
  }
}



//ROOMS END----------------------------------------------------------------------------

//SCREEN/VISUALS STUFF
function showScreen(name) {
  document.getElementById("roomSelection").style.display = name === "rooms"  ? "block" : "none";
  document.getElementById("lobbyScreen").style.display   = name === "lobby"  ? "block" : "none";
  document.getElementById("combatScreen").style.display  = name === "combat" ? "block" : "none";
}

function renderLobby(roomId, members) {
  console.log(roomId)
  currRoomId=roomId
  document.getElementById("lobbyRoomId").textContent = `Room ${roomId}`;
  const el = document.getElementById("lobbyMembers");
  el.innerHTML = "";
  for (const m of members) {
    const div = document.createElement("div");
    const picks = m.selectedChars.length ? m.selectedChars.join(", ") : "choosing…";
    const ready = m.readyStatus ? "READY" : "not ready";
    div.textContent = `Player ${m.playerId} — ${picks} — ${ready}`;
    el.appendChild(div);
  }
}

function showEndOverlay(text) {
  const o = document.getElementById("endOverlay");
  document.getElementById("endText").textContent = text;
  o.style.display = "flex";
}

function hideEndOverlay() {
  document.getElementById("endOverlay").style.display = "none";
}

function backToRooms() {
  hideEndOverlay();
  showScreen("rooms");
  send({ type: "getRoomList" });
}
//SCREEN/VISUALS STUFF END




















//CHARACTER SELECTION BEGIN --------------------------------------------------------
function renderRoster() {
  const el = document.getElementById("roster");
  el.innerHTML = "";
  for (const c of roster) {
    const picked = selected.includes(c.key);
    const div = document.createElement("div");
    div.className = "char" + (picked ? " picked" : "");
    div.innerHTML =
      `<div class="cname">${c.name}</div>` +
      `<div class="stat"><span>HP</span><span>${c.hp}</span></div>` +
      `<div class="stat"><span>ATK</span><span>${c.atk}</span></div>` +
      `<div class="stat"><span>MAG ATK</span><span>${c.magAtk}</span></div>` +
      `<div class="stat"><span>DEF</span><span>${c.def}</span></div>` +
      `<div class="stat"><span>MAG DEF</span><span>${c.magDef}</span></div>` +
      `<div class="pickmark">${picked ? "✓ picked" : ""}</div>`;
    div.onclick = () => {
      togglePick(c.key);

    };
    el.appendChild(div);
  }
  const btn = document.getElementById("confirmBtn");
  btn.textContent = `Confirm (${selected.length}/${PARTY_SIZE})`;
  btn.disabled = selected.length !== PARTY_SIZE;
}

function togglePick(key) {
  const i = selected.indexOf(key);
  if (i >= 0) { selected.splice(i, 1); }                         
  else if (selected.length < PARTY_SIZE) { selected.push(key); }
  renderRoster()
  send({type:"updateLobbyStateOnCharSelect",selected:selected,ownerId:myplayerid,roomId:currRoomId})
}

function confirmSelection() {
  if (selected.length !== PARTY_SIZE) return;
  const el = document.getElementsByClassName("char");
  for (const node of el) node.onclick = null;
  send({type:"playerReady",ownerId:myplayerid,roomId:currRoomId})
}


function toggleReady(){
  send({type:"playerReady",roomId:currRoomId,ownerId:myplayerid})
}
//CHARACTER SELECTION END----------------------------------------------------





























//GAMEPLAY BEGIN --------------------------------------------------------------
function playCard(card) {
  if (selectedEnemyId === null) { log("select an enemy first"); return; }
  const me = state.players[myplayerid];
  if (me.currAP < card.APCost) { log("not enough AP"); return; }
  send({
    type: "playCard",
    ownerId: myplayerid,
    cardId: card.cardId,
    cardSerialNumber: card.cardSerialNumber,
    targets: [selectedEnemyId],
    entityId: card.belongsToEntityId,
    roomId:currRoomId
  });
  selectedEnemyId=null
}
function begin()   { send({ type: "begin" ,roomId:currRoomId}); }
function endTurn() { send({ type: "endTurn", ownerId: myplayerid,roomId:currRoomId }); }
function selectEnemy(id) { selectedEnemyId = id; render(); }

function hpPct(curr, total) { return total > 0 ? Math.max(0, curr) / total * 100 : 0; }

function render() {
  if (!state) return;

  document.getElementById("beginBtn").style.display =
    (state.roundNum > 0) ? "none" : "block";

  document.getElementById("navMeta").innerHTML =
    `ROUND <b>${state.roundNum}</b> &nbsp;·&nbsp; ${PHASE[state.phase] ?? state.phase}`;

  const me = state.players[myplayerid];

  if (me) {
    document.getElementById("navHpText").textContent = `${me.currHp}/${me.totalHp}`;
    document.getElementById("navHpFill").style.width = hpPct(me.currHp, me.totalHp) + "%";
    document.getElementById("apText").textContent = `${me.currAP}/${me.maxAP}`;
  }

  const enemiesEl = document.getElementById("enemies");
  enemiesEl.innerHTML = "";
  for (const e of Object.values(state.enemies)) {

    const div = document.createElement("div");
    const alive = e.currHp > 0;
    div.className = "actor enemy" + (alive ? " targetable" : " dead") +
                    (e.id === selectedEnemyId ? " selected" : "");
    div.innerHTML =
      `<div class="name">${e.name}</div>` +
      `<div class="hpbar"><div class="hpfill" style="width:${hpPct(e.currHp,e.totalHp)}%"></div></div>` +
      `<div class="hptext">${e.currHp}/${e.totalHp}</div>` +
      `<div class="intent">⚔ ${INTENT[e.intent] ?? e.intent}</div>` +
      `<div class="small">DEF ${e.combinedDEF}/${e.combinedMagDEF}</div>`;
    if (alive) div.onclick = () => selectEnemy(e.id);
    enemiesEl.appendChild(div);
  }

  const playersEl = document.getElementById("players");
  playersEl.innerHTML = "";
  for (const p of Object.values(state.players)) {
    const div = document.createElement("div");
    const isMe = p.id === myplayerid;
    div.className = "actor player" + (isMe ? " me" : "") + (p.currHp <= 0 ? " dead" : "");
    div.innerHTML =
      `<div class="name">Player ${p.id}${isMe ? '<span class="tag">YOU</span>' : ''}</div>` +
      `<div class="hpbar"><div class="hpfill" style="width:${hpPct(p.currHp,p.totalHp)}%"></div></div>` +
      `<div class="hptext">${p.currHp}/${p.totalHp}</div>` +
      `<div class="small">AP ${p.currAP}/${p.maxAP} &nbsp; DEF ${p.combinedDEF}/${p.combinedMagDEF}</div>`;
      // `<div class="small">${p.team[0].}|${p.team[1]} &nbsp; ${p.team[0]}|${p.team[1]}</div>`
    playersEl.appendChild(div);
  }

  const handEl = document.getElementById("hand");
  handEl.innerHTML = "";
  if (me) {
    for (const card of me.deck.hand) {
      const div = document.createElement("div");
      const unplayable = me.currAP < card.APCost;
      div.className = "card" + (unplayable ? " unplayable" : "");
      div.innerHTML =
        `<div class="cost">${card.APCost}</div>` +
        `<div class="cardname">${card.name}</div>` +
        `<div class="cardtype">${CARDTYPE[card.cardType]}</div>` +
        `<div class="carddmg">${card.dmg}/${card.magDmg}</div>`;
      if (!unplayable) div.onclick = () => playCard(card);
      handEl.appendChild(div);
    }
  }

if (PHASE[state.phase] === "WON")  { showEndOverlay("YOU WON"); }
  else if (PHASE[state.phase] === "LOSS") { showEndOverlay("YOU LOST"); }
  else { hideEndOverlay(); }
}
//GAMEPLAY END--------------------------------------------------------------------

function log(msg) {
  console.log(msg)
  const el = document.getElementById("log");

  el.textContent = msg + "\n" + el.textContent;
}



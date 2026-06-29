const PHASE = ["ROUND_START","ENTITY_TURN","TURN_END","WON","LOSS","RESOLVE","PLAYER_PHASE","ENEMY_PHASE","PLAYER_TURN_END","ENEMY_TURN_END","PLAYERS_ALL_END"];
  const INTENT = ["Attack","Defend","Unknown","Heal","Buff","Debuff"];
  const CARDTYPE = ["BUFF","DEBUFF","ATK","HEAL","GAIN_SHIELD"];

  let state = null;
  let selectedEnemyId = null;
  let myplayerid = null;

  const socket = new WebSocket("ws://192.168.1.249:8080");

  socket.onopen = () => log("connected");
  socket.onclose = () => log("disconnected");
  socket.onerror = (e) => log("ws error (is the server running?)");

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "error") { log("server error: " + msg.message); return; }
    if (msg.type === "assigned") { myplayerid = msg.playerId; log("you are player " + myplayerid); return; }
    if (msg.type === "state") { state = msg.state; render(); }
  };

  function send(action) { socket.send(JSON.stringify(action)); }

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
    });
  }
  function begin()   { send({ type: "begin" }); }
  function endTurn() { send({ type: "endTurn", ownerId: myplayerid }); }
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
        `<div class="name">Enemy ${e.id}</div>` +
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

    if (PHASE[state.phase] === "WON") log("YOU WON");
    if (PHASE[state.phase] === "LOSS") log("YOU LOST");
  }

  function log(msg) {
    const el = document.getElementById("log");
    el.textContent = msg + "\n" + el.textContent;
  }
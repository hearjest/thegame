
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


export {createRoom,refreshRoomList,renderRoomList,joinRoom}
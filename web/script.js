const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let tablePoint = []
let maxPoint = 2
let selectedPoint = null;
//Ajout de tout les evenement des boutons

function addPoint(){
  if(tablePoint.length+1 <= maxPoint){
    let id = tablePoint.length;
    tablePoint[tablePoint.length] = {
        selected: false,
        id: id,
        x: tablePoint.length*20,
        y: 0,
        height: 20,
        width: 20
    }
  }else{
    console.log('nbr max de point atteint');
  }

}

document.getElementById('start').addEventListener('click',(e)=>{
  console.log('salut')
});
document.getElementById('clean').addEventListener('click',(e)=>{
  cleanCtx()
});
document.getElementById('stop').addEventListener('click',(e)=>{
  console.log('salut')
});

document.getElementById('add').addEventListener('click',eventAddPoint);

document.getElementById('delete').addEventListener('click',(e)=>{
  console.log('salut')
});

canvas.addEventListener('click',(e)=>{
  let pos = getMousePos(canvas,e)
  if(selectedPoint != null){
    tablePoint[selectedPoint].x = pos.x
    selectedPoint = null
    update()
  }else{
    for (var i = 0; i < tablePoint.length; i++) {
      if(isIn(pos,tablePoint[i])){
        selectedPoint = i;
        tablePoint[i].selected = true
        update()
        break
      }
    }
  }
});

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}
function isIn(position,scare){
  try {
    if(scare.x < position.x &&
      position.x < scare.x + scare.width &&
      scare.y < position.y &&
      position.y < scare.y + scare.height){
          return true
        }else{
          return false
        }
  } catch (e) {
    return false
  }
}
function setPointPosition(point,position){
  point.x = position
}

function eventAddPoint(){
  addPoint()
  /*
  console.log(tablePoint);
  ctx.fillStyle='#990404'
  ctx.fillRect(tablePoint[0].x,tablePoint[0].y,20,20)
  ctx.fillStyle='#FFFFFF'
  ctx.font='20px DejaVu Sans Mono'
  ctx.fillText(tablePoint[0].id,0,20)
  */
  update()
}
function drawPoint(point){
  ctx.fillStyle='#990404'
  if(point.selected = true) ctx.fillStyle='#333333'
  else ctx.fillStyle='#ffffff'
  ctx.fillRect(point.x,point.y,point.width,point.height)
  ctx.fillStyle='ffffff'
  ctx.font='20px DejaVu Sans Mono'
  ctx.fillText(point.id,point.x,20)
}

function update(){
  cleanCtx()
  for (var i = 0; i < tablePoint.length; i++) {
    console.log(tablePoint[i])
    drawPoint(tablePoint[i])
  }
}
function cleanCtx(){
  ctx.fillStyle='#FFFFFF'
  ctx.fillRect(0,0,canvas.width,canvas.height)
  ctx.fillStyle='#000000'
  ctx.fillRect(0,10,canvas.width,5)
}
cleanCtx()

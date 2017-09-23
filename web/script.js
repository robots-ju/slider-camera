const canvas = document.getElementById('canvas')
let pos1 = document.getElementById('position1')
let pos2 = document.getElementById('position2')

const ctx = canvas.getContext('2d')
let tablePoint = []
let maxPoint = 2
let selectedPoint = null;

//Ajout de tout les evenement des boutons

function addPoint(){
  if(tablePoint.length+1 <= maxPoint){
    let identity = tablePoint.length;
    tablePoint[tablePoint.length] = {
        selected: false,
        id: identity + 1,
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
  tablePoint = []
  cleanCtx()
});
document.getElementById('try').addEventListener('click',(e)=>{
  simuled()
})
document.getElementById('stop').addEventListener('click',(e)=>{
  console.log('salut')
});

document.getElementById('add').addEventListener('click',eventAddPoint);

document.getElementById('delete').addEventListener('click',(e)=>{

});

canvas.addEventListener('click',(e)=>{
  let pos = getMousePos(canvas,e)
  if(selectedPoint != null){
    tablePoint[selectedPoint].x = pos.x;
    tablePoint[selectedPoint].selected = false;
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
  update()
}
function drawPoint(point){
  if(point.selected == true){
    ctx.fillStyle='#009933'
  }else{
    ctx.fillStyle='#0066ff'
  } 
  ctx.fillRect(point.x,point.y,point.width,point.height)
  ctx.fillStyle='#ffffff'
  ctx.font='20px DejaVu Sans Mono'
  ctx.fillText(point.id,point.x,20)
}

function update(){
  cleanCtx()
  try {
    pos1.innerHTML = 'Position 1: ' + tablePoint[0].x
    pos2.innerHTML = 'Position 2: ' + tablePoint[1].x
  } catch (error) {
    pos1.innerHTML = 'Null'
    pos2.innerHTML = 'Null'
  }
  for (var i = 0; i < tablePoint.length; i++) {
    console.log(tablePoint[i])
    drawPoint(tablePoint[i])
  }
}
function simuled(){
  let x1 = tablePoint[0].x
  let x2 = tablePoint[1].x
  let direction;
  if(x1 < x2){
    direction = true;
  }else{
    direction = false;
  }
  ctx.fillStyle='#009933'
  while(true){
    ctx.fillRect(x1,0,20,20);
    if(direction){
      if(x1>x2) break;
      x1++;
    }else{
      if(x1<x2) break;
      x2++;
    }
    
  }

}
/*
  si direction est vrai il avance si elle est fausse elle recule
*/
function draw(x1,x2,direction){
  ctx.fillStyle='#009933'
  ctx.fillRect(x1,0,20,20);
  
  if(direction){
    if(x1>x2);
    x1++;
    
  }else{
    if(x1<x2);
    x1--;
  }
  requestAnimationFrame(draw(x1,x2,direction))
}
function cleanCtx(){
  ctx.fillStyle='#FFFFFF'
  ctx.fillRect(0,0,canvas.width,canvas.height)
  ctx.fillStyle='#000000'
  ctx.fillRect(0,10,canvas.width,5)
}
cleanCtx()

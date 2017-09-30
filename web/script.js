//Declartions de toutes les variable principales
const canvas = document.getElementById('canvas');
const socket = io.connect('http://127.0.0.1:8080');
let pos1 = document.getElementById('position1');
let pos2 = document.getElementById('position2');
let scale = document.getElementById('scale');
let duration = document.getElementById('duration');
const ctx = canvas.getContext('2d');

let tablePoint = [];
let maxPoint = 2;
let selectedPoint = null;

//Ajouter un parametre de la longueur en milimetre
//Envoyer la distance a parcourir en milimetre
//Ajout de tout les evenement des boutons

document.getElementById('animation').addEventListener('click',(e)=>{
  try {
    let animation = {
      start: convertPosition(tablePoint[0].x),
      end: convertPosition(tablePoint[1].x),
      duration: duration.value
    }
    socket.emit('animation',animation);
    console.log('Envoi réussi!');
  } catch (error) {
    console.log("L'animation n'a pas pu être envoiée !")
  }
  
});

document.getElementById('clean').addEventListener('click',(e)=>{
  tablePoint = [];
  cleanCtx();
});

document.getElementById('try').addEventListener('click',(e)=>{
  simuled();
})

document.getElementById('sendPosition').addEventListener('click',(e)=>{
  try {
    socket.emit("position",convertPosition(tablePoint[0].x));
    console.log('Envoie réussi!')
  } catch (error) {
    console.log("L'envoie de la postion n'a pas fonctionné.")
  }
  
});

document.getElementById('add').addEventListener('click',eventAddPoint);

document.getElementById('delete').addEventListener('click',(e)=>{
  for (var index = 0; index < tablePoint.length; index++) {
    var point = tablePoint[index];
    if(point.selected){
      console.log(point);
      tablePoint.splice(index,1);
      selectedPoint = null;
      tablePoint.forEach(function(element,index) {
        element.id = index+1;
      }, this);
      console.log(tablePoint);
    }
    
  }
  update();
});

// Gestion des evenements sur le canvas

canvas.addEventListener('click',(e)=>{
  let pos = getMousePos(canvas,e)
  if(selectedPoint != null){
    tablePoint[selectedPoint].x = pos.x;
    tablePoint[selectedPoint].selected = false;
    selectedPoint = null;
    update();
  }else{
    for (var i = 0; i < tablePoint.length; i++) {
      if(isIn(pos,tablePoint[i])){
        selectedPoint = i;
        tablePoint[i].selected = true;
        update();
        break;
      }
    }
  }
});

// Déclarations des functions principales

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
    };
  }else{
    console.log('nbr max de points atteint');
  }
}

// Revoit la valeur relative au canvas du curseur de la souris

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

// Vérifie si le point est dans un carré défini

function isIn(position,scare){
  try {
    if(scare.x < position.x &&
      position.x < scare.x + scare.width &&
      scare.y < position.y &&
      position.y < scare.y + scare.height){
          return true;
        }else{
          return false;
        }
  } catch (e) {
    return false;
  }
}

// Inscrit la position d'un point par rapport à la position désiré

function setPointPosition(point,position){
  point.x = position;
}

// Fonction du bouton "Ajouter un bouton"

function eventAddPoint(){
  addPoint();
  update();
}

// Draw un point dans le canvas

function drawPoint(point){
  if(point.selected == true){
    ctx.fillStyle='#009933';
  }else{
    ctx.fillStyle='#0066ff';
  } 
  ctx.fillRect(point.x,point.y,point.width,point.height);
  ctx.fillStyle='#ffffff';
  ctx.font='20px DejaVu Sans Mono';
  ctx.fillText(point.id,point.x,20);
}

// Update la page web

function update(){
  
  cleanCtx();
  document.getElementById('position').innerHTML = ''
  tablePoint.forEach(function(point,index) {
    let parag = document.createElement('p');
    parag.innerHTML = 'Position ' + (index+1)+ ': '  + convertPosition(point.x);
    document.getElementById('position').appendChild(parag);
  }, this);
  
  for (var i = 0; i < tablePoint.length; i++) {
    drawPoint(tablePoint[i]);
  }
}

// Fonction de simulation de la trajectoire 

function simuled(){
  try {
    let x1 = tablePoint[0].x;
    let x2 = tablePoint[1].x;
    let direction;
    if(x1 < x2){
      direction = true;
    }else{
      direction = false;
    }
    ctx.fillStyle='#009933';
    while(true){
      ctx.fillRect(x1,0,20,20);
      if(direction){
        if(x1>x2) break;
        x1++;
      }else{
        if(x1<x2) break;
        x1--;
      }
    }
  } catch (error) {
   console.log('La simulation ne peut pas se faire, si les deux points ne sont pas définient !') 
  }
  
}

// Clean le canvas à son état initale

function cleanCtx(){
  ctx.fillStyle='#FFFFFF';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#000000';
  ctx.fillRect(0,10,canvas.width,5);
}

// Renvoit la position des points du tableau "tablePoint"

function convertPosition(value){
  return Math.floor(value/canvas.width * scale.value);
}
/*
function getPosition(){
  try {
    return [tablePoint[0].x,tablePoint[1].x];
  } catch (error) {
    console.log('les points net sont pas bien definit !');
  } 
}
*/
cleanCtx();

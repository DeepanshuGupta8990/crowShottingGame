/**@type {HTMLCanvasElement}*/
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext("2d");
ctx.willReadFrequently = false;
canvasWidth = canvas.width = window.innerWidth;
canvasHeight = canvas.height = window.innerHeight

const colliosionCanvas = document.getElementById('collisionCanvas');
const colliosionCanvasctx = colliosionCanvas.getContext("2d");
colliosionCanvas.width = window.innerWidth;
colliosionCanvas.height = window.innerHeight;

let ravens = [];

let play = true;

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0; 

let score = 0;
ctx.font = '50px Impact'

class Raven{
    constructor(){
        this.sizeModifier = Math.random()*0.6+0.4
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.width = this.spriteWidth*this.sizeModifier;
        this.height = this.spriteHeight*this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random()*(canvas.height-this.height);
        this.directionX = Math.random()*5+3;
        this.directionY = Math.random()*5-2.5;
        this.markedForDeletion = true;
        this.image = new Image();
        this.image.src = 'animation/raven.png';
        this.frame = 0;
        this.frameSpeed = 1;
        this.randomColors = [Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)];
        this.color = `rgba(${this.randomColors[0]},${this.randomColors[1]},${this.randomColors[2]})`
    }
    update(){
        if(this.y<0 || this.y> canvas.height-this.height){
            this.directionY = -this.directionY
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.widht){this.markedForDeletion = false}
        if(this.frameSpeed%4 === 0){
            this.frame++
            if(this.frame>4){this.frame=0}
        }
        
    }
    draw(){
        colliosionCanvasctx.fillStyle = this.color
        colliosionCanvasctx.fillRect(this.x,this.y,this.width,this.height);
        ctx.drawImage(this.image,this.frame*this.spriteWidth,0,this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height)
    }
}

let explosions = [];

class Explosion{
    constructor(x,y,size){
       this.image = new Image();
       this.image.src = 'animation/boom.png';
       this.x = x;
       this.y = y;
       this.size = size;
       this.spriteWidth = 200;
       this.spriteHeight = 179;
       this.frame = 0;
       this.sound = new Audio();
       this.sound.src = 'animation/2.wav';
       this.timeSinceLastFrame = 0;
       this.frameInterval = 100;
       this.markedForDeletion = false;
    }
    update(deltaTime){
        if(this.frame===0){this.sound.play();}
       this.timeSinceLastFrame += deltaTime ;
       if(this.timeSinceLastFrame>this.frameInterval){
        this.frame++;
       this.timeSinceLastFrame = 0
       }
       if(this.frame>5) this.markedForDeletion = true
    }
    draw(){
        ctx.drawImage(this.image,this.frame*this.spriteWidth,0,this.spriteWidth,this.spriteHeight,this.x,this.y-this.size/4,this.size,this.size)
    }
}

window.addEventListener('click',(e)=>{
    if(play){
   let detectPixelColor = colliosionCanvasctx.getImageData(e.x,e.y,1,1);
   const pc = detectPixelColor.data;
   ravens.forEach((obj)=>{
    if(obj.randomColors[0]===pc[0] && obj.randomColors[1]===pc[1] && obj.randomColors[2]===pc[2]){
     obj.markedForDeletion = false;
     score++;
     explosions.push(new Explosion(obj.x,obj.y,obj.width))
    }
   })
}
})

function drawScore(){

    ctx.fillText('Score :'+score, 50, 75);
}

function animate(timeStamp){
    if(play){
    colliosionCanvasctx.clearRect(0,0,canvasWidth,canvasHeight)
    ctx.clearRect(0,0,canvasWidth,canvasHeight)
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    timeToNextRaven+= deltaTime;
    if(timeToNextRaven > ravenInterval){
     ravens.push(new Raven);
     timeToNextRaven = 0;
     ravens.sort(function(a,b){
        return a.width-b.width;
     })
    }
    drawScore();
    [...ravens, ...explosions].forEach((obj)=>{
        obj.update(deltaTime);
        obj.frameSpeed++;
    });
    [...ravens, ...explosions].forEach((obj)=>{
        obj.draw();
    });
    ravens = ravens.filter((el)=>{
        return el.markedForDeletion
    })
    explosions = explosions.filter(object => !object.markedForDeletion)
}
requestAnimationFrame(animate);
}
animate(0);

let btn1 = document.getElementById("btn1");
btn1.addEventListener("click",()=>{
    play = !play;
    btn1.innerHTML = play?'Pause':'Play';
})

document.addEventListener("keydown", function(event) {
    if (event.code === "Space" ) {
        play = !play
    }
  });
  
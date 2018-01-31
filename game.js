var RES_X = 500;
var RES_Y = 70;

var fps = 33;
var nextFrameTime = 0;
var frameTime = 1000/fps;

var mainCanvas = document.getElementById('mainCanvas');
var canvasRect = mainCanvas.getBoundingClientRect();
var ctx = mainCanvas.getContext('2d');

var win = document.getElementById('window');
window.addEventListener("keydown", keyboardPress, false);
window.addEventListener("keyup", keyboardRelease, false);

mainCanvas.width = RES_X;
mainCanvas.height = RES_Y;

var keyPressed = {
    38: false, // up
    40: false, // down
    37: false, // left
    39: false, // right
};

var spriteSheet = new Image();
spriteSheet.src = "luvbunny_sprites.png";
var bunny = null;

var MOVE_LEFT = -1;
var MOVE_NONE = 0;
var MOVE_RIGHT = 1;

function drawBunny(index, facingRight, px, py) {
    var sx = 71 * (facingRight ? (8-index) : index);
    var sy = facingRight ? 71 : 0;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spriteSheet,sx,sy,71,71,px-71/2,py-71,71,71);
    ctx.restore();
}

function randrange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Bunny = function(x, y) {
    this.x = x;
    this.y = y;
    this.facingRight = true;
    this.speed = 2;
    this.animframe = 0;
    
    // Movement AI
    this.nextActionTimeout = 0;
    this.currentState = MOVE_NONE;
    this.stateChange();
}

Bunny.prototype = {
    stateChange: function() {
        var probabilities = null; // left, none, right
        switch(this.currentState) {
            case MOVE_NONE: {
                probabilities = [0.5,0,0.5];
                break;
            }
            case MOVE_LEFT: {
                probabilities = [0,0.8,0.2];
                break;
            }
            case MOVE_RIGHT: {
                probabilities = [0.2,0.8,0];
                break;
            }
        }
        
        probabilities[1] += probabilities[0];
        probabilities[2] += probabilities[1];
        
        var decision = Math.random();
        if (decision < probabilities[0]) {
            // Move left
            this.currentState = MOVE_LEFT;
            this.nextActionTimeout = randrange(1600,6000);
        }
        else if (decision < probabilities[1]) {
            // Stop moving
            this.currentState = MOVE_NONE;
            this.nextActionTimeout = randrange(1500,8000);
        }
        else {
            // Move right
            this.currentState = MOVE_RIGHT;
            this.nextActionTimeout = randrange(1600,6000);
        }
    },

    update: function() {
        /*
        var direction = MOVE_NONE;
        if (keyPressed[37] && !keyPressed[39]) direction = MOVE_LEFT;
        if (!keyPressed[37] && keyPressed[39]) direction = MOVE_RIGHT;
        */
        
        this.nextActionTimeout -= frameTime;
        if (this.nextActionTimeout <= 0) {
            this.stateChange();
        }
        
        if (this.x < 71) this.currentState = MOVE_RIGHT;
        if (this.x > RES_X - 71) this.currentState = MOVE_LEFT;
        
        this.updateMovement(this.currentState);
    },

    updateMovement: function(direction) {
        var animate = false;
        switch(direction) {
            case MOVE_LEFT: {
                this.x -= this.speed;
                this.facingRight = false;
                animate = true;
                break;
            }
            case MOVE_RIGHT: {
                this.x += this.speed;
                this.facingRight = true;
                animate = true;
                break;
            }
            default: break;
        }
        
        if (animate) {
            ++this.animframe;
            if (this.animframe >= 27) this.animframe = 0;
        } else {
            this.animframe = 0;
        }
    },
    
    draw: function() {
        drawBunny(Math.floor(this.animframe/3), this.facingRight, this.x, this.y);
    },
}

function initGame() {
    bunny = new Bunny(RES_X/2,RES_Y-5);
}

function keyboardPress(e) {
    //console.log(e.keyCode);
    if (e.keyCode in keyPressed) {
        keyPressed[e.keyCode] = true;
        e.preventDefault();
    }
}

function keyboardRelease(e) {
    if (e.keyCode in keyPressed) keyPressed[e.keyCode] = false;
}

function updateFrame() {
    if (bunny != null) bunny.update();
}

function drawFrame() {
    if (bunny != null) bunny.draw();
}

function clearScreen(){
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.rect(0, 0, RES_X, RES_Y);
    ctx.closePath();
    ctx.fill();
};

function gameLoop(time){
    while (time > nextFrameTime) {
        while (time - nextFrameTime > frameTime*5) nextFrameTime += frameTime*5;
        updateFrame();
        nextFrameTime += frameTime;
    }

    clearScreen();
    drawFrame();
    window.requestAnimationFrame(gameLoop);
}

gameLoop();

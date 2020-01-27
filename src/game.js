"use strict";

// to create Game construct
function Game() {
  this.canvas = null;
  this.ctx = null;

  this.ship1 = null;
  this.ship2 = null;
  this.shipArr = [];

  this.tentacleArr = []; // tentacles moving down
  this.stackedTentacleArr = []; // tentacles that are stacked at the bottom
  this.cannonballArr = [];

  this.selectedShip = 0; // current controlled ship

  this.scoreBoard = 0;
  this.score = 0;

  this.gameIsOver = false;
  this.gameScreen = null;
}

// to start game
Game.prototype.start = function() {

  // canvas creation
  this.canvasContainer = document.querySelector(".canvas-container");
  this.canvas = this.canvasContainer.querySelector("canvas");
  this.ctx = this.canvas.getContext("2d");

  var containerWidth = this.canvasContainer.offsetWidth;
  var containerHeight = this.canvasContainer.offsetHeight;

  this.scoreBoard = this.gameScreen.querySelector(".score .value");

  this.canvas.setAttribute("width", containerWidth);
  this.canvas.setAttribute("height", containerHeight);

  // add initial ships and push into ship array
  this.ship1 = new Ship(this.canvas, this.canvas.height - 50);
  this.shipArr.push(this.ship1);
  this.ship2 = new Ship(this.canvas, this.canvas.height - 110);
  this.shipArr.push(this.ship2);

  // to change ship to control
  this.changeShip = function() {
    if (this.selectedShip === 1) {
      this.selectedShip = 0;
    } else {
      this.selectedShip = 1;
    }
  };

  // keydown event listeners
  this.keyDownEvents = function(event) {
    switch (event.key) {
      case "q":
        this.changeShip();
        break;
      case "ArrowRight":
        this.shipArr[this.selectedShip].setDirection("right");
        break;
      case "ArrowLeft":
        this.shipArr[this.selectedShip].setDirection("left");
        break;
      case "ArrowDown":
        this.shipArr[this.selectedShip].setDirection("stop");
        break;
      case "ArrowUp":
        this.shootCannonballs();
        break;
    }
  };
  window.addEventListener("keydown", this.keyDownEvents.bind(this));

  // start the game loop
  this.startLoop();
};

// GAME LOOP
Game.prototype.startLoop = function() {
  var loop = function() {

    // 1. create tentacles randomly
    if (Math.random() > 0.99) {
      // determine random position
      var randomPosition = 0;
      var randomCalc = this.canvas.width * Math.random();

      if (randomCalc < 10) {
        randomPosition = 10;
      } else if (randomCalc > this.canvas.width - 50) {
        randomPosition = this.canvas.width - 50;
      } else {
        randomPosition = randomCalc;
      }

      // to create new tentacle and add to their array
      var newTentacle = new Tentacle(this.canvas, randomPosition);
      this.tentacleArr.push(newTentacle);
    }

    // 2. call for automatic tentacle movement
    this.tentacleArr.forEach(function(element) {
      if (element.y + element.height < this.canvas.height) {
        element.move();
      }
    }, this);

    // 3. check if tentacles collided with (bottom - ship size)
    this.checkTentacleReachBottom();

    // 4. call automatic ship direction change based on screen collision
    this.shipArr.forEach(function(ship) {
      ship.handleScreenCollision();
    });
    
    
    // 5. call automatic ship #1 direction change based on stacked tentacle collision
    if (this.stackedTentacleArr.length > 0) {
        this.stackedTentacleArr.forEach(function(stackedTentacle) {
            this.handleTentacleCollision(stackedTentacle);
        }, this);
    }
    
    // 6. call for automatic ship movement
    this.ship1.updatePosition();
    this.ship2.updatePosition();

    // 7. call for automatic cannonballs movement
    this.cannonballArr.forEach(function(element) {
      element.move();
    });

    // 8. call to check if cannonballs collided with tentacles
    if (this.cannonballArr.length > 0 && this.tentacleArr.length > 0) {
      this.checkCannonballHit();
    }

    // 9. call to calculate score and insert on DOM
    this.calculateScore();
    this.scoreBoard.innerHTML = this.score;

    // 10. call gameover when 2nd tentacle stack happends
    this.checkTentacleStack();

    // CLEAR THE CANVAS
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // UPDATE THE CANVAS
    // 1. draw the ship
    this.shipArr.forEach(function(element) {
      element.draw("black");
    });

    // 2. draw moving tentacles
    this.tentacleArr.forEach(function(element) {
      element.draw();
    });

    // 3. draw stacked tentacles
    this.stackedTentacleArr.forEach(function(element) {
      element.draw();
    });

    // 4. draw cannonballs
    this.cannonballArr.forEach(function(element) {
      element.draw();
    });

    // TO ANIMATE LOOP ONLY IF GAME IS NOT OVER YET
    if (!this.gameIsOver) {
      requestAnimationFrame(loop);
    }
  }.bind(this);

  // request animation frame (loop)
  loop();
};

// to check collisions between all cannonballs and all tentacles
Game.prototype.checkCannonballHit = function() {
  this.tentacleArr.forEach(function(tentacle) {
    // var tentacle = tentacleArr[x]
    this.cannonballArr.forEach(function(cannonball) {
      // var cannonball = cannonballArr[x]
      if (cannonball.cannonballHit(tentacle)) {
        tentacle.y = this.canvas.height + tentacle.height;
        cannonball.y = 0 - cannonball.size;
        // extra points for killing tentacles
        this.score = this.score + 200;
      }
    }, this);
  }, this);
};

// to stop the game if a moving tentacle collided with a stacked
Game.prototype.checkTentacleStack = function() {
  this.stackedTentacleArr.forEach(function(stackedTentacle) {
    // var stackedTentacle = stackedTentacleArr[x]
    this.tentacleArr.forEach(function(tentacle) {
      // var tentacle = tentacleArr[x]
      if (tentacle.tentacleStack(stackedTentacle)) {
        // this.gameOver();
      }
    }, this);
  }, this);
};

// to remove tentacles from the "moving" array and add them to the "stacked" array and start to form a stack.
Game.prototype.checkTentacleReachBottom = function() {
  this.tentacleArr.forEach(function(tentacle) {
    // var tentacle = tentacleArr[x]
    var indexOfTentacle = this.tentacleArr.indexOf(tentacle);
    if (tentacle.reachBottom(tentacle)) {
      this.stackedTentacleArr.push(this.tentacleArr[indexOfTentacle]);
      this.tentacleArr.splice(indexOfTentacle, 1);
      //   console.log("tentacleArr", this.tentacleArr);
      //   console.log("stackedTentacleArr", this.stackedTentacleArr);
      // DISABLED WHILE STACK TEST IS ONGOING
      //   this.gameOver();
    }
  }, this);
};

// to calculate the score
Game.prototype.calculateScore = function() {
  this.score++;
};

// to check possible game over scenario
Game.prototype.gameOver = function() {
  this.gameIsOver = true;

  console.log("game is over in game");

  // callback function being called after the game is over
  this.startOver();
};

// call over function
Game.prototype.passGameOverCallback = function(gameOverFunc) {
  this.startOver = gameOverFunc;
};

// to shoot cannonballs!
Game.prototype.shootCannonballs = function() {
  if (this.shipArr[this.selectedShip].canShoot) {
    // to determine which ship is shooting and its position
    var currentShipPositionX =
      this.shipArr[this.selectedShip].x +
      this.shipArr[this.selectedShip].size / 4;
    var currentShipPositionY = this.shipArr[this.selectedShip].y;

    // to create new cannonball and push into cannonballs array
    var newCannonball = new Cannonball(
      this.canvas,
      currentShipPositionX,
      currentShipPositionY
    );
    this.cannonballArr.push(newCannonball);

    // to add delay to the shoot that will be removed on a setTimeout

    this.shipArr[this.selectedShip].canShoot = false;

    // setTimeout for the shoot delay
    var shipToAddDelay = this.selectedShip; // this variable is so the ship to add the delay doesn't change between the timout
    setTimeout(
      function() {
        this.shipArr[shipToAddDelay].canShoot = true;
      }.bind(this),
      2000
    );
  }
};

// automatic ship direction change based on stacked tentacle collision
Game.prototype.handleTentacleCollision = function(stackedTentacle) {
  // variables for easier reading
  var shipRight = this.ship1.x + this.ship1.size;
  var shipLeft = this.ship1.x;
  var stackedTentacleRight = stackedTentacle.x + stackedTentacle.width;
  var stackedTentacleLeft = stackedTentacle.x;

  // checks in variables for easier reading
  var crossTentacleFromLeft =
    shipRight > stackedTentacleLeft && shipRight < stackedTentacleRight;
  var crossTentacleFromRight =
    shipLeft < stackedTentacleRight && shipLeft > stackedTentacleLeft;

  // collision check
  if (crossTentacleFromLeft) {
    this.ship1.direction = this.ship1.direction * -1;
  } else if (crossTentacleFromRight) {
    this.ship1.direction = this.ship1.direction * -1;
  }
};

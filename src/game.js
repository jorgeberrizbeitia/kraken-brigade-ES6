"use strict";

// to create Game class
class Game {
  constructor(inputNameMain) {
    this.canvas = null;
    this.ctx = null;

    this.shipArr = []; // array of ships the player controls
    this.tentacleArr = []; // enemy tentacles moving down
    this.stackedTentacleArr = []; // tentacles that are stacked at the bottom
    this.cannonballArr = []; // cannonballs to kill those darn tentacles

    this.selectedShip = 0; // current controlled ship

    this.loopCount = 0;
    this.spawnCheck = 0; // to check the chances of enemies appearing
    this.tentacleSpeed = 1; // initial tentacle speed. Changes with dificulty
    this.dificultyMessage = "";

    this.gameIsOver = false; // to check if game is over and stop animation frames
    this.gameScreen = null; // to select elements from DOM
    
    this.currentShipLine = null; // line that shows current controlled ship
    this.specialPowerCheck = true; // boolean to set power on one time use only
    
    this.inputName = inputNameMain; // player name passed from new game creation

    this.background = new Image();
    this.background.src = "./img/game-background.png";

    this.timeScoreBoard = "" // scoreboard that shows score by time. to be set inside start method.
    this.dificultyBoard = "" // for showing current dificulty level. to be set inside start method.
    this.killScoreBoard = "" // scoreboard that shows score by kills. to be set inside start method.

    // score properties to be passed for score ranking
    this.scoreBoard = 0;
    this.timeScore = 0;
    this.killScore = 0;
    this.totalScore = 0;
    this.scoreScreen = [];

    // sounds!
    this.music = new Audio("./sounds/music.ogg");
    this.soundShoot = new Audio("./sounds/cannon.mp3");
    this.soundDificultyUp = new Audio("./sounds/dificulty.mp3");
    this.soundSquish = new Audio("./sounds/squish.wav");
    this.soundGameOver = new Audio("./sounds/gameOver.mp3");
  }

  // to start game
  start() {

    // canvas creation
    this.canvasContainer = document.querySelector(".canvas-container");
    this.canvas = this.canvasContainer.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");

    var containerWidth = this.canvasContainer.offsetWidth;
    var containerHeight = this.canvasContainer.offsetHeight;
    
    this.canvas.setAttribute("width", containerWidth);
    this.canvas.setAttribute("height", containerHeight);
    
    this.timeScoreBoard = this.gameScreen.querySelector(".time-score .value"); // scoreboard that shows score by time
    this.dificultyBoard = this.gameScreen.querySelector(".dificulty-message .value"); // for showing current dificulty level
    this.killScoreBoard = this.gameScreen.querySelector(".kill-score .value"); // scoreboard that shows score by kills

    // add initial ships and push into ship array
    let ship1 = new Ship(this.canvas, this.canvas.height - 100);
    let ship2 = new Ship(this.canvas, this.canvas.height - 160);
    let ship3 = new Ship(this.canvas, this.canvas.height - 220);
    this.shipArr = [ship1, ship2, ship3];

    // to change which ship is being controlled
    this.changeShip = function () {
      if (this.selectedShip === 0) {
        this.selectedShip = 1;
      } else if (this.selectedShip === 1) {
        this.selectedShip = 2;
      } else if (this.selectedShip === 2) {
        this.selectedShip = 0;
      }
    };

    // keydown event listeners
    this.keyDownEvents = function (event) {
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
        case "p":
          this.specialPower();
          break;
      }
    };
    window.addEventListener("keydown", this.keyDownEvents.bind(this));

    // background music settings
    this.music.volume = 0.1;
    this.music.play();

    // start the game loop
    this.startLoop();
  }

  // GAME LOOP. clear, update and draw canvas.
  startLoop() {
    var loop = () => {

      // CLEAR THE CANVAS
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // UPDATE THE CANVAS
      // 1. increasing dificulty formula that affects speed and # of tentacles.
      this.dificultyIncrease();

      // 2. create tentacles randomly. array length check is not to add too many tentacles.
      this.createTentacles();

      // 3. call for automatic tentacle movement
      this.tentacleArr.forEach(tentacle => {
        if (tentacle.y + tentacle.height < this.canvas.height) {
          tentacle.move();
        }
      });

      // 4. check if tentacles collided with bottom. they stop and create a stack.
      this.tentacleReachFort();

      // 5. to keep stacking tentacles on each other
      this.checkTentacleStack();

      // 6. call automatic ship direction change based on screen collision
      this.shipArr.forEach(ship => ship.handleScreenCollision());

      // 7. call automatic ship direction change based on stacked tentacle collision.
      if (this.stackedTentacleArr.length > 0) {
        this.shipArr.forEach(ship => {
          this.stackedTentacleArr.forEach(stackedTentacle => {
            this.handleTentacleCollision(ship, stackedTentacle);
          });
        });
      }

      // 8. call for automatic ship movement
      this.shipArr.forEach(ship => ship.updatePosition())

      // 9. call for automatic cannonballs movement
      this.cannonballArr.forEach(cannonBall => cannonBall.move());

      // 10. call to check if cannonballs collided with tentacles
      if (this.cannonballArr.length > 0 && this.tentacleArr.length > 0) this.checkCannonballHit();

      // 11. call to calculate score and other board elements and insert on DOM
      this.calculateScore();

      // 12. to end game when 4th stack of tentacles is created. FORT IS DOWN!
      this.stackedTentacleArr.forEach(stackedTentacle => {
        if (
          stackedTentacle.y <
          this.canvas.height - stackedTentacle.height * 3 - 100 // 100 is size of wall.
        ) {
          this.gameIsOver = true; // change boolean for gameOver. requestAnimationFram part will check for this.
        }
      });

      // DRAW THE CANVAS
      // 1. draw background
      this.ctx.drawImage(
        this.background,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      // 2. draw the currentShip line
      this.shipArr[this.selectedShip].drawLine();

      // 3. draw line indicator for game over
      this.drawLineGameOver();

      // 4. draw the ship
      this.shipArr.forEach(ship => ship.draw() );

      // 5. draw moving tentacles
      this.tentacleArr.forEach(tentacle => tentacle.draw() );

      // 6. draw stacked tentacles
      this.stackedTentacleArr.forEach(tentacle => tentacle.draw() );

      // 7. draw cannonballs
      this.cannonballArr.forEach(cannonBall => cannonBall.draw() );


      // to continue animating the loop if the game is not over yet
      if (!this.gameIsOver) {
        requestAnimationFrame(loop);
      } else if (this.gameIsOver) {
        this.gameOver();
      }
    };

    // request first animation frame
    loop();
  }

  createTentacles() {
    if (Math.random() > this.spawnCheck && this.tentacleArr.length < 5) {
      // determine random position
      var randomPosition = 0;
      var randomCalc = this.canvas.width * Math.random();

      if (randomCalc < 20) {
        randomPosition = 10;
      } else if (randomCalc > this.canvas.width - 50) {
        randomPosition = this.canvas.width - 60;
      } else {
        randomPosition = randomCalc;
      }

      // to create new tentacle and add to their array
      var newTentacle = new Tentacle(
        this.canvas,
        randomPosition,
        this.tentacleSpeed
      );
      this.tentacleArr.push(newTentacle);
    }
  }

  // to check collisions between all cannonballs and all tentacles
  checkCannonballHit() {
    this.tentacleArr.forEach(function (tentacle) {
      // var tentacle = tentacleArr[x]
      var tentacleIndex = this.tentacleArr.indexOf(tentacle);
      this.cannonballArr.forEach(function (cannonball) {
        var cannonballIndex = this.cannonballArr.indexOf(cannonball);
        // var cannonball = cannonballArr[x]
        if (cannonball.cannonballHit(tentacle)) {
          // destroy both the tentacler and cannonball
          this.tentacleArr.splice(tentacleIndex, 1);
          this.cannonballArr.splice(cannonballIndex, 1);
          // extra points for killing tentacles
          this.killScore = this.killScore + 10;
          // sound for tentacle hit
          this.soundSquish.volume = 0.1;
          this.soundSquish.currentTime = 0;
          this.soundSquish.play();
        }
      }, this);
    }, this);
  }

  // to stop the game if a moving tentacle collided with a stacked
  checkTentacleStack() {
    this.stackedTentacleArr.forEach(function (stackedTentacle) {
      // var stackedTentacle = stackedTentacleArr[x]
      this.tentacleArr.forEach(function (tentacle) {
        // var tentacle = tentacleArr[x]
        var indexOfTentacle = this.tentacleArr.indexOf(tentacle);
        if (tentacle.tentacleStack(stackedTentacle)) {
          this.stackedTentacleArr.push(this.tentacleArr[indexOfTentacle]);
          this.tentacleArr.splice(indexOfTentacle, 1);
        }
      }, this);
    }, this);
  }

  // to make tentacles form a stack from bottom. change normal array to stacked array.
  tentacleReachFort() {
    this.tentacleArr.forEach(function (tentacle) {
      // var tentacle = tentacleArr[x]
      var indexOfTentacle = this.tentacleArr.indexOf(tentacle);
      if (tentacle.checkReachFort(tentacle)) {
        this.stackedTentacleArr.push(this.tentacleArr[indexOfTentacle]);
        this.tentacleArr.splice(indexOfTentacle, 1);
      }
    }, this);
  }

  // to calculate the score
  calculateScore() {
    this.loopCount++;
    if (this.loopCount % 60 === 0) this.timeScore++;
    this.timeScoreBoard.innerHTML = this.timeScore;
    this.killScoreBoard.innerHTML = this.killScore;
    this.totalScore = this.timeScore + this.killScore;
    this.dificultyBoard.innerHTML = this.dificultyMessage;
  }

  // to check possible game over scenario
  gameOver() {
    this.updateScore(this.inputName, this.totalScore);

    this.music.currentTime = 200;
    this.soundGameOver.volume = 0.1;
    this.soundGameOver.play();
    this.gameIsOver = true;

    // callback function being called after the game is over
    this.startOver();
  }

  // call over function
  passGameOverCallback(gameOverFunc) {
    this.startOver = gameOverFunc;
  }

  // to shoot cannonballs!
  shootCannonballs() {
    if (this.shipArr[this.selectedShip].canShoot) {
      // to determine which ship is shooting and its position
      var currentShipPositionX =
        this.shipArr[this.selectedShip].x +
        this.shipArr[this.selectedShip].width / 4;
      var currentShipPositionY = this.shipArr[this.selectedShip].y;

      // to create new cannonball and push into cannonballs array
      var newCannonball = new Cannonball(
        this.canvas,
        currentShipPositionX,
        currentShipPositionY
      );
      this.cannonballArr.push(newCannonball);

      // to make ship stop after shooting. *QoL*.
      this.shipArr[this.selectedShip].direction = 0;

      // to add delay to the shoot that will be removed on a setTimeout
      this.shipArr[this.selectedShip].canShoot = false;

      // setTimeout for the shoot delay
      var shipToAddDelay = this.selectedShip; // this variable is so the ship to add the delay doesn't change between the timout
      setTimeout(
        function () {
          this.shipArr[shipToAddDelay].canShoot = true;
        }.bind(this),
        2000
      );

      // to create shooting sound
      this.soundShoot.volume = 0.1;
      this.soundShoot.currentTime = 0;
      this.soundShoot.play();
    }
  }

  // automatic ship direction change based on stacked tentacle collision
  handleTentacleCollision(ship, stackedTentacle) {
    // variables for easier reading
    var shipTop = ship.y;
    var shipRight = ship.x + ship.width;
    var shipLeft = ship.x;

    var stackedTentacleLeft = stackedTentacle.x;
    var stackedTentacleRight = stackedTentacle.x + stackedTentacle.width;
    var stackedTentacleTop = stackedTentacle.y;

    // checks in variables for easier reading
    var crossTentacleFromLeft =
      shipRight > stackedTentacleLeft && shipRight < stackedTentacleRight;
    var crossTentacleFromRight =
      shipLeft < stackedTentacleRight && shipLeft > stackedTentacleLeft;

    // below 'if' is to check stacked tentacles only for the the height each ship is moving in
    // +/- 30 is to consider small discrepancies in the heigth
    if (
      shipTop < stackedTentacleTop + 30 &&
      shipTop > stackedTentacleTop - 30
    ) {
      // if (shipTop === stackedTentacleTop) {

      // collision check
      if (crossTentacleFromLeft) {
        ship.direction = ship.direction * -1;
      } else if (crossTentacleFromRight) {
        ship.direction = ship.direction * -1;
      }
    }
  }

  // to increase dificulty when score goes up
  dificultyIncrease() {
    console.log("running function");
    if (this.timeScore < 20) {
      this.spawnCheck = 0.996;
      this.tentacleSpeed = 1;
      this.dificultyMessage = "ahoy";
      document
        .querySelector(".dificulty-message .value")
        .setAttribute("style", "color: #ff4d4d");
    } else if (this.timeScore > 20 && this.timeScore < 40) {
      this.spawnCheck = 0.992;
      this.tentacleSpeed = 1.1;
      this.dificultyMessage = "ahooooy!!";
      document
        .querySelector(".dificulty-message .value")
        .setAttribute("style", "color: #ff0000");
    } else if (this.timeScore > 40 && this.timeScore < 60) {
      this.spawnCheck = 0.988;
      this.tentacleSpeed = 1.2;
      this.dificultyMessage = "AHOOOOOOOOY!!";
      document
        .querySelector(".dificulty-message .value")
        .setAttribute("style", "color: #b30000");
    } else if (this.timeScore > 60 && this.timeScore < 80) {
      this.spawnCheck = 0.984;
      this.tentacleSpeed = 1.3;
      this.dificultyMessage = "AHOoOoOOoooOOoOY!!!!!";
      document
        .querySelector(".dificulty-message .value")
        .setAttribute("style", "color: #800000");
    } else if (this.timeScore > 80 && this.timeScore < 100) {
      this.spawnCheck = 0.98;
      this.tentacleSpeed = 1.4;
      this.dificultyMessage = "AHOoOoOOoYooooYYOOoOY!!!!!";
      document
        .querySelector(".dificulty-message .value")
        .setAttribute("style", "color: #660000");
    } else if (this.timeScore > 120) {
      this.spawnCheck = 0.974;
      this.tentacleSpeed = 1.5;
      this.dificultyMessage = "AAAAHHHHHHHHHHHHHHHHHHHHHH!!!!!";
      document
        .querySelector(".dificulty-message .value")
        .setAttribute("style", "color: #330000");
    }

    // to add sound to the dificulty change.button
    if (this.timeScore % 20 === 0 && this.timeScore !== 0) {
      this.soundDificultyUp.volume = 0.1;
      this.soundDificultyUp.play();
    }
  }

  specialPower() {
    if (this.specialPowerCheck === true) {
      for (let i = 0; i < 25; i++) {
        setTimeout(
          function () {
            var randomSpawn = Math.random() * this.canvas.width;
            var newCannonball = new Cannonball(
              this.canvas,
              randomSpawn,
              this.canvas.height
            );
            this.cannonballArr.push(newCannonball);
          }.bind(this),
          i * 50
        );
      }

      for (let i = 0; i < 6; i++) {
        setTimeout(
          function () {
            this.soundShoot.volume = 0.1;
            this.soundShoot.currentTime = 0;
            this.soundShoot.play();
          }.bind(this),
          i * 200
        );
      }

      this.specialPowerCheck = false;

      // to create shooting sound
    }
  }

  updateScore(nameArg, scoreArg) {
    // get previous score as object
    var previousScoreStr = localStorage.getItem("score");

    var previousScoreArr;

    // check if local storage exists
    if (!previousScoreStr) {
      previousScoreArr = [];
    } else {
      previousScoreArr = JSON.parse(previousScoreStr);
    }

    var newScore = { name: nameArg, score: scoreArg };
    previousScoreArr.push(newScore);

    // sorting function
    previousScoreArr.sort(function (a, b) {
      if (a.score < b.score) {
        return 1;
      } else if (a.score > b.score) {
        return -1;
      } else {
        return 0;
      }
    });

    var updatedScoreArr;

    if (previousScoreArr.length > 5) {
      updatedScoreArr = previousScoreArr.splice(0, 5);
    } else {
      updatedScoreArr = previousScoreArr;
    }

    const updatedScoreStr = JSON.stringify(updatedScoreArr);
    localStorage.setItem("score", updatedScoreStr);
  }

  drawLineGameOver() {
    this.ctx.beginPath(); // Start a new path
    this.ctx.strokeStyle = "lightSalmon";

    for (let i = 0; i < this.canvas.width; i++) {
      if (i % 10 === 0) {
        this.ctx.moveTo(i, this.canvas.height - 250);
        this.ctx.lineTo(i + 5, this.canvas.height - 250);
      }
    }

    // this.ctx.moveTo(10, this.canvas.height - 250);
    // this.ctx.lineTo(60, this.canvas.height - 250);
    // this.ctx.moveTo(this.canvas.width - 60, this.canvas.height - 250);
    // this.ctx.lineTo(this.canvas.width - 10, this.canvas.height - 250);
    this.ctx.stroke();
  }
  
}

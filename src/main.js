"use strict";

// Dynamic function to build DOM elements
function buildDom(htmlString) {
  let div = document.createElement("div");

  div.innerHTML = htmlString;

  return div.children[0];
}

// Main game function
function main() {
  let game;
  let splashScreen;
  let gameOverScreen;

  // FUNCTION TO SET GAME SPLASH SCREEN
  function createSplashScreen() {
    // creating the page
    splashScreen = buildDom(`
      <main>
        <div class="container">
          <div id="title-box">
            <h1>Kraken Brigade</h1>
          </div>
          <div id="instructions-box">
            <h2>Instructions!</h2>
            <p>
              Shoot the tentacles and avoid getting them stacked after the dotted line<br>
              If the ship
              <br>
              Arrow Left --> Move Ship Left<br>
              Arrow Right --> Move Ship Right<br>
              Arrow Up --> Shoot Those Darn Tentacles!<br>
              Arrow Down --> Anchor the Ship!<br>
              Q --> Toogle Between Ships<br>
              P --> PIRATE POWAH! *use it wisely*
              </p>
          </div>
          <div class="input-container">
            <label for="name" >Name: </label>
            <input type="text" id="name" maxlength="24">
            <button id="start-btn" class ="button">START!</button>
          </div>
        </div>
      </main>`);

    // adding the page to the DOM
    document.body.appendChild(splashScreen);

    // addEventListener to start the game on button click
    let startButton = splashScreen.querySelector("#start-btn");
    startButton.addEventListener("click", function() {
      startGame();
    });
  }

  // function to remove the SPLASH screen
  const removeSplashScreen = () => splashScreen.remove();

  // function removeSplashScreen() {
  //   splashScreen.remove();
  // }

  // FUNCTION TO SET GAME SCREEN
  function createGameScreen() {
    // creating the page
    let gameScreen = buildDom(`
    <main class="game game-container">
      <header>
        <div class="kill-score score">
          <span class="label">Kill Score:</span>
          <span class="value"></span>
        </div>
        <div class="dificulty-message score">
          <span class="label">Dificulty:</span>
          <span class="value"></span>
        </div>
        <div class="time-score score">
          <span class="label">Time Score:</span>
          <span class="value"></span>
        </div>
      </header>
      <div class="canvas-container">
        <canvas></canvas>
      </div>
    </main>
    `);

    // adding the page to the DOM
    document.body.appendChild(gameScreen);

    // return so we can store page in game as per startGame function
    return gameScreen;
  }

  // function to remove the GAME screen
  const removeGameScreen = () => game.gameScreen.remove();

  // gameScreen is stored in game per startGame function
  // function removeGameScreen() {
  //   game.gameScreen.remove();
  // }

  // SETTING GAME OVER SCREEN
  function createGameOverScreen(totalScore) {
    // score ranking logic
    let scoreRanking = JSON.parse(localStorage.getItem("score"));

    let scoreStr1;
    let scoreStr2;
    let scoreStr3;
    let scoreStr4;
    let scoreStr5;

    if (scoreRanking[0]) {
      scoreStr1 = `${scoreRanking[0].name} : ${scoreRanking[0].score}`;
    } else {
      scoreStr1 = "filty landlubber : 0";
    }

    if (scoreRanking[1]) {
      scoreStr2 = `${scoreRanking[1].name} : ${scoreRanking[1].score}`;
    } else {
      scoreStr2 = `filty landlubber : 0`;
    }

    if (scoreRanking[2]) {
      scoreStr3 = `${scoreRanking[2].name} : ${scoreRanking[2].score}`;
    } else {
      scoreStr3 = `filty landlubber : 0`;
    }

    if (scoreRanking[3]) {
      scoreStr4 = `${scoreRanking[3].name} : ${scoreRanking[3].score}`;
    } else {
      scoreStr4 = `filty landlubber : 0`;
    }

    if (scoreRanking[4]) {
      scoreStr5 = `${scoreRanking[4].name} : ${scoreRanking[4].score}`;
    } else {
      scoreStr5 = `filty landlubber : 0`;
    }

     // creating the page
    gameOverScreen = buildDom(`
    <main>
        <div class="container">
            <div>
                <h1>YARR!!</h1>
            </div>
            <div id="score">
                <h2>your score is... ${totalScore}</h2>
            </div>
            <div id="scoreboard">
            <h2> High Score: </h2>
              <ul>
                <li> ${scoreStr1} </li>
                <li> ${scoreStr2} </li>
                <li> ${scoreStr3} </li>
                <li> ${scoreStr4} </li>
                <li> ${scoreStr5} </li>
              </ul>
            </div class="input-container">
            <div class="input-container">
              <label for="name" >Name: </label>
              <input type="text" id="name" maxlength="24">
              <button id="restart-btn" class="button">RESTART!</button>
            </div>
        </div>
    </main>`);

    // adding the page to the DOM
    document.body.appendChild(gameOverScreen);

    // addEventListener to start the game on button click
    let button = gameOverScreen.querySelector("button");
    button.addEventListener("click", startGame);
  }

  // function to remove the GAMEOVER screen
  function removeGameOverScreen() {
    // by checking we avoid an issue when removing this when game starts on the first time
    if (gameOverScreen !== undefined) {
      gameOverScreen.remove();
    }
  }

  // SETTING THE GAME STATE

  function startGame() {
    let inputNameMain;

    // adds default name for score ranking
    if (!document.querySelector("input").value) {
      inputNameMain = "filty landlubber";
    } else {
      inputNameMain = document.querySelector("input").value;
    }

    removeSplashScreen(); // remove first screen
    removeGameOverScreen(); // removes gameover screen on restart

    // creating new game instance
    game = new Game(inputNameMain);
    game.gameScreen = createGameScreen();

    // function that starts the game loop
    game.start();

    // after the game loop inside game.start ends, below callback function will run
    game.passGameOverCallback(gameOver);
  }

  // function to create gameOver Screen on game end. Passed as callback.
  function gameOver() {
    removeGameScreen();
    createGameOverScreen(this.totalScore);
  }

  // to initialize the splash screen on first page load
  createSplashScreen();
}

// to load main function on first page load
window.addEventListener("load", main);

let player1CurrentScore = document.querySelector("#current-0");
let player2CurrentScore = document.querySelector("#current-1");
let player1TotalScore = document.querySelector("#score-0");
let player2TotalScore = document.querySelector("#score-1");

let player1Active = document.querySelector(".player-0-panel");
let player2Active = document.querySelector(".player-1-panel");

let player1DiceWrap = document.querySelector("#dice-1-wrap");
let player2DiceWrap = document.querySelector("#dice-2-wrap");

let player1DiceImg = document.querySelector("#dice-1");
let player2DiceImg = document.querySelector("#dice-2");

const hitDice = document.querySelector(".btn-roll");
hitDice.addEventListener("click", rollDice);

const newGameBtn = document.querySelector(".btn-new");
newGameBtn.addEventListener("click", init);

const holdBtn = document.querySelector(".btn-hold");
holdBtn.addEventListener("click", holdScore);

let targetScoreInput = document.querySelector("#winning-score-input");

let message = document.querySelector(".message");
let scoreMessage = document.querySelector(".score-message");

const player1WinsDisplay = document.querySelector("#player1-wins");
const player2WinsDisplay = document.querySelector("#player2-wins");
const savedPlayer1Wins = parseInt(localStorage.getItem("player1Wins")) || 0;
const savedPlayer2Wins = parseInt(localStorage.getItem("player2Wins")) || 0;

const resetWinsBtn = document.querySelector("#reset-wins-btn");

resetWinsBtn.addEventListener("click", function () {
  // Reset in game state
  game.wins = [0, 0];

  // Update display
  player1WinsDisplay.textContent = 0;
  player2WinsDisplay.textContent = 0;

  // Clear from localStorage
  localStorage.removeItem("player1Wins");
  localStorage.removeItem("player2Wins");

  console.log("Win counters reset!");
});

///////////SOUNDS////////////
const loseTurnSound = new Audio("/sounds/dice-1.mp3");
const doubleSixSound = new Audio("/sounds/dice-double6.wav");
const winSound = new Audio("/sounds/win.mp3");
const newGameSound = new Audio("/sounds/new-game.wav");
const pointSound = new Audio("/sounds/point.mp3");

const muteBtn = document.querySelector("#mute-btn");

muteBtn.addEventListener("click", function () {
  game.muted = !game.muted;

  if (game.muted) {
    muteBtn.textContent = "🔇";
    muteBtn.classList.add("muted"); // Add CSS class
  } else {
    muteBtn.textContent = "🔊";
    muteBtn.classList.remove("muted"); // Remove CSS class
  }
});

/////////////////////////////////

let game = {
  scores: [0, 0],
  currentScore: 0,
  activePlayer: 0,
  playing: true,
  targetScore: 100,
  previousRoll: 0,
  muted: false,
  wins: [savedPlayer1Wins, savedPlayer2Wins],
};

function playSound(audioElement) {
  if (!game.muted) {
    audioElement.currentTime = 0;
    audioElement.play();
  }
}

function init() {
  playSound(newGameSound);
  message.innerHTML = `New game! <span class="red">Player 1</span>'s turn`;
  scoreMessage.innerHTML = `Target score set to: <span>${game.targetScore}</span>`;
  targetScoreInput.disabled = false;
  holdBtn.disabled = false;
  hitDice.disabled = false;
  let targetScoreValue = parseInt(targetScoreInput.value);
  if (isNaN(targetScoreValue) || targetScoreValue <= 1) {
    console.log("needs to be a number and above 1. Changed to default");
    message.textContent =
      "Score must be a number above 1. Changed to default (100)";
    targetScoreValue = 100;
    game.targetScore = targetScoreValue;
    targetScoreInput.value = 100;
  } else {
    game.targetScore = targetScoreValue;
    //message.textContent = "Target score set to: " + game.targetScore;
    scoreMessage.innerHTML = `Target score set to: <span>${game.targetScore}</span>`;
  }

  let currentMuteState = game.muted;
  let currentWins = game.wins;

  game = {
    scores: [0, 0],
    currentScore: 0,
    activePlayer: 0,
    playing: true,
    targetScore: targetScoreValue,
    previousRoll: 0,
    muted: currentMuteState,
    wins: currentWins,
  };

  console.log("Target score set to:", game.targetScore);

  player1CurrentScore.textContent = game.currentScore;
  player2CurrentScore.textContent = game.currentScore;
  player1TotalScore.textContent = game.scores[0];
  player2TotalScore.textContent = game.scores[1];

  player1Active.classList.add("active");
  player2Active.classList.remove("active");

  player1DiceWrap.classList.add("active");
  player1DiceWrap.classList.remove("inactive");
  player2DiceWrap.classList.remove("active");
  player2DiceWrap.classList.add("inactive");

  hitDice.classList.add("player1-color");
  hitDice.classList.remove("player2-color");
  holdBtn.classList.add("player1-color");
  holdBtn.classList.remove("player2-color");

  const muteBtn = document.querySelector("#mute-btn");
  if (game.muted) {
    muteBtn.textContent = "🔇";
  } else {
    muteBtn.textContent = "🔊";
  }

  updateWinDisplay();
}

function rollDice() {
  targetScoreInput.disabled = true;

  let result;
  if (game.playing === true && game.activePlayer === 0) {
    result = Math.floor(Math.random() * 6) + 1;
    console.log(result);

    player1DiceImg.src = `img/dice-${result}.png`;

    if (result === 6 && game.previousRoll === 6) {
      playSound(doubleSixSound);
      console.log(`Player 1 rolled 6 twice! Lose all points!`);
      message.innerHTML = `<span class="red">Player 1</span> rolled <img src="/img/dice-6.png"> twice in a row! Lose all points! <span class="blue">Player 2</span>'s turn!`;
      showFloatingLabel(0, game.scores[0], false);
      game.currentScore = 0;
      game.scores[0] = 0;
      player1CurrentScore.textContent = game.currentScore;
      player1TotalScore.textContent = game.scores[0];

      const gameArea = document.querySelector(".game-area");
      gameArea.classList.add("shake");
      gameArea.addEventListener(
        "animationend",
        () => {
          gameArea.classList.remove("shake");
        },
        { once: true }
      );

      document.body.classList.add("flash-red");
      document.body.addEventListener(
        "animationend",
        () => {
          document.body.classList.remove("flash-red");
        },
        { once: true }
      );

      switchPlayer();
      return;
    }

    if (result !== 1) {
      game.currentScore += result;
      console.log("current: " + game.currentScore);
      player1CurrentScore.textContent = game.currentScore;
    } else {
      message.innerHTML = `<span class="red">Player 1</span> rolled <img src="/img/dice-1.png"> <span class="blue">Player 2</span>'s turn!`;

      playSound(loseTurnSound);
      console.log("player 1 lost");
      game.currentScore = 0;
      player1CurrentScore.textContent = game.currentScore;
      game.previousRoll = 0;
      const gameArea = document.querySelector(".game-area");
      gameArea.classList.add("shake");
      gameArea.addEventListener(
        "animationend",
        () => {
          gameArea.classList.remove("shake");
        },
        { once: true }
      );
      switchPlayer();
    }
  }

  if (game.playing === true && game.activePlayer === 1) {
    result = Math.floor(Math.random() * 6) + 1;
    console.log(result);

    player2DiceImg.src = `img/dice-${result}-b.png`;

    if (result === 6 && game.previousRoll === 6) {
      playSound(doubleSixSound);
      console.log(`Player 2 rolled 6 twice! Lose all points!`);
      message.innerHTML = `<span class="blue">Player 2</span> rolled <img src="/img/dice-6-b.png"> twice in a row! Lose all points! <span class="red">Player 1</span>'s turn!`;
      showFloatingLabel(1, game.scores[1], false);
      game.currentScore = 0;
      game.scores[1] = 0;
      player2CurrentScore.textContent = game.currentScore;
      player2TotalScore.textContent = game.scores[1];

      const gameArea = document.querySelector(".game-area");
      gameArea.classList.add("shake");
      gameArea.addEventListener(
        "animationend",
        () => {
          gameArea.classList.remove("shake");
        },
        { once: true }
      );

      document.body.classList.add("flash-red");
      document.body.addEventListener(
        "animationend",
        () => {
          document.body.classList.remove("flash-red");
        },
        { once: true }
      );

      switchPlayer();
      return;
    }
    console.log("Previous roll was:", game.previousRoll);
    console.log(result);

    if (result !== 1) {
      game.currentScore += result;
      console.log("current: " + game.currentScore);
      player2CurrentScore.textContent = game.currentScore;
    } else {
      playSound(loseTurnSound);
      game.currentScore = 0;
      player2CurrentScore.textContent = game.currentScore;
      message.innerHTML = `<span class="blue">Player 2</span> rolled <img src="/img/dice-1-b.png"> <span class="red">Player 1</span>'s turn!`;
      game.previousRoll = 0;
      const gameArea = document.querySelector(".game-area");
      gameArea.classList.add("shake");
      gameArea.addEventListener(
        "animationend",
        () => {
          gameArea.classList.remove("shake");
        },
        { once: true }
      );
      message.innerHTML = `<span class="blue">Player 2</span> rolled <img src="/img/dice-1-b.png"> <span class="red">Player 1</span>'s turn!`;
      console.log("player 2 lost");
      game.previousRoll = 0;
      switchPlayer();
    }
  }
  game.previousRoll = result;
}

function switchPlayer() {
  console.log("switched!");
  if (game.activePlayer === 0) {
    game.activePlayer = 1;
    player1DiceWrap.classList.remove("active");
    player1DiceWrap.classList.add("inactive");
    player2DiceWrap.classList.remove("inactive");
    player2DiceWrap.classList.add("active");

    player1Active.classList.remove("active");
    player2Active.classList.add("active");
    hitDice.classList.add("player2-color");
    hitDice.classList.remove("player1-color");
    holdBtn.classList.add("player2-color");
    holdBtn.classList.remove("player1-color");
  } else {
    game.activePlayer = 0;
    player2DiceWrap.classList.remove("active");
    player2DiceWrap.classList.add("inactive");
    player1DiceWrap.classList.remove("inactive");
    player1DiceWrap.classList.add("active");

    player2Active.classList.remove("active");
    player1Active.classList.add("active");
    hitDice.classList.add("player1-color");
    hitDice.classList.remove("player2-color");
    holdBtn.classList.add("player1-color");
    holdBtn.classList.remove("player2-color");
  }

  game.previousRoll = 0;
}

function holdScore() {
  if (!game.playing) return;
  if (game.activePlayer === 0) {
    game.scores[0] += game.currentScore;
    player1TotalScore.textContent = game.scores[0];
    if (game.scores[0] >= game.targetScore) {
      playSound(winSound);
      console.log("player 1 won");
      message.innerHTML = `<span class="red">Player 1</span> has reached the target score. <span class="green">WINNER</span>`;
      game.playing = false;
      holdBtn.disabled = true;
      hitDice.disabled = true;
      game.wins[0]++;
      //player1WinsDisplay.textContent = game.wins[0];
      updateWinDisplay();
      localStorage.setItem("player1Wins", game.wins[0]);
    } else {
      message.innerHTML = `<span class="red">Player 1</span> held their score. <span class="blue">Player 2</span>'s turn!`;
      console.log("player 1 held their score");
      playSound(pointSound);
      showFloatingLabel(0, game.currentScore, true);
      switchPlayer();
    }
  } else if (game.activePlayer === 1) {
    game.scores[1] += game.currentScore;
    player2TotalScore.textContent = game.scores[1];
    if (game.scores[1] >= game.targetScore) {
      playSound(winSound);
      console.log("player 2 won");
      message.innerHTML = `<span class="blue">Player 2</span> has reached the target score. <span class="green">WINNER</span>`;
      game.playing = false;
      holdBtn.disabled = true;
      hitDice.disabled = true;
      game.wins[1]++;
      //player2WinsDisplay.textContent = game.wins[1];
      updateWinDisplay();
      localStorage.setItem("player2Wins", game.wins[1]);
    } else {
      console.log("player 2 held their score");
      message.innerHTML = `<span class="blue">Player 2</span> held their score. <span class="red">Player 1</span>'s turn!`;
      playSound(pointSound);
      showFloatingLabel(1, game.currentScore, true);
      switchPlayer();
    }
  }
  game.currentScore = 0;
  player1CurrentScore.textContent = 0;
  player2CurrentScore.textContent = 0;
}

function showFloatingLabel(playerIndex, amount, isPositive) {
  // Create the label element
  const label = document.createElement("div");
  label.classList.add("floating-label");
  label.classList.add(isPositive ? "positive" : "negative");
  label.textContent = isPositive ? `+${amount}` : `-${amount}`;

  // Get the player's score area to position near it
  const playerPanel = playerIndex === 0 ? player1Active : player2Active;
  const rect = playerPanel.getBoundingClientRect();

  // Position the label
  label.style.left = `${rect.left + rect.width / 2 - 30}px`; // Center horizontally
  label.style.top = `${rect.top + 400}px`; // Position near current score

  // Add to page
  document.body.appendChild(label);

  // Remove after animation (1 second)
  setTimeout(() => {
    label.remove();
  }, 1000);
}

function updateWinDisplay() {
  player1WinsDisplay.textContent = game.wins[0];
  player2WinsDisplay.textContent = game.wins[1];

  // Add crown to leader
  if (game.wins[0] > game.wins[1]) {
    player1WinsDisplay.innerHTML = `<span class="icon">👑</span> ${game.wins[0]}`;
    player2WinsDisplay.textContent = game.wins[1];
  } else if (game.wins[1] > game.wins[0]) {
    player1WinsDisplay.textContent = game.wins[0];
    player2WinsDisplay.innerHTML = `<span class="icon">👑</span> ${game.wins[1]}`;
  }
  // If tied, no crown
}

window.addEventListener("load", (event) => {
  init();
});

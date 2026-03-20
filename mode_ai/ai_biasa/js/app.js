(function () {
  'use strict';

  const GESTURE_CHOICES = ['rock', 'scissors', 'paper'];
  const GESTURE_SYMBOLS = { rock: '✊', scissors: '✌️', paper: '✋' };
  const NAME_MAP = { rock: 'BATU', scissors: 'GUNTING', paper: 'KERTAS' };

  const CHOICE_TO_INT = { rock: 0, paper: 1, scissors: 2 };

  function randomChoice() {
    return GESTURE_CHOICES[Math.floor(Math.random() * GESTURE_CHOICES.length)];
  }

  function determineWinner(player, opponent) {
    if (player === opponent) {
      return { status: 'draw', message: 'SERI — ' + (NAME_MAP[player] || player.toUpperCase()) };
    }
    const WINNING_MOVES = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
    if (WINNING_MOVES[player] === opponent) {
      return { status: 'win', message: 'KAMU MENANG!' };
    }
    return { status: 'lose', message: 'KAMU KALAH!' };
  }

  const playerScoreEl = document.getElementById('score-player');
  const systemScoreEl = document.getElementById('score-system');
  const DISPLAY_PLAYER = document.getElementById('display-player');
  const DISPLAY_OPPONENT = document.getElementById('display-opponent');
  const RESULT_TEXT = document.getElementById('final-result');
  const buttonBack = document.getElementById('back-menu');
  const CHOICE_CARDS = document.querySelectorAll('.choice-card');

  const STAT_WIN = document.getElementById('stat-win');
  const STAT_LOSE = document.getElementById('stat-lose');
  const STAT_DRAW = document.getElementById('stat-draw');

  let userScore = 0;
  let comScore = 0;
  let winCount = 0;
  let loseCount = 0;
  let drawCount = 0;

  let lstmModel = null;
  let isLSTMReady = false;
  let playerHistory = [];

  function updateScore() {
    if (playerScoreEl) playerScoreEl.textContent = userScore;
    if (systemScoreEl) systemScoreEl.textContent = comScore;
  }

  function updateStats() {
    if (STAT_WIN) STAT_WIN.textContent = winCount;
    if (STAT_LOSE) STAT_LOSE.textContent = loseCount;
    if (STAT_DRAW) STAT_DRAW.textContent = drawCount;
  }

  function clearChoices() {
    CHOICE_CARDS.forEach(function (card) {
      card.classList.remove('selected');
    });
  }

  function setCardsEnabled(enabled) {
    CHOICE_CARDS.forEach(function (card) {
      if (enabled) {
        card.style.pointerEvents = 'auto';
        card.style.opacity = '1';
      } else {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.4';
      }
    });
  }

  function getAIChoice() {
    if (isLSTMReady && playerHistory.length >= 5) {
      let predicted = lstmModel.predict(playerHistory);
      if (predicted) return predicted;
    }
    return randomChoice();
  }

  CHOICE_CARDS.forEach(function (card) {
    card.addEventListener('click', function () {
      if (!isLSTMReady) return;

      let userChoice = card.getAttribute('data-choice');
      let comChoice = getAIChoice();

      clearChoices();
      card.classList.add('selected');

      if (DISPLAY_PLAYER) {
        DISPLAY_PLAYER.textContent = GESTURE_SYMBOLS[userChoice];
        DISPLAY_PLAYER.classList.add('active');
      }

      if (DISPLAY_OPPONENT) {
        DISPLAY_OPPONENT.textContent = '...';
        DISPLAY_OPPONENT.classList.remove('appear');

        setTimeout(function () {
          DISPLAY_OPPONENT.textContent = GESTURE_SYMBOLS[comChoice];
          DISPLAY_OPPONENT.classList.add('appear');

          let matchResult = determineWinner(userChoice, comChoice);

          if (RESULT_TEXT) {
            RESULT_TEXT.className = 'result-text font-display font-extrabold text-sm sm:text-base tracking-wider';
            RESULT_TEXT.textContent = matchResult.message;

            if (matchResult.status === 'win') {
              userScore++;
              winCount++;
              RESULT_TEXT.classList.add('win-text');
            } else if (matchResult.status === 'lose') {
              comScore++;
              loseCount++;
              RESULT_TEXT.classList.add('lose-text');
            } else {
              drawCount++;
              RESULT_TEXT.classList.add('draw-text');
            }

            updateScore();
            updateStats();
          }

          let choiceInt = CHOICE_TO_INT[userChoice];
          if (choiceInt !== undefined) {
            if (isLSTMReady && playerHistory.length === 5) {
              lstmModel.addPlayerData(playerHistory, choiceInt);
            }
            playerHistory.push(choiceInt);
            if (playerHistory.length > 5) {
              playerHistory.shift();
            }
          }
        }, 400);
      }
    });
  });

  if (buttonBack) {
    buttonBack.addEventListener('click', function () {
      window.location.href = '/#menu';
    });
  }

  function attemptFullscreen() {
    let isMobile = window.innerWidth <= 1024;
    let isPortrait = window.innerHeight > window.innerWidth;
    let docEl = document.documentElement;
    let requestMethod = docEl.requestFullscreen || docEl.webkitRequestFullScreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    
    if (isMobile && !isPortrait && requestMethod && !document.fullscreenElement) {
      requestMethod.call(docEl).catch(function(e) {});
    }
  }

  document.addEventListener('click', attemptFullscreen);
  document.addEventListener('touchstart', attemptFullscreen, {passive: true});

  const LOCK_SCREEN = document.getElementById('lock-screen');

  function checkOrientation() {
    if (!LOCK_SCREEN) return;
    let isPhone = window.innerWidth <= 1024;
    let isPortrait = window.innerHeight > window.innerWidth;
    LOCK_SCREEN.style.display = (isPhone && isPortrait) ? 'flex' : 'none';
  }

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', function () { setTimeout(checkOrientation, 100); });
  checkOrientation();


  async function initLSTM() {
    setCardsEnabled(false);

    if (RESULT_TEXT) {
      RESULT_TEXT.className = 'result-text font-display font-extrabold text-sm sm:text-base tracking-wider';
      RESULT_TEXT.textContent = 'MELATIH AI...';
      RESULT_TEXT.classList.add('draw-text');
    }

    lstmModel = new LSTMPredictor();

    try {
      await lstmModel.train(function (epoch, total, loss, acc) {
        if (RESULT_TEXT) {
          RESULT_TEXT.textContent = 'MELATIH AI... ' + Math.round((epoch / total) * 100) + '%';
        }
      });

      isLSTMReady = true;
      setCardsEnabled(true);

      if (RESULT_TEXT) {
        RESULT_TEXT.textContent = 'AI SIAP! Pilih gesturmu 👊';
        RESULT_TEXT.className = 'result-text font-display font-extrabold text-sm sm:text-base tracking-wider win-text';
      }
    } catch (error) {
      if (RESULT_TEXT) {
        RESULT_TEXT.textContent = 'GAGAL MELATIH AI — mode random aktif';
        RESULT_TEXT.classList.add('lose-text');
      }
      isLSTMReady = false;
      setCardsEnabled(true);
    }
  }

  initLSTM();

})();
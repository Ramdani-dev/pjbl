(function () {
  'use strict';

  const GESTURE_CHOICES = ['rock', 'scissors', 'paper'];
  const GESTURE_SYMBOLS = { rock: '✊', scissors: '✌️', paper: '✋' };

  function randomChoice() {
    return GESTURE_CHOICES[Math.floor(Math.random() * GESTURE_CHOICES.length)];
  }

  function determineWinner(player, opponent) {
    if (player === opponent) {
      return { status: 'seri', pesan: 'SERI — ' + player.toUpperCase() };
    }
    const WINNING_MOVES = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
    if (WINNING_MOVES[player] === opponent) {
      return { status: 'menang', pesan: 'KAMU MENANG!' };
    }
    return { status: 'kalah', pesan: 'KAMU KALAH!' };
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

  CHOICE_CARDS.forEach(function (card) {
    card.addEventListener('click', function () {
      let userChoice = card.getAttribute('data-choice');
      let comChoice = randomChoice();

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
            RESULT_TEXT.textContent = matchResult.pesan;

            if (matchResult.status === 'menang') {
              userScore++;
              winCount++;
              RESULT_TEXT.classList.add('win-text');
            } else if (matchResult.status === 'kalah') {
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

})();
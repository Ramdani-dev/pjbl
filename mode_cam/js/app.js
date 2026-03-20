(function () {
  'use strict';

  const GAME_CHOICES = ['rock', 'scissors', 'paper'];
  const ICON_MAP = { rock: '✊', scissors: '✌️', paper: '✋' };
  const NAME_MAP = { rock: 'BATU', scissors: 'GUNTING', paper: 'KERTAS' };

  // Menerjemahkan label Indonesia dari model AI ke key Inggris
  const labelToKey = { batu: 'rock', gunting: 'scissors', kertas: 'paper', rock: 'rock', scissors: 'scissors', paper: 'paper' };

  function randomChoice() {
    return GAME_CHOICES[Math.floor(Math.random() * GAME_CHOICES.length)];
  }

  function determineWinner(player, opponent) {
    if (player === opponent) {
      return { status: 'seri', pesan: 'SERI — ' + (NAME_MAP[player] || player.toUpperCase()) };
    }
    const WINNING_MOVES = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
    if (WINNING_MOVES[player] === opponent) {
      return { status: 'menang', pesan: 'KAMU MENANG!' };
    }
    return { status: 'kalah', pesan: 'KAMU KALAH!' };
  }

  const videoEl = document.getElementById('videoEl');
  const canvasEl = document.getElementById('canvasEl');
  const buttonOpenCamera = document.getElementById('buttonOpenCamera');
  const buttonCloseCamera = document.getElementById('buttonCloseCamera');
  const buttonBack = document.getElementById('buttonBack');
  
  const textInfo = document.getElementById('textInfo');
  const playerScoreEl = document.getElementById('score-player');
  const systemScoreEl = document.getElementById('score-system');
  const resultBanner = document.getElementById('resultBanner');
  const resultTitleEl = document.getElementById('resultTitleEl');
  const resultSubEl = document.getElementById('resultSubEl');
  
  const displayUser = document.getElementById('displayUser');
  const displayCom = document.getElementById('displayCom');

  const barRock = document.getElementById('barRock');
  const barScissors = document.getElementById('barScissors');
  const barPaper = document.getElementById('barPaper');
  const valRock = document.getElementById('valRock');
  const valScissors = document.getElementById('valScissors');
  const valPaper = document.getElementById('valPaper');

  let camHandler = null;
  let tracker = null;
  let classificationModel = null;

  let isCameraRunning = false;
  let hasGuessed = false;
  let isModelReady = false;
  
  let camSessionScore = { player: 0, opponent: 0 };

  function removeHighlights() {
    document.querySelectorAll('.choice-icon').forEach(function (element) {
      element.classList.remove('active');
    });
  }

  function highlightSystem(choice) {
    removeHighlights();
    let element = document.getElementById('sys-icon-' + choice);
    if (element) element.classList.add('active');
  }

  function updateCameraScore() {
    if (playerScoreEl) playerScoreEl.textContent = camSessionScore.player;
    if (systemScoreEl) systemScoreEl.textContent = camSessionScore.opponent;
  }

  function updateEnergyBars(probabilityList) {
    if (!probabilityList) return;
    probabilityList.forEach(function (item) {
      let name = labelToKey[item.label.toLowerCase()] || item.label.toLowerCase();
      let percent = (item.percentage * 100).toFixed(0);
      
      if (name === 'rock' && barRock) {
        barRock.style.width = percent + '%';
        valRock.textContent = percent + '%';
      }
      if (name === 'scissors' && barScissors) {
        barScissors.style.width = percent + '%';
        valScissors.textContent = percent + '%';
      }
      if (name === 'paper' && barPaper) {
        barPaper.style.width = percent + '%';
        valPaper.textContent = percent + '%';
      }
    });
  }

  function showFinalResult(roundResult, userChoice, comChoice) {
    highlightSystem(comChoice);

    if (displayUser) displayUser.innerHTML = ICON_MAP[userChoice] + ' ' + NAME_MAP[userChoice];
    if (displayCom) displayCom.innerHTML = ICON_MAP[comChoice] + ' ' + NAME_MAP[comChoice];

    if (resultBanner) resultBanner.style.display = 'block';
    
    if (resultTitleEl) {
      resultTitleEl.textContent = roundResult.pesan;
      resultTitleEl.className = 'result-title';
      if (roundResult.status === 'menang') resultTitleEl.classList.add('win-text');
      else if (roundResult.status === 'kalah') resultTitleEl.classList.add('lose-text');
      else resultTitleEl.classList.add('draw-text');
    }
    
    if (resultSubEl) {
      resultSubEl.textContent = ICON_MAP[userChoice] + ' ' + NAME_MAP[userChoice] + ' vs ' + NAME_MAP[comChoice] + ' ' + ICON_MAP[comChoice];
    }

    if (roundResult.status === 'menang') camSessionScore.player++;
    else if (roundResult.status === 'kalah') camSessionScore.opponent++;
    
    updateCameraScore();
  }

  async function initializeCamera() {
    if (isModelReady) return;
    isModelReady = true;

    camHandler = new WebcamManager(videoEl);
    tracker = new HandTracker();
    classificationModel = new GestureModel();

    try {
      if (textInfo) textInfo.textContent = 'MEMUAT SISTEM DETEKSI...';
      await tracker.initialize();
      if (textInfo) textInfo.textContent = 'MEMUAT ALGORITMA...';
    } catch (errorMsg) {
      if (textInfo) textInfo.textContent = 'GAGAL: ' + errorMsg.message;
      return;
    }

    try {
      await classificationModel.loadData('js');
      if (textInfo) textInfo.textContent = 'SIAP, KELUARKAN TANGANMU';
      if (buttonOpenCamera) buttonOpenCamera.disabled = false;
    } catch (errorMsg) {
      if (textInfo) textInfo.textContent = 'GAGAL MODEL: ' + errorMsg.message;
    }
  }

  async function detectionLoop() {
    if (!isCameraRunning) return;

    try {
      let trackResult = await tracker.track(videoEl);
      camHandler.captureFrame(canvasEl);
      tracker.drawLandmarks(canvasEl, trackResult, '#00F0FF');

      if (trackResult && trackResult.multiHandLandmarks && trackResult.multiHandLandmarks.length) {
        if (!hasGuessed) {
          let landmarks = tracker.extractLandmarks(trackResult);
          let guessResult = await classificationModel.predict(landmarks);

          if (guessResult && guessResult.confidence >= 0.5) {
            updateEnergyBars(guessResult.allProbabilities);
            hasGuessed = true;
            
            let playerGuess = labelToKey[guessResult.label.toLowerCase()] || guessResult.label.toLowerCase();
            let opponentGuess = randomChoice();
            let roundResult = determineWinner(playerGuess, opponentGuess);

            if (textInfo) textInfo.textContent = ICON_MAP[playerGuess] + ' ' + NAME_MAP[playerGuess] + ' — ' + (guessResult.confidence * 100).toFixed(0) + '%';
            showFinalResult(roundResult, playerGuess, opponentGuess);
          } else if (guessResult) {
            updateEnergyBars(guessResult.allProbabilities);
          }
        }
      } else {
        hasGuessed = false;
        if (textInfo) textInfo.textContent = 'SIAP, KELUARKAN TANGANMU';
        removeHighlights();
        
        if (resultBanner) resultBanner.style.display = 'none';
        if (displayUser) displayUser.textContent = '—';
        if (displayCom) displayCom.textContent = '—';
      }
    } catch (ignoreErr) {}

    if (isCameraRunning) requestAnimationFrame(detectionLoop);
  }

  if (buttonOpenCamera) {
    buttonOpenCamera.addEventListener('click', async function () {
      try {
        if (textInfo) textInfo.textContent = 'MEMULAI WEBCAM...';
        await camHandler.start();
        buttonOpenCamera.disabled = true;
        if (buttonCloseCamera) buttonCloseCamera.disabled = false;
        if (textInfo) textInfo.textContent = 'SIAP, KELUARKAN TANGANMU';
        isCameraRunning = true;
        detectionLoop();
      } catch (errorMsg) {
        if (textInfo) textInfo.textContent = 'X ' + errorMsg.message;
      }
    });
  }

  if (buttonCloseCamera) {
    buttonCloseCamera.addEventListener('click', stopCamera);
  }



  function stopCamera() {
    isCameraRunning = false;
    if (camHandler && camHandler.isActive) camHandler.stop();
    if (buttonOpenCamera) buttonOpenCamera.disabled = false;
    if (buttonCloseCamera) buttonCloseCamera.disabled = true;
    if (textInfo) textInfo.textContent = 'KAMERA MATI';
    if (resultBanner) resultBanner.style.display = 'none';
    removeHighlights();
    
    if (canvasEl) {
      let ctx = canvasEl.getContext('2d');
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
  }

  if (buttonBack) {
    buttonBack.addEventListener('click', function () {
      stopCamera();
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
    let isMobile = window.innerWidth <= 1024;
    let isPortrait = window.innerHeight > window.innerWidth;
    LOCK_SCREEN.style.display = (isMobile && isPortrait) ? 'flex' : 'none';
  }

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', function () { setTimeout(checkOrientation, 100); });
  checkOrientation();

  // Inisialisasi awal
  initializeCamera();

})();

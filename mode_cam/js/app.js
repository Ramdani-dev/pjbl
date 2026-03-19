(function () {
  'use strict';

  const gameChoices = ['rock', 'scissors', 'paper'];
  const iconMap = { rock: '✊', scissors: '✌️', paper: '✋' };
  const codeMap = { rock: '▓▓', scissors: '◈◈', paper: '░░' };

  function pilihAcak() {
    return gameChoices[Math.floor(Math.random() * gameChoices.length)];
  }

  function aduPilihan(player, opponent) {
    if (player === opponent) {
      return { status: 'seri', pesan: 'SERI — ' + player.toUpperCase() };
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
  const skorPemainEl = document.getElementById('score-player');
  const skorSistemEl = document.getElementById('score-system');
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
    document.querySelectorAll('.choice-icon').forEach(function (elemen) {
      elemen.classList.remove('active');
    });
  }

  function highlightSystem(pilihan) {
    removeHighlights();
    let elemen = document.getElementById('sys-icon-' + pilihan);
    if (elemen) elemen.classList.add('active');
  }

  function updateScoreKamera() {
    if (skorPemainEl) skorPemainEl.textContent = camSessionScore.player;
    if (skorSistemEl) skorSistemEl.textContent = camSessionScore.opponent;
  }

  function updateEnergyBars(daftarKemungkinan) {
    if (!daftarKemungkinan) return;
    daftarKemungkinan.forEach(function (kemungkinan) {
      let nama = kemungkinan.labelJudul.toLowerCase();
      let persen = (kemungkinan.persentase * 100).toFixed(0);
      
      if (nama === 'rock' && barRock) {
        barRock.style.width = persen + '%';
        valRock.textContent = persen + '%';
      }
      if (nama === 'scissors' && barScissors) {
        barScissors.style.width = persen + '%';
        valScissors.textContent = persen + '%';
      }
      if (nama === 'paper' && barPaper) {
        barPaper.style.width = persen + '%';
        valPaper.textContent = persen + '%';
      }
    });
  }

  function showFinalResult(roundResult, userChoice, comChoice) {
    highlightSystem(comChoice);

    if (displayUser) displayUser.innerHTML = '<span style="image-rendering:pixelated;margin-right:2px">' + codeMap[userChoice] + '</span> ' + userChoice.toUpperCase();
    if (displayCom) displayCom.innerHTML = '<span style="image-rendering:pixelated;margin-right:2px">' + codeMap[comChoice] + '</span> ' + comChoice.toUpperCase();

    if (resultBanner) resultBanner.style.display = 'block';
    
    if (resultTitleEl) {
      resultTitleEl.textContent = roundResult.pesan;
      resultTitleEl.className = 'result-title';
      if (roundResult.status === 'menang') resultTitleEl.classList.add('win-text');
      else if (roundResult.status === 'kalah') resultTitleEl.classList.add('lose-text');
      else resultTitleEl.classList.add('draw-text');
    }
    
    if (resultSubEl) {
      resultSubEl.textContent = iconMap[userChoice] + ' ' + userChoice + ' vs ' + comChoice + ' ' + iconMap[comChoice];
    }

    if (roundResult.status === 'menang') camSessionScore.player++;
    else if (roundResult.status === 'kalah') camSessionScore.opponent++;
    
    updateScoreKamera();
  }

  async function initializeKamera() {
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
      await classificationModel.muatData('js');
      if (textInfo) textInfo.textContent = 'SIAP, KELUARKAN TANGANMU';
      if (buttonOpenCamera) buttonOpenCamera.disabled = false;
    } catch (errorMsg) {
      if (textInfo) textInfo.textContent = 'GAGAL MODEL: ' + errorMsg.message;
    }
  }

  async function detectionLoop() {
    if (!isCameraRunning) return;

    try {
      let daftarHasil = await tracker.lacak(videoEl);
      camHandler.tangkapLayar(canvasEl);
      tracker.gambarTitik(canvasEl, daftarHasil, '#00F0FF');

      if (daftarHasil && daftarHasil.multiHandLandmarks && daftarHasil.multiHandLandmarks.length) {
        if (!hasGuessed) {
          let daftarTitik = tracker.ambilTitik(daftarHasil);
          let guessResult = await classificationModel.tebak(daftarTitik);

          if (guessResult && guessResult.keyakinan >= 0.5) {
            updateEnergyBars(guessResult.allProbabilities);
            hasGuessed = true;
            
            let tebakanPemain = guessResult.labelJudul.toLowerCase();
            let tebakanLawan = pilihAcak();
            let akhirAdu = aduPilihan(tebakanPemain, tebakanLawan);

            if (textInfo) textInfo.textContent = iconMap[tebakanPemain] + ' ' + tebakanPemain.toUpperCase() + ' — ' + (guessResult.keyakinan * 100).toFixed(0) + '%';
            showFinalResult(akhirAdu, tebakanPemain, tebakanLawan);
          } else if (guessResult) {
            updateEnergyBars(guessResult.allProbabilities);
          }
        }
      } else {
        hasGuessed = false;
        if (textInfo) textInfo.textContent = 'SIAP, KELUARKAN TANGANMU';
        removeHighlights();
        
        if (resultBanner) resultBanner.style.display = 'none';
        if (displayUser) displayUser.innerHTML = '<span style="image-rendering:pixelated">▪</span>—';
        if (displayCom) displayCom.innerHTML = '<span style="image-rendering:pixelated">▪</span>—';
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
      window.location.href = '../index.html#menu';
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

  const KUNCI_LAYAR = document.getElementById('lock-screen');
  function checkOrientationLayar() {
    if (!KUNCI_LAYAR) return;
    let cekPonsel = window.innerWidth <= 1024;
    let cekPotret = window.innerHeight > window.innerWidth;
    KUNCI_LAYAR.style.display = (cekPonsel && cekPotret) ? 'flex' : 'none';
  }

  window.addEventListener('resize', checkOrientationLayar);
  window.addEventListener('orientationchange', function () { setTimeout(checkOrientationLayar, 100); });
  checkOrientationLayar();

  // Inisialisasi awal
  initializeKamera();

})();

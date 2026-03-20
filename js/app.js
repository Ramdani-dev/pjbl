(function () {
  'use strict';

  const SCREENS = document.querySelectorAll('.screen');
  const buttonStart = document.getElementById('btn-start');
  const buttonBackHome = document.getElementById('button-back-home');
  const CARD_INFO = document.getElementById('card-info');
  const buttonBackMenu = document.getElementById('button-back-menu');
  const buttonBackFromSub = document.getElementById('button-back-from-sub');

  // Sub-selection screen elements
  const subSelectTitle = document.getElementById('sub-select-title');
  const subSelectDesc = document.getElementById('sub-select-desc');
  const subCardBiasa = document.getElementById('sub-card-biasa');
  const subCardAI = document.getElementById('sub-card-ai');

  // Simpan mode yang dipilih (kamera atau biasa) untuk navigasi sub-selection
  let selectedMode = null; // 'kamera' atau 'biasa'

  function showScreen(screenId) {
    SCREENS.forEach(function (screenElement) {
      screenElement.classList.remove('screen-active');
    });
    let targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          targetScreen.classList.add('screen-active');
        });
      });
    }
  }

  if (buttonStart) buttonStart.addEventListener('click', function () { showScreen('menu-screen'); });
  if (buttonBackHome) buttonBackHome.addEventListener('click', function () { showScreen('home-screen'); });
  if (buttonBackMenu) buttonBackMenu.addEventListener('click', function () { showScreen('menu-screen'); });
  if (buttonBackFromSub) buttonBackFromSub.addEventListener('click', function () { showScreen('menu-screen'); });

  // Mode Kamera → Sub-selection
  const btnModeCam = document.getElementById('card-mode-cam');
  if (btnModeCam) btnModeCam.addEventListener('click', function () {
    selectedMode = 'kamera';
    if (subSelectTitle) subSelectTitle.textContent = 'Mode Kamera';
    if (subSelectDesc) subSelectDesc.textContent = 'Pilih tingkat kesulitan untuk mode kamera';
    showScreen('sub-select-screen');
  });

  // Mode Biasa → Sub-selection
  const btnModeBiasa = document.getElementById('card-mode-biasa');
  if (btnModeBiasa) btnModeBiasa.addEventListener('click', function () {
    selectedMode = 'biasa';
    if (subSelectTitle) subSelectTitle.textContent = 'Mode Biasa';
    if (subSelectDesc) subSelectDesc.textContent = 'Pilih tingkat kesulitan untuk mode biasa';
    showScreen('sub-select-screen');
  });

  // Sub-selection: Mode Biasa (random AI)
  if (subCardBiasa) subCardBiasa.addEventListener('click', function () {
    if (selectedMode === 'kamera') {
      window.location.href = '/kamera';
    } else {
      window.location.href = '/suit';
    }
  });

  // Sub-selection: Mode AI (LSTM)
  const aiWarningModal = document.getElementById('ai-warning-modal');
  const aiWarnCancel = document.getElementById('ai-warn-cancel');
  const aiWarnContinue = document.getElementById('ai-warn-continue');

  if (subCardAI) subCardAI.addEventListener('click', function () {
    if (aiWarningModal) {
      aiWarningModal.classList.remove('hidden');
    } else {
      // Fallback kalo modal gak ada
      if (selectedMode === 'kamera') window.location.href = '/kamera-ai';
      else window.location.href = '/suit-ai';
    }
  });

  if (aiWarnCancel) {
    aiWarnCancel.addEventListener('click', function() {
      if (aiWarningModal) aiWarningModal.classList.add('hidden');
    });
  }

  if (aiWarnContinue) {
    aiWarnContinue.addEventListener('click', function() {
      if (selectedMode === 'kamera') {
        window.location.href = '/kamera-ai';
      } else {
        window.location.href = '/suit-ai';
      }
    });
  }

  if (CARD_INFO) CARD_INFO.addEventListener('click', function () { showScreen('info-screen'); });

  document.addEventListener('keydown', function (keyEvent) {
    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
      let homeScreen = document.getElementById('home-screen');
      if (homeScreen && homeScreen.classList.contains('screen-active')) { 
        keyEvent.preventDefault(); 
        showScreen('menu-screen'); 
      }
    }
    if (keyEvent.key === 'Escape') {
      let screenInfo = document.getElementById('info-screen');
      let screenMenu = document.getElementById('menu-screen');
      let screenSub = document.getElementById('sub-select-screen');
      if (screenSub && screenSub.classList.contains('screen-active')) showScreen('menu-screen');
      else if (screenInfo && screenInfo.classList.contains('screen-active')) showScreen('menu-screen');
      else if (screenMenu && screenMenu.classList.contains('screen-active')) showScreen('home-screen');
    }
  });

  const ORIENTATION_LOCK = document.getElementById('orientation-lock');

  function checkOrientation() {
    if (!ORIENTATION_LOCK) return;
    let isMobile = window.innerWidth <= 1024;
    let isPortrait = window.innerHeight > window.innerWidth;
    ORIENTATION_LOCK.style.display = (isMobile && isPortrait) ? 'flex' : 'none';
  }

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', function () { setTimeout(checkOrientation, 100); });
  checkOrientation();

  if (window.location.hash === '#menu') {
    showScreen('menu-screen');
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

})();

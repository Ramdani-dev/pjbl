(function () {
  'use strict';

  const LAYAR = document.querySelectorAll('.screen');
  const buttonStart = document.getElementById('btn-start');
  const buttonBackHome = document.getElementById('button-back-home');
  const KARTU_INFO = document.getElementById('card-info');
  const buttonBackMenu = document.getElementById('button-back-menu');

  function showScreen(screenId) {
    LAYAR.forEach(function (screenElement) {
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
  const btnModeCam = document.getElementById('card-mode-cam');
  if (btnModeCam) btnModeCam.addEventListener('click', function () { window.location.href = '/kamera'; });

  const btnModeBiasa = document.getElementById('card-mode-biasa');
  if (btnModeBiasa) btnModeBiasa.addEventListener('click', function () { window.location.href = '/suit'; });
  if (KARTU_INFO) KARTU_INFO.addEventListener('click', function () { showScreen('info-screen'); });

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
      if (screenInfo && screenInfo.classList.contains('screen-active')) showScreen('menu-screen');
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

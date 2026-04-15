// // // document.addEventListener('DOMContentLoaded', () => {
// // // 	var options = {
// // // 			  slidesToScroll: 2,
// // // 			  slidesToShow: 2,
// // // 			  loop: true,
// // // 			  infinite: true,
// // // 			  initialSlide: 2,
// // // 			  autoplay: false,
// // // 			  autoplaySpeed: 3000,
// // // 			  pagination: false,
// // // 	};
  
// // // 	// Initialize all div with carousel class
// // // 	var carousels = bulmaCarousel.attach('.carousel', options);
// // //   });
  
// // //   window.HELP_IMPROVE_VIDEOJS = false;

// // window.HELP_IMPROVE_VIDEOJS = false;


// // $(document).ready(function() {
// //     // Check for click events on the navbar burger icon

// //     var options = {
// // 			slidesToScroll: 1,
// // 			slidesToShow: 1,
// // 			loop: true,
// // 			infinite: true,
// // 			autoplay: false,
// // 			autoplaySpeed: 3000,
// //     }

// // 		// Initialize all div with carousel class
// //     var carousels = bulmaCarousel.attach('.carousel', options);

// //     // Loop on each carousel initialized
// //     for(var i = 0; i < carousels.length; i++) {
// //     	// Add listener to  event
// //     	carousels[i].on('before:show', state => {
// //     		console.log(state);
// //     	});
// //     }

// //     // Access to bulmaCarousel instance of an element
// //     var element = document.querySelector('#my-element');
// //     if (element && element.bulmaCarousel) {
// //     	// bulmaCarousel instance is available as element.bulmaCarousel
// //     	element.bulmaCarousel.on('before-show', function(state) {
// //     		console.log(state);
// //     	});
// //     }

// //     /*var player = document.getElementById('interpolation-video');
// //     player.addEventListener('loadedmetadata', function() {
// //       $('#interpolation-slider').on('input', function(event) {
// //         console.log(this.value, player.duration);
// //         player.currentTime = player.duration / 100 * this.value;
// //       })
// //     }, false);*/

// //     bulmaSlider.attach();

// // })
// document.addEventListener('DOMContentLoaded', () => {
//   var options = {
// 			slidesToScroll: 3,
// 			slidesToShow: 3,
// 			loop: true,
// 			infinite: true,
// 			initialSlide: 2,
// 			autoplay: false,
// 			autoplaySpeed: 3000,
// 			pagination: false,
//   };

//   // Initialize all div with carousel class
//   var carousels = bulmaCarousel.attach('.carousel', options);
// });

// window.HELP_IMPROVE_VIDEOJS = false;
document.addEventListener('DOMContentLoaded', function () {
  const base = document.getElementById('teaser-video-3dgs');
  const difix = document.getElementById('teaser-video-difix');
  const syncfix = document.getElementById('teaser-video-syncfix');
  const divider = document.getElementById('teaser-divider');
  const leftLabel = document.getElementById('teaser-label-left');
  const rightLabel = document.getElementById('teaser-label-right');

  if (!base || !difix || !syncfix || !divider || !leftLabel || !rightLabel) return;

  const overlays = [difix, syncfix];
  const videos = [base, ...overlays];
  const SEGMENTS = 4;
  const HIDE_LEFT = 'inset(0 0 0 100%)';
  const HIDE_RIGHT = 'inset(0 100% 0 0)';
  const SYNC_DRIFT_THRESHOLD = 0.12;
  const DRIFT_SYNC_INTERVAL_MS = 300;
  let initialized = false;
  let rafId = 0;
  let lastDriftSyncAt = 0;

  function setClip(video, clipValue) {
    video.style.clipPath = clipValue;
    video.style.webkitClipPath = clipValue;
  }

  function safePlay(video) {
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
  }

  function isSyncReady() {
    return (
      base.readyState >= 1 &&
      isFinite(base.duration) &&
      base.duration > 0 &&
      overlays.every((video) => video.readyState >= 1)
    );
  }

  function syncPlayback(force) {
    if (!isSyncReady()) return;
    const t = base.currentTime;
    overlays.forEach((video) => {
      if (force || Math.abs(video.currentTime - t) > SYNC_DRIFT_THRESHOLD) {
        try {
          video.currentTime = t;
        } catch (_) {}
      }
    });
  }

  function syncPlaybackThrottled() {
    const now = performance.now();
    if (now - lastDriftSyncAt < DRIFT_SYNC_INTERVAL_MS) return;
    lastDriftSyncAt = now;
    syncPlayback(false);
  }

  function motionState(progress) {
    let s = progress * SEGMENTS;
    if (s >= SEGMENTS) s = SEGMENTS - 1e-6;

    const seg = Math.floor(s);
    const local = s - seg;

    // Odd segments: R→L (x goes 1→0); even segments except 0: L→R (x goes 0→1)
    if (seg === 1 || seg === 3) {
      return { seg, x: 1 - local };
    }
    return { seg, x: local };
  }

  function updateWipe() {
    if (!base.duration || !isFinite(base.duration)) return;

    const progress = (base.currentTime % base.duration) / base.duration;
    const state = motionState(progress);
    const x = Math.max(0, Math.min(1, state.x));
    const xPct = x * 100;

    const clipLeftSync = `inset(0 ${100 - xPct}% 0 0)`;
    const clipRightDifix = `inset(0 0 0 ${xPct}%)`;

    if (state.seg === 0) {
      setClip(syncfix, clipLeftSync);
      setClip(difix, HIDE_LEFT);
      syncfix.style.zIndex = '3';
      difix.style.zIndex = '2';
      leftLabel.textContent = 'SyncFix';
      leftLabel.style.visibility = 'visible';
      rightLabel.textContent = '3DGS';
      rightLabel.style.visibility = 'visible';
    } else if (state.seg === 1 || state.seg === 3) {
      setClip(syncfix, clipLeftSync);
      setClip(difix, clipRightDifix);
      syncfix.style.zIndex = '3';
      difix.style.zIndex = '4';
      leftLabel.textContent = 'SyncFix';
      leftLabel.style.visibility = 'visible';
      rightLabel.textContent = 'Difix3D+';
      rightLabel.style.visibility = 'visible';
    } else {
      // seg 2: L→R SyncFix over Difix strip on the right
      setClip(syncfix, clipLeftSync);
      setClip(difix, clipRightDifix);
      syncfix.style.zIndex = '3';
      difix.style.zIndex = '4';
      leftLabel.textContent = 'SyncFix';
      leftLabel.style.visibility = 'visible';
      if (x >= 1 - 1e-6) {
        rightLabel.style.visibility = 'hidden';
      } else {
        rightLabel.textContent = 'Difix3D+';
        rightLabel.style.visibility = 'visible';
      }
    }

    divider.style.left = `calc(${xPct}% - 1.5px)`;
  }

  function rafTick() {
    updateWipe();
    if (!base.paused) {
      rafId = requestAnimationFrame(rafTick);
    }
  }

  function startRaf() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(rafTick);
  }

  function tryResumePlayback(forceSync) {
    if (!initialized) return;
    if (forceSync) syncPlayback(true);
    videos.forEach(safePlay);
    if (!base.paused) startRaf();
  }

  function recoverFromStall() {
    syncPlayback(true);
    tryResumePlayback(false);
    updateWipe();
  }

  function initialize() {
    if (initialized || !isSyncReady()) return;
    initialized = true;

    setClip(difix, HIDE_LEFT);
    setClip(syncfix, HIDE_RIGHT);
    syncfix.style.zIndex = '3';
    difix.style.zIndex = '2';
    syncPlayback(true);
    updateWipe();
    tryResumePlayback(false);
  }

  videos.forEach((video) => {
    video.addEventListener('loadedmetadata', initialize);
    video.addEventListener('canplay', initialize);
  });

  setClip(difix, HIDE_LEFT);
  setClip(syncfix, HIDE_RIGHT);
  syncfix.style.zIndex = '3';
  difix.style.zIndex = '2';

  base.addEventListener('play', function () {
    tryResumePlayback(true);
    updateWipe();
  });

  base.addEventListener('pause', function () {
    cancelAnimationFrame(rafId);
  });

  base.addEventListener('timeupdate', function () {
    syncPlaybackThrottled();
    updateWipe();
  });

  base.addEventListener('seeking', function () {
    syncPlayback(true);
    updateWipe();
  });

  base.addEventListener('seeked', function () {
    syncPlayback(true);
    updateWipe();
  });

  base.addEventListener('ended', function () {
    syncPlayback(true);
    updateWipe();
  });

  videos.forEach((video) => {
    ['waiting', 'stalled', 'error'].forEach((eventName) => {
      video.addEventListener(eventName, recoverFromStall);
    });
  });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && initialized) {
      tryResumePlayback(true);
      updateWipe();
    }
  });

  ['pointerdown', 'touchstart', 'keydown'].forEach((eventName) => {
    document.addEventListener(eventName, function () {
      tryResumePlayback(true);
    });
  });

  initialize();
});
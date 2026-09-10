const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = document.querySelector('.motion-toggle');
const concept = document.body.dataset.concept;
const pointer = { x: 0, y: 0 };
let paused = reducedMotion.matches;
let frame = 0;
let lastTime = 0;
let elapsed = 0;
let render = () => {};
let resize = () => {};
let motionAvailable = true;

function updateToggle() {
  document.body.classList.toggle('is-paused', paused);
  document.body.classList.toggle('motion-enabled', !paused);
  toggle.setAttribute('aria-pressed', String(paused));
  const label = paused ? 'アニメーションを再生' : 'アニメーションを一時停止';
  toggle.setAttribute('aria-label', label);
  toggle.title = label;
}

function tick(now) {
  if (lastTime) elapsed += Math.min(now - lastTime, 50) / 1000;
  lastTime = now;
  render(elapsed, pointer);
  frame = requestAnimationFrame(tick);
}

function syncAnimation() {
  cancelAnimationFrame(frame);
  lastTime = 0;
  updateToggle();
  if (motionAvailable && !paused && !document.hidden) frame = requestAnimationFrame(tick);
}

toggle.hidden = false;
toggle.addEventListener('click', () => {
  paused = !paused;
  syncAnimation();
});
reducedMotion.addEventListener('change', () => {
  paused = reducedMotion.matches;
  syncAnimation();
});
document.addEventListener('visibilitychange', syncAnimation);
window.addEventListener('pointermove', (event) => {
  pointer.x = event.clientX / innerWidth * 2 - 1;
  pointer.y = event.clientY / innerHeight * 2 - 1;
}, { passive: true });
document.addEventListener('pointerleave', () => {
  pointer.x = 0;
  pointer.y = 0;
});
window.addEventListener('resize', () => {
  resize();
  render(elapsed, pointer);
});

if (concept === 'trace') {
  const letters = [...document.querySelectorAll('.kinetic-title > span')];
  const title = document.querySelector('.kinetic-title');
  let hovered = false;
  title.addEventListener('pointerenter', () => { hovered = true; });
  title.addEventListener('pointerleave', () => { hovered = false; });
  const offsets = letters.map(() => 0);
  render = (time, position) => {
    if (time < 1.5) return;
    const cursorX = (position.x + 1) * innerWidth / 2;
    letters.forEach((letter, index) => {
      const bounds = letter.getBoundingClientRect();
      const distance = Math.abs(cursorX - bounds.x - bounds.width / 2);
      const target = hovered ? -Math.max(0, 1 - distance / 150) * 14 : 0;
      offsets[index] += (target - offsets[index]) * 0.12;
      letter.style.translate = `0 ${offsets[index]}px`;
    });
  };
} else if (concept === 'resonance') {
  const canvas = document.querySelector('.wave-canvas');
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let smoothX = 0;
  let smoothY = 0;
  resize = () => {
    width = innerWidth;
    height = innerHeight;
    const ratio = Math.min(devicePixelRatio, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  render = (time, position) => {
    smoothX += (position.x - smoothX) * 0.035;
    smoothY += (position.y - smoothY) * 0.035;
    context.clearRect(0, 0, width, height);
    const count = width < 700 ? 32 : 48;
    for (let line = 0; line < count; line++) {
      const depth = line / (count - 1);
      context.beginPath();
      for (let x = -12; x <= width + 12; x += 8) {
        const progress = x / width;
        const envelope = Math.pow(Math.sin(progress * Math.PI), 2);
        const wave = Math.sin(progress * Math.PI * 2 + time * 0.22 + depth * 1.7 + smoothX * 0.6);
        const fold = Math.cos(progress * Math.PI * 3 - time * 0.16 + depth * 2.4);
        const y = height * (0.63 + depth * 0.25) + wave * height * 0.12 * envelope + fold * height * 0.06 + smoothY * 26 * envelope;
        if (x === -12) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.strokeStyle = line % 7 === 0 ? 'rgba(177, 237, 200, 0.35)' : `rgba(130, 168, 151, ${0.09 + depth * 0.12})`;
      context.lineWidth = 0.8;
      context.stroke();
    }
  };
} else if (concept === 'tactile') {
  try {
    const { createScene } = await import('./tactile.js');
    ({ render, resize } = await createScene(document.querySelector('.tactile-scene')));
  } catch (error) {
    motionAvailable = false;
    toggle.hidden = true;
    console.warn('The static profile image is displayed because WebGL is unavailable.', error);
  }
}

resize();
render(elapsed, pointer);
syncAnimation();

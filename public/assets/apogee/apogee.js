// All motion is CSS. This script writes today's moon phase, aligns the CSS-driven
// UTC clock with the real time, and lays the parts out over the whole window.
const mobileQuery = matchMedia('(max-width: 899px) and (max-aspect-ratio: 9/10)');
const synodicMonth = 29.530588853;
const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
const phaseNames = ['NEW MOON', 'WAXING CRESCENT', 'FIRST QUARTER', 'WAXING GIBBOUS', 'FULL MOON', 'WANING GIBBOUS', 'LAST QUARTER', 'WANING CRESCENT'];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function refs(name) {
  return document.querySelectorAll(`[data-ref="${name}"]`);
}

function writeMoon() {
  let age = ((Date.now() - knownNewMoon) / 86400000) % synodicMonth;
  if (age < 0) age += synodicMonth;
  const fraction = age / synodicMonth;
  const index = Math.floor(fraction * 8 + 0.5) % 8;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * fraction)) / 2 * 100);
  for (const el of refs('moonAge')) el.textContent = `${age.toFixed(1)} d`;
  for (const el of refs('moonName')) el.textContent = phaseNames[index];
  for (const el of refs('moonIllum')) el.textContent = `${illumination}%`;
  for (const el of refs('phase')) el.setAttribute('transform', `translate(${index * Number(el.dataset.pitch)} 0)`);
}

function syncClock() {
  const now = new Date();
  const seconds = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds() + now.getUTCMilliseconds() / 1000;
  const periods = { uH: 86400, uM10: 3600, uM1: 600, uS10: 60, uS1: 10, playhead: 60 };
  for (const [name, period] of Object.entries(periods)) {
    for (const el of refs(name)) el.style.animationDelay = `${-(seconds % period)}s`;
  }
}

// Design units: the desktop artboard is 1440x900 with 118-unit bars, the mobile one 390 wide
// with a 108-unit top bar and a 316-unit bottom panel. The stage takes the window's aspect.
function desktopLayout(vw, vh) {
  const k = Math.min(vw / 1440, vh / 900);
  const W = vw / k;
  const H = vh / k;
  const st = clamp(W / 1440, 1, 1.28);
  const frame = H - 236;
  const si = clamp(Math.min(frame / 600, 1.28, (W - 563 * st - 60) / 740), 0.8, 1.28);
  const cx = W - 440 * si - Math.max(0, W - 1780) * 0.45;
  const cy = H / 2;
  const ty = cy - 440 * st;

  const x0 = 588 * st;
  const y0 = ty + 420.5 * st;
  const x3 = cx - 196 * si;
  const y3 = cy + 0.5 * si;
  const x1 = Math.max(x0 + 24, x3 - 70 - (y3 - y0));
  const x2 = Math.min(x3, x1 + (y3 - y0));
  for (const el of refs('leadPath')) el.setAttribute('d', `M${x0} ${y0}H${x1}L${x2} ${y3}H${x3}`);
  for (const el of refs('leadTick')) el.setAttribute('d', `M${x3} ${y3 - 4}V${y3 + 4}`);
  for (const el of refs('leadDot')) { el.setAttribute('cx', x0); el.setAttribute('cy', y0); }
  for (const el of refs('frame')) el.textContent = `${vw}×${vh}`;
  for (const el of refs('ratio')) el.textContent = (vw / (frame * k)).toFixed(2);
  return { k, W, H, cx, cy, si, st, ty };
}

function mobileLayout(vw, vh) {
  const k = Math.min(vw / 390, vh / 760);
  const W = vw / k;
  const H = vh / k;
  const frame = H - 424;
  return { k, W, H, cx: W / 2, cy: 108 + frame / 2, si: clamp(frame / 420, 0.7, 1.25) };
}

function layout() {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const vars = mobileQuery.matches ? mobileLayout(vw, vh) : desktopLayout(vw, vh);
  const style = document.documentElement.style;
  for (const [name, value] of Object.entries(vars)) style.setProperty(`--${name}`, String(value));
  style.setProperty('--cxp', String(vars.cx / vars.W * 100));
  style.setProperty('--cyp', String(vars.cy / vars.H * 100));
}

writeMoon();
syncClock();
layout();
addEventListener('resize', layout);
mobileQuery.addEventListener('change', layout);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) syncClock();
});

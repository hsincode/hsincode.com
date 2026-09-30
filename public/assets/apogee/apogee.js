// All motion is CSS. This script only writes today's moon phase, aligns the
// CSS-driven UTC clock with the real time, and scales the artboard to the window.
const mobileQuery = matchMedia('(max-width: 899px) and (max-aspect-ratio: 9/10)');
const synodicMonth = 29.530588853;
const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
const phaseNames = ['NEW MOON', 'WAXING CRESCENT', 'FIRST QUARTER', 'WAXING GIBBOUS', 'FULL MOON', 'WANING GIBBOUS', 'LAST QUARTER', 'WANING CRESCENT'];

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

function fit() {
  const scale = mobileQuery.matches
    ? Math.min(innerWidth / 390, 1.6)
    : Math.min(innerWidth / 1440, innerHeight / 900);
  document.documentElement.style.setProperty('--s', String(scale));
  for (const el of refs('frame')) el.textContent = `${innerWidth}×${innerHeight}`;
}

writeMoon();
syncClock();
fit();
addEventListener('resize', fit);
mobileQuery.addEventListener('change', fit);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) syncClock();
});

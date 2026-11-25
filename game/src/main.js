// main.js — boot, loop utama, input keyboard + mouse, dan mode screenshot.
import { layout, pointInRect, addIngredient, updateKitchen, plateDish, movePlateToServe, serveDish, clearWok, resetRun, W, H } from './kitchen.js';
import { INGREDIENT_ORDER } from './recipes.js';
import { spawnOrder, spawnIntervalMs, updateOrders } from './orders.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import audio from './audio.js';

const HIGH_KEY = 'nasi-goreng-rush-highscore';

function freshState() {
  let high = 0;
  try { high = parseInt(localStorage.getItem(HIGH_KEY) || '0', 10) || 0; } catch (e) { high = 0; }
  return {
    mode: 'title',
    time: 0,
    shiftLength: 150000,
    score: 0,
    combo: 0,
    bestCombo: 0,
    lives: 3,
    orders: [],
    wok: [],
    wokReady: null,
    wokCooking: null,
    wokCook: 0,
    wokCookTotal: 0,
    chopping: null,
    plate: null,
    plateAtServe: false,
    nextOrderIn: 1500,
    orderSeq: 0,
    served: 0,
    missed: 0,
    wrong: 0,
    message: '',
    messageUntil: 0,
    flash: null,
    frozen: false,
    muted: false,
    high,
    shake: 0,
  };
}

const state = freshState();
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function saveHigh() {
  if (state.score > state.high) {
    state.high = state.score;
    try { localStorage.setItem(HIGH_KEY, String(state.high)); } catch (e) { /* abaikan */ }
  }
}

function startGame() {
  resetRun(state);
  audio.ensure();
  audio.click();
}

function endGame() {
  state.mode = 'over';
  saveHigh();
}

function togglePause() {
  if (state.mode === 'playing') { state.mode = 'paused'; audio.click(); }
  else if (state.mode === 'paused') { state.mode = 'playing'; audio.click(); }
}

function handleClick(px, py) {
  const L = layout();
  audio.ensure();
  if (state.mode === 'title') { startGame(); return; }
  if (state.mode === 'over') { startGame(); return; }
  if (state.mode === 'paused') { togglePause(); return; }
  if (state.frozen) return;
  // Bin bahan
  for (const bin of L.bins) {
    if (pointInRect(px, py, bin)) { addIngredient(state, bin.id, performance.now()); return; }
  }
  // Talenan: klik tidak melakukan apa-apa (proses otomatis)
  // Wajan: tata hidangan matang ke piring
  const dx = px - L.wok.x, dy = py - L.wok.y;
  if (dx * dx + dy * dy <= L.wok.r * L.wok.r) { plateDish(state); return; }
  // Piring: antar ke jendela serve
  if (pointInRect(px, py, L.plate)) { movePlateToServe(state); return; }
  // Jendela serve
  if (pointInRect(px, py, L.serve)) { serveDish(state, performance.now()); return; }
  // Tempat sampah
  if (pointInRect(px, py, L.trash)) { clearWok(state); return; }
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (W / rect.width);
  const py = (e.clientY - rect.top) * (H / rect.height);
  handleClick(px, py);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (state.mode === 'title' || state.mode === 'over') startGame();
    return;
  }
  if (e.key === 'p' || e.key === 'P') { togglePause(); return; }
  if (e.key === 'm' || e.key === 'M') { audio.muted = !audio.muted; return; }
  if (state.mode !== 'playing' || state.frozen) return;
  if (e.key === ' ') { e.preventDefault(); serveDish(state, performance.now()); return; }
  const idx = ['1', '2', '3', '4', '5', '6', '7', '8'].indexOf(e.key);
  if (idx >= 0) addIngredient(state, INGREDIENT_ORDER[idx], performance.now());
});

let last = performance.now();
function loop(now) {
  const dt = Math.min(100, now - last);
  last = now;
  if (state.mode === 'playing' && !state.frozen) {
    state.time += dt;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 0.02);
    // Pesanan baru
    state.nextOrderIn -= dt;
    if (state.nextOrderIn <= 0 && state.orders.length < 4) {
      spawnOrder(state, now);
      state.nextOrderIn = spawnIntervalMs(state.time);
    }
    updateOrders(state, dt);
    updateKitchen(state, dt);
    if (state.lives <= 0) endGame();
    else if (state.time >= state.shiftLength) endGame();
  }
  render(ctx, state);
  requestAnimationFrame(loop);
}

// Mode screenshot: ?shot=start|play|serve|rush — siapkan adegan dan bekukan timer.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  stageShot(state, shot);
}
requestAnimationFrame(loop);

// Ekspos untuk play-test otomatis.
window.__ngr = { state, startGame };

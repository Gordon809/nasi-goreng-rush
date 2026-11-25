// kitchen.js — geometri dapur dan semua interaksi: talenan, wajan, piring, serve, sampah.
import { INGREDIENTS, INGREDIENT_ORDER, recipeForSet, recipeById, ingredientNeededByOrders } from './recipes.js';
import { findOrderForDish } from './orders.js';
import audio from './audio.js';

export const W = 1280;
export const H = 720;

// Semua stasiun dalam koordinat canvas tetap (1280x720).
export function layout() {
  const bins = INGREDIENT_ORDER.map((id, i) => ({
    id,
    x: 16 + i * 158,
    y: 214,
    w: 146,
    h: 92,
  }));
  return {
    topBar: { x: 0, y: 0, w: W, h: 84 },
    orderBoard: { x: 16, y: 92, w: W - 32, h: 104 },
    orderSlots: [0, 1, 2, 3].map((i) => ({ x: 16 + i * 313, y: 96, w: 301, h: 96 })),
    bins,
    board: { x: 16, y: 326, w: 300, h: 218, label: 'TALENAN' },
    wok: { x: 640, y: 438, r: 112, label: 'WAJAN' },
    plate: { x: 964, y: 326, w: 300, h: 218, label: 'PIRING SAJI' },
    serve: { x: 820, y: 566, w: 444, h: 138, label: 'JENDELA SERVE' },
    trash: { x: 16, y: 566, w: 220, h: 138, label: 'TEMPAT SAMPAH' },
    message: { x: 260, y: 566, w: 536, h: 138 },
  };
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function setMessage(state, text) {
  state.message = text;
  state.messageUntil = performance.now() + 1800;
}

// Klik sebuah bin bahan: masuk talenan (kalau perlu dipotong) atau langsung ke wajan.
export function addIngredient(state, ingId, now) {
  if (state.mode !== 'playing' || state.frozen) return;
  const ing = INGREDIENTS[ingId];
  if (!ing) return;
  if (state.wok.length >= 4) { setMessage(state, 'Wajan penuh! Selesaikan dulu'); audio.error(); return; }
  if (state.wok.includes(ingId)) { setMessage(state, `${ing.name} sudah di wajan`); audio.error(); return; }
  if (!ingredientNeededByOrders(ingId, state.orders)) {
    setMessage(state, `${ing.name} tidak dibutuhkan pesanan aktif`);
    audio.error();
    state.shake = 6;
    return;
  }
  if (state.chopping) { setMessage(state, 'Talenan sibuk — tunggu sebentar'); audio.error(); return; }
  audio.click();
  if (ing.chop > 0) {
    state.chopping = { ing: ingId, progress: 0, total: ing.chop };
    audio.chop();
  } else {
    dropIntoWok(state, ingId);
  }
}

function dropIntoWok(state, ingId) {
  state.wok.push(ingId);
  audio.toss();
  const r = recipeForSet(state.wok);
  if (r) {
    state.wokCook = 0;
    state.wokCookTotal = 800;
    state.wokCooking = r.id;
    audio.sizzle();
  } else if (state.wok.length >= 4) {
    setMessage(state, 'Kombinasi salah — buang ke tempat sampah');
    audio.error();
  }
}

// Progres potong di talenan dan masak di wajan.
export function updateKitchen(state, dt) {
  if (state.chopping) {
    state.chopping.progress += dt;
    if (state.chopping.progress >= state.chopping.total) {
      const ingId = state.chopping.ing;
      state.chopping = null;
      dropIntoWok(state, ingId);
    }
  }
  if (state.wokCooking) {
    state.wokCook += dt;
    if (state.wokCook >= state.wokCookTotal) {
      state.wokReady = state.wokCooking;
      state.wokCooking = null;
      setMessage(state, `${(recipeById(state.wokReady) || {}).name || 'Hidangan'} matang! Klik wajan untuk menata di piring`);
      audio.ding();
    }
  }
}

// Klik wajan saat hidangan matang: pindah ke piring saji.
export function plateDish(state) {
  if (state.mode !== 'playing' || state.frozen) return;
  if (!state.wokReady) return;
  if (state.plate) { setMessage(state, 'Piring masih terisi — sajikan dulu'); audio.error(); return; }
  state.plate = state.wokReady;
  state.plateAtServe = false;
  state.wok = [];
  state.wokReady = null;
  audio.click();
}

// Klik piring: antar piring ke jendela serve.
export function movePlateToServe(state) {
  if (state.mode !== 'playing' || state.frozen) return;
  if (!state.plate || state.plateAtServe) return;
  state.plateAtServe = true;
  audio.click();
}

// Klik jendela serve (atau Spasi): sajikan hidangan yang sudah di jendela.
export function serveDish(state, now) {
  if (state.mode !== 'playing' || state.frozen) return;
  if (!state.plate || !state.plateAtServe) {
    if (state.plate) setMessage(state, 'Klik piring dulu untuk antar ke jendela');
    return;
  }
  const recipe = recipeById(state.plate);
  const order = findOrderForDish(state, state.plate);
  if (!order) {
    state.score = Math.max(0, state.score - 25);
    state.combo = 0;
    state.wrong += 1;
    setMessage(state, `Tidak ada pesanan ${recipe ? recipe.name : ''} — -25 poin`);
    audio.error();
    state.plate = null;
    state.plateAtServe = false;
    return;
  }
  const patienceLeft = Math.max(0, order.patience / order.max);
  const mult = 1 + Math.min(state.combo, 10) * 0.1;
  let pts = recipe.base + Math.round(patienceLeft * 60);
  if (patienceLeft > 0.5) pts += 25;
  pts = Math.round(pts * mult);
  state.score += pts;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served += 1;
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.plate = null;
  state.plateAtServe = false;
  setMessage(state, `Tersaji! +${pts} poin${state.combo > 1 ? ` (kombo x${state.combo})` : ''}`);
  audio.ding();
  state.flash = { kind: 'serve', until: now + 500 };
}

// Buang isi wajan.
export function clearWok(state) {
  if (state.mode !== 'playing' || state.frozen) return;
  if (state.wok.length === 0 && !state.wokReady && !state.wokCooking) return;
  state.wok = [];
  state.wokReady = null;
  state.wokCooking = null;
  state.wokCook = 0;
  setMessage(state, 'Wajan dibersihkan');
  audio.click();
}

export function resetRun(state) {
  state.mode = 'playing';
  state.time = 0;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.lives = 3;
  state.orders = [];
  state.wok = [];
  state.wokReady = null;
  state.wokCooking = null;
  state.wokCook = 0;
  state.chopping = null;
  state.plate = null;
  state.plateAtServe = false;
  state.nextOrderIn = 1500;
  state.orderSeq = 0;
  state.served = 0;
  state.missed = 0;
  state.wrong = 0;
  state.message = '';
  state.flash = null;
}

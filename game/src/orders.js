// orders.js — penjadwalan pesanan, timer kesabaran, dan penyelesaian pesanan.
import { RECIPES, recipeById } from './recipes.js';

// Jeda antar pesanan menyusut seiring waktu: mulai 10 detik, turun ke 6,5 detik.
export function spawnIntervalMs(elapsedMs) {
  const step = Math.floor(elapsedMs / 20000);
  return Math.max(6500, 10000 - step * 500);
}

// Kesabaran tiap pesanan menyusut seiring waktu: mulai 42 detik, turun ke 26 detik.
export function patienceMs(elapsedMs) {
  const step = Math.floor(elapsedMs / 20000);
  return Math.max(26000, 42000 - step * 2000);
}

export function spawnOrder(state, now) {
  // Hindari resep yang sama dua kali berturut-turut.
  const recent = state.orders.slice(-2).map((o) => o.recipeId);
  const pool = RECIPES.filter((r) => !recent.includes(r.id));
  const recipe = pool[Math.floor(Math.random() * pool.length)];
  const patience = patienceMs(state.time);
  state.orders.push({
    id: ++state.orderSeq,
    recipeId: recipe.id,
    patience,
    max: patience,
    bornAt: now,
  });
  return recipe;
}

// Turunkan timer semua pesanan; pesanan yang habis waktunya hangus (nyawa -1, kombo reset).
// Mengembalikan daftar pesanan yang hangus pada tick ini.
export function updateOrders(state, dt) {
  const missed = [];
  for (const o of state.orders) o.patience -= dt;
  state.orders = state.orders.filter((o) => {
    if (o.patience <= 0) {
      missed.push(o);
      return false;
    }
    return true;
  });
  for (const o of missed) {
    state.lives -= 1;
    state.combo = 0;
    state.missed += 1;
    const r = recipeById(o.recipeId);
    state.message = `Pesanan ${r ? r.name : ''} hangus! -1 nyawa`;
    state.messageUntil = performance.now() + 1800;
  }
  return missed;
}

// Cari pesanan aktif tertua yang cocok dengan hidangan yang disajikan.
export function findOrderForDish(state, recipeId) {
  let best = null;
  for (const o of state.orders) {
    if (o.recipeId === recipeId && (!best || o.bornAt < best.bornAt)) best = o;
  }
  return best;
}

// shots.js — staging adegan deterministik untuk screenshot (?shot=start|play|serve|rush).
// Setiap adegan mengatur state ke posisi tetap lalu membekukan timer, supaya hasil
// tangkapan stabil dan menunjukkan kelima elemen yang dinilai juri.
import { recipeById } from './recipes.js';

function makeOrder(id, recipeId, patience, max) {
  return { id, recipeId, patience, max, bornAt: 0 };
}

export function stageShot(state, name) {
  state.frozen = true;
  state.mode = 'playing';
  state.lives = 3;
  state.message = '';
  state.flash = null;
  state.chopping = null;
  state.wok = [];
  state.wokReady = null;
  state.wokCooking = null;
  state.plate = null;
  state.plateAtServe = false;

  if (name === 'start') {
    state.mode = 'title';
    state.score = 0;
    state.combo = 0;
    state.time = 0;
    state.orders = [];
    return;
  }

  if (name === 'play') {
    // Dua pesanan aktif, wajan berisi nasi + telur sedang dimasak (55%),
    // bawang sedang dipotong di talenan (60%).
    state.score = 340;
    state.combo = 2;
    state.time = 38000;
    state.orders = [
      makeOrder(1, 'nasgor', 32000, 42000),
      makeOrder(2, 'miegor', 24000, 42000),
    ];
    state.wok = ['nasi', 'telur'];
    state.wokCooking = 'nasgor';
    state.wokCook = 495;
    state.wokCookTotal = 900;
    state.chopping = { ing: 'bawang', progress: 540, total: 900 };
    return;
  }

  if (name === 'serve') {
    // Nasi Goreng Spesial matang dan sudah ditata di piring, siap diantar.
    state.score = 520;
    state.combo = 3;
    state.time = 61000;
    state.orders = [makeOrder(3, 'nasgor', 18000, 42000)];
    state.wok = [];
    state.plate = 'nasgor';
    state.plateAtServe = true;
    state.message = 'Nasi Goreng Spesial matang! Klik jendela serve';
    state.messageUntil = performance.now() + 60000;
    return;
  }

  if (name === 'rush') {
    // Empat pesanan, satu tinggal 6 detik (merah), kombo x5, shift tinggal 38 detik.
    state.score = 1240;
    state.combo = 5;
    state.time = 112000;
    state.orders = [
      makeOrder(4, 'nasgor-pedas', 6000, 34000),
      makeOrder(5, 'miegor', 15000, 34000),
      makeOrder(6, 'sate', 22000, 34000),
      makeOrder(7, 'nasgor', 29000, 34000),
    ];
    state.wok = ['mie', 'telur', 'sayur'];
    state.wokCooking = 'miegor';
    state.wokCook = 720;
    state.wokCookTotal = 900;
    state.chopping = null;
    return;
  }

  // Nama tidak dikenal: kembali ke judul.
  state.mode = 'title';
  state.orders = [];
}

export { recipeById };

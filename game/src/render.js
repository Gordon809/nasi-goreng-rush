// render.js — semua gambar canvas: dapur, papan pesanan, bahan, wajan, piring, HUD, layar judul/akhir.
import { INGREDIENTS, INGREDIENT_ORDER, recipeById } from './recipes.js';
import { layout, W, H, pointInRect } from './kitchen.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight, align) {
  ctx.fillStyle = color || '#2b2118';
  ctx.font = `${weight || 700} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

// Ikon makanan digambar dari bentuk, bukan emoji — terbaca saat dikecilkan.
export function drawIngredientIcon(ctx, ingId, cx, cy, r) {
  const ing = INGREDIENTS[ingId];
  if (!ing) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = ing.color;
  ctx.strokeStyle = ing.dark;
  ctx.lineWidth = 2;
  if (ingId === 'nasi') {
    ctx.beginPath(); ctx.ellipse(0, 4, r, r * 0.62, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = ing.dark;
    for (const [dx, dy] of [[-r * 0.4, -2], [0, -6], [r * 0.4, -1], [-r * 0.15, 3]]) {
      ctx.beginPath(); ctx.arc(dx, dy, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  } else if (ingId === 'mie') {
    ctx.lineWidth = 3;
    ctx.strokeStyle = ing.dark;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-r + 2, i * r * 0.45);
      ctx.bezierCurveTo(-r * 0.4, i * r * 0.45 - r * 0.5, r * 0.4, i * r * 0.45 + r * 0.5, r - 2, i * r * 0.45);
      ctx.stroke();
    }
  } else if (ingId === 'telur') {
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.75, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f9c74f';
    ctx.beginPath(); ctx.arc(r * 0.15, 0, r * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d98e1f'; ctx.lineWidth = 1.5; ctx.stroke();
  } else if (ingId === 'ayam') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.9, r * 0.55, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = ing.dark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * 0.7, r * 0.4); ctx.lineTo(r * 0.7, -r * 0.4); ctx.stroke();
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.arc(-r * 0.45, r * 0.28, r * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.1, -r * 0.05, r * 0.16, 0, Math.PI * 2); ctx.fill();
  } else if (ingId === 'sayur') {
    ctx.fillStyle = ing.color;
    for (let i = 0; i < 3; i++) {
      const a = -0.5 + i * 0.5;
      ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, r * 0.55, r * 0.28, a, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  } else if (ingId === 'bawang') {
    ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = ing.dark; ctx.lineWidth = 2;
    for (const rad of [0.55, 0.3]) {
      ctx.beginPath(); ctx.arc(0, 0, r * rad, 0, Math.PI * 2); ctx.stroke();
    }
  } else if (ingId === 'kecap') {
    ctx.fillStyle = ing.color;
    rr(ctx, -r * 0.45, -r * 0.7, r * 0.9, r * 1.4, r * 0.3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8a13a';
    ctx.fillRect(-r * 0.45, -r * 0.7, r * 0.9, r * 0.3);
  } else if (ingId === 'cabai') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.3);
    ctx.quadraticCurveTo(0, -r * 1.1, r * 0.8, -r * 0.2);
    ctx.quadraticCurveTo(r * 0.4, r * 0.5, -r * 0.2, r * 0.6);
    ctx.quadraticCurveTo(-r * 0.7, r * 0.4, -r * 0.8, -r * 0.3);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#3f7d2a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(r * 0.7, -r * 0.25); ctx.quadraticCurveTo(r * 1.05, -r * 0.5, r * 1.0, -r * 0.75); ctx.stroke();
  }
  ctx.restore();
}

function drawDishOnPlate(ctx, recipeId, cx, cy, r) {
  const recipe = recipeById(recipeId);
  if (!recipe) return;
  // Piring putih
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9b896'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#f3e2c7';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2); ctx.fill();
  // Isi hidangan: ikon bahan-bahan resep dalam lingkaran kecil
  const n = recipe.needs.length;
  recipe.needs.forEach((ingId, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    drawIngredientIcon(ctx, ingId, cx + Math.cos(a) * r * 0.42, cy + Math.sin(a) * r * 0.42, r * 0.30);
  });
  drawIngredientIcon(ctx, recipe.needs[0], cx, cy, r * 0.34);
}

function drawTicket(ctx, slot, order, urgent) {
  const recipe = recipeById(order.recipeId);
  ctx.save();
  rr(ctx, slot.x, slot.y, slot.w, slot.h, 12);
  ctx.fillStyle = urgent ? '#fde8e8' : '#fff8ea';
  ctx.fill();
  ctx.strokeStyle = urgent ? '#eb5757' : '#d9c49a';
  ctx.lineWidth = urgent ? 3 : 2;
  ctx.stroke();
  text(ctx, `#${order.id}`, slot.x + 12, slot.y + 18, 13, '#8a7a5c', 700);
  text(ctx, recipe ? recipe.name : '', slot.x + 12, slot.y + 42, 19, '#2b2118', 800);
  // Ikon bahan resep
  if (recipe) {
    recipe.needs.forEach((ingId, i) => {
      drawIngredientIcon(ctx, ingId, slot.x + 26 + i * 44, slot.y + 74, 15);
    });
  }
  // Bar kesabaran + detik
  const frac = Math.max(0, order.patience / order.max);
  const barX = slot.x + 12, barY = slot.y + slot.h - 16, barW = slot.w - 80;
  ctx.fillStyle = '#e5dcc8';
  rr(ctx, barX, barY, barW, 9, 4); ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#6fbf4a' : frac > 0.25 ? '#e8a13a' : '#eb5757';
  if (frac > 0) { rr(ctx, barX, barY, barW * frac, 9, 4); ctx.fill(); }
  text(ctx, `${Math.ceil(order.patience / 1000)} dtk`, slot.x + slot.w - 62, barY + 5, 14, urgent ? '#b32d2d' : '#2b2118', 800);
  ctx.restore();
}

export function render(ctx, state) {
  const L = layout();
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }
  // Dinding + lantai dapur
  ctx.fillStyle = '#f3e2c7';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2f6f6a';
  ctx.fillRect(0, 0, W, 8);
  ctx.fillStyle = '#e8a13a';
  ctx.fillRect(0, 200, W, 6);
  ctx.fillStyle = '#e0c9a0';
  ctx.fillRect(0, 206, W, H - 206);
  ctx.fillStyle = '#d3b586';
  for (let x = 0; x < W; x += 80) ctx.fillRect(x, 206, 2, H - 206);
  for (let y = 206; y < H; y += 80) ctx.fillRect(0, y, W, 2);

  // Papan pesanan
  ctx.fillStyle = '#20504c';
  rr(ctx, 8, 88, W - 16, 112, 12); ctx.fill();
  text(ctx, 'PAPAN PESANAN', 24, 104, 13, '#f3e2c7', 800);
  if (state.orders.length === 0) {
    text(ctx, 'Belum ada pesanan — bersiap!', 24, 152, 20, '#f3e2c7', 600, 'left');
  }
  for (let i = 0; i < state.orders.length; i++) {
    const o = state.orders[i];
    drawTicket(ctx, L.orderSlots[i], o, o.patience < 10000);
  }

  // Bar atas: judul, skor, kombo, timer hari, nyawa
  ctx.fillStyle = '#20504c';
  ctx.fillRect(0, 0, W, 84);
  text(ctx, 'NASI GORENG RUSH', 24, 30, 30, '#f3e2c7', 900);
  text(ctx, 'Warung cepat saji — masak, tata, antar!', 24, 60, 14, '#cfe3d8', 600);
  text(ctx, `SKOR ${state.score}`, 560, 30, 26, '#ffffff', 800);
  text(ctx, state.combo > 1 ? `KOMBO x${state.combo}` : 'KOMBO —', 560, 60, 15, state.combo > 1 ? '#f2c94c' : '#9db8b2', 800);
  const remainMs = Math.max(0, state.shiftLength - state.time);
  const mm = Math.floor(remainMs / 60000);
  const ss = Math.floor((remainMs % 60000) / 1000);
  text(ctx, `SHIFT ${mm}:${String(ss).padStart(2, '0')}`, 830, 30, 24, remainMs < 30000 ? '#ff8a7a' : '#ffffff', 800);
  ctx.fillStyle = '#173b38';
  rr(ctx, 830, 48, 180, 10, 5); ctx.fill();
  ctx.fillStyle = remainMs < 30000 ? '#eb5757' : '#6fbf4a';
  rr(ctx, 830, 48, 180 * (remainMs / state.shiftLength), 10, 5); ctx.fill();
  text(ctx, '♥'.repeat(Math.max(0, state.lives)) + '♡'.repeat(Math.max(0, 3 - state.lives)), 1060, 30, 26, '#ff8a7a', 800);
  text(ctx, `Rekor: ${state.high}`, 1060, 60, 14, '#cfe3d8', 700);

  // Bin bahan
  for (const bin of L.bins) {
    const ing = INGREDIENTS[bin.id];
    ctx.fillStyle = '#fff8ea';
    rr(ctx, bin.x, bin.y, bin.w, bin.h, 12); ctx.fill();
    ctx.strokeStyle = '#b07a45'; ctx.lineWidth = 2; ctx.stroke();
    drawIngredientIcon(ctx, bin.id, bin.x + bin.w / 2, bin.y + 34, 22);
    text(ctx, ing.name, bin.x + bin.w / 2, bin.y + 70, 16, '#2b2118', 700, 'center');
    ctx.fillStyle = '#20504c';
    rr(ctx, bin.x + 6, bin.y + 6, 20, 20, 5); ctx.fill();
    text(ctx, String(INGREDIENT_ORDER.indexOf(bin.id) + 1), bin.x + 16, bin.y + 17, 13, '#ffffff', 800, 'center');
  }
  text(ctx, 'BAHAN — klik atau tekan 1-8', 16, 208, 13, '#7a5c33', 700);

  // Talenan
  ctx.fillStyle = '#e8c98f';
  rr(ctx, L.board.x, L.board.y, L.board.w, L.board.h, 14); ctx.fill();
  ctx.strokeStyle = '#b07a45'; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, L.board.label, L.board.x + L.board.w / 2, L.board.y + 20, 15, '#7a5c33', 800, 'center');
  if (state.chopping) {
    const ing = INGREDIENTS[state.chopping.ing];
    drawIngredientIcon(ctx, state.chopping.ing, L.board.x + L.board.w / 2, L.board.y + 100, 44);
    text(ctx, `Memotong ${ing.name}...`, L.board.x + L.board.w / 2, L.board.y + 168, 17, '#2b2118', 700, 'center');
    const frac = state.chopping.progress / state.chopping.total;
    ctx.fillStyle = '#d9c49a';
    rr(ctx, L.board.x + 40, L.board.y + 188, L.board.w - 80, 12, 6); ctx.fill();
    ctx.fillStyle = '#e8a13a';
    rr(ctx, L.board.x + 40, L.board.y + 188, (L.board.w - 80) * frac, 12, 6); ctx.fill();
  } else {
    ctx.strokeStyle = '#b07a45'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(L.board.x + 60, L.board.y + 110); ctx.lineTo(L.board.x + L.board.w - 60, L.board.y + 110);
    ctx.moveTo(L.board.x + 60, L.board.y + 130); ctx.lineTo(L.board.x + L.board.w - 60, L.board.y + 130);
    ctx.stroke();
    text(ctx, 'Klik bahan untuk dipotong', L.board.x + L.board.w / 2, L.board.y + 168, 15, '#8a7a5c', 600, 'center');
  }

  // Wajan
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath(); ctx.arc(L.wok.x, L.wok.y, L.wok.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#555555';
  ctx.beginPath(); ctx.arc(L.wok.x, L.wok.y, L.wok.r - 10, 0, Math.PI * 2); ctx.fill();
  text(ctx, L.wok.label, L.wok.x, L.wok.y - L.wok.r - 6, 15, '#7a5c33', 800, 'center');
  // Isi wajan
  state.wok.forEach((ingId, i) => {
    const a = (i / Math.max(1, state.wok.length)) * Math.PI * 2 - Math.PI / 2;
    drawIngredientIcon(ctx, ingId, L.wok.x + Math.cos(a) * 48, L.wok.y + Math.sin(a) * 48, 24);
  });
  if (state.wokCooking) {
    const frac = state.wokCook / state.wokCookTotal;
    ctx.strokeStyle = '#e8a13a'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(L.wok.x, L.wok.y, L.wok.r + 8, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
    text(ctx, 'Memasak...', L.wok.x, L.wok.y + L.wok.r + 34, 16, '#2b2118', 700, 'center');
  } else if (state.wokReady) {
    const recipe = recipeById(state.wokReady);
    ctx.strokeStyle = '#6fbf4a'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(L.wok.x, L.wok.y, L.wok.r + 8, 0, Math.PI * 2); ctx.stroke();
    text(ctx, `${recipe ? recipe.name : ''} MATANG!`, L.wok.x, L.wok.y + L.wok.r + 34, 17, '#3f7d2a', 800, 'center');
    text(ctx, 'Klik wajan untuk menata', L.wok.x, L.wok.y + L.wok.r + 56, 14, '#2b2118', 600, 'center');
  } else if (state.wok.length === 0) {
    text(ctx, 'Wajan kosong', L.wok.x, L.wok.y + 6, 16, '#9db8b2', 600, 'center');
  }

  // Piring saji
  ctx.fillStyle = '#fff8ea';
  rr(ctx, L.plate.x, L.plate.y, L.plate.w, L.plate.h, 14); ctx.fill();
  ctx.strokeStyle = state.plate ? '#6fbf4a' : '#b07a45'; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, L.plate.label, L.plate.x + L.plate.w / 2, L.plate.y + 20, 15, '#7a5c33', 800, 'center');
  if (state.plate) {
    drawDishOnPlate(ctx, state.plate, L.plate.x + L.plate.w / 2, L.plate.y + 105, 72);
    const recipe = recipeById(state.plate);
    text(ctx, recipe ? recipe.name : '', L.plate.x + L.plate.w / 2, L.plate.y + 192, 17, '#2b2118', 800, 'center');
    if (!state.plateAtServe) text(ctx, 'Klik piring untuk diantar', L.plate.x + L.plate.w / 2, L.plate.y + 212, 13, '#3f7d2a', 700, 'center');
  } else {
    ctx.strokeStyle = '#d9c49a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(L.plate.x + L.plate.w / 2, L.plate.y + 105, 56, 0, Math.PI * 2); ctx.stroke();
    text(ctx, 'Piring kosong', L.plate.x + L.plate.w / 2, L.plate.y + 105, 15, '#8a7a5c', 600, 'center');
  }

  // Tempat sampah
  ctx.fillStyle = '#8a7a5c';
  rr(ctx, L.trash.x, L.trash.y, L.trash.w, L.trash.h, 12); ctx.fill();
  text(ctx, 'TEMPAT', L.trash.x + L.trash.w / 2, L.trash.y + 46, 16, '#fff8ea', 800, 'center');
  text(ctx, 'SAMPAH', L.trash.x + L.trash.w / 2, L.trash.y + 70, 16, '#fff8ea', 800, 'center');
  text(ctx, 'Klik untuk buang isi wajan', L.trash.x + L.trash.w / 2, L.trash.y + 108, 12, '#f3e2c7', 600, 'center');

  // Jendela serve
  const serveHot = state.plate && state.plateAtServe;
  ctx.fillStyle = serveHot ? '#6fbf4a' : '#e8a13a';
  rr(ctx, L.serve.x, L.serve.y, L.serve.w, L.serve.h, 12); ctx.fill();
  ctx.strokeStyle = '#7a5c33'; ctx.lineWidth = 3; ctx.stroke();
  if (serveHot) {
    drawDishOnPlate(ctx, state.plate, L.serve.x + 78, L.serve.y + L.serve.h / 2, 52);
    text(ctx, 'SIAP DIANTAR!', L.serve.x + 170, L.serve.y + 52, 24, '#ffffff', 900);
    text(ctx, 'Klik di sini / tekan Spasi', L.serve.x + 170, L.serve.y + 88, 16, '#ffffff', 700);
  } else {
    text(ctx, 'JENDELA SERVE', L.serve.x + L.serve.w / 2, L.serve.y + 52, 24, '#ffffff', 900, 'center');
    text(ctx, 'Antar hidangan yang sudah ditata', L.serve.x + L.serve.w / 2, L.serve.y + 88, 16, '#fff8ea', 600, 'center');
  }

  // Pesan singkat di tengah bawah
  if (state.message && performance.now() < state.messageUntil) {
    ctx.fillStyle = 'rgba(32,80,76,0.92)';
    rr(ctx, L.message.x, L.message.y, L.message.w, L.message.h, 12); ctx.fill();
    text(ctx, state.message, L.message.x + L.message.w / 2, L.message.y + L.message.h / 2, 18, '#ffffff', 700, 'center');
  }

  // Flash hijau saat berhasil menyajikan
  if (state.flash && performance.now() < state.flash.until) {
    ctx.strokeStyle = 'rgba(111,191,74,0.9)';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
  }

  // Layar judul
  if (state.mode === 'title') {
    ctx.fillStyle = 'rgba(32,80,76,0.88)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'NASI GORENG RUSH', W / 2, 170, 64, '#f3e2c7', 900, 'center');
    text(ctx, 'Warung cepat saji — masak, tata, antar sebelum pelanggan kabur!', W / 2, 225, 22, '#f2c94c', 700, 'center');
    const lines = [
      '1. Klik bahan (atau tekan 1-8) — bahan dipotong di talenan lalu masuk wajan.',
      '2. Lengkapi resep di papan pesanan, tunggu sampai matang.',
      '3. Klik wajan untuk menata di piring, klik piring, lalu klik jendela serve.',
      '4. Sajikan cepat untuk bonus + kombo. Pesanan hangus = -1 nyawa (3 nyawa).',
    ];
    lines.forEach((ln, i) => text(ctx, ln, W / 2, 300 + i * 34, 19, '#ffffff', 600, 'center'));
    text(ctx, `Rekor: ${state.high}`, W / 2, 470, 20, '#f2c94c', 800, 'center');
    ctx.fillStyle = '#e8a13a';
    rr(ctx, W / 2 - 180, 510, 360, 64, 32); ctx.fill();
    text(ctx, 'MULAI MASAK  ▶', W / 2, 543, 26, '#ffffff', 900, 'center');
    text(ctx, 'Klik di mana saja / tekan Enter', W / 2, 610, 16, '#cfe3d8', 600, 'center');
  }

  // Jeda
  if (state.mode === 'paused') {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'JEDA  —  tekan P untuk lanjut', W / 2, H / 2, 36, '#ffffff', 900, 'center');
  }

  // Game over
  if (state.mode === 'over') {
    ctx.fillStyle = 'rgba(32,80,76,0.92)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'SHIFT SELESAI!', W / 2, 180, 56, '#f3e2c7', 900, 'center');
    text(ctx, `Skor akhir: ${state.score}`, W / 2, 260, 34, '#f2c94c', 900, 'center');
    text(ctx, `Hidangan tersaji: ${state.served}   •   Kombo terbaik: x${state.bestCombo}   •   Pesanan hangus: ${state.missed}`, W / 2, 320, 20, '#ffffff', 700, 'center');
    text(ctx, state.score >= state.high && state.score > 0 ? 'REKOR BARU!' : `Rekor: ${state.high}`, W / 2, 370, 24, '#6fbf4a', 800, 'center');
    ctx.fillStyle = '#e8a13a';
    rr(ctx, W / 2 - 180, 420, 360, 64, 32); ctx.fill();
    text(ctx, 'MAIN LAGI  ↻', W / 2, 453, 26, '#ffffff', 900, 'center');
    text(ctx, 'Klik / tekan Enter untuk main lagi', W / 2, 530, 16, '#cfe3d8', 600, 'center');
  }
  ctx.restore();
}

export { pointInRect };

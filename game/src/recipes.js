// recipes.js — data bahan dan hidangan Nasi Goreng Rush.
// Setiap pesanan adalah satu resep: kombinasi bahan yang berbeda-beda.
export const INGREDIENTS = {
  nasi:   { id: 'nasi',   name: 'Nasi',   short: 'NS', color: '#f7f0dc', dark: '#cbb98f', chop: 0 },
  mie:    { id: 'mie',    name: 'Mie',    short: 'MI', color: '#f2c94c', dark: '#c98f1b', chop: 0 },
  telur:  { id: 'telur',  name: 'Telur',  short: 'TL', color: '#f2994a', dark: '#c96a1e', chop: 0 },
  ayam:   { id: 'ayam',   name: 'Ayam',   short: 'AY', color: '#c98a5a', dark: '#7d4423', chop: 1200 },
  sayur:  { id: 'sayur',  name: 'Sayur',  short: 'SY', color: '#6fbf4a', dark: '#3f7d2a', chop: 1000 },
  bawang: { id: 'bawang', name: 'Bawang', short: 'BW', color: '#bb6bd9', dark: '#7d3a99', chop: 900 },
  kecap:  { id: 'kecap',  name: 'Kecap',  short: 'KC', color: '#6b4632', dark: '#3a2418', chop: 0 },
  cabai:  { id: 'cabai',  name: 'Cabai',  short: 'CB', color: '#eb5757', dark: '#b32d2d', chop: 900 },
};

export const INGREDIENT_ORDER = ['nasi', 'mie', 'telur', 'ayam', 'sayur', 'bawang', 'kecap', 'cabai'];

export const RECIPES = [
  { id: 'nasgor',       name: 'Nasi Goreng Spesial',    needs: ['nasi', 'telur', 'kecap', 'bawang'], base: 120, color: '#e8a13a' },
  { id: 'miegor',       name: 'Mie Goreng Jawa',        needs: ['mie', 'telur', 'sayur', 'kecap'],  base: 120, color: '#f2c94c' },
  { id: 'sate',         name: 'Sate Ayam Bumbu Kacang', needs: ['ayam', 'bawang', 'kecap', 'cabai'], base: 160, color: '#c98a5a' },
  { id: 'nasgor-pedas', name: 'Nasi Goreng Pedas',      needs: ['nasi', 'telur', 'cabai', 'bawang'], base: 140, color: '#eb5757' },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || null;
}

// Cocokkan isi wajan (tanpa peduli urutan) dengan satu resep. Null kalau belum lengkap / tidak cocok.
export function recipeForSet(ids) {
  if (ids.length === 0) return null;
  const sorted = [...ids].sort().join(',');
  for (const r of RECIPES) {
    if ([...r.needs].sort().join(',') === sorted) return r;
  }
  return null;
}

// Apakah bahan ini dibutuhkan oleh setidaknya satu pesanan yang sedang aktif?
export function ingredientNeededByOrders(ingId, orders) {
  for (const o of orders) {
    const r = recipeById(o.recipeId);
    if (r && r.needs.includes(ingId)) return true;
  }
  return false;
}

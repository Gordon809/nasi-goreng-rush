# Nasi Goreng Rush

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Gordon809/nasi-goreng-rush/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Gordon809/nasi-goreng-rush/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

An original Indonesian street-food cooking game, built for the
[best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137)
bounty on make.fun. Play it offline in a desktop browser — no network, no build step.

**Play:** https://make.fun/r/5g7k5t7n

## How to play

You run a warung (street-food stall) for one 150-second shift. Orders arrive on
the board at the top — each one is a recipe:

- **Nasi Goreng Spesial** — nasi + telur + kecap + bawang
- **Mie Goreng Jawa** — mie + telur + sayur + kecap
- **Sate Ayam Bumbu Kacang** — ayam + bawang + kecap + cabai
- **Nasi Goreng Pedas** — nasi + telur + cabai + bawang

1. Click an ingredient (or press **1-8**). Ingredients that need chopping go to
   the cutting board first, then into the wok.
2. When the wok holds exactly one recipe, it cooks — wait for it to finish.
3. Click the wok to plate the dish, click the plate to carry it to the serve
   window, then click the window (or press **Space**) to serve.
4. Serve fast for a time bonus and combo multiplier. A missed order costs one
   life (3 lives). Wrong ingredients never go in — the wok only accepts what an
   active order needs.

**Keys:** 1-8 ingredients · Space serve · P pause · M mute · Enter start/restart.
High score is saved in localStorage.

## Structure

- `main.ts` — hands the game in: copies `game/` and `screenshots/` to `/output`
  and writes `/output/dossier.json` with `buildDossier`.
- `game/index.html` — the game shell (canvas 1280x720).
- `game/src/main.js` — boot, game loop, keyboard + mouse input.
- `game/src/recipes.js` — ingredient and dish data.
- `game/src/orders.js` — order spawning and patience timers.
- `game/src/kitchen.js` — stations: cutting board, wok, plating, serve window, trash.
- `game/src/render.js` — all canvas drawing (kitchen, tickets, food icons, HUD).
- `game/src/audio.js` — synthesized WebAudio effects, no audio files.
- `game/src/shots.js` — deterministic scene staging for screenshots (`?shot=`).
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — 4 real renders of the game's own code.

## Run locally

```sh
# serve game/ with any static server, then open http://localhost:8080
python3 -m http.server 8080 --directory game
```

Screenshots are staged with `?shot=start|play|serve|rush` (timers frozen).

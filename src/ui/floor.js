// The pixel bay: a side-on cutaway of the welding department, drawn in code
// from one palette at whole-number scale. Art carries mechanics or it is cut
// (DESIGN.md section 9): a frustrated sprite or a hazy booth is a signal the
// player can act on before the numbers show it, so every state has a caption.
//
// UI only. Math.random is fine here for spark flicker; the engine never sees it.

const PAL = {
  wall: '#202731', wallPanel: '#262e39', wallLine: '#2e3744', window: '#34465a', windowLit: '#4c6a86',
  floor: '#353c46', floorDark: '#2c323b', stripe: '#e8c547', stripeDark: '#1f242b',
  steel: '#5d6570', steelLight: '#8c949e', steelDark: '#3f464f',
  curtain: '#c9762a', curtainDark: '#9c5a1f', hood: '#8a929c', duct: '#6f7883',
  bench: '#6b5640', benchTop: '#8a7154', jig: '#4d6f8c', jigTop: '#6a8fae',
  door: '#3c8c8a', doorDark: '#2c6765',
  coverall: '#34507f', coverallDark: '#283f63', vest: '#e8c547', boots: '#1d2228', glove: '#7a5a3a',
  helmet: '#2b3038', lens: '#3c8c8a', cap: '#c4473a',
  spark: '#ffffff', sparkBlue: '#9fd6f0', sparkWarm: '#ffcf7a', grind: '#ff9a3c',
  steam: '#d65645', bubble: '#e6e9ed', haze: 'rgba(170,180,190,0.35)',
  body: '#a3abb5', bodyDark: '#7d8590', glass: '#3a4a5c', dolly: '#2a2f36',
};
const SKIN = ['#f0c8a2', '#d29b72', '#a46c48', '#6b4430'];
const HAIR = ['#231d19', '#4f331f', '#8d5f35', '#c49a52', '#8a8a8a'];

export const W = 176;
export const H = 84;
const FLOOR_Y = 50;
const FEET_Y = 74;

// Where each station's people stand, by station and slot.
const SPOTS = {
  fit: [{ x: 13, face: 1 }, { x: 35, face: 1 }],
  weld: [{ x: 64, face: 1 }, { x: 86, face: 1 }, { x: 108, face: 1 }],
  finish: [{ x: 133, face: 1 }, { x: 152, face: 1 }],
};

function px(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w, h); }

// ---------------------------------------------------------------- the room
function drawRoom(ctx, t, flags) {
  px(ctx, 0, 0, W, FLOOR_Y, PAL.wall);
  for (let x = 0; x < W; x += 22) px(ctx, x, 0, 1, FLOOR_Y, PAL.wallLine);
  px(ctx, 0, 6, W, 1, PAL.wallLine);
  for (const x of [6, 30, 132, 154]) { px(ctx, x, 9, 14, 8, PAL.window); px(ctx, x + 1, 10, 12, 3, PAL.windowLit); }
  // high-bay lights
  for (const x of [20, 88, 150]) { px(ctx, x, 1, 8, 2, PAL.steelLight); px(ctx, x + 1, 3, 6, 1, '#f3efd9'); }
  // floor and the walkway stripe
  px(ctx, 0, FLOOR_Y, W, H - FLOOR_Y, PAL.floor);
  for (let x = 0; x < W; x += 6) px(ctx, x, FLOOR_Y + 1, 3, 1, PAL.floorDark);
  for (let x = 0; x < W; x += 8) { px(ctx, x, 79, 4, 2, PAL.stripe); px(ctx, x + 4, 79, 4, 2, PAL.stripeDark); }

  // fit-up: two jig tables
  for (const s of SPOTS.fit) {
    const x = s.x + 6;
    px(ctx, x, 62, 12, 2, PAL.jigTop); px(ctx, x, 64, 12, 1, PAL.jig);
    px(ctx, x + 1, 65, 1, 9, PAL.jig); px(ctx, x + 10, 65, 1, 9, PAL.jig);
    px(ctx, x + 3, 59, 6, 3, PAL.steelLight);           // brackets waiting
  }
  // body weld: three booths with curtains and extractor hoods
  for (const [i, s] of SPOTS.weld.entries()) {
    const x = s.x - 6;
    px(ctx, x, 22, 1, 52, PAL.steel); px(ctx, x + 21, 22, 1, 52, PAL.steel);
    px(ctx, x, 22, 22, 1, PAL.steel);
    const shut = i === 2 && flags.boothShut;
    for (let y = 24; y < 72; y += 2) px(ctx, x + 1, y, 2, 2, (y / 2) % 2 ? PAL.curtain : PAL.curtainDark);
    for (let y = 24; y < 72; y += 2) px(ctx, x + 19, y, 2, 2, (y / 2) % 2 ? PAL.curtain : PAL.curtainDark);
    if (shut) for (let y = 24; y < 72; y += 2) px(ctx, x + 3, y, 16, 2, (y / 2) % 2 ? PAL.curtain : PAL.curtainDark);
    // hood and duct
    px(ctx, x + 6, 25, 10, 3, PAL.hood); px(ctx, x + 9, 0, 4, 25, PAL.duct);
    const noisy = i === 2 && flags.haze;
    if (noisy && t % 2) px(ctx, x + 7, 28, 8, 1, PAL.hood);
    // the weld stand
    px(ctx, x + 12, 70, 7, 2, PAL.steelDark); px(ctx, x + 14, 72, 2, 2, PAL.steelDark);
  }
  // finish: two benches
  for (const s of SPOTS.finish) {
    const x = s.x + 5;
    px(ctx, x, 63, 11, 2, PAL.benchTop); px(ctx, x, 65, 11, 1, PAL.bench);
    px(ctx, x + 1, 66, 1, 8, PAL.bench); px(ctx, x + 9, 66, 1, 8, PAL.bench);
  }
  // the paint door
  px(ctx, 166, 26, 10, 48, PAL.doorDark); px(ctx, 167, 27, 9, 47, PAL.door);
  for (let y = 30; y < 72; y += 6) px(ctx, 168, y, 7, 1, PAL.doorDark);
}

// ---------------------------------------------------------------- a body on the line
function drawBody(ctx, x) {
  const y = 64;
  px(ctx, x, y + 6, 20, 2, PAL.dolly); px(ctx, x + 2, y + 8, 2, 2, PAL.dolly); px(ctx, x + 16, y + 8, 2, 2, PAL.dolly);
  px(ctx, x, y + 2, 20, 4, PAL.body); px(ctx, x + 11, y - 3, 8, 5, PAL.body);
  px(ctx, x + 12, y - 2, 5, 3, PAL.glass); px(ctx, x, y + 5, 20, 1, PAL.bodyDark);
}

// ---------------------------------------------------------------- a person
// 8 wide, 16 tall, feet at (x, FEET_Y). Parts are rectangles, so every crew
// member is drawn by the same routine and differs by look.
export function drawPerson(ctx, x, feet, look, state, t, opts = {}) {
  const skin = SKIN[look.skin ?? 0];
  const hair = HAIR[look.hairColour ?? 0];
  const broad = look.build === 'broad';
  const top = feet - 16;
  const welding = opts.station === 'weld' && state === 'working';
  // legs and boots
  px(ctx, x + 2, top + 11, 2, 4, PAL.coverallDark); px(ctx, x + 5, top + 11, 2, 4, PAL.coverallDark);
  px(ctx, x + 1, top + 15, 3, 1, PAL.boots); px(ctx, x + 5, top + 15, 3, 1, PAL.boots);
  // torso
  const tx = broad ? x : x + 1, tw = broad ? 9 : 7;
  px(ctx, tx, top + 5, tw, 6, PAL.coverall);
  if (opts.lead) { px(ctx, tx + 1, top + 5, 1, 6, PAL.vest); px(ctx, tx + tw - 2, top + 5, 1, 6, PAL.vest); px(ctx, tx, top + 8, tw, 1, PAL.vest); }
  // head
  px(ctx, x + 2, top, 5, 5, skin);
  if (welding) {
    px(ctx, x + 1, top - 1, 7, 6, PAL.helmet); px(ctx, x + 5, top + 1, 3, 2, PAL.lens);
  } else {
    const style = look.hair || 'short';
    if (style === 'cap') { px(ctx, x + 1, top - 1, 7, 2, PAL.cap); px(ctx, x + 6, top + 1, 3, 1, PAL.cap); }
    else px(ctx, x + 2, top - 1, 5, 2, hair);
    if (style === 'messy') { px(ctx, x + 1, top - 1, 1, 2, hair); px(ctx, x + 6, top - 2, 1, 1, hair); }
    if (style === 'bun') px(ctx, x + 1, top - 2, 2, 2, hair);
    if (style === 'long') px(ctx, x + 1, top, 1, 6, hair);
    if (look.beard) px(ctx, x + 3, top + 4, 4, 1, hair);
    px(ctx, x + 5, top + 2, 1, 1, '#1b1b1b');            // the eye that faces the line
  }
  // arms by state
  const ax = broad ? x + 8 : x + 7;
  if (state === 'frustrated') {
    px(ctx, tx, top + 7, tw, 2, PAL.coverallDark);         // arms crossed
    const k = t % 2;
    px(ctx, x + 2 + k, top - 4, 1, 1, PAL.steam); px(ctx, x + 4 - k, top - 5, 1, 1, PAL.steam); px(ctx, x + 6 + k, top - 4, 1, 1, PAL.steam);
  } else if (state === 'talking') {
    px(ctx, ax, top + 6, 1, 4, PAL.coverallDark);
    const k = t % 3;
    for (let i = 0; i <= k; i++) px(ctx, x + 8 + i * 2, top - 3, 1, 1, PAL.bubble);
  } else if (state === 'idle') {
    px(ctx, x, top + 6, 1, 5, PAL.coverallDark); px(ctx, ax, top + 6, 1, 5, PAL.coverallDark);
  } else {
    // working: one arm out to the work
    px(ctx, ax, top + 6, 3, 1, PAL.coverallDark); px(ctx, ax + 3, top + 6, 1, 1, PAL.glove);
    if (welding && t % 4 !== 3) {
      const sx = ax + 5, sy = top + 7;
      for (let i = 0; i < 5; i++) px(ctx, sx + ((Math.random() * 5) | 0) - 1, sy + ((Math.random() * 4) | 0) - 1, 1, 1, i % 2 ? PAL.sparkBlue : PAL.spark);
    } else if (opts.station === 'finish' && t % 3 !== 2) {
      for (let i = 0; i < 3; i++) px(ctx, ax + 4 + i, top + 7 - ((Math.random() * 2) | 0), 1, 1, PAL.grind);
    } else if (opts.station === 'fit') {
      const up = t % 2;
      px(ctx, ax + 3, top + 4 + (up ? 0 : 2), 1, 3, PAL.steelLight);   // the hammer
    }
  }
}

// ---------------------------------------------------------------- the whole bay
export function drawBay(ctx, data, t, moving) {
  drawRoom(ctx, t, data.flags || {});
  if (moving) {
    const lane = (t * 2) % (W + 40) - 30;
    if (lane > -20 && lane < 164) drawBody(ctx, lane);
  } else drawBody(ctx, 76);
  for (const p of data.people) {
    if (p.state === 'absent') continue;
    const spot = SPOTS[p.station][p.slot];
    if (!spot) continue;
    drawPerson(ctx, spot.x, FEET_Y, p.look, p.state, t, { station: p.station, lead: p.lead });
  }
  if (data.flags?.haze && !data.flags.boothShut) {
    const x = SPOTS.weld[2].x - 4;
    for (let i = 0; i < 26; i++) {
      const hx = x + ((i * 7 + t) % 20), hy = 34 + ((i * 11 + t * 2) % 30);
      ctx.fillStyle = PAL.haze; ctx.fillRect(hx, hy, 2, 1);
    }
  }
}

/** Who is under a tap, by the x of the tap in bay pixels. */
export function personAt(data, bx) {
  let best = null;
  for (const p of data.people) {
    const spot = SPOTS[p.station][p.slot];
    if (!spot) continue;
    const d = Math.abs(spot.x + 4 - bx);
    if (d < 11 && (!best || d < best.d)) best = { p, d };
  }
  return best?.p || null;
}

// ---------------------------------------------------------------- mounting
const live = new Set();
let ticking = false;
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };

export function mountBay(canvas, data, onTap) {
  const holder = canvas.parentElement;
  const width = Math.max(176, holder.clientWidth - 2);
  const scale = Math.max(1, Math.floor(width / W));
  canvas.width = W; canvas.height = H;
  canvas.style.width = `${W * scale}px`; canvas.style.height = `${H * scale}px`;
  const ctx = canvas.getContext('2d');
  const item = { canvas, ctx, data, t: 0 };
  drawBay(ctx, data, 0, false);
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const p = personAt(data, ((e.clientX - r.left) / r.width) * W);
    onTap?.(p);
  });
  if (reduced()) return;
  live.add(item);
  if (!ticking) { ticking = true; setTimeout(tick, 180); }
}

function tick() {
  for (const item of [...live]) {
    if (!item.canvas.isConnected) { live.delete(item); continue; }
    item.t++;
    drawBay(item.ctx, item.data, item.t, true);
  }
  if (live.size) setTimeout(tick, 180); else ticking = false;
}

/** A badge photo for the crew tab: the top of the sprite, bigger. */
export function drawPortrait(canvas, look, lead) {
  canvas.width = 12; canvas.height = 12;
  canvas.style.width = '56px'; canvas.style.height = '56px';
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#12161c'; ctx.fillRect(0, 0, 12, 12);
  drawPerson(ctx, 2, 19, look, 'idle', 0, { lead });
}

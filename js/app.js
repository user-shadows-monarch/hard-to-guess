(function () {
  'use strict';
  const C = window.COUNTDOWN;
  const $ = s => document.querySelector(s);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);

  /* ---------------- time ---------------- */
  // Preview helpers (only for you): ?test=8 counts down 8 seconds from now,
  // ?now=2026-11-10T20:00:00+01:00 pretends it is that moment.
  let target = new Date(C.target).getTime();
  let skew = 0;
  if (params.get('now')) skew = new Date(params.get('now')).getTime() - Date.now();
  if (params.get('test')) target = Date.now() + (parseInt(params.get('test'), 10) || 8) * 1000;
  if (isNaN(target)) { document.body.textContent = 'Invalid date in js/config.js'; return; }
  const now = () => Date.now() + skew;

  /* ---------------- text ---------------- */
  $('#eyebrow').textContent = C.eyebrow;
  $('#title').textContent = C.title;
  $('#subtitle').textContent = C.subtitle;
  ['days', 'hours', 'minutes', 'seconds'].forEach(k => { $('#l-' + k).textContent = C.labels[k]; });
  try {
    $('#until').textContent = 'until ' + new Intl.DateTimeFormat('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Africa/Tunis'
    }).format(new Date(target)).replace(' at ', ' · ').replace(/,/g, '');
  } catch (e) { $('#until').textContent = C.target; }
  $('#d-script').textContent = C.done.script;
  $('#d-sub').textContent = C.done.sub;
  $('#d-lines').innerHTML = C.done.lines.map(s => s.replace(/</g, '&lt;')).join('<br>');
  $('#d-note').textContent = C.done.note;

  const el = { days: $('#n-days'), hours: $('#n-hours'), minutes: $('#n-minutes'), seconds: $('#n-seconds') };
  const shown = {};
  const pad = n => String(n).padStart(2, '0');
  function put(k, v) {
    const s = k === 'days' ? (v < 100 ? pad(v) : String(v)) : pad(v);
    if (shown[k] === s) return;
    shown[k] = s; el[k].textContent = s;
    if (!RM) { el[k].classList.remove('tick'); void el[k].offsetWidth; el[k].classList.add('tick'); }
  }

  let finished = false, lastMinute = -1, timer = 0;
  function update() {
    let ms = target - now();
    if (ms <= 0) { if (!finished) finish(); return; }
    const total = Math.ceil(ms / 1000);            // whole seconds left (rounds up so 00:00:00 means "now")
    const d = Math.floor(total / 86400), h = Math.floor(total % 86400 / 3600), m = Math.floor(total % 3600 / 60), s = total % 60;
    put('days', d); put('hours', h); put('minutes', m); put('seconds', s);
    if (m !== lastMinute) {
      lastMinute = m;
      $('#sr').textContent = d + ' days, ' + h + ' hours and ' + m + ' minutes remaining';
    }
  }

  function finish() {
    finished = true;
    clearInterval(timer);
    $('#app').dataset.state = 'done';
    $('#wait').hidden = true; $('#done').hidden = false;
    FX.celebrate();
  }

  /* ---------------- effects ---------------- */
  const FX = (function () {
    const cv = $('#fx'), g = cv.getContext('2d'), TAU = Math.PI * 2;
    let W = 0, H = 0, DPR = 1, mode = 'wait', t0 = performance.now(), last = t0;
    let stars = [], hp = [], rockets = [], sparks = [], conf = [], nextR = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
    const easeOut = k => 1 - Math.pow(1 - k, 3);
    let scale = 1, cx = 0, cy = 0;

    function heartXY(t) { return { x: 16 * Math.pow(Math.sin(t), 3), y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) }; }
    function init() {
      DPR = Math.min(devicePixelRatio || 1, 1.5);
      const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); g.setTransform(DPR, 0, 0, DPR, 0, 0);
      stars = []; for (let i = 0; i < (RM ? 40 : 110); i++) stars.push({ x: Math.random() * W, y: Math.random() * H * .85, r: rnd(.4, 1.4), p: rnd(0, TAU), s: rnd(.6, 2) });
      cx = W / 2; cy = H * 0.43; scale = Math.min(W * 0.4 / 16, H * 0.26 / 12);
      hp = [];
      const N = RM ? 380 : 900;
      for (let i = 0; i < N; i++) {
        const outline = i < N * .6, t = Math.random() * TAU, rr = outline ? 1 + (Math.random() - .5) * .07 : Math.sqrt(Math.random()) * .94, p = heartXY(t);
        const ang = Math.random() * TAU, dist = rnd(.3, 1) * Math.max(W, H) * .7;
        hp.push({ tx: p.x * rr, ty: p.y * rr + 2.4, sx: cx + Math.cos(ang) * dist, sy: cy + Math.sin(ang) * dist, d: Math.random() * .9, size: outline ? rnd(.9, 2.2) : rnd(.5, 1.4), ph: rnd(0, TAU), outline, h: Math.random() < .12 ? rnd(15, 32) : rnd(328, 350), l: rnd(58, 78) });
      }
    }
    function rocket(x) { rockets.push({ x: x == null ? rnd(W * .15, W * .85) : x, y: H + 10, vy: -rnd(H * .55, H * .85), ty: rnd(H * .12, H * .42), h: rnd(320, 360) }); }
    function boom(x, y, h) {
      const n = RM ? 24 : 64, hue = Math.random() < .3 ? rnd(30, 50) : h;
      for (let i = 0; i < n; i++) { const a = i / n * TAU + rnd(-.05, .05), sp = rnd(60, 190) * (Math.random() < .3 ? .55 : 1); sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: rnd(.9, 1.7), h: hue + rnd(-12, 12) }); }
    }
    const COL = ['#ff4f8b', '#ffc98a', '#ffffff', '#c56bff', '#ff2d75', '#ffe08a'];
    function confetti(n) {
      n = RM ? Math.round(n / 3) : n;
      for (let i = 0; i < n; i++) { const a = rnd(-Math.PI * .95, -Math.PI * .05), sp = rnd(160, 520); conf.push({ x: W / 2, y: H * .6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rnd(0, TAU), vr: rnd(-8, 8), w: rnd(5, 10), h: rnd(3, 6), c: COL[(Math.random() * COL.length) | 0], life: rnd(3, 5.5), age: 0 }); }
    }

    function draw(now) {
      requestAnimationFrame(draw);
      const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
      const e = (now - t0) / 1000;
      g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#fff';
      stars.forEach(s => { g.globalAlpha = .25 + .6 * (.5 + .5 * Math.sin(e * s.s + s.ph)); g.beginPath(); g.arc(s.x, s.y, s.r, 0, TAU); g.fill(); });
      g.globalAlpha = 1;

      if (mode === 'wait') {                                     // glowing heart assembling behind the clock
        const beat = 1 + .04 * Math.pow(Math.max(0, Math.sin(e * 2.5)), 6);
        g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < hp.length; i++) {
          const p = hp[i], k = easeOut(clamp((e - p.d) / 2.4));
          const x = cx + p.tx * scale * beat * k + (p.sx - cx) * (1 - k) + Math.sin(e * 1.3 + p.ph) * .7;
          const y = cy + p.ty * scale * beat * k + (p.sy - cy) * (1 - k) + Math.cos(e * 1.1 + p.ph) * .7;
          const a = (.4 + .6 * (.5 + .5 * Math.sin(e * 2.2 + p.ph))) * (p.outline ? 1 : .55) * (.25 + .75 * k) * .62;
          g.fillStyle = 'hsla(' + p.h + ',100%,' + p.l + '%,' + a + ')';
          g.beginPath(); g.arc(x, y, p.size, 0, TAU); g.fill();
        }
        g.globalCompositeOperation = 'source-over';
      } else {                                                   // celebration
        nextR -= dt; if (nextR <= 0) { rocket(); nextR = rnd(.6, 1.3); }
      }

      g.globalCompositeOperation = 'lighter';
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]; r.y += r.vy * dt; r.vy *= .985;
        g.fillStyle = 'hsla(' + r.h + ',100%,75%,.9)'; g.beginPath(); g.arc(r.x, r.y, 2, 0, TAU); g.fill();
        if (r.y <= r.ty || r.vy > -30) { boom(r.x, r.y, r.h); rockets.splice(i, 1); }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.age += dt; if (s.age > s.life) { sparks.splice(i, 1); continue; }
        s.vy += 90 * dt; s.vx *= .985; s.vy *= .985; s.x += s.vx * dt; s.y += s.vy * dt;
        const a = 1 - s.age / s.life; g.fillStyle = 'hsla(' + s.h + ',100%,' + (55 + 25 * a) + '%,' + a + ')';
        g.beginPath(); g.arc(s.x, s.y, 1.2 + a * 1.4, 0, TAU); g.fill();
      }
      g.globalCompositeOperation = 'source-over';
      for (let i = conf.length - 1; i >= 0; i--) {
        const c = conf[i]; c.age += dt; if (c.age > c.life || c.y > H + 20) { conf.splice(i, 1); continue; }
        c.vy += 420 * dt; c.vx *= .99; c.vy *= .985; c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt;
        g.save(); g.translate(c.x, c.y); g.rotate(c.r); g.scale(1, Math.cos(c.r * 2)); g.globalAlpha = Math.min(1, (c.life - c.age) * 1.5);
        g.fillStyle = c.c; g.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); g.restore();
      }
      g.globalAlpha = 1;
    }

    addEventListener('resize', init);
    init(); requestAnimationFrame(draw);
    return {
      celebrate() {
        mode = 'done'; t0 = performance.now(); confetti(180);
        for (let i = 0; i < 6; i++) setTimeout(() => rocket(), i * 250);
        nextR = 1.2;
      }
    };
  })();

  /* ---------------- go ---------------- */
  update();
  timer = setInterval(update, 250);   // 4x a second so the seconds never drift, even after the phone sleeps
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
})();

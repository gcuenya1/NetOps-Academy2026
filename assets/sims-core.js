/* NetOps Academy — Motor de simulaciones animadas (SimKit)
   Cada simulación se registra con SimKit.add({ id, at:['u01:2'], icon, title, desc, render(api) }).
   'at' indica en qué lección (unidad:índice de lección, base 0) se incrusta dentro de la Teoría. */
(function () {
  'use strict';
  const SIMS = window.SIMS = window.SIMS || {};
  const NS = 'http://www.w3.org/2000/svg';
  const C = { acc: '#35e0a1', acc2: '#5aa9ff', warn: '#ffb547', bad: '#ff5d73', vio: '#b388ff', muted: '#9aa6d1', line: '#2a3768', card: '#161f3d', card2: '#1c2750', text: '#e6ebff', bg: '#0a0f22', pink: '#ff7ad9', cyan: '#4fe3ff' };
  let SPEED = 1;

  function el(tag, attrs, parent, text) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms / SPEED));
  const ease = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  function tween(ms, fn) {
    return new Promise(res => {
      const t0 = performance.now(), d = Math.max(16, ms / SPEED);
      function f(t) { const k = Math.min(1, (t - t0) / d); fn(ease(k), k); if (k < 1) requestAnimationFrame(f); else res(); }
      requestAnimationFrame(f);
    });
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* Paquete / trama que viaja por el escenario */
  function pkt(parent, label, color, opts) {
    opts = opts || {};
    const g = el('g', { class: 'pkt' }, parent);
    const w = Math.max(30, String(label).length * (opts.fs || 11) * 0.6 + 14), h = opts.h || 20;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 6, fill: color || C.acc, stroke: '#000', 'stroke-opacity': 0.35 }, g);
    el('text', { x: 0, y: 4, 'text-anchor': 'middle', 'font-size': opts.fs || 11, 'font-weight': 700, fill: '#06101f', class: 'mono' }, g, label);
    g.setLabel = t => { g.querySelector('text').textContent = t; const nw = Math.max(30, String(t).length * (opts.fs || 11) * 0.6 + 14); const r = g.querySelector('rect'); r.setAttribute('width', nw); r.setAttribute('x', -nw / 2); };
    g.setColor = c => g.querySelector('rect').setAttribute('fill', c);
    g.at = (x, y) => { g.setAttribute('transform', 'translate(' + x + ',' + y + ')'); g._x = x; g._y = y; return g; };
    return g;
  }
  function moveTo(g, x, y, ms) {
    const x0 = g._x || 0, y0 = g._y || 0;
    const dist = Math.hypot(x - x0, y - y0);
    return tween(ms || Math.max(250, dist * 2.6), k => g.at(x0 + (x - x0) * k, y0 + (y - y0) * k));
  }
  async function travel(parent, pts, label, color, opts) {
    opts = opts || {};
    const g = pkt(parent, label, color, opts).at(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) await moveTo(g, pts[i][0], pts[i][1], opts.ms);
    if (!opts.keep) g.remove();
    return g;
  }
  /* Nodo: PC, switch, router, servidor... */
  function node(parent, x, y, icon, name, sub, opts) {
    opts = opts || {};
    const w = opts.w || 84, h = opts.h || 54;
    const g = el('g', { class: 'node', transform: 'translate(' + x + ',' + y + ')' }, parent);
    const box = el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12, fill: opts.fill || C.card2, stroke: opts.stroke || C.line, 'stroke-width': 2 }, g);
    el('text', { x: 0, y: opts.name2 ? -2 : 6, 'text-anchor': 'middle', 'font-size': opts.icon || 24 }, g, icon);
    const nm = el('text', { x: 0, y: h / 2 + 15, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.text }, g, name);
    const sb = el('text', { x: 0, y: h / 2 + 29, 'text-anchor': 'middle', 'font-size': 10.5, fill: C.muted, class: 'mono' }, g, sub || '');
    const badge = el('text', { x: w / 2 - 2, y: -h / 2 + 2, 'text-anchor': 'middle', 'font-size': 18 }, g, '');
    return {
      g, x, y, box, nm, sb,
      setSub(t) { sb.textContent = t; }, setName(t) { nm.textContent = t; },
      stroke(c) { box.setAttribute('stroke', c || C.line); },
      badge(t) { badge.textContent = t || ''; },
      async flash(c, ms) { box.setAttribute('stroke', c); await sleep(ms || 600); box.setAttribute('stroke', opts.stroke || C.line); }
    };
  }
  function line(parent, x1, y1, x2, y2, attrs) {
    return el('line', Object.assign({ x1, y1, x2, y2, stroke: '#3a4a86', 'stroke-width': 3, 'stroke-linecap': 'round' }, attrs || {}), parent);
  }
  function txt(parent, x, y, t, attrs) { return el('text', Object.assign({ x, y, 'font-size': 12, fill: C.muted }, attrs || {}), parent, t); }

  /* Diagrama de escalera (secuencia de mensajes) reutilizable */
  function ladder(svg, actors, nMsgs, opts) {
    opts = opts || {};
    const W = 800, top = 62, step = opts.step || 46;
    const H = top + nMsgs * step + 40;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.innerHTML = '';
    const pad = opts.pad || 110;
    const X = {};
    actors.forEach((a, i) => {
      const x = actors.length === 1 ? W / 2 : pad + i * (W - 2 * pad) / (actors.length - 1);
      X[a.id] = x;
      el('line', { x1: x, y1: 50, x2: x, y2: H - 10, stroke: C.line, 'stroke-dasharray': '4 5', 'stroke-width': 2 }, svg);
      el('rect', { x: x - 62, y: 6, width: 124, height: 40, rx: 10, fill: C.card2, stroke: a.color || C.acc2, 'stroke-width': 1.5 }, svg);
      el('text', { x, y: 23, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: C.text }, svg, a.name);
      el('text', { x, y: 38, 'text-anchor': 'middle', 'font-size': 10, fill: C.muted, class: 'mono' }, svg, a.sub || '');
    });
    let row = 0;
    return {
      X,
      async msg(m) {
        const y = top + row * step; row++;
        const x1 = X[m.f], x2 = X[m.t], col = m.color || C.acc;
        const dir = x2 > x1 ? 1 : -1;
        if (m.state) for (const k in m.state) {
          el('text', { x: X[k] + (X[k] > W / 2 ? 8 : -8), y: y + 4, 'text-anchor': X[k] > W / 2 ? 'start' : 'end', 'font-size': 10, fill: C.warn, class: 'mono' }, svg, m.state[k]);
        }
        const lbl = el('text', { x: (x1 + x2) / 2, y: y - 4, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: col, class: 'mono', opacity: 0 }, svg, m.label);
        const ln = el('line', { x1, y1: y, x2: x1, y2: y, stroke: col, 'stroke-width': 2.4, 'stroke-dasharray': m.dash ? '6 4' : '' }, svg);
        const head = el('path', { d: '', fill: col }, svg);
        const end = m.lost ? 0.55 : 1;
        await tween(Math.abs(x2 - x1) * 2.2 * end + 200, k => {
          const kk = k * end;
          const cx = x1 + (x2 - x1) * kk, cy = y + 16 * kk;
          ln.setAttribute('x2', cx); ln.setAttribute('y2', cy);
          lbl.setAttribute('opacity', Math.min(1, k * 3));
          head.setAttribute('d', 'M' + cx + ',' + cy + ' l' + (-10 * dir) + ',-5 l0,10 z');
        });
        if (m.lost) {
          head.remove();
          const cx = x1 + (x2 - x1) * end, cy = y + 16 * end;
          el('text', { x: cx, y: cy + 6, 'text-anchor': 'middle', 'font-size': 20, fill: C.bad, 'font-weight': 900 }, svg, '✖');
        }
        if (m.note) el('text', { x: (x1 + x2) / 2, y: y + 28, 'text-anchor': 'middle', 'font-size': 9.5, fill: C.muted, 'font-style': 'italic' }, svg, m.note);
        return y;
      },
      skip(n) { row += n || 1; },
      mark(actor, t, color) {
        const y = top + row * step - step / 2 + 8;
        el('text', { x: X[actor], y, 'text-anchor': 'middle', 'font-size': 11, fill: color || C.warn, 'font-weight': 700 }, svg, t);
      }
    };
  }

  /* Marco común de cada simulación */
  function frame(host, sim, opt) {
    const N = window.NetOps;
    const isDone = () => N && N.get('sim:' + sim.id);
    host.innerHTML = '<div class="sim"><div class="sim-h"><span class="tag">SIMULACIÓN</span><b>' + sim.icon + ' ' + sim.title + '</b><span class="sim-ok">' + (isDone() ? '✔ completada' : '') + '</span>' +
      '<span class="sim-spd" title="Velocidad de animación"><button data-s="0.45">🐢</button><button data-s="1">1x</button><button data-s="2.4">⚡</button></span></div>' +
      '<p class="sim-desc">' + sim.desc + '</p><div class="sim-ctl"></div><div class="sim-body"><div class="sim-stage"></div><div class="sim-side"></div></div><div class="sim-log"></div></div>';
    const root = host.firstChild;
    const q = s => root.querySelector(s);
    const spd = root.querySelectorAll('.sim-spd button');
    const paintSpd = () => spd.forEach(b => b.classList.toggle('on', +b.dataset.s === SPEED));
    spd.forEach(b => b.onclick = () => { SPEED = +b.dataset.s; document.querySelectorAll('.sim-spd button').forEach(x => x.classList.toggle('on', +x.dataset.s === SPEED)); });
    paintSpd();
    const api = {
      root, sim, C, el, sleep, tween, pkt, moveTo, travel, node, line, txt, ladder, esc,
      ctl: q('.sim-ctl'), stage: q('.sim-stage'), side: q('.sim-side'), logEl: q('.sim-log'),
      busy: false,
      alive() { return document.body.contains(root); },
      svg(w, h) {
        api.stage.innerHTML = '';
        const s = el('svg', { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'xMidYMid meet' }, api.stage);
        return s;
      },
      full() { q('.sim-body').classList.add('full'); q('.sim-side').style.display = 'none'; },
      noStage() { q('.sim-stage').style.display = 'none'; q('.sim-body').classList.add('full'); },
      noLog() { api.logEl.style.display = 'none'; },
      log(html, cls) {
        const d = document.createElement('div');
        if (cls) d.className = 'l-' + cls;
        d.innerHTML = html;
        api.logEl.appendChild(d);
        while (api.logEl.children.length > 80) api.logEl.firstChild.remove();
        api.logEl.scrollTop = api.logEl.scrollHeight;
        return d;
      },
      clearLog() { api.logEl.innerHTML = ''; },
      async run(fn) {
        if (api.busy) return;
        api.busy = true; root.classList.add('busy');
        try { await fn(); } catch (e) { console.error(e); api.log('Error interno de la simulación: ' + esc(e.message), 'bad'); }
        finally { api.busy = false; root.classList.remove('busy'); }
      },
      btn(label, fn, cls) {
        const b = document.createElement('button');
        b.className = 'btn sm ' + (cls || '');
        b.innerHTML = label; b.onclick = fn;
        api.ctl.appendChild(b); return b;
      },
      select(label, options, val) {
        const w = document.createElement('label'); w.className = 'sim-fld';
        w.innerHTML = (label ? '<span>' + label + '</span>' : '') + '<select>' + options.map(o => { const v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(val) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select>';
        api.ctl.appendChild(w); return w.querySelector('select');
      },
      input(label, val, attrs) {
        const w = document.createElement('label'); w.className = 'sim-fld';
        w.innerHTML = (label ? '<span>' + label + '</span>' : '') + '<input>';
        const i = w.querySelector('input'); i.value = val;
        if (attrs) for (const k in attrs) i.setAttribute(k, attrs[k]);
        api.ctl.appendChild(w); return i;
      },
      br() { const d = document.createElement('div'); d.style.flexBasis = '100%'; d.style.height = '0'; api.ctl.appendChild(d); },
      done() {
        if (!N) return;
        if (N.once('sim:' + sim.id, 15, 'Simulación: ' + sim.title)) N.set('simCount', (N.get('simCount') || 0) + 1);
        q('.sim-ok').textContent = '✔ completada';
      }
    };
    return api;
  }

  const ORDER = [];
  window.SimKit = {
    C, el, sleep, tween,
    add(sim) { SIMS[sim.id] = sim; ORDER.push(sim.id); },
    list() { return ORDER.map(k => SIMS[k]); },
    forLesson(key) { return ORDER.filter(k => (SIMS[k].at || []).indexOf(key) >= 0); },
    mount(host, id) {
      const sim = SIMS[id];
      if (!sim) { host.innerHTML = ''; return; }
      const api = frame(host, sim);
      try { sim.render(api); } catch (e) { console.error(e); api.log('No se pudo iniciar la simulación: ' + esc(e.message), 'bad'); }
    },
    count() { const N = window.NetOps; return N ? (N.get('simCount') || 0) : 0; }
  };

  /* Utilidades IP compartidas */
  window.SimKit.ip = {
    toN: s => s.split('.').reduce((a, o) => a * 256 + (+o), 0) >>> 0,
    toS: n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'),
    valid: s => /^(\d{1,3}\.){3}\d{1,3}$/.test(String(s).trim()) && s.trim().split('.').every(o => +o <= 255),
    mask: p => (p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0),
    bin: n => ('00000000000000000000000000000000' + (n >>> 0).toString(2)).slice(-32)
  };
})();

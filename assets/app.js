/* NetOps Academy — motor de la app (navegación, progreso, quizzes, flashcards, inglés, examen) */
(function () {
  'use strict';
  const UNITS = (window.UNITS || []).sort((a, b) => a.num - b.num);
  const TOOLS = window.TOOLS || {};
  const KEY = 'netops-academy-v1';
  const DEF = { xp: 0, read: {}, quizBest: {}, quizOk: {}, labs: {}, drill: {}, streak: 0, last: '', tools: {}, exam: 0, name: '' };
  const clone = o => JSON.parse(JSON.stringify(o));
  let S = load();

  function load() {
    try { return Object.assign(clone(DEF), JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return clone(DEF); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    renderTop(); renderSide();
  }

  const LEVELS = [
    [0, 'Pasante NOC', '🐣'], [150, 'Técnico N1', '🔧'], [400, 'Técnico N2', '🛠️'], [800, 'Analista NOC', '🛰️'],
    [1300, 'Network Engineer', '🌐'], [2000, 'Senior NetSec', '🛡️'], [3000, 'Leyenda CCIE', '🏆']
  ];
  function level() {
    let i = 0;
    LEVELS.forEach((l, k) => { if (S.xp >= l[0]) i = k; });
    return { i, cur: LEVELS[i], next: LEVELS[i + 1] || null };
  }
  function dstr(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function touchStreak() {
    const t = dstr(new Date());
    if (S.last === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.streak = S.last === dstr(y) ? S.streak + 1 : 1;
    S.last = t;
  }
  function addXP(n, why) {
    if (!n) return;
    const before = level().i;
    touchStreak();
    S.xp += n; save();
    toast('+' + n + ' XP · ' + why);
    const L = level();
    if (L.i > before) toast(L.cur[2] + ' ¡Subiste de nivel! Ahora sos ' + L.cur[1], 'lvl');
  }
  function toast(msg, cls) {
    const t = document.createElement('div');
    t.className = 't ' + (cls || ''); t.textContent = msg;
    const box = document.getElementById('toast');
    while (box.children.length >= 3) box.firstChild.remove();
    box.appendChild(t);
    setTimeout(() => t.remove(), cls ? 4500 : 2600);
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // API pública para las herramientas
  window.NetOps = {
    addXP, toast, esc, fmt, shuffle,
    once(id, xp, why) { if (S.tools[id]) return false; S.tools[id] = 1; addXP(xp, why); return true; },
    get(k) { return S.tools[k]; }, set(k, v) { S.tools[k] = v; save(); }
  };

  function unitProg(u) {
    const total = u.lessons.length;
    const read = u.lessons.filter((_, i) => S.read[u.id + ':' + i]).length;
    const best = S.quizBest[u.id] || 0;
    const pct = Math.round((read / total) * 55 + Math.min(best, 100) * 0.35 + (S.labs[u.id] ? 10 : 0));
    return { read, total, best, pct, done: read === total && best >= 70 };
  }

  /* ---------- Layout ---------- */
  function renderTop() {
    const L = level();
    const span = L.next ? L.next[0] - L.cur[0] : 1;
    const w = L.next ? Math.min(100, ((S.xp - L.cur[0]) / span) * 100) : 100;
    document.getElementById('lvl').innerHTML =
      '<span class="pill">' + L.cur[2] + ' ' + L.cur[1] + '</span>' +
      '<div class="xpbar" title="' + S.xp + ' XP"><i style="width:' + w + '%"></i></div>' +
      '<span class="pill">' + S.xp + ' XP</span><span class="pill hide-m">🔥 ' + S.streak + ' día' + (S.streak === 1 ? '' : 's') + '</span>';
  }
  function renderSide() {
    const h = location.hash || '#/';
    const a = (href, txt, extra) => '<a href="' + href + '" class="' + (h === href || (href !== '#/' && h.startsWith(href + '/')) ? 'on' : '') + '">' + txt + (extra || '') + '</a>';
    let html = a('#/', '🏠 Inicio') + a('#/plan', '🗓️ Plan de estudio');
    html += '<h4>Unidades</h4>';
    UNITS.forEach(u => {
      const p = unitProg(u);
      html += a('#/unit/' + u.id, u.icon + ' ' + u.num + '. ' + u.short, '<span class="p ' + (p.done ? 'ok' : '') + '">' + (p.done ? '✔' : p.pct + '%') + '</span>');
    });
    html += '<h4>Laboratorios</h4>';
    Object.keys(TOOLS).forEach(k => { html += a('#/tool/' + k, TOOLS[k].icon + ' ' + TOOLS[k].title); });
    html += '<h4>Extras</h4>' + a('#/english', '🇬🇧 English Lab') + a('#/exam', '🎓 Examen final') + a('#/progress', '📊 Mi progreso');
    document.getElementById('side').innerHTML = html;
  }

  /* ---------- Vistas ---------- */
  const $m = () => document.getElementById('main');

  function viewHome() {
    const L = level();
    const done = UNITS.filter(u => unitProg(u).done).length;
    const next = UNITS.find(u => !unitProg(u).done) || UNITS[0];
    let h = '<div class="hero"><div class="num">NETOPS ACADEMY · v1.0</div><h1>Capacitación intensiva: Redes, Soporte, NOC y Seguridad</h1>' +
      '<p>13 unidades + 6 laboratorios interactivos + English Lab. Diseñada para completarse en ~7 días a razón de 3–4 h por día. Cada unidad tiene teoría, <b>English Corner</b>, flashcards, quiz y laboratorio.</p>' +
      '<div class="stats"><div class="stat"><b>' + S.xp + '</b><span>XP total</span></div><div class="stat"><b>' + L.cur[2] + ' ' + L.cur[1] + '</b><span>Nivel actual' + (L.next ? ' · faltan ' + (L.next[0] - S.xp) + ' XP' : '') + '</span></div>' +
      '<div class="stat"><b>' + done + '/' + UNITS.length + '</b><span>Unidades completas</span></div><div class="stat"><b>🔥 ' + S.streak + '</b><span>Racha de días</span></div></div>' +
      '<a class="btn" href="#/unit/' + next.id + '">▶ Continuar: ' + next.num + '. ' + next.short + '</a> <a class="btn sec" href="#/plan">Ver plan de 7 días</a></div>';
    h += '<h2>Unidades</h2><div class="grid">';
    UNITS.forEach(u => {
      const p = unitProg(u);
      h += '<a class="card" href="#/unit/' + u.id + '"><div class="row"><span class="ico">' + u.icon + '</span><span class="num">UNIDAD ' + String(u.num).padStart(2, '0') + ' · ' + u.time + '</span></div><h3>' + u.title + '</h3><p>' + u.desc + '</p><div class="bar"><i style="width:' + p.pct + '%"></i></div><p>' + (p.done ? '✔ Completa' : p.read + '/' + p.total + ' lecciones · quiz ' + p.best + '%') + '</p></a>';
    });
    h += '</div><h2>Laboratorios interactivos</h2><div class="grid">';
    Object.keys(TOOLS).forEach(k => {
      const t = TOOLS[k];
      h += '<a class="card" href="#/tool/' + k + '"><span class="ico">' + t.icon + '</span><h3>' + t.title + '</h3><p>' + t.desc + '</p></a>';
    });
    h += '<a class="card" href="#/english"><span class="ico">🇬🇧</span><h3>English Lab</h3><p>Vocabulario técnico de todas las unidades, frases para incidentes, soporte telefónico y preguntas de entrevista.</p></a>';
    h += '<a class="card" href="#/exam"><span class="ico">🎓</span><h3>Examen final</h3><p>30 preguntas al azar de todas las unidades. Aprobás con 80% y te llevás el certificado.</p></a></div>';
    h += '<h2>Insignias</h2><div>' + badges() + '</div>';
    $m().innerHTML = h;
  }

  function badges() {
    const B = [
      ['🧱', 'Primeros cimientos', unitProg(UNITS[0]).done],
      ['🧮', 'Subnet Ninja (10 subredes)', (S.tools.subnetCount || 0) >= 10],
      ['🐧', 'Pingüino operativo (terminal)', (S.tools.termDone || 0) >= 10],
      ['🔀', 'Cisco Commander (IOS)', (S.tools.iosDone || 0) >= 8],
      ['🛰️', 'Guardia del NOC', (S.tools.nocDone || 0) >= 3],
      ['⚡', 'Port Rush 15+', (S.tools.portsBest || 0) >= 15],
      ['🐍', 'Pythonista de redes', (S.tools.pyDone || 0) >= 4],
      ['🇬🇧', 'Bilingual Engineer (60 palabras)', Object.keys(S.drill).length >= 60],
      ['🛡️', 'Defensor (Seguridad completa)', UNITS.find(u => u.id === 'u10') && unitProg(UNITS.find(u => u.id === 'u10')).done],
      ['🕵️', 'Hacker ético (U13 completa)', UNITS.find(u => u.id === 'u13') && unitProg(UNITS.find(u => u.id === 'u13')).done],
      ['🎓', 'Certificado NetOps', S.exam >= 80],
      ['🔥', 'Racha de 3 días', S.streak >= 3],
      ['🏆', 'Todas las unidades', UNITS.every(u => unitProg(u).done)]
    ];
    return B.map(b => '<span class="badge ' + (b[2] ? '' : 'off') + '">' + b[0] + ' ' + b[1] + '</span>').join('');
  }

  function viewUnit(id, tab) {
    const u = UNITS.find(x => x.id === id);
    if (!u) return viewHome();
    const p = unitProg(u);
    const tabs = [['teoria', '📖 Teoría'], ['english', '🇬🇧 English Corner'], ['flash', '🃏 Flashcards'], ['quiz', '❓ Quiz'], ['lab', '🧪 Lab práctico']];
    let h = '<div class="hero"><div class="num">UNIDAD ' + String(u.num).padStart(2, '0') + ' · ⏱ ' + u.time + '</div><h1>' + u.icon + ' ' + u.title + '</h1><p>' + u.desc + '</p>' +
      '<div class="bar"><i style="width:' + p.pct + '%"></i></div><p class="muted" style="margin-top:8px">Progreso ' + p.pct + '% · ' + p.read + '/' + p.total + ' lecciones · mejor quiz ' + p.best + '% ' + (S.labs[u.id] ? '· lab ✔' : '') + (p.done ? ' · <b style="color:var(--acc)">UNIDAD COMPLETA</b>' : ' · (para completar: leer todo + quiz ≥ 70%)') + '</p>' +
      '<p><b>Objetivos:</b></p><ul>' + u.goals.map(g => '<li>' + g + '</li>').join('') + '</ul></div>';
    h += '<nav class="tabs">' + tabs.map(t => '<a href="#/unit/' + u.id + '/' + t[0] + '" class="' + (tab === t[0] ? 'on' : '') + '">' + t[1] + '</a>').join('') + '</nav><div id="tabc"></div>';
    const idx = UNITS.indexOf(u);
    h += '<div class="row" style="margin-top:24px;justify-content:space-between">' +
      (idx > 0 ? '<a class="btn sec" href="#/unit/' + UNITS[idx - 1].id + '">← ' + UNITS[idx - 1].short + '</a>' : '<span></span>') +
      (idx < UNITS.length - 1 ? '<a class="btn sec" href="#/unit/' + UNITS[idx + 1].id + '">' + UNITS[idx + 1].short + ' →</a>' : '<a class="btn" href="#/exam">🎓 Ir al examen final</a>') + '</div>';
    $m().innerHTML = h;
    const c = document.getElementById('tabc');
    if (tab === 'teoria') tabTeoria(u, c);
    else if (tab === 'english') tabEnglish(u, c);
    else if (tab === 'flash') flashcards(c, u.flash);
    else if (tab === 'quiz') quiz(c, u.quiz, u.id, (pct) => { S.quizBest[u.id] = Math.max(S.quizBest[u.id] || 0, pct); save(); });
    else if (tab === 'lab') tabLab(u, c);
  }

  function tabTeoria(u, c) {
    const firstUnread = u.lessons.findIndex((_, i) => !S.read[u.id + ':' + i]);
    c.innerHTML = u.lessons.map((l, i) => {
      const ok = S.read[u.id + ':' + i];
      return '<details class="lesson" ' + (i === (firstUnread < 0 ? -1 : firstUnread) ? 'open' : '') + '><summary><span class="num">' + u.num + '.' + (i + 1) + '</span> ' + l.t + '<span class="chk ' + (ok ? 'ok' : '') + '">' + (ok ? '✔ leída' : '○ pendiente') + '</span></summary><div class="lbody">' + l.h +
        '<p style="margin-top:18px"><button class="btn sm" data-read="' + i + '" ' + (ok ? 'disabled' : '') + '>' + (ok ? '✔ Leída' : '✓ Marcar como leída (+10 XP)') + '</button></p></div></details>';
    }).join('') + (u.tool ? '<div class="noc">Esta unidad tiene laboratorio interactivo: <a href="#/tool/' + u.tool + '">' + TOOLS[u.tool].icon + ' ' + TOOLS[u.tool].title + '</a></div>' : '');
    c.querySelectorAll('[data-read]').forEach(b => b.onclick = () => {
      const k = u.id + ':' + b.dataset.read;
      if (S.read[k]) return;
      S.read[k] = 1; addXP(10, 'Lección leída');
      viewUnit(u.id, 'teoria');
    });
  }

  function tabEnglish(u, c) {
    let h = '<div class="card"><h3>📚 Vocabulary</h3><table><tr><th>English</th><th>Español</th><th>Example sentence</th></tr>' +
      u.english.map(e => '<tr><td><b>' + e[0] + '</b></td><td>' + e[1] + '</td><td><i>' + e[2] + '</i></td></tr>').join('') + '</table></div>';
    if (u.phrases) h += '<div class="card" style="margin-top:14px"><h3>🗣️ Useful phrases</h3><ul>' + u.phrases.map(p => '<li><b>' + p[0] + '</b><br><span class="muted">' + p[1] + '</span></li>').join('') + '</ul></div>';
    h += '<div class="card" style="margin-top:14px"><h3>🎯 Vocabulary drill</h3><p class="muted">+2 XP por cada palabra nueva que aciertes.</p><div id="drill"></div></div>';
    c.innerHTML = h;
    drill(document.getElementById('drill'), u.english, u.id);
  }

  function drill(el, vocab, pref) {
    let n = 0, ok = 0;
    const N = Math.min(10, vocab.length);
    const order = shuffle(vocab).slice(0, N);
    function next() {
      if (n >= N) { el.innerHTML = '<p class="big">' + ok + '/' + N + '</p><button class="btn">Otra ronda</button>'; el.querySelector('button').onclick = () => drill(el, vocab, pref); return; }
      const it = order[n];
      const rev = Math.random() < 0.5;
      const wrong = shuffle(vocab.filter(v => v !== it)).slice(0, 3);
      const opts = shuffle([it].concat(wrong));
      el.innerHTML = '<div class="qmeta"><span>' + (n + 1) + '/' + N + '</span><span>' + (rev ? 'EN → ES' : 'ES → EN') + '</span></div><div class="q" style="font-size:1.2rem;margin-bottom:10px">' + (rev ? it[0] : it[1]) + '</div><div class="opts">' +
        opts.map((o, i) => '<button class="opt" data-i="' + i + '">' + (rev ? o[1] : o[0]) + '</button>').join('') + '</div>';
      el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const pick = opts[+b.dataset.i];
        el.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (opts[+x.dataset.i] === it) x.classList.add('ok'); });
        if (pick === it) { ok++; const k = pref + ':' + it[0]; if (!S.drill[k]) { S.drill[k] = 1; addXP(2, 'Vocabulario'); } }
        else b.classList.add('bad');
        n++; setTimeout(next, 900);
      });
    }
    next();
  }

  function flashcards(c, cards) {
    let deck = cards.slice(), i = 0;
    function draw() {
      const cd = deck[i];
      c.innerHTML = '<p class="center muted">Hacé clic en la tarjeta para darla vuelta · ' + (i + 1) + '/' + deck.length + '</p>' +
        '<div class="flash" id="fc"><div class="flash-in"><div class="face front">' + fmt(cd[0]) + '</div><div class="face back">' + fmt(cd[1]) + '</div></div></div>' +
        '<div class="row" style="justify-content:center;margin-top:14px"><button class="btn sec" id="pv">← Anterior</button><button class="btn sec" id="sh">🔀 Mezclar</button><button class="btn" id="nx">Siguiente →</button></div>';
      document.getElementById('fc').onclick = e => e.currentTarget.classList.toggle('flip');
      document.getElementById('pv').onclick = () => { i = (i - 1 + deck.length) % deck.length; draw(); };
      document.getElementById('nx').onclick = () => { i = (i + 1) % deck.length; draw(); };
      document.getElementById('sh').onclick = () => { deck = shuffle(deck); i = 0; draw(); };
    }
    draw();
  }

  function quiz(c, qs, key, onDone, opts) {
    opts = opts || {};
    const list = opts.noShuffle ? qs.slice() : shuffle(qs.map((q, i) => Object.assign({ _i: i, _k: key }, q)));
    let n = 0, ok = 0; const t0 = Date.now();
    function next() {
      if (n >= list.length) {
        const pct = Math.round((ok / list.length) * 100);
        c.innerHTML = '<div class="quiz center"><p class="muted">Resultado</p><p class="big" style="font-size:2.4rem">' + pct + '%</p><p>' + ok + ' de ' + list.length + ' correctas · ' + Math.round((Date.now() - t0) / 1000) + ' s</p><p>' +
          (pct >= 90 ? '🏆 ¡Excelente! Nivel entrevista técnica.' : pct >= 70 ? '✅ Aprobado. Repasá las que fallaste.' : '📖 Volvé a la teoría y reintentá.') + '</p><button class="btn" id="again">Reintentar</button></div>';
        document.getElementById('again').onclick = () => quiz(c, qs, key, onDone, opts);
        onDone && onDone(pct, ok, list.length);
        return;
      }
      const q = list[n];
      const order = shuffle(q.o.map((_, i) => i));
      c.innerHTML = '<div class="quiz"><div class="qmeta"><span>Pregunta ' + (n + 1) + ' de ' + list.length + (q._u ? ' · ' + q._u : '') + '</span><span>✔ ' + ok + '</span></div><div class="q">' + fmt(q.q) + '</div><div class="opts">' +
        order.map(i => '<button class="opt" data-i="' + i + '">' + fmt(q.o[i]) + '</button>').join('') + '</div><div id="ex"></div></div>';
      c.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const pick = +b.dataset.i;
        c.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (+x.dataset.i === q.a) x.classList.add('ok'); });
        const qid = q._k + ':' + q._i;
        if (pick === q.a) { ok++; if (!S.quizOk[qid]) { S.quizOk[qid] = 1; addXP(5, 'Respuesta correcta'); } }
        else b.classList.add('bad');
        document.getElementById('ex').innerHTML = '<div class="explain">' + (pick === q.a ? '✅ ' : '❌ ') + fmt(q.e || '') + '</div><p style="margin-top:12px"><button class="btn" id="nq">' + (n + 1 < list.length ? 'Siguiente →' : 'Ver resultado') + '</button></p>';
        document.getElementById('nq').onclick = () => { n++; next(); };
      });
    }
    next();
  }

  function tabLab(u, c) {
    const ok = S.labs[u.id];
    c.innerHTML = '<div class="card"><h3>🧪 ' + u.lab.t + '</h3>' + u.lab.h + '<p style="margin-top:16px"><button class="btn" id="labok" ' + (ok ? 'disabled' : '') + '>' + (ok ? '✔ Lab completado' : '✓ Marcar lab como completado (+30 XP)') + '</button></p></div>' +
      (u.tool ? '<div class="noc">Abrí el simulador: <a href="#/tool/' + u.tool + '">' + TOOLS[u.tool].icon + ' ' + TOOLS[u.tool].title + '</a></div>' : '');
    const b = document.getElementById('labok');
    b.onclick = () => { if (S.labs[u.id]) return; S.labs[u.id] = 1; addXP(30, 'Laboratorio completado'); viewUnit(u.id, 'lab'); };
  }

  function viewTool(k) {
    const t = TOOLS[k];
    if (!t) return viewHome();
    $m().innerHTML = '<div class="hero"><div class="num">LABORATORIO</div><h1>' + t.icon + ' ' + t.title + '</h1><p>' + t.desc + '</p></div><div id="tool"></div>';
    t.render(document.getElementById('tool'));
  }

  function viewEnglish() {
    const all = [];
    UNITS.forEach(u => u.english.forEach(e => all.push(e.concat([u.short, u.id]))));
    const E = window.ENGLISH || {};
    let h = '<div class="hero"><div class="num">ENGLISH LAB</div><h1>🇬🇧 Inglés técnico para Redes, NOC y Seguridad</h1><p>' + all.length + ' términos de todas las unidades + frases reales para incidentes, soporte y entrevistas. Learned words: <b>' + Object.keys(S.drill).length + '</b></p></div>';
    h += '<nav class="tabs" id="etabs"><a href="#" data-t="drill" class="on">🎯 Drill global</a><a href="#" data-t="phr">🗣️ Frases por situación</a><a href="#" data-t="int">💼 Entrevista</a><a href="#" data-t="ff">⚠️ False friends</a><a href="#" data-t="voc">📚 Glosario completo</a></nav><div id="ec"></div>';
    $m().innerHTML = h;
    const ec = document.getElementById('ec');
    function show(t) {
      document.querySelectorAll('#etabs a').forEach(a => a.classList.toggle('on', a.dataset.t === t));
      if (t === 'drill') { ec.innerHTML = '<div class="card"><div id="gd"></div></div>'; drill(document.getElementById('gd'), all.map(x => x.slice(0, 3)), 'all'); }
      if (t === 'phr') ec.innerHTML = (E.situations || []).map(s => '<div class="card" style="margin-bottom:12px"><h3>' + s.t + '</h3><ul>' + s.p.map(p => '<li><b>' + p[0] + '</b><br><span class="muted">' + p[1] + '</span></li>').join('') + '</ul></div>').join('');
      if (t === 'int') {
        ec.innerHTML = '<p class="muted">Leé la pregunta, respondé EN VOZ ALTA en inglés (cronometrá 1–2 min) y después compará con la respuesta modelo.</p>' + (E.interview || []).map((q, i) => '<details class="lesson"><summary>💬 ' + q[0] + '</summary><div class="lbody"><p class="muted">' + q[1] + '</p><div class="en">' + q[2] + '</div></div></details>').join('');
      }
      if (t === 'ff') ec.innerHTML = '<div class="card"><table><tr><th>Palabra en inglés</th><th>Significa</th><th>NO significa</th><th>Para decir eso, usá</th></tr>' + (E.falseFriends || []).map(f => '<tr><td><b>' + f[0] + '</b></td><td>' + f[1] + '</td><td>' + f[2] + '</td><td>' + f[3] + '</td></tr>').join('') + '</table></div>';
      if (t === 'voc') ec.innerHTML = '<div class="card"><input class="inp" id="vq" placeholder="Buscar término (en inglés o español)..."><table id="vt"></table></div>';
      if (t === 'voc') {
        const draw = q => { document.getElementById('vt').innerHTML = '<tr><th>English</th><th>Español</th><th>Example</th><th>Unidad</th></tr>' + all.filter(x => !q || (x[0] + x[1]).toLowerCase().includes(q)).map(x => '<tr><td><b>' + x[0] + '</b></td><td>' + x[1] + '</td><td><i>' + x[2] + '</i></td><td>' + x[3] + '</td></tr>').join(''); };
        draw(''); document.getElementById('vq').oninput = e => draw(e.target.value.toLowerCase());
      }
    }
    document.querySelectorAll('#etabs a').forEach(a => a.onclick = e => { e.preventDefault(); show(a.dataset.t); });
    show('drill');
  }

  function viewExam() {
    let h = '<div class="hero"><div class="num">EXAMEN FINAL</div><h1>🎓 Examen integrador NetOps</h1><p>30 preguntas al azar de las 13 unidades. Aprobás con <b>80%</b>. Mejor nota: <b>' + S.exam + '%</b>. Simula una evaluación técnica de ingreso a NOC / soporte / redes.</p>' +
      '<div class="row"><input class="inp" id="nm" style="max-width:300px" placeholder="Tu nombre para el certificado" value="' + esc(S.name || '') + '"><button class="btn" id="go">Comenzar examen</button></div></div><div id="ex"></div>';
    $m().innerHTML = h;
    if (S.exam >= 80) document.getElementById('ex').innerHTML = cert(S.exam);
    document.getElementById('go').onclick = () => {
      S.name = document.getElementById('nm').value.trim(); save();
      const pool = [];
      UNITS.forEach(u => u.quiz.forEach((q, i) => pool.push(Object.assign({ _i: i, _k: u.id, _u: u.short }, q))));
      const pick = shuffle(pool).slice(0, 30);
      const ex = document.getElementById('ex');
      quiz(ex, pick, 'exam', pct => {
        const first = S.exam < 80 && pct >= 80;
        S.exam = Math.max(S.exam, pct); save();
        if (first) addXP(150, '¡Examen final aprobado!');
        if (pct >= 80) ex.insertAdjacentHTML('beforeend', cert(pct));
      }, { noShuffle: true });
    };
  }
  function cert(p) {
    return '<div class="cert"><div class="num">NETOPS ACADEMY</div><h2>Certificado de finalización</h2><p>Se certifica que</p><h1>' + esc(S.name || 'Guillermo') + '</h1><p>completó la capacitación intensiva en <b>Redes, CCNA, Linux, Soporte Técnico, NOC, Seguridad, Hacking Ético, Python y Cloud</b><br>con una calificación de <b>' + p + '%</b>.</p><p class="muted">' + new Date().toLocaleDateString('es-AR') + ' · ' + S.xp + ' XP · Nivel ' + level().cur[1] + '</p><button class="btn sec sm" onclick="window.print()">🖨️ Imprimir / guardar PDF</button></div>';
  }

  function viewPlan() {
    const P = window.PLAN || [];
    let h = '<div class="hero"><div class="num">PLAN DE ESTUDIO</div><h1>🗓️ Plan intensivo de 7 días</h1><p>~3–4 h por día. Si tenés menos tiempo, hacé una unidad por día (13 días). La regla: <b>teoría → English Corner → flashcards → quiz → lab</b>.</p></div>';
    h += P.map(d => '<div class="card" style="margin-bottom:12px"><h3>' + d.d + '</h3><ul>' + d.items.map(i => '<li>' + i + '</li>').join('') + '</ul></div>').join('');
    h += '<div class="card"><h3>🧰 Software recomendado (gratis) para practicar fuera de la app</h3>' + (window.RESOURCES || '') + '</div>';
    $m().innerHTML = h;
  }

  function viewProgress() {
    let h = '<div class="hero"><div class="num">MI PROGRESO</div><h1>📊 Progreso</h1><div class="stats"><div class="stat"><b>' + S.xp + '</b><span>XP</span></div><div class="stat"><b>' + Object.keys(S.quizOk).length + '</b><span>Preguntas acertadas</span></div><div class="stat"><b>' + Object.keys(S.drill).length + '</b><span>Palabras en inglés</span></div><div class="stat"><b>' + S.exam + '%</b><span>Examen final</span></div></div></div>';
    h += '<div class="card"><table><tr><th>Unidad</th><th>Lecciones</th><th>Mejor quiz</th><th>Lab</th><th>Estado</th></tr>' + UNITS.map(u => { const p = unitProg(u); return '<tr><td>' + u.icon + ' ' + u.num + '. ' + u.title + '</td><td>' + p.read + '/' + p.total + '</td><td>' + p.best + '%</td><td>' + (S.labs[u.id] ? '✔' : '—') + '</td><td>' + (p.done ? '✅' : p.pct + '%') + '</td></tr>'; }).join('') + '</table></div>';
    h += '<h3>Insignias</h3>' + badges();
    h += '<div class="card" style="margin-top:20px"><h3>Respaldo</h3><p class="muted">El progreso se guarda en este navegador. Podés exportarlo para pasarlo a otra PC.</p><div class="row"><button class="btn sec" id="exp">⬇ Exportar progreso</button><label class="btn sec">⬆ Importar<input type="file" id="imp" hidden accept=".json"></label><button class="btn sec" id="rst" style="border-color:var(--bad)">🗑 Reiniciar todo</button></div></div>';
    $m().innerHTML = h;
    document.getElementById('exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' })); a.download = 'netops-progreso.json'; a.click(); };
    document.getElementById('imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { S = Object.assign(clone(DEF), JSON.parse(t)); save(); toast('Progreso importado'); viewProgress(); } catch (er) { toast('Archivo inválido'); } }); };
    document.getElementById('rst').onclick = () => { if (confirm('¿Borrar todo el progreso?')) { S = clone(DEF); save(); viewProgress(); } };
  }

  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [a, b, c] = h.split('/');
    window.scrollTo(0, 0);
    document.getElementById('side').classList.remove('open');
    if (a === 'unit') viewUnit(b, c || 'teoria');
    else if (a === 'tool') viewTool(b);
    else if (a === 'english') viewEnglish();
    else if (a === 'exam') viewExam();
    else if (a === 'plan') viewPlan();
    else if (a === 'progress') viewProgress();
    else viewHome();
    renderSide();
  }
  window.addEventListener('hashchange', route);
  document.getElementById('menu').onclick = () => document.getElementById('side').classList.toggle('open');
  renderTop(); route();
})();

/* NetOps Academy — Simulaciones U06–U13 (telecom, Linux, soporte, NOC, seguridad, Python, cloud, hacking) */
(function () {
  'use strict';
  const K = window.SimKit, C = K.C;
  const fmtN = (n, d) => Number(n).toLocaleString('es-AR', { maximumFractionDigits: d === undefined ? 1 : d });

  /* =========================================================
     U06 · Canales Wi-Fi 2,4 GHz
     ========================================================= */
  K.add({
    id: 'wifi-ch', at: ['u06:0'], icon: '📶', title: 'Planificador de canales Wi-Fi 2,4 GHz',
    desc: 'En 2,4 GHz cada canal ocupa ~22 MHz pero están separados solo 5 MHz: <b>se pisan</b>. Elegí el canal de 3 access points vecinos y mirá el espectro. 🎯 Lográ que no haya interferencia entre ninguno.',
    render(a) {
      const s = a.svg(800, 300);
      const X = f => 40 + (f - 2398) / (2488 - 2398) * 720;
      a.el('line', { x1: 40, y1: 240, x2: 760, y2: 240, stroke: C.line, 'stroke-width': 2 }, s);
      for (let ch = 1; ch <= 13; ch++) {
        const fc = 2407 + 5 * ch;
        a.el('line', { x1: X(fc), y1: 240, x2: X(fc), y2: 246, stroke: C.muted }, s);
        a.txt(s, X(fc), 262, ch, { 'text-anchor': 'middle', 'font-size': 12, fill: C.text, class: 'mono' });
      }
      a.txt(s, 400, 288, 'Canal (frecuencia central = 2407 + 5 × canal MHz)', { 'text-anchor': 'middle', 'font-size': 11 });
      const gw = a.el('g', {}, s);
      const AP = [{ n: 'AP-Recepción', c: C.acc2, ch: 1 }, { n: 'AP-Oficinas', c: C.warn, ch: 3 }, { n: 'AP-Depósito', c: C.pink, ch: 6 }];
      AP.forEach((ap, i) => { ap.sel = a.select(ap.n, Array.from({ length: 13 }, (_, k) => [k + 1, 'canal ' + (k + 1)]), ap.ch); ap.sel.style.borderColor = ap.c; ap.sel.onchange = () => { ap.ch = +ap.sel.value; draw(); }; });
      a.btn('✨ Plan recomendado 1 / 6 / 11', () => { [1, 6, 11].forEach((c, i) => { AP[i].ch = c; AP[i].sel.value = c; }); draw(); }, 'sec');
      function draw() {
        gw.innerHTML = '';
        AP.forEach((ap, i) => {
          const fc = 2407 + 5 * ap.ch, x1 = X(fc - 11), x2 = X(fc + 11), h = 150 - i * 18;
          a.el('path', { d: 'M' + x1 + ',240 C' + (x1 + 10) + ',' + (240 - h * 1.3) + ' ' + (x2 - 10) + ',' + (240 - h * 1.3) + ' ' + x2 + ',240 Z', fill: ap.c, 'fill-opacity': 0.22, stroke: ap.c, 'stroke-width': 2.5 }, gw);
          a.txt(gw, X(fc), 240 - h - 6, ap.n + ' (ch ' + ap.ch + ')', { 'text-anchor': 'middle', fill: ap.c, 'font-weight': 700, 'font-size': 11.5 });
        });
        const out = []; let bad = 0;
        for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
          const d = Math.abs(AP[i].ch - AP[j].ch);
          const pair = AP[i].n + ' ↔ ' + AP[j].n;
          if (d === 0) { out.push('<div class="warn" style="margin:4px 0">' + pair + ': <b>mismo canal</b> (co-canal). Se turnan para hablar (CSMA/CA): comparten el tiempo de aire, pero se "entienden".</div>'); bad++; }
          else if (d < 5) { out.push('<div class="alert" style="margin:4px 0;white-space:normal">' + pair + ': canales ' + AP[i].ch + ' y ' + AP[j].ch + ' se <b>solapan</b> (interferencia de canal adyacente). Es ruido que no pueden decodificar: ¡lo peor!</div>'); bad++; }
          else out.push('<div class="okb">✅ ' + pair + ': separación ' + d + ' canales → sin solapamiento.</div>');
        }
        a.side.innerHTML = out.join('') + '<p class="muted">En 5 GHz hay más de 20 canales de 20 MHz que no se solapan: por eso se prefiere para alta densidad.</p>';
        if (!bad) a.done();
      }
      a.noLog(); draw();
    }
  });

  /* =========================================================
     U06 · Presupuesto de enlace de radio (dBm)
     ========================================================= */
  K.add({
    id: 'link-budget', at: ['u06:1'], icon: '📡', title: 'Presupuesto de enlace de radio',
    desc: 'Sumá y restá decibeles a lo largo del enlace: potencia del transmisor, pérdidas en cables, ganancia de antenas y la enorme <b>pérdida en el espacio libre (FSPL)</b>. 🎯 Lográ un enlace de <b>15 km</b> con al menos <b>10 dB de margen</b>.',
    render(a) {
      const F = {};
      const add = (k, l, v, mn, mx, st) => { F[k] = a.input(l, v, { type: 'number', min: mn, max: mx, step: st || 1, style: 'width:72px' }); F[k].oninput = draw; };
      add('tx', 'Tx (dBm)', 20, -10, 30); add('lc1', 'Cable Tx (dB)', 1, 0, 10, 0.5); add('g1', 'Antena Tx (dBi)', 16, 0, 35);
      a.br();
      const fq = a.select('Frecuencia', [[2400, '2,4 GHz'], [5800, '5,8 GHz'], [900, '900 MHz']], 5800); fq.onchange = draw;
      add('d', 'Distancia (km)', 15, 0.1, 80, 0.5); add('g2', 'Antena Rx (dBi)', 16, 0, 35); add('lc2', 'Cable Rx (dB)', 1, 0, 10, 0.5); add('sen', 'Sensibilidad Rx (dBm)', -85, -100, -50);
      a.noLog();
      function draw() {
        const v = k => +F[k].value || 0;
        const f = +fq.value, d = Math.max(0.01, v('d'));
        const fspl = 20 * Math.log10(d) + 20 * Math.log10(f) + 32.44;
        const steps = [['Tx', v('tx')], ['Cable', -v('lc1')], ['Antena', v('g1')], ['FSPL', -fspl], ['Antena', v('g2')], ['Cable', -v('lc2')]];
        const lv = []; let acc = 0; steps.forEach((st, i) => { acc = i ? acc + st[1] : st[1]; lv.push(acc); });
        const rx = acc, margin = rx - v('sen');
        const W = 800, H = 300, top = 45, bot = 255;
        const Y = dbm => top + (40 - dbm) / 140 * (bot - top);
        const svg = a.svg(W, H);
        [40, 20, 0, -20, -40, -60, -80, -100].forEach(d => { a.el('line', { x1: 60, y1: Y(d), x2: 780, y2: Y(d), stroke: '#1a2350' }, svg); a.txt(svg, 52, Y(d) + 4, d, { 'text-anchor': 'end', 'font-size': 10, class: 'mono' }); });
        a.txt(svg, 12, 22, 'dBm', { 'font-size': 11 });
        const cw = 720 / (steps.length + 1);
        steps.forEach((st, i) => {
          const x = 70 + i * cw, prev = i ? lv[i - 1] : null, cur = lv[i];
          const col = i === 0 ? C.acc2 : st[1] >= 0 ? C.acc : st[0] === 'FSPL' ? C.bad : C.warn;
          if (i === 0) a.el('rect', { x: x + 8, y: Math.min(Y(0), Y(cur)), width: cw - 16, height: Math.abs(Y(0) - Y(cur)), fill: col, rx: 4 }, svg);
          else a.el('rect', { x: x + 8, y: Math.min(Y(prev), Y(cur)), width: cw - 16, height: Math.max(2, Math.abs(Y(prev) - Y(cur))), fill: col, rx: 4, 'fill-opacity': 0.85 }, svg);
          if (i < steps.length - 1) a.el('line', { x1: x + cw - 8, y1: Y(cur), x2: x + cw + 8, y2: Y(cur), stroke: C.muted, 'stroke-dasharray': '3 3' }, svg);
          a.txt(svg, x + cw / 2, 275, st[0], { 'text-anchor': 'middle', fill: C.text, 'font-size': 11.5 });
          a.txt(svg, x + cw / 2, 290, (st[1] > 0 && i ? '+' : '') + fmtN(st[1]), { 'text-anchor': 'middle', 'font-size': 10.5, class: 'mono', fill: col });
        });
        const xr = 70 + steps.length * cw;
        a.el('circle', { cx: xr + cw / 2, cy: Y(rx), r: 8, fill: margin >= 10 ? C.acc : margin >= 0 ? C.warn : C.bad }, svg);
        a.txt(svg, xr + cw / 2, 275, 'Rx', { 'text-anchor': 'middle', fill: C.text, 'font-weight': 700 });
        a.txt(svg, xr + cw / 2, 290, fmtN(rx) + ' dBm', { 'text-anchor': 'middle', 'font-size': 10.5, class: 'mono', fill: C.text });
        a.el('line', { x1: 60, y1: Y(v('sen')), x2: 780, y2: Y(v('sen')), stroke: C.bad, 'stroke-width': 2, 'stroke-dasharray': '8 5' }, svg);
        a.txt(svg, 66, Y(v('sen')) + 14, 'sensibilidad del receptor ' + v('sen') + ' dBm', { fill: C.bad, 'font-size': 11 });
        const mw = Math.pow(10, rx / 10);
        a.side.innerHTML = '<table>' + [['FSPL', fmtN(fspl) + ' dB'], ['Nivel Rx', fmtN(rx) + ' dBm'], ['= potencia', mw < 1e-6 ? fmtN(mw * 1e9, 2) + ' pW' : fmtN(mw * 1e6, 2) + ' nW'], ['Margen', '<b style="color:' + (margin >= 10 ? C.acc : margin >= 0 ? C.warn : C.bad) + '">' + fmtN(margin) + ' dB</b>']].map(r => '<tr><th>' + r[0] + '</th><td class="mono">' + r[1] + '</td></tr>').join('') + '</table>' +
          '<p class="muted">FSPL = 20·log(d km) + 20·log(f MHz) + 32,44. <b>Duplicar la distancia = −6 dB.</b> Recordá: +3 dB = doble de potencia, +10 dB = 10 veces.</p>' +
          '<p>' + (margin < 0 ? '❌ El enlace no funciona: la señal llega por debajo de la sensibilidad.' : margin < 10 ? '⚠️ Funciona, pero con poco margen: lluvia, desalineación o vegetación lo pueden cortar (fade margin recomendado ≥ 10–20 dB).' : '✅ Enlace robusto.') + '</p>';
        if (v('d') >= 15 && margin >= 10) a.done();
      }
      draw();
    }
  });

  /* =========================================================
     U06 · Fibra: presupuesto óptico + traza OTDR
     ========================================================= */
  K.add({
    id: 'otdr', at: ['u06:2', 'u06:3'], icon: '🔦', title: 'Fibra: presupuesto óptico y traza OTDR',
    desc: 'Armá un enlace GPON (OLT → splitter → ONT) y mirá su <b>traza OTDR</b>: la pendiente es la atenuación por km, los escalones son empalmes y splitters, los picos son conectores (reflexión). Inyectá una <b>falla</b> y aprendé a ubicarla.',
    render(a) {
      const km = a.input('Distancia (km)', 12, { type: 'number', min: 1, max: 40, step: 1, style: 'width:64px' });
      const sp = a.input('Empalmes', 4, { type: 'number', min: 0, max: 20, style: 'width:56px' });
      const spl = a.select('Splitter', [[0, 'sin splitter'], [10.5, '1:8 (10,5 dB)'], [13.8, '1:16 (13,8 dB)'], [17.2, '1:32 (17,2 dB)'], [21, '1:64 (21 dB)']], 17.2);
      const lam = a.select('λ', [[0.35, '1310 nm (0,35 dB/km)'], [0.25, '1490 nm (0,25 dB/km)'], [0.22, '1550 nm (0,22 dB/km)']], 0.35);
      a.br();
      const flt = a.select('Falla', [['none', 'Sin falla'], ['bend', 'Macrocurvatura (fibra doblada)'], ['dirty', 'Conector sucio en ODF'], ['cut', 'Corte de fibra']], 'none');
      const fpos = a.input('a (km)', 7, { type: 'number', min: 0.5, max: 39, step: 0.5, style: 'width:60px' });
      [km, sp, fpos].forEach(i => i.oninput = draw); [spl, lam, flt].forEach(i => i.onchange = draw);
      const seen = new Set();
      function draw() {
        const L = Math.max(1, +km.value || 1), ns = Math.max(0, Math.floor(+sp.value || 0)), sl = +spl.value, at = +lam.value, f = flt.value;
        const fp = Math.min(L - 0.2, Math.max(0.3, +fpos.value || 1));
        const ev = [{ d: 0.05, t: 'con', loss: 0.5, n: 'Conector OLT' }];
        for (let i = 1; i <= ns; i++) ev.push({ d: L * i / (ns + 1), t: 'spl', loss: 0.1, n: 'Empalme ' + i });
        if (sl) ev.push({ d: L * 0.82, t: 'split', loss: sl, n: 'Splitter' });
        if (f === 'bend') ev.push({ d: fp, t: 'bend', loss: 1.8, n: '⚠ Macrocurvatura' });
        if (f === 'dirty') ev.push({ d: 0.05, t: 'con', loss: 2.5, n: '⚠ Conector sucio', refl: 1 });
        ev.sort((x, y) => x.d - y.d);
        const end = f === 'cut' ? fp : L;
        const W = 800, H = 300, x0 = 60, x1 = 780, y0 = 30, y1 = 250;
        const X = d => x0 + d / L * (x1 - x0);
        const maxDb = 35;
        const Y = db => y0 + db / maxDb * (y1 - y0);
        const svg = a.svg(W, H);
        for (let d = 0; d <= maxDb; d += 5) { a.el('line', { x1: x0, y1: Y(d), x2: x1, y2: Y(d), stroke: '#1a2350' }, svg); a.txt(svg, x0 - 6, Y(d) + 4, '-' + d, { 'text-anchor': 'end', 'font-size': 10, class: 'mono' }); }
        for (let d = 0; d <= L; d += Math.max(1, Math.round(L / 10))) a.txt(svg, X(d), 268, d + ' km', { 'text-anchor': 'middle', 'font-size': 10, class: 'mono' });
        a.txt(svg, 10, 18, 'dB (retrodispersión)', { 'font-size': 10.5 });
        let p = 'M' + X(0) + ',' + Y(0) + ' L' + X(0.02) + ',' + (Y(0) - 26), lvl = 0, last = 0, total = 0;
        const evs = ev.filter(e => e.d <= end);
        evs.forEach(e => {
          lvl += (e.d - last) * at;
          p += ' L' + X(e.d) + ',' + Y(lvl);
          if (e.t === 'con' || e.refl) p += ' L' + X(e.d) + ',' + (Y(lvl) - (e.refl ? 30 : 16)) + ' L' + X(e.d + L * 0.006) + ',' + Y(lvl + e.loss);
          else p += ' L' + X(e.d + L * 0.004) + ',' + Y(lvl + e.loss);
          lvl += e.loss; last = e.d;
          a.txt(svg, X(e.d), Y(lvl) + 18, e.n, { 'text-anchor': 'middle', 'font-size': 9.5, fill: e.n.startsWith('⚠') ? C.bad : C.muted, transform: 'rotate(-28 ' + X(e.d) + ' ' + (Y(lvl) + 18) + ')' });
        });
        lvl += (end - last) * at;
        p += ' L' + X(end) + ',' + Y(lvl);
        if (f === 'cut') { p += ' L' + X(end) + ',' + (Y(lvl) - 45) + ' L' + X(end + L * 0.01) + ',' + Y(maxDb) + ' L' + X(L) + ',' + Y(maxDb); }
        else p += ' L' + X(end) + ',' + (Y(lvl) - 22) + ' L' + X(Math.min(L, end + L * 0.008)) + ',' + Y(maxDb);
        a.el('path', { d: p, fill: 'none', stroke: C.acc, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, svg);
        if (f !== 'none') a.el('line', { x1: X(f === 'dirty' ? 0.05 : fp), y1: y0, x2: X(f === 'dirty' ? 0.05 : fp), y2: y1, stroke: C.bad, 'stroke-dasharray': '4 4' }, svg);
        total = lvl + 0.5;
        const budget = 28, rx = 3 - total, marg = -28 - rx;
        a.side.innerHTML = (f === 'cut' ? '<div class="alert" style="white-space:normal">Corte a ' + fmtN(fp) + ' km: la traza termina con un pico de reflexión (Fresnel) y cae al ruido. El ONT queda en <b>LOS</b> (Loss of Signal).</div>' :
          '<table>' + [['Fibra', fmtN(L * at, 2) + ' dB'], ['Empalmes', fmtN(ns * 0.1, 2) + ' dB'], ['Conectores', (f === 'dirty' ? '3,0' : '1,0') + ' dB'], ['Splitter', fmtN(sl) + ' dB'], ['Falla', f === 'bend' ? '1,8 dB' : '—'], ['<b>Pérdida total</b>', '<b>' + fmtN(total, 2) + ' dB</b>'], ['Rx en ONT (Tx +3 dBm)', fmtN(rx, 2) + ' dBm']].map(r => '<tr><th>' + r[0] + '</th><td class="mono">' + r[1] + '</td></tr>').join('') + '</table>' +
            '<p>' + (total <= budget ? '✅ Dentro del presupuesto clase B+ (28 dB). Margen: ' + fmtN(budget - total, 1) + ' dB.' : '❌ Excede el presupuesto B+ (28 dB): el ONT no sincroniza o tendrá errores (BIP). Reducí distancia/splitter o usá clase C+.') + '</p>') +
          '<p class="muted">' + ({ none: 'Traza sana: pendiente uniforme, escalones pequeños en empalmes (≈0,1 dB) y uno grande en el splitter.', bend: 'Una macrocurvatura se ve como un escalón SIN pico de reflexión, típicamente más grande a 1550 nm que a 1310 nm.', dirty: 'Conector sucio: pico de reflexión alto + pérdida grande al inicio. Solución: limpiar e inspeccionar con microscopio.', cut: 'El OTDR mide la distancia a la falla: con eso la cuadrilla sabe dónde cavar.' })[f] + '</p>';
        seen.add(f); if (seen.size >= 3) a.done();
      }
      a.noLog(); draw();
    }
  });

  /* =========================================================
     U07 · chmod: permisos Linux
     ========================================================= */
  K.add({
    id: 'chmod', at: ['u07:1'], icon: '🔐', title: 'Calculadora visual de chmod',
    desc: 'Tildá permisos y mirá cómo se arma el número octal (r=4, w=2, x=1) y la notación simbólica de <code>ls -l</code>, o escribí el octal y mirá los permisos.',
    render(a) {
      a.noLog();
      const oct = a.input('Octal', '640', { size: 4, class: 'mono', maxlength: 3 });
      ['755', '644', '600', '700', '750', '777'].forEach(v => a.btn(v, () => { oct.value = v; fromOct(); }, 'sec'));
      const who = ['Dueño (u)', 'Grupo (g)', 'Otros (o)'], bits = [[4, 'r', 'leer'], [2, 'w', 'escribir'], [1, 'x', 'ejecutar']];
      let st = [6, 4, 0];
      const tried = new Set();
      function draw() {
        const o = st.join('');
        const sym = st.map(n => bits.map(b => (n & b[0] ? b[1] : '-')).join('')).join('');
        a.stage.innerHTML = '<div style="padding:12px"><table class="chm"><tr><th></th>' + bits.map(b => '<th>' + b[1] + ' (' + b[0] + ')<br><small>' + b[2] + '</small></th>').join('') + '<th>Suma</th></tr>' +
          who.map((w, i) => '<tr><td><b>' + w + '</b></td>' + bits.map(b => '<td class="center"><input type="checkbox" data-i="' + i + '" data-b="' + b[0] + '" ' + (st[i] & b[0] ? 'checked' : '') + '></td>').join('') + '<td class="center big" style="font-size:1.3rem">' + st[i] + '</td></tr>').join('') + '</table>' +
          '<pre style="margin-top:10px">$ chmod ' + o + ' script.sh\n$ ls -l script.sh\n-' + sym + ' 1 guille noc 2048 oct 30 11:00 script.sh</pre></div>';
        a.stage.querySelectorAll('input').forEach(c => c.onchange = () => { const i = +c.dataset.i, b = +c.dataset.b; st[i] = c.checked ? st[i] | b : st[i] & ~b; oct.value = st.join(''); draw(); });
        const tips = [];
        if (st[2] & 2) tips.push('⚠️ Otros pueden <b>escribir</b>: cualquiera puede modificar el archivo. Casi nunca es buena idea (777 es una alarma en una auditoría).');
        if (o === '600') tips.push('🔑 600 es lo exigido para claves privadas SSH (<code>~/.ssh/id_rsa</code>); si no, ssh se niega a usarlas.');
        if (o === '755') tips.push('📂 755: típico de directorios y scripts/binarios: todos ejecutan, solo el dueño modifica.');
        if (o === '644') tips.push('📄 644: típico de archivos de configuración y web: todos leen, solo el dueño escribe.');
        if (!(st[0] & 1) && (st[1] & 1 || st[2] & 1)) tips.push('🤔 El grupo/otros pueden ejecutar pero el dueño no: raro.');
        tips.push('En un <b>directorio</b>, x = poder entrar (cd) y r = listar su contenido.');
        a.side.innerHTML = '<p>Simbólico equivalente:<br><code>chmod u=' + bits.filter(b => st[0] & b[0]).map(b => b[1]).join('') + ',g=' + bits.filter(b => st[1] & b[0]).map(b => b[1]).join('') + ',o=' + bits.filter(b => st[2] & b[0]).map(b => b[1]).join('') + ' script.sh</code></p>' + tips.map(t => '<p>' + t + '</p>').join('');
        tried.add(o); if (tried.size >= 5) a.done();
      }
      function fromOct() { const v = oct.value.trim(); if (!/^[0-7]{3}$/.test(v)) { oct.classList.add('bad'); return; } oct.classList.remove('bad'); st = v.split('').map(Number); draw(); }
      oct.oninput = fromOct;
      draw();
    }
  });

  /* =========================================================
     U08 · "No tengo internet": diagnóstico guiado
     ========================================================= */
  K.add({
    id: 'diag', at: ['u08:1'], icon: '🩺', title: 'Caso de soporte: "No tengo internet"',
    desc: 'Un usuario llama porque "no anda internet". Hay una falla oculta. Ejecutá pruebas <b>de abajo hacia arriba</b> (capa física → IP → gateway → Internet → DNS), interpretá las salidas y diagnosticá. 🎯 Ideal: resolverlo con 4 pruebas o menos.',
    render(a) {
      const F = {
        cable: { n: 'Cable desconectado / Wi-Fi apagado', fix: 'Reconectar el cable o activar el Wi-Fi (y revisar el puerto del switch).' },
        dhcp: { n: 'Sin DHCP (IP APIPA 169.254)', fix: 'Revisar servidor DHCP / scope lleno / VLAN del puerto / ip helper-address. Luego ipconfig /renew.' },
        gw: { n: 'Gateway mal configurado (IP estática errónea)', fix: 'Corregir el gateway (o volver a DHCP).' },
        isp: { n: 'Caída del enlace a Internet (ISP)', fix: 'Afecta a todos: escalar al NOC / abrir reclamo al proveedor.' },
        dns: { n: 'DNS no responde', fix: 'Cambiar/arreglar el DNS (ipconfig /flushdns, revisar servidor DNS, probar 8.8.8.8).' },
        site: { n: 'Solo un sitio caído (lo demás funciona)', fix: 'No es la red del usuario: verificar estado del servicio externo.' }
      };
      const T = [
        ['led', '💡 Ver LED / ícono de red'], ['ipc', 'ipconfig'], ['pgw', 'ping 192.168.1.1'], ['p8', 'ping 8.8.8.8'], ['ns', 'nslookup google.com'], ['pw', 'ping google.com'], ['web', 'Abrir sistema-web.empresa.com']];
      let fault, used;
      T.forEach(t => a.btn(t[1], () => test(t[0]), 'sec'));
      a.br();
      const dg = a.select('Diagnóstico', [['', '— elegí —']].concat(Object.keys(F).map(k => [k, F[k].n])), '');
      a.btn('✅ Confirmar diagnóstico', () => answer(), 'go');
      a.btn('🎲 Nuevo caso', () => newCase(), 'blue');
      a.full();
      const term = document.createElement('div'); term.className = 'out diag-term'; a.stage.appendChild(term);
      const out = t => { term.textContent += t + '\n'; term.scrollTop = term.scrollHeight; };
      function newCase() {
        const ks = Object.keys(F); fault = ks[Math.floor(Math.random() * ks.length)]; used = 0; dg.value = '';
        term.textContent = '📞 Usuario: "Hola, no me anda internet desde hace un rato... ¿me ayudás?"\n\n'; a.clearLog();
        a.log('Nuevo caso. Pensá en el modelo OSI: empezá por lo físico.', 'info');
      }
      function test(k) {
        if (!fault) return;
        used++;
        const ipBad = fault === 'cable' || fault === 'dhcp';
        const R = {
          led: () => fault === 'cable' ? '🔴 Ícono de red con X roja: "Cable de red desconectado". LED del puerto apagado.' : '🟢 Conectado. LED de enlace encendido y titilando.',
          ipc: () => fault === 'cable' ? 'Adaptador de Ethernet:\n   Estado de los medios. . . : medios desconectados' :
            fault === 'dhcp' ? 'Adaptador de Ethernet:\n   Dirección IPv4 (autoconfig.) : 169.254.37.112\n   Máscara de subred . . . . : 255.255.0.0\n   Puerta de enlace predet. . :' :
            'Adaptador de Ethernet:\n   Dirección IPv4. . . . . . : 192.168.1.57\n   Máscara de subred . . . . : 255.255.255.0\n   Puerta de enlace predet. . : ' + (fault === 'gw' ? '192.168.10.1' : '192.168.1.1') + '\n   Servidores DNS. . . . . . : ' + (fault === 'dns' ? '192.168.1.5' : '192.168.1.1'),
          pgw: () => fault === 'cable' ? 'Error general: no se encontró la ruta / "Host de destino inaccesible".' : fault === 'dhcp' ? 'Error general. (No hay ruta hacia 192.168.1.1 desde 169.254.x.x)' : 'Respuesta desde 192.168.1.1: bytes=32 tiempo<1m TTL=64  (x4)',
          p8: () => ipBad ? 'Error general: no se encontró la ruta.' : fault === 'gw' ? 'Host de destino inaccesible. (el gateway configurado 192.168.10.1 no existe en esta red)' : fault === 'isp' ? 'Tiempo de espera agotado para esta solicitud. (x4)' : 'Respuesta desde 8.8.8.8: bytes=32 tiempo=17ms TTL=117  (x4)',
          ns: () => ipBad || fault === 'gw' || fault === 'isp' ? 'DNS request timed out.\n*** Se agotó el tiempo de espera de la solicitud' : fault === 'dns' ? 'Servidor: UnKnown\nAddress: 192.168.1.5\nDNS request timed out.\n*** No se puede encontrar google.com: Server failed' : 'Servidor: router.local\nAddress: 192.168.1.1\nRespuesta no autoritativa:\nNombre: google.com\nAddress: 142.250.79.14',
          pw: () => ipBad || fault === 'gw' || fault === 'isp' ? 'La solicitud de ping no pudo encontrar el host google.com. / Tiempo de espera agotado.' : fault === 'dns' ? 'La solicitud de ping no pudo encontrar el host google.com. Compruebe el nombre y vuelva a intentarlo.' : 'Haciendo ping a google.com [142.250.79.14]: Respuesta... tiempo=18ms',
          web: () => fault === 'site' ? 'HTTP 503 Service Unavailable  (pero Google, YouTube y el mail funcionan bien)' : fault === 'dns' ? 'ERR_NAME_NOT_RESOLVED' : (ipBad || fault === 'gw' || fault === 'isp') ? 'ERR_INTERNET_DISCONNECTED / ERR_CONNECTION_TIMED_OUT' : 'Sitio cargado OK.'
        };
        out('C:\\> ' + T.find(t => t[0] === k)[1] + '\n' + R[k]() + '\n');
      }
      function answer() {
        if (!fault || !dg.value) return;
        if (dg.value === fault) {
          a.log('✅ ¡Correcto! <b>' + F[fault].n + '</b> en ' + used + ' prueba(s). Solución: ' + F[fault].fix, 'ok');
          if (used < 2) a.log('Acertaste, ¡pero sin pruebas es adivinar! En un ticket real tenés que poder justificarlo con evidencia. Probá otro caso.', 'warn'); else if (used <= 4) a.done(); else a.log('Funcionó, pero intentá llegar con ≤ 4 pruebas siguiendo el orden lógico (ipconfig → ping gateway → ping 8.8.8.8 → nslookup).', 'warn');
          fault = null;
        } else a.log('❌ No es eso. Mirá de nuevo las salidas: ¿qué es lo primero que falla?', 'bad');
      }
      a.side.innerHTML = '';
      newCase();
    }
  });

  /* =========================================================
     U09 · Disponibilidad y redundancia
     ========================================================= */
  K.add({
    id: 'avail', at: ['u09:4'], icon: '⏱️', title: 'Calculadora de disponibilidad (los "nueves")',
    desc: 'Componentes <b>en serie</b>: la disponibilidad total se <b>multiplica</b> (siempre baja). En <b>paralelo</b> (redundancia): 1 − (1−A)(1−B) (sube muchísimo). 🎯 Agregá redundancia hasta superar <b>99,9%</b>.',
    render(a) {
      a.noLog(); a.full();
      const B = [{ n: '🧭 Router', a: 99.9, r: 'HSRP con 2.º router', on: false }, { n: '🌐 ISP', a: 99.5, r: '2.º ISP (otro proveedor)', b: 99.0, on: false }, { n: '🧱 Firewall', a: 99.95, r: 'Cluster HA', on: false }, { n: '🖥️ Servidor', a: 99.9, r: 'Cluster / 2 nodos', on: false }];
      const down = A => { const m = (1 - A) * 525600; return m >= 1440 ? fmtN(m / 1440) + ' días' : m >= 60 ? fmtN(m / 60) + ' h' : fmtN(m, 1) + ' min'; };
      function draw() {
        let tot = 1; const parts = [];
        B.forEach(b => { const x = b.a / 100, y = (b.b || b.a) / 100; const v = b.on ? 1 - (1 - x) * (1 - y) : x; b.v = v; tot *= v; });
        const weakest = B.reduce((m, b) => b.v < m.v ? b : m, B[0]);
        a.stage.innerHTML = '<div style="padding:12px"><div class="chain">' + B.map((b, i) => '<div class="blk2 ' + (b === weakest ? 'weak' : '') + '"><b>' + b.n + '</b><span class="mono">' + fmtN(b.a, 3) + '%</span>' + (b.on ? '<span class="mono par">‖ ' + fmtN(b.b || b.a, 3) + '%</span>' : '') + '<label><input type="checkbox" data-i="' + i + '" ' + (b.on ? 'checked' : '') + '> ' + b.r + '</label><small class="mono">= ' + fmtN(b.v * 100, 5) + '%</small></div>' + (i < B.length - 1 ? '<span class="arr">→</span>' : '')).join('') + '</div>' +
          '<div class="stats" style="margin-top:12px"><div class="stat"><b style="color:' + (tot >= 0.999 ? C.acc : C.warn) + '">' + fmtN(tot * 100, 4) + '%</b><span>Disponibilidad total</span></div><div class="stat"><b>' + down(tot) + '</b><span>Caída esperada por año</span></div><div class="stat"><b>' + weakest.n + '</b><span>Eslabón más débil</span></div></div>' +
          '<table style="max-width:560px"><tr><th>SLA</th><th>Caída / año</th><th>Caída / mes</th></tr>' + [99, 99.5, 99.9, 99.95, 99.99, 99.999].map(s => '<tr' + (Math.abs(tot * 100 - s) < 0.05 ? ' class="win"' : '') + '><td class="mono">' + s + '%</td><td>' + down(s / 100) + '</td><td>' + (() => { const m = (1 - s / 100) * 43800; return m >= 60 ? fmtN(m / 60) + ' h' : fmtN(m, 1) + ' min'; })() + '</td></tr>').join('') + '</table></div>';
        a.stage.querySelectorAll('input').forEach(c => c.onchange = () => { B[+c.dataset.i].on = c.checked; draw(); });
        if (tot >= 0.999) a.done();
      }
      draw();
    }
  });

  /* =========================================================
     U10 · Diffie-Hellman con números chicos
     ========================================================= */
  K.add({
    id: 'dh', at: ['u10:3'], icon: '🗝️', title: 'Diffie-Hellman: acordar una clave a la vista de todos',
    desc: 'Alice y Bob acuerdan una <b>clave secreta compartida</b> sin enviarla nunca, aunque Eve escuche todo. Usamos números chicos para que puedas seguir la cuenta; después mirá por qué en la vida real se usan primos de 2048 bits.',
    render(a) {
      a.full();
      const mp = (b, e, m) => { let r = 1; b %= m; while (e > 0) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; };
      const pS = a.select('Primo p', [[23, '23'], [97, '97'], [467, '467']], 23);
      const aS = a.input('Secreto de Alice (a)', 6, { type: 'number', min: 2, max: 400, style: 'width:64px' });
      const bS = a.input('Secreto de Bob (b)', 15, { type: 'number', min: 2, max: 400, style: 'width:64px' });
      const nx = a.btn('Siguiente paso ▶', () => { if (step < 4) { step++; draw(); } }, 'go');
      a.btn('↺ Reiniciar', () => { step = 0; draw(); }, 'sec');
      a.btn('🕵️ Eve intenta fuerza bruta', () => a.run(brute), 'blue');
      [pS, aS, bS].forEach(x => x.onchange = () => { step = 0; draw(); });
      let step = 0;
      const g = 5;
      function vals() { const p = +pS.value; const A_ = Math.max(2, Math.min(p - 2, +aS.value || 2)), B_ = Math.max(2, Math.min(p - 2, +bS.value || 2)); return { p, a: A_, b: B_, A: mp(g, A_, p), B: mp(g, B_, p), k: mp(mp(g, B_, p), A_, p), k2: mp(mp(g, A_, p), B_, p) }; }
      function draw() {
        const v = vals();
        const c = (who, html, on) => '<div class="dh-c ' + (on ? 'on' : '') + '">' + html + '</div>';
        const alice = ['<b>👩 Alice</b>', step >= 1 ? 'Elige secreto <b>a = ' + v.a + '</b> 🤫' : '', step >= 2 ? 'Calcula A = g<sup>a</sup> mod p = 5<sup>' + v.a + '</sup> mod ' + v.p + ' = <b>' + v.A + '</b>' : '', step >= 4 ? 'Calcula K = B<sup>a</sup> mod p = ' + v.B + '<sup>' + v.a + '</sup> mod ' + v.p + ' = <b class="key">' + v.k + '</b> 🔑' : ''];
        const bob = ['<b>👨 Bob</b>', step >= 1 ? 'Elige secreto <b>b = ' + v.b + '</b> 🤫' : '', step >= 2 ? 'Calcula B = 5<sup>' + v.b + '</sup> mod ' + v.p + ' = <b>' + v.B + '</b>' : '', step >= 4 ? 'Calcula K = A<sup>b</sup> mod p = ' + v.A + '<sup>' + v.b + '</sup> mod ' + v.p + ' = <b class="key">' + v.k2 + '</b> 🔑' : ''];
        const pub = ['<b>📢 Canal público (Eve 🕵️ ve todo)</b>', 'Acuerdan en público: p = <b>' + v.p + '</b>, g = <b>5</b>', step >= 3 ? 'Alice → Bob: <b>A = ' + v.A + '</b>' : '', step >= 3 ? 'Bob → Alice: <b>B = ' + v.B + '</b>' : '', step >= 4 ? 'Eve sabe p, g, A y B... pero para obtener K necesita a o b: el <b>problema del logaritmo discreto</b>.' : ''];
        a.stage.innerHTML = '<div class="dh">' + c('a', alice.filter(Boolean).map(x => '<div>' + x + '</div>').join(''), step === 1 || step === 2 || step === 4) + c('p', pub.filter(Boolean).map(x => '<div>' + x + '</div>').join(''), step === 0 || step === 3) + c('b', bob.filter(Boolean).map(x => '<div>' + x + '</div>').join(''), step === 1 || step === 2 || step === 4) + '</div>' +
          (step >= 4 ? '<p class="center" style="margin:8px">✅ Ambos llegaron a la <b>misma clave K = ' + v.k + '</b> sin enviarla nunca. Con ella cifran con AES (simétrico, rápido). Así arranca TLS (ECDHE) y las VPN IPsec (IKE).</p>' : '');
        nx.disabled = step >= 4;
        if (step >= 4) a.done();
      }
      async function brute() {
        const v = vals();
        a.log('Eve prueba x = 1, 2, 3... hasta que 5<sup>x</sup> mod ' + v.p + ' = ' + v.A + ' (el A de Alice).', 'warn');
        for (let x = 1; x < v.p; x++) {
          if (!a.alive()) return;
          const r = mp(g, x, v.p);
          if (x <= 12 || r === v.A) a.log('x=' + x + ' → ' + r + (r === v.A ? ' ✅' : ''), r === v.A ? 'bad' : '');
          if (r === v.A) { a.log('¡Eve encontró un secreto equivalente (x = ' + x + ') en ' + x + ' intentos y puede calcular K! Con p = ' + v.p + ' es trivial. Con un primo de <b>2048 bits</b> (~617 dígitos) serían más intentos que átomos en el universo. <b>La seguridad está en el tamaño de los números.</b>', 'bad'); return; }
          if (x === 13) a.log('...', '');
          if (x % 8 === 0) await a.sleep(60);
        }
      }
      draw();
    }
  });

  /* =========================================================
     U10 · Fuerza bruta de contraseñas
     ========================================================= */
  K.add({
    id: 'pwd', at: ['u10:4'], icon: '🔓', title: '¿Cuánto tarda en romperse una contraseña?',
    desc: 'El tiempo de fuerza bruta depende de <b>combinaciones = (tamaño del alfabeto)<sup>longitud</sup></b> y de la <b>velocidad del ataque</b>. Fijate qué pesa más: la longitud o los símbolos. 🎯 Lográ más de 100 años contra una GPU con hashes MD5.',
    render(a) {
      a.noLog();
      const len = a.input('Longitud', 8, { type: 'range', min: 4, max: 24 });
      const lv = document.createElement('b'); lv.className = 'big'; lv.style.fontSize = '1.2rem'; a.ctl.appendChild(lv);
      const sets = [['l', 'a-z', 26, true], ['u', 'A-Z', 26, false], ['d', '0-9', 10, true], ['s', 'símbolos', 33, false]];
      const cb = document.createElement('span'); cb.className = 'sim-fld'; cb.innerHTML = sets.map(s => '<label style="display:inline-flex;gap:3px;align-items:center"><input type="checkbox" data-n="' + s[2] + '" ' + (s[3] ? 'checked' : '') + '>' + s[1] + '</label>').join(' ');
      a.ctl.appendChild(cb);
      const AT = [['Online con bloqueo (10/s)', 10], ['Online sin bloqueo (1.000/s)', 1e3], ['Offline bcrypt (20.000/s)', 2e4], ['Offline NTLM/MD5 con GPU (100.000 millones/s)', 1e11]];
      const human = s => { if (s < 1) return 'instantáneo'; const u = [[31536000 * 1e9, 'mil millones de años'], [31536000 * 1e6, 'millones de años'], [31536000 * 1e3, 'mil años'], [31536000, 'años'], [86400, 'días'], [3600, 'horas'], [60, 'minutos'], [1, 'segundos']]; for (const [d, n] of u) if (s >= d) return fmtN(s / d, 1) + ' ' + n; };
      function draw() {
        const L = +len.value; lv.textContent = L + ' caracteres';
        const N = [...cb.querySelectorAll('input')].filter(i => i.checked).reduce((s, i) => s + +i.dataset.n, 0) || 26;
        const comb = Math.pow(N, L), bitsE = L * Math.log2(N);
        a.stage.innerHTML = '<div style="padding:12px"><p>Alfabeto: <b>' + N + '</b> símbolos · Combinaciones: <b>' + N + '<sup>' + L + '</sup> ≈ ' + comb.toExponential(2).replace('e+', ' × 10^') + '</b> · Entropía ≈ <b>' + fmtN(bitsE, 0) + ' bits</b></p>' +
          AT.map(t => { const sec = comb / 2 / t[1]; const w = Math.min(100, Math.max(1, Math.log10(sec + 1) / 18 * 100)); return '<div class="pw-row"><span>' + t[0] + '</span><div class="bar"><i style="width:' + w + '%;background:' + (sec > 3.15e9 ? C.acc : sec > 3.15e7 ? C.warn : C.bad) + '"></i></div><b class="mono">' + human(sec) + '</b></div>'; }).join('') + '</div>';
        const gpu = comb / 2 / 1e11;
        a.side.innerHTML = '<p>Probá: 8 caracteres con todo vs. <b>16 solo minúsculas</b>. La longitud gana por goleada.</p><p class="muted">Estos tiempos son para <b>fuerza bruta pura</b>. Si la contraseña es una palabra del diccionario o un dato personal ("River2024!"), cae en segundos con ataques de diccionario. Recomendación: <b>frase de contraseña larga + gestor de contraseñas + MFA</b>.</p>' + (gpu > 3.15e9 ? '<p class="okb">🎯 ¡Más de 100 años contra GPU!</p>' : '');
        if (gpu > 3.15e9) a.done();
      }
      len.oninput = draw; cb.onchange = draw;
      draw();
    }
  });

  /* =========================================================
     U11 · Regex sobre logs
     ========================================================= */
  K.add({
    id: 'regex', at: ['u11:3'], icon: '🔍', title: 'Probador de regex sobre logs reales',
    desc: 'Escribí una expresión regular y mirá en vivo qué parte de cada línea de log coincide y qué <b>grupos</b> captura (lo que después usarías con <code>re.search()</code> / <code>re.findall()</code> en Python).',
    render(a) {
      a.noLog();
      const LOG = ['Oct 30 10:15:02 SW-CORE %LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down',
        'Oct 30 10:15:04 SW-CORE %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down',
        'Oct 30 10:16:40 FW-01 Deny tcp src outside:185.220.101.7/51234 dst inside:10.0.0.5/22',
        'Oct 30 10:17:12 R1 %OSPF-5-ADJCHG: Process 1, Nbr 10.0.0.2 on Gi0/2 from FULL to DOWN',
        'Oct 30 10:18:55 sshd[2211]: Failed password for root from 45.83.64.12 port 40122 ssh2',
        'Oct 30 10:19:01 sshd[2213]: Accepted publickey for guille from 192.168.1.57 port 53344 ssh2',
        'Oct 30 10:20:30 SW-ACC1 %SW_MATM-4-MACFLAP_NOTIF: Host 0050.56a1.2b3c in vlan 10 is flapping between port Fa0/3 and port Fa0/7'];
      const PRE = [['Interfaces caídas', 'Interface (\\S+), changed state to down'], ['Todas las IPv4', '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b'], ['Logins SSH fallidos (usuario e IP)', 'Failed password for (\\w+) from ([\\d.]+)'], ['Severidad Cisco', '%([A-Z_]+)-(\\d)-([A-Z_]+)'], ['MAC formato Cisco', '[0-9a-f]{4}\\.[0-9a-f]{4}\\.[0-9a-f]{4}'], ['Hora', '\\d{2}:\\d{2}:\\d{2}']];
      const ps = a.select('Ejemplos', [['', '— elegí —']].concat(PRE.map((p, i) => [i, p[0]])), '');
      a.br();
      const rx = a.input('re', PRE[0][1], { size: 52, class: 'mono' });
      const ok = new Set();
      ps.onchange = () => { if (ps.value !== '') { rx.value = PRE[+ps.value][1]; draw(); } };
      rx.oninput = draw;
      a.full();
      function draw() {
        let re;
        try { re = new RegExp(rx.value, 'g'); rx.classList.remove('bad'); } catch (e) { rx.classList.add('bad'); a.stage.innerHTML = '<p class="alert">Regex inválida: ' + a.esc(e.message) + '</p>'; return; }
        if (!rx.value) { a.stage.innerHTML = ''; return; }
        let total = 0; const groups = [];
        const lines = LOG.map(l => {
          let h = '', last = 0, m; re.lastIndex = 0;
          while ((m = re.exec(l)) !== null) {
            if (m[0] === '') { re.lastIndex++; continue; }
            total++;
            h += a.esc(l.slice(last, m.index)) + '<mark>' + a.esc(m[0]) + '</mark>'; last = m.index + m[0].length;
            if (m.length > 1) groups.push(m.slice(1));
          }
          return h + a.esc(l.slice(last));
        });
        a.stage.innerHTML = '<div style="padding:10px 12px"><pre class="rx">' + lines.join('\n') + '</pre><p><b>' + total + '</b> coincidencia(s).' + (groups.length ? ' Grupos capturados (como tuplas de <code>re.findall</code>):' : '') + '</p>' +
          (groups.length ? '<pre style="max-height:160px">' + groups.map(g => a.esc(JSON.stringify(g.length === 1 ? g[0] : g))).join('\n') + '</pre>' : '') +
          '<pre>import re\nfor linea in open("syslog.txt"):\n    m = re.search(r"' + a.esc(rx.value) + '", linea)\n    if m:\n        print(m.group(0)' + (groups.length && groups[0].length ? ', m.groups()' : '') + ')</pre></div>';
        if (total) { ok.add(rx.value); if (ok.size >= 3) a.done(); }
      }
      draw();
    }
  });

  /* =========================================================
     U12 · Idempotencia: Ansible vs script
     ========================================================= */
  K.add({
    id: 'ansible', at: ['u12:2'], icon: '🤖', title: 'Idempotencia: Ansible vs. script "a mano"',
    desc: 'Ansible describe el <b>estado deseado</b>: si ya está así, no toca nada (<i>ok</i>); si no, lo corrige (<i>changed</i>). Un script imperativo repite las acciones cada vez. Corré ambos varias veces y provocá un <b>drift</b> (alguien cambia algo a mano).',
    render(a) {
      a.full();
      const H = ['sw-acc1', 'sw-acc2', 'r-borde'].map(n => ({ n, ntp: n === 'sw-acc2' ? ['ntp server 10.0.0.1'] : [], banner: false, snmp: n !== 'r-borde' }));
      const term = document.createElement('pre'); term.className = 'out'; term.style.maxHeight = '230px'; term.style.overflow = 'auto';
      const cards = document.createElement('div'); cards.className = 'grid'; cards.style.margin = '10px';
      a.stage.appendChild(cards); a.stage.appendChild(term);
      let lastChanged = null, runs = 0;
      a.btn('▶ ansible-playbook baseline.yml', () => a.run(play), 'go');
      a.btn('▶ ./script.sh (imperativo)', () => a.run(script), 'sec');
      a.btn('😈 Drift: alguien toca un equipo a mano', () => { const h = H[Math.floor(Math.random() * H.length)]; h.ntp = []; h.banner = false; draw(); a.log('Alguien entró a <b>' + h.n + '</b> y borró el NTP y el banner "para probar algo". Típico.', 'warn'); }, 'sec');
      function draw() {
        cards.innerHTML = H.map(h => '<div class="card"><b>🔀 ' + h.n + '</b><pre style="font-size:.78rem;margin:6px 0 0">' + (h.ntp.length ? h.ntp.join('\n') : '! sin NTP') + '\n' + (h.banner ? 'banner motd ^Acceso autorizado^' : '! sin banner') + '\n' + (h.snmp ? 'snmp-server community NOC-RO RO' : '! sin SNMP') + '</pre>' + (h.ntp.length > 1 ? '<p class="warn" style="margin:6px 0">Líneas NTP duplicadas: ' + h.ntp.length + '</p>' : '') + '</div>').join('');
      }
      async function play() {
        term.textContent = '$ ansible-playbook -i inventario.ini baseline.yml\n';
        const tasks = [['Configurar servidor NTP', h => h.ntp.length === 1 && h.ntp[0] === 'ntp server 10.0.0.1', h => { h.ntp = ['ntp server 10.0.0.1']; }], ['Banner de login', h => h.banner, h => { h.banner = true; }], ['Comunidad SNMP de solo lectura', h => h.snmp, h => { h.snmp = true; }]];
        const rec = {}; H.forEach(h => rec[h.n] = { ok: 0, ch: 0 });
        for (const [tn, okf, fix] of tasks) {
          term.textContent += '\nTASK [' + tn + '] ' + '*'.repeat(30) + '\n';
          for (const h of H) {
            await a.sleep(260);
            if (okf(h)) { term.textContent += 'ok: [' + h.n + ']\n'; rec[h.n].ok++; }
            else { fix(h); term.textContent += 'changed: [' + h.n + ']\n'; rec[h.n].ch++; draw(); }
            term.scrollTop = term.scrollHeight;
          }
        }
        term.textContent += '\nPLAY RECAP ' + '*'.repeat(30) + '\n' + H.map(h => h.n.padEnd(10) + ': ok=' + (rec[h.n].ok + rec[h.n].ch) + '  changed=' + rec[h.n].ch + '  failed=0').join('\n') + '\n';
        term.scrollTop = term.scrollHeight;
        const ch = H.reduce((s, h) => s + rec[h.n].ch, 0);
        a.log(ch ? 'Ansible corrigió ' + ch + ' diferencia(s) para llevar todo al estado deseado.' : '✅ <b>changed=0</b>: todo ya estaba como el playbook describe, no tocó nada. Eso es <b>idempotencia</b>: podés correrlo 100 veces sin romper nada (ideal para un cron o un pipeline de CI).', ch ? 'warn' : 'ok');
        runs++;
        if (lastChanged !== null && lastChanged > 0 && ch === 0) a.done();
        lastChanged = ch;
      }
      async function script() {
        term.textContent = '$ ./script.sh\n';
        for (const h of H) { await a.sleep(300); h.ntp.push('ntp server 10.0.0.1'); h.banner = true; term.textContent += '[' + h.n + '] echo "ntp server 10.0.0.1" >> config ... hecho\n'; draw(); }
        a.log('El script no pregunta "¿ya está?": <b>agrega de nuevo</b> cada vez. Corrélo dos veces y mirá las líneas duplicadas. (En equipos reales puede ser peor: reinicios de servicio o configs rotas.)', 'warn');
        lastChanged = null;
      }
      draw();
      a.log('Corré el playbook dos veces seguidas: la segunda debería dar changed=0.', 'info');
    }
  });

  /* =========================================================
     U13 · Nmap: SYN scan vs connect scan
     ========================================================= */
  K.add({
    id: 'nmap', at: ['u13:3'], icon: '🛰️', title: 'Nmap por dentro: open, closed y filtered',
    desc: 'Nmap deduce el estado de un puerto por <b>cómo responde</b> el objetivo: SYN/ACK = <b>open</b>, RST = <b>closed</b>, nada = <b>filtered</b> (firewall). Compará <code>-sS</code> (half-open) con <code>-sT</code> (conexión completa). Solo en tu laboratorio 😉',
    render(a) {
      a.full();
      const PORTS = [[22, 'open', 'ssh'], [23, 'closed', 'telnet'], [80, 'open', 'http'], [3389, 'filtered', 'ms-wbt-server']];
      const sel = a.select('Tipo de escaneo', [['sS', '-sS  SYN scan (half-open, requiere root)'], ['sT', '-sT  TCP connect (sin privilegios)']], 'sS');
      a.btn('▶ nmap ' + '10.10.10.5', () => a.run(go), 'go');
      const svg = a.svg(800, 300);
      const res = document.createElement('pre'); res.style.margin = '10px'; a.stage.appendChild(res);
      const seen = new Set();
      const actors = [{ id: 'k', name: '🐧 Kali (tu lab)', sub: '10.10.10.99' }, { id: 't', name: '🎯 Metasploitable', sub: '10.10.10.5', color: C.bad }];
      a.ladder(svg, actors, 4, { pad: 150 });
      async function go() {
        a.clearLog(); res.textContent = '';
        const sS = sel.value === 'sS';
        const M = [];
        PORTS.forEach(([p, st]) => {
          M.push({ f: 'k', t: 't', label: 'SYN → :' + p, color: C.acc2, lost: st === 'filtered', p, st });
          if (st === 'open') { M.push({ f: 't', t: 'k', label: 'SYN/ACK ← :' + p, color: C.acc }); if (!sS) M.push({ f: 'k', t: 't', label: 'ACK → :' + p + ' (conexión completa)', color: C.acc2 }); M.push({ f: 'k', t: 't', label: 'RST → :' + p, color: C.warn, note: sS ? 'corta antes de completar el handshake' : 'cierra la conexión' }); }
          if (st === 'closed') M.push({ f: 't', t: 'k', label: 'RST/ACK ← :' + p, color: C.bad });
          if (st === 'filtered') M.push({ f: 'k', t: 't', label: 'SYN → :' + p + ' (reintento)', color: C.acc2, lost: true, note: 'timeout: un firewall descarta en silencio' });
        });
        const lad = a.ladder(svg, actors, M.length, { pad: 150, step: 44 });
        a.log('$ sudo nmap -' + sel.value + ' -p 22,23,80,3389 10.10.10.5', 'info');
        for (const m of M) { if (!a.alive()) return; await lad.msg(m); await a.sleep(m.lost ? 600 : 150); }
        res.textContent = 'Nmap scan report for 10.10.10.5\nPORT     STATE    SERVICE\n' + PORTS.map(([p, st, sv]) => (p + '/tcp').padEnd(9) + st.padEnd(9) + sv).join('\n') +
          '\n\n' + (sS ? '# -sS no completa el handshake: más rápido y la app no registra la conexión (pero un IDS sí lo ve).' : '# -sT completa el handshake: la aplicación (ej. sshd) SÍ registra la conexión en sus logs.');
        a.log('open: respondió SYN/ACK · closed: respondió RST (el host existe, no hay servicio) · filtered: silencio → hay un firewall. ' + (sS ? 'Con -sS, Nmap manda RST en lugar del ACK final.' : 'Con -sT, se usa connect() del sistema operativo.'), 'ok');
        seen.add(sel.value); if (seen.size === 2) a.done();
      }
      a.log('Corré los dos tipos de escaneo y compará la cantidad de mensajes por puerto abierto.', 'info');
    }
  });
})();

/* NetOps Academy — Simulaciones U01–U03 (fundamentos, IP, protocolos) */
(function () {
  'use strict';
  const K = window.SimKit, C = K.C, IP = K.ip;

  /* =========================================================
     U01 · Cómo aprende MACs un switch (y comparación con hub)
     ========================================================= */
  K.add({
    id: 'mac-learning', at: ['u01:2'], icon: '🔀', title: 'Cómo aprende MACs un switch',
    desc: 'Elegí origen y destino y enviá tramas. Mirá cómo el switch <b>aprende</b> la MAC origen, <b>reenvía</b> si conoce el destino o <b>inunda</b> si no la conoce. Cambiá a modo <b>hub</b> para comparar. Se completa cuando la tabla tiene las 4 MAC.',
    render(a) {
      const s = a.svg(800, 390);
      const SW = { x: 400, y: 195 };
      const P = [
        { id: 'A', mac: '00:1A:2B:00:00:0A', port: 'Fa0/1', x: 110, y: 70 },
        { id: 'B', mac: '00:1A:2B:00:00:0B', port: 'Fa0/2', x: 690, y: 70 },
        { id: 'C', mac: '00:1A:2B:00:00:0C', port: 'Fa0/3', x: 110, y: 310 },
        { id: 'D', mac: '00:1A:2B:00:00:0D', port: 'Fa0/4', x: 690, y: 310 }];
      const gl = a.el('g', {}, s), gn = a.el('g', {}, s), gp = a.el('g', {}, s);
      P.forEach(p => {
        p.ln = a.line(gl, p.x, p.y, SW.x, SW.y);
        a.txt(gl, SW.x + (p.x - SW.x) * 0.3, SW.y + (p.y - SW.y) * 0.3 - 8, p.port, { 'text-anchor': 'middle', fill: C.acc2, class: 'mono', 'font-size': 11 });
        p.n = a.node(gn, p.x, p.y, '💻', 'PC ' + p.id, p.mac);
      });
      const sw = a.node(gn, SW.x, SW.y, '🔀', 'SW1', 'switch capa 2', { w: 110, stroke: C.acc2 });
      const stat = a.txt(s, 400, 378, '', { 'text-anchor': 'middle', fill: C.muted, 'font-size': 12 });

      let hub = false, sent = 0, copies = 0, useless = 0;
      const tbl = new Map();
      const srcSel = a.select('Origen', P.map(p => [p.id, 'PC ' + p.id]), 'A');
      const dstSel = a.select('Destino', P.map(p => [p.id, 'PC ' + p.id]).concat([['BC', 'Broadcast FF:FF:FF:FF:FF:FF']]), 'B');
      a.btn('📤 Enviar trama', () => a.run(() => send(srcSel.value, dstSel.value)), 'go');
      a.btn('🎓 Demo guiada', () => a.run(demo), 'blue go');
      a.br();
      const modeSel = a.select('Equipo', [['sw', 'Switch (capa 2)'], ['hub', 'Hub (capa 1)']], 'sw');
      a.btn('🧹 clear mac address-table', () => { tbl.clear(); table(); a.log('Tabla MAC borrada (<code>clear mac address-table dynamic</code>).', 'info'); }, 'sec');
      a.btn('⏩ Avanzar 300 s (aging)', () => {
        tbl.forEach(v => v.age += 300);
        const gone = []; tbl.forEach((v, k) => { if (v.age >= 300) { gone.push(k); tbl.delete(k); } });
        table();
        a.log(gone.length ? 'Aging: pasaron 300 s sin tráfico → se borraron ' + gone.length + ' entradas. El switch tendrá que volver a aprenderlas.' : 'Aging: no había entradas para vencer.', 'warn');
      }, 'sec');
      modeSel.onchange = () => {
        hub = modeSel.value === 'hub';
        sw.setName(hub ? 'HUB1' : 'SW1'); sw.setSub(hub ? 'hub capa 1' : 'switch capa 2');
        sent = copies = useless = 0; tbl.clear(); table(); upd();
        a.log(hub ? 'Modo HUB: repite cada trama por todos los puertos. No aprende nada.' : 'Modo SWITCH: aprende MACs y reenvía de forma inteligente.', 'info');
      };

      const tick = setInterval(() => { if (!a.alive()) return clearInterval(tick); if (!tbl.size || a.busy) return; tbl.forEach(v => v.age++); table(); }, 1000);
      function table(hl) {
        a.side.innerHTML = hub
          ? '<b>Hub: sin tabla MAC</b><p class="muted">Un hub trabaja en capa 1: repite los bits por todos los puertos. Todos los equipos comparten un único dominio de colisión (half duplex).</p>'
          : '<b>SW1# show mac address-table</b><table><tr><th>VLAN</th><th>MAC</th><th>Puerto</th><th>Edad</th></tr>' +
            (tbl.size ? [...tbl].map(([m, v]) => '<tr class="' + (m === hl ? 'flash' : '') + '"><td>1</td><td class="mono">' + m.slice(-8) + '</td><td>' + v.port + '</td><td>' + v.age + ' s</td></tr>').join('') : '<tr><td colspan="4" class="muted">(vacía)</td></tr>') +
            '</table><p class="muted">Tipo: DYNAMIC · aging-time: 300 s</p>';
      }
      function upd() { stat.textContent = 'Tramas enviadas: ' + sent + ' · copias que salieron del ' + (hub ? 'hub' : 'switch') + ': ' + copies + ' · copias innecesarias: ' + useless; }

      async function send(srcId, dstId) {
        if (srcId === dstId) { a.log('Elegí un destino distinto del origen.', 'warn'); return; }
        const sp = P.find(p => p.id === srcId);
        const bc = dstId === 'BC';
        const dmac = bc ? 'FF:FF:FF:FF:FF:FF' : P.find(p => p.id === dstId).mac;
        const lbl = srcId + ' → ' + (bc ? 'FF:FF…' : dstId);
        const col = bc ? C.warn : C.acc;
        sent++;
        a.log('<b>PC ' + srcId + '</b> envía una trama · origen <code>' + sp.mac + '</code> → destino <code>' + dmac + '</code>');
        await a.travel(gp, [[sp.x, sp.y], [SW.x, SW.y]], lbl, col);
        let outs;
        const others = P.filter(p => p !== sp);
        if (hub) {
          a.log('El hub no mira direcciones: repite la señal por <b>todos</b> los demás puertos.', 'warn');
          outs = others;
        } else {
          const prev = tbl.get(sp.mac);
          if (!prev) a.log('① <b>APRENDE</b>: la MAC <code>' + sp.mac + '</code> está detrás de <b>' + sp.port + '</b> → nueva entrada.', 'ok');
          else if (prev.port !== sp.port) a.log('① <b>ACTUALIZA</b>: la MAC se movió de ' + prev.port + ' a ' + sp.port + '.', 'ok');
          else a.log('① Ya conocía <code>' + sp.mac.slice(-5) + '</code> en ' + sp.port + ': reinicia su edad a 0 s.', 'info');
          tbl.set(sp.mac, { port: sp.port, age: 0 }); table(sp.mac);
          await sw.flash(C.acc, 500);
          if (bc) { a.log('② Destino <b>broadcast</b> → <b>INUNDA</b> (flood) por todos los puertos menos ' + sp.port + '.', 'warn'); outs = others; }
          else {
            const e = tbl.get(dmac);
            if (e && e.port === sp.port) { a.log('② El destino está en el mismo puerto de entrada → <b>FILTRA</b> (descarta).', 'info'); outs = []; }
            else if (e) { a.log('② Busca <code>' + dmac.slice(-5) + '</code> en la tabla: está en <b>' + e.port + '</b> → <b>REENVÍA</b> solo por ese puerto (forward).', 'ok'); outs = P.filter(p => p.port === e.port); }
            else { a.log('② <code>' + dmac.slice(-5) + '</code> no está en la tabla (<i>unknown unicast</i>) → <b>INUNDA</b> por todos los puertos menos ' + sp.port + '.', 'warn'); outs = others; }
          }
        }
        await Promise.all(outs.map(p => a.travel(gp, [[SW.x, SW.y], [p.x, p.y]], lbl, col)));
        copies += outs.length;
        const acc = [], drop = [];
        outs.forEach(p => { if (bc || p.id === dstId) { p.n.badge('✅'); acc.push(p.id); } else { p.n.badge('🗑️'); drop.push(p.id); useless++; } });
        if (outs.length) a.log('③ ' + (acc.length ? 'Aceptan: PC ' + acc.join(', PC ') + '. ' : '') + (drop.length ? 'Descartan (la MAC no es suya): PC ' + drop.join(', PC ') + '.' : ''), drop.length ? 'warn' : 'ok');
        upd();
        await a.sleep(1000);
        P.forEach(p => p.n.badge(''));
        if (!hub && tbl.size === 4) { a.done(); }
      }
      async function demo() {
        tbl.clear(); table(); a.clearLog();
        const steps = [['A', 'B', 'Tabla vacía. A le habla a B por primera vez.'], ['B', 'A', 'B responde. ¿Qué cambia ahora que el switch ya conoce a A?'], ['A', 'B', 'De nuevo A → B: ahora el switch conoce a B.'], ['C', 'BC', 'C manda un broadcast (como un ARP request).'], ['D', 'C', 'D le habla a C: el switch ya aprendió a C por el broadcast.']];
        for (const st of steps) {
          if (!a.alive()) return;
          a.log('<b>🎓 ' + st[2] + '</b>', 'info');
          srcSel.value = st[0]; dstSel.value = st[1];
          await send(st[0], st[1]);
          await a.sleep(600);
        }
        a.log('<b>Conclusión:</b> el switch aprende por la MAC <u>origen</u> y decide por la MAC <u>destino</u>. Probá el modo hub y compará las "copias innecesarias".', 'ok');
      }
      table(); upd();
    }
  });

  /* =========================================================
     U01 · Encapsulación paso a paso
     ========================================================= */
  K.add({
    id: 'encap', at: ['u01:1'], icon: '📦', title: 'Encapsulación y desencapsulación',
    desc: 'Seguí un pedido web <code>GET /index.html</code> bajando por las capas del emisor (cada una agrega su encabezado) y subiendo por las del receptor (cada una lo quita).',
    render(a) {
      a.full();
      const L = [['7-5', 'Aplicación', 'HTTP', 'Datos'], ['4', 'Transporte', 'TCP', 'Segmento'], ['3', 'Red', 'IP', 'Paquete'], ['2', 'Enlace', 'Ethernet', 'Trama'], ['1', 'Física', 'Señal', 'Bits']];
      const CH = {
        data: ['Datos: GET /index.html', '#cfd8ff', '#0c1430'],
        tcp: ['TCP · 51514 → 80 · seq', C.acc2, '#031326'],
        ip: ['IP · 192.168.1.10 → 93.184.216.34 · TTL 128', C.vio, '#1a0838'],
        eth: ['Eth · dst 00:AA (gateway) · src 00:1A · 0x0800', C.warn, '#2a1800'],
        fcs: ['FCS', C.warn, '#2a1800']
      };
      const steps = [
        { s: 'tx', l: 0, pdu: ['data'], t: 'El navegador genera los <b>datos</b> de aplicación (HTTP).' },
        { s: 'tx', l: 1, pdu: ['tcp', 'data'], t: 'Transporte agrega el encabezado <b>TCP</b>: puerto origen aleatorio (51514), destino 80, números de secuencia. PDU = <b>segmento</b>.' },
        { s: 'tx', l: 2, pdu: ['ip', 'tcp', 'data'], t: 'Red agrega el encabezado <b>IP</b>: IP origen y destino, TTL, protocolo 6 (TCP). PDU = <b>paquete</b>.' },
        { s: 'tx', l: 3, pdu: ['eth', 'ip', 'tcp', 'data', 'fcs'], t: 'Enlace agrega encabezado <b>Ethernet</b> (MAC destino = <u>gateway</u>, porque el servidor está en otra red) y el trailer <b>FCS</b> para detectar errores. PDU = <b>trama</b>.' },
        { s: 'tx', l: 4, pdu: 'bits', t: 'Física convierte la trama en <b>bits</b>: pulsos eléctricos (UTP), luz (fibra) u ondas (Wi-Fi).' },
        { s: 'wire', l: -1, pdu: 'bits', t: 'Los bits viajan. Cada <b>router</b> del camino desarma hasta capa 3, decide por la IP destino y arma una <b>trama nueva</b> (cambian las MAC, la IP se mantiene).' },
        { s: 'rx', l: 4, pdu: 'bits', t: 'El servidor recibe la señal y reconstruye los bits.' },
        { s: 'rx', l: 3, pdu: ['eth', 'ip', 'tcp', 'data', 'fcs'], t: 'Enlace verifica el <b>FCS</b> (si falla, descarta) y que la MAC destino sea la suya → quita Ethernet. EtherType 0x0800 = "lo de adentro es IPv4".' },
        { s: 'rx', l: 2, pdu: ['ip', 'tcp', 'data'], t: 'Red comprueba que la IP destino es la suya → quita el encabezado IP. Protocolo 6 = "entregar a TCP".' },
        { s: 'rx', l: 1, pdu: ['tcp', 'data'], t: 'Transporte mira el puerto destino <b>80</b> → entrega los datos al servidor web, en orden y sin duplicados.' },
        { s: 'rx', l: 0, pdu: ['data'], t: 'La aplicación (servidor web) procesa <code>GET /index.html</code> y responde... repitiendo todo el proceso en sentido inverso. ✅' }
      ];
      let i = 0;
      const prev = a.btn('◀ Anterior', () => { if (i > 0) { i--; draw(); } }, 'sec');
      const next = a.btn('Siguiente ▶', () => { if (i < steps.length - 1) { i++; draw(); } }, 'go');
      a.btn('▶ Reproducir todo', () => a.run(async () => { i = 0; draw(); while (i < steps.length - 1 && a.alive()) { await a.sleep(2300); i++; draw(); } }), 'blue go');
      a.noLog();
      function col(side, st) {
        return '<div class="enc-col"><div class="enc-h">' + (side === 'tx' ? '💻 Emisor (tu PC)' : '🖥️ Receptor (servidor)') + '</div>' +
          L.map((l, k) => '<div class="enc-l ' + (st.s === side && st.l === k ? 'on' : '') + '"><span class="mono">' + l[0] + '</span> ' + l[1] + ' <small>' + l[2] + '</small></div>').join('') + '</div>';
      }
      function draw() {
        const st = steps[i];
        let pdu;
        if (st.pdu === 'bits') pdu = '<div class="enc-bits mono">' + Array.from({ length: 64 }, () => (Math.random() < 0.5 ? '0' : '1')).join('') + '</div>';
        else pdu = '<div class="enc-pdu">' + st.pdu.map(k => '<span style="background:' + CH[k][1] + ';color:' + CH[k][2] + '">' + CH[k][0] + '</span>').join('') + '</div>';
        const name = st.l >= 0 ? L[st.l][3] : 'Bits en el medio';
        a.stage.innerHTML = '<div class="enc"><div class="enc-grid">' + col('tx', st) + '<div class="enc-mid"><div class="enc-dir">' + (st.s === 'tx' ? '⬇ encapsula' : st.s === 'rx' ? '⬆ desencapsula' : '〰 medio físico 〰') + '</div><div class="enc-name">PDU: <b>' + name + '</b></div>' + pdu + '</div>' + col('rx', st) + '</div>' +
          '<div class="enc-t"><b>Paso ' + (i + 1) + '/' + steps.length + '.</b> ' + st.t + '</div></div>';
        prev.disabled = i === 0; next.disabled = i === steps.length - 1;
        if (i === steps.length - 1) a.done();
      }
      draw();
    }
  });

  /* =========================================================
     U02 · Decimal ↔ Binario ↔ Hexadecimal
     ========================================================= */
  K.add({
    id: 'bases', at: ['u02:0', 'u02:4'], icon: '🔢', title: 'Decimal ↔ Binario ↔ Hexadecimal',
    desc: 'Escribí un número o <b>hacé clic en los bits</b> para prenderlos y apagarlos. Animá la conversión con el método de <b>restas</b> (tabla 128-64-32...) o de <b>divisiones por 2</b>, y mirá cómo cada grupo de <b>4 bits = 1 dígito hexa</b>. 🎯 Completá 5 desafíos de práctica.',
    render(a) {
      const HEX = '0123456789ABCDEF';
      const nbS = a.select('Bits', [[8, '8 bits (un octeto)'], [16, '16 bits (un bloque IPv6)']], 8);
      const dec = a.input('Decimal', 168, { type: 'number', min: 0, max: 255, style: 'width:90px', class: 'mono' });
      const hex = a.input('Hexa 0x', 'A8', { size: 6, class: 'mono' });
      a.br();
      const met = a.select('Método', [['resta', 'Restas (tabla de posiciones)'], ['div', 'Divisiones sucesivas por 2']], 'resta');
      a.btn('▶ Animar decimal → binario', () => a.run(anim), 'go');
      a.btn('▶ Animar binario → hexa', () => a.run(animHex), 'go blue');
      a.btn('🎯 Desafío', () => newQ(), 'sec');
      let nb = 8, val = 168, hl = {}, steps = [], q = null, okCount = 0;
      const pv = () => Array.from({ length: nb }, (_, i) => Math.pow(2, nb - 1 - i));
      const bin = v => v.toString(2).padStart(nb, '0');
      function draw() {
        const b = bin(val), P = pv();
        const sum = P.filter((p, i) => b[i] === '1');
        const nibs = b.match(/.{4}/g);
        a.stage.innerHTML = '<div class="bs' + (nb === 16 ? ' b16' : '') + '">' +
          '<div class="bs-row">' + P.map((p, i) => '<div class="bs-c ' + (hl.pos === i ? 'hl ' : '') + (i % 4 === 0 && i ? 'nib ' : '') + '"><small>2<sup>' + (nb - 1 - i) + '</sup></small><span class="pv">' + p + '</span><button class="bit ' + (b[i] === '1' ? 'on' : '') + (hl.fill && hl.fill[i] === undefined && hl.hide ? ' q' : '') + '" data-i="' + i + '">' + (hl.hide && (!hl.fill || hl.fill[i] === undefined) ? '?' : b[i]) + '</button><em>' + (b[i] === '1' && !hl.hide ? '+' + p : '') + '</em></div>').join('') + '</div>' +
          '<p class="bs-sum">' + (hl.hide ? '&nbsp;' : (sum.length ? sum.join(' + ') + ' = ' : '') + '<b>' + val + '</b><sub>10</sub> = <b class="mono">' + b.replace(/(.{4})(?=.)/g, '$1 ') + '</b><sub>2</sub> = <b class="mono">0x' + val.toString(16).toUpperCase().padStart(nb / 4, '0') + '</b>') + '</p>' +
          (hl.hide ? '' : '<div class="bs-hex">') + (hl.hide ? [] : nibs).map((n, k) => '<div class="nibx ' + (hl.nib === k ? 'hl' : '') + '"><span class="mono">' + n + '</span><small>' + [8, 4, 2, 1].filter((w, j) => n[j] === '1').join('+') + (n === '0000' ? '0' : '') + ' = ' + parseInt(n, 2) + '</small><b>' + (hl.nibHide && hl.nib !== undefined && k > hl.nib ? '?' : HEX[parseInt(n, 2)]) + '</b></div>').join('<span class="arr">·</span>') + (hl.hide ? '' : '</div>') +
          (steps.length ? '<div class="bs-steps">' + steps.map(s => '<div>' + s + '</div>').join('') + '</div>' : '') + '</div>';
        a.stage.querySelectorAll('.bit').forEach(x => x.onclick = () => { if (a.busy) return; val ^= P[+x.dataset.i]; steps = []; sync(); draw(); });
      }
      function sync() { dec.value = val; hex.value = val.toString(16).toUpperCase(); dec.classList.remove('bad'); hex.classList.remove('bad'); }
      dec.oninput = () => { const v = +dec.value; if (dec.value === '' || !Number.isInteger(v) || v < 0 || v > Math.pow(2, nb) - 1) { dec.classList.add('bad'); return; } val = v; steps = []; hex.value = v.toString(16).toUpperCase(); dec.classList.remove('bad'); draw(); };
      hex.oninput = () => { const t = hex.value.trim().replace(/^0x/i, ''); if (!/^[0-9a-f]+$/i.test(t) || parseInt(t, 16) > Math.pow(2, nb) - 1) { hex.classList.add('bad'); return; } val = parseInt(t, 16); steps = []; dec.value = val; hex.classList.remove('bad'); draw(); };
      nbS.onchange = () => { nb = +nbS.value; dec.max = Math.pow(2, nb) - 1; if (val > +dec.max) val = nb === 16 ? 0x2001 : 168; if (nb === 16 && val < 256) val = 0x2001; if (nb === 8) val = 168; steps = []; sync(); draw(); side(); };
      async function anim() {
        const P = pv(), b = bin(val); steps = []; hl = { hide: true, fill: {} };
        if (met.value === 'resta') {
          let r = val;
          steps.push('Método de restas: recorro la tabla de izquierda a derecha. ¿Entra el valor de la posición en lo que me queda?');
          for (let i = 0; i < nb; i++) {
            if (!a.alive()) return;
            hl.pos = i;
            if (r >= P[i]) { steps.push('¿' + P[i] + ' entra en ' + r + '? <b class="g">Sí</b> → bit <b>1</b> · ' + r + ' − ' + P[i] + ' = <b>' + (r - P[i]) + '</b>'); r -= P[i]; }
            else steps.push('¿' + P[i] + ' entra en ' + r + '? <span class="r">No</span> → bit <b>0</b>');
            hl.fill[i] = 1; draw(); await a.sleep(nb === 16 ? 450 : 800);
          }
          steps.push('Resto 0 → listo. Resultado: <b class="mono">' + b + '</b>');
        } else {
          let r = val; const rs = [];
          steps.push('Método de divisiones: divido por 2 y anoto el <b>resto</b>. Los restos, leídos <b>de abajo hacia arriba</b>, son el binario.');
          let i = nb - 1;
          do {
            if (!a.alive()) return;
            const q2 = Math.floor(r / 2), m = r % 2;
            hl.pos = i; hl.fill[i] = 1;
            steps.push(r + ' ÷ 2 = ' + q2 + '  resto <b>' + m + '</b>  → posición 2<sup>' + (nb - 1 - i) + '</sup>');
            rs.push(m); r = q2; i--; draw(); await a.sleep(nb === 16 ? 450 : 800);
          } while (r > 0 && i >= 0);
          for (; i >= 0; i--) hl.fill[i] = 1;
          steps.push('Leyendo los restos de abajo hacia arriba: <b class="mono">' + rs.slice().reverse().join('') + '</b> → completo con ceros a la izquierda hasta ' + nb + ' bits: <b class="mono">' + b + '</b>');
        }
        hl = {}; draw();
      }
      async function animHex() {
        const b = bin(val); steps = ['Agrupo los bits de a <b>4</b> (nibbles) desde la derecha. Cada grupo vale de 0 a 15 = un dígito hexa (0–9, A=10 … F=15).'];
        hl = { nibHide: true };
        const nibs = b.match(/.{4}/g);
        for (let k = 0; k < nibs.length; k++) {
          if (!a.alive()) return;
          hl.nib = k; const v = parseInt(nibs[k], 2);
          steps.push('<span class="mono">' + nibs[k] + '</span> → ' + ([8, 4, 2, 1].filter((w, j) => nibs[k][j] === '1').join(' + ') || '0') + ' = ' + v + ' → <b>' + HEX[v] + '</b>' + (v > 9 ? ' (porque ' + v + ' = ' + HEX[v] + ')' : ''));
          draw(); await a.sleep(1100);
        }
        steps.push('Resultado: <b class="mono">0x' + nibs.map(n => HEX[parseInt(n, 2)]).join('') + '</b>. Al revés (hexa → binario) es igual de fácil: cada dígito hexa se escribe con 4 bits.');
        hl = {}; draw();
      }
      function newQ() {
        const t = Math.floor(Math.random() * 4), v = Math.floor(Math.random() * 256);
        const Q = [['Pasá <b>' + v + '</b> a binario (8 bits)', v.toString(2).padStart(8, '0')], ['Pasá <b class="mono">' + v.toString(2).padStart(8, '0') + '</b> a decimal', String(v)], ['Pasá <b>' + v + '</b> a hexadecimal', v.toString(16).toUpperCase()], ['Pasá <b class="mono">0x' + v.toString(16).toUpperCase().padStart(2, '0') + '</b> a binario (8 bits)', v.toString(2).padStart(8, '0')]][t];
        q = { ans: Q[1], v, t };
        const qd = a.log('🎯 ' + Q[0] + ': <input class="inp bs-ans" style="width:130px;display:inline-block;padding:3px 8px"> <button class="btn sm bs-ok">Comprobar</button>', 'info');
        const inp = qd.querySelector('.bs-ans'), bt = qd.querySelector('.bs-ok');
        inp.focus();
        const chk = () => {
          if (bt.disabled) return;
          const u = inp.value.trim().toUpperCase().replace(/^0X/, '').replace(/\s/g, '');
          const good = q.t === 1 ? u === q.ans : q.t === 2 ? (/^[0-9A-F]+$/.test(u) && parseInt(u, 16) === q.v) : (/^[01]+$/.test(u) && parseInt(u, 2) === q.v);
          bt.disabled = true; inp.disabled = true;
          if (good) { okCount++; a.log('✅ ¡Correcto! (' + okCount + '/5)', 'ok'); if (okCount >= 5) { a.log('🏆 ¡5 aciertos! Ya podés leer máscaras, MACs y direcciones IPv6 sin calculadora.', 'ok'); a.done(); } }
          else a.log('❌ Era <b class="mono">' + q.ans + '</b>. Cargá ' + q.v + ' arriba y animá la conversión para ver el paso a paso.', 'bad');
        };
        bt.onclick = chk; inp.onkeydown = e => { if (e.key === 'Enter') chk(); };
      }
      function side() {
        a.side.innerHTML = '<b>Tabla 0–F</b><table class="tight"><tr><th>Dec</th><th>Bin</th><th>Hex</th><th>Dec</th><th>Bin</th><th>Hex</th></tr>' +
          Array.from({ length: 8 }, (_, i) => '<tr><td>' + i + '</td><td class="mono">' + i.toString(2).padStart(4, '0') + '</td><td><b>' + HEX[i] + '</b></td><td>' + (i + 8) + '</td><td class="mono">' + (i + 8).toString(2) + '</td><td><b>' + HEX[i + 8] + '</b></td></tr>').join('') + '</table>' +
          '<p class="muted"><b>¿Dónde lo vas a usar?</b><br>• Máscaras: 255 = 11111111, 192 = 11000000<br>• MAC: <code>00:1A:2B…</code> (12 dígitos hexa = 48 bits)<br>• IPv6: <code>2001:0db8::</code> (bloques de 16 bits = 4 hexa)<br>• Wireshark, colores web (#35E0A1), permisos chmod (octal).</p>';
      }
      sync(); draw(); side();
      a.log('Tip: los valores de posición en un octeto son <b>128 64 32 16 8 4 2 1</b>. Memorizalos: con eso convertís cualquier octeto mentalmente.', 'info');
    }
  });

  /* =========================================================
     U02 · Visualizador de máscara y subred (bits)
     ========================================================= */
  K.add({
    id: 'subnet-bits', at: ['u02:1', 'u02:2'], icon: '🧮', title: 'Visualizador de subred bit a bit',
    desc: 'Mové el control del prefijo y mirá cómo cambian los bits de <b>red</b> (azul) y de <b>host</b> (verde), la máscara, el número mágico y los bloques. Se completa al probar 6 prefijos distintos.',
    render(a) {
      a.noLog();
      const ipIn = a.input('IP', '172.16.45.130', { size: 15, class: 'mono' });
      const pr = a.input('Prefijo', 26, { type: 'range', min: 1, max: 32 });
      const pl = document.createElement('b'); pl.className = 'big'; pl.style.fontSize = '1.2rem'; a.ctl.appendChild(pl);
      const seen = new Set();
      function bits(n, p, cls) {
        const b = IP.bin(n);
        let h = '';
        for (let o = 0; o < 4; o++) {
          h += '<span class="oct">';
          for (let k = 0; k < 8; k++) { const i = o * 8 + k; h += '<i class="' + (i < p ? 'n' : 'h') + (cls || '') + '">' + b[i] + '</i>'; }
          h += '<em>' + ((n >>> (24 - 8 * o)) & 255) + '</em></span>';
        }
        return h;
      }
      function draw() {
        const p = +pr.value; pl.textContent = '/' + p;
        const ok = IP.valid(ipIn.value); ipIn.classList.toggle('bad', !ok);
        if (!ok) return;
        const n = IP.toN(ipIn.value.trim()), m = IP.mask(p), net = (n & m) >>> 0, bc = (net | (~m >>> 0)) >>> 0;
        const hosts = p >= 31 ? (p === 31 ? 2 : 1) : Math.pow(2, 32 - p) - 2;
        const io = p === 32 ? 3 : Math.floor(p / 8) - (p % 8 === 0 ? 1 : 0);
        const mo = (m >>> (24 - 8 * io)) & 255, magic = 256 - mo;
        const ioct = (n >>> (24 - 8 * io)) & 255;
        let blocks = '';
        if (magic > 1 && magic < 256) {
          const nb = 256 / magic, show = Math.min(nb, 32);
          for (let b = 0; b < show; b++) {
            const st = b * magic, on = ioct >= st && ioct < st + magic;
            blocks += '<span class="blk ' + (on ? 'on' : '') + '" title="' + st + '–' + (st + magic - 1) + '">' + st + '</span>';
          }
          if (nb > show) blocks += '<span class="muted"> … (' + nb + ' bloques)</span>';
        }
        a.stage.innerHTML = '<div class="bits">' +
          '<div class="brow"><label>IP</label>' + bits(n, p) + '</div>' +
          '<div class="brow"><label>Máscara</label>' + bits(m, p, ' m') + '</div>' +
          '<div class="brow"><label>Red (AND)</label>' + bits(net, p) + '</div>' +
          '<div class="brow"><label>Broadcast</label>' + bits(bc, p) + '</div>' +
          '<p class="muted" style="margin:8px 0 0">🟦 ' + p + ' bits de red · 🟩 ' + (32 - p) + ' bits de host → 2<sup>' + (32 - p) + '</sup> = ' + Math.pow(2, 32 - p).toLocaleString('es-AR') + ' direcciones</p>' +
          (blocks ? '<div class="blocks"><b>Número mágico</b> = 256 − ' + mo + ' = <b>' + magic + '</b> en el ' + (io + 1) + '.º octeto. Las subredes arrancan en múltiplos de ' + magic + '; la IP (' + ioct + ') cae en el bloque resaltado:<div>' + blocks + '</div></div>' : '') + '</div>';
        a.side.innerHTML = '<table>' + [['Máscara', IP.toS(m)], ['Wildcard', IP.toS(~m >>> 0)], ['Red', IP.toS(net) + '/' + p], ['Primer host', p >= 31 ? IP.toS(net) : IP.toS(net + 1)], ['Último host', p >= 31 ? IP.toS(bc) : IP.toS(bc - 1)], ['Broadcast', IP.toS(bc)], ['Hosts útiles', hosts.toLocaleString('es-AR')]].map(r => '<tr><th>' + r[0] + '</th><td class="mono">' + r[1] + '</td></tr>').join('') + '</table>' +
          '<p class="muted">' + (p === 30 ? '/30 → 2 hosts: típico de enlaces punto a punto (WAN).' : p === 31 ? '/31 → RFC 3021, enlaces P2P sin red ni broadcast.' : p === 32 ? '/32 → una sola IP (loopback, ruta de host).' : p === 24 ? '/24 → la clásica LAN de 254 hosts.' : 'Fórmula: hosts = 2<sup>bits de host</sup> − 2 (red y broadcast).') + '</p>';
        seen.add(p); if (seen.size >= 6) a.done();
      }
      pr.oninput = draw; ipIn.oninput = draw;
      draw();
    }
  });

  /* =========================================================
     U02 · VLSM: asignación animada
     ========================================================= */
  K.add({
    id: 'vlsm', at: ['u02:3'], icon: '🧩', title: 'Asignador VLSM animado',
    desc: 'Escribí la red disponible y las necesidades (<code>nombre:hosts</code>). El simulador ordena de mayor a menor, elige el bloque mínimo para cada una y las va "encajando" en el espacio de direcciones.',
    render(a) {
      const base = a.input('Red base', '192.168.10.0/24', { size: 17, class: 'mono' });
      const req = a.input('Necesidades', 'Ventas:60, Soporte:28, Gerencia:12, Wi-Fi:25, WAN1:2, WAN2:2', { size: 52 });
      a.btn('▶ Asignar', () => a.run(go), 'go');
      a.side.innerHTML = '<p class="muted">La tabla de asignación aparece acá.</p>';
      const COLS = [C.acc2, C.acc, C.vio, C.warn, C.pink, C.cyan, '#8bd450', '#ff9f68'];
      async function go() {
        a.clearLog();
        const m = base.value.trim().match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
        if (!m || !IP.valid(m[1]) || +m[2] > 30) { a.log('Formato de red base inválido. Ej: 192.168.10.0/24', 'bad'); return; }
        const bp = +m[2], bsz = Math.pow(2, 32 - bp), bnet = (IP.toN(m[1]) & IP.mask(bp)) >>> 0;
        const items = req.value.split(',').map(x => x.split(':')).filter(x => x.length === 2 && +x[1] > 0).map(x => ({ n: x[0].trim(), h: Math.floor(+x[1]) }));
        if (!items.length) { a.log('Escribí al menos una necesidad, ej: Ventas:60', 'bad'); return; }
        items.sort((x, y) => y.h - x.h);
        a.stage.innerHTML = '<div class="vbar"></div><div class="vleg muted"></div>';
        const bar = a.stage.querySelector('.vbar');
        bar.innerHTML = '<span class="vfree" style="width:100%">libre</span>';
        let cur = bnet; const rows = [];
        a.log('Ordeno de mayor a menor: ' + items.map(i => i.n + ' (' + i.h + ')').join(' → '), 'info');
        for (let k = 0; k < items.length; k++) {
          const it = items[k];
          let hb = 2; while (Math.pow(2, hb) - 2 < it.h) hb++;
          const p = 32 - hb, sz = Math.pow(2, hb);
          await a.sleep(500);
          if (cur + sz > bnet + bsz) { a.log('❌ <b>' + it.n + '</b> necesita un /' + p + ' (' + sz + ' direcciones) pero no queda espacio en ' + base.value + '. Usá una red base más grande.', 'bad'); break; }
          a.log('<b>' + it.n + '</b>: ' + it.h + ' hosts → 2<sup>' + hb + '</sup>−2 = ' + (sz - 2) + ' ≥ ' + it.h + ' → <b>/' + p + '</b> → ' + IP.toS(cur) + '/' + p, 'ok');
          rows.push([it.n, it.h, IP.toS(cur) + '/' + p, IP.toS(cur + 1) + ' – ' + IP.toS(cur + sz - 2), IP.toS(cur + sz - 1), COLS[k % COLS.length], sz]);
          cur += sz;
          paint(bar, rows, bsz);
          a.side.innerHTML = '<table><tr><th>Subred</th><th>Red</th><th>Rango útil</th><th>Bcast</th></tr>' + rows.map(r => '<tr><td><b style="color:' + r[5] + '">■</b> ' + a.esc(r[0]) + ' (' + r[1] + ')</td><td class="mono">' + r[2] + '</td><td class="mono" style="font-size:.75rem">' + r[3] + '</td><td class="mono">' + r[4].split('.').pop() + '</td></tr>').join('') + '</table>';
        }
        const used = cur - bnet;
        a.stage.querySelector('.vleg').textContent = 'Usado: ' + used + ' de ' + bsz + ' direcciones (' + Math.round(used / bsz * 100) + '%). Libre desde ' + IP.toS(cur) + ' para crecer.';
        if (rows.length === items.length && rows.length >= 3) a.done();
      }
      function paint(bar, rows, bsz) {
        const used = rows.reduce((s, r) => s + r[6], 0);
        bar.innerHTML = rows.map(r => '<span style="width:' + (r[6] / bsz * 100) + '%;background:' + r[5] + '" title="' + a.esc(r[0]) + ' ' + r[2] + '">' + (r[6] / bsz > 0.06 ? a.esc(r[0]) + '<small>' + r[2].split('/')[1].replace(/^/, '/') + '</small>' : '') + '</span>').join('') +
          (used < bsz ? '<span class="vfree" style="width:' + ((bsz - used) / bsz * 100) + '%">' + ((bsz - used) / bsz > 0.08 ? 'libre' : '') + '</span>' : '');
      }
    }
  });

  /* =========================================================
     U03 · TCP: handshake, retransmisión, cierre, UDP
     ========================================================= */
  K.add({
    id: 'tcp', at: ['u03:0'], icon: '🤝', title: 'TCP vs UDP en un diagrama de secuencia',
    desc: 'Elegí un escenario y mirá los mensajes entre cliente y servidor: el <b>3-way handshake</b>, cómo TCP <b>retransmite</b> un segmento perdido, el <b>cierre con FIN</b>, un puerto cerrado (RST) y cómo UDP simplemente envía.',
    render(a) {
      a.full();
      const SC = {
        hs: { n: 'Handshake de 3 vías', m: [
          { f: 'c', t: 's', label: 'SYN  seq=100', state: { c: 'SYN-SENT' }, note: '"Quiero conectarme al puerto 443"', log: 'El cliente elige un número de secuencia inicial (ISN = 100) y envía SYN.' },
          { f: 's', t: 'c', label: 'SYN-ACK  seq=300 ack=101', color: C.acc2, state: { s: 'SYN-RCVD' }, log: 'El servidor acepta: envía su propio ISN (300) y confirma ack = 100 + 1.' },
          { f: 'c', t: 's', label: 'ACK  ack=301', state: { c: 'ESTABLISHED', s: 'ESTABLISHED' }, log: 'El cliente confirma. Conexión <b>ESTABLISHED</b> en ambos lados: ya pueden viajar datos.' },
          { f: 'c', t: 's', label: 'DATA  seq=101 len=200', color: C.vio, log: 'Primer dato: GET / (200 bytes).' },
          { f: 's', t: 'c', label: 'ACK  ack=301', color: C.acc2, log: 'El servidor confirma: ack = 101 + 200 = 301 ("espero el byte 301").' }] },
        loss: { n: 'Pérdida y retransmisión', m: [
          { f: 'c', t: 's', label: 'DATA seq=1 len=1000', color: C.vio, log: 'Segmento 1 (bytes 1–1000).' },
          { f: 's', t: 'c', label: 'ACK ack=1001', color: C.acc2, log: 'Confirmado: espera el byte 1001.' },
          { f: 'c', t: 's', label: 'DATA seq=1001 len=1000', color: C.vio, lost: true, log: '❌ El segmento 2 se pierde (congestión, CRC, Wi-Fi...).' },
          { f: 'c', t: 's', label: 'DATA seq=2001 len=1000', color: C.vio, log: 'El 3 llega, pero falta el 2: el receptor no puede avanzar.' },
          { f: 's', t: 'c', label: 'ACK ack=1001 (dup)', color: C.warn, log: 'ACK duplicado: "sigo esperando el 1001".' },
          { f: 'c', t: 's', label: 'RETX seq=1001 len=1000', color: C.warn, state: { c: 'timeout/3 dup ACK' }, log: 'Vence el RTO (o 3 ACK duplicados → fast retransmit): TCP <b>retransmite</b> el segmento 2.' },
          { f: 's', t: 'c', label: 'ACK ack=3001', color: C.acc2, log: '✅ Ahora tiene todo: confirma hasta el byte 3000. La app recibe los datos completos y en orden.' }] },
        fin: { n: 'Cierre de conexión (FIN)', m: [
          { f: 'c', t: 's', label: 'FIN seq=500', state: { c: 'FIN-WAIT-1' }, log: 'El cliente terminó de enviar: FIN.' },
          { f: 's', t: 'c', label: 'ACK ack=501', color: C.acc2, state: { c: 'FIN-WAIT-2', s: 'CLOSE-WAIT' }, log: 'El servidor confirma, pero aún puede enviar datos pendientes (half-close).' },
          { f: 's', t: 'c', label: 'FIN seq=900', color: C.acc2, state: { s: 'LAST-ACK' }, log: 'El servidor también terminó: FIN.' },
          { f: 'c', t: 's', label: 'ACK ack=901', state: { c: 'TIME-WAIT', s: 'CLOSED' }, log: 'El cliente confirma y espera 2×MSL en TIME-WAIT por si llegan segmentos atrasados. (Muchos TIME_WAIT en <code>netstat</code> es normal en servidores.)' }] },
        rst: { n: 'Puerto cerrado (RST)', m: [
          { f: 'c', t: 's', label: 'SYN → puerto 8080', state: { c: 'SYN-SENT' }, log: 'El cliente intenta conectar a un puerto donde no escucha nadie.' },
          { f: 's', t: 'c', label: 'RST, ACK', color: C.bad, state: { c: 'CLOSED' }, log: 'El SO del servidor responde <b>RST</b>: "connection refused". Si en cambio no llega <i>nada</i>, probablemente un firewall lo filtra (timeout).' }] },
        udp: { n: 'UDP (sin conexión)', m: [
          { f: 'c', t: 's', label: 'UDP → :53 consulta DNS', color: C.warn, log: 'Sin handshake: UDP manda directamente. Encabezado de solo 8 bytes.' },
          { f: 's', t: 'c', label: 'UDP ← respuesta DNS', color: C.warn, log: 'Respuesta inmediata. Ideal para DNS, VoIP, streaming, juegos.' },
          { f: 'c', t: 's', label: 'UDP → :53 consulta 2', color: C.warn, lost: true, log: '❌ Se pierde... UDP no se entera ni retransmite.' },
          { f: 'c', t: 's', label: 'UDP → :53 (reintento de la APP)', color: C.warn, note: 'lo decide la aplicación, no UDP', log: 'Es la <b>aplicación</b> (el resolver DNS) la que decide reintentar tras su propio timeout.' },
          { f: 's', t: 'c', label: 'UDP ← respuesta', color: C.warn, log: '✅ Llegó. Menos overhead que TCP, pero sin garantías.' }] }
      };
      const sel = a.select('Escenario', Object.keys(SC).map(k => [k, SC[k].n]), 'hs');
      a.btn('▶ Reproducir', () => a.run(play), 'go');
      const svg = a.svg(800, 300);
      const seen = new Set();
      async function play() {
        a.clearLog();
        const sc = SC[sel.value];
        const lad = a.ladder(svg, [{ id: 'c', name: '💻 Cliente', sub: '192.168.1.10:51514' }, { id: 's', name: '🖥️ Servidor', sub: sel.value === 'udp' ? '8.8.8.8:53' : '93.184.216.34:443', color: C.acc }], sc.m.length);
        for (const m of sc.m) {
          if (!a.alive()) return;
          await lad.msg(m);
          a.log(m.log, m.lost ? 'bad' : '');
          await a.sleep(m.lost ? 1100 : 500);
        }
        seen.add(sel.value); if (seen.size >= 3) a.done();
      }
      a.ladder(svg, [{ id: 'c', name: '💻 Cliente', sub: '192.168.1.10' }, { id: 's', name: '🖥️ Servidor', sub: '93.184.216.34', color: C.acc }], 4);
      a.log('Elegí un escenario y tocá ▶ Reproducir. (Se completa al ver 3 escenarios.)', 'info');
    }
  });

  /* =========================================================
     U03 · ARP + ping local y remoto
     ========================================================= */
  K.add({
    id: 'arp', at: ['u03:1'], icon: '📣', title: 'ARP: de IP a MAC (ping local y remoto)',
    desc: 'Hacé ping y observá: si la caché ARP no tiene la MAC, sale un <b>ARP Request en broadcast</b> y vuelve un <b>ARP Reply unicast</b>. Si el destino está en <b>otra red</b>, la PC hace ARP por el <b>gateway</b>, no por el destino.',
    render(a) {
      const s = a.svg(800, 400);
      const SW = { x: 380, y: 200 };
      const H = [
        { id: 'PC1', ip: '192.168.1.10', mac: 'aa:10', x: 110, y: 80, ic: '💻' },
        { id: 'PC2', ip: '192.168.1.20', mac: 'aa:20', x: 110, y: 320, ic: '💻' },
        { id: 'PC3', ip: '192.168.1.30', mac: 'aa:30', x: 380, y: 340, ic: '🖨️' },
        { id: 'R1', ip: '192.168.1.1', mac: 'aa:01', x: 600, y: 200, ic: '🧭' }];
      const NET = { x: 735, y: 90 };
      const gl = a.el('g', {}, s), gn = a.el('g', {}, s), gp = a.el('g', {}, s);
      H.forEach(h => { a.line(gl, h.x, h.y, SW.x, SW.y); h.cache = new Map(); });
      a.line(gl, 600, 200, NET.x, NET.y, { 'stroke-dasharray': '6 5' });
      H.forEach(h => { h.n = a.node(gn, h.x, h.y, h.ic, h.id, h.ip + ' · ' + h.mac); });
      a.node(gn, SW.x, SW.y, '🔀', 'SW1', '', { w: 90 });
      a.node(gn, NET.x, NET.y, '☁️', 'Internet', '8.8.8.8', { w: 90 });
      const src = a.select('Desde', H.slice(0, 3).map(h => [h.id, h.id]), 'PC1');
      const dst = a.select('ping a', [['192.168.1.20', '192.168.1.20 (PC2, misma red)'], ['192.168.1.30', '192.168.1.30 (impresora)'], ['8.8.8.8', '8.8.8.8 (Internet, otra red)'], ['192.168.1.99', '192.168.1.99 (no existe)']], '192.168.1.20');
      a.btn('📡 ping', () => a.run(() => ping(src.value, dst.value)), 'go');
      a.btn('🧹 arp -d (vaciar cachés)', () => { H.forEach(h => h.cache.clear()); side(); a.log('Cachés ARP vaciadas.', 'info'); }, 'sec');
      const did = new Set();
      function side(hl) {
        a.side.innerHTML = '<b>Cachés ARP</b> <span class="muted">(arp -a)</span>' + H.map(h => '<div style="margin-top:6px"><b>' + h.id + '</b><table>' + (h.cache.size ? [...h.cache].map(([i, m]) => '<tr class="' + (hl === h.id + i ? 'flash' : '') + '"><td class="mono">' + i + '</td><td class="mono">' + m + '</td></tr>').join('') : '<tr><td class="muted">(vacía)</td></tr>') + '</table></div>').join('');
      }
      const pos = h => [h.x, h.y];
      async function ping(sid, dip) {
        const sp = H.find(h => h.id === sid);
        if (dip === sp.ip) { a.log('Ese es tu propio equipo 🙂', 'warn'); return; }
        const local = dip.startsWith('192.168.1.');
        a.log('<b>' + sid + '</b> quiere hacer <code>ping ' + dip + '</code>. Compara con su máscara /24: ' + (local ? 'el destino está en <b>mi misma red</b> → necesito la MAC del destino.' : 'el destino está en <b>otra red</b> → se lo mando al <b>gateway 192.168.1.1</b>: necesito la MAC del <u>gateway</u>.'), 'info');
        const tip = local ? dip : '192.168.1.1';
        const tgt = H.find(h => h.ip === tip);
        if (sp.cache.has(tip)) { a.log('La caché ARP ya tiene ' + tip + ' → ' + sp.cache.get(tip) + '. No hace falta preguntar. ✅', 'ok'); await sp.n.flash(C.acc, 400); }
        else {
          a.log('Caché sin ' + tip + ' → <b>ARP Request</b> en broadcast: "¿Quién tiene ' + tip + '? Decíselo a ' + sp.ip + '" (MAC destino FF:FF:FF:FF:FF:FF).', 'warn');
          await a.travel(gp, [pos(sp), [SW.x, SW.y]], 'ARP ¿' + tip.split('.').pop() + '?', C.warn);
          const others = H.filter(h => h !== sp);
          await Promise.all(others.map(h => a.travel(gp, [[SW.x, SW.y], pos(h)], 'ARP ¿' + tip.split('.').pop() + '?', C.warn)));
          others.forEach(h => h.n.badge(h === tgt ? '🙋' : '🙈'));
          if (!tgt) {
            await a.sleep(900); others.forEach(h => h.n.badge(''));
            a.log('Todos reciben el broadcast, pero nadie tiene ' + dip + ' → no hay respuesta. Windows mostrará <i>"Host de destino inaccesible"</i> o <i>"Tiempo de espera agotado"</i>. ❌', 'bad');
            return;
          }
          a.log('Todos lo reciben (es broadcast) pero solo ' + tgt.id + ' responde. De paso, ' + tgt.id + ' <b>anota</b> la MAC de ' + sid + ' en su caché.', '');
          tgt.cache.set(sp.ip, sp.mac); side(tgt.id + sp.ip);
          await a.sleep(700); others.forEach(h => h.n.badge(''));
          await a.travel(gp, [pos(tgt), [SW.x, SW.y], pos(sp)], 'ARP Reply ' + tgt.mac, C.acc2);
          sp.cache.set(tip, tgt.mac); side(sid + tip);
          a.log('<b>ARP Reply</b> (unicast): "' + tip + ' está en ' + tgt.mac + '". ' + sid + ' lo guarda en caché.', 'ok');
        }
        const path = [pos(sp), [SW.x, SW.y], pos(tgt)];
        await a.travel(gp, path, 'ICMP Echo → ' + dip, C.acc);
        if (!local) { await a.travel(gp, [pos(tgt), [NET.x, NET.y]], 'ICMP Echo', C.acc); a.log('R1 recibe la trama (MAC destino = la suya), mira la IP destino 8.8.8.8 y la rutea hacia Internet con una trama nueva.', ''); await a.travel(gp, [[NET.x, NET.y], pos(tgt)], 'Echo Reply', C.acc2); }
        await a.travel(gp, path.slice().reverse(), 'Echo Reply', C.acc2);
        a.log('✅ <code>Respuesta desde ' + dip + ': bytes=32 tiempo=' + (local ? '<1' : '18') + 'ms TTL=' + (local ? 128 : 117) + '</code>', 'ok');
        did.add(local ? 'l' : 'r'); if (did.size === 2) a.done();
      }
      side();
      a.log('Tip: hacé el mismo ping dos veces. La segunda no necesita ARP. Después probá 8.8.8.8 y mirá a quién le pregunta.', 'info');
    }
  });

  /* =========================================================
     U03 · Traceroute (TTL)
     ========================================================= */
  K.add({
    id: 'traceroute', at: ['u03:1'], icon: '🧵', title: 'Traceroute: cómo usa el TTL',
    desc: 'Traceroute envía paquetes con <b>TTL = 1, 2, 3...</b>. Cada router resta 1 y, cuando llega a 0, lo descarta y avisa con <b>ICMP Time Exceeded</b>: así se descubre cada salto. Activá el firewall de R2 para ver los famosos <code>* * *</code>.',
    render(a) {
      const s = a.svg(800, 250);
      const N = [
        { n: 'Tu PC', ip: '192.168.1.10', ic: '💻', x: 60 }, { n: 'R1 (gateway)', ip: '192.168.1.1', ic: '🧭', x: 210, ms: 1 },
        { n: 'R2 (ISP)', ip: '200.45.10.1', ic: '🧭', x: 360, ms: 9 }, { n: 'R3 (IXP)', ip: '181.30.1.17', ic: '🧭', x: 510, ms: 14 },
        { n: 'dns.google', ip: '8.8.8.8', ic: '🖥️', x: 680, ms: 18 }];
      const Y = 110;
      const gl = a.el('g', {}, s), gn = a.el('g', {}, s), gp = a.el('g', {}, s);
      for (let i = 0; i < N.length - 1; i++) a.line(gl, N[i].x, Y, N[i + 1].x, Y);
      N.forEach(h => { h.nd = a.node(gn, h.x, Y, h.ic, h.n, h.ip, { w: 80 }); });
      const fw = document.createElement('label'); fw.className = 'sim-fld'; fw.innerHTML = '<input type="checkbox"> <span>R2 no responde ICMP</span>'; a.ctl.appendChild(fw);
      const chk = fw.querySelector('input');
      a.btn('▶ tracert 8.8.8.8', () => a.run(go), 'go');
      a.side.innerHTML = '<pre class="mono" style="margin:0">C:\\&gt; tracert 8.8.8.8</pre>';
      let out = [];
      const show = () => { a.side.innerHTML = '<pre style="margin:0;font-size:.78rem">C:\\&gt; tracert -d 8.8.8.8\n\n' + out.join('\n') + '</pre>'; };
      async function go() {
        out = []; show(); a.clearLog();
        for (let ttl = 1; ttl < N.length; ttl++) {
          if (!a.alive()) return;
          a.log('Envío un paquete con <b>TTL=' + ttl + '</b>.', 'info');
          const g = a.pkt(gp, 'TTL=' + ttl, C.acc).at(N[0].x, Y - 2);
          let t = ttl, i = 0;
          while (true) {
            await a.moveTo(g, N[i + 1].x, Y - 2);
            i++;
            if (i === N.length - 1) break;
            t--; g.setLabel('TTL=' + t);
            if (t === 0) break;
          }
          const h = N[i];
          const silent = chk.checked && i === 2;
          if (i === N.length - 1) {
            g.remove(); h.nd.badge('✅');
            a.log('Llegó al destino: responde <b>ICMP Echo Reply</b>. Fin del traceroute.', 'ok');
            await a.travel(gp, N.slice(0, i + 1).reverse().map(n => [n.x, Y + 2]), 'Echo Reply', C.acc2);
            out.push('  ' + ttl + '    ' + h.ms + ' ms   ' + (h.ms + 1) + ' ms   ' + h.ms + ' ms  ' + h.ip);
            out.push('\nTraza completa.'); show(); h.nd.badge('');
            a.done();
            break;
          }
          g.setColor(C.bad); h.nd.badge('💀'); await a.sleep(500); g.remove();
          if (silent) {
            a.log('TTL llegó a 0 en <b>' + h.n + '</b>, pero su firewall no envía ICMP Time Exceeded → timeout. Que un salto muestre <code>* * *</code> NO significa que el camino esté cortado (el resto sigue respondiendo).', 'warn');
            await a.sleep(1300);
            out.push('  ' + ttl + '     *        *        *     Tiempo de espera agotado para esta solicitud.');
          } else {
            a.log('TTL llegó a 0 en <b>' + h.n + '</b>: descarta el paquete y avisa con <b>ICMP Time Exceeded</b> desde ' + h.ip + '. ¡Descubrimos el salto ' + ttl + '!', 'warn');
            await a.travel(gp, N.slice(0, i + 1).reverse().map(n => [n.x, Y + 2]), 'Time Exceeded', C.warn);
            out.push('  ' + ttl + '    ' + h.ms + ' ms   ' + (h.ms + 1) + ' ms   ' + h.ms + ' ms  ' + h.ip);
          }
          show(); h.nd.badge('');
        }
      }
      show();
    }
  });

  /* =========================================================
     U03 · DHCP DORA
     ========================================================= */
  K.add({
    id: 'dhcp', at: ['u03:2'], icon: '🏷️', title: 'DHCP: proceso DORA',
    desc: 'Una PC recién conectada no tiene IP. Mirá cómo la obtiene con <b>Discover → Offer → Request → ACK</b>, qué pasa si no hay servidor DHCP (APIPA 169.254.x.x) y cómo se renueva el lease.',
    render(a) {
      const SC = {
        dora: { n: 'Conexión normal (DORA)', m: [
          { f: 'c', t: 's', label: 'DISCOVER  0.0.0.0:68 → 255.255.255.255:67', color: C.warn, state: { c: 'sin IP' }, log: '<b>D</b>iscover en broadcast: la PC todavía no tiene IP, así que usa origen 0.0.0.0 y destino 255.255.255.255.', cfg: {} },
          { f: 's', t: 'c', label: 'OFFER  te ofrezco 192.168.1.50', color: C.acc2, log: '<b>O</b>ffer: el servidor reserva 192.168.1.50 y ofrece también máscara, gateway, DNS y tiempo de lease.', cfg: { ip: '192.168.1.50 (ofrecida)' } },
          { f: 'c', t: 's', label: 'REQUEST  quiero 192.168.1.50', color: C.warn, log: '<b>R</b>equest (otra vez broadcast): avisa a TODOS los servidores DHCP cuál oferta acepta, así los demás liberan las suyas.', cfg: { ip: '192.168.1.50 (solicitada)' } },
          { f: 's', t: 'c', label: 'ACK  lease 8 h · gw .1 · dns 8.8.8.8', color: C.acc, state: { c: 'BOUND' }, log: '<b>A</b>CK: confirmado. La PC configura su interfaz. ✅', cfg: { ip: '192.168.1.50', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', lease: '8 h' } }] },
        none: { n: 'Sin servidor DHCP (APIPA)', m: [
          { f: 'c', t: 's', label: 'DISCOVER', color: C.warn, lost: true, state: { c: 'sin IP' }, log: 'Discover... nadie responde (servidor caído, cable de la VLAN equivocada, falta <code>ip helper-address</code>...).', cfg: {} },
          { f: 'c', t: 's', label: 'DISCOVER (reintento)', color: C.warn, lost: true, log: 'Reintenta con tiempos crecientes.', cfg: {} },
          { f: 'c', t: 's', label: 'DISCOVER (reintento)', color: C.warn, lost: true, state: { c: 'APIPA' }, log: 'Se rinde: Windows se autoasigna una IP <b>APIPA 169.254.x.x</b>. Solo sirve para hablar con otros APIPA: <b>sin Internet</b>.', cfg: { ip: '169.254.37.112', mask: '255.255.0.0', gw: '(ninguno)', dns: '(ninguno)' } }] },
        renew: { n: 'Renovación del lease (T1 = 50%)', m: [
          { f: 'c', t: 's', label: 'REQUEST (unicast) renovar .50', color: C.warn, state: { c: 'RENEWING' }, log: 'Al 50% del lease (4 h de 8 h) la PC pide renovar directamente al servidor, en <b>unicast</b>.', cfg: { ip: '192.168.1.50', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', lease: '4 h restantes' } },
          { f: 's', t: 'c', label: 'ACK  lease 8 h', color: C.acc, state: { c: 'BOUND' }, log: 'ACK: lease renovado, misma IP. El usuario ni se entera. (Con <code>ipconfig /renew</code> lo forzás.)', cfg: { ip: '192.168.1.50', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', lease: '8 h' } }] }
      };
      const sel = a.select('Escenario', Object.keys(SC).map(k => [k, SC[k].n]), 'dora');
      a.btn('▶ Reproducir', () => a.run(play), 'go');
      const svg = a.svg(800, 300);
      const lad0 = () => a.ladder(svg, [{ id: 'c', name: '💻 Cliente DHCP', sub: 'MAC 00:1A:2B:3C:4D:5E' }, { id: 's', name: '🗄️ Servidor DHCP', sub: '192.168.1.1', color: C.acc }], 4, { pad: 140 });
      lad0();
      function cfg(c) {
        a.side.innerHTML = '<b>C:\\&gt; ipconfig /all</b><table>' + [['IPv4', c.ip], ['Máscara', c.mask], ['Gateway', c.gw], ['DNS', c.dns], ['Lease', c.lease]].map(r => '<tr><th>' + r[0] + '</th><td class="mono">' + (r[1] || '—') + '</td></tr>').join('') + '</table>' +
          (c.ip && c.ip.startsWith('169.254') ? '<p class="warn" style="margin:6px 0">169.254.x.x = APIPA → el problema es DHCP, no "Internet".</p>' : '');
      }
      const seen = new Set();
      async function play() {
        a.clearLog();
        const sc = SC[sel.value];
        const lad = a.ladder(svg, [{ id: 'c', name: '💻 Cliente DHCP', sub: 'MAC 00:1A:2B:3C:4D:5E' }, { id: 's', name: '🗄️ Servidor DHCP', sub: sel.value === 'none' ? '(no hay)' : '192.168.1.1', color: sel.value === 'none' ? C.bad : C.acc }], sc.m.length, { pad: 140 });
        cfg(sc.m[0].cfg.ip ? sc.m[0].cfg : {});
        for (const m of sc.m) {
          if (!a.alive()) return;
          await lad.msg(m);
          a.log(m.log, m.lost ? 'warn' : '');
          cfg(m.cfg);
          await a.sleep(m.lost ? 900 : 500);
        }
        seen.add(sel.value); if (seen.has('dora') && seen.size >= 2) a.done();
      }
      cfg({});
    }
  });

  /* =========================================================
     U03 · DNS recursivo + caché
     ========================================================= */
  K.add({
    id: 'dns', at: ['u03:3'], icon: '📖', title: 'DNS: resolución recursiva y caché',
    desc: 'Tu PC le pregunta a su resolver; el resolver recorre <b>raíz → TLD → autoritativo</b> y guarda la respuesta en <b>caché</b> durante el TTL. Resolvé el mismo nombre dos veces y compará.',
    render(a) {
      a.full();
      const D = { 'www.ejemplo.com': '93.184.216.34', 'mail.ejemplo.com': '93.184.216.40', 'campus.unrc.edu.ar': '170.210.80.12', 'www.netflix.com': '54.155.178.5' };
      const sel = a.select('Nombre', Object.keys(D), 'www.ejemplo.com');
      a.btn('🔎 nslookup', () => a.run(go), 'go');
      a.btn('🧹 Vaciar caché del resolver', () => { cache.clear(); a.log('Caché vaciada.', 'info'); paintCache(); }, 'sec');
      const cbox = document.createElement('div'); cbox.className = 'sim-cache'; a.ctl.appendChild(cbox);
      const svg = a.svg(800, 300);
      const cache = new Map();
      let hits = 0, full = 0;
      function paintCache() { cbox.innerHTML = '🗃️ Caché: ' + (cache.size ? [...cache].map(([k, v]) => '<span class="mono">' + k + ' (TTL ' + v.ttl + ' s)</span>').join(' · ') : '<span class="muted">vacía</span>'); }
      const tick = setInterval(() => { if (!a.alive()) return clearInterval(tick); cache.forEach((v, k) => { v.ttl--; if (v.ttl <= 0) cache.delete(k); }); paintCache(); }, 1000);
      const actors = name => {
        const parts = name.split('.'); const tld = parts.slice(-1)[0], dom = parts.slice(-2).join('.');
        const sld = name.endsWith('.edu.ar') ? 'unrc.edu.ar' : dom;
        return [{ id: 'pc', name: '💻 Tu PC', sub: 'stub resolver' }, { id: 'r', name: '🧠 Resolver', sub: '8.8.8.8 / DNS ISP', color: C.acc }, { id: 'root', name: '🌍 Raíz "."', sub: '13 clusters a–m', color: C.vio }, { id: 'tld', name: '🏛️ TLD .' + tld, sub: 'servidores .' + tld, color: C.warn }, { id: 'auth', name: '📕 Autoritativo', sub: 'ns1.' + sld, color: C.pink }];
      };
      async function go() {
        a.clearLog();
        const name = sel.value, ip = D[name];
        const ac = actors(name);
        const tld = '.' + name.split('.').pop(), auth = ac[4].sub;
        if (cache.has(name)) {
          const lad = a.ladder(svg, ac, 2, { pad: 80 });
          await lad.msg({ f: 'pc', t: 'r', label: 'A? ' + name, color: C.acc2 });
          a.log('El resolver encuentra <b>' + name + '</b> en su caché (le quedan ' + cache.get(name).ttl + ' s de TTL). ¡No pregunta a nadie más!', 'ok');
          await lad.msg({ f: 'r', t: 'pc', label: name + ' = ' + ip + ' (caché)', color: C.acc });
          a.log('Respuesta <b>no autoritativa</b> en ~1 ms. Por eso, tras cambiar un registro DNS, algunos usuarios siguen viendo la IP vieja hasta que vence el TTL.', 'info');
          hits++;
        } else {
          const lad = a.ladder(svg, ac, 8, { pad: 80 });
          const M = [
            { f: 'pc', t: 'r', label: 'A? ' + name, color: C.acc2, log: 'Tu PC le pregunta a su resolver configurado (consulta <b>recursiva</b>: "traeme la respuesta final").' },
            { f: 'r', t: 'root', label: 'A? ' + name, log: 'El resolver no lo tiene en caché: empieza por un servidor <b>raíz</b>.' },
            { f: 'root', t: 'r', label: 'andá a ' + tld, color: C.vio, log: 'La raíz no sabe la IP, pero sabe quién maneja <b>' + tld + '</b> (referral).' },
            { f: 'r', t: 'tld', label: 'A? ' + name, log: 'Consulta <b>iterativa</b> al TLD.' },
            { f: 'tld', t: 'r', label: 'andá a ' + auth, color: C.warn, log: 'El TLD responde con los NS del dominio (registros NS + glue).' },
            { f: 'r', t: 'auth', label: 'A? ' + name, log: 'Pregunta al servidor <b>autoritativo</b> del dominio.' },
            { f: 'auth', t: 'r', label: 'A ' + ip + ' TTL 30', color: C.pink, log: 'Respuesta autoritativa: registro <b>A</b> con TTL (acá 30 s para que veas cómo vence).' },
            { f: 'r', t: 'pc', label: name + ' = ' + ip, color: C.acc, log: 'El resolver guarda en caché y le contesta a tu PC. ✅' }];
          for (const m of M) { if (!a.alive()) return; await lad.msg(m); a.log(m.log); await a.sleep(350); }
          cache.set(name, { ip, ttl: 30 }); paintCache(); full++;
        }
        if (full >= 1 && hits >= 1) a.done();
      }
      a.ladder(svg, actors('www.ejemplo.com'), 4, { pad: 80 });
      paintCache();
      a.log('Resolvé un nombre, y después volvé a resolverlo antes de que venza el TTL (30 s).', 'info');
    }
  });

  /* =========================================================
     U03 · NAT / PAT
     ========================================================= */
  K.add({
    id: 'nat-pat', at: ['u03:4', 'u05:4'], icon: '🎭', title: 'NAT/PAT: muchas IP privadas, una pública',
    desc: 'Cada PC privada abre una conexión. El router reemplaza IP:puerto origen por <b>su IP pública + un puerto único</b> y lo anota en la <b>tabla NAT</b>. Con esa tabla sabe a quién devolver cada respuesta. También probá un paquete entrante "no solicitado".',
    render(a) {
      const s = a.svg(800, 380);
      const R = { x: 400, y: 190 }, NET = { x: 560, y: 190 };
      const H = [{ id: 'PC1', ip: '192.168.1.10', x: 90, y: 70 }, { id: 'PC2', ip: '192.168.1.11', x: 90, y: 190 }, { id: 'PC3', ip: '192.168.1.12', x: 90, y: 310 }];
      const SV = [{ id: 'web', n: 'google.com', ip: '142.250.79.14', port: 443, x: 715, y: 80, ic: '🌐' }, { id: 'dns', n: 'dns.google', ip: '8.8.8.8', port: 53, x: 715, y: 300, ic: '🖥️' }];
      const PUB = '200.45.10.1';
      const gl = a.el('g', {}, s), gn = a.el('g', {}, s), gp = a.el('g', {}, s);
      H.forEach(h => a.line(gl, h.x, h.y, R.x, R.y));
      a.line(gl, R.x, R.y, NET.x, NET.y); SV.forEach(v => a.line(gl, NET.x, NET.y, v.x, v.y));
      a.txt(gl, 235, 30, 'RED PRIVADA (inside)', { 'text-anchor': 'middle', fill: C.acc, 'font-weight': 700 });
      a.txt(gl, 640, 30, 'INTERNET (outside)', { 'text-anchor': 'middle', fill: C.warn, 'font-weight': 700 });
      a.el('line', { x1: 470, y1: 20, x2: 470, y2: 370, stroke: C.line, 'stroke-dasharray': '3 6' }, gl);
      H.forEach(h => { h.n = a.node(gn, h.x, h.y, '💻', h.id, h.ip); });
      const rn = a.node(gn, R.x, R.y, '🧭', 'R1 (NAT)', 'pública ' + PUB, { w: 96, stroke: C.acc2 });
      a.node(gn, NET.x, NET.y, '☁️', '', '', { w: 70, h: 46 });
      SV.forEach(v => a.node(gn, v.x, v.y, v.ic, v.n, v.ip + ':' + v.port));
      const hs = a.select('Desde', H.map(h => [h.id, h.id + ' ' + h.ip]), 'PC1');
      const ds = a.select('Hacia', SV.map(v => [v.id, v.n + ' :' + v.port]), 'web');
      a.btn('🔗 Abrir conexión', () => a.run(() => conn(hs.value, ds.value)), 'go');
      a.btn('🚫 Paquete entrante no solicitado', () => a.run(unsolicited), 'sec');
      const tbl = []; let nextPort = 1024;
      function side(hl) {
        a.side.innerHTML = '<b>R1# show ip nat translations</b><table class="tight"><tr><th>Inside local</th><th>Inside global</th><th>Outside</th></tr>' +
          (tbl.length ? tbl.map((r, i) => '<tr class="' + (i === hl ? 'flash' : '') + '"><td class="mono">' + r.il + '</td><td class="mono">' + r.ig + '</td><td class="mono">' + r.out + '</td></tr>').join('') : '<tr><td colspan="3" class="muted">(vacía)</td></tr>') + '</table><p class="muted">PAT = NAT overload: el <b>puerto</b> distingue cada sesión. Una sola IP pública soporta ~64.000 sesiones simultáneas.</p>';
      }
      async function conn(hid, sid) {
        const h = H.find(x => x.id === hid), v = SV.find(x => x.id === sid);
        const sp = 49152 + Math.floor(Math.random() * 15000);
        const il = h.ip + ':' + sp, ig = PUB + ':' + (nextPort++), out = v.ip + ':' + v.port;
        a.log('<b>' + hid + '</b> abre una conexión a ' + v.n + '. Paquete: <code>' + il + ' → ' + out + '</code>');
        const g = a.pkt(gp, 'src ' + il, C.acc).at(h.x, h.y);
        await a.moveTo(g, R.x, R.y);
        await rn.flash(C.warn, 300);
        g.setLabel('src ' + ig); g.setColor(C.warn);
        tbl.push({ il, ig, out }); side(tbl.length - 1);
        a.log('R1 <b>traduce</b> el origen: <code>' + il + '</code> → <code>' + ig + '</code> y lo anota en la tabla NAT.', 'warn');
        await a.moveTo(g, NET.x, NET.y); await a.moveTo(g, v.x, v.y); g.remove();
        a.log(v.n + ' ve que el pedido viene de <b>' + PUB + '</b>: no conoce tu IP privada.', '');
        const r = a.pkt(gp, 'dst ' + ig, C.warn).at(v.x, v.y);
        await a.moveTo(r, NET.x, NET.y); await a.moveTo(r, R.x, R.y);
        await rn.flash(C.acc, 300);
        r.setLabel('dst ' + il); r.setColor(C.acc);
        side(tbl.length - 1);
        a.log('La respuesta llega a <code>' + ig + '</code>. R1 busca ese puerto en la tabla → corresponde a <b>' + il + '</b> y reescribe el destino.', 'ok');
        await a.moveTo(r, h.x, h.y); r.remove();
        h.n.badge('✅'); await a.sleep(600); h.n.badge('');
        if (tbl.length >= 3) a.done();
      }
      async function unsolicited() {
        a.log('Un equipo de Internet envía un paquete a <code>' + PUB + ':3389</code> (RDP) sin que nadie de adentro lo haya pedido.', 'warn');
        const g = a.pkt(gp, 'dst ' + PUB + ':3389', C.bad).at(SV[0].x, SV[0].y);
        await a.moveTo(g, NET.x, NET.y); await a.moveTo(g, R.x + 40, R.y);
        rn.badge('⛔'); await a.sleep(700); g.remove(); rn.badge('');
        a.log('R1 no tiene ninguna entrada para el puerto 3389 → <b>no sabe a quién entregarlo y lo descarta</b>. Por eso un servidor interno necesita <b>NAT estático / port forwarding</b> para ser accesible desde afuera.', 'bad');
      }
      side();
    }
  });
})();

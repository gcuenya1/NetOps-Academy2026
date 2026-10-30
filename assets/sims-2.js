/* NetOps Academy — Simulaciones U04–U05 (switching y routing) */
(function () {
  'use strict';
  const K = window.SimKit, C = K.C, IP = K.ip;
  const VC = { 1: '#9aa6d1', 10: C.acc2, 20: C.warn, 30: C.vio };

  /* =========================================================
     U04 · VLANs y trunk 802.1Q
     ========================================================= */
  K.add({
    id: 'vlan-trunk', at: ['u04:1', 'u04:2'], icon: '🏷️', title: 'VLANs y trunk 802.1Q',
    desc: 'Dos switches unidos por un <b>trunk</b>. Enviá broadcasts y unicasts y mirá cómo cada trama queda <b>dentro de su VLAN</b>, cómo se <b>etiqueta</b> al cruzar el trunk y qué pasa con la VLAN nativa. <b>Hacé clic en una PC</b> para cambiarle la VLAN.',
    render(a) {
      const s = a.svg(800, 400);
      const S1 = { x: 270, y: 190, id: 'SW1' }, S2 = { x: 530, y: 190, id: 'SW2' };
      const P = [
        { id: 'A', sw: S1, v: 10, x: 80, y: 70, port: 'Fa0/1' }, { id: 'B', sw: S1, v: 20, x: 80, y: 310, port: 'Fa0/2' }, { id: 'E', sw: S1, v: 10, x: 270, y: 345, port: 'Fa0/3' },
        { id: 'C', sw: S2, v: 10, x: 720, y: 70, port: 'Fa0/1' }, { id: 'D', sw: S2, v: 20, x: 720, y: 310, port: 'Fa0/2' }, { id: 'F', sw: S2, v: 20, x: 530, y: 345, port: 'Fa0/3' }];
      const gl = a.el('g', {}, s), gn = a.el('g', {}, s), gp = a.el('g', {}, s);
      P.forEach(p => { p.ln = a.line(gl, p.x, p.y, p.sw.x, p.sw.y, { 'stroke-width': 4 }); });
      a.line(gl, S1.x, S1.y, S2.x, S2.y, { 'stroke-width': 9, stroke: '#4a5aa0' });
      a.txt(gl, 400, 172, 'TRUNK 802.1Q (Gi0/1)', { 'text-anchor': 'middle', fill: C.text, 'font-weight': 700 });
      const trunkInfo = a.txt(gl, 400, 148, '', { 'text-anchor': 'middle', class: 'mono', 'font-size': 11 });
      P.forEach(p => {
        p.n = a.node(gn, p.x, p.y, '💻', 'PC ' + p.id, '');
        p.n.g.style.cursor = 'pointer';
        p.n.g.onclick = () => { if (a.busy) return; p.v = p.v === 10 ? 20 : p.v === 20 ? 30 : 10; paint(); a.log('PC ' + p.id + ' (' + p.sw.id + ' ' + p.port + ') ahora es <code>switchport access vlan ' + p.v + '</code>.', 'info'); };
      });
      S1.n = a.node(gn, S1.x, S1.y, '🔀', 'SW1', '', { w: 96 }); S2.n = a.node(gn, S2.x, S2.y, '🔀', 'SW2', '', { w: 96 });
      const src = a.select('Origen', P.map(p => [p.id, 'PC ' + p.id]), 'A');
      const dst = a.select('Destino', [['BC', 'Broadcast']].concat(P.map(p => [p.id, 'PC ' + p.id])), 'BC');
      a.btn('📤 Enviar', () => a.run(() => send(src.value, dst.value)), 'go');
      a.br();
      const al = document.createElement('span'); al.className = 'sim-fld'; al.innerHTML = '<span>allowed vlan</span>' + [10, 20, 30].map(v => '<label style="display:inline-flex;gap:3px;align-items:center"><input type="checkbox" value="' + v + '" checked>' + v + '</label>').join(' ');
      a.ctl.appendChild(al);
      const n1 = a.select('nativa SW1', [1, 10, 20], 1), n2 = a.select('nativa SW2', [1, 10, 20], 1);
      const allowed = () => [...al.querySelectorAll('input')].filter(i => i.checked).map(i => +i.value);
      [n1, n2].forEach(x => x.onchange = () => { paint(); if (n1.value !== n2.value) a.log('⚠️ <b>Native VLAN mismatch</b>: SW1 usa nativa ' + n1.value + ' y SW2 usa ' + n2.value + '. CDP mostraría <i>%CDP-4-NATIVE_VLAN_MISMATCH</i>. Enviá tráfico de la VLAN ' + n1.value + ' y mirá qué pasa.', 'bad'); });
      al.onchange = paint;
      const flags = {};
      function paint() {
        P.forEach(p => { p.ln.setAttribute('stroke', VC[p.v]); p.n.setSub('VLAN ' + p.v + ' · ' + p.port); p.n.stroke(VC[p.v]); });
        trunkInfo.textContent = 'allowed ' + allowed().join(',') + ' · native ' + n1.value + (n1.value !== n2.value ? ' ≠ ' + n2.value + ' ⚠' : '');
        trunkInfo.setAttribute('fill', n1.value !== n2.value ? C.bad : C.muted);
        a.side.innerHTML = '<b>show vlan brief</b>' + [S1, S2].map(sw => '<div style="margin-top:6px"><b>' + sw.id + '</b><table><tr><th>VLAN</th><th>Puertos</th></tr>' + [10, 20, 30].map(v => '<tr><td style="color:' + VC[v] + '">' + v + '</td><td>' + (P.filter(p => p.sw === sw && p.v === v).map(p => p.port + ' (' + p.id + ')').join(', ') || '—') + '</td></tr>').join('') + '</table></div>').join('') +
          '<p class="muted">Cada VLAN = un dominio de broadcast = una subred IP distinta.</p>';
      }
      const pos = o => [o.x, o.y];
      async function send(sid, did) {
        const sp = P.find(p => p.id === sid);
        if (sid === did) { a.log('Elegí otro destino.', 'warn'); return; }
        const v = sp.v, bc = did === 'BC';
        const dp = bc ? null : P.find(p => p.id === did);
        const col = VC[v];
        a.log('<b>PC ' + sid + '</b> (VLAN ' + v + ') envía ' + (bc ? 'un <b>broadcast</b>' : 'una trama a <b>PC ' + did + '</b> (VLAN ' + dp.v + ')') + '.');
        if (dp && dp.v !== v) { a.log('PC ' + did + ' está en <b>otra VLAN</b> = otra red. A nivel 2 es como si estuvieran en switches distintos: la trama nunca le llegará. Para comunicarlas hace falta un <b>router o switch capa 3</b> (inter-VLAN routing, unidad 5).', 'warn'); flags.cross = 1; }
        const lbl = 'VLAN ' + v;
        await a.travel(gp, [pos(sp), pos(sp.sw)], lbl, col);
        const other = sp.sw === S1 ? S2 : S1;
        const nOut = +(sp.sw === S1 ? n1.value : n2.value), nIn = +(sp.sw === S1 ? n2.value : n1.value);
        // destinos locales
        const want = p => p !== sp && (bc || (dp && p === dp && p.v === v));
        const localT = P.filter(p => p.sw === sp.sw && p.v === v && want(p));
        const localFlood = (!bc && dp && dp.v !== v) ? P.filter(p => p.sw === sp.sw && p.v === v && p !== sp) : [];
        const needTrunk = bc || (dp && dp.sw !== sp.sw) || (dp && dp.v !== v);
        const jobs = localT.concat(localFlood).map(p => a.travel(gp, [pos(sp.sw), pos(p)], lbl, col).then(() => { p.n.badge(p === dp || bc ? '✅' : '🗑️'); }));
        let crossed = null;
        if (needTrunk) {
          jobs.push((async () => {
            if (allowed().indexOf(v) < 0) {
              const g = a.pkt(gp, lbl, col).at(sp.sw.x, sp.sw.y);
              await a.moveTo(g, (S1.x + S2.x) / 2 + (sp.sw === S1 ? -40 : 40), S1.y);
              g.setColor(C.bad); await a.sleep(500); g.remove();
              a.log('La VLAN ' + v + ' <b>no está permitida</b> en el trunk (<code>switchport trunk allowed vlan</code>) → la trama no cruza.', 'bad');
              flags.allowed = 1;
              return;
            }
            const tagged = v !== nOut;
            const tl = tagged ? '802.1Q tag ' + v : 'sin tag (nativa)';
            a.log('Sale por el trunk ' + (tagged ? 'con <b>etiqueta 802.1Q VLAN ' + v + '</b> (4 bytes, VLAN ID de 12 bits).' : '<b>sin etiqueta</b> porque ' + v + ' es la VLAN nativa de ' + sp.sw.id + '.'), 'info');
            await a.travel(gp, [pos(sp.sw), pos(other)], tl, tagged ? col : '#cfd8ff');
            const vin = tagged ? v : nIn;
            if (!tagged && vin !== v) { a.log('💥 ' + other.id + ' recibe una trama sin tag y la mete en <b>SU</b> nativa (VLAN ' + vin + '). ¡El tráfico de la VLAN ' + v + ' <b>se filtró</b> a la VLAN ' + vin + '! Por eso la nativa debe coincidir (y conviene usar una VLAN nativa sin usuarios, ej. 999).', 'bad'); flags.mismatch = 1; }
            else if (tagged) { a.log(other.id + ' lee la etiqueta, la quita y entrega solo en puertos de la VLAN ' + v + ' (los puertos de acceso nunca ven el tag).', 'ok'); flags.tag = 1; }
            crossed = vin;
            const rem = P.filter(p => p.sw === other && p.v === vin && (bc || (dp && dp.v !== v) || p === dp || (!tagged && vin !== v)));
            await Promise.all(rem.map(p => a.travel(gp, [pos(other), pos(p)], 'VLAN ' + vin, VC[vin]).then(() => p.n.badge(p === dp || bc ? (p.v === v ? '✅' : '😱') : '🗑️'))));
          })());
        }
        await Promise.all(jobs);
        if (bc) {
          a.log('Broadcast recibido solo por la VLAN ' + v + '. Las PCs de otras VLAN no se enteraron: <b>VLAN = dominio de broadcast</b>.', 'ok');
          flags.bc = 1;
        }
        await a.sleep(1100);
        P.forEach(p => p.n.badge(''));
        if (flags.bc && flags.tag && (flags.cross || flags.allowed || flags.mismatch)) a.done();
      }
      paint();
      a.log('Probá: 1) broadcast desde A · 2) A → C (cruza el trunk etiquetada) · 3) A → D (otra VLAN) · 4) quitá la VLAN 10 del trunk · 5) poné nativas distintas.', 'info');
    }
  });

  /* =========================================================
     U04 · Spanning Tree
     ========================================================= */
  K.add({
    id: 'stp', at: ['u04:3'], icon: '🌳', title: 'Spanning Tree en acción',
    desc: 'STP elige un <b>Root Bridge</b> (menor prioridad + MAC), un <b>Root Port</b> por switch (menor costo al root) y un <b>Designated Port</b> por enlace; el resto se <b>bloquea</b>. Cambiá prioridades en la tabla, hacé <b>clic en un enlace</b> para cambiar su velocidad o cortarlo, y probá qué pasa <b>sin STP</b>.',
    render(a) {
      const s = a.svg(800, 420);
      const SW = [
        { id: 'SW1', mac: '00d0.97aa.0003', prio: 32768, x: 190, y: 85 }, { id: 'SW2', mac: '00d0.97aa.0004', prio: 32768, x: 610, y: 85 },
        { id: 'SW3', mac: '00d0.97aa.0001', prio: 32768, x: 190, y: 330 }, { id: 'SW4', mac: '00d0.97aa.0002', prio: 32768, x: 610, y: 330 }];
      const LK = [[0, 1], [0, 2], [1, 3], [2, 3], [1, 2]].map(([u, v]) => ({ u, v, st: 'g' }));
      const CO = { g: 4, f: 19 };
      SW.forEach(w => { w.ports = []; });
      LK.forEach((l, i) => { l.pu = SW[l.u].ports.push(i); l.pv = SW[l.v].ports.push(i); });
      const gl = a.el('g', {}, s), gm = a.el('g', {}, s), gn = a.el('g', {}, s), gp = a.el('g', {}, s);
      LK.forEach((l, i) => {
        const A = SW[l.u], B = SW[l.v];
        l.ln = a.line(gl, A.x, A.y, B.x, B.y, { 'stroke-width': 5 });
        l.hit = a.line(gl, A.x, A.y, B.x, B.y, { 'stroke-width': 26, stroke: 'transparent', style: 'cursor:pointer' });
        const mx = (A.x + B.x) / 2 + (l.u === 1 && l.v === 2 ? 40 : 0), my = (A.y + B.y) / 2 + (A.y === B.y ? -10 : 0);
        l.lab = a.txt(gl, mx + (A.x === B.x ? 10 : 0), my, '', { 'text-anchor': A.x === B.x ? 'start' : 'middle', 'font-size': 11.5, fill: C.text, class: 'mono', style: 'cursor:pointer' });
        const cyc = () => { if (a.busy) return; l.st = l.st === 'g' ? 'f' : l.st === 'f' ? 'down' : 'g'; a.log('Enlace ' + A.id + '–' + B.id + ': ' + (l.st === 'down' ? '<b>CAÍDO</b>' : l.st === 'g' ? '1 Gbps (costo 4)' : '100 Mbps (costo 19)'), l.st === 'down' ? 'bad' : 'info'); if (l.st === 'down') flags.down = 1; a.run(() => recalc(true)); };
        l.hit.onclick = cyc; l.lab.onclick = cyc;
        l.mk = [0, 1].map(() => { const g = a.el('g', {}, gm); a.el('circle', { r: 13, fill: C.card2, 'stroke-width': 2 }, g); a.el('text', { y: 4, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 800 }, g, ''); return g; });
      });
      SW.forEach(w => { w.n = a.node(gn, w.x, w.y, '🔀', w.id, '', { w: 92 }); });
      const crown = SW.map(w => a.el('text', { x: w.x - 46, y: w.y - 30, 'font-size': 22 }, gn, ''));
      const stormTxt = a.txt(s, 400, 412, '', { 'text-anchor': 'middle', fill: C.bad, 'font-weight': 800, 'font-size': 14 });
      a.btn('🔁 Recalcular (enviar BPDUs)', () => a.run(() => recalc(true)), 'go');
      a.btn('💥 Ver qué pasa SIN STP', () => a.run(storm), 'sec');
      a.btn('↺ Reiniciar', () => a.run(async () => { SW.forEach(w => w.prio = 32768); LK.forEach(l => l.st = 'g'); a.clearLog(); await recalc(true); }), 'sec');
      const flags = {};
      let R = null, firstRoot = null;
      const bidLt = (x, y) => x.prio !== y.prio ? x.prio < y.prio : x.mac < y.mac;
      const cost = l => CO[l.st];
      function compute() {
        const up = LK.filter(l => l.st !== 'down');
        const comp = SW.map(() => -1); let c = 0;
        SW.forEach((w, i) => { if (comp[i] >= 0) return; const st = [i]; comp[i] = c; while (st.length) { const x = st.pop(); up.forEach(l => { const o = l.u === x ? l.v : l.v === x ? l.u : -1; if (o >= 0 && comp[o] < 0) { comp[o] = c; st.push(o); } }); } c++; });
        const root = SW.map(() => false), dist = SW.map(() => Infinity), rp = SW.map(() => null);
        for (let k = 0; k < c; k++) {
          let r = -1; SW.forEach((w, i) => { if (comp[i] === k && (r < 0 || bidLt(w, SW[r]))) r = i; });
          root[r] = true; dist[r] = 0;
          const vis = new Set();
          while (true) {
            let x = -1; SW.forEach((w, i) => { if (comp[i] === k && !vis.has(i) && dist[i] < Infinity && (x < 0 || dist[i] < dist[x])) x = i; });
            if (x < 0) break; vis.add(x);
            up.forEach(l => { const o = l.u === x ? l.v : l.v === x ? l.u : -1; if (o >= 0 && dist[x] + cost(l) < dist[o]) dist[o] = dist[x] + cost(l); });
          }
        }
        SW.forEach((w, i) => {
          if (root[i]) return;
          let best = null;
          up.forEach((l, li) => {
            const me = l.u === i ? 'u' : l.v === i ? 'v' : null; if (!me) return;
            const o = me === 'u' ? l.v : l.u;
            const cand = { l, c: dist[o] + cost(l), nb: SW[o], np: me === 'u' ? l.pv : l.pu };
            if (!best || cand.c < best.c || (cand.c === best.c && (bidLt(cand.nb, best.nb) || (cand.nb === best.nb && cand.np < best.np)))) best = cand;
          });
          rp[i] = best ? best.l : null;
        });
        const role = new Map();
        up.forEach(l => {
          const A = SW[l.u], B = SW[l.v];
          const aWins = dist[l.u] !== dist[l.v] ? dist[l.u] < dist[l.v] : bidLt(A, B);
          const d = aWins ? 'u' : 'v', o = aWins ? 'v' : 'u', oi = aWins ? l.v : l.u;
          role.set(l, { [d]: 'DP', [o]: rp[oi] === l ? 'RP' : 'BLK' });
        });
        return { root, dist, rp, role, up };
      }
      function draw() {
        LK.forEach(l => {
          const A = SW[l.u], B = SW[l.v], r = R.role.get(l);
          const blk = r && (r.u === 'BLK' || r.v === 'BLK');
          l.ln.setAttribute('stroke', l.st === 'down' ? '#3a2030' : blk ? '#6b4a2a' : (r && (r.u === 'RP' || r.v === 'RP')) ? C.acc : '#3a4a86');
          l.ln.setAttribute('stroke-dasharray', l.st === 'down' ? '2 9' : blk ? '10 7' : '');
          l.lab.textContent = l.st === 'down' ? '✖ caído' : (l.st === 'g' ? '1G' : '100M') + ' · costo ' + cost(l);
          l.lab.setAttribute('fill', l.st === 'down' ? C.bad : C.text);
          ['u', 'v'].forEach((side, k) => {
            const me = side === 'u' ? A : B, ot = side === 'u' ? B : A, g = l.mk[k];
            const f = A.x === B.x ? 0.37 : A.y === B.y ? 0.2 : 0.17;
            g.setAttribute('transform', 'translate(' + (me.x + (ot.x - me.x) * f) + ',' + (me.y + (ot.y - me.y) * f + (A.y === B.y ? 0 : 0)) + ')');
            const ro = r ? r[side] : null;
            g.style.display = ro ? '' : 'none';
            if (!ro) return;
            const col = ro === 'RP' ? C.acc : ro === 'DP' ? C.acc2 : C.bad;
            g.querySelector('circle').setAttribute('stroke', col);
            const t = g.querySelector('text'); t.textContent = ro; t.setAttribute('fill', col);
          });
        });
        SW.forEach((w, i) => { crown[i].textContent = R.root[i] ? '👑' : ''; w.n.setSub((w.prio + 1) + ' · ' + w.mac.slice(-4)); w.n.stroke(R.root[i] ? C.warn : null); });
        a.side.innerHTML = '<b>Bridge ID = prioridad + MAC</b><table><tr><th>SW</th><th>Prioridad</th><th>MAC</th><th>Costo</th><th>RP</th></tr>' + SW.map((w, i) => '<tr><td>' + (R.root[i] ? '👑 ' : '') + w.id + '</td><td><select data-i="' + i + '" class="mini">' + [0, 4096, 8192, 16384, 24576, 28672, 32768, 61440].map(p => '<option ' + (p === w.prio ? 'selected' : '') + '>' + p + '</option>').join('') + '</select></td><td class="mono">…' + w.mac.slice(-4) + '</td><td>' + (R.dist[i] === Infinity ? '—' : R.dist[i]) + '</td><td class="mono">' + (R.rp[i] ? 'Gi0/' + (R.rp[i].u === i ? R.rp[i].pu : R.rp[i].pv) : (R.root[i] ? 'root' : '—')) + '</td></tr>').join('') + '</table>' +
          '<p class="muted"><b style="color:' + C.acc + '">RP</b> root port · <b style="color:' + C.acc2 + '">DP</b> designated · <b style="color:' + C.bad + '">BLK</b> bloqueado (alternate). La prioridad va en saltos de 4096; se muestra +1 por el extended system ID (VLAN 1).</p>';
        a.side.querySelectorAll('select').forEach(sl => sl.onchange = () => { if (a.busy) { draw(); return; } const w = SW[+sl.dataset.i]; w.prio = +sl.value; a.log(w.id + ': <code>spanning-tree vlan 1 priority ' + w.prio + '</code>', 'info'); a.run(() => recalc(true)); });
      }
      async function recalc(anim) {
        const old = R;
        R = compute();
        if (anim) {
          const rootIdx = R.root.map((r, i) => r ? i : -1).filter(i => i >= 0);
          a.log('Los switches intercambian <b>BPDUs</b> (cada 2 s). Cada uno compara Bridge IDs y costos...', '');
          await Promise.all(R.up.map(l => { const r = R.role.get(l); const from = r.u === 'DP' ? SW[l.u] : SW[l.v], to = r.u === 'DP' ? SW[l.v] : SW[l.u]; return a.travel(gp, [[from.x, from.y], [to.x, to.y]], 'BPDU', C.vio, { fs: 10 }); }));
          rootIdx.forEach(i => { a.log('👑 Root Bridge: <b>' + SW[i].id + '</b> (prioridad ' + SW[i].prio + ', MAC ' + SW[i].mac + '). ' + (SW.every(w => w.prio === SW[i].prio) ? 'Todas las prioridades empatan → gana la <b>MAC más baja</b>. ¡Ojo: suele ser el switch más viejo!' : 'Gana por tener la <b>prioridad más baja</b>.'), 'ok'); });
          if (firstRoot === null) firstRoot = rootIdx[0]; else if (rootIdx[0] !== firstRoot) flags.root = 1;
          if (old) {
            LK.forEach(l => { ['u', 'v'].forEach(side => { const o = old.role.get(l), n = R.role.get(l); const ro = o ? o[side] : null, rn = n ? n[side] : null; if (ro !== rn && rn && ro) { const w = SW[side === 'u' ? l.u : l.v], p = side === 'u' ? l.pu : l.pv; a.log(w.id + ' Gi0/' + p + ': ' + ro + ' → <b>' + rn + '</b>' + (ro === 'BLK' ? ' (pasa a forwarding: el enlace redundante entra en servicio)' : rn === 'BLK' ? ' (se bloquea para evitar el bucle)' : ''), rn === 'BLK' ? 'warn' : 'ok'); } }); });
          }
          const blk = [...R.role.values()].reduce((n, r) => n + (r.u === 'BLK') + (r.v === 'BLK'), 0);
          a.log('Resultado: ' + blk + ' puerto(s) bloqueado(s) → topología sin bucles (un árbol). ' + (R.root.filter(Boolean).length > 1 ? '⚠️ La red quedó partida en dos: cada parte eligió su propio root.' : ''), blk ? 'info' : 'ok');
        }
        draw();
        if (flags.root && flags.down) a.done();
      }
      async function storm() {
        a.log('💥 Simulamos switches <b>sin STP</b>: todos los puertos reenvían. Una PC manda <b>un solo</b> broadcast (ej. ARP)...', 'bad');
        LK.forEach(l => { l.mk.forEach(g => g.style.display = 'none'); if (l.st !== 'down') { l.ln.setAttribute('stroke', C.bad); l.ln.setAttribute('stroke-dasharray', ''); } });
        crown.forEach(c => c.textContent = '');
        let n = 1;
        const up = LK.filter(l => l.st !== 'down');
        for (let r = 0; r < 7 && a.alive(); r++) {
          n = Math.round(n * 2.6 + up.length);
          stormTxt.textContent = '🌪️ Tormenta de broadcast: ' + n.toLocaleString('es-AR') + ' tramas/s · CPU switches ' + Math.min(100, 20 + r * 14) + '% · MAC flapping';
          const k = Math.min(up.length * 2, 4 + r * 2);
          await Promise.all(Array.from({ length: k }, (_, j) => { const l = up[j % up.length], f = j % 2 ? SW[l.u] : SW[l.v], t = j % 2 ? SW[l.v] : SW[l.u]; return a.travel(gp, [[f.x, f.y], [t.x, t.y]], 'BC', C.bad, { ms: 380 }); }));
        }
        a.log('Las tramas Ethernet <b>no tienen TTL</b>: dan vueltas para siempre y se multiplican. Resultado: red caída, CPU al 100% y la tabla MAC cambiando sin parar (<i>%SW_MATM-4-MACFLAP_NOTIF</i>). Por eso STP existe. Reactivamos STP...', 'bad');
        await a.sleep(1500);
        stormTxt.textContent = '';
        await recalc(true);
      }
      R = compute(); firstRoot = R.root.indexOf(true); draw();
      a.log('Todas las prioridades son 32768. ¿Quién será root? Tocá "Recalcular". Después: hacé que SW1 sea root y cortá un enlace. (Se completa con ambas cosas.)', 'info');
    }
  });

  /* =========================================================
     U05 · Tabla de ruteo: longest prefix match
     ========================================================= */
  K.add({
    id: 'lpm', at: ['u05:0'], icon: '🎯', title: 'Longest prefix match en la tabla de ruteo',
    desc: 'El router compara la IP destino contra <b>cada ruta</b> (AND con la máscara) y, entre las que coinciden, elige la <b>más específica</b> (prefijo más largo). Probá distintas IP.',
    render(a) {
      a.full();
      const RT = [
        { c: 'S*', p: '0.0.0.0/0', ad: '[1/0]', via: 'via 200.1.1.1', ifc: 'Gi0/2' },
        { c: 'S', p: '10.0.0.0/8', ad: '[1/0]', via: 'via 10.0.12.2', ifc: 'Gi0/1' },
        { c: 'O', p: '10.1.0.0/16', ad: '[110/20]', via: 'via 10.0.13.3', ifc: 'Gi0/3' },
        { c: 'O', p: '10.1.5.0/24', ad: '[110/30]', via: 'via 10.0.12.2', ifc: 'Gi0/1' },
        { c: 'S', p: '10.1.5.77/32', ad: '[1/0]', via: 'via 10.0.14.4', ifc: 'Gi0/4' },
        { c: 'C', p: '192.168.1.0/24', ad: '', via: 'is directly connected', ifc: 'Gi0/0' }];
      const ip = a.input('IP destino', '10.1.5.9', { size: 15, class: 'mono' });
      a.btn('🔎 Buscar ruta', () => a.run(() => look(ip.value.trim())), 'go');
      ['10.1.5.77', '10.1.5.9', '10.1.200.1', '10.99.0.1', '192.168.1.40', '8.8.8.8'].forEach(x => a.btn(x, () => { ip.value = x; a.run(() => look(x)); }, 'sec'));
      const seen = new Set();
      function draw(st, win) {
        a.stage.innerHTML = '<div style="padding:10px 12px"><pre style="margin:0 0 6px">R1# show ip route</pre><table class="rt"><tr><th></th><th>Prefijo</th><th>AD/métrica</th><th>Siguiente salto</th><th>Interfaz</th><th>IP destino AND máscara</th><th></th></tr>' +
          RT.map((r, i) => { const x = st[i] || {}; return '<tr class="' + (x.cls || '') + (win === i ? ' win' : '') + '"><td><b>' + r.c + '</b></td><td class="mono">' + r.p + '</td><td class="mono">' + r.ad + '</td><td class="mono">' + r.via + '</td><td class="mono">' + r.ifc + '</td><td class="mono">' + (x.and || '') + '</td><td>' + (x.mark || '') + '</td></tr>'; }).join('') + '</table></div>';
      }
      async function look(d) {
        if (!IP.valid(d)) { a.log('IP inválida.', 'bad'); return; }
        a.clearLog();
        const n = IP.toN(d), st = [];
        a.log('Paquete hacia <b>' + d + '</b>. El router revisa todas las rutas:', 'info');
        let best = -1, bp = -1;
        for (let i = 0; i < RT.length; i++) {
          if (!a.alive()) return;
          const [net, p] = RT[i].p.split('/'); const m = IP.mask(+p);
          const and = IP.toS((n & m) >>> 0);
          const ok = and === net;
          st[i] = { cls: 'chk', and: and + (ok ? ' = ' : ' ≠ ') + net };
          draw(st, -1);
          await a.sleep(550);
          st[i] = { cls: ok ? 'm' : 'nm', and: st[i].and, mark: ok ? '✔ /' + p : '✖' };
          if (ok && +p > bp) { bp = +p; best = i; }
          draw(st, -1);
        }
        await a.sleep(400);
        draw(st, best);
        const r = RT[best], cands = st.filter(x => x.cls === 'm').length;
        a.log('Coinciden <b>' + cands + '</b> ruta(s). Gana la de prefijo más largo: <b>' + r.p + '</b> → ' + (r.c === 'C' ? 'red directamente conectada: entrega por ARP en ' + r.ifc : 'reenvía ' + r.via + ' por ' + r.ifc) + '.', 'ok');
        if (best === 0) a.log('Solo coincidió la <b>ruta por defecto</b> (/0): "si no sé dónde queda, lo mando al ISP". Sin ella, el router descartaría el paquete y respondería ICMP <i>Destination unreachable</i>.', 'warn');
        if (cands >= 3) a.log('Ojo: aunque la /8 y la /16 también sirven, el router siempre prefiere la más específica, sin importar la AD (la AD solo desempata rutas al <u>mismo</u> prefijo).', 'info');
        seen.add(r.p); if (seen.size >= 4) a.done();
      }
      draw([], -1);
      a.log('Tocá las IP de ejemplo. Se completa al obtener 4 rutas ganadoras distintas.', 'info');
    }
  });

  /* =========================================================
     U05 · OSPF: algoritmo SPF (Dijkstra)
     ========================================================= */
  K.add({
    id: 'ospf-spf', at: ['u05:3'], icon: '🧠', title: 'OSPF por dentro: el algoritmo SPF (Dijkstra)',
    desc: 'Cada router OSPF tiene el mapa completo (LSDB) y calcula el <b>camino de menor costo</b> a cada red. Mirá el algoritmo paso a paso. <b>Clic en un costo</b> para cambiarlo (o tirar el enlace) y volvé a correr SPF.',
    render(a) {
      const s = a.svg(800, 400);
      const R = [{ id: 'R1', x: 80, y: 200 }, { id: 'R2', x: 270, y: 75 }, { id: 'R3', x: 270, y: 325 }, { id: 'R4', x: 520, y: 75 }, { id: 'R5', x: 520, y: 325 }, { id: 'R6', x: 715, y: 200 }];
      const E = [[0, 1, 10], [0, 2, 1], [1, 2, 2], [1, 3, 1], [2, 4, 20], [3, 4, 1], [3, 5, 10], [4, 5, 1]].map(([u, v, c]) => ({ u, v, c }));
      const CY = [1, 2, 5, 10, 20, 50, 0];
      const gl = a.el('g', {}, s), gn = a.el('g', {}, s), gp = a.el('g', {}, s);
      E.forEach(e => {
        const A = R[e.u], B = R[e.v];
        e.ln = a.line(gl, A.x, A.y, B.x, B.y, { 'stroke-width': 4 });
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        const g = a.el('g', { style: 'cursor:pointer' }, gl);
        a.el('rect', { x: mx - 17, y: my - 12, width: 34, height: 22, rx: 6, fill: C.bg, stroke: C.line }, g);
        e.t = a.el('text', { x: mx, y: my + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: C.warn, class: 'mono' }, g, '');
        g.onclick = () => { if (a.busy) return; e.c = CY[(CY.indexOf(e.c) + 1) % CY.length]; paint(); a.log('Costo ' + A.id + '–' + B.id + ' = ' + (e.c || '✖ (enlace caído)'), 'info'); };
      });
      R.forEach(r => { r.n = a.node(gn, r.x, r.y, '🧭', r.id, '', { w: 70, h: 48 }); r.d = a.el('text', { x: r.x + 38, y: r.y - 26, 'font-size': 13, 'font-weight': 800, fill: C.acc, class: 'mono' }, gn, ''); });
      const org = a.select('Router origen', R.map((r, i) => [i, r.id]), 0);
      a.btn('▶ Ejecutar SPF', () => a.run(spf), 'go');
      let runs = 0;
      function paint() { E.forEach(e => { e.t.textContent = e.c || '✖'; e.ln.setAttribute('stroke', e.c ? '#3a4a86' : '#3a2030'); e.ln.setAttribute('stroke-dasharray', e.c ? '' : '3 8'); e.ln.setAttribute('stroke-width', 4); }); R.forEach(r => { r.d.textContent = ''; r.n.stroke(null); }); }
      async function spf() {
        paint(); a.clearLog();
        const o = +org.value, n = R.length;
        const dist = R.map(() => Infinity), prev = R.map(() => -1), via = R.map(() => null), vis = R.map(() => false);
        dist[o] = 0;
        const show = () => R.forEach((r, i) => { r.d.textContent = dist[i] === Infinity ? '∞' : dist[i]; });
        show(); R[o].n.stroke(C.warn);
        a.log('Inicio: costo a ' + R[o].id + ' = 0, al resto = ∞.', 'info');
        side();
        for (let it = 0; it < n; it++) {
          if (!a.alive()) return;
          let x = -1; for (let i = 0; i < n; i++) if (!vis[i] && dist[i] < Infinity && (x < 0 || dist[i] < dist[x])) x = i;
          if (x < 0) break;
          vis[x] = true; R[x].n.stroke(C.acc);
          if (prev[x] >= 0) { const e = E.find(e => (e.u === x && e.v === prev[x]) || (e.v === x && e.u === prev[x])); e.ln.setAttribute('stroke', C.acc); e.ln.setAttribute('stroke-width', 7); }
          a.log('Tomo el no visitado de menor costo: <b>' + R[x].id + '</b> (' + dist[x] + '). Ya es definitivo.', 'ok');
          await a.sleep(650);
          for (const e of E) {
            if (!e.c) continue;
            const y = e.u === x ? e.v : e.v === x ? e.u : -1;
            if (y < 0 || vis[y]) continue;
            const A = R[x], B = R[y];
            await a.travel(gp, [[A.x, A.y], [B.x, B.y]], '+' + e.c, C.vio, { ms: 450 });
            const nd = dist[x] + e.c;
            if (nd < dist[y]) {
              a.log('&nbsp;&nbsp;' + R[y].id + ': ' + (dist[y] === Infinity ? '∞' : dist[y]) + ' → <b>' + nd + '</b> (vía ' + R[x].id + ')', '');
              dist[y] = nd; prev[y] = x; via[y] = x === o ? y : via[x];
              show(); side(dist, via);
            } else a.log('&nbsp;&nbsp;' + R[y].id + ': ' + nd + ' no mejora ' + dist[y] + '.', 'muted');
          }
        }
        side(dist, via);
        const un = R.filter((r, i) => dist[i] === Infinity).map(r => r.id);
        a.log('SPF terminado: el árbol verde es el <b>shortest path tree</b> de ' + R[o].id + '. ' + (un.length ? 'Inalcanzables: ' + un.join(', ') : 'Esas rutas se instalan en la tabla como "O" con AD 110.'), 'ok');
        runs++; if (runs >= 2) a.done();
      }
      function side(dist, via) {
        const o = +org.value;
        a.side.innerHTML = '<b>' + R[o].id + '# show ip route ospf</b><table><tr><th>Destino</th><th>Costo</th><th>Next hop</th></tr>' + R.map((r, i) => i === o ? '' : '<tr><td>' + r.id + '</td><td class="mono">' + (dist && dist[i] < Infinity ? dist[i] : '∞') + '</td><td>' + (via && via[i] !== null ? R[via[i]].id : '—') + '</td></tr>').join('') + '</table><p class="muted">Costo OSPF = 100 Mbps / ancho de banda (por defecto). Por eso conviene <code>auto-cost reference-bandwidth 10000</code> en redes de 1–10 G.</p>';
      }
      paint(); side();
      a.log('Corré SPF desde R1. Después cambiá un costo (ej. R4–R5 a ✖) y volvé a correrlo. (Se completa con 2 ejecuciones.)', 'info');
    }
  });

  /* =========================================================
     U05 · ACL extendida: evaluación de arriba hacia abajo
     ========================================================= */
  K.add({
    id: 'acl', at: ['u05:4'], icon: '🚦', title: 'Evaluador de ACL extendida',
    desc: 'Las ACL se leen <b>de arriba hacia abajo</b> y se aplica la <b>primera coincidencia</b>; al final hay un <b>deny any implícito</b>. 🎯 <b>Desafío:</b> la PC 192.168.10.66 debería estar bloqueada por completo, pero sigue navegando. Reordená las líneas con ↑↓ para arreglarlo.',
    render(a) {
      a.full();
      const any = { ip: '0.0.0.0', wc: '255.255.255.255' };
      const ACL = [
        { act: 'permit', pr: 'tcp', s: { ip: '192.168.10.0', wc: '0.0.0.255' }, d: any, port: 443 },
        { act: 'deny', pr: 'tcp', s: { ip: '192.168.10.0', wc: '0.0.0.255' }, d: { ip: '10.0.0.5', wc: '0.0.0.0' }, port: 22 },
        { act: 'permit', pr: 'udp', s: any, d: any, port: 53 },
        { act: 'deny', pr: 'ip', s: { ip: '192.168.10.66', wc: '0.0.0.0' }, d: any, port: null },
        { act: 'permit', pr: 'icmp', s: any, d: any, port: null },
        { act: 'permit', pr: 'tcp', s: { ip: '192.168.10.0', wc: '0.0.0.255' }, d: { ip: '10.0.0.5', wc: '0.0.0.0' }, port: 22 }];
      const PRE = [
        ['Ventas → web HTTPS', '192.168.10.20', '142.250.79.14', 'tcp', 443],
        ['Ventas → SSH al servidor', '192.168.10.20', '10.0.0.5', 'tcp', 22],
        ['.66 (bloqueada) → web', '192.168.10.66', '142.250.79.14', 'tcp', 443],
        ['Cualquiera → DNS', '192.168.10.30', '8.8.8.8', 'udp', 53],
        ['Ping', '192.168.10.20', '10.0.0.5', 'icmp', ''],
        ['Ventas → RDP', '192.168.10.20', '10.0.0.5', 'tcp', 3389]];
      const pre = a.select('Paquete de prueba', PRE.map((p, i) => [i, p[0]]), 2);
      a.br();
      const fs = a.input('IP origen', PRE[2][1], { size: 13, class: 'mono' }), fd = a.input('IP destino', PRE[2][2], { size: 13, class: 'mono' });
      const fp = a.select('Protocolo', ['tcp', 'udp', 'icmp', 'ip'], 'tcp'), fport = a.input('Puerto dst', 443, { size: 5, class: 'mono' });
      a.btn('▶ Evaluar', () => a.run(evalPkt), 'go');
      pre.onchange = () => { const p = PRE[+pre.value]; fs.value = p[1]; fd.value = p[2]; fp.value = p[3]; fport.value = p[4]; };
      const host = (x) => x.wc === '255.255.255.255' ? 'any' : x.wc === '0.0.0.0' ? 'host ' + x.ip : x.ip + ' ' + x.wc;
      const txtL = r => r.act + ' ' + r.pr + ' ' + host(r.s) + ' ' + host(r.d) + (r.port ? ' eq ' + r.port : '');
      const mt = (ip, x) => { const w = IP.toN(x.wc); return ((IP.toN(ip) & ~w) >>> 0) === ((IP.toN(x.ip) & ~w) >>> 0); };
      let hl = {};
      function draw() {
        a.stage.innerHTML = '<div style="padding:10px 12px"><pre style="margin:0 0 6px">ip access-list extended FILTRO-VENTAS   ! aplicada: interface Gi0/0.10 in</pre><div class="acl">' +
          ACL.map((r, i) => '<div class="al ' + (hl[i] || '') + '"><span class="mono sq">' + ((i + 1) * 10) + '</span><span class="mono" style="color:' + (r.act === 'permit' ? C.acc : C.bad) + '">' + txtL(r) + '</span><span class="res">' + (hl['r' + i] || '') + '</span><span class="mv"><button data-u="' + i + '" ' + (i ? '' : 'disabled') + '>↑</button><button data-d="' + i + '" ' + (i < ACL.length - 1 ? '' : 'disabled') + '>↓</button></span></div>').join('') +
          '<div class="al ' + (hl.imp || '') + '"><span class="mono sq">∞</span><span class="mono muted">deny ip any any   (implícito, no se ve)</span><span class="res">' + (hl.rimp || '') + '</span></div></div></div>';
        a.stage.querySelectorAll('[data-u]').forEach(b => b.onclick = () => { if (a.busy) return; const i = +b.dataset.u; [ACL[i - 1], ACL[i]] = [ACL[i], ACL[i - 1]]; hl = {}; draw(); });
        a.stage.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (a.busy) return; const i = +b.dataset.d; [ACL[i + 1], ACL[i]] = [ACL[i], ACL[i + 1]]; hl = {}; draw(); });
      }
      async function evalPkt() {
        const src = fs.value.trim(), dst = fd.value.trim(), pr = fp.value, port = +fport.value || null;
        if (!IP.valid(src) || !IP.valid(dst)) { a.log('IP inválida.', 'bad'); return; }
        a.clearLog(); hl = {}; draw();
        a.log('Paquete: <code>' + pr + ' ' + src + ' → ' + dst + (port && pr !== 'icmp' ? ':' + port : '') + '</code>', 'info');
        for (let i = 0; i < ACL.length; i++) {
          if (!a.alive()) return;
          const r = ACL[i];
          hl[i] = 'chk'; draw(); await a.sleep(600);
          const why = [];
          if (!(r.pr === 'ip' || r.pr === pr)) why.push('protocolo');
          if (!mt(src, r.s)) why.push('origen');
          if (!mt(dst, r.d)) why.push('destino');
          if (r.port && (r.pr === 'ip' || pr === 'icmp' || port !== r.port)) why.push('puerto');
          if (!why.length) {
            hl[i] = r.act === 'permit' ? 'okk' : 'bad'; hl['r' + i] = r.act === 'permit' ? '✅ PERMIT' : '⛔ DENY'; draw();
            a.log('Línea ' + ((i + 1) * 10) + ' <b>coincide</b> → <b>' + r.act.toUpperCase() + '</b>. Se deja de leer la ACL (las líneas de abajo ni se miran).', r.act === 'permit' ? 'ok' : 'bad');
            check(src, dst, pr, port, r.act); return;
          }
          hl[i] = 'nm'; hl['r' + i] = 'no (' + why.join(', ') + ')'; draw();
        }
        hl.imp = 'bad'; hl.rimp = '⛔ DENY'; draw();
        a.log('Ninguna línea coincidió → <b>deny implícito</b>. Por eso una ACL con solo "deny" bloquea TODO.', 'bad');
        check(src, dst, pr, port, 'deny');
      }
      function check(src, dst, pr, port, res) {
        if (src === '192.168.10.66' && pr === 'tcp' && port === 443) {
          if (res === 'deny') { a.log('🎯 ¡Desafío resuelto! La regla específica (host .66) tiene que ir <b>antes</b> que la general (toda la /24). Regla de oro: <b>de lo más específico a lo más general</b>.', 'ok'); a.done(); }
          else a.log('🤔 .66 pasó por una regla más general que está más arriba. ¿Qué línea debería evaluarse primero?', 'warn');
        }
        if (src.startsWith('192.168.10.') && dst === '10.0.0.5' && port === 22 && res === 'permit') a.log('Nota: la línea "permit ... eq 22" de abajo de todo es inútil si arriba hay un deny que la tapa (o redundante). Revisá el orden.', 'info');
      }
      draw();
    }
  });
})();

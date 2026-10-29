/* NetOps Academy — Laboratorios interactivos */
(function () {
  'use strict';
  const T = window.TOOLS;
  const N = () => window.NetOps;
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const escH = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* =====================================================
     1) SUBNETTING TRAINER
     ===================================================== */
  const ip2n = s => s.split('.').reduce((a, o) => a * 256 + (+o), 0);
  const n2ip = n => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  const validIP = s => /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split('.').every(o => +o <= 255);
  function calc(ipS, p) {
    const n = ip2n(ipS);
    const mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
    const net = (n & mask) >>> 0;
    const bc = (net | (~mask >>> 0)) >>> 0;
    const hosts = p >= 31 ? (p === 31 ? 2 : 1) : Math.pow(2, 32 - p) - 2;
    const first = p >= 31 ? net : net + 1;
    const last = p >= 31 ? bc : bc - 1;
    return { ip: ipS, p, mask: n2ip(mask), wild: n2ip(~mask >>> 0), net: n2ip(net), bc: n2ip(bc), first: n2ip(first), last: n2ip(last), hosts };
  }
  function explainCalc(r) {
    const m = r.mask.split('.').map(Number);
    const oi = m.findIndex(x => x !== 255);
    if (oi < 0) return 'Prefijo /32: es un único host.';
    const magic = 256 - m[oi];
    const ipo = +r.ip.split('.')[oi];
    const base = Math.floor(ipo / magic) * magic;
    return 'Máscara ' + r.mask + ' → octeto interesante: el ' + (oi + 1) + '° (' + m[oi] + '). Número mágico = 256 − ' + m[oi] + ' = <b>' + magic + '</b>. Bloques: 0, ' + magic + ', ' + magic * 2 + '… El valor ' + ipo + ' cae en el bloque que empieza en <b>' + base + '</b> y termina en <b>' + (base + magic - 1) + '</b>. Hosts = 2^' + (32 - r.p) + ' − 2 = ' + r.hosts + '.';
  }
  T.subnet = {
    icon: '🧮', title: 'Subnetting Trainer',
    desc: 'Ejercicios aleatorios de subnetting con corrección y explicación paso a paso + calculadora.',
    render(el) {
      let streak = 0, cur;
      el.innerHTML = '<div class="card"><div class="row" style="justify-content:space-between"><h3 style="margin:0">Ejercicio</h3><div class="row"><span class="pill">Racha: <b id="sk">0</b></span><span class="pill">Resueltas: <b id="tc">' + (N().get('subnetCount') || 0) + '</b></span>' +
        '<select class="inp" id="slvl" style="width:auto"><option value="e">Fácil (/24–/30)</option><option value="m" selected>Medio (/16–/30)</option><option value="h">Difícil (/8–/30)</option></select></div></div>' +
        '<p class="big" id="q"></p><div class="form" id="f"></div><div class="row"><button class="btn" id="chk">Corregir</button><button class="btn sec" id="sol">Ver solución</button><button class="btn sec" id="nx">Nuevo ejercicio</button></div><div id="fb" class="explain" style="display:none"></div></div>' +
        '<div class="card" style="margin-top:16px"><h3>Calculadora</h3><div class="row"><input class="inp" id="ci" style="max-width:280px" placeholder="ej: 10.20.77.9/21" value="192.168.1.130/26"><button class="btn blue" id="cb">Calcular</button></div><div id="co"></div></div>' +
        '<div class="card" style="margin-top:16px"><h3>Chuleta de potencias de 2</h3><p class="muted">2¹=2 · 2²=4 · 2³=8 · 2⁴=16 · 2⁵=32 · 2⁶=64 · 2⁷=128 · 2⁸=256 · 2⁹=512 · 2¹⁰=1024 · 2¹¹=2048 · 2¹²=4096 · 2¹⁶=65536</p></div>';
      const F = [['net', 'Dirección de red'], ['bc', 'Broadcast'], ['first', 'Primer host útil'], ['last', 'Último host útil'], ['hosts', 'Hosts útiles'], ['mask', 'Máscara decimal']];
      function gen() {
        if (!document.getElementById('slvl')) return;
        const L = document.getElementById('slvl').value;
        const p = L === 'e' ? rnd(24, 30) : L === 'm' ? (Math.random() < 0.6 ? rnd(24, 30) : rnd(16, 23)) : rnd(8, 30);
        const first = [10, 172, 192][rnd(0, 2)];
        const ipS = first === 10 ? '10.' + rnd(0, 255) + '.' + rnd(0, 255) + '.' + rnd(1, 254) : first === 172 ? '172.' + rnd(16, 31) + '.' + rnd(0, 255) + '.' + rnd(1, 254) : '192.168.' + rnd(0, 255) + '.' + rnd(1, 254);
        cur = calc(ipS, p);
        document.getElementById('q').textContent = ipS + '/' + p;
        document.getElementById('f').innerHTML = F.map(f => '<div><label>' + f[1] + '</label><input class="inp" data-k="' + f[0] + '" autocomplete="off"></div>').join('');
        document.getElementById('fb').style.display = 'none';
        el.querySelector('[data-k]').focus();
        el.querySelectorAll('[data-k]').forEach(i => i.onkeydown = e => { if (e.key === 'Enter') check(); });
      }
      function check() {
        let ok = 0;
        el.querySelectorAll('[data-k]').forEach(i => {
          const v = i.value.trim().replace(/^\//, '');
          const good = String(cur[i.dataset.k]) === v;
          i.classList.toggle('ok', good); i.classList.toggle('bad', !good); if (good) ok++;
        });
        const fb = document.getElementById('fb'); fb.style.display = 'block';
        if (ok === F.length) {
          streak++; const c = (N().get('subnetCount') || 0) + 1; N().set('subnetCount', c);
          document.getElementById('tc').textContent = c;
          N().addXP(10 + Math.min(streak, 5) * 2, 'Subred resuelta');
          fb.innerHTML = '✅ ¡Perfecto! ' + (streak >= 3 ? '🔥 Racha de ' + streak : '') + '<br>' + explainCalc(cur);
          setTimeout(gen, 1800);
        } else { streak = 0; fb.innerHTML = '❌ ' + ok + '/' + F.length + ' correctos. Revisá los campos en rojo o mirá la solución.'; }
        document.getElementById('sk').textContent = streak;
      }
      function sol() {
        el.querySelectorAll('[data-k]').forEach(i => { i.value = cur[i.dataset.k]; i.classList.remove('bad'); });
        streak = 0; document.getElementById('sk').textContent = 0;
        const fb = document.getElementById('fb'); fb.style.display = 'block'; fb.innerHTML = '📖 ' + explainCalc(cur) + '<br>Wildcard: <code>' + cur.wild + '</code>';
      }
      function calcBox() {
        const v = document.getElementById('ci').value.trim();
        const m = v.match(/^([\d.]+)\s*\/\s*(\d{1,2})$/);
        const o = document.getElementById('co');
        if (!m || !validIP(m[1]) || +m[2] > 32) { o.innerHTML = '<p class="muted">Formato: IP/prefijo, ej. 172.16.45.130/27</p>'; return; }
        const r = calc(m[1], +m[2]);
        o.innerHTML = '<table><tr><th>Red</th><td><code>' + r.net + '/' + r.p + '</code></td><th>Máscara</th><td><code>' + r.mask + '</code></td></tr><tr><th>Broadcast</th><td><code>' + r.bc + '</code></td><th>Wildcard</th><td><code>' + r.wild + '</code></td></tr><tr><th>Rango útil</th><td><code>' + r.first + ' – ' + r.last + '</code></td><th>Hosts útiles</th><td><b>' + r.hosts + '</b></td></tr></table><p class="muted">' + explainCalc(r) + '</p>';
      }
      document.getElementById('chk').onclick = check;
      document.getElementById('sol').onclick = sol;
      document.getElementById('nx').onclick = gen;
      document.getElementById('slvl').onchange = gen;
      document.getElementById('cb').onclick = calcBox;
      document.getElementById('ci').onkeydown = e => { if (e.key === 'Enter') calcBox(); };
      gen(); calcBox();
    }
  };

  /* =====================================================
     2) PORT RUSH
     ===================================================== */
  const PORTS = [['FTP (control)', '21'], ['SSH', '22'], ['Telnet', '23'], ['SMTP', '25'], ['DNS', '53'], ['DHCP servidor', '67'], ['TFTP', '69'], ['HTTP', '80'], ['Kerberos', '88'], ['POP3', '110'], ['NTP', '123'], ['IMAP', '143'], ['SNMP', '161'], ['SNMP traps', '162'], ['BGP', '179'], ['LDAP', '389'], ['HTTPS', '443'], ['SMB', '445'], ['IPsec IKE', '500'], ['Syslog', '514'], ['SMTP submission', '587'], ['LDAPS', '636'], ['NETCONF', '830'], ['IMAPS', '993'], ['POP3S', '995'], ['OpenVPN', '1194'], ['MS SQL Server', '1433'], ['RADIUS auth', '1812'], ['RADIUS accounting', '1813'], ['MySQL', '3306'], ['RDP', '3389'], ['IPsec NAT-T', '4500'], ['SIP', '5060'], ['PostgreSQL', '5432'], ['Prometheus', '9090'], ['Zabbix agent', '10050'], ['Zabbix server', '10051'], ['WireGuard', '51820'], ['TACACS+', '49'], ['FTP (datos)', '20']];
  T.ports = {
    icon: '⚡', title: 'Port Rush',
    desc: '60 segundos para acertar la mayor cantidad de puertos/servicios. Clave en entrevistas y en el día a día del NOC.',
    render(el) {
      el.innerHTML = '<div class="card center"><p class="muted">Mejor puntaje: <b id="best">' + (N().get('portsBest') || 0) + '</b></p><div id="g"><button class="btn" id="start">▶ Empezar (60 s)</button></div></div>' +
        '<div class="card" style="margin-top:16px"><h3>Tabla de referencia</h3><table>' + PORTS.slice().sort((a, b) => a[1] - b[1]).map(p => '<tr><td><code>' + p[1] + '</code></td><td>' + p[0] + '</td></tr>').join('') + '</table></div>';
      document.getElementById('start').onclick = play;
      function play() {
        let score = 0, wrong = 0, left = 60;
        const g = document.getElementById('g');
        const timer = setInterval(() => { if (!document.getElementById('g')) { clearInterval(timer); return; } left--; const t = document.getElementById('tl'); if (t) t.textContent = left; if (left <= 0) { clearInterval(timer); end(); } }, 1000);
        function q() {
          const it = PORTS[rnd(0, PORTS.length - 1)];
          const rev = Math.random() < 0.5;
          const others = N().shuffle(PORTS.filter(p => p !== it)).slice(0, 3);
          const opts = N().shuffle([it].concat(others));
          g.innerHTML = '<div class="qmeta"><span>⏱ <b id="tl">' + left + '</b> s</span><span>✔ ' + score + ' · ✘ ' + wrong + '</span></div><p class="big">' + (rev ? '¿Qué servicio usa el puerto ' + it[1] + '?' : '¿Puerto de ' + it[0] + '?') + '</p><div class="opts">' +
            opts.map((o, i) => '<button class="opt" data-i="' + i + '">' + (rev ? o[0] : o[1]) + '</button>').join('') + '</div>';
          g.querySelectorAll('.opt').forEach(b => b.onclick = () => {
            if (opts[+b.dataset.i] === it) { score++; b.classList.add('ok'); } else { wrong++; b.classList.add('bad'); }
            setTimeout(() => { if (left > 0) q(); }, 250);
          });
        }
        function end() {
          const best = N().get('portsBest') || 0;
          if (score > best) N().set('portsBest', score);
          g.innerHTML = '<p class="big" style="font-size:2.5rem">' + score + '</p><p>aciertos · ' + wrong + ' errores' + (score > best ? ' · 🏆 ¡Nuevo récord!' : '') + '</p><button class="btn" id="again">Jugar otra vez</button>';
          document.getElementById('best').textContent = Math.max(score, best);
          N().addXP(Math.min(score * 2, 40), 'Port Rush');
          document.getElementById('again').onclick = play;
        }
        q();
      }
    }
  };

  /* =====================================================
     3) TERMINAL LINUX (simulador)
     ===================================================== */
  T.terminal = {
    icon: '🐧', title: 'Terminal Linux',
    desc: 'Shell simulada de un servidor del NOC con misiones: diagnosticar red, revisar logs, encontrar un ataque y arreglar un servicio caído.',
    render(el) {
      const st = { cwd: '/home/guille', nginx: 'failed', apache: 'active', hist: [], hi: 0 };
      const auth = ['Oct 29 03:12:01 noc-srv01 sshd[2101]: Failed password for root from 203.0.113.45 port 51122 ssh2',
        'Oct 29 03:12:04 noc-srv01 sshd[2101]: Failed password for root from 203.0.113.45 port 51124 ssh2',
        'Oct 29 03:12:09 noc-srv01 sshd[2103]: Failed password for invalid user admin from 198.51.100.7 port 40022 ssh2',
        'Oct 29 03:12:11 noc-srv01 sshd[2101]: Failed password for root from 203.0.113.45 port 51130 ssh2',
        'Oct 29 03:12:15 noc-srv01 sshd[2101]: Failed password for root from 203.0.113.45 port 51133 ssh2',
        'Oct 29 08:01:44 noc-srv01 sshd[3550]: Accepted publickey for guille from 192.168.1.50 port 60321 ssh2',
        'Oct 29 08:02:10 noc-srv01 sudo:   guille : TTY=pts/0 ; PWD=/home/guille ; USER=root ; COMMAND=/usr/bin/apt update'].join('\n');
      const syslog = ['Oct 29 07:59:58 noc-srv01 systemd[1]: Starting nginx.service - A high performance web server...',
        'Oct 29 07:59:58 noc-srv01 nginx[812]: nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)',
        'Oct 29 07:59:59 noc-srv01 systemd[1]: nginx.service: Failed with result \'exit-code\'.',
        'Oct 29 07:59:59 noc-srv01 systemd[1]: Failed to start nginx.service - A high performance web server.',
        'Oct 29 08:00:02 noc-srv01 apache2[790]: AH00558: apache2: Could not reliably determine the server\'s fully qualified domain name',
        'Oct 29 08:05:31 noc-srv01 kernel: [ 1201.33] e1000 eth0: Link is Up 1000 Mbps Full Duplex',
        'Oct 29 08:10:12 noc-srv01 zabbix_agentd[655]: active check configuration update from [10.0.0.50:10051] started to fail (cannot connect)',
        'Oct 29 08:10:42 noc-srv01 zabbix_agentd[655]: active check configuration update from [10.0.0.50:10051] is working again',
        'Oct 29 08:22:03 noc-srv01 CRON[1402]: (guille) CMD (/home/guille/scripts/backup.sh)',
        'Oct 29 08:22:03 noc-srv01 CRON[1402]: error: /home/guille/scripts/backup.sh: Permission denied'].join('\n');
      const fs = {
        home: { guille: { 'notas.txt': 'TURNO NOCHE - pendientes:\n- nginx no levanta desde el reinicio de las 08:00 (revisar logs)\n- alguien intentó entrar por SSH de madrugada (ver auth.log)\n- el backup de cron falla: Permission denied\n- gateway: 192.168.1.1 | zabbix: 10.0.0.50', '.bashrc': 'alias ll="ls -la"\nexport EDITOR=vim', scripts: { 'backup.sh': '#!/bin/bash\ntar czf /tmp/etc-$(date +%F).tgz /etc\necho "backup ok"' } } },
        etc: { hostname: 'noc-srv01', hosts: '127.0.0.1 localhost\n127.0.1.1 noc-srv01\n10.0.0.50 zabbix.lab.local zabbix', 'resolv.conf': 'nameserver 192.168.1.1\nnameserver 8.8.8.8\nsearch lab.local', 'os-release': 'PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"',
          ssh: { 'sshd_config': 'Port 22\nPermitRootLogin yes\nPasswordAuthentication yes\nMaxAuthTries 6\n# TODO hardening: PermitRootLogin no' },
          netplan: { '01-netcfg.yaml': 'network:\n  version: 2\n  ethernets:\n    eth0:\n      addresses: [192.168.1.10/24]\n      routes:\n        - to: default\n          via: 192.168.1.1\n      nameservers:\n        addresses: [192.168.1.1, 8.8.8.8]' },
          nginx: { 'nginx.conf': 'user www-data;\nworker_processes auto;\nhttp {\n  include /etc/nginx/sites-enabled/*;\n}' } },
        var: { log: { syslog, 'auth.log': auth, nginx: { 'error.log': '2026/10/29 07:59:58 [emerg] 812#812: bind() to 0.0.0.0:80 failed (98: Address already in use)\n2026/10/29 07:59:58 [emerg] 812#812: bind() to [::]:80 failed (98: Address already in use)\n2026/10/29 07:59:58 [emerg] 812#812: still could not bind()', 'access.log': '' } } },
        tmp: {}
      };
      const perms = { '/home/guille/scripts/backup.sh': '-rw-r--r--', '/home/guille/notas.txt': '-rw-r--r--' };
      const M = [
        ['¿Dónde estás? Mostrá el directorio actual', 'pwd', l => /^pwd$/.test(l)],
        ['Listá los archivos de tu home, incluidos los ocultos', 'ls -la', l => /^ls\s+(-\w*a\w*)/.test(l) && st.cwd === '/home/guille'],
        ['Leé tus notas del turno anterior', 'cat notas.txt', l => /^(cat|less|more|head|tail)\b.*notas\.txt/.test(l)],
        ['Mostrá las IPs de las interfaces', 'ip a', l => /^(ip\s+(a|addr|address)\b|ifconfig)/.test(l)],
        ['Mostrá la tabla de ruteo / default gateway', 'ip r', l => /^(ip\s+(r|route)\b|route\s+-n|netstat\s+-r)/.test(l)],
        ['Probá conectividad al gateway', 'ping 192.168.1.1', l => /^ping\b.*192\.168\.1\.1/.test(l)],
        ['Resolvé el DNS de zabbix.lab.local o www.example.com', 'dig www.example.com', l => /^(dig|nslookup|host)\s+/.test(l)],
        ['Revisá el estado del servicio nginx', 'systemctl status nginx', l => /^(sudo\s+)?systemctl\s+status\s+nginx/.test(l)],
        ['Leé el log de error de nginx (o journalctl)', 'tail /var/log/nginx/error.log', l => /(error\.log|journalctl.*nginx)/.test(l)],
        ['Averiguá qué proceso ocupa el puerto 80', 'ss -tulpn', l => /^(sudo\s+)?(ss|netstat)\s+-\w*[lt]\w*/.test(l) || /lsof\s+-i/.test(l)],
        ['Arreglalo: detené apache2 y levantá nginx', 'sudo systemctl stop apache2 && sudo systemctl restart nginx', () => st.nginx === 'active'],
        ['Buscá los intentos fallidos de SSH en auth.log', 'grep "Failed password" /var/log/auth.log', l => /grep.*fail.*auth\.log/i.test(l)],
        ['Contá cuántas líneas de syslog contienen "error" (usá un pipe)', 'grep -i error /var/log/syslog | wc -l', l => /grep.*error.*syslog\s*\|\s*wc\s+-l/i.test(l) || /grep\s+-\w*c.*error.*syslog/i.test(l)],
        ['El backup falla por permisos: hacelo ejecutable', 'chmod +x scripts/backup.sh', () => perms['/home/guille/scripts/backup.sh'].includes('x')],
        ['Revisá el uso de disco', 'df -h', l => /^df\b/.test(l)]
      ];
      const done = N().get('termMissions') || {};
      el.innerHTML = '<div class="split"><div><div class="term" id="term"></div><p class="muted" style="font-size:.85rem">Escribí <code>help</code> para ver comandos. ↑/↓ historial · soporta pipes <code>|</code>, <code>sudo</code>, <code>&amp;&amp;</code> y <code>clear</code>.</p></div>' +
        '<div class="missions"><h3 style="margin-top:0">🎯 Misiones <span id="mc"></span></h3><ul id="ml"></ul><button class="btn sec sm" id="rs">Reiniciar servidor</button></div></div>';
      const term = document.getElementById('term');
      function drawM() {
        document.getElementById('ml').innerHTML = M.map((m, i) => '<li class="' + (done[i] ? 'done' : '') + '">' + (done[i] ? '✔ ' : (i + 1) + '. ') + m[0] + '<small>' + (done[i] ? '' : '<a href="#" data-h="' + i + '">💡 pista</a>') + '</small></li>').join('');
        document.getElementById('mc').textContent = '(' + Object.keys(done).length + '/' + M.length + ')';
        document.querySelectorAll('[data-h]').forEach(a => a.onclick = e => { e.preventDefault(); a.parentNode.textContent = '→ ' + M[+a.dataset.h][1]; });
      }
      drawM();
      document.getElementById('rs').onclick = () => { st.nginx = 'failed'; st.apache = 'active'; perms['/home/guille/scripts/backup.sh'] = '-rw-r--r--'; st.cwd = '/home/guille'; term.innerHTML = ''; boot(); };
      const short = p => p.replace(/^\/home\/guille/, '~') || '/';
      const prompt = () => '<span class="pr">guille@noc-srv01</span>:<span class="pr2">' + escH(short(st.cwd)) + '</span>$ ';
      function out(s, cls) { const d = document.createElement('div'); d.className = 'ln ' + (cls || ''); d.innerHTML = s; term.insertBefore(d, term.querySelector('.inl')); }
      function resolve(p) {
        if (!p) return st.cwd;
        let parts;
        if (p.startsWith('~')) { parts = ['home', 'guille']; p = p.slice(1); }
        else parts = p.startsWith('/') ? [] : st.cwd.split('/').filter(Boolean);
        p.split('/').forEach(s => { if (!s || s === '.') return; if (s === '..') parts.pop(); else parts.push(s); });
        return '/' + parts.join('/');
      }
      function get(path) { let n = fs; for (const s of path.split('/').filter(Boolean)) { if (n && typeof n === 'object' && s in n) n = n[s]; else return undefined; } return n; }
      function parent(path) { const a = path.split('/').filter(Boolean); const name = a.pop(); return [get('/' + a.join('/')), name]; }
      function tok(line) { const r = []; line.replace(/"([^"]*)"|'([^']*)'|(\S+)/g, (m, a, b, c) => { r.push(a !== undefined ? a : b !== undefined ? b : c); }); return r; }
      const MAN = { ls: 'lista archivos (-l detalle, -a ocultos, -h legible)', cd: 'cambia de directorio', pwd: 'muestra el directorio actual', cat: 'muestra un archivo', grep: 'busca texto (-i ignora mayúsculas, -c cuenta, -v invierte)', tail: 'últimas líneas (-n N, -f seguir)', head: 'primeras líneas', wc: 'cuenta (-l líneas)', ip: 'red: ip a, ip r, ip neigh, ip link', ss: 'sockets: ss -tulpn', ping: 'prueba ICMP', dig: 'consulta DNS', systemctl: 'gestiona servicios: status/start/stop/restart/enable', journalctl: 'logs de systemd: -u servicio -n N', chmod: 'cambia permisos: +x, 755, 644', df: 'uso de disco (-h)', free: 'memoria (-h)', ps: 'procesos (aux)', sudo: 'ejecuta como root', curl: 'cliente HTTP (-I solo encabezados)', traceroute: 'muestra los saltos', uptime: 'tiempo encendido y load average', whoami: 'usuario actual', history: 'historial de comandos' };
      function run1(args, stdin, sudo) {
        const c = args[0], a = args.slice(1);
        const flags = a.filter(x => x.startsWith('-')).join('');
        const pos = a.filter(x => !x.startsWith('-'));
        switch (c) {
          case 'help': return 'Comandos: ' + Object.keys(MAN).concat(['echo', 'mkdir', 'touch', 'hostname', 'uname', 'date', 'id', 'ifconfig', 'nslookup', 'netstat', 'man', 'clear', 'top', 'cat', 'tcpdump', 'nc', 'sort', 'uniq']).sort().join(', ') + '\nTip: man <comando>';
          case 'man': return pos[0] ? (MAN[pos[0]] ? pos[0] + ' — ' + MAN[pos[0]] : 'No manual entry for ' + pos[0]) : 'What manual page do you want?';
          case 'pwd': return st.cwd;
          case 'whoami': return sudo ? 'root' : 'guille';
          case 'id': return sudo ? 'uid=0(root) gid=0(root) groups=0(root)' : 'uid=1000(guille) gid=1000(guille) groups=1000(guille),27(sudo),4(adm)';
          case 'hostname': return 'noc-srv01';
          case 'uname': return flags.includes('a') ? 'Linux noc-srv01 6.8.0-45-generic #45-Ubuntu SMP x86_64 GNU/Linux' : 'Linux';
          case 'date': return new Date().toString();
          case 'uptime': return ' ' + new Date().toTimeString().slice(0, 8) + ' up 3:12,  1 user,  load average: 0.42, 0.37, 0.30';
          case 'echo': return a.join(' ');
          case 'clear': term.querySelectorAll('.ln').forEach(x => x.remove()); return null;
          case 'history': return st.hist.map((h, i) => String(i + 1).padStart(4) + '  ' + h).join('\n');
          case 'cd': { const p = resolve(pos[0] || '~'); const n = get(p); if (n === undefined) return { err: 'bash: cd: ' + pos[0] + ': No such file or directory' }; if (typeof n === 'string') return { err: 'bash: cd: ' + pos[0] + ': Not a directory' }; st.cwd = p; return null; }
          case 'ls': case 'll': {
            const p = resolve(pos[0]); const n = get(p);
            if (n === undefined) return { err: "ls: cannot access '" + pos[0] + "': No such file or directory" };
            const lng = c === 'll' || flags.includes('l'), all = c === 'll' || flags.includes('a');
            if (typeof n === 'string') return lng ? (perms[p] || '-rw-r--r--') + ' 1 guille guille ' + n.length + ' Oct 29 08:00 ' + pos[0] : pos[0];
            let names = Object.keys(n).filter(k => all || !k.startsWith('.')).sort();
            if (all) names = ['.', '..'].concat(names);
            if (!lng) return names.map(k => typeof n[k] === 'object' ? '<span class="pr2">' + k + '</span>' : k).join('  ');
            return 'total ' + names.length * 4 + '\n' + names.map(k => { const v = k === '.' || k === '..' ? {} : n[k]; const isD = typeof v === 'object'; const fp = p.replace(/\/$/, '') + '/' + k; const pm = isD ? 'drwxr-xr-x' : (perms[fp] || '-rw-r--r--'); return pm + ' 1 guille guille ' + String(isD ? 4096 : v.length).padStart(5) + ' Oct 29 08:00 ' + (isD ? '<span class="pr2">' + k + '</span>' : (pm.includes('x') ? '<span class="pr">' + k + '</span>' : k)); }).join('\n');
          }
          case 'cat': case 'less': case 'more': case 'head': case 'tail': {
            if (!pos.length) { if (stdin == null) return { err: c + ': missing file operand' }; }
            let text = stdin;
            if (pos.length) { const fname = c === 'head' || c === 'tail' ? pos.filter(x => !/^\d+$/.test(x)).pop() : pos[0]; const p = resolve(fname); const n = get(p); if (n === undefined) return { err: c + ': ' + fname + ': No such file or directory' }; if (typeof n === 'object') return { err: c + ': ' + fname + ': Is a directory' }; if (p.includes('auth.log') && !sudo && false) return { err: 'Permission denied' }; text = n; }
            const lines = (text || '').split('\n');
            const nm = (a.join(' ').match(/-n\s*(\d+)|-(\d+)/) || []);
            const k = +(nm[1] || nm[2] || 10);
            if (c === 'head') return lines.slice(0, k).join('\n');
            if (c === 'tail') return lines.slice(-k).join('\n');
            return text;
          }
          case 'grep': {
            const pat = pos[0]; if (!pat) return { err: 'Usage: grep [OPTION]... PATTERNS [FILE]...' };
            let text = stdin;
            if (pos[1]) { const n = get(resolve(pos[1])); if (n === undefined || typeof n !== 'string') return { err: 'grep: ' + pos[1] + ': No such file or directory' }; text = n; }
            if (text == null) return { err: 'grep: (esperando entrada... usá un archivo o un pipe)' };
            let re; try { re = new RegExp(pat, flags.includes('i') ? 'i' : ''); } catch (e) { re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); }
            const r = text.split('\n').filter(l => flags.includes('v') ? !re.test(l) : re.test(l));
            return flags.includes('c') ? String(r.length) : r.join('\n');
          }
          case 'wc': { const t = stdin != null ? stdin : (pos[0] && get(resolve(pos[0]))) || ''; const lines = t === '' ? 0 : t.split('\n').length; return flags.includes('l') ? String(lines) : lines + ' ' + t.split(/\s+/).filter(Boolean).length + ' ' + t.length; }
          case 'sort': { const t = (stdin || '').split('\n'); return (flags.includes('n') ? t.sort((x, y) => parseFloat(x) - parseFloat(y)) : t.sort()).map((x, i, ar) => x).slice()[flags.includes('r') ? 'reverse' : 'slice']().join('\n'); }
          case 'uniq': { const t = (stdin || '').split('\n'); const res = []; t.forEach(l => { const last = res[res.length - 1]; if (last && last[0] === l) last[1]++; else res.push([l, 1]); }); return res.map(r => flags.includes('c') ? String(r[1]).padStart(7) + ' ' + r[0] : r[0]).join('\n'); }
          case 'awk': { const m = a.join(' ').match(/\{\s*print\s+\$(\d+|NF)\s*\}/); if (!m) return { err: "awk: (simulador) solo soporta '{print $N}'" }; return (stdin || '').split('\n').map(l => { const f = l.split(/\s+/).filter(Boolean); return m[1] === 'NF' ? f[f.length - 1] : f[+m[1] - 1] || ''; }).join('\n'); }
          case 'mkdir': case 'touch': { if (!pos[0]) return { err: c + ': missing operand' }; const [par, name] = parent(resolve(pos[0])); if (!par || typeof par !== 'object') return { err: c + ': cannot create: No such file or directory' }; if (!(name in par)) par[name] = c === 'mkdir' ? {} : ''; return null; }
          case 'chmod': {
            if (pos.length < 2) return { err: 'chmod: missing operand' };
            const p = resolve(pos[1]); if (get(p) === undefined) return { err: "chmod: cannot access '" + pos[1] + "': No such file or directory" };
            let pm = (perms[p] || '-rw-r--r--').split('');
            const mode = pos[0];
            if (/^[0-7]{3}$/.test(mode)) { const s = d => ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'][+d]; pm = ('-' + s(mode[0]) + s(mode[1]) + s(mode[2])).split(''); }
            else if (/^[ugoa]*\+x$/.test(mode)) { const w = mode.replace('+x', '') || 'a'; if (/[ua]/.test(w)) pm[3] = 'x'; if (/[ga]/.test(w)) pm[6] = 'x'; if (/[oa]/.test(w)) pm[9] = 'x'; }
            else if (/^[ugoa]*-x$/.test(mode)) { pm[3] = pm[6] = pm[9] = '-'; }
            else return { err: "chmod: invalid mode: '" + mode + "'" };
            perms[p] = pm.join(''); return null;
          }
          case 'ip': {
            const s = pos[0] || '';
            if (/^a(ddr(ess)?)?$/.test(s)) return '1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt; mtu 65536 state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n2: eth0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 state UP qlen 1000\n    link/ether 52:54:00:3a:7c:10 brd ff:ff:ff:ff:ff:ff\n    inet 192.168.1.10/24 brd 192.168.1.255 scope global eth0\n    inet6 fe80::5054:ff:fe3a:7c10/64 scope link\n3: eth1: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 state UP\n    inet 10.0.0.20/24 brd 10.0.0.255 scope global eth1';
            if (/^r(oute)?$/.test(s)) return 'default via 192.168.1.1 dev eth0 proto static\n10.0.0.0/24 dev eth1 proto kernel scope link src 10.0.0.20\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10';
            if (/^n(eigh)?$/.test(s)) return '192.168.1.1 dev eth0 lladdr 00:1a:2b:3c:4d:01 REACHABLE\n10.0.0.50 dev eth1 lladdr 52:54:00:aa:bb:50 STALE';
            if (/^l(ink)?$/.test(s)) return '1: lo: &lt;LOOPBACK,UP&gt; mtu 65536\n2: eth0: &lt;BROADCAST,MULTICAST,UP&gt; mtu 1500 state UP\n3: eth1: &lt;BROADCAST,MULTICAST,UP&gt; mtu 1500 state UP';
            return { err: 'Usage: ip [ addr | route | neigh | link ]' };
          }
          case 'ifconfig': return 'eth0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500\n        inet 192.168.1.10  netmask 255.255.255.0  broadcast 192.168.1.255\n        ether 52:54:00:3a:7c:10\n(ifconfig está deprecado: usá "ip a")';
          case 'route': return 'Kernel IP routing table\nDestination  Gateway      Genmask        Iface\n0.0.0.0      192.168.1.1  0.0.0.0        eth0\n10.0.0.0     0.0.0.0      255.255.255.0  eth1\n192.168.1.0  0.0.0.0      255.255.255.0  eth0';
          case 'ping': {
            const h = pos[0]; if (!h) return { err: 'ping: usage error: Destination address required' };
            const known = { '192.168.1.1': '192.168.1.1', '8.8.8.8': '8.8.8.8', 'google.com': '142.250.79.46', 'www.example.com': '93.184.215.14', 'example.com': '93.184.215.14', 'zabbix': '10.0.0.50', 'zabbix.lab.local': '10.0.0.50', '10.0.0.50': '10.0.0.50', 'localhost': '127.0.0.1', '127.0.0.1': '127.0.0.1' };
            if (/^10\.99\./.test(h)) return 'PING ' + h + ' 56(84) bytes of data.\nFrom 192.168.1.1 icmp_seq=1 Destination Host Unreachable\nFrom 192.168.1.1 icmp_seq=2 Destination Host Unreachable\n\n--- ' + h + ' ping statistics ---\n4 packets transmitted, 0 received, +2 errors, 100% packet loss';
            const ipx = known[h] || (validIP(h) ? h : null);
            if (!ipx) return { err: 'ping: ' + h + ': Name or service not known' };
            const base = ipx === '127.0.0.1' ? 0.04 : ipx.startsWith('192.168') || ipx.startsWith('10.') ? 0.6 : 14;
            let s = 'PING ' + h + ' (' + ipx + ') 56(84) bytes of data.\n'; const ts = [];
            for (let i = 1; i <= 4; i++) { const t = (base + Math.random() * base * 0.3).toFixed(2); ts.push(+t); s += '64 bytes from ' + ipx + ': icmp_seq=' + i + ' ttl=' + (base > 5 ? 116 : 64) + ' time=' + t + ' ms\n'; }
            return s + '\n--- ' + h + ' ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss\nrtt min/avg/max = ' + Math.min(...ts) + '/' + (ts.reduce((x, y) => x + y) / 4).toFixed(2) + '/' + Math.max(...ts) + ' ms';
          }
          case 'traceroute': case 'mtr': case 'tracepath': return 'traceroute to ' + (pos[0] || '8.8.8.8') + ', 30 hops max\n 1  192.168.1.1  0.612 ms  0.540 ms  0.501 ms\n 2  100.64.0.1  3.912 ms  4.101 ms  3.877 ms\n 3  200.51.240.9  8.220 ms  8.104 ms  8.330 ms\n 4  * * *\n 5  72.14.209.81  13.801 ms  13.650 ms  13.912 ms\n 6  8.8.8.8  14.020 ms  13.988 ms  14.110 ms';
          case 'dig': case 'nslookup': case 'host': {
            const h = pos.filter(x => !x.startsWith('@'))[0] || '';
            const db = { 'www.example.com': '93.184.215.14', 'example.com': '93.184.215.14', 'google.com': '142.250.79.46', 'zabbix.lab.local': '10.0.0.50', 'noc-srv01.lab.local': '192.168.1.10' };
            const r = db[h];
            if (c === 'nslookup') return 'Server:\t\t192.168.1.1\nAddress:\t192.168.1.1#53\n\n' + (r ? 'Name:\t' + h + '\nAddress: ' + r : '** server can\'t find ' + h + ': NXDOMAIN');
            if (c === 'host') return r ? h + ' has address ' + r : 'Host ' + h + ' not found: 3(NXDOMAIN)';
            if (a.includes('+short')) return r || '';
            return '; &lt;&lt;&gt;&gt; DiG 9.18.28 &lt;&lt;&gt;&gt; ' + h + '\n;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, status: ' + (r ? 'NOERROR' : 'NXDOMAIN') + '\n\n;; QUESTION SECTION:\n;' + h + '.\t\tIN\tA\n' + (r ? '\n;; ANSWER SECTION:\n' + h + '.\t300\tIN\tA\t' + r + '\n' : '') + '\n;; Query time: 12 msec\n;; SERVER: 192.168.1.1#53(192.168.1.1) (UDP)';
          }
          case 'ss': case 'netstat': case 'lsof': {
            const rows = ['tcp   LISTEN 0  128   0.0.0.0:22       0.0.0.0:*   users:(("sshd",pid=701,fd=3))'];
            if (st.apache === 'active') rows.push('tcp   LISTEN 0  511   0.0.0.0:80       0.0.0.0:*   users:(("apache2",pid=790,fd=4))');
            if (st.nginx === 'active') { rows.push('tcp   LISTEN 0  511   0.0.0.0:80       0.0.0.0:*   users:(("nginx",pid=1810,fd=6))'); rows.push('tcp   LISTEN 0  511   0.0.0.0:443      0.0.0.0:*   users:(("nginx",pid=1810,fd=7))'); }
            rows.push('tcp   LISTEN 0  4096  0.0.0.0:10050    0.0.0.0:*   users:(("zabbix_agentd",pid=655,fd=4))');
            rows.push('tcp   LISTEN 0  244   127.0.0.1:5432   0.0.0.0:*   users:(("postgres",pid=720,fd=5))');
            rows.push('udp   UNCONN 0  0     127.0.0.53:53    0.0.0.0:*   users:(("systemd-resolve",pid=500,fd=13))');
            return 'Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process\n' + rows.join('\n');
          }
          case 'systemctl': {
            const act = pos[0], svc = (pos[1] || '').replace('.service', '');
            const map = { nginx: 'nginx', apache2: 'apache', apache: 'apache', ssh: 'ssh', sshd: 'ssh', 'zabbix-agent': 'zab' };
            if (act === '--failed' || flags.includes('failed')) return st.nginx === 'failed' ? '  UNIT          LOAD   ACTIVE SUB    DESCRIPTION\n● nginx.service loaded failed failed A high performance web server' : '0 loaded units listed.';
            if (!act || !svc) return { err: 'Usage: systemctl [status|start|stop|restart|enable] SERVICE' };
            if (!map[svc]) return { err: 'Unit ' + svc + '.service could not be found.' };
            const key = map[svc];
            const state = key === 'nginx' ? st.nginx : key === 'apache' ? st.apache : 'active';
            if (act === 'status') {
              const ok = state === 'active';
              return '● ' + svc + '.service\n     Loaded: loaded (/lib/systemd/system/' + svc + '.service; enabled)\n     Active: <span class="' + (ok ? 'pr' : 'err') + '">' + (ok ? 'active (running)' : state === 'failed' ? 'failed (Result: exit-code)' : 'inactive (dead)') + '</span> since Thu 2026-10-29 08:00:00\n' +
                (key === 'nginx' && state === 'failed' ? '    Process: 812 ExecStartPre=/usr/sbin/nginx -t (code=exited, status=0/SUCCESS)\n    Process: 813 ExecStart=/usr/sbin/nginx (code=exited, status=1/FAILURE)\n\nOct 29 07:59:58 noc-srv01 nginx[813]: nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)\nOct 29 07:59:59 noc-srv01 systemd[1]: Failed to start nginx.service' : '   Main PID: ' + rnd(600, 1900) + ' (' + svc + ')');
            }
            if (['start', 'stop', 'restart', 'reload', 'enable', 'disable'].includes(act)) {
              if (!sudo) return { err: 'Failed to ' + act + ' ' + svc + '.service: Access denied\n(💡 necesitás privilegios: sudo systemctl ' + act + ' ' + svc + ')' };
              if (key === 'apache') { if (act === 'stop' || act === 'disable') st.apache = 'inactive'; else if (act !== 'enable') st.apache = 'active'; if (st.apache === 'active' && st.nginx === 'active') st.nginx = 'failed'; return null; }
              if (key === 'nginx') {
                if (act === 'stop' || act === 'disable') { if (act === 'stop') st.nginx = 'inactive'; return null; }
                if (act === 'enable') return 'Synchronizing state of nginx.service with SysV service script.';
                if (st.apache === 'active') { st.nginx = 'failed'; return { err: 'Job for nginx.service failed because the control process exited with error code.\nSee "systemctl status nginx.service" and "journalctl -xeu nginx.service" for details.' }; }
                st.nginx = 'active'; return null;
              }
              return null;
            }
            return { err: 'Unknown command verb ' + act + '.' };
          }
          case 'journalctl': {
            if (a.join(' ').includes('nginx')) return syslog.split('\n').filter(l => /nginx/.test(l)).join('\n') + (st.nginx === 'active' ? '\nOct 29 ' + new Date().toTimeString().slice(0, 8) + ' noc-srv01 systemd[1]: Started nginx.service - A high performance web server.' : '');
            return syslog.split('\n').slice(-8).join('\n');
          }
          case 'df': return 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda2        40G   31G  7.1G  82% /\ntmpfs           2.0G     0  2.0G   0% /dev/shm\n/dev/sda1       1.1G  6.1M  1.1G   1% /boot/efi\n/dev/sdb1       200G  188G   12G  95% /var/log/archive';
          case 'du': return '4.0K\tnotas.txt\n12K\tscripts';
          case 'free': return '               total        used        free      shared  buff/cache   available\nMem:           3.8Gi       1.9Gi       420Mi        12Mi       1.5Gi       1.6Gi\nSwap:          2.0Gi       128Mi       1.9Gi';
          case 'ps': case 'top': case 'htop': return 'USER       PID %CPU %MEM COMMAND\nroot         1  0.0  0.3 /sbin/init\nroot       500  0.0  0.2 systemd-resolved\nzabbix     655  0.1  0.4 /usr/sbin/zabbix_agentd\nroot       701  0.0  0.2 sshd: /usr/sbin/sshd -D\npostgres   720  0.3  2.1 postgres\n' + (st.apache === 'active' ? 'www-data   790  0.2  1.1 /usr/sbin/apache2 -k start\n' : '') + (st.nginx === 'active' ? 'www-data  1810  0.1  0.6 nginx: worker process\n' : '') + 'guille    3601  0.0  0.1 -bash';
          case 'curl': {
            if (!pos[0]) return { err: 'curl: try \'curl --help\'' };
            const local = /localhost|127\.0\.0\.1|192\.168\.1\.10/.test(pos[0]);
            if (local && st.nginx !== 'active' && st.apache !== 'active') return { err: 'curl: (7) Failed to connect to localhost port 80: Connection refused' };
            const server = local ? (st.nginx === 'active' ? 'nginx/1.24.0 (Ubuntu)' : 'Apache/2.4.58 (Ubuntu)') : 'ECAcc';
            return 'HTTP/1.1 200 OK\nServer: ' + server + '\nContent-Type: text/html\nDate: ' + new Date().toUTCString() + (flags.includes('I') ? '' : '\n\n&lt;html&gt;&lt;h1&gt;' + (local ? (st.nginx === 'active' ? 'Welcome to nginx!' : 'Apache2 Ubuntu Default Page') : 'Example Domain') + '&lt;/h1&gt;&lt;/html&gt;');
          }
          case 'nc': return /zv/.test(flags) && pos[1] ? (['22', '80', '10050'].includes(pos[1]) || (pos[1] === '443' && st.nginx === 'active') ? 'Connection to ' + pos[0] + ' ' + pos[1] + ' port [tcp/*] succeeded!' : 'nc: connect to ' + pos[0] + ' port ' + pos[1] + ' (tcp) failed: Connection refused') : { err: 'usage: nc -zv host port' };
          case 'tcpdump': return sudo ? 'tcpdump: verbose output suppressed, use -v for full protocol decode\nlistening on eth0, link-type EN10MB (Ethernet)\n08:31:02.114 IP 192.168.1.10.41522 &gt; 192.168.1.1.53: 4021+ A? www.example.com. (33)\n08:31:02.127 IP 192.168.1.1.53 &gt; 192.168.1.10.41522: 4021 1/0/0 A 93.184.215.14 (49)\n08:31:02.130 IP 192.168.1.10.50210 &gt; 93.184.215.14.443: Flags [S], seq 1102, win 64240\n08:31:02.145 IP 93.184.215.14.443 &gt; 192.168.1.10.50210: Flags [S.], seq 88, ack 1103\n08:31:02.145 IP 192.168.1.10.50210 &gt; 93.184.215.14.443: Flags [.], ack 89\n^C\n5 packets captured' : { err: 'tcpdump: eth0: You don\'t have permission to capture on that device (usá sudo)' };
          case 'nmap': return 'Starting Nmap 7.94\nNmap scan report for ' + (pos[0] || 'localhost') + '\nPORT      STATE SERVICE\n22/tcp    open  ssh\n80/tcp    open  http\n' + (st.nginx === 'active' ? '443/tcp   open  https\n' : '') + '10050/tcp open  zabbix-agent\n(Recordá: escaneá solo equipos propios o autorizados)';
          case 'exit': case 'logout': return 'logout (simulador: seguís conectado 😉)';
          case 'vim': case 'vi': case 'nano': return 'Editor no disponible en el simulador. En un servidor real: ' + c + ' ' + (pos[0] || 'archivo');
          case 'apt': case 'apt-get': return sudo ? 'Reading package lists... Done\nAll packages are up to date.' : { err: 'E: Could not open lock file - are you root? (usá sudo)' };
          default: return { err: c + ': command not found' };
        }
      }
      function exec(line) {
        st.hist.push(line); st.hi = st.hist.length;
        const chains = line.split('&&');
        for (const chain of chains) {
          let stdin = null, ok = true;
          const stages = chain.split('|').map(s => s.trim()).filter(Boolean);
          for (let i = 0; i < stages.length; i++) {
            let args = tok(stages[i]); let sudo = false;
            if (args[0] === 'sudo') { sudo = true; args = args.slice(1); }
            if (!args.length) continue;
            const r = run1(args, stdin, sudo);
            if (r && typeof r === 'object') { out(escH(r.err).replace(/&lt;(\/?)span([^&]*)&gt;/g, '<$1span$2>'), 'err'); ok = false; break; }
            stdin = r;
          }
          if (!ok) break;
          if (stdin != null && stdin !== '') out(String(stdin).replace(/&(?!lt;|gt;|amp;)/g, '&amp;').replace(/<(?!\/?span)/g, '&lt;'));
        }
        M.forEach((m, i) => { if (!done[i]) { let hit = false; try { hit = m[2](line.trim()); } catch (e) {} if (hit) { done[i] = 1; N().set('termMissions', done); N().set('termDone', Object.keys(done).length); N().addXP(10, 'Misión Linux: ' + m[0].slice(0, 30) + '…'); drawM(); if (Object.keys(done).length === M.length) N().toast('🐧 ¡Todas las misiones Linux completas!', 'lvl'); } } });
      }
      function boot() {
        term.innerHTML = '<div class="inl"><span id="pp"></span><input id="ti" autocomplete="off" spellcheck="false"></div>';
        out('Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)\n\n  System load: 0.42   Memory usage: 49%   IPv4 eth0: 192.168.1.10\n  <span class="err">*** 1 failed unit: nginx.service ***</span>\n\nLast login: Thu Oct 29 08:01:44 2026 from 192.168.1.50\nTip: empezá leyendo tus notas → cat notas.txt');
        const ti = document.getElementById('ti');
        document.getElementById('pp').innerHTML = prompt();
        ti.onkeydown = e => {
          if (e.key === 'Enter') {
            const v = ti.value; ti.value = '';
            out(prompt() + escH(v));
            if (v.trim()) exec(v.trim());
            document.getElementById('pp').innerHTML = prompt();
            term.scrollTop = term.scrollHeight;
          } else if (e.key === 'ArrowUp') { if (st.hi > 0) { st.hi--; ti.value = st.hist[st.hi]; } e.preventDefault(); }
          else if (e.key === 'ArrowDown') { if (st.hi < st.hist.length) { st.hi++; ti.value = st.hist[st.hi] || ''; } e.preventDefault(); }
          else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); term.querySelectorAll('.ln').forEach(x => x.remove()); }
        };
        term.onclick = () => ti.focus();
        ti.focus();
      }
      boot();
    }
  };

  /* =====================================================
     4) CISCO IOS (simulador)
     ===================================================== */
  T.ios = {
    icon: '🔀', title: 'Simulador Cisco IOS',
    desc: 'CLI de un switch Catalyst con modos, abreviaturas, show y misiones: VLANs, trunk, SVI, SSH y guardar la configuración.',
    render(el) {
      const ifs = {};
      for (let i = 1; i <= 24; i++) ifs['FastEthernet0/' + i] = { mode: 'dynamic auto', vlan: 1, shut: false, desc: '', up: i <= 4 };
      ifs['GigabitEthernet0/1'] = { mode: 'dynamic auto', vlan: 1, shut: false, desc: '', up: true, allowed: 'all', native: 1 };
      ifs['GigabitEthernet0/2'] = { mode: 'dynamic auto', vlan: 1, shut: false, desc: '', up: false, allowed: 'all', native: 1 };
      const st = { host: 'Switch', mode: 'user', ctx: null, vlans: { 1: 'default' }, ifs, svi: {}, secret: null, domain: null, rsa: false, users: {}, vty: { transport: 'all', login: '', pw: null }, gw: null, saved: false, visited: {}, encr: false, hist: [], hi: 0 };
      const M = [
        ['Entrá al modo privilegiado', 'enable', () => st.visited.priv],
        ['Entrá al modo de configuración global', 'configure terminal', () => st.visited.config],
        ['Cambiá el hostname a SW-NOC', 'hostname SW-NOC', () => st.host === 'SW-NOC'],
        ['Creá la VLAN 10 VENTAS y la VLAN 20 SOPORTE', 'vlan 10 → name VENTAS', () => String(st.vlans[10]).toUpperCase() === 'VENTAS' && String(st.vlans[20]).toUpperCase() === 'SOPORTE'],
        ['Fa0/1 en access VLAN 10 y Fa0/2 en access VLAN 20', 'interface fa0/1 → switchport mode access → switchport access vlan 10', () => ifs['FastEthernet0/1'].mode === 'access' && ifs['FastEthernet0/1'].vlan === 10 && ifs['FastEthernet0/2'].mode === 'access' && ifs['FastEthernet0/2'].vlan === 20],
        ['Configurá Gi0/1 como trunk', 'interface gi0/1 → switchport mode trunk', () => ifs['GigabitEthernet0/1'].mode === 'trunk'],
        ['Configurá un enable secret', 'enable secret Cisco123!', () => !!st.secret],
        ['Creá la VLAN 99 GESTION y la SVI 192.168.99.2/24 activa', 'vlan 99 / interface vlan 99 → ip address 192.168.99.2 255.255.255.0 → no shutdown', () => st.vlans[99] && st.svi[99] && st.svi[99].ip === '192.168.99.2' && st.svi[99].mask === '255.255.255.0' && !st.svi[99].shut],
        ['Definí el default gateway 192.168.99.1', 'ip default-gateway 192.168.99.1', () => st.gw === '192.168.99.1'],
        ['Habilitá SSH: dominio, claves RSA, usuario local y vty con SSH + login local', 'ip domain-name lab.local · crypto key generate rsa · username admin secret X · line vty 0 4 → transport input ssh → login local', () => st.domain && st.rsa && Object.keys(st.users).length && st.vty.transport === 'ssh' && st.vty.login === 'local'],
        ['Guardá la configuración', 'copy running-config startup-config (o wr)', () => st.saved]
      ];
      const done = N().get('iosMissions') || {};
      el.innerHTML = '<div class="split"><div><div class="term" id="term"></div><p class="muted" style="font-size:.85rem">Soporta abreviaturas (<code>en</code>, <code>conf t</code>, <code>int fa0/1</code>, <code>sh vlan br</code>, <code>sh ip int br</code>), <code>?</code>, <code>do</code>, <code>exit</code>, <code>end</code>. ↑/↓ historial.</p></div>' +
        '<div class="missions"><h3 style="margin-top:0">🎯 Misiones <span id="mc"></span></h3><ul id="ml"></ul></div></div>';
      const term = document.getElementById('term');
      function drawM() {
        document.getElementById('ml').innerHTML = M.map((m, i) => '<li class="' + (done[i] ? 'done' : '') + '">' + (done[i] ? '✔ ' : (i + 1) + '. ') + m[0] + '<small>' + (done[i] ? '' : '<a href="#" data-h="' + i + '">💡 pista</a>') + '</small></li>').join('');
        document.getElementById('mc').textContent = '(' + Object.keys(done).length + '/' + M.length + ')';
        document.querySelectorAll('[data-h]').forEach(a => a.onclick = e => { e.preventDefault(); a.parentNode.textContent = '→ ' + M[+a.dataset.h][1]; });
      }
      drawM();
      const P = { user: '>', priv: '#', config: '(config)#', if: '(config-if)#', vlan: '(config-vlan)#', line: '(config-line)#' };
      const prompt = () => escH(st.host + P[st.mode]) + ' ';
      function out(s, cls) { const d = document.createElement('div'); d.className = 'ln ' + (cls || ''); d.innerHTML = s; term.insertBefore(d, term.querySelector('.inl')); }
      const k = (t, w, min) => !!t && t.length >= (min || 1) && w.startsWith(t.toLowerCase());
      const INV = '% Invalid input detected at \'^\' marker.';
      const INC = '% Incomplete command.';
      function ifName(tokens) {
        const s = tokens.join('').toLowerCase();
        let m = s.match(/^(f|fa|fas|fastethernet)(0\/\d+)$/); if (m && ifs['FastEthernet' + m[2]]) return 'FastEthernet' + m[2];
        m = s.match(/^(g|gi|gig|gigabitethernet)(0\/\d+)$/); if (m && ifs['GigabitEthernet' + m[2]]) return 'GigabitEthernet' + m[2];
        m = s.match(/^(vl|vla|vlan)(\d+)$/); if (m && +m[2] >= 1 && +m[2] <= 4094) return 'Vlan' + m[2];
        return null;
      }
      const short = n => n.replace('FastEthernet', 'Fa').replace('GigabitEthernet', 'Gi');
      function vlanBrief() {
        let s = 'VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------\n';
        Object.keys(st.vlans).map(Number).sort((a, b) => a - b).forEach(v => {
          const ports = Object.keys(ifs).filter(n => ifs[n].mode !== 'trunk' && ifs[n].vlan === v).map(short);
          const lines = []; for (let i = 0; i < ports.length; i += 4) lines.push(ports.slice(i, i + 4).join(', '));
          s += String(v).padEnd(5) + st.vlans[v].padEnd(33) + 'active    ' + (lines[0] || '') + '\n' + lines.slice(1).map(l => ' '.repeat(48) + l + '\n').join('');
        });
        return s + '1002 fddi-default                     act/unsup\n1003 token-ring-default               act/unsup';
      }
      function ipIntBr() {
        let s = 'Interface              IP-Address      OK? Method Status                Protocol\n';
        Object.keys(st.svi).sort().forEach(v => { const x = st.svi[v]; const up = !x.shut && st.vlans[v] && Object.values(ifs).some(i => i.up && !i.shut && (i.vlan == v || i.mode === 'trunk')); s += ('Vlan' + v).padEnd(23) + (x.ip || 'unassigned').padEnd(16) + 'YES ' + (x.ip ? 'manual ' : 'unset  ') + (x.shut ? 'administratively down' : up ? 'up' : 'down').padEnd(22) + (up ? 'up' : 'down') + '\n'; });
        Object.keys(ifs).forEach(n => { const i = ifs[n]; const status = i.shut ? 'administratively down' : i.up ? 'up' : 'down'; s += n.padEnd(23) + 'unassigned'.padEnd(16) + 'YES unset  ' + status.padEnd(22) + (i.up && !i.shut ? 'up' : 'down') + '\n'; });
        return s.trimEnd();
      }
      function runConf() {
        let s = 'Building configuration...\n\nCurrent configuration : 2048 bytes\n!\nversion 15.2\n' + (st.encr ? 'service password-encryption\n' : 'no service password-encryption\n') + '!\nhostname ' + st.host + '\n!\n' + (st.secret ? 'enable secret 9 $9$' + btoa(st.secret).slice(0, 14) + '\n!\n' : '') + Object.keys(st.users).map(u => 'username ' + u + ' privilege 15 secret 9 $9$' + btoa(st.users[u]).slice(0, 12) + '\n').join('') + (st.domain ? 'ip domain-name ' + st.domain + '\n' : '') + '!\n';
        Object.keys(st.vlans).filter(v => v != 1).forEach(v => { s += 'vlan ' + v + '\n name ' + st.vlans[v] + '\n!\n'; });
        Object.keys(ifs).forEach(n => { const i = ifs[n]; s += 'interface ' + n + '\n' + (i.desc ? ' description ' + i.desc + '\n' : '') + (i.mode === 'access' ? ' switchport mode access\n' + (i.vlan !== 1 ? ' switchport access vlan ' + i.vlan + '\n' : '') : i.mode === 'trunk' ? ' switchport mode trunk\n' + (i.native && i.native !== 1 ? ' switchport trunk native vlan ' + i.native + '\n' : '') + (i.allowed && i.allowed !== 'all' ? ' switchport trunk allowed vlan ' + i.allowed + '\n' : '') : '') + (i.ps ? ' switchport port-security\n' : '') + (i.shut ? ' shutdown\n' : '') + '!\n'; });
        Object.keys(st.svi).forEach(v => { const x = st.svi[v]; s += 'interface Vlan' + v + '\n' + (x.ip ? ' ip address ' + x.ip + ' ' + x.mask + '\n' : ' no ip address\n') + (x.shut ? ' shutdown\n' : '') + '!\n'; });
        if (st.gw) s += 'ip default-gateway ' + st.gw + '\n!\n';
        s += 'line con 0\n!\nline vty 0 4\n' + (st.vty.pw ? ' password ' + (st.encr ? '7 0822455D0A16' : st.vty.pw) + '\n' : '') + (st.vty.login === 'local' ? ' login local\n' : st.vty.login === 'login' ? ' login\n' : '') + (st.vty.transport !== 'all' ? ' transport input ' + st.vty.transport + '\n' : '') + '!\nend';
        return s;
      }
      function show(t) {
        if (!t[0]) return INC;
        if (k(t[0], 'running-config', 3)) return st.mode === 'user' ? INV : runConf();
        if (k(t[0], 'startup-config', 3)) return st.saved ? '(igual a la running-config guardada)' : 'startup-config is not present';
        if (k(t[0], 'vlan')) return vlanBrief();
        if (k(t[0], 'ip') && k(t[1], 'interface') && k(t[2], 'brief')) return ipIntBr();
        if (k(t[0], 'interfaces') && k(t[1], 'trunk')) { const tr = Object.keys(ifs).filter(n => ifs[n].mode === 'trunk'); return tr.length ? 'Port        Mode         Encapsulation  Status        Native vlan\n' + tr.map(n => short(n).padEnd(12) + 'on           802.1q         ' + (ifs[n].up ? 'trunking' : 'not-trunking').padEnd(14) + (ifs[n].native || 1)).join('\n') + '\n\nPort        Vlans allowed on trunk\n' + tr.map(n => short(n).padEnd(12) + (ifs[n].allowed === 'all' || !ifs[n].allowed ? '1-4094' : ifs[n].allowed)).join('\n') : ''; }
        if (k(t[0], 'interfaces')) { const n = ifName(t.slice(1)); if (!n || !ifs[n]) return INV; const i = ifs[n]; return n + ' is ' + (i.shut ? 'administratively down' : i.up ? 'up' : 'down') + ', line protocol is ' + (i.up && !i.shut ? 'up (connected)' : 'down (notconnect)') + '\n  Hardware is ' + (n.startsWith('Gi') ? 'Gigabit' : 'Fast') + ' Ethernet, address is 0011.2233.44' + String(rnd(10, 99)) + '\n  Description: ' + (i.desc || '') + '\n  ' + (n.startsWith('Gi') ? '1000Mb/s' : '100Mb/s') + ', Full-duplex, media type is 10/100/1000BaseTX\n  5 minute input rate 12000 bits/sec, 18 packets/sec\n     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored\n     0 output errors, 0 collisions, 0 interface resets'; }
        if (k(t[0], 'version')) return 'Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.2(7)E8\nSW-NOC uptime is 3 hours, 12 minutes\ncisco WS-C2960-24TT-L (PowerPC405) processor with 65536K bytes of memory.\n24 FastEthernet interfaces\n2 Gigabit Ethernet interfaces';
        if (k(t[0], 'mac')) return '          Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n   ' + ifs['FastEthernet0/1'].vlan + '    0050.7966.6801    DYNAMIC     Fa0/1\n   ' + ifs['FastEthernet0/2'].vlan + '    0050.7966.6802    DYNAMIC     Fa0/2\n   1    0050.7966.6803    DYNAMIC     Fa0/3\n   1    00d0.ba11.0001    DYNAMIC     Gi0/1';
        if (k(t[0], 'cdp')) return 'Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID\nCORE-01          Gig 0/1           152             R S I   C9300-48  Gig 1/0/24';
        if (k(t[0], 'spanning-tree', 2)) return 'VLAN0001\n  Spanning tree enabled protocol rstp\n  Root ID    Priority    24577\n             Address     00d0.ba11.0001\n             Cost        4\n             Port        25 (GigabitEthernet0/1)\nInterface           Role Sts Cost      Prio.Nbr Type\nFa0/1               Desg FWD 19        128.1    P2p\nGi0/1               Root FWD 4         128.25   P2p';
        if (k(t[0], 'clock')) return '*' + new Date().toTimeString().slice(0, 8) + '.123 UTC Thu Oct 29 2026';
        if (k(t[0], 'ip') && k(t[1], 'ssh')) return st.rsa ? 'SSH Enabled - version 2.0\nAuthentication timeout: 120 secs; Authentication retries: 3' : '%SSH has not been enabled';
        if (k(t[0], 'history')) return st.hist.join('\n');
        return INV;
      }
      const HELP = {
        user: 'enable, show, ping, exit',
        priv: 'configure terminal, show (running-config, vlan brief, ip interface brief, interfaces trunk, interfaces fa0/1, mac address-table, cdp neighbors, spanning-tree, version, ip ssh), copy running-config startup-config, write memory, ping, disable, exit',
        config: 'hostname, vlan, interface, enable secret, username, ip domain-name, crypto key generate rsa, ip default-gateway, service password-encryption, line vty 0 4, no ip domain-lookup, end, exit, do',
        if: 'switchport mode access|trunk, switchport access vlan N, switchport trunk native vlan N, switchport trunk allowed vlan LISTA, switchport port-security, description, shutdown, no shutdown, ip address A M (SVI), exit, end',
        vlan: 'name NOMBRE, exit, end',
        line: 'password X, login, login local, transport input ssh|telnet|all, exit, end'
      };
      function exec(line) {
        let t = line.trim().split(/\s+/);
        if (!t[0]) return '';
        if (t[0] === '?' || t[t.length - 1] === '?') return 'Comandos disponibles en este modo:\n  ' + HELP[st.mode];
        const cfg = ['config', 'if', 'vlan', 'line'].includes(st.mode);
        if (cfg && k(t[0], 'do', 2)) return show(t.slice(2).length && k(t[1], 'show') ? t.slice(2) : t.slice(1));
        if (cfg && k(t[0], 'end', 2)) { st.mode = 'priv'; st.ctx = null; return null; }
        if (k(t[0], 'exit', 2)) { if (st.mode === 'config') st.mode = 'priv'; else if (cfg) st.mode = 'config'; else if (st.mode === 'priv') st.mode = 'user'; else return 'Connection closed. (simulador: seguís conectado)'; st.ctx = null; return null; }
        if (st.mode === 'user' || st.mode === 'priv') {
          if (k(t[0], 'enable', 2) && st.mode === 'user') { st.mode = 'priv'; st.visited.priv = 1; return st.secret ? '(Password: ••••••) [simulador: aceptada]' : null; }
          if (k(t[0], 'show', 2)) return show(t.slice(1));
          if (k(t[0], 'ping')) { const ip = t[1]; if (!ip) return INC; const svi = Object.values(st.svi).find(x => x.ip && !x.shut); const ok = svi && ip.split('.').slice(0, 3).join('.') === svi.ip.split('.').slice(0, 3).join('.'); return 'Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ' + ip + ', timeout is 2 seconds:\n' + (ok ? '.!!!!\nSuccess rate is 80 percent (4/5), round-trip min/avg/max = 1/2/4 ms' : '.....\nSuccess rate is 0 percent (0/5)' + (svi ? '' : '\n(💡 el switch necesita una SVI con IP activa para hacer ping)')); }
          if (st.mode === 'user') return INV;
          if (k(t[0], 'configure', 4)) { if (t[1] && !k(t[1], 'terminal')) return INV; st.mode = 'config'; st.visited.config = 1; return 'Enter configuration commands, one per line.  End with CNTL/Z.'; }
          if (k(t[0], 'copy') && k(t[1], 'running-config', 3) && k(t[2], 'startup-config', 3)) { st.saved = true; return 'Destination filename [startup-config]? \nBuilding configuration...\n[OK]'; }
          if ((k(t[0], 'write', 2) && (!t[1] || k(t[1], 'memory'))) || t[0] === 'wr') { st.saved = true; return 'Building configuration...\n[OK]'; }
          if (k(t[0], 'disable', 4)) { st.mode = 'user'; return null; }
          if (k(t[0], 'reload', 3)) return 'System configuration has been modified. Save? [yes/no]: (simulador: reload cancelado)';
          return INV;
        }
        st.saved = false;
        const no = t[0] === 'no'; if (no) t = t.slice(1);
        function confMode(t, no) {
          if (k(t[0], 'hostname', 3)) { if (!t[1]) return INC; st.host = t[1]; return null; }
          if (k(t[0], 'vlan', 2) && t[1]) { const v = +t[1]; if (!(v >= 1 && v <= 4094)) return '% Bad VLAN list'; if (no) { delete st.vlans[v]; return null; } if (!st.vlans[v]) st.vlans[v] = 'VLAN' + String(v).padStart(4, '0'); st.mode = 'vlan'; st.ctx = v; return null; }
          if (k(t[0], 'interface', 3)) {
            if (t[1] && k(t[1], 'range')) return '(simulador: usá una interfaz por vez, ej. interface fa0/1)';
            const n = ifName(t.slice(1)); if (!n) return INV;
            if (n.startsWith('Vlan')) { const v = +n.slice(4); if (!st.svi[v]) st.svi[v] = { ip: null, mask: null, shut: true }; }
            st.mode = 'if'; st.ctx = n; return null;
          }
          if (k(t[0], 'enable', 2) && k(t[1], 'secret')) { if (!t[2]) return INC; st.secret = t[t.length - 1]; return null; }
          if (k(t[0], 'enable', 2) && k(t[1], 'password')) { return '(funciona, pero usá "enable secret": se guarda con hash)'; }
          if (k(t[0], 'username', 3)) { if (!t[1] || t.length < 4) return INC; st.users[t[1]] = t[t.length - 1]; return null; }
          if (k(t[0], 'ip') && k(t[1], 'domain-name', 8)) { if (!t[2]) return INC; st.domain = t[2]; return null; }
          if (k(t[0], 'ip') && k(t[1], 'domain-lookup', 8)) return null;
          if (k(t[0], 'ip') && k(t[1], 'default-gateway', 3)) { if (!t[2]) return INC; st.gw = t[2]; return null; }
          if (k(t[0], 'ip') && k(t[1], 'ssh')) return null;
          if (k(t[0], 'crypto') && k(t[1], 'key') && k(t[2], 'generate', 3) && k(t[3], 'rsa')) {
            if (st.host === 'Switch') return '% Please define a hostname other than Switch.';
            if (!st.domain) return '% Please define a domain-name first.';
            st.rsa = true; const bits = t.includes('modulus') ? t[t.indexOf('modulus') + 1] : '2048';
            return 'The name for the keys will be: ' + st.host + '.' + st.domain + '\n% The key modulus size is ' + bits + ' bits\n% Generating ' + bits + ' bit RSA keys, keys will be non-exportable...\n[OK] (elapsed time was 2 seconds)\n*Mar 1 00:12:01: %SSH-5-ENABLED: SSH 2.0 has been enabled';
          }
          if (k(t[0], 'service', 3) && k(t[1], 'password-encryption', 3)) { st.encr = !no; return null; }
          if (k(t[0], 'line')) { if (!t[1]) return INC; st.mode = 'line'; st.ctx = t.slice(1).join(' '); return null; }
          if (k(t[0], 'banner')) return null;
          if (k(t[0], 'spanning-tree', 2)) return null;
          if (k(t[0], 'show', 2)) return INV + '\n(💡 en modo config usá "do show ...")';
          return INV;
        }
        function fallback() { const prev = st.mode, pc = st.ctx; st.mode = 'config'; const r = confMode(t, no); if (r === INV && st.mode === 'config') { st.mode = prev; st.ctx = pc; } return r; }
        if (st.mode === 'config') return confMode(t, no);
        if (st.mode === 'vlan') { if (k(t[0], 'name')) { if (!t[1]) return INC; st.vlans[st.ctx] = t.slice(1).join('_'); return null; } return fallback(); }
        if (st.mode === 'line') {
          if (k(t[0], 'password', 3)) { st.vty.pw = t[1]; return null; }
          if (k(t[0], 'login')) { st.vty.login = no ? '' : (t[1] && k(t[1], 'local')) ? 'local' : 'login'; return null; }
          if (k(t[0], 'transport') && k(t[1], 'input')) { if (!t[2]) return INC; st.vty.transport = t.slice(2).join(' ').toLowerCase(); return null; }
          if (k(t[0], 'exec-timeout', 4) || k(t[0], 'logging', 3)) return null;
          return fallback();
        }
        if (st.mode === 'if') {
          const n = st.ctx;
          if (n.startsWith('Vlan')) {
            const x = st.svi[+n.slice(4)];
            if (k(t[0], 'shutdown', 2)) { x.shut = !no; if (no && st.vlans[+n.slice(4)]) return '%LINK-5-CHANGED: Interface ' + n + ', changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface ' + n + ', changed state to up'; if (no) return '% (la VLAN ' + n.slice(4) + ' no existe todavía: la SVI quedará down hasta crearla)'; return null; }
            if (k(t[0], 'ip') && k(t[1], 'address', 3)) { if (!t[3]) return INC; if (!validIP(t[2]) || !validIP(t[3])) return INV; x.ip = t[2]; x.mask = t[3]; return null; }
            if (k(t[0], 'description', 4)) return null;
            return fallback();
          }
          const i = ifs[n];
          if (k(t[0], 'shutdown', 2)) { i.shut = !no; return '%LINK-5-CHANGED: Interface ' + n + ', changed state to ' + (no ? 'up' : 'administratively down'); }
          if (k(t[0], 'description', 4)) { i.desc = t.slice(1).join(' '); return null; }
          if (k(t[0], 'ip') && k(t[1], 'address', 3)) return '% IP addresses may not be configured on L2 links. (💡 usá una SVI: interface vlan 99)';
          if (k(t[0], 'switchport', 2)) {
            if (k(t[1], 'mode')) { if (k(t[2], 'access')) i.mode = 'access'; else if (k(t[2], 'trunk')) { i.mode = 'trunk'; return '%LINEPROTO-5-UPDOWN: Line protocol on Interface ' + n + ', changed state to down\n%LINEPROTO-5-UPDOWN: Line protocol on Interface ' + n + ', changed state to up'; } else if (k(t[2], 'dynamic')) i.mode = 'dynamic ' + (t[3] || 'auto'); else return INV; return null; }
            if (k(t[1], 'access') && k(t[2], 'vlan')) { const v = +t[3]; if (!v) return INC; if (!st.vlans[v]) { st.vlans[v] = 'VLAN' + String(v).padStart(4, '0'); out('% Access VLAN does not exist. Creating vlan ' + v); } i.vlan = v; return null; }
            if (k(t[1], 'trunk') && k(t[2], 'native')) { i.native = +t[4] || 1; return null; }
            if (k(t[1], 'trunk') && k(t[2], 'allowed')) { i.allowed = t.slice(4).join(' ') || 'all'; return null; }
            if (k(t[1], 'trunk') && k(t[2], 'encapsulation')) return null;
            if (k(t[1], 'nonegotiate')) return null;
            if (k(t[1], 'voice')) return null;
            if (k(t[1], 'port-security')) { if (i.mode !== 'access') return 'Command rejected: ' + n + ' is a dynamic port. (💡 primero switchport mode access)'; i.ps = !no; return null; }
            return fallback();
          }
          if (k(t[0], 'spanning-tree', 2) || k(t[0], 'speed') || k(t[0], 'duplex') || k(t[0], 'channel-group')) return null;
          return fallback();
        }
        return INV;
      }
      term.innerHTML = '<div class="inl"><span id="pp"></span><input id="ti" autocomplete="off" spellcheck="false"></div>';
      out('Cisco IOS Software, C2960 Software, Version 15.2(7)E8\nPress RETURN to get started!\n\n(Escribí ? para ayuda. Empezá con: enable)');
      const ti = document.getElementById('ti');
      document.getElementById('pp').innerHTML = prompt();
      ti.onkeydown = e => {
        if (e.key === 'Enter') {
          const v = ti.value; ti.value = '';
          out(prompt() + escH(v));
          if (v.trim()) { st.hist.push(v); st.hi = st.hist.length; const r = exec(v); if (r) out(escH(r), r.startsWith('%') && !r.startsWith('%LINK') && !r.startsWith('%LINEPROTO') ? 'err' : ''); }
          M.forEach((m, i) => { if (!done[i] && m[2]()) { done[i] = 1; N().set('iosMissions', done); N().set('iosDone', Object.keys(done).length); N().addXP(12, 'Misión IOS'); drawM(); if (Object.keys(done).length === M.length) N().toast('🔀 ¡Switch configurado como un CCNA!', 'lvl'); } });
          document.getElementById('pp').innerHTML = prompt();
          term.scrollTop = term.scrollHeight;
        } else if (e.key === 'ArrowUp') { if (st.hi > 0) { st.hi--; ti.value = st.hist[st.hi]; } e.preventDefault(); }
        else if (e.key === 'ArrowDown') { if (st.hi < st.hist.length) { st.hi++; ti.value = st.hist[st.hi] || ''; } e.preventDefault(); }
        else if (e.key === 'z' && e.ctrlKey) { e.preventDefault(); if (st.mode !== 'user' && st.mode !== 'priv') { st.mode = 'priv'; out(prompt() + '^Z'); document.getElementById('pp').innerHTML = prompt(); } }
      };
      term.onclick = () => ti.focus();
      ti.focus();
    }
  };

  /* =====================================================
     5) SIMULADOR DE TURNO NOC
     ===================================================== */
  const SCEN = [
    { id: 'wan', t: 'Enlace WAN de sucursal caído', alert: '[CRITICAL] 02:14  RT-SUC-CORDOBA  Gi0/0 (WAN-MPLS) ifOperStatus DOWN\n[CRITICAL] 02:14  RT-SUC-CORDOBA  ICMP unreachable (loss 100%)\n[WARNING]  02:15  14 hosts dependientes en Córdoba (suprimidos por dependencia)',
      steps: [
        { q: 'Son las 02:14 y saltan estas alarmas. ¿Qué hacés primero?', o: [
          ['Reconozco (ACK) la alarma, abro ticket y verifico alcance: ¿solo esa sucursal? ¿el backup 4G tomó?', 10, 2, 'Correcto: ACK + ticket + alcance. Así medís MTTA y evitás que otro operador trabaje lo mismo.'],
          ['Llamo al gerente de la sucursal para que reinicie el router', 2, 15, 'Son las 2 AM y todavía no sabés si es un problema del carrier. Primero diagnosticá.'],
          ['Espero 30 minutos a ver si vuelve sola', 0, 30, 'Perdés tiempo de SLA. Las alarmas críticas se atienden ya.']] },
        { q: 'El monitoreo muestra que el router de Córdoba responde por la IP del backup 4G. ¿Qué hacés?', o: [
          ['Entro por el backup y reviso `show interfaces gi0/0` y `show logging`', 10, 5, 'Bien: ves "line protocol down" y en el log "%LINK-3-UPDOWN ... changed state to down" sin cambios de config. Apunta al carrier/físico.'],
          ['Hago `reload` del router remotamente', 0, 10, 'Un reload a ciegas puede dejarte sin acceso. No resuelve un problema del carrier.'],
          ['Cierro el ticket porque hay backup', 1, 1, 'El servicio está degradado (MPLS caído, ERP/telefonía pueden fallar). El incidente sigue abierto.']] },
        { q: 'La interfaz está down/down, contadores sin errores previos, CPE del carrier sin luz de link. ¿Siguiente paso?', o: [
          ['Abro reclamo al carrier con el ID de circuito, horario de inicio y pruebas realizadas', 10, 8, 'Exacto. El ID de circuito es lo primero que te pide el carrier.'],
          ['Cambio la configuración de OSPF', 0, 10, 'No hay indicios de un problema de ruteo: es capa 1.'],
          ['Mando un técnico propio a las 2 AM sin avisar al carrier', 3, 40, 'Puede ser necesario después, pero primero el reclamo al proveedor responsable del enlace.']] },
        { q: 'El carrier confirma un corte de fibra, ETA 06:00. ¿Cómo comunicás?', o: [
          ['Envío notificación: impacto (servicio degradado vía 4G), causa (corte de fibra del carrier), ETA y próxima actualización', 10, 3, 'Comunicación clara y con próxima actualización programada. Excelente.'],
          ['No aviso a nadie hasta que se resuelva', 0, 0, 'Los usuarios y gerentes deben saber qué pasa y cuándo esperar la solución.'],
          ['Mando un mail diciendo "se cayó todo"', 2, 1, 'Impreciso y alarmista. Faltan impacto real, causa y ETA.']] },
        { q: '06:10: el enlace vuelve. ¿Qué hacés para cerrar?', o: [
          ['Verifico que el tráfico volvió al MPLS, que OSPF/BGP están estables, confirmo con la sucursal, documento y cierro', 10, 10, 'Verificación + confirmación + documentación. Cierre de manual.'],
          ['Cierro el ticket apenas veo la interfaz up', 4, 1, 'Faltó verificar el servicio real y confirmar con el usuario.'],
          ['Dejo el ticket abierto para el turno siguiente sin notas', 0, 0, 'Si no está en el ticket, no pasó.']] }
      ] },
    { id: 'dns', t: '"No anda Internet" en toda la oficina', alert: '[HIGH] 09:05  Mesa de ayuda: 37 tickets en 10 minutos "no puedo navegar"\n[OK]   09:05  FW-EDGE-01 ICMP 8.8.8.8 latencia 14 ms\n[WARNING] 09:03  DC-01 servicio "DNS Server" stopped',
      steps: [
        { q: 'Muchos usuarios no navegan, pero el firewall llega a 8.8.8.8. ¿Qué sospechás?', o: [
          ['Resolución de nombres (DNS): hay conectividad IP pero falla por nombre', 10, 2, 'Exacto. Y hay una alarma del servicio DNS en DC-01.'],
          ['Un corte del ISP', 2, 10, 'El firewall llega a 8.8.8.8 con buena latencia: Internet está OK.'],
          ['Un virus en todas las PCs', 0, 15, 'Poco probable y no coincide con la evidencia.']] },
        { q: '¿Cómo lo confirmás desde una PC de usuario?', o: [
          ['`nslookup google.com` (falla con timeout) y `nslookup google.com 8.8.8.8` (funciona)', 10, 3, 'Confirma que el resolver interno no responde.'],
          ['`ipconfig /release`', 2, 5, 'No apunta al problema; solo genera más ruido.'],
          ['`format c:`', 0, 30, '😅 No.']] },
        { q: 'El servicio DNS de DC-01 está detenido. ¿Acción?', o: [
          ['Intento iniciar el servicio, reviso el Visor de eventos por la causa y verifico DC-02 como DNS secundario', 10, 8, 'Restaurás rápido y empezás a buscar la causa. Además detectás que faltaba redundancia efectiva.'],
          ['Cambio por GPO todas las PCs para que usen 8.8.8.8', 2, 20, 'Rompería la resolución del dominio AD (logins, GPO, recursos internos).'],
          ['Reinicio el firewall', 0, 15, 'El firewall no tiene nada que ver.']] },
        { q: 'DNS vuelve. El log muestra que se detuvo tras una actualización automática. ¿Y ahora?', o: [
          ['Cierro el incidente y abro un Problema (RCA): revisar el parche, que el DHCP entregue 2 DNS y monitorear el servicio', 10, 5, 'Incidente → restaurar. Problema → evitar que se repita.'],
          ['Desactivo las actualizaciones para siempre', 1, 2, 'Generás un riesgo de seguridad peor.'],
          ['Nada, ya funciona', 3, 0, 'Sin RCA se va a repetir.']] }
      ] },
    { id: 'cpu', t: 'CPU al 98% en switch core', alert: '[CRITICAL] 14:20  SW-CORE-01  CPU 5min 98%\n[CRITICAL] 14:20  SW-CORE-01  %SW_MATM-4-MACFLAP_NOTIF: Host 0050.56aa.0101 in vlan 20 is flapping between port Gi1/0/12 and port Gi1/0/14\n[HIGH]     14:21  Pérdida de paquetes 40% en VLAN 20',
      steps: [
        { q: 'CPU al 98% + MAC flapping entre dos puertos + pérdida en la VLAN 20. ¿Diagnóstico más probable?', o: [
          ['Un bucle de capa 2 (loop) en la VLAN 20', 10, 2, 'MAC flapping entre dos puertos es la firma clásica de un loop.'],
          ['Falta de memoria en el switch', 2, 10, 'No explica el MAC flapping.'],
          ['Ataque DDoS desde Internet', 1, 10, 'El síntoma es interno de capa 2.']] },
        { q: '¿Qué hacés para contenerlo rápido?', o: [
          ['Reviso qué hay en Gi1/0/12 y Gi1/0/14 (CDP/LLDP, descripción) y apago uno de los dos puertos', 10, 5, 'Cortás el loop. CPU y pérdida bajan en segundos.'],
          ['Reinicio el switch core', 2, 20, 'Corta a toda la empresa y el loop vuelve al arrancar.'],
          ['Cambio la prioridad de STP de todos los switches', 2, 15, 'Cambio arriesgado en plena crisis.']] },
        { q: 'Encontrás que alguien conectó un switch hogareño en una oficina con dos cables a la red. ¿Prevención?', o: [
          ['PortFast + BPDU Guard en puertos de usuario, storm-control y revisar que STP esté activo en todas las VLANs', 10, 5, 'BPDU Guard apaga el puerto si detecta otro switch.'],
          ['Prohibir los cables', 0, 0, 'No es una solución técnica.'],
          ['Desactivar STP para que no consuma CPU', 0, 5, '¡Empeora todo! STP es justamente lo que previene los loops.']] }
      ] },
    { id: 'ssh', t: 'Posible ataque de fuerza bruta SSH', alert: '[HIGH] 03:40  SIEM  Regla "SSH brute force": 1.240 intentos fallidos en 10 min contra BASTION-01\n[INFO] 03:40  Origen: 203.0.113.45 (fuera del país)\n[INFO] 03:41  1 login exitoso para usuario "backup" desde 203.0.113.45 a las 03:38',
      steps: [
        { q: 'Hay miles de intentos fallidos y UN login exitoso desde la misma IP. ¿Qué tan grave es?', o: [
          ['Muy grave: posible cuenta comprometida. Lo trato como incidente de seguridad de alta prioridad y escalo al SOC/seguridad', 10, 2, 'Un login exitoso tras fuerza bruta implica compromiso probable.'],
          ['Normal, siempre hay ataques', 0, 5, 'Los intentos son ruido; el login exitoso NO.'],
          ['Media, lo reviso mañana', 1, 60, 'El atacante ya puede estar moviéndose lateralmente.']] },
        { q: '¿Primeras acciones de contención (coordinadas con seguridad)?', o: [
          ['Bloquear la IP en el firewall, deshabilitar la cuenta "backup", cerrar sus sesiones activas y preservar logs', 10, 8, 'Contención sin destruir evidencia.'],
          ['Apagar el servidor y reinstalarlo ya', 3, 30, 'Perdés evidencia (memoria, sesiones). Primero contener y preservar.'],
          ['Cambiar el puerto SSH a 2222 y listo', 1, 5, 'Seguridad por oscuridad; no resuelve el compromiso.']] },
        { q: 'Mirando el auth.log ves que "backup" tenía una contraseña débil y PasswordAuthentication yes. ¿Mejoras?', o: [
          ['Solo claves SSH, PermitRootLogin no, MFA en el bastión, fail2ban, SSH solo desde VPN/IPs permitidas y alertas en el SIEM', 10, 5, 'Defensa en profundidad.'],
          ['Contraseña más larga y nada más', 3, 1, 'Ayuda, pero lo expuesto a Internet debería tener claves + MFA + restricción de origen.'],
          ['Abrir SSH a todo el mundo para monitorear mejor', 0, 0, 'Lo opuesto a lo que hay que hacer.']] },
        { q: 'Después de contener, ¿qué falta?', o: [
          ['Investigar qué hizo la cuenta (comandos, archivos, conexiones salientes), erradicar, recuperar y post-mortem', 10, 15, 'Ciclo NIST completo: contención → erradicación → recuperación → lecciones aprendidas.'],
          ['Nada, ya bloqueé la IP', 1, 0, 'El atacante pudo dejar persistencia.'],
          ['Publicar en redes sociales lo que pasó', 0, 0, 'La comunicación de incidentes de seguridad la define la organización (legal, dirección).']] }
      ] },
    { id: 'disk', t: 'Disco lleno en servidor de monitoreo', alert: '[WARNING]  22:00  ZABBIX-01  /var 88%\n[CRITICAL] 22:45  ZABBIX-01  /var 97%\n[CRITICAL] 22:50  ZABBIX-01  zabbix-server process not running',
      steps: [
        { q: 'El propio servidor de monitoreo se está quedando sin disco. ¿Qué hacés?', o: [
          ['Entro por SSH, `df -h` y `du -sh /var/* | sort -h` para ver qué creció', 10, 4, 'Identificar antes de borrar.'],
          ['`rm -rf /var/*` para liberar rápido', 0, 30, '¡Destruís la base de datos y los logs!'],
          ['Reinicio el servidor', 2, 10, 'No libera espacio; el servicio volverá a caer.']] },
        { q: '`du` muestra /var/log/zabbix/zabbix_server.log de 38 GB (debug activado). ¿Acción?', o: [
          ['Vacío el archivo con `truncate -s 0`, bajo el DebugLevel y configuro logrotate', 10, 6, 'Liberás espacio sin romper el proceso que tiene el archivo abierto, y evitás la repetición.'],
          ['Borro el archivo con `rm` mientras el proceso sigue escribiéndolo', 4, 3, 'El espacio no se libera hasta reiniciar el proceso (archivo abierto). Truncar es mejor.'],
          ['Compro un disco más grande', 2, 120, 'Puede ser una mejora futura, pero no resuelve hoy ni la causa.']] },
        { q: 'Liberaste espacio. ¿Cómo terminás?', o: [
          ['`sudo systemctl start zabbix-server`, verifico que las alertas vuelvan a llegar, documento y abro un cambio para alertar al 80%', 10, 5, 'Restauración + verificación + mejora preventiva.'],
          ['Me voy, ya hay espacio', 2, 0, 'El servicio sigue caído: ¡el NOC está ciego!'],
          ['Desactivo las alertas de disco porque molestan', 0, 0, 'Al revés: necesitás alertar antes.']] }
      ] }
  ];
  T.noc = {
    icon: '🛰️', title: 'Simulador de turno NOC',
    desc: '5 incidentes realistas (WAN caída, DNS, loop L2, brute force SSH, disco lleno). Tomá decisiones, cuidá el SLA y sumá puntos.',
    render(el) {
      const best = N().get('nocBest') || {};
      function menu() {
        el.innerHTML = '<div class="grid">' + SCEN.map((s, i) => '<a class="card" href="#" data-s="' + i + '"><span class="ico">' + ['📉', '🌐', '🔁', '🔐', '💾'][i] + '</span><h3>' + s.t + '</h3><p>' + s.steps.length + ' decisiones · ' + (best[s.id] != null ? 'Mejor: ' + best[s.id] + '%' : 'Sin jugar') + '</p></a>').join('') + '</div>';
        el.querySelectorAll('[data-s]').forEach(a => a.onclick = e => { e.preventDefault(); play(SCEN[+a.dataset.s]); });
      }
      function play(s) {
        let i = 0, pts = 0, min = 0;
        function step() {
          if (i >= s.steps.length) return end();
          const st = s.steps[i];
          const opts = N().shuffle(st.o.map((o, k) => [o, k]));
          el.innerHTML = '<div class="scene"><div class="row" style="justify-content:space-between"><h3 style="margin:0">' + s.t + '</h3><span class="pill">⏱ T+' + min + ' min · ' + pts + ' pts</span></div><div class="alert">' + escH(s.alert) + '</div><p class="q" style="font-weight:600">Paso ' + (i + 1) + '/' + s.steps.length + ': ' + N().fmt(st.q) + '</p><div class="opts">' +
            opts.map(([o], k) => '<button class="opt" data-k="' + k + '">' + N().fmt(o[0]) + '</button>').join('') + '</div><div id="fb"></div></div>';
          el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
            const [o] = opts[+b.dataset.k];
            el.querySelectorAll('.opt').forEach(x => { x.disabled = true; const oo = opts[+x.dataset.k][0]; if (oo[1] === 10) x.classList.add('ok'); });
            if (o[1] < 10) b.classList.add('bad');
            pts += o[1]; min += o[2];
            document.getElementById('fb').innerHTML = '<div class="explain">' + (o[1] === 10 ? '✅ ' : o[1] >= 3 ? '🟡 ' : '❌ ') + N().fmt(o[3]) + ' <span class="muted">(+' + o[1] + ' pts, +' + o[2] + ' min)</span></div><p><button class="btn" id="nx">' + (i + 1 < s.steps.length ? 'Continuar →' : 'Ver resultado') + '</button></p>';
            document.getElementById('nx').onclick = () => { i++; step(); };
          });
        }
        function end() {
          const pct = Math.round(pts / (s.steps.length * 10) * 100);
          const prev = best[s.id];
          best[s.id] = Math.max(prev || 0, pct); N().set('nocBest', best);
          N().set('nocDone', Object.values(best).filter(v => v >= 70).length);
          if (prev == null || pct > prev) N().addXP(Math.round(pct / 4), 'Escenario NOC');
          el.innerHTML = '<div class="scene center"><h2>' + (pct >= 90 ? '🏆 Operador estrella' : pct >= 70 ? '✅ Incidente bien gestionado' : '📖 Hay que repasar el runbook') + '</h2><p class="big" style="font-size:2.4rem">' + pct + '%</p><p>Tiempo total del incidente: <b>' + min + ' min</b> ' + (min <= 40 ? '(dentro de SLA ✔)' : '(SLA en riesgo ⚠️)') + '</p><div class="en">Write the incident summary in English: what happened, impact, actions taken, root cause and next steps.</div><div class="row" style="justify-content:center"><button class="btn" id="r">Reintentar</button><button class="btn sec" id="m">Otros escenarios</button></div></div>';
          document.getElementById('r').onclick = () => play(s);
          document.getElementById('m').onclick = menu;
        }
        step();
      }
      menu();
    }
  };

  /* =====================================================
     6) PYTHON LAB (Pyodide)
     ===================================================== */
  const CH = [
    { t: 'Hosts útiles de una red', d: 'Imprimí la cantidad de hosts útiles de 10.0.0.0/22.', exp: '1022',
      code: 'import ipaddress\n\nred = ipaddress.ip_network("10.0.0.0/22")\n# completá:\nprint(  )' },
    { t: 'Dividir en subredes', d: 'Imprimí, una por línea, las subredes /26 de 192.168.1.0/24.', exp: '192.168.1.0/26\n192.168.1.64/26\n192.168.1.128/26\n192.168.1.192/26',
      code: 'import ipaddress\n\nred = ipaddress.ip_network("192.168.1.0/24")\nfor sub in red.subnets(new_prefix=  ):\n    print(sub)' },
    { t: 'Máscara a prefijo', d: 'Convertí la máscara 255.255.255.224 a su prefijo e imprimí solo el número.', exp: '27',
      code: 'mascara = "255.255.255.224"\n# Pista: contá los bits en 1 de cada octeto con bin(int(o)).count("1")\nprefijo = 0\n\nprint(prefijo)' },
    { t: '¿IP privada?', d: 'Para cada IP de la lista imprimí True o False según sea privada.', exp: 'True\nFalse\nTrue\nTrue',
      code: 'import ipaddress\n\nips = ["10.1.2.3", "8.8.8.8", "172.20.0.5", "192.168.100.1"]\nfor ip in ips:\n    print(  )' },
    { t: 'Top atacante en auth.log', d: 'Encontrá la IP con más "Failed password" e imprimí "IP cantidad".', exp: '203.0.113.45 3',
      code: 'import re\nfrom collections import Counter\n\nlog = """Oct 29 03:12:01 sshd: Failed password for root from 203.0.113.45 port 51122\nOct 29 03:12:09 sshd: Failed password for admin from 198.51.100.7 port 40022\nOct 29 03:12:11 sshd: Failed password for root from 203.0.113.45 port 51130\nOct 29 08:01:44 sshd: Accepted publickey for guille from 192.168.1.50 port 60321\nOct 29 03:12:15 sshd: Failed password for root from 203.0.113.45 port 51133"""\n\nips = re.findall(r"Failed password .* from (\\S+)", log)\n# completá con Counter(...).most_common(1)\n' },
    { t: 'Interfaces caídas', d: 'Imprimí el nombre de cada interfaz cuyo Protocol sea "down".', exp: 'Gi0/1\nGi0/2',
      code: 'salida = """Interface   IP-Address   OK? Method Status                Protocol\nGi0/0       10.0.0.1     YES manual up                    up\nGi0/1       unassigned   YES unset  administratively down down\nGi0/2       10.0.12.1    YES manual up                    down\nVlan99      192.168.99.2 YES manual up                    up"""\n\nfor linea in salida.splitlines()[1:]:\n    campos = linea.split()\n    # completá\n' },
    { t: 'Disponibilidad mensual', d: 'Un servicio estuvo caído 43 minutos en un mes de 30 días. Imprimí la disponibilidad con 3 decimales (ej. 99.900).', exp: '99.900',
      code: 'total_min = 30 * 24 * 60\ncaida = 43\n\ndisp = 0\nprint(f"{disp:.3f}")' },
    { t: 'Generar config de VLANs', d: 'A partir del dict, imprimí las líneas "vlan N" y " name NOMBRE" en orden de VLAN.', exp: 'vlan 10\n name VENTAS\nvlan 20\n name SOPORTE\nvlan 99\n name GESTION',
      code: 'vlans = {20: "SOPORTE", 99: "GESTION", 10: "VENTAS"}\n\nfor vid in sorted(vlans):\n    pass  # completá\n' }
  ];
  let pyodide = null, loading = null;
  function loadPy(status) {
    if (pyodide) return Promise.resolve(pyodide);
    if (loading) return loading;
    status('⏳ Cargando Python (Pyodide, ~10 MB, requiere Internet la primera vez)...');
    loading = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
      s.onload = () => window.loadPyodide().then(p => { pyodide = p; res(p); }, rej);
      s.onerror = () => { loading = null; rej(new Error('No se pudo descargar Pyodide (¿sin Internet?)')); };
      document.head.appendChild(s);
    });
    return loading;
  }
  T.python = {
    icon: '🐍', title: 'Python Lab',
    desc: '8 desafíos de Python para redes que se ejecutan en el navegador (ipaddress, regex, parsing, disponibilidad, generación de configs).',
    render(el) {
      const done = N().get('pyMissions') || {};
      let cur = 0;
      el.innerHTML = '<div class="row" id="chs" style="margin-bottom:12px"></div><div class="card"><h3 id="ct"></h3><p id="cd" class="muted"></p><textarea class="code" id="code" spellcheck="false"></textarea><div class="row" style="margin:10px 0"><button class="btn" id="run">▶ Ejecutar y verificar</button><button class="btn sec" id="rst">Restaurar código</button><span id="ps" class="muted"></span></div><div class="out" id="out">La salida aparece acá.</div></div>' +
        '<div class="noc">Si no tenés Internet, copiá el código y ejecutalo en tu PC con <code>python archivo.py</code>. Los desafíos esperan que la salida coincida exactamente.</div>';
      const status = s => document.getElementById('ps').textContent = s;
      function tabs() { document.getElementById('chs').innerHTML = CH.map((c, i) => '<button class="btn sm ' + (i === cur ? '' : 'sec') + '" data-c="' + i + '">' + (done[i] ? '✔ ' : '') + (i + 1) + '</button>').join(''); document.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { cur = +b.dataset.c; show(); }); }
      function show() { const c = CH[cur]; document.getElementById('ct').textContent = (cur + 1) + '. ' + c.t; document.getElementById('cd').innerHTML = c.d + '<br><b>Salida esperada:</b><pre>' + escH(c.exp) + '</pre>'; document.getElementById('code').value = N().get('py_' + cur) || c.code; document.getElementById('out').textContent = 'La salida aparece acá.'; tabs(); }
      document.getElementById('code').onkeydown = e => { if (e.key === 'Tab') { e.preventDefault(); const t = e.target, s = t.selectionStart; t.value = t.value.slice(0, s) + '    ' + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = s + 4; } };
      document.getElementById('rst').onclick = () => { N().set('py_' + cur, null); document.getElementById('code').value = CH[cur].code; };
      document.getElementById('run').onclick = async () => {
        const code = document.getElementById('code').value; N().set('py_' + cur, code);
        const o = document.getElementById('out');
        try {
          const py = await loadPy(status); status('');
          let buf = '';
          py.setStdout({ batched: s => { buf += s + '\n'; } });
          py.setStderr({ batched: s => { buf += s + '\n'; } });
          try { await py.runPythonAsync(code); } catch (err) { buf += String(err.message || err).split('\n').slice(-3).join('\n'); }
          const okk = buf.trim() === CH[cur].exp.trim();
          o.textContent = buf || '(sin salida)';
          o.insertAdjacentHTML('beforeend', '\n\n' + (okk ? '✅ ¡Correcto!' : '❌ La salida no coincide con la esperada.'));
          if (okk && !done[cur]) { done[cur] = 1; N().set('pyMissions', done); N().set('pyDone', Object.keys(done).length); N().addXP(15, 'Desafío Python'); tabs(); }
        } catch (err) { status(''); o.textContent = '⚠️ ' + err.message; }
      };
      show();
    }
  };
})();

window.UNITS.push({
  id: 'u13', num: 13, icon: '🕵️', short: 'Hacking ético', time: '3 h',
  title: 'Hacking ético y Pentesting: metodología, reconocimiento, explotación en laboratorio y reporte',
  desc: 'Pensar como atacante para defender mejor. Metodología profesional, marco legal, herramientas clásicas y cómo practicar de forma legal en laboratorios.',
  goals: ['Conocer el marco legal y ético: alcance, autorización y reglas de enfrentamiento', 'Aplicar las fases de un pentest (PTES / OSSTMM / OWASP WSTG)', 'Usar herramientas de reconocimiento, escaneo y enumeración en un laboratorio propio', 'Entender vulnerabilidades web, escalada de privilegios y redactar un informe profesional'],
  lessons: [
    { t: 'Qué es el hacking ético y su marco legal', h: `
<p>El <b>hacking ético</b> (o <b>pentesting</b>) es evaluar la seguridad de un sistema usando las mismas técnicas que un atacante, pero <b>con autorización explícita</b>, dentro de un <b>alcance</b> definido y con el objetivo de <b>reportar y corregir</b>.</p>
<h4>Tipos de "hackers"</h4>
<table><tr><th>Tipo</th><th>Descripción</th></tr>
<tr><td>White hat</td><td>Trabaja con permiso: pentesters, red teamers, bug bounty</td></tr>
<tr><td>Black hat</td><td>Actúa sin permiso, con fines maliciosos (delito)</td></tr>
<tr><td>Grey hat</td><td>Sin permiso pero "sin mala intención": igual es ilegal</td></tr></table>
<h4>Tipos de evaluación</h4>
<ul><li><b>Black box</b>: sin información previa (simula un atacante externo).</li><li><b>Grey box</b>: con información parcial (un usuario común, credenciales de prueba).</li><li><b>White box</b>: con acceso a código, diagramas y configuraciones.</li></ul>
<p>Otras modalidades: <b>análisis de vulnerabilidades</b> (escaneo, sin explotar), <b>pentest</b> (explota para demostrar impacto), <b>red team</b> (simulación de adversario completa, mide detección y respuesta), <b>purple team</b> (red + blue colaborando), <b>bug bounty</b> (HackerOne, Bugcrowd, Intigriti).</p>
<h4>Documentos imprescindibles ANTES de tocar nada</h4>
<ul><li><b>Contrato / autorización escrita</b> firmada por quien tiene autoridad sobre los sistemas.</li>
<li><b>Alcance (scope)</b>: IPs, dominios, aplicaciones incluidas y <b>excluidas</b>.</li>
<li><b>Reglas de enfrentamiento (RoE)</b>: horarios, técnicas permitidas (¿DoS? ¿ingeniería social?), contactos de emergencia, qué hacer si se encuentra algo crítico.</li>
<li><b>NDA</b> (acuerdo de confidencialidad).</li></ul>
<div class="warn">En Argentina, la <b>Ley 26.388</b> de Delitos Informáticos tipifica el acceso indebido a sistemas, la interceptación de comunicaciones y el daño informático. Escanear o atacar sistemas de terceros sin autorización es delito, aunque "no rompas nada". Practicá <b>solo</b> en tu laboratorio o en plataformas creadas para eso.</div>` },
    { t: 'Metodología: las fases de un pentest', h: `
<pre>1. Pre-engagement   → alcance, RoE, autorización
2. Reconocimiento   → OSINT pasivo y activo
3. Escaneo          → hosts vivos, puertos, servicios, versiones
4. Enumeración      → usuarios, recursos compartidos, directorios, tecnologías
5. Análisis de vulnerabilidades → CVEs, malas configuraciones
6. Explotación      → demostrar el impacto (en entorno autorizado)
7. Post-explotación → escalada de privilegios, pivoting, evidencia
8. Reporte          → hallazgos, riesgo, evidencia y remediación
9. Re-test          → verificar que las correcciones funcionan</pre>
<h4>Marcos de referencia</h4>
<ul><li><b>PTES</b> (Penetration Testing Execution Standard).</li><li><b>OSSTMM</b> (Open Source Security Testing Methodology Manual).</li><li><b>OWASP WSTG</b> (Web Security Testing Guide) y <b>OWASP MASTG</b> (móviles).</li><li><b>NIST SP 800-115</b> (guía técnica de pruebas de seguridad).</li><li><b>MITRE ATT&amp;CK</b> para mapear técnicas usadas.</li></ul>
<div class="tip">Lo que diferencia a un profesional de alguien que "corre herramientas" es la <b>metodología</b> y el <b>reporte</b>. Documentá todo desde el minuto cero: comandos, horarios, capturas.</div>` },
    { t: 'Reconocimiento y OSINT', h: `
<p><b>Pasivo</b>: recolectar información sin interactuar con el objetivo. <b>Activo</b>: interactuar directamente (consultas DNS al servidor, escaneos).</p>
<table><tr><th>Fuente / herramienta</th><th>Qué aporta</th></tr>
<tr><td><code>whois</code></td><td>Registrante, fechas, DNS del dominio</td></tr>
<tr><td><code>dig</code> / <code>nslookup</code></td><td>Registros A, MX, TXT (SPF), NS</td></tr>
<tr><td>crt.sh (Certificate Transparency)</td><td>Subdominios a partir de certificados emitidos</td></tr>
<tr><td>Google dorks</td><td><code>site:empresa.com filetype:pdf</code>, <code>inurl:admin</code></td></tr>
<tr><td>Shodan / Censys</td><td>Dispositivos y servicios expuestos en Internet</td></tr>
<tr><td>theHarvester, Amass, Subfinder</td><td>Emails, subdominios, hosts</td></tr>
<tr><td>Wayback Machine</td><td>Versiones viejas de sitios, rutas olvidadas</td></tr>
<tr><td>LinkedIn, GitHub</td><td>Nombres, formato de emails, tecnologías, secretos filtrados en repos</td></tr>
<tr><td>Wappalyzer / WhatWeb</td><td>Tecnologías de un sitio (CMS, frameworks, servidores)</td></tr></table>
<div class="noc">Visión defensiva: hacé OSINT sobre tu propia organización. Muchas brechas empiezan con un subdominio olvidado, un panel expuesto en Shodan o una API key publicada en GitHub.</div>` },
    { t: 'Escaneo y enumeración con Nmap (en tu laboratorio)', h: `
<pre># Descubrimiento de hosts en TU red de laboratorio
nmap -sn 192.168.56.0/24

# Escaneo de puertos más comunes / todos
nmap 192.168.56.101
nmap -p- --min-rate 1000 192.168.56.101

# Detección de versiones, scripts por defecto y sistema operativo
sudo nmap -sV -sC -O 192.168.56.101 -oN escaneo.txt

# UDP (más lento)
sudo nmap -sU --top-ports 50 192.168.56.101</pre>
<table><tr><th>Tipo</th><th>Cómo funciona</th></tr>
<tr><td><code>-sS</code> SYN scan (por defecto con root)</td><td>Envía SYN; SYN-ACK = abierto, RST = cerrado. No completa el handshake</td></tr>
<tr><td><code>-sT</code> Connect</td><td>Completa el handshake (sin privilegios, más ruidoso)</td></tr>
<tr><td><code>-sU</code> UDP</td><td>Sin respuesta = open|filtered; ICMP port unreachable = cerrado</td></tr></table>
<p>Estados: <b>open</b>, <b>closed</b>, <b>filtered</b> (un firewall descarta: no hay respuesta).</p>
<h4>Enumeración por servicio</h4>
<ul><li><b>Web (80/443)</b>: navegar, ver código fuente, <code>robots.txt</code>, descubrir directorios con <code>gobuster</code>/<code>ffuf</code>, escáner <code>nikto</code>.</li>
<li><b>SMB (445)</b>: recursos compartidos y usuarios con <code>smbclient -L</code>, <code>enum4linux-ng</code>, <code>netexec</code>.</li>
<li><b>FTP (21)</b>: ¿login <i>anonymous</i> habilitado?</li>
<li><b>SNMP (161)</b>: community "public" expone mucha información (<code>snmpwalk</code>).</li>
<li><b>SSH (22)</b>: versión, métodos de autenticación.</li></ul>
<div class="en">"The scan revealed three open ports: 22/tcp running OpenSSH 7.2, 80/tcp running Apache 2.4.18 and 445/tcp running Samba."</div>` },
    { t: 'Vulnerabilidades y explotación (conceptos)', h: `
<h4>Análisis de vulnerabilidades</h4>
<p>Con las versiones detectadas se buscan vulnerabilidades conocidas: <b>CVE</b> (identificador), <b>CVSS</b> (puntaje 0–10), <b>CWE</b> (tipo de debilidad). Fuentes: NVD, Exploit-DB (<code>searchsploit</code>), catálogo KEV de CISA, avisos del fabricante. Escáneres: <b>OpenVAS/Greenbone</b>, Nessus, Nuclei.</p>
<h4>Explotación</h4>
<p>Es demostrar que una vulnerabilidad es real y qué impacto tiene. Conceptos clave:</p>
<ul><li><b>Exploit</b>: técnica o código que aprovecha la vulnerabilidad. <b>Payload</b>: lo que se ejecuta después (por ejemplo, una shell).</li>
<li><b>Reverse shell</b>: la víctima se conecta al atacante (atraviesa mejor los firewalls que permiten salida). <b>Bind shell</b>: la víctima abre un puerto y el atacante se conecta.</li>
<li><b>Metasploit Framework</b>: plataforma que organiza módulos (exploits, payloads, auxiliares) y sesiones. Se usa mucho en laboratorios y certificaciones de entrada.</li>
<li><b>Ataques a credenciales</b>: contraseñas por defecto, reutilización, fuerza bruta/diccionario contra servicios de laboratorio, cracking offline de hashes débiles (Hashcat, John the Ripper).</li></ul>
<h4>Post-explotación</h4>
<ul><li><b>Escalada de privilegios</b> en Linux: permisos <code>sudo</code> mal configurados (<code>sudo -l</code>), binarios SUID, tareas cron editables, kernel desactualizado. Guía de referencia: <b>GTFOBins</b>. Herramientas de enumeración: LinPEAS.</li>
<li>En Windows: servicios con permisos débiles, credenciales guardadas, parches faltantes (WinPEAS, <b>LOLBAS</b>).</li>
<li><b>Pivoting</b>: usar un equipo comprometido para alcanzar otras redes internas (por eso importa la segmentación).</li>
<li>Active Directory: enumeración con BloodHound, ataques como Kerberoasting (contraseñas débiles de cuentas de servicio).</li></ul>
<div class="warn">Todo esto se practica <b>únicamente</b> en máquinas preparadas para ello (Metasploitable, HTB, TryHackMe) o con autorización escrita. Cada técnica tiene su contraparte defensiva: aprenderla te hace mejor operador NOC/SOC.</div>` },
    { t: 'Hacking web: OWASP Top 10 en la práctica', h: `
<table><tr><th>OWASP Top 10 (2021)</th><th>Ejemplo</th><th>Defensa</th></tr>
<tr><td>A01 Broken Access Control</td><td>Cambiar <code>?id=1001</code> por <code>?id=1002</code> y ver datos de otro usuario (IDOR)</td><td>Verificar autorización en el servidor en cada petición</td></tr>
<tr><td>A02 Cryptographic Failures</td><td>Datos sensibles sin TLS, hashes MD5</td><td>TLS, bcrypt/argon2</td></tr>
<tr><td>A03 Injection</td><td>SQLi: <code>' OR '1'='1</code> en un login; XSS: <code>&lt;script&gt;</code> en un comentario</td><td>Consultas parametrizadas, escapar salida, CSP</td></tr>
<tr><td>A04 Insecure Design</td><td>Recuperación de contraseña con pregunta adivinable</td><td>Modelado de amenazas</td></tr>
<tr><td>A05 Security Misconfiguration</td><td>Listado de directorios, errores con stack trace, credenciales por defecto</td><td>Hardening, revisar configs</td></tr>
<tr><td>A06 Vulnerable Components</td><td>Librería o CMS sin actualizar</td><td>Inventario y parches (SCA)</td></tr>
<tr><td>A07 Auth Failures</td><td>Sin bloqueo ante fuerza bruta, sesiones que no expiran</td><td>MFA, rate limiting</td></tr>
<tr><td>A08 Integrity Failures</td><td>Actualizaciones sin firma</td><td>Firmas, CI/CD seguro</td></tr>
<tr><td>A09 Logging Failures</td><td>No se registran logins fallidos</td><td>Logs + alertas (SIEM)</td></tr>
<tr><td>A10 SSRF</td><td>El servidor hace peticiones a URLs internas que pide el usuario</td><td>Allowlist de destinos</td></tr></table>
<h4>Herramientas</h4>
<p><b>Burp Suite</b> (proxy para interceptar y modificar peticiones: la herramienta central del pentest web), OWASP ZAP (alternativa libre), herramientas de desarrollador del navegador, <code>sqlmap</code> (automatiza la detección de SQLi en laboratorio), <code>ffuf</code>/<code>gobuster</code>.</p>
<p>Laboratorios web: <b>DVWA</b>, <b>OWASP Juice Shop</b>, <b>PortSwigger Web Security Academy</b> (gratis y excelente).</p>
<div class="tip">Con tu experiencia en QA automation tenés ventaja en pentest web: entendés flujos, APIs, casos borde y cómo romper validaciones.</div>` },
    { t: 'El informe y la carrera profesional', h: `
<h4>Estructura de un informe de pentest</h4>
<ol><li><b>Resumen ejecutivo</b>: para gerencia, sin jerga. Riesgo general y hallazgos principales.</li>
<li><b>Alcance y metodología</b>: qué se probó, cuándo y cómo.</li>
<li><b>Hallazgos</b>, cada uno con: título, severidad (CVSS), activos afectados, descripción, <b>evidencia</b> (capturas, peticiones), impacto, pasos de reproducción y <b>remediación</b> concreta.</li>
<li><b>Conclusiones y recomendaciones</b> priorizadas.</li>
<li>Anexos: salidas de herramientas, lista de hosts.</li></ol>
<pre>[ALTA] SQL Injection en /login.php (CVSS 8.6)
Activo: app.lab.local
Descripción: el parámetro "user" se concatena en la consulta SQL sin sanitizar.
Impacto: un atacante no autenticado puede leer la base de usuarios.
Evidencia: captura 4.2 (respuesta con datos de la tabla users).
Remediación: usar consultas parametrizadas; mínimo privilegio para el usuario de BD; WAF como defensa adicional.</pre>
<h4>Ruta de aprendizaje y certificaciones</h4>
<table><tr><th>Nivel</th><th>Certificación</th><th>Comentario</th></tr>
<tr><td>Inicial</td><td>CompTIA Security+, <b>eJPT</b> (INE)</td><td>eJPT es práctico y accesible</td></tr>
<tr><td>Intermedio</td><td>CompTIA PenTest+, <b>PNPT</b> (TCM), CEH</td><td>PNPT incluye AD y reporte</td></tr>
<tr><td>Avanzado</td><td><b>OSCP</b> (OffSec), CRTO, OSWE</td><td>OSCP es el estándar de la industria</td></tr>
<tr><td>Web</td><td>BSCP (PortSwigger)</td><td>Pentest web avanzado</td></tr></table>
<p>Plataformas: <b>TryHackMe</b> (rutas "Jr Penetration Tester", "Web Fundamentals"), <b>Hack The Box</b> (Starting Point, Academy), <b>VulnHub</b>, <b>PortSwigger Academy</b>, <b>OverTheWire</b>, CTFs (picoCTF, CTFtime).</p>
<div class="en">"During the assessment we identified two high-severity and five medium-severity findings. We recommend prioritizing the remediation of the SQL injection on the login page."</div>` }
  ],
  english: [
    ['penetration test (pentest)', 'prueba de penetración', 'The client requested an external penetration test.'],
    ['scope', 'alcance', 'That server is out of scope, do not touch it.'],
    ['rules of engagement', 'reglas de enfrentamiento', 'The rules of engagement forbid denial-of-service testing.'],
    ['reconnaissance', 'reconocimiento', 'Passive reconnaissance revealed twelve subdomains.'],
    ['attack surface', 'superficie de ataque', 'Unused services increase the attack surface.'],
    ['to enumerate', 'enumerar', 'We enumerated the SMB shares on the file server.'],
    ['exploit / payload', 'exploit / carga útil', 'The exploit delivered a reverse shell payload.'],
    ['privilege escalation', 'escalada de privilegios', 'A misconfigured sudo rule allowed privilege escalation.'],
    ['finding', 'hallazgo', 'Each finding includes evidence and a remediation.'],
    ['remediation', 'remediación / corrección', 'Remediation: apply the vendor patch and rotate credentials.'],
    ['proof of concept (PoC)', 'prueba de concepto', 'We provided a proof of concept for the XSS.'],
    ['bug bounty', 'programa de recompensas por fallos', 'He reported the bug through the bug bounty program.'],
    ['responsible disclosure', 'divulgación responsable', 'Follow responsible disclosure and contact the vendor first.'],
    ['foothold', 'acceso inicial / punto de apoyo', 'We gained an initial foothold through a weak FTP password.']
  ],
  phrases: [
    ['Do we have written authorization for this target?', '¿Tenemos autorización escrita para este objetivo?'],
    ['This host is out of scope; I will stop testing it.', 'Este host está fuera del alcance; dejo de probarlo.'],
    ['We found a critical issue and are notifying the emergency contact as agreed.', 'Encontramos un problema crítico y avisamos al contacto de emergencia según lo acordado.'],
    ['The vulnerability was successfully re-tested and is now fixed.', 'La vulnerabilidad fue re-testeada y ya está corregida.']
  ],
  flash: [
    ['Documentos previos a un pentest', 'Autorización escrita, alcance, reglas de enfrentamiento (RoE), NDA'],
    ['Ley argentina de delitos informáticos', 'Ley 26.388'],
    ['Black / grey / white box', 'Sin info / info parcial / info completa'],
    ['Fases de un pentest', 'Pre-engagement, recon, escaneo, enumeración, vulns, explotación, post-explotación, reporte'],
    ['Nmap: detección de versiones + scripts', 'nmap -sV -sC'], ['Estado "filtered" en Nmap', 'No hay respuesta: un firewall descarta los paquetes'],
    ['Reverse shell vs bind shell', 'Reverse: la víctima se conecta al atacante · Bind: la víctima abre un puerto'],
    ['IDOR', 'Insecure Direct Object Reference: acceder a objetos de otro usuario cambiando un ID'],
    ['Herramienta central del pentest web', 'Burp Suite (proxy de interceptación)'], ['Referencia para escalar con binarios Linux', 'GTFOBins'],
    ['Subdominios por certificados', 'Certificate Transparency (crt.sh)'], ['Certificación práctica de referencia en pentest', 'OSCP']
  ],
  quiz: [
    { q: '¿Qué es lo PRIMERO que necesitás antes de un pentest?', o: ['Un exploit actualizado', 'Autorización escrita y alcance definido', 'Kali Linux', 'Una VPN'], a: 1, e: 'Sin autorización es un delito. El alcance define qué se puede tocar.' },
    { q: 'En un pentest grey box, el evaluador...', o: ['No tiene ninguna información', 'Tiene información parcial (ej. credenciales de usuario)', 'Tiene el código fuente completo', 'Ataca sin permiso'], a: 1, e: 'Black = nada, grey = parcial, white = completa.' },
    { q: 'Buscar subdominios en crt.sh es reconocimiento...', o: ['Activo', 'Pasivo', 'Explotación', 'Post-explotación'], a: 1, e: 'No interactúa con los servidores del objetivo.' },
    { q: 'Nmap muestra un puerto como `filtered`. Significa:', o: ['Está abierto', 'Está cerrado y responde RST', 'No hubo respuesta: probablemente un firewall', 'El servicio está caído'], a: 2, e: 'Filtered = Nmap no puede determinarlo porque los paquetes se descartan.' },
    { q: '¿Qué opción de Nmap detecta versiones de servicios?', o: ['-sn', '-sV', '-p-', '-oN'], a: 1, e: '-sV = version detection. -sn solo descubre hosts, -p- todos los puertos, -oN guarda la salida.' },
    { q: 'Cambiar `?factura=1001` por `?factura=1002` y ver la factura de otro cliente es...', o: ['XSS', 'IDOR / Broken Access Control', 'SSRF', 'CSRF'], a: 1, e: 'OWASP A01: el servidor no verifica que el objeto pertenezca al usuario.' },
    { q: 'En una reverse shell...', o: ['El atacante abre un puerto en la víctima', 'La víctima inicia la conexión hacia el atacante', 'No hay conexión de red', 'Solo funciona en Windows'], a: 1, e: 'Por eso atraviesa firewalls que permiten tráfico saliente; el filtrado de egress la mitiga.' },
    { q: '¿Qué comando muestra qué puede ejecutar tu usuario con sudo en Linux?', o: ['sudo -l', 'whoami', 'id -u', 'su -'], a: 0, e: 'sudo -l es uno de los primeros chequeos de escalada de privilegios.' },
    { q: 'La sección del informe dirigida a gerencia, sin jerga técnica, es...', o: ['Anexos', 'Resumen ejecutivo', 'Evidencia', 'Metodología'], a: 1, e: 'El resumen ejecutivo comunica riesgo e impacto al negocio.' },
    { q: 'Encontrás durante el test un servidor que NO está en el alcance. ¿Qué hacés?', o: ['Lo atacás igual', 'No lo probás y lo informás al cliente', 'Lo borrás del reporte', 'Lo escaneás a escondidas'], a: 1, e: 'Respetar el alcance es una obligación legal y ética.' },
    { q: 'Herramienta proxy central del pentest web', o: ['Wireshark', 'Burp Suite', 'Nessus', 'Hashcat'], a: 1, e: 'Burp intercepta y modifica peticiones HTTP(S).' },
    { q: '¿Qué ley tipifica los delitos informáticos en Argentina?', o: ['Ley 25.326', 'Ley 26.388', 'Ley 27.078', 'Ley 11.723'], a: 1, e: 'La 26.388 (2008). La 25.326 es de protección de datos personales.' }
  ],
  lab: { t: 'Lab 13: Tu laboratorio de pentest (100% legal)', h: `
<ol><li><b>Armá el laboratorio aislado</b> en VirtualBox: una VM <b>Kali Linux</b> (atacante) y una VM <b>Metasploitable 2</b> (vulnerable a propósito), ambas en una red <b>Host-only</b> o <b>Internal</b> (nunca expongas Metasploitable a tu red real ni a Internet).</li>
<li><b>Pre-engagement:</b> escribí una mini "autorización" para vos mismo con el alcance (la IP de Metasploitable) y las reglas. Parece un trámite, pero es el hábito profesional.</li>
<li><b>Recon y escaneo:</b> <code>nmap -sn</code> a la red del lab, luego <code>nmap -sV -sC -oN meta.txt &lt;IP&gt;</code>. Hacé una tabla puerto/servicio/versión.</li>
<li><b>Enumeración:</b> revisá FTP anónimo, recursos SMB y la web (DVWA viene incluida en Metasploitable). Buscá las versiones en <code>searchsploit</code> y en NVD.</li>
<li><b>Web:</b> en DVWA (nivel <i>low</i>) resolvé los módulos de SQL Injection, XSS y Command Injection, y explicá por qué funcionan y cómo se corrigen.</li>
<li><b>Reporte:</b> redactá un informe con resumen ejecutivo (en español y en inglés) y 3 hallazgos con severidad, evidencia y remediación.</li>
<li><b>Seguí en plataformas guiadas:</b> TryHackMe "Jr Penetration Tester", Hack The Box "Starting Point" y PortSwigger Web Security Academy.</li></ol>
<div class="warn">Regla de oro: si no es tuyo o no tenés permiso por escrito, no se toca.</div>` }
});

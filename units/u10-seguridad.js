window.UNITS.push({
  id: 'u10', num: 10, icon: '🛡️', short: 'Ciberseguridad', time: '3 h',
  title: 'Seguridad de redes y ciberseguridad operativa',
  desc: 'Amenazas, defensas en capa 2/3/7, firewalls, VPN, criptografía, hardening, SIEM, frameworks y respuesta a incidentes.',
  goals: ['Dominar CIA, AAA y el vocabulario de riesgo', 'Reconocer ataques comunes y su mitigación', 'Explicar firewalls, IDS/IPS, VPN IPsec/SSL y criptografía básica', 'Aplicar hardening y seguir un proceso de respuesta a incidentes (NIST)'],
  lessons: [
    { t: 'Conceptos base: CIA, AAA, riesgo', h: `
<table><tr><th>Principio</th><th>Significa</th><th>Control típico</th></tr>
<tr><td><b>Confidencialidad</b></td><td>Solo quien debe accede</td><td>Cifrado, control de acceso, MFA</td></tr>
<tr><td><b>Integridad</b></td><td>Los datos no se alteran sin autorización</td><td>Hashes, firmas digitales, logs</td></tr>
<tr><td><b>Disponibilidad</b></td><td>El servicio está cuando se necesita</td><td>Redundancia, backups, anti-DDoS</td></tr></table>
<p><b>AAA</b>: <b>Authentication</b> (¿quién sos?), <b>Authorization</b> (¿qué podés hacer?), <b>Accounting</b> (¿qué hiciste?). Servidores: <b>RADIUS</b> (UDP 1812/1813, cifra solo la contraseña, típico en Wi-Fi/VPN/802.1X) y <b>TACACS+</b> (TCP 49, cifra todo, separa autorización por comando: ideal para administrar equipos de red).</p>
<h4>Vocabulario</h4>
<ul><li><b>Activo</b>: lo que hay que proteger.</li><li><b>Vulnerabilidad</b>: debilidad (software sin parchear, config débil). Se identifican con <b>CVE</b> y se puntúan con <b>CVSS</b> (0–10).</li><li><b>Amenaza</b>: lo que podría explotarla (actor, malware).</li><li><b>Exploit</b>: técnica/código que aprovecha la vulnerabilidad.</li><li><b>Riesgo</b> = probabilidad × impacto. Se puede mitigar, transferir (seguro), evitar o aceptar.</li><li><b>Zero-day</b>: vulnerabilidad sin parche público.</li></ul>
<p>Autenticación multifactor: algo que <b>sabés</b> (clave), algo que <b>tenés</b> (token, app), algo que <b>sos</b> (biometría).</p>` },
    { t: 'Ataques comunes y cómo mitigarlos', h: `
<table><tr><th>Ataque</th><th>Descripción</th><th>Mitigación</th></tr>
<tr><td>Phishing / spear phishing</td><td>Engaño por mail/mensaje para robar credenciales</td><td>Concientización, filtro de correo, SPF/DKIM/DMARC, MFA</td></tr>
<tr><td>Ransomware</td><td>Cifra datos y pide rescate</td><td>Backups offline/inmutables, EDR, parches, segmentación</td></tr>
<tr><td>Malware (virus, gusano, troyano, spyware, rootkit)</td><td>Software malicioso</td><td>Antivirus/EDR, mínimo privilegio, allowlisting</td></tr>
<tr><td>DoS / DDoS</td><td>Saturar un servicio</td><td>Rate limiting, scrubbing del ISP/CDN, anycast</td></tr>
<tr><td>MITM</td><td>Interceptar tráfico</td><td>TLS, HSTS, VPN, DAI</td></tr>
<tr><td>ARP spoofing</td><td>Respuestas ARP falsas para hacerse pasar por el gateway</td><td><b>Dynamic ARP Inspection</b></td></tr>
<tr><td>DHCP spoofing / starvation</td><td>Servidor DHCP falso / agotar el pool</td><td><b>DHCP Snooping</b>, port-security</td></tr>
<tr><td>MAC flooding</td><td>Llenar la tabla CAM para que el switch inunde</td><td>Port-security</td></tr>
<tr><td>VLAN hopping</td><td>Saltar a otra VLAN (switch spoofing, double tagging)</td><td>Desactivar DTP, nativa sin uso, puertos access</td></tr>
<tr><td>Fuerza bruta / credential stuffing</td><td>Probar contraseñas</td><td>MFA, bloqueo, fail2ban, claves robustas</td></tr>
<tr><td>SQL Injection</td><td>Inyectar SQL en entradas de la app</td><td>Consultas parametrizadas, WAF</td></tr>
<tr><td>XSS</td><td>Inyectar scripts en páginas</td><td>Escapar salida, CSP</td></tr>
<tr><td>DNS spoofing/tunneling</td><td>Respuestas falsas / exfiltración por DNS</td><td>DNSSEC, monitoreo de DNS</td></tr>
<tr><td>Ingeniería social</td><td>Manipular personas (llamadas "de soporte")</td><td>Procedimientos de verificación, capacitación</td></tr></table>
<pre>! Defensas de capa 2 en Cisco
ip dhcp snooping
ip dhcp snooping vlan 10,20
interface gi0/1
 ip dhcp snooping trust          ! solo el uplink hacia el DHCP legítimo
ip arp inspection vlan 10,20</pre>` },
    { t: 'Firewalls, IDS/IPS, proxies y segmentación', h: `
<h4>Tipos de firewall</h4>
<ul><li><b>Filtrado de paquetes (stateless)</b>: ACLs por IP/puerto.</li><li><b>Stateful</b>: recuerda conexiones y permite el tráfico de retorno automáticamente.</li><li><b>NGFW</b> (Next-Gen): identifica aplicaciones y usuarios, IPS integrado, inspección TLS, filtrado web, sandbox. Ej.: Palo Alto, Fortinet FortiGate, Cisco Firepower, Check Point; open source: pfSense/OPNsense.</li><li><b>WAF</b>: protege aplicaciones web (capa 7).</li></ul>
<h4>Zonas</h4>
<pre>Internet ── [Firewall] ── DMZ (web, mail, VPN)
                 └────── LAN interna (usuarios)
                 └────── Servidores / Datacenter
                 └────── Gestión (OOB)</pre>
<p>Política por defecto: <b>deny all</b> y permitir solo lo necesario. Reglas de lo más específico a lo más general. Revisarlas periódicamente (reglas "any-any" son señal de alarma).</p>
<h4>IDS vs IPS</h4>
<p><b>IDS</b> detecta y alerta (fuera de línea, en un puerto SPAN/TAP). <b>IPS</b> está en línea y bloquea. Detección por <b>firmas</b> o por <b>anomalías</b>. Herramientas: Snort, Suricata, Zeek.</p>
<h4>Otros controles</h4>
<p><b>Proxy</b> / filtrado web, <b>NAC</b> (802.1X: el equipo se autentica antes de obtener acceso a la red), <b>EDR/XDR</b> en endpoints, <b>SIEM</b> (centraliza y correlaciona logs: Splunk, QRadar, Microsoft Sentinel, Wazuh, Elastic Security), <b>SOAR</b> (automatiza respuestas), <b>honeypots</b>.</p>
<p><b>Segmentación</b> y <b>Zero Trust</b>: "nunca confiar, siempre verificar" — cada acceso se valida por identidad, dispositivo y contexto, aunque venga de la red interna; microsegmentación y mínimo privilegio.</p>` },
    { t: 'Criptografía y VPN', h: `
<table><tr><th>Tipo</th><th>Cómo funciona</th><th>Ejemplos</th></tr>
<tr><td>Simétrica</td><td>Misma clave para cifrar y descifrar. Rápida</td><td>AES-128/256, ChaCha20</td></tr>
<tr><td>Asimétrica</td><td>Par de claves pública/privada. Lenta; para intercambio de claves y firmas</td><td>RSA, ECC (ECDSA, Ed25519), Diffie-Hellman</td></tr>
<tr><td>Hash</td><td>Huella de longitud fija, no reversible: integridad</td><td>SHA-256, SHA-3 (MD5 y SHA-1 obsoletos)</td></tr>
<tr><td>HMAC</td><td>Hash + clave: integridad y autenticidad</td><td>HMAC-SHA256</td></tr></table>
<p><b>PKI</b>: una <b>CA</b> firma certificados (X.509) que asocian una clave pública a una identidad. TLS 1.2/1.3 usa asimétrica para autenticar e intercambiar la clave y simétrica para los datos. Errores típicos: certificado vencido, nombre que no coincide (CN/SAN), CA no confiable, cadena incompleta.</p>
<h4>VPN</h4>
<ul><li><b>IPsec site-to-site</b>: une redes (sede–sucursal, on-prem–cloud). <b>IKE</b> (UDP 500, NAT-T UDP 4500) negocia: <b>Fase 1</b> crea un canal seguro (IKE SA: cifrado, hash, DH group, autenticación PSK/certificados, lifetime). <b>Fase 2</b> crea los túneles de datos (IPsec SA) con <b>ESP</b> (protocolo IP 50, cifra) o AH (51, solo integridad). Debe coincidir el "interesting traffic" (proxy IDs/ACL crypto) en ambos lados.</li>
<li><b>Remote access</b>: SSL/TLS VPN (AnyConnect/Cisco Secure Client, FortiClient, GlobalProtect), OpenVPN (UDP 1194), <b>WireGuard</b> (UDP 51820, moderno y simple), IPsec IKEv2.</li>
<li><b>Split tunneling</b>: solo el tráfico corporativo va por la VPN.</li></ul>
<div class="noc">VPN site-to-site caída: revisar Fase 1 (¿coinciden parámetros y PSK? ¿llega UDP 500/4500?) → Fase 2 (¿coinciden las redes/ACL y el PFS?) → ruteo y NAT exemption. En Cisco: <code>show crypto isakmp sa</code>, <code>show crypto ipsec sa</code>.</div>` },
    { t: 'Hardening y buenas prácticas', h: `
<ul><li><b>Parches</b> y actualizaciones con proceso (priorizar CVEs críticos y explotados: catálogo KEV de CISA).</li>
<li><b>Mínimo privilegio</b> y cuentas separadas para administración. Gestión de accesos privilegiados (PAM).</li>
<li><b>MFA</b> en todo lo expuesto (VPN, correo, consolas cloud).</li>
<li><b>Contraseñas</b>: largas (frases), gestor de contraseñas, sin reutilizar; cambiar credenciales por defecto.</li>
<li><b>Servicios innecesarios apagados</b>: Telnet, HTTP de gestión, SNMPv1/v2c con "public", CDP hacia afuera.</li>
<li><b>Gestión segura</b>: SSH v2, HTTPS, SNMPv3, red de gestión aislada, ACLs en vty, TACACS+, banner legal, logging a syslog central, NTP.</li>
<li><b>Backups 3-2-1</b> probados (¡restaurar de prueba!), al menos una copia offline o inmutable.</li>
<li><b>Cifrado</b> en tránsito (TLS) y en reposo (BitLocker, LUKS).</li>
<li><b>Logging y monitoreo</b>: SIEM, retención, alertas sobre logins fallidos, cambios de config y cuentas privilegiadas.</li>
<li><b>Benchmarks</b>: CIS Benchmarks, guías de hardening del fabricante.</li></ul>
<pre># Linux rápido
sudo apt install fail2ban unattended-upgrades
sudo ufw default deny incoming &amp;&amp; sudo ufw allow 22/tcp &amp;&amp; sudo ufw enable
# /etc/ssh/sshd_config: PermitRootLogin no · PasswordAuthentication no · MaxAuthTries 3</pre>` },
    { t: 'Frameworks y respuesta a incidentes', h: `
<h4>Frameworks</h4>
<ul><li><b>NIST CSF 2.0</b>: funciones <b>Govern, Identify, Protect, Detect, Respond, Recover</b>.</li>
<li><b>ISO/IEC 27001</b>: sistema de gestión de seguridad de la información (SGSI), certificable.</li>
<li><b>CIS Controls v8</b>: 18 controles priorizados.</li>
<li><b>MITRE ATT&amp;CK</b>: catálogo de tácticas y técnicas de atacantes (Initial Access, Execution, Persistence, Privilege Escalation, Lateral Movement, Exfiltration...).</li>
<li><b>Cyber Kill Chain</b> (Lockheed): Reconnaissance → Weaponization → Delivery → Exploitation → Installation → C2 → Actions on Objectives.</li>
<li><b>OWASP Top 10</b>: riesgos de aplicaciones web (Broken Access Control, Cryptographic Failures, Injection...).</li>
<li>En Argentina: Ley 25.326 de Protección de Datos Personales.</li></ul>
<h4>Respuesta a incidentes (NIST SP 800-61)</h4>
<ol><li><b>Preparación</b>: playbooks, contactos, herramientas, backups.</li><li><b>Detección y análisis</b>: alertas del SIEM/EDR, IoCs (IPs, hashes, dominios), alcance.</li><li><b>Contención, erradicación y recuperación</b>: aislar el equipo (sin apagarlo si se necesita forense), bloquear IoCs, resetear credenciales, limpiar/reinstalar, restaurar.</li><li><b>Actividad post-incidente</b>: lecciones aprendidas, mejoras.</li></ol>
<div class="warn">Ante un posible ransomware: <b>aislá de la red</b> el equipo (cable/Wi-Fi), no lo apagues sin consultar, avisá al equipo de seguridad y preservá evidencia. Cadena de custodia si hay implicancias legales.</div>
<h4>Ruta de certificaciones sugerida</h4>
<p>CCNA → CompTIA Security+ → Cisco CyberOps Associate / CompTIA CySA+ → (ofensiva) eJPT, PNPT, OSCP · (cloud) AWS/Azure Security. Práctica: <b>TryHackMe</b> (SOC Level 1, Pre-Security), <b>Hack The Box</b>, <b>Blue Team Labs Online</b>, <b>LetsDefend</b>.</p>` }
  ],
  english: [
    ['threat', 'amenaza', 'Phishing is the most common threat we see.'],
    ['vulnerability', 'vulnerabilidad', 'This vulnerability has a CVSS score of 9.8.'],
    ['to patch', 'parchear / aplicar parches', 'Patch all firewalls before Friday.'],
    ['breach', 'brecha / filtración', 'The data breach exposed customer emails.'],
    ['least privilege', 'mínimo privilegio', 'Apply the principle of least privilege.'],
    ['multi-factor authentication', 'autenticación multifactor', 'Enable multi-factor authentication on the VPN.'],
    ['to contain', 'contener', 'We contained the incident by isolating the host.'],
    ['indicator of compromise (IoC)', 'indicador de compromiso', 'Block all IoCs at the firewall.'],
    ['hardening', 'endurecimiento / bastionado', 'Follow the CIS benchmark for server hardening.'],
    ['encryption at rest / in transit', 'cifrado en reposo / en tránsito', 'Data must be encrypted at rest and in transit.'],
    ['lateral movement', 'movimiento lateral', 'Segmentation limits lateral movement.'],
    ['to whitelist / allowlist', 'permitir explícitamente', 'Allowlist only the required IP addresses.'],
    ['tunnel', 'túnel', 'The IPsec tunnel is down after phase 1 failed.'],
    ['brute-force attack', 'ataque de fuerza bruta', 'Fail2ban blocks brute-force attacks on SSH.']
  ],
  phrases: [
    ['We detected suspicious activity on your account.', 'Detectamos actividad sospechosa en tu cuenta.'],
    ['Please do not click the link and forward the email to security.', 'No hagas clic en el enlace y reenviá el mail a seguridad.'],
    ['The host has been isolated from the network for analysis.', 'El equipo fue aislado de la red para su análisis.']
  ],
  flash: [
    ['CIA', 'Confidencialidad, Integridad, Disponibilidad'], ['AAA', 'Authentication, Authorization, Accounting'],
    ['RADIUS vs TACACS+', 'RADIUS: UDP, cifra solo password · TACACS+: TCP 49, cifra todo, autoriza por comando'],
    ['Mitigación ARP spoofing', 'Dynamic ARP Inspection (DAI)'], ['Mitigación rogue DHCP', 'DHCP Snooping'], ['IDS vs IPS', 'IDS detecta/alerta; IPS en línea y bloquea'],
    ['IKE fases', 'Fase 1: canal seguro IKE SA · Fase 2: IPsec SAs para datos'], ['Puertos IPsec', 'UDP 500 (IKE), UDP 4500 (NAT-T), ESP = protocolo 50'],
    ['Hash seguro actual', 'SHA-256 / SHA-3'], ['Funciones NIST CSF 2.0', 'Govern, Identify, Protect, Detect, Respond, Recover'],
    ['Riesgo =', 'Probabilidad × Impacto'], ['Zero Trust', 'Nunca confiar, siempre verificar']
  ],
  quiz: [
    { q: 'Un atacante envía respuestas ARP falsas para hacerse pasar por el gateway. ¿Qué lo mitiga en el switch?', o: ['PortFast', 'Dynamic ARP Inspection', 'VTP', 'HSRP'], a: 1, e: 'DAI valida ARP contra la tabla de DHCP Snooping.' },
    { q: '¿Qué protocolo AAA cifra todo el paquete y permite autorizar comando por comando?', o: ['RADIUS', 'TACACS+', 'LDAP', 'Kerberos'], a: 1, e: 'TACACS+ (TCP 49).' },
    { q: 'La disponibilidad se ve afectada principalmente por:', o: ['Un sniffer', 'Un DDoS', 'Una modificación de datos', 'Phishing'], a: 1, e: 'DoS/DDoS ataca la "A" de CIA.' },
    { q: 'Diferencia entre IDS e IPS', o: ['No hay', 'El IPS está en línea y puede bloquear', 'El IDS cifra', 'El IPS solo genera reportes'], a: 1, e: 'IDS = detección pasiva.' },
    { q: 'Una VPN site-to-site no levanta y `show crypto isakmp sa` no muestra nada. ¿Dónde está el problema?', o: ['Fase 2', 'Fase 1 / conectividad UDP 500', 'DNS', 'STP'], a: 1, e: 'Sin IKE SA, la fase 1 ni empezó: parámetros, PSK o UDP 500/4500 bloqueado.' },
    { q: '¿Qué algoritmo es de cifrado simétrico?', o: ['RSA', 'AES', 'SHA-256', 'ECDSA'], a: 1, e: 'AES es simétrico; SHA-256 es hash; RSA/ECDSA asimétricos.' },
    { q: 'Primer paso ante sospecha de ransomware en una PC', o: ['Pagar', 'Aislarla de la red', 'Formatear de inmediato', 'Ignorar'], a: 1, e: 'Contener evita la propagación. Preservar evidencia.' },
    { q: 'El principio "nunca confiar, siempre verificar" es...', o: ['Defense in depth', 'Zero Trust', 'Security by obscurity', 'Fail open'], a: 1, e: 'Zero Trust.' },
    { q: '¿Qué registro DNS ayuda a prevenir suplantación de dominio de correo?', o: ['SPF/DKIM/DMARC (TXT)', 'PTR', 'CNAME', 'AAAA'], a: 0, e: 'Autentican el correo saliente del dominio.' },
    { q: 'Función agregada en NIST CSF 2.0', o: ['Recover', 'Govern', 'Detect', 'Protect'], a: 1, e: 'CSF 2.0 (2024) agregó Govern.' },
    { q: 'Un CVE con CVSS 9.8 significa:', o: ['Riesgo bajo', 'Vulnerabilidad crítica', 'Malware', 'Falso positivo'], a: 1, e: 'CVSS 9.0–10 = crítica.' },
    { q: '¿Qué ataque se mitiga con consultas parametrizadas?', o: ['XSS', 'SQL Injection', 'ARP spoofing', 'DDoS'], a: 1, e: 'Las consultas parametrizadas separan datos de código SQL.' }
  ],
  lab: { t: 'Lab 10: Blue team en casa', h: `
<ol><li>En tu VM Linux: instalá <code>fail2ban</code>, simulá intentos fallidos de SSH desde otra máquina y verificá el baneo con <code>sudo fail2ban-client status sshd</code>.</li>
<li>Analizá <code>/var/log/auth.log</code>: top de IPs con intentos fallidos (el one-liner de la unidad 7).</li>
<li>Escaneá <b>tu propia</b> VM con <code>nmap -sV</code> y cerrá todo lo que no sea necesario.</li>
<li>En Packet Tracer: configurá DHCP Snooping + DAI + port-security y probá conectar un "router DHCP falso".</li>
<li>Generá un hash: <code>sha256sum archivo.iso</code> y compará con el publicado por el fabricante.</li>
<li>Hacé las salas gratuitas de TryHackMe: <i>Pre Security</i>, <i>Intro to SIEM</i>, <i>Wireshark: The Basics</i>.</li>
<li>Escribí en inglés un reporte breve de incidente (qué, cuándo, impacto, contención, próximos pasos).</li></ol>
<div class="warn">Escaneos y pruebas solo en equipos propios o con autorización escrita.</div>` }
});

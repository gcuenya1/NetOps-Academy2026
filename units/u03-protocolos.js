window.UNITS.push({
  id: 'u03', num: 3, icon: '📡', short: 'Protocolos y servicios', time: '2 h', tool: 'ports',
  title: 'Protocolos y servicios: TCP/UDP, ARP, ICMP, DHCP, DNS, NAT',
  desc: 'Qué pasa realmente cuando escribís una URL en el navegador. Los servicios que más fallan y que más vas a diagnosticar.',
  goals: ['Explicar el 3-way handshake y diferencias TCP/UDP', 'Conocer los puertos más usados de memoria', 'Describir DORA (DHCP), resolución DNS y ARP', 'Entender NAT/PAT y por qué existe'],
  lessons: [
    { t: 'TCP vs UDP y puertos', h: `
<table><tr><th></th><th>TCP</th><th>UDP</th></tr>
<tr><td>Conexión</td><td>Orientado a conexión (handshake)</td><td>Sin conexión</td></tr>
<tr><td>Fiabilidad</td><td>ACKs, retransmisión, orden, control de flujo (ventana)</td><td>Best effort</td></tr>
<tr><td>Overhead</td><td>Encabezado 20+ B</td><td>Encabezado 8 B</td></tr>
<tr><td>Usos</td><td>HTTP/S, SSH, SMTP, bases de datos</td><td>DNS, DHCP, VoIP (RTP), streaming, SNMP, syslog, NTP</td></tr></table>
<h4>3-way handshake</h4>
<pre>Cliente  ── SYN (seq=x) ──────────────▶ Servidor
Cliente  ◀── SYN-ACK (seq=y, ack=x+1) ── Servidor
Cliente  ── ACK (ack=y+1) ────────────▶ Servidor
Cierre: FIN → ACK → FIN → ACK  ·  Abortar: RST</pre>
<p>Flags: <b>SYN, ACK, FIN, RST, PSH, URG</b>. Un <b>RST</b> al conectar suele significar "puerto cerrado"; un <b>timeout</b> (sin respuesta) suele indicar firewall que descarta.</p>
<h4>Rangos de puertos</h4>
<p><b>0–1023</b> bien conocidos · <b>1024–49151</b> registrados · <b>49152–65535</b> dinámicos/efímeros (los usa el cliente como puerto origen).</p>
<table><tr><th>Puerto</th><th>Servicio</th><th>Puerto</th><th>Servicio</th></tr>
<tr><td>20/21</td><td>FTP</td><td>161/162</td><td>SNMP / traps (UDP)</td></tr>
<tr><td>22</td><td>SSH / SFTP / SCP</td><td>389 / 636</td><td>LDAP / LDAPS</td></tr>
<tr><td>23</td><td>Telnet (inseguro)</td><td>443</td><td>HTTPS</td></tr>
<tr><td>25 / 587</td><td>SMTP / submission</td><td>445</td><td>SMB</td></tr>
<tr><td>53</td><td>DNS (UDP y TCP)</td><td>514</td><td>Syslog (UDP)</td></tr>
<tr><td>67/68</td><td>DHCP servidor/cliente</td><td>1812/1813</td><td>RADIUS</td></tr>
<tr><td>69</td><td>TFTP</td><td>3306</td><td>MySQL</td></tr>
<tr><td>80</td><td>HTTP</td><td>3389</td><td>RDP</td></tr>
<tr><td>110 / 995</td><td>POP3 / POP3S</td><td>5432</td><td>PostgreSQL</td></tr>
<tr><td>123</td><td>NTP</td><td>179</td><td>BGP (TCP)</td></tr>
<tr><td>143 / 993</td><td>IMAP / IMAPS</td><td>500 / 4500</td><td>IPsec IKE / NAT-T</td></tr></table>
<div class="tip">Jugá <a href="#/tool/ports">Port Rush</a> hasta superar 15 aciertos en 60 segundos.</div>` },
    { t: 'ARP e ICMP (ping y traceroute)', h: `
<h4>ARP — Address Resolution Protocol</h4>
<p>Traduce <b>IP → MAC</b> dentro de la misma red. El host pregunta por broadcast: <i>"¿Quién tiene 192.168.1.1? Decile a 192.168.1.20"</i> y el dueño responde por unicast. La respuesta se guarda en la <b>caché ARP</b> (<code>arp -a</code>, <code>ip neigh</code>).</p>
<p>Si el destino está en <b>otra red</b>, el host hace ARP por la MAC de su <b>gateway</b>, no del destino final. Las IPs origen/destino se mantienen extremo a extremo; las MAC cambian en cada salto.</p>
<p><b>Gratuitous ARP</b>: un equipo anuncia su propia IP (detección de IP duplicada, failover de HSRP/VRRP).</p>
<h4>ICMP</h4>
<table><tr><th>Tipo</th><th>Mensaje</th></tr>
<tr><td>0</td><td>Echo Reply</td></tr><tr><td>3</td><td>Destination Unreachable (code 3 = port unreachable, 4 = fragmentation needed)</td></tr>
<tr><td>5</td><td>Redirect</td></tr><tr><td>8</td><td>Echo Request (ping)</td></tr><tr><td>11</td><td>Time Exceeded (TTL = 0) → base de traceroute</td></tr></table>
<p><b>traceroute</b> envía paquetes con TTL 1, 2, 3... y cada router que descarta por TTL=0 responde ICMP 11, revelando su IP. Windows usa ICMP (<code>tracert</code>); Linux usa UDP por defecto.</p>
<div class="noc">Asteriscos <code>* * *</code> en un salto intermedio no siempre son un problema: muchos routers limitan ICMP. Preocupate si <b>desde ese salto en adelante</b> todo falla o la latencia se dispara y se mantiene.</div>` },
    { t: 'DHCP: proceso DORA', h: `
<pre>Cliente (0.0.0.0:68)                Servidor (:67)
  ── DISCOVER (broadcast) ───────────▶
  ◀── OFFER (IP propuesta) ───────────
  ── REQUEST (broadcast: "acepto") ──▶
  ◀── ACK (confirmación + lease) ─────</pre>
<p>El servidor entrega: IP, máscara, <b>gateway</b> (option 3), <b>DNS</b> (option 6), dominio, tiempo de <b>lease</b>. Option 66/150 se usa para TFTP en telefonía IP; option 43 para controladoras Wi-Fi.</p>
<p>Renovación: al 50% del lease (T1) el cliente pide renovar por unicast; al 87.5% (T2) por broadcast.</p>
<h4>DHCP Relay</h4>
<p>Como DISCOVER es broadcast y los routers no reenvían broadcasts, si el servidor está en otra red se configura <code>ip helper-address 10.0.0.5</code> en la interfaz del gateway de los clientes.</p>
<div class="warn">Problemas típicos: scope agotado, falta de <code>ip helper-address</code>, servidor DHCP no autorizado (<i>rogue DHCP</i>, se mitiga con DHCP Snooping), VLAN mal asignada.</div>` },
    { t: 'DNS: resolución de nombres', h: `
<p>Traduce nombres a IPs. Usa <b>UDP 53</b> (consultas) y <b>TCP 53</b> (transferencias de zona y respuestas grandes). DoH (443) y DoT (853) lo cifran.</p>
<h4>Proceso</h4>
<ol><li>Caché local del equipo y archivo <code>hosts</code>.</li><li>Consulta <b>recursiva</b> al resolver (DNS del ISP, 8.8.8.8, 1.1.1.1, o el DC de AD).</li><li>El resolver consulta de forma <b>iterativa</b>: servidores raíz → TLD (.com, .ar) → autoritativo del dominio.</li><li>La respuesta se cachea durante su <b>TTL</b>.</li></ol>
<table><tr><th>Registro</th><th>Uso</th></tr>
<tr><td>A / AAAA</td><td>Nombre → IPv4 / IPv6</td></tr><tr><td>CNAME</td><td>Alias de otro nombre</td></tr>
<tr><td>MX</td><td>Servidores de correo</td></tr><tr><td>NS</td><td>Servidores autoritativos</td></tr>
<tr><td>PTR</td><td>Reverso: IP → nombre</td></tr><tr><td>TXT</td><td>SPF, DKIM, DMARC, verificaciones</td></tr>
<tr><td>SOA</td><td>Datos de la zona (serial, refresh)</td></tr><tr><td>SRV</td><td>Ubicación de servicios (AD, SIP)</td></tr></table>
<pre>nslookup google.com 8.8.8.8
dig example.com A +short
dig -x 8.8.8.8
dig MX gmail.com
ipconfig /flushdns      (Windows)
resolvectl flush-caches (Linux systemd)</pre>
<div class="noc">"It's always DNS." Si el usuario hace ping a 8.8.8.8 pero no navega por nombre, el sospechoso número uno es DNS.</div>` },
    { t: 'NAT/PAT, HTTP/HTTPS y otros servicios', h: `
<h4>NAT</h4>
<p>Traduce IPs privadas a públicas. <b>Estático</b> (1 a 1, para publicar un servidor), <b>dinámico</b> (pool), <b>PAT / NAT overload</b> (muchos a una IP usando puertos distintos: lo que hace tu router hogareño). Términos Cisco: <i>inside local</i> (IP privada del host), <i>inside global</i> (IP pública que lo representa), <i>outside global</i> (IP del servidor en Internet).</p>
<p><b>Port forwarding</b> = NAT estático de un puerto (ej.: público :8443 → 192.168.1.10:443).</p>
<h4>HTTP / HTTPS</h4>
<p>Métodos: GET, POST, PUT, PATCH, DELETE. Códigos: <b>2xx</b> éxito (200 OK, 201 Created) · <b>3xx</b> redirección (301, 302, 304) · <b>4xx</b> error del cliente (400, 401 sin autenticar, 403 prohibido, 404 no existe, 429 demasiadas peticiones) · <b>5xx</b> error del servidor (500, 502 Bad Gateway, 503 no disponible, 504 Gateway Timeout).</p>
<p>HTTPS = HTTP sobre <b>TLS</b>: el servidor presenta un <b>certificado</b> firmado por una CA; se negocia una clave simétrica de sesión.</p>
<h4>Otros</h4>
<p><b>NTP</b> (UDP 123): sincroniza la hora. Fundamental para correlacionar logs, Kerberos y certificados. <b>Syslog</b> (UDP 514): envío centralizado de logs. <b>SNMP</b>: monitoreo (lo vemos en la unidad NOC). <b>LLDP/CDP</b>: descubrimiento de vecinos.</p>
<h4>¿Qué pasa al escribir https://www.ejemplo.com?</h4>
<ol><li>DNS resuelve el nombre.</li><li>ARP por la MAC del gateway.</li><li>TCP handshake con el puerto 443.</li><li>TLS handshake y validación del certificado.</li><li>HTTP GET; NAT/PAT en el router de salida.</li><li>El servidor responde 200 OK y el navegador renderiza.</li></ol>
<div class="en">Classic interview question: "Walk me through what happens when you type a URL into your browser." Practice it in the English Lab.</div>` }
  ],
  english: [
    ['handshake', 'saludo / negociación inicial', 'The TCP three-way handshake never completes.'],
    ['acknowledgment (ACK)', 'confirmación', 'The server sends an acknowledgment for each segment.'],
    ['lease', 'concesión (DHCP)', 'The DHCP lease expires every 8 hours.'],
    ['name resolution', 'resolución de nombres', 'Name resolution is failing for internal domains.'],
    ['lookup', 'consulta', 'Run a DNS lookup against 8.8.8.8.'],
    ['port forwarding', 'redirección de puertos', 'We set up port forwarding for the web server.'],
    ['timeout', 'tiempo de espera agotado', 'The connection attempt ended in a timeout.'],
    ['unreachable', 'inalcanzable', 'The ping returned "Destination host unreachable".'],
    ['hop', 'salto', 'Latency increases after the third hop.'],
    ['to flush the cache', 'vaciar la caché', 'Flush the DNS cache and try again.'],
    ['scope / pool', 'ámbito / rango (DHCP)', 'The DHCP scope is exhausted.'],
    ['status code', 'código de estado', 'The API returns status code 503.']
  ],
  flash: [
    ['3-way handshake', 'SYN → SYN-ACK → ACK'], ['DORA', 'Discover, Offer, Request, Acknowledge'],
    ['Puerto de RDP', '3389/TCP'], ['Puerto de SNMP y traps', '161 / 162 UDP'], ['Puerto de syslog', '514/UDP'],
    ['Registro DNS para correo', 'MX'], ['Registro DNS inverso', 'PTR'], ['ICMP tipo 11', 'Time Exceeded (traceroute)'],
    ['Comando Cisco para DHCP relay', 'ip helper-address <ip-servidor>'], ['HTTP 502', 'Bad Gateway: el proxy/balanceador recibió una respuesta inválida del backend'],
    ['¿ARP a qué MAC si el destino está en otra red?', 'A la MAC del default gateway']
  ],
  quiz: [
    { q: '¿Qué protocolo de transporte usa normalmente DNS para consultas?', o: ['TCP 53', 'UDP 53', 'UDP 67', 'TCP 443'], a: 1, e: 'Consultas por UDP 53; TCP 53 para zonas o respuestas grandes.' },
    { q: 'Orden correcto de DHCP', o: ['Request, Offer, Discover, Ack', 'Discover, Offer, Request, Ack', 'Discover, Request, Offer, Ack', 'Offer, Discover, Ack, Request'], a: 1, e: 'DORA.' },
    { q: 'Al intentar conectar a un puerto recibís un `RST`. ¿Qué significa normalmente?', o: ['Firewall descartando', 'Puerto cerrado en el host', 'DNS caído', 'Congestión'], a: 1, e: 'RST = el host respondió que no hay servicio. Un firewall que descarta produce timeout.' },
    { q: 'Los clientes de la VLAN 20 no reciben DHCP; el servidor está en otra red. ¿Qué falta probablemente?', o: ['NAT', 'ip helper-address en el gateway de VLAN 20', 'Un registro MX', 'PortFast'], a: 1, e: 'El relay reenvía el broadcast DHCP como unicast al servidor.' },
    { q: 'Un usuario hace ping a 8.8.8.8 OK pero no abre ninguna web por nombre. Primer sospechoso:', o: ['Cable', 'DNS', 'Gateway', 'Switch'], a: 1, e: 'Hay conectividad IP, falla la resolución de nombres.' },
    { q: '¿Qué mensaje ICMP aprovecha traceroute?', o: ['Echo Reply', 'Redirect', 'Time Exceeded', 'Source Quench'], a: 2, e: 'Cada router que lleva el TTL a 0 devuelve ICMP 11.' },
    { q: '¿Qué tipo de NAT usa un router hogareño para que muchos equipos salgan con una IP pública?', o: ['NAT estático', 'PAT / NAT overload', 'NAT64', 'DNAT'], a: 1, e: 'PAT diferencia las sesiones por puerto.' },
    { q: 'Código HTTP cuando no tenés permiso aunque estés autenticado', o: ['401', '403', '404', '500'], a: 1, e: '401 = no autenticado; 403 = autenticado pero prohibido.' },
    { q: '¿Qué puerto usa SSH?', o: ['21', '22', '23', '25'], a: 1, e: 'SSH/SCP/SFTP: TCP 22.' },
    { q: '¿Por qué es crítico NTP en un NOC?', o: ['Acelera la red', 'Para correlacionar logs y que funcionen Kerberos/certificados', 'Reemplaza DNS', 'Asigna IPs'], a: 1, e: 'Sin hora sincronizada, los logs de distintos equipos no se pueden comparar.' },
    { q: 'Registro DNS que suele contener SPF', o: ['A', 'TXT', 'PTR', 'CNAME'], a: 1, e: 'SPF, DKIM y DMARC se publican en TXT.' }
  ],
  lab: { t: 'Lab 3: Diagnosticar servicios desde tu PC', h: `
<pre>ipconfig /all                  # ¿DHCP habilitado? ¿lease? ¿DNS?
ipconfig /release &amp;&amp; ipconfig /renew
nslookup www.unrc.edu.ar
nslookup -type=mx gmail.com
tracert 8.8.8.8
netstat -ano | findstr ESTABLISHED
Test-NetConnection google.com -Port 443   # PowerShell
curl -I https://www.google.com</pre>
<ol><li>Anotá servidor DHCP, DNS y gateway de tu PC.</li><li>Capturá con Wireshark un <code>ipconfig /renew</code> y encontrá los 4 mensajes DORA (filtro <code>dhcp</code> o <code>bootp</code>).</li><li>Capturá el handshake TCP al abrir una web (filtro <code>tcp.port==443</code>).</li><li>Contá cuántos saltos hay hasta 8.8.8.8 y cuál introduce más latencia.</li></ol>` }
});

window.UNITS.push({
  id: 'u01', num: 1, icon: '🧱', short: 'Fundamentos de redes', time: '1.5 h',
  title: 'Fundamentos de redes: OSI, TCP/IP y Ethernet',
  desc: 'La base de todo: modelos de capas, encapsulación, Ethernet, direcciones MAC, medios físicos y métricas de desempeño.',
  goals: ['Explicar cada capa del modelo OSI y su equivalente TCP/IP', 'Entender cómo un switch aprende MACs y reenvía tramas', 'Elegir el medio físico correcto (UTP / fibra) según el escenario', 'Diferenciar ancho de banda, throughput, latencia y jitter'],
  lessons: [
    { t: 'Qué es una red: tipos, topologías y dispositivos', h: `
<p>Una <b>red</b> es un conjunto de dispositivos interconectados que comparten recursos e información usando reglas comunes (<b>protocolos</b>).</p>
<h4>Tipos por alcance</h4>
<table><tr><th>Tipo</th><th>Alcance</th><th>Ejemplo</th></tr>
<tr><td>PAN</td><td>Personal (metros)</td><td>Bluetooth celular–auriculares</td></tr>
<tr><td>LAN / WLAN</td><td>Edificio, campus</td><td>Red de la escuela, Wi-Fi de oficina</td></tr>
<tr><td>MAN</td><td>Ciudad</td><td>Anillo de fibra municipal</td></tr>
<tr><td>WAN</td><td>Países / mundo</td><td>Internet, MPLS entre sucursales</td></tr></table>
<h4>Topologías</h4>
<p><b>Estrella</b> (la más usada en LAN: todo va a un switch), <b>bus</b> (histórica), <b>anillo</b> (fibra metropolitana, SDH), <b>malla completa/parcial</b> (núcleo WAN, redundancia), <b>árbol/jerárquica</b> (diseño de 3 capas: <i>core – distribution – access</i>), <b>spine-leaf</b> (datacenters).</p>
<h4>Dispositivos clave</h4>
<table><tr><th>Dispositivo</th><th>Capa OSI</th><th>Función</th></tr>
<tr><td>Hub</td><td>1</td><td>Repite bits a todos los puertos (obsoleto)</td></tr>
<tr><td>Switch</td><td>2 (o 3)</td><td>Reenvía tramas según la MAC destino</td></tr>
<tr><td>Router</td><td>3</td><td>Reenvía paquetes entre redes según IP destino</td></tr>
<tr><td>Access Point</td><td>2</td><td>Puente entre Wi-Fi y la red cableada</td></tr>
<tr><td>Firewall</td><td>3–7</td><td>Filtra tráfico según políticas</td></tr>
<tr><td>ONT / Módem</td><td>1–2</td><td>Termina el acceso del ISP (fibra, cable, DSL)</td></tr></table>
<div class="en">"The access layer connects end devices; the distribution layer aggregates access switches; the core layer provides high-speed transport."</div>` },
    { t: 'Modelo OSI vs TCP/IP', h: `
<p>Los modelos de capas dividen la comunicación en funciones. Sirven para <b>diseñar</b>, <b>aprender</b> y sobre todo para <b>hacer troubleshooting</b>.</p>
<table><tr><th>#</th><th>OSI</th><th>TCP/IP</th><th>PDU</th><th>Protocolos / ejemplos</th><th>Dispositivo</th></tr>
<tr><td>7</td><td>Aplicación</td><td rowspan="3">Aplicación</td><td rowspan="3">Datos</td><td>HTTP, DNS, SSH, SMTP, SNMP</td><td rowspan="3">Host, firewall L7</td></tr>
<tr><td>6</td><td>Presentación</td><td>TLS (cifrado), JPEG, ASCII/UTF-8</td></tr>
<tr><td>5</td><td>Sesión</td><td>Establecimiento/mantenimiento de sesiones, RPC</td></tr>
<tr><td>4</td><td>Transporte</td><td>Transporte</td><td>Segmento (TCP) / Datagrama (UDP)</td><td>TCP, UDP, puertos</td><td>Firewall L4</td></tr>
<tr><td>3</td><td>Red</td><td>Internet</td><td>Paquete</td><td>IPv4, IPv6, ICMP, OSPF</td><td>Router, switch L3</td></tr>
<tr><td>2</td><td>Enlace de datos</td><td rowspan="2">Acceso a la red</td><td>Trama (frame)</td><td>Ethernet, 802.11, PPP, ARP*</td><td>Switch, AP</td></tr>
<tr><td>1</td><td>Física</td><td>Bits</td><td>Cobre, fibra, radio, conectores</td><td>Hub, cable, transceptor</td></tr></table>
<p>Regla mnemotécnica (de abajo hacia arriba): <b>"Please Do Not Throw Sausage Pizza Away"</b> (Physical, Data link, Network, Transport, Session, Presentation, Application).</p>
<div class="noc">El troubleshooting <b>bottom-up</b> empieza por la capa 1: ¿hay link? ¿luces del puerto? ¿errores CRC? Recién después se mira IP, puertos y aplicación. El <b>divide &amp; conquer</b> arranca en la capa 3 con un <code>ping</code> y sube o baja según el resultado.</div>` },
    { t: 'Encapsulación, Ethernet y direcciones MAC', h: `
<p>Al enviar, cada capa agrega su encabezado (<b>encapsulación</b>); al recibir, cada capa lo quita (<b>desencapsulación</b>).</p>
<pre>Datos → [TCP hdr | Datos] → [IP hdr | TCP | Datos] → [Eth hdr | IP | TCP | Datos | FCS] → bits</pre>
<h4>Trama Ethernet II</h4>
<table><tr><th>Preámbulo + SFD</th><th>MAC destino</th><th>MAC origen</th><th>EtherType</th><th>Payload</th><th>FCS</th></tr>
<tr><td>8 B</td><td>6 B</td><td>6 B</td><td>2 B (0x0800 IPv4, 0x86DD IPv6, 0x0806 ARP, 0x8100 VLAN tag)</td><td>46–1500 B (MTU)</td><td>4 B (CRC)</td></tr></table>
<h4>Direcciones MAC</h4>
<p>48 bits, en hexadecimal: <code>00:1A:2B:3C:4D:5E</code>. Los primeros 24 bits son el <b>OUI</b> (fabricante). Tipos: <b>unicast</b>, <b>broadcast</b> <code>FF:FF:FF:FF:FF:FF</code> y <b>multicast</b> (<code>01:00:5E:..</code> para IPv4, <code>33:33:..</code> para IPv6).</p>
<h4>Cómo trabaja un switch</h4>
<ol><li><b>Aprende</b>: anota la MAC origen y el puerto por donde llegó (tabla MAC / CAM, aging ~300 s).</li>
<li><b>Reenvía</b>: si conoce la MAC destino, la manda solo por ese puerto (<i>forward</i>).</li>
<li><b>Inunda</b>: si es broadcast, multicast o MAC desconocida (<i>unknown unicast</i>), la manda por todos los puertos menos el de origen (<i>flood</i>).</li>
<li><b>Filtra</b>: si origen y destino están en el mismo puerto, la descarta.</li></ol>
<p>Métodos: <b>store-and-forward</b> (verifica FCS, el más común) y <b>cut-through</b> (menor latencia).</p>
<div class="tip">El FCS detecta errores pero no los corrige. Muchos errores CRC en un puerto suelen indicar cable dañado, conector mal crimpado, interferencia o <b>duplex mismatch</b>.</div>` },
    { t: 'Medios físicos: cobre, fibra y PoE', h: `
<h4>Par trenzado (UTP/STP)</h4>
<table><tr><th>Categoría</th><th>Velocidad típica</th><th>Frecuencia</th><th>Distancia</th></tr>
<tr><td>Cat5e</td><td>1 Gbps</td><td>100 MHz</td><td>100 m</td></tr>
<tr><td>Cat6</td><td>1 Gbps (10G hasta 55 m)</td><td>250 MHz</td><td>100 m</td></tr>
<tr><td>Cat6A</td><td>10 Gbps</td><td>500 MHz</td><td>100 m</td></tr>
<tr><td>Cat8</td><td>25/40 Gbps</td><td>2000 MHz</td><td>30 m (datacenter)</td></tr></table>
<p>Normas de armado: <b>T568A</b> y <b>T568B</b> (B: blanco-naranja, naranja, blanco-verde, azul, blanco-azul, verde, blanco-marrón, marrón). Cable <b>directo</b> = mismos extremos; <b>cruzado</b> = A en un extremo y B en el otro. Hoy casi todos los equipos tienen <b>Auto-MDIX</b>.</p>
<h4>Fibra óptica</h4>
<table><tr><th></th><th>Monomodo (SMF, OS2)</th><th>Multimodo (MMF, OM3/OM4)</th></tr>
<tr><td>Núcleo</td><td>9 µm</td><td>50 / 62.5 µm</td></tr>
<tr><td>Fuente</td><td>Láser 1310 / 1550 nm</td><td>VCSEL/LED 850 nm</td></tr>
<tr><td>Distancia</td><td>Decenas de km</td><td>Cientos de metros</td></tr>
<tr><td>Uso</td><td>WAN, FTTH, enlaces largos</td><td>Datacenter, campus</td></tr></table>
<p>Conectores: <b>LC</b> (el más común en SFP), <b>SC</b> (FTTH, APC verde / UPC azul), ST, MPO/MTP (alta densidad). Transceptores: SFP (1G), SFP+ (10G), SFP28 (25G), QSFP+ (40G), QSFP28 (100G).</p>
<h4>PoE (Power over Ethernet)</h4>
<p>802.3af (PoE, 15.4 W), 802.3at (PoE+, 30 W), 802.3bt (PoE++, 60/90 W). Alimenta APs, cámaras IP y teléfonos. En el NOC, un AP que se reinicia solo puede ser <b>presupuesto PoE</b> insuficiente en el switch.</p>` },
    { t: 'Dominios, duplex y métricas de desempeño', h: `
<p><b>Dominio de colisión</b>: segmento donde dos equipos pueden colisionar. Cada puerto de switch es su propio dominio de colisión (y en full duplex no hay colisiones).</p>
<p><b>Dominio de broadcast</b>: hasta donde llega un broadcast. Lo <b>cortan los routers</b> (y las VLANs lo segmentan). Un switch sin VLANs = un único dominio de broadcast.</p>
<h4>Duplex</h4>
<p><b>Half duplex</b>: transmite o recibe (CSMA/CD). <b>Full duplex</b>: ambos a la vez. Un <b>duplex mismatch</b> (un lado full, otro half) causa lentitud, colisiones tardías (<i>late collisions</i>) y errores CRC. Solución: dejar ambos lados en <i>auto</i> o fijar ambos igual.</p>
<h4>Métricas</h4>
<table><tr><th>Métrica</th><th>Qué es</th><th>Unidad</th></tr>
<tr><td>Ancho de banda (bandwidth)</td><td>Capacidad teórica del enlace</td><td>bps</td></tr>
<tr><td>Throughput</td><td>Lo que realmente pasa</td><td>bps</td></tr>
<tr><td>Goodput</td><td>Datos útiles de aplicación (sin overhead)</td><td>bps</td></tr>
<tr><td>Latencia</td><td>Demora extremo a extremo (RTT = ida y vuelta)</td><td>ms</td></tr>
<tr><td>Jitter</td><td>Variación de la latencia (crítico en VoIP/video)</td><td>ms</td></tr>
<tr><td>Pérdida (packet loss)</td><td>% de paquetes que no llegan</td><td>%</td></tr></table>
<div class="noc">Valores de referencia para VoIP: latencia &lt; 150 ms (una vía), jitter &lt; 30 ms, pérdida &lt; 1%.</div>
<div class="tip">Unidades: 1 Byte = 8 bits. Un link de 100 Mbps transfiere, como máximo, 12.5 MB/s. Los ISP venden en <b>bits</b>, Windows muestra descargas en <b>Bytes</b>.</div>` }
  ],
  english: [
    ['network', 'red', 'The branch network is down since 9 AM.'],
    ['switch', 'conmutador / switch', 'Plug the PC into port 12 on the access switch.'],
    ['router', 'enrutador', 'The router forwards packets between networks.'],
    ['frame', 'trama', 'The switch dropped the frame because of a bad FCS.'],
    ['packet', 'paquete', 'We are seeing packet loss on the WAN link.'],
    ['bandwidth', 'ancho de banda', 'The link is running out of bandwidth at peak hours.'],
    ['throughput', 'rendimiento real', 'Throughput is much lower than the contracted speed.'],
    ['latency', 'latencia', 'Latency to the data center jumped to 300 ms.'],
    ['jitter', 'variación de latencia', 'High jitter is causing choppy VoIP calls.'],
    ['broadcast domain', 'dominio de broadcast', 'Routers separate broadcast domains.'],
    ['twisted pair', 'par trenzado', 'We use Cat6 twisted pair cabling in the office.'],
    ['patch panel', 'patchera', 'Label every port on the patch panel.'],
    ['uplink', 'enlace ascendente', 'The uplink to the core switch is saturated.'],
    ['troubleshooting', 'diagnóstico y resolución de fallas', 'Start troubleshooting at the physical layer.']
  ],
  phrases: [
    ['Is the link light on?', '¿Está prendida la luz de link?'],
    ['Could you check if the cable is properly seated?', '¿Podés revisar si el cable está bien conectado?'],
    ['Let\'s work our way up the OSI model.', 'Vamos subiendo por el modelo OSI.']
  ],
  flash: [
    ['¿Qué capa OSI usa direcciones MAC?', 'Capa 2 – Enlace de datos'],
    ['PDU de la capa 4 con TCP', 'Segmento'],
    ['¿Qué hace un switch con una MAC destino desconocida?', 'Inunda (flood) la trama por todos los puertos menos el de origen'],
    ['MAC de broadcast', 'FF:FF:FF:FF:FF:FF'],
    ['EtherType de IPv4 / ARP / IPv6', '0x0800 / 0x0806 / 0x86DD'],
    ['Distancia máxima de UTP', '100 metros'],
    ['Longitud de onda típica en multimodo', '850 nm'],
    ['¿Qué corta los dominios de broadcast?', 'Los routers (y las VLANs los segmentan)'],
    ['Síntomas de duplex mismatch', 'Lentitud, late collisions, errores CRC'],
    ['Jitter', 'Variación de la latencia entre paquetes']
  ],
  quiz: [
    { q: '¿En qué capa del modelo OSI trabaja un router?', o: ['Capa 2', 'Capa 3', 'Capa 4', 'Capa 7'], a: 1, e: 'El router toma decisiones según la dirección IP destino: capa 3 (Red).' },
    { q: 'Un switch recibe una trama con MAC destino que no está en su tabla. ¿Qué hace?', o: ['La descarta', 'La envía al router', 'La inunda por todos los puertos excepto el de entrada', 'Envía un ARP'], a: 2, e: 'Unknown unicast → flooding. Cuando el destino responda, aprenderá su MAC.' },
    { q: '¿Cuál es la PDU de la capa de enlace de datos?', o: ['Paquete', 'Segmento', 'Trama', 'Bit'], a: 2, e: 'Capa 2 = trama (frame).' },
    { q: '¿Qué campo de la trama Ethernet sirve para detectar errores?', o: ['EtherType', 'FCS', 'Preámbulo', 'TTL'], a: 1, e: 'El FCS lleva un CRC de 32 bits que permite detectar tramas corruptas.' },
    { q: 'Necesitás unir dos edificios a 8 km. ¿Qué medio elegís?', o: ['UTP Cat6A', 'Fibra multimodo OM4', 'Fibra monomodo OS2', 'Coaxial RG6'], a: 2, e: 'Para km se usa monomodo con láser 1310/1550 nm. Multimodo llega a cientos de metros.' },
    { q: 'Un puerto muestra muchas late collisions y CRC. ¿Causa más probable?', o: ['VLAN incorrecta', 'Duplex mismatch', 'DNS caído', 'IP duplicada'], a: 1, e: 'Las colisiones tardías son el síntoma clásico de un lado en half y otro en full duplex.' },
    { q: '¿Qué protocolo pertenece a la capa de presentación (cifrado)?', o: ['TLS', 'IP', 'Ethernet', 'UDP'], a: 0, e: 'TLS se asocia a capa 6 (cifrado/formato), aunque en TCP/IP queda dentro de Aplicación.' },
    { q: 'El ISP te vende 300 Mbps. ¿Cuál es la descarga máxima teórica en MB/s?', o: ['300 MB/s', '37.5 MB/s', '30 MB/s', '2400 MB/s'], a: 1, e: '300 / 8 = 37.5 MB/s.' },
    { q: '¿Cuántos dominios de broadcast hay en un switch de 24 puertos sin VLANs adicionales?', o: ['24', '1', '2', '12'], a: 1, e: 'Un switch sin VLANs = un solo dominio de broadcast (y 24 de colisión).' },
    { q: 'Los primeros 24 bits de una MAC identifican...', o: ['La VLAN', 'El fabricante (OUI)', 'La subred', 'El puerto'], a: 1, e: 'OUI = Organizationally Unique Identifier.' },
    { q: '¿Qué estándar PoE entrega hasta 30 W por puerto?', o: ['802.3af', '802.3at (PoE+)', '802.3bt', '802.1Q'], a: 1, e: 'af = 15.4 W, at = 30 W, bt = 60/90 W.' }
  ],
  lab: { t: 'Lab 1: Wireshark y la tabla MAC', h: `
<ol><li>Instalá <b>Wireshark</b> y capturá 30 segundos en tu placa de red.</li>
<li>Filtrá <code>arp</code>, <code>dns</code> y <code>tcp.flags.syn==1</code>. Para un paquete DNS, identificá: MAC origen/destino, EtherType, IP origen/destino, puerto UDP 53.</li>
<li>Abrí la terminal y ejecutá <code>arp -a</code> (Windows) o <code>ip neigh</code> (Linux). ¿Coincide la MAC del gateway con la que viste en Wireshark?</li>
<li>Buscá el OUI de tu placa en <i>macvendors.com</i>.</li>
<li>En <b>Packet Tracer</b>: armá 1 switch + 3 PCs, hacé ping entre ellas y ejecutá <code>show mac address-table</code> en el switch.</li></ol>
<div class="en">Write a 3-line summary in English: "I captured traffic on my NIC. The frame carried an IPv4 packet with a UDP segment to port 53..."</div>` }
});

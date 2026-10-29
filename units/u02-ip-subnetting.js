window.UNITS.push({
  id: 'u02', num: 2, icon: '🧮', short: 'IPv4, Subnetting, IPv6', time: '2.5 h', tool: 'subnet',
  title: 'Direccionamiento IPv4, Subnetting, VLSM e IPv6',
  desc: 'Calcular subredes de memoria es la habilidad número 1 que te van a pedir en cualquier entrevista de redes o NOC.',
  goals: ['Calcular red, broadcast, rango y hosts de cualquier /n en menos de 30 s', 'Diseñar un esquema VLSM', 'Reconocer rangos privados y direcciones especiales', 'Leer y abreviar direcciones IPv6 y conocer sus tipos'],
  lessons: [
    { t: 'IPv4: estructura, clases y rangos especiales', h: `
<p>Una IPv4 tiene <b>32 bits</b> en 4 octetos: <code>192.168.10.25</code>. La <b>máscara</b> indica qué parte es red y cuál host: <code>255.255.255.0</code> = <code>/24</code>.</p>
<table><tr><th>Clase</th><th>1er octeto</th><th>Máscara por defecto</th></tr>
<tr><td>A</td><td>1–126</td><td>/8</td></tr><tr><td>B</td><td>128–191</td><td>/16</td></tr><tr><td>C</td><td>192–223</td><td>/24</td></tr><tr><td>D</td><td>224–239</td><td>Multicast</td></tr><tr><td>E</td><td>240–255</td><td>Experimental</td></tr></table>
<p>Hoy se usa <b>CIDR</b> (sin clases), pero las clases siguen apareciendo en exámenes.</p>
<h4>Privadas (RFC 1918) — no se enrutan en Internet</h4>
<p><code>10.0.0.0/8</code> · <code>172.16.0.0/12</code> (172.16–172.31) · <code>192.168.0.0/16</code></p>
<h4>Especiales</h4>
<table><tr><th>Rango</th><th>Uso</th></tr>
<tr><td>127.0.0.0/8</td><td>Loopback (127.0.0.1)</td></tr>
<tr><td>169.254.0.0/16</td><td><b>APIPA / link-local</b>: el equipo no consiguió DHCP</td></tr>
<tr><td>100.64.0.0/10</td><td>CGNAT (ISP)</td></tr>
<tr><td>0.0.0.0</td><td>"Cualquiera"/ruta por defecto</td></tr>
<tr><td>255.255.255.255</td><td>Broadcast limitado</td></tr>
<tr><td>192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24</td><td>Documentación/ejemplos</td></tr></table>
<div class="noc">Si un usuario tiene IP <code>169.254.x.x</code>, el problema es DHCP (servidor caído, scope agotado, VLAN incorrecta o cable). Es una pregunta clásica de soporte.</div>` },
    { t: 'Máscaras y CIDR: la tabla que tenés que saber', h: `
<table><tr><th>CIDR</th><th>Máscara</th><th>Bloque (salto)</th><th>Hosts útiles</th></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td></tr>
<tr><td>/29</td><td>255.255.255.248</td><td>8</td><td>6</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2 (enlaces punto a punto)</td></tr>
<tr><td>/31</td><td>255.255.255.254</td><td>2</td><td>2 (P2P, RFC 3021)</td></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>1</td><td>host (loopbacks)</td></tr></table>
<p>Valores posibles de un octeto de máscara: <b>128, 192, 224, 240, 248, 252, 254, 255</b>.</p>
<p>Fórmulas: hosts útiles = <b>2<sup>h</sup> − 2</b> (h = bits de host); subredes = <b>2<sup>s</sup></b> (s = bits prestados).</p>
<p>Para /16–/23 el truco es igual pero en el <b>tercer octeto</b>: /20 = 255.255.240.0 → salto de 16 en el 3er octeto → 4094 hosts.</p>` },
    { t: 'Método rápido de subnetting (número mágico)', h: `
<p>Ejemplo: <b>172.16.45.130/27</b></p>
<ol><li><b>Octeto interesante</b>: el que no es 255 ni 0 → 4to octeto (224).</li>
<li><b>Número mágico</b> = 256 − 224 = <b>32</b>. Las redes van de 32 en 32: 0, 32, 64, 96, 128, 160...</li>
<li>¿En qué bloque cae 130? Entre 128 y 160 → <b>Red: 172.16.45.128</b></li>
<li><b>Broadcast</b> = siguiente red − 1 = <b>172.16.45.159</b></li>
<li><b>Rango útil</b>: .129 a .158 · <b>Hosts</b>: 30</li></ol>
<p>Ejemplo 2: <b>10.20.77.9/21</b> → máscara 255.255.248.0 → octeto interesante = 3ro, mágico = 8 → bloques 0, 8, ..., 72, 80 → 77 cae en 72.</p>
<p>Red <code>10.20.72.0</code> · Broadcast <code>10.20.79.255</code> · Rango <code>10.20.72.1 – 10.20.79.254</code> · Hosts 2046.</p>
<h4>Wildcard</h4>
<p>Inverso de la máscara: 255.255.255.255 − máscara. Para /27 → <code>0.0.0.31</code>. Se usa en <b>ACLs</b> y <b>OSPF</b>.</p>
<div class="tip">Practicá en el laboratorio <a href="#/tool/subnet">Subnetting Trainer</a> hasta resolver 10 seguidas sin error.</div>` },
    { t: 'VLSM: diseñar un plan de direccionamiento', h: `
<p>VLSM = usar máscaras de distinto tamaño según la necesidad. <b>Regla: asignar primero las redes más grandes.</b></p>
<p>Red disponible: <code>192.168.50.0/24</code>. Necesidades: Ventas 100 hosts, Soporte 50, Servidores 20, enlace WAN 2.</p>
<table><tr><th>Red</th><th>Hosts</th><th>Prefijo</th><th>Subred</th><th>Rango útil</th><th>Broadcast</th></tr>
<tr><td>Ventas</td><td>100</td><td>/25 (126)</td><td>192.168.50.0</td><td>.1 – .126</td><td>.127</td></tr>
<tr><td>Soporte</td><td>50</td><td>/26 (62)</td><td>192.168.50.128</td><td>.129 – .190</td><td>.191</td></tr>
<tr><td>Servidores</td><td>20</td><td>/27 (30)</td><td>192.168.50.192</td><td>.193 – .222</td><td>.223</td></tr>
<tr><td>WAN</td><td>2</td><td>/30 (2)</td><td>192.168.50.224</td><td>.225 – .226</td><td>.227</td></tr></table>
<p>Queda libre <code>192.168.50.228 – .255</code> para crecer.</p>
<h4>Sumarización (supernetting)</h4>
<p>172.16.0.0/24, 172.16.1.0/24, 172.16.2.0/24 y 172.16.3.0/24 se pueden anunciar como <b>172.16.0.0/22</b>. Reduce el tamaño de las tablas de ruteo.</p>` },
    { t: 'IPv6 esencial', h: `
<p><b>128 bits</b> en 8 grupos de 16 bits en hexadecimal: <code>2001:0db8:0000:0000:0000:ff00:0042:8329</code></p>
<h4>Reglas de abreviación</h4>
<ol><li>Quitar ceros a la izquierda de cada grupo: <code>0db8 → db8</code>, <code>0042 → 42</code>.</li>
<li>Reemplazar <b>una sola</b> secuencia de grupos de ceros por <code>::</code>.</li></ol>
<p>Resultado: <code>2001:db8::ff00:42:8329</code></p>
<table><tr><th>Tipo</th><th>Prefijo</th><th>Equivale a</th></tr>
<tr><td>Global Unicast (GUA)</td><td>2000::/3</td><td>IP pública</td></tr>
<tr><td>Link-local</td><td>fe80::/10</td><td>Solo en el enlace; siempre presente</td></tr>
<tr><td>Unique Local (ULA)</td><td>fc00::/7 (fd00::/8)</td><td>IP privada</td></tr>
<tr><td>Multicast</td><td>ff00::/8</td><td>Reemplaza al broadcast (ff02::1 todos los nodos)</td></tr>
<tr><td>Loopback</td><td>::1/128</td><td>127.0.0.1</td></tr></table>
<p>Claves: <b>no hay broadcast</b>; <b>NDP</b> (ICMPv6) reemplaza a ARP; <b>SLAAC</b> permite autoconfiguración con el prefijo del router (RA); las LAN usan <b>/64</b>; <b>EUI-64</b> genera la interface ID desde la MAC insertando FFFE y cambiando el 7mo bit.</p>
<div class="en">"Dual-stack means the device runs IPv4 and IPv6 at the same time."</div>` }
  ],
  english: [
    ['subnet mask', 'máscara de subred', 'The subnet mask on this host is wrong.'],
    ['default gateway', 'puerta de enlace predeterminada', 'Users cannot reach the default gateway.'],
    ['prefix length', 'longitud de prefijo', 'Use a /30 prefix length for point-to-point links.'],
    ['host address', 'dirección de host', 'There are 62 usable host addresses in a /26.'],
    ['broadcast address', 'dirección de broadcast', 'You cannot assign the broadcast address to a host.'],
    ['addressing scheme', 'esquema de direccionamiento', 'We need a new addressing scheme for the branch.'],
    ['route summarization', 'sumarización de rutas', 'Route summarization keeps the routing table small.'],
    ['to run out of addresses', 'quedarse sin direcciones', 'The DHCP pool ran out of addresses.'],
    ['dual-stack', 'doble pila IPv4/IPv6', 'Our core network is dual-stack.'],
    ['wildcard mask', 'máscara wildcard', 'The ACL uses a wildcard mask of 0.0.0.255.'],
    ['usable range', 'rango útil', 'The usable range goes from .129 to .158.'],
    ['to allocate', 'asignar', 'Allocate the largest subnets first.']
  ],
  flash: [
    ['Hosts útiles en un /27', '30'], ['Máscara de un /26', '255.255.255.192'], ['Rangos privados RFC1918', '10/8, 172.16/12, 192.168/16'],
    ['IP 169.254.x.x significa...', 'APIPA: no obtuvo dirección por DHCP'], ['Wildcard de un /28', '0.0.0.15'],
    ['Red de 192.168.1.77/26', '192.168.1.64'], ['Broadcast de 10.1.1.33/29', '10.1.1.39'], ['Link-local IPv6', 'fe80::/10'],
    ['¿Qué reemplaza a ARP en IPv6?', 'NDP (Neighbor Discovery, ICMPv6)'], ['Abreviar 2001:0db8:0000:0000:0000:0000:0000:0001', '2001:db8::1'],
    ['Sumarizar 10.0.0.0/24 a 10.0.3.0/24', '10.0.0.0/22']
  ],
  quiz: [
    { q: '¿Cuál es la dirección de red de `172.16.45.130/27`?', o: ['172.16.45.128', '172.16.45.96', '172.16.45.130', '172.16.45.0'], a: 0, e: 'Salto de 32: 128 ≤ 130 < 160 → red .128.' },
    { q: '¿Cuántos hosts útiles tiene un `/22`?', o: ['1022', '1024', '510', '2046'], a: 0, e: '10 bits de host: 2^10 − 2 = 1022.' },
    { q: 'Broadcast de `192.168.10.200/28`', o: ['192.168.10.207', '192.168.10.255', '192.168.10.208', '192.168.10.199'], a: 0, e: 'Salto 16: bloque 192–207. Broadcast .207.' },
    { q: 'Un usuario tiene IP `169.254.12.8`. ¿Qué pasó?', o: ['Tiene IP pública', 'No obtuvo respuesta del servidor DHCP', 'Está en una VPN', 'Tiene IPv6'], a: 1, e: 'APIPA: Windows se autoasigna 169.254.x.x cuando DHCP falla.' },
    { q: '¿Qué prefijo usarías para un enlace punto a punto entre dos routers (clásico)?', o: ['/24', '/30', '/28', '/16'], a: 1, e: '/30 da exactamente 2 hosts útiles (también se usa /31).' },
    { q: '¿Cuál es una dirección privada?', o: ['172.32.1.1', '172.20.5.4', '192.169.1.1', '11.0.0.1'], a: 1, e: '172.16.0.0/12 abarca 172.16.x.x a 172.31.x.x.' },
    { q: 'Necesitás 60 hosts. ¿Qué prefijo es el más eficiente?', o: ['/25', '/26', '/27', '/24'], a: 1, e: '/26 = 62 hosts útiles.' },
    { q: 'Wildcard equivalente a `255.255.255.224`', o: ['0.0.0.31', '0.0.0.32', '0.0.0.224', '0.0.0.63'], a: 0, e: '255 − 224 = 31.' },
    { q: 'Abreviación correcta de `fe80:0000:0000:0000:0a1b:0000:0000:0001`', o: ['fe80::a1b::1', 'fe80::a1b:0:0:1', 'fe8::a1b:0:0:1', 'fe80:0:a1b::1'], a: 1, e: 'Solo un `::` permitido; se elige la secuencia más larga de ceros (los 3 primeros).' },
    { q: '¿Qué tipo de dirección IPv6 es `ff02::1`?', o: ['Global unicast', 'Link-local', 'Multicast (todos los nodos)', 'Loopback'], a: 2, e: 'ff00::/8 es multicast; ff02::1 = all-nodes en el enlace.' },
    { q: 'Rango útil de `10.20.77.9/21`', o: ['10.20.72.1 – 10.20.79.254', '10.20.77.1 – 10.20.77.254', '10.20.64.1 – 10.20.79.254', '10.20.72.1 – 10.20.80.254'], a: 0, e: 'Máscara 255.255.248.0 → saltos de 8 en el 3er octeto: 72–79.' },
    { q: 'Sumarizá 192.168.4.0/24 – 192.168.7.0/24', o: ['192.168.4.0/22', '192.168.0.0/21', '192.168.4.0/23', '192.168.4.0/24'], a: 0, e: '4 redes /24 contiguas que empiezan en múltiplo de 4 → /22.' }
  ],
  lab: { t: 'Lab 2: Plan VLSM para una sucursal', h: `
<p>Tenés <code>10.50.0.0/22</code> para una sede con: <b>Usuarios 300</b>, <b>Wi-Fi invitados 120</b>, <b>Telefonía IP 60</b>, <b>Cámaras 25</b>, <b>Gestión de equipos 10</b> y <b>2 enlaces WAN</b>.</p>
<ol><li>Ordená de mayor a menor y asigná prefijos.</li><li>Escribí red, rango útil, broadcast y gateway (primera IP útil) de cada una.</li><li>Verificá con el <a href="#/tool/subnet">calculador</a>.</li></ol>
<details class="lesson"><summary>Ver solución propuesta</summary><div class="lbody"><table>
<tr><th>Red</th><th>Prefijo</th><th>Subred</th><th>Broadcast</th></tr>
<tr><td>Usuarios (300)</td><td>/23</td><td>10.50.0.0</td><td>10.50.1.255</td></tr>
<tr><td>Invitados (120)</td><td>/25</td><td>10.50.2.0</td><td>10.50.2.127</td></tr>
<tr><td>Telefonía (60)</td><td>/26</td><td>10.50.2.128</td><td>10.50.2.191</td></tr>
<tr><td>Cámaras (25)</td><td>/27</td><td>10.50.2.192</td><td>10.50.2.223</td></tr>
<tr><td>Gestión (10)</td><td>/28</td><td>10.50.2.224</td><td>10.50.2.239</td></tr>
<tr><td>WAN 1</td><td>/30</td><td>10.50.2.240</td><td>10.50.2.243</td></tr>
<tr><td>WAN 2</td><td>/30</td><td>10.50.2.244</td><td>10.50.2.247</td></tr></table><p>Libre: 10.50.2.248 – 10.50.3.255.</p></div></details>` }
});

window.UNITS.push({
  id: 'u05', num: 5, icon: '🧭', short: 'CCNA: Routing', time: '2.5 h',
  title: 'CCNA II: Routing estático, OSPF, Inter-VLAN, ACLs, NAT y FHRP',
  desc: 'Cómo viajan los paquetes entre redes y cómo controlarlo. El corazón del CCNA.',
  goals: ['Leer una tabla de ruteo y aplicar longest prefix match y distancia administrativa', 'Configurar rutas estáticas, default y flotantes', 'Configurar OSPF de área única y verificar vecinos', 'Escribir ACLs estándar/extendidas y NAT overload'],
  lessons: [
    { t: 'La tabla de ruteo', h: `
<pre>R1# show ip route
Codes: C - connected, L - local, S - static, O - OSPF, D - EIGRP, B - BGP, * - candidate default
Gateway of last resort is 200.1.1.1 to network 0.0.0.0
S*    0.0.0.0/0 [1/0] via 200.1.1.1
      10.0.0.0/8 is variably subnetted
C        10.1.10.0/24 is directly connected, GigabitEthernet0/0.10
L        10.1.10.1/32 is directly connected, GigabitEthernet0/0.10
O        10.2.0.0/16 [110/20] via 10.0.12.2, 00:15:32, GigabitEthernet0/1</pre>
<p>En <code>[110/20]</code>: <b>110</b> = distancia administrativa (confianza en la fuente), <b>20</b> = métrica (costo dentro del protocolo).</p>
<h4>Cómo decide el router</h4>
<ol><li><b>Longest prefix match</b>: gana la ruta más específica (un /24 le gana a un /16 y al /0).</li>
<li>Para el mismo prefijo aprendido por distintos protocolos: menor <b>AD</b>.</li>
<li>Dentro del mismo protocolo: menor <b>métrica</b> (si empatan, balanceo ECMP).</li></ol>
<table><tr><th>Fuente</th><th>AD</th></tr><tr><td>Conectada</td><td>0</td></tr><tr><td>Estática</td><td>1</td></tr><tr><td>eBGP</td><td>20</td></tr><tr><td>EIGRP interno</td><td>90</td></tr><tr><td>OSPF</td><td>110</td></tr><tr><td>IS-IS</td><td>115</td></tr><tr><td>RIP</td><td>120</td></tr><tr><td>iBGP</td><td>200</td></tr></table>` },
    { t: 'Rutas estáticas, default y flotantes', h: `
<pre>ip route 192.168.20.0 255.255.255.0 10.0.12.2        ! next-hop
ip route 192.168.20.0 255.255.255.0 GigabitEthernet0/1 ! interfaz de salida
ip route 0.0.0.0 0.0.0.0 200.1.1.1                    ! ruta por defecto
ip route 0.0.0.0 0.0.0.0 201.5.5.1 200                ! FLOTANTE (AD 200) = backup
ipv6 route ::/0 2001:db8:ffff::1                      ! default IPv6</pre>
<p>La <b>ruta flotante</b> tiene AD mayor que la principal; solo entra a la tabla cuando la principal desaparece (por ejemplo, si cae el enlace o el IP SLA detecta que no responde).</p>
<div class="tip">Ruta estática a <code>Null0</code>: descarta tráfico (se usa para sumarizaciones y blackholing de ataques).</div>
<div class="noc">Cuando cae un enlace con failover a un backup 4G/radio, el NOC debe ver la ruta flotante activa con <code>show ip route 0.0.0.0</code> y avisar que la sucursal opera degradada.</div>` },
    { t: 'Inter-VLAN routing', h: `
<p>Las VLANs son redes distintas: para comunicarlas hace falta capa 3.</p>
<h4>Router-on-a-stick (subinterfaces)</h4>
<pre>interface gi0/0
 no shutdown
interface gi0/0.10
 encapsulation dot1Q 10
 ip address 10.1.10.1 255.255.255.0
interface gi0/0.20
 encapsulation dot1Q 20
 ip address 10.1.20.1 255.255.255.0
 ip helper-address 10.1.99.10
interface gi0/0.999
 encapsulation dot1Q 999 native</pre>
<p>El puerto del switch hacia el router va en modo <b>trunk</b>.</p>
<h4>Switch capa 3 (SVIs) — lo más común en empresas</h4>
<pre>ip routing
interface vlan 10
 ip address 10.1.10.1 255.255.255.0
 no shutdown
interface vlan 20
 ip address 10.1.20.1 255.255.255.0
 no shutdown
interface gi1/0/48
 no switchport                      ! puerto ruteado hacia el firewall
 ip address 10.0.0.2 255.255.255.252</pre>
<div class="warn">Una SVI queda <i>up/up</i> solo si la VLAN existe y hay al menos un puerto activo en ella (o un trunk que la permita).</div>` },
    { t: 'OSPF de área única', h: `
<p>OSPF es un protocolo <b>link-state</b> (estándar abierto). Cada router arma el mapa completo (LSDB) y calcula el mejor camino con <b>Dijkstra (SPF)</b>. Métrica: <b>costo = reference bandwidth (100 Mbps) / bandwidth</b>. Usa multicast 224.0.0.5 (todos) y 224.0.0.6 (DR/BDR), protocolo IP 89.</p>
<pre>router ospf 1
 router-id 1.1.1.1
 auto-cost reference-bandwidth 10000      ! para que 1G y 10G no valgan lo mismo
 passive-interface default
 no passive-interface gi0/1
 network 10.1.0.0 0.0.255.255 area 0
 default-information originate            ! propaga la ruta por defecto
! o por interfaz:
interface gi0/1
 ip ospf 1 area 0
 ip ospf network point-to-point</pre>
<h4>Vecinos</h4>
<p>Estados: Down → Init → 2-Way → ExStart → Exchange → Loading → <b>Full</b>. Para formar adyacencia deben coincidir: <b>área, subred/máscara, timers hello/dead</b> (10/40 s en Ethernet), autenticación, MTU y tipo de red. El router-id no puede repetirse.</p>
<p>En redes multiacceso se eligen <b>DR</b> y <b>BDR</b> (mayor prioridad, luego mayor router-id). Los demás quedan como DROTHER en estado 2-Way entre sí (normal).</p>
<pre>show ip ospf neighbor
show ip ospf interface brief
show ip route ospf
show ip protocols</pre>
<p>Otros que tenés que conocer: <b>EIGRP</b> (Cisco, avanzado vector distancia), <b>BGP</b> (protocolo de Internet entre sistemas autónomos, TCP 179, eBGP/iBGP, atributos como AS_PATH y LOCAL_PREF).</p>
<div class="noc">Alarma típica: "%OSPF-5-ADJCHG: Process 1, Nbr 2.2.2.2 on Gi0/1 from FULL to DOWN, Neighbor Down: Dead timer expired". Revisá el enlace físico primero.</div>` },
    { t: 'ACLs, NAT y FHRP', h: `
<h4>ACLs</h4>
<p>Se procesan <b>de arriba hacia abajo</b>, la primera coincidencia gana, y al final hay un <b>deny any implícito</b>. <b>Estándar</b> (1–99): filtran solo por IP origen → ubicarlas cerca del destino. <b>Extendidas</b> (100–199): origen, destino, protocolo y puerto → cerca del origen.</p>
<pre>ip access-list extended FILTRO-VENTAS
 10 permit tcp 10.1.10.0 0.0.0.255 host 10.1.99.20 eq 443
 20 permit udp 10.1.10.0 0.0.0.255 any eq 53
 30 deny   ip 10.1.10.0 0.0.0.255 10.1.99.0 0.0.0.255 log
 40 permit ip any any
interface gi0/0.10
 ip access-group FILTRO-VENTAS in
! Restringir acceso SSH al equipo:
access-list 5 permit 10.1.99.0 0.0.0.255
line vty 0 4
 access-class 5 in</pre>
<h4>NAT overload (PAT)</h4>
<pre>access-list 1 permit 10.1.0.0 0.0.255.255
interface gi0/0
 ip nat inside
interface gi0/1
 ip nat outside
ip nat inside source list 1 interface gi0/1 overload
! NAT estático para publicar un servidor:
ip nat inside source static tcp 10.1.99.20 443 200.1.1.10 443
show ip nat translations</pre>
<h4>FHRP: gateway redundante</h4>
<p><b>HSRP</b> (Cisco), <b>VRRP</b> (estándar), <b>GLBP</b> (Cisco, balancea). Dos routers comparten una IP virtual que usan los hosts como gateway; si cae el activo, el standby toma la IP virtual.</p>
<pre>interface vlan 10
 ip address 10.1.10.2 255.255.255.0
 standby 10 ip 10.1.10.1
 standby 10 priority 110
 standby 10 preempt</pre>
<h4>WAN</h4>
<p>Conceptos que aparecen: MPLS L3VPN, Metro Ethernet, enlaces de Internet dedicados, VPN IPsec sobre Internet, <b>SD-WAN</b> (gestión centralizada de múltiples enlaces con políticas por aplicación). Más en la unidad 6.</p>` }
  ],
  english: [
    ['routing table', 'tabla de ruteo', 'Check the routing table for a route to 10.2.0.0.'],
    ['next hop', 'siguiente salto', 'The next hop for the default route is 200.1.1.1.'],
    ['administrative distance', 'distancia administrativa', 'Static routes have an administrative distance of 1.'],
    ['floating static route', 'ruta estática flotante', 'A floating static route acts as a backup.'],
    ['neighbor adjacency', 'adyacencia de vecinos', 'The OSPF neighbor adjacency is stuck in EXSTART.'],
    ['to advertise a route', 'anunciar una ruta', 'R2 is not advertising the 192.168.20.0 network.'],
    ['access control list (ACL)', 'lista de control de acceso', 'The ACL is blocking SSH traffic.'],
    ['implicit deny', 'denegación implícita', 'Remember the implicit deny at the end of every ACL.'],
    ['failover', 'conmutación por falla', 'Failover to the backup link took 3 seconds.'],
    ['redundant gateway', 'gateway redundante', 'HSRP provides a redundant gateway.'],
    ['route flapping', 'ruta inestable', 'Route flapping is causing intermittent outages.'],
    ['outbound / inbound', 'saliente / entrante', 'Apply the ACL inbound on the LAN interface.']
  ],
  flash: [
    ['AD de OSPF', '110'], ['AD de ruta estática', '1'], ['AD de eBGP', '20'], ['Comando ruta por defecto', 'ip route 0.0.0.0 0.0.0.0 <next-hop>'],
    ['¿Qué gana: /24 con AD 120 o /16 con AD 1?', 'El /24: longest prefix match se evalúa primero'],
    ['Estado final de vecinos OSPF', 'FULL'], ['Parámetros que deben coincidir en OSPF', 'Área, subred, hello/dead, autenticación, MTU'],
    ['Final de toda ACL', 'deny any implícito'], ['¿Dónde ubicar una ACL extendida?', 'Cerca del origen'],
    ['Protocolo FHRP estándar', 'VRRP'], ['Comando para ver traducciones NAT', 'show ip nat translations']
  ],
  quiz: [
    { q: 'Hay dos rutas: `10.1.0.0/16` vía OSPF y `10.1.5.0/24` estática. Un paquete va a 10.1.5.9. ¿Cuál usa?', o: ['La /16 (OSPF)', 'La /24 (estática)', 'Balancea', 'La default'], a: 1, e: 'Longest prefix match: la /24 es más específica.' },
    { q: '¿Qué valor es la AD en `[110/20]`?', o: ['20', '110', '130', 'Ninguno'], a: 1, e: 'Primero AD, luego métrica.' },
    { q: 'Para crear una ruta flotante de backup...', o: ['Se usa AD menor que la principal', 'Se usa AD mayor que la principal', 'Se usa métrica 0', 'Se usa Null0'], a: 1, e: 'Solo entra a la tabla si la principal desaparece.' },
    { q: 'Dos routers OSPF no forman adyacencia. ¿Qué NO es necesario que coincida?', o: ['Área', 'Hello/Dead', 'Router ID', 'Subred'], a: 2, e: 'El router-id debe ser DISTINTO; el resto debe coincidir.' },
    { q: 'En router-on-a-stick, el puerto del switch hacia el router debe ser...', o: ['Access VLAN 1', 'Trunk', 'Routed port', 'Shutdown'], a: 1, e: 'Transporta todas las VLANs etiquetadas a las subinterfaces.' },
    { q: 'ACL: `permit tcp any any eq 80` y nada más. ¿Qué pasa con el ping?', o: ['Pasa', 'Se bloquea por el deny implícito', 'Pasa solo IPv6', 'Depende de NAT'], a: 1, e: 'ICMP no coincide con ninguna línea → deny any implícito.' },
    { q: 'Comando para que muchas IPs internas salgan con la IP de la interfaz pública', o: ['ip nat inside source static', 'ip nat inside source list 1 interface gi0/1 overload', 'ip nat pool', 'ip route 0.0.0.0'], a: 1, e: 'overload = PAT.' },
    { q: '¿Qué protocolo provee un gateway virtual redundante y es estándar abierto?', o: ['HSRP', 'GLBP', 'VRRP', 'DTP'], a: 2, e: 'VRRP (RFC 5798). HSRP y GLBP son Cisco.' },
    { q: 'La métrica de OSPF se basa en...', o: ['Saltos', 'Costo derivado del ancho de banda', 'Retardo y carga', 'AS_PATH'], a: 1, e: 'Costo = reference bandwidth / bandwidth de la interfaz.' },
    { q: 'Una SVI `interface vlan 30` está down/down. Causa probable:', o: ['Falta ip routing', 'No hay puertos activos en la VLAN 30 o la VLAN no existe', 'Falta NAT', 'OSPF caído'], a: 1, e: 'La SVI necesita la VLAN creada y algún puerto up en ella.' },
    { q: '¿Qué protocolo enruta entre sistemas autónomos en Internet?', o: ['OSPF', 'RIP', 'BGP', 'EIGRP'], a: 2, e: 'BGP sobre TCP 179.' }
  ],
  lab: { t: 'Lab 5: Sede central + sucursal con OSPF, NAT y ACL (Packet Tracer)', h: `
<ol><li>R-CENTRAL y R-SUCURSAL unidos por un /30 (10.0.0.0/30). Cada uno con una LAN (10.1.10.0/24 y 10.2.10.0/24).</li>
<li>OSPF área 0 con router-id fijo, interfaces LAN pasivas.</li>
<li>R-CENTRAL con salida a "ISP" (200.1.1.0/30), ruta default y <code>default-information originate</code>.</li>
<li>NAT overload en R-CENTRAL para ambas LANs.</li>
<li>ACL extendida: la LAN de sucursal solo puede salir a TCP 80/443 y DNS.</li>
<li>Restringí SSH (vty) solo desde 10.1.10.0/24.</li>
<li>Verificá con <code>show ip ospf neighbor</code>, <code>show ip route</code>, <code>show ip nat translations</code>, <code>show access-lists</code> (mirá los contadores de matches).</li>
<li><b>Bonus:</b> agregá un segundo enlace con ruta flotante y simulá la caída del principal.</li></ol>` }
});

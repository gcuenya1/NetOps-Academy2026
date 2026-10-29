window.UNITS.push({
  id: 'u06', num: 6, icon: '📶', short: 'Wireless y Telecom', time: '2 h',
  title: 'Wireless, RF, Fibra óptica (FTTH/GPON) y redes de transporte',
  desc: 'La parte "telco": Wi-Fi, presupuesto de enlace, fibra, GPON, radioenlaces, MPLS, SD-WAN y redes móviles.',
  goals: ['Conocer estándares Wi-Fi, bandas y canales', 'Calcular dBm, pérdidas y presupuesto de enlace óptico/radio', 'Explicar la arquitectura FTTH/GPON y cómo medir fibra (OTDR, power meter)', 'Ubicar MPLS, SD-WAN, 4G/5G en una red de transporte'],
  lessons: [
    { t: 'Wi-Fi: estándares, bandas y canales', h: `
<table><tr><th>Estándar</th><th>Nombre</th><th>Banda</th><th>Máx. teórico</th></tr>
<tr><td>802.11b/g</td><td>—</td><td>2.4 GHz</td><td>11 / 54 Mbps</td></tr>
<tr><td>802.11a</td><td>—</td><td>5 GHz</td><td>54 Mbps</td></tr>
<tr><td>802.11n</td><td>Wi-Fi 4</td><td>2.4 / 5</td><td>600 Mbps (MIMO)</td></tr>
<tr><td>802.11ac</td><td>Wi-Fi 5</td><td>5</td><td>~3.5 Gbps (MU-MIMO DL)</td></tr>
<tr><td>802.11ax</td><td>Wi-Fi 6 / 6E</td><td>2.4 / 5 / 6</td><td>~9.6 Gbps (OFDMA)</td></tr>
<tr><td>802.11be</td><td>Wi-Fi 7</td><td>2.4 / 5 / 6</td><td>~46 Gbps (MLO, 320 MHz)</td></tr></table>
<p><b>2.4 GHz</b>: más alcance, atraviesa mejor paredes, pero solo 3 canales sin solapamiento: <b>1, 6 y 11</b>. <b>5 GHz</b>: más canales y velocidad, menor alcance; algunos canales requieren <b>DFS</b> (radar). <b>6 GHz</b>: limpio, solo dispositivos 6E/7.</p>
<p>Conceptos: <b>SSID</b> (nombre de la red), <b>BSSID</b> (MAC del radio del AP), <b>roaming</b> (802.11k/v/r), <b>band steering</b>, ancho de canal (20/40/80/160 MHz), interferencia co-canal.</p>
<h4>Arquitecturas</h4>
<p>AP autónomo vs <b>controladora (WLC)</b> con APs livianos (CAPWAP, UDP 5246/5247) vs gestión en la nube (Meraki, UniFi, Aruba Central).</p>
<h4>Seguridad Wi-Fi</h4>
<p>WEP y WPA (TKIP) → rotos. <b>WPA2-Personal</b> (PSK, AES-CCMP), <b>WPA3-Personal</b> (SAE, resiste ataques de diccionario offline), <b>WPA2/3-Enterprise</b> (802.1X + RADIUS, credenciales por usuario, EAP-TLS/PEAP). Desactivar <b>WPS</b>. Red de invitados aislada con portal cautivo.</p>` },
    { t: 'RF y decibeles: el idioma de los enlaces', h: `
<p><b>dB</b> es una relación (ganancia o pérdida). <b>dBm</b> es potencia absoluta referida a 1 mW: <code>P(dBm) = 10·log10(P/1mW)</code>.</p>
<table><tr><th>Potencia</th><th>dBm</th></tr><tr><td>1 W</td><td>+30</td></tr><tr><td>100 mW</td><td>+20</td></tr><tr><td>1 mW</td><td>0</td></tr><tr><td>0.1 mW</td><td>−10</td></tr><tr><td>1 µW</td><td>−30</td></tr></table>
<p>Reglas mentales: <b>+3 dB = ×2</b>, <b>−3 dB = ÷2</b>, <b>+10 dB = ×10</b>. dBi = ganancia de antena respecto a la isotrópica.</p>
<h4>Señal Wi-Fi (RSSI) de referencia</h4>
<p>−30 dBm excelente · −67 dBm mínimo para VoIP/video · −70 aceptable · −80 inestable · −90 casi inutilizable. <b>SNR</b> = señal − ruido (ideal &gt; 25 dB).</p>
<h4>Presupuesto de enlace (link budget)</h4>
<pre>Prx = Ptx + Gtx − Ltx_cable − FSPL + Grx − Lrx_cable
FSPL(dB) = 20·log10(d_km) + 20·log10(f_MHz) + 32.44
Margen = Prx − Sensibilidad del receptor   (buscar ≥ 10–20 dB)</pre>
<p>Ejemplo: 5 km a 5800 MHz → FSPL ≈ 20·0.699 + 20·3.763 + 32.44 ≈ <b>121.7 dB</b>.</p>
<h4>Radioenlaces punto a punto</h4>
<p>Requieren <b>línea de vista (LOS)</b> y despejar al menos el <b>60% de la primera zona de Fresnel</b>. Radio de la 1ra zona en el punto medio: <code>r = 8.66·√(d_km / f_GHz)</code> metros. Factores: alineación, polarización, lluvia (sobre todo &gt;10 GHz), interferencia, vegetación.</p>` },
    { t: 'Fibra óptica: atenuación, medición y empalmes', h: `
<h4>Ventanas y atenuación típica (SMF)</h4>
<table><tr><th>λ</th><th>Atenuación</th><th>Uso</th></tr><tr><td>850 nm</td><td>~2.5–3 dB/km (MMF)</td><td>Corta distancia</td></tr><tr><td>1310 nm</td><td>~0.35 dB/km</td><td>Enlaces, GPON upstream</td></tr><tr><td>1490 nm</td><td>~0.25 dB/km</td><td>GPON downstream</td></tr><tr><td>1550 nm</td><td>~0.2 dB/km</td><td>Largas distancias, DWDM, video RF</td></tr></table>
<p>Pérdidas típicas: <b>empalme por fusión ≤ 0.1 dB</b>, empalme mecánico ~0.3 dB, <b>conector ~0.3–0.5 dB</b>, splitter 1:8 ≈ 10.5 dB, 1:16 ≈ 13.5 dB, 1:32 ≈ 17 dB, 1:64 ≈ 20.5 dB.</p>
<h4>Presupuesto óptico</h4>
<pre>Pérdida total = (km × dB/km) + (n_empalmes × 0.1) + (n_conectores × 0.5) + splitters
Margen = (Ptx − Sensibilidad_rx) − Pérdida total   → debe ser positivo (+3 dB de reserva)</pre>
<h4>Instrumentos</h4>
<p><b>Power meter + fuente</b>: mide pérdida total (dBm recibidos). <b>OTDR</b>: envía pulsos y analiza la retrodispersión; muestra distancia a eventos (empalmes, conectores, macrocurvaturas, cortes). <b>VFL</b> (láser rojo visible): ubica cortes y curvas en tramos cortos. <b>Microscopio/inspección</b>: la suciedad en conectores es la falla más común. Limpiar siempre antes de conectar.</p>
<p>Código de colores de fibras (TIA-598): azul, naranja, verde, marrón, gris, blanco, rojo, negro, amarillo, violeta, rosa, aqua.</p>
<div class="noc">En un corte de fibra: el NOC ve la caída de muchos clientes de la misma OLT/puerto PON a la vez → correlaciona → escala a cuadrilla de planta externa con la distancia aproximada que da el OTDR.</div>` },
    { t: 'FTTH / GPON', h: `
<pre>[OLT] ─── fibra troncal ─── [Splitter 1:8] ─── [Splitter 1:8] ─── [ONT cliente]
 Central                       (CTO/NAP)                          Casa / empresa</pre>
<table><tr><th>Parámetro</th><th>GPON (ITU-T G.984)</th><th>XGS-PON (G.9807)</th></tr>
<tr><td>Downstream</td><td>2.488 Gbps @ 1490 nm</td><td>10 Gbps @ 1577 nm</td></tr>
<tr><td>Upstream</td><td>1.244 Gbps @ 1310 nm</td><td>10 Gbps @ 1270 nm</td></tr>
<tr><td>Video RF overlay</td><td>1550 nm</td><td>1550 nm</td></tr>
<tr><td>Split típico</td><td>1:32 / 1:64</td><td>1:64 / 1:128</td></tr>
<tr><td>Alcance</td><td>20 km lógicos</td><td>20+ km</td></tr></table>
<p>Downstream = <b>broadcast cifrado (AES)</b>; upstream = <b>TDMA</b> (cada ONT transmite en su ventana). Clases ópticas: B+ (28 dB), C+ (32 dB).</p>
<p>Potencia en la ONT recomendada: aprox. <b>−8 a −27 dBm</b> (ideal −15 a −25). Por debajo de −27/−28 dBm aparecen errores o caída (LOS/LOF). Alarmas: <b>LOS</b> (Loss of Signal), <b>Dying Gasp</b> (la ONT se quedó sin energía: corte de luz del cliente, no de fibra).</p>
<div class="tip">Dying Gasp vs LOS: si muchas ONTs muestran dying gasp a la vez, probablemente es un corte de energía en la zona; si es LOS masivo, probablemente un corte de fibra.</div>` },
    { t: 'Redes de transporte y acceso: MPLS, SD-WAN, Metro Ethernet, 4G/5G', h: `
<h4>MPLS</h4>
<p>Conmutación por <b>etiquetas</b> entre la capa 2 y 3 (capa "2.5"). Roles: <b>CE</b> (equipo del cliente), <b>PE</b> (borde del proveedor), <b>P</b> (núcleo). Servicios: <b>L3VPN</b> (VRFs por cliente, MP-BGP), <b>L2VPN/VPLS</b>, ingeniería de tráfico (RSVP-TE, Segment Routing). QoS con bits EXP/TC.</p>
<h4>SD-WAN</h4>
<p>Overlay sobre varios transportes (MPLS, Internet, 4G/5G) con un <b>controlador centralizado</b>: elige el enlace por aplicación según latencia/pérdida, túneles IPsec automáticos, zero-touch provisioning. Ej.: Cisco Catalyst SD-WAN, Fortinet, VMware VeloCloud.</p>
<h4>Metro Ethernet / Carrier Ethernet</h4>
<p>Servicios MEF: E-Line (punto a punto), E-LAN (multipunto), E-Tree. Q-in-Q (802.1ad) para transportar VLANs del cliente.</p>
<h4>Redes móviles</h4>
<p><b>4G LTE</b>: eNodeB + EPC (MME, SGW, PGW). <b>5G</b>: gNodeB + 5GC basado en servicios; casos eMBB (banda ancha), URLLC (baja latencia), mMTC (IoT masivo). Sub-6 GHz y mmWave. <b>Network slicing</b>. Backhaul por fibra o microondas.</p>
<h4>QoS (Calidad de servicio)</h4>
<p>Clasificar y marcar (<b>DSCP</b>: EF 46 para voz, AF41 video, CS6 control de red), encolar (LLQ/CBWFQ), policing/shaping. La voz necesita prioridad estricta.</p>
<div class="en">"The branch has dual WAN: MPLS as primary and broadband internet as backup, managed via SD-WAN."</div>` }
  ],
  english: [
    ['signal strength', 'intensidad de señal', 'Signal strength drops below -75 dBm in the warehouse.'],
    ['interference', 'interferencia', 'Microwave ovens cause interference on 2.4 GHz.'],
    ['line of sight', 'línea de vista', 'The radio link needs clear line of sight.'],
    ['link budget', 'presupuesto de enlace', 'The link budget leaves a 12 dB fade margin.'],
    ['attenuation', 'atenuación', 'Attenuation on this span is 0.35 dB per km.'],
    ['splice', 'empalme', 'The OTDR trace shows a bad splice at 3.2 km.'],
    ['fiber cut', 'corte de fibra', 'A fiber cut affected 400 customers.'],
    ['optical power', 'potencia óptica', 'Received optical power at the ONT is -29 dBm.'],
    ['backhaul', 'red de retorno / backhaul', 'The cell site backhaul is microwave.'],
    ['outside plant', 'planta externa', 'Dispatch the outside plant crew.'],
    ['dying gasp', 'último aviso (corte de energía)', 'The ONT sent a dying gasp before going offline.'],
    ['roaming', 'itinerancia entre APs', 'Users experience drops while roaming between APs.']
  ],
  flash: [
    ['Canales sin solapamiento en 2.4 GHz', '1, 6 y 11'], ['100 mW en dBm', '+20 dBm'], ['+3 dB equivale a...', 'Duplicar la potencia'],
    ['RSSI mínimo recomendado para VoIP', '−67 dBm'], ['λ downstream GPON', '1490 nm'], ['λ upstream GPON', '1310 nm'],
    ['Pérdida splitter 1:32', '≈ 17 dB'], ['Pérdida empalme por fusión', '≤ 0.1 dB'], ['¿Qué ubica eventos en la fibra por distancia?', 'OTDR'],
    ['Dying Gasp', 'Alarma de la ONT por pérdida de energía eléctrica'], ['DSCP para voz', 'EF (46)'], ['Zona de Fresnel a despejar', 'Al menos 60% de la 1ra zona']
  ],
  quiz: [
    { q: '¿Qué canales de 2.4 GHz no se solapan?', o: ['1, 5, 9', '1, 6, 11', '2, 7, 12', '1, 2, 3'], a: 1, e: 'Con canales de 20 MHz solo 1, 6 y 11 son independientes.' },
    { q: '¿Cuántos dBm son 1 W?', o: ['+10', '+20', '+30', '0'], a: 2, e: '10·log10(1000 mW) = 30 dBm.' },
    { q: 'Una ONT recibe −30 dBm. ¿Qué pensás?', o: ['Excelente', 'Normal', 'Fuera de rango: revisar conectores, empalmes o curvaturas', 'Saturada'], a: 2, e: 'Por debajo de −27/−28 dBm hay riesgo de errores/caída.' },
    { q: 'Muchas ONTs de una zona reportan "Dying Gasp" al mismo tiempo. Lo más probable:', o: ['Corte de fibra troncal', 'Corte de energía eléctrica en la zona', 'Ataque DDoS', 'Error de DHCP'], a: 1, e: 'Dying gasp = la ONT se quedó sin alimentación.' },
    { q: '¿Qué instrumento te da la distancia hasta un corte de fibra?', o: ['Power meter', 'OTDR', 'Multímetro', 'Analizador de espectro'], a: 1, e: 'El OTDR analiza la retrodispersión en función del tiempo/distancia.' },
    { q: 'WPA3-Personal reemplaza el PSK por:', o: ['WEP', 'SAE', 'TKIP', 'RADIUS'], a: 1, e: 'SAE (Simultaneous Authentication of Equals).' },
    { q: 'En GPON, el upstream se comparte mediante:', o: ['CSMA/CD', 'TDMA', 'FDMA', 'Broadcast'], a: 1, e: 'Cada ONT transmite en ventanas de tiempo asignadas por la OLT.' },
    { q: 'En MPLS, el router del proveedor que conecta con el cliente es el...', o: ['CE', 'PE', 'P', 'ONT'], a: 1, e: 'Provider Edge.' },
    { q: 'Ventaja principal de SD-WAN', o: ['Elimina la necesidad de routers', 'Selección dinámica de enlace por aplicación con gestión centralizada', 'Reemplaza la fibra', 'Solo funciona con MPLS'], a: 1, e: 'Usa múltiples transportes y políticas por aplicación.' },
    { q: 'Atenuación típica de fibra monomodo a 1550 nm', o: ['3 dB/km', '1 dB/km', '0.2 dB/km', '0.01 dB/km'], a: 2, e: '~0.2 dB/km.' },
    { q: 'Marca DSCP recomendada para voz', o: ['AF11', 'CS1', 'EF', 'Default'], a: 2, e: 'Expedited Forwarding (46).' }
  ],
  lab: { t: 'Lab 6: Cálculos de enlace y site survey', h: `
<ol><li><b>Presupuesto óptico:</b> OLT Ptx +3 dBm, sensibilidad ONT −28 dBm. Ruta: 12 km a 1490 nm (0.25 dB/km), 6 empalmes por fusión, 4 conectores, splitter 1:32. ¿Margen?</li>
<li><b>Radioenlace:</b> 8 km a 5.8 GHz, Ptx 23 dBm, antenas de 25 dBi en cada lado, 1 dB de pérdida de cable por lado, sensibilidad −80 dBm. Calculá FSPL, Prx y margen.</li>
<li><b>Site survey casero:</b> instalá una app tipo "WiFi Analyzer" en el celular, recorré tu casa y anotá RSSI y canal en cada ambiente. ¿Hay solapamiento con vecinos?</li></ol>
<details class="lesson"><summary>Ver soluciones</summary><div class="lbody">
<p>1) Pérdida = 12×0.25 (3) + 6×0.1 (0.6) + 4×0.5 (2) + 17 = <b>22.6 dB</b>. Disponible = 3 − (−28) = 31 dB. <b>Margen = 8.4 dB</b> ✔</p>
<p>2) FSPL = 20·log10(8) + 20·log10(5800) + 32.44 ≈ 18.06 + 75.27 + 32.44 = <b>125.8 dB</b>. Prx = 23 + 25 − 1 − 125.8 + 25 − 1 = <b>−54.8 dBm</b>. Margen = −54.8 − (−80) = <b>25.2 dB</b> ✔</p></div></details>` }
});

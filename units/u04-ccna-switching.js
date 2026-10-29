window.UNITS.push({
  id: 'u04', num: 4, icon: '🔀', short: 'CCNA: Switching', time: '2.5 h', tool: 'ios',
  title: 'CCNA I: Cisco IOS, VLANs, Trunks, STP y EtherChannel',
  desc: 'Configurar y verificar switches Cisco: lo que se hace todos los días en una red corporativa.',
  goals: ['Moverte con soltura entre los modos de IOS', 'Crear VLANs, asignar puertos y configurar trunks 802.1Q', 'Entender STP: elección de root bridge, roles y PortFast/BPDU Guard', 'Configurar EtherChannel LACP, port-security y acceso SSH'],
  lessons: [
    { t: 'Cisco IOS: modos y comandos esenciales', h: `
<table><tr><th>Modo</th><th>Prompt</th><th>Cómo entrar</th></tr>
<tr><td>Usuario EXEC</td><td><code>Switch&gt;</code></td><td>Al conectarte</td></tr>
<tr><td>Privilegiado EXEC</td><td><code>Switch#</code></td><td><code>enable</code></td></tr>
<tr><td>Configuración global</td><td><code>Switch(config)#</code></td><td><code>configure terminal</code></td></tr>
<tr><td>Interfaz</td><td><code>Switch(config-if)#</code></td><td><code>interface fa0/1</code></td></tr>
<tr><td>Línea</td><td><code>Switch(config-line)#</code></td><td><code>line vty 0 4</code> / <code>line console 0</code></td></tr></table>
<p><code>exit</code> sube un nivel; <code>end</code> o <kbd class="kbd">Ctrl+Z</kbd> vuelve a privilegiado. <code>?</code> muestra ayuda; <kbd class="kbd">Tab</kbd> autocompleta; los comandos se pueden abreviar (<code>conf t</code>, <code>sh ip int br</code>). <code>do</code> permite ejecutar comandos show desde config.</p>
<h4>Show que tenés que dominar</h4>
<pre>show running-config            ! configuración activa (RAM)
show startup-config            ! configuración guardada (NVRAM)
show ip interface brief        ! estado e IP de interfaces
show interfaces fa0/1          ! errores, duplex, velocidad, contadores
show vlan brief                ! VLANs y puertos asignados
show interfaces trunk          ! trunks y VLANs permitidas
show mac address-table         ! tabla MAC
show cdp neighbors detail      ! vecinos Cisco
show spanning-tree             ! estado STP
show version                   ! IOS, uptime, modelo
show logging                   ! logs locales
copy running-config startup-config   (o "write memory")</pre>
<div class="warn">Si no guardás (<code>copy run start</code>), un reinicio borra los cambios. En el NOC, antes de tocar algo: <code>show run</code> y backup.</div>` },
    { t: 'VLANs y puertos de acceso', h: `
<p>Una <b>VLAN</b> divide un switch físico en varias redes lógicas = varios dominios de broadcast. Ventajas: seguridad, menos broadcast, organización (Ventas, Soporte, VoIP, Gestión).</p>
<pre>Switch(config)# vlan 10
Switch(config-vlan)# name VENTAS
Switch(config-vlan)# vlan 20
Switch(config-vlan)# name SOPORTE
Switch(config-vlan)# exit
Switch(config)# interface fa0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10
Switch(config-if)# description PC-Ventas-01
Switch(config)# interface range fa0/2 - 10
Switch(config-if-range)# switchport mode access
Switch(config-if-range)# switchport access vlan 20</pre>
<p>Rangos: VLAN 1 (default, no usar para usuarios), 2–1001 normales, 1002–1005 reservadas, 1006–4094 extendidas.</p>
<h4>VLAN de voz</h4>
<pre>interface fa0/5
 switchport mode access
 switchport access vlan 10
 switchport voice vlan 150</pre>
<p>El teléfono IP etiqueta su tráfico en la VLAN 150 y la PC conectada atrás del teléfono sale sin etiqueta en la VLAN 10.</p>
<div class="tip">Buenas prácticas: no usar VLAN 1, crear una VLAN de gestión dedicada (ej. 99), apagar puertos libres y moverlos a una VLAN "parking" sin uso.</div>` },
    { t: 'Trunks 802.1Q, VLAN nativa y DTP', h: `
<p>Un <b>trunk</b> transporta varias VLANs por un mismo enlace, agregando una etiqueta (<b>tag 802.1Q</b> de 4 bytes con el VLAN ID de 12 bits) a cada trama.</p>
<pre>interface gi0/1
 switchport trunk encapsulation dot1q   ! solo en switches que soportan ISL
 switchport mode trunk
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,99
 switchport nonegotiate                 ! desactiva DTP</pre>
<p><b>VLAN nativa</b>: la que viaja <b>sin etiqueta</b> por el trunk (por defecto 1). Debe coincidir en ambos extremos; si no, aparece <i>%CDP-4-NATIVE_VLAN_MISMATCH</i>.</p>
<h4>DTP (Dynamic Trunking Protocol)</h4>
<table><tr><th></th><th>dynamic auto</th><th>dynamic desirable</th><th>trunk</th><th>access</th></tr>
<tr><td><b>dynamic auto</b></td><td>Access</td><td>Trunk</td><td>Trunk</td><td>Access</td></tr>
<tr><td><b>dynamic desirable</b></td><td>Trunk</td><td>Trunk</td><td>Trunk</td><td>Access</td></tr>
<tr><td><b>trunk</b></td><td>Trunk</td><td>Trunk</td><td>Trunk</td><td>Problema</td></tr></table>
<div class="warn">Seguridad: configurar los trunks de forma manual + <code>nonegotiate</code> y los puertos de usuario como <code>access</code> evita ataques de <b>VLAN hopping</b> (switch spoofing y double tagging).</div>
<p><b>VTP</b> sincroniza VLANs entre switches (server/client/transparent). Muchas empresas lo dejan en <i>transparent</i> o <i>off</i> para evitar borrar VLANs por error.</p>` },
    { t: 'Spanning Tree Protocol (STP/RSTP)', h: `
<p>STP (802.1D) evita <b>bucles de capa 2</b>, que causan tormentas de broadcast, inestabilidad de la tabla MAC y tramas duplicadas. Bloquea enlaces redundantes y los habilita si falla el principal.</p>
<h4>Proceso</h4>
<ol><li><b>Elegir el Root Bridge</b>: menor <b>Bridge ID</b> = prioridad (32768 por defecto + VLAN ID, extended system ID) + MAC. A igual prioridad gana la MAC más baja.</li>
<li>Cada switch no-root elige su <b>Root Port</b> (menor costo al root).</li>
<li>Cada segmento elige un <b>Designated Port</b>.</li>
<li>El resto queda <b>bloqueado</b> (Alternate en RSTP).</li></ol>
<p>Costos: 10 Mbps = 100, 100 Mbps = 19, 1 Gbps = 4, 10 Gbps = 2.</p>
<p>Estados 802.1D: Blocking → Listening (15 s) → Learning (15 s) → Forwarding. Convergencia ~30–50 s. <b>RSTP (802.1w)</b> converge en segundos: estados Discarding, Learning, Forwarding. Cisco usa <b>PVST+</b> / <b>Rapid PVST+</b> (una instancia por VLAN).</p>
<pre>spanning-tree mode rapid-pvst
spanning-tree vlan 10,20 root primary      ! o: spanning-tree vlan 10 priority 4096
interface range fa0/1 - 24
 spanning-tree portfast                    ! solo puertos de usuarios finales
 spanning-tree bpduguard enable            ! apaga el puerto si recibe BPDU</pre>
<div class="noc">Un "loop" se reconoce por CPU del switch al 100%, LEDs titilando a full, MAC flapping en los logs (<i>%SW_MATM-4-MACFLAP_NOTIF</i>) y la red entera caída. Acción inmediata: desconectar el enlace sospechoso.</div>` },
    { t: 'EtherChannel, Port Security, CDP/LLDP y SSH', h: `
<h4>EtherChannel</h4>
<p>Agrupa varios enlaces físicos en uno lógico (más ancho de banda + redundancia, STP lo ve como un solo enlace). Protocolos: <b>LACP</b> (802.3ad, estándar: active/passive) y <b>PAgP</b> (Cisco: desirable/auto). Los puertos deben coincidir en velocidad, duplex, modo y VLANs.</p>
<pre>interface range gi0/1 - 2
 channel-group 1 mode active
interface port-channel 1
 switchport mode trunk
show etherchannel summary</pre>
<h4>Port Security</h4>
<pre>interface fa0/3
 switchport mode access
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 switchport port-security violation restrict   ! protect | restrict | shutdown(default)
show port-security interface fa0/3</pre>
<p>Si un puerto queda en <b>err-disabled</b>: <code>shutdown</code> + <code>no shutdown</code> (o errdisable recovery).</p>
<h4>CDP / LLDP</h4>
<p>Descubren vecinos directamente conectados (modelo, IP, puerto). CDP es Cisco; <b>LLDP</b> (802.1AB) es estándar. Muy útiles para documentar topologías, pero conviene deshabilitarlos hacia Internet o puertos de usuario.</p>
<h4>Acceso seguro por SSH</h4>
<pre>hostname SW-NOC
ip domain-name lab.local
crypto key generate rsa modulus 2048
username admin privilege 15 secret Cl4ve!Segura
ip ssh version 2
line vty 0 4
 transport input ssh
 login local
enable secret OtraClave!
service password-encryption
interface vlan 99
 ip address 192.168.99.2 255.255.255.0
 no shutdown
ip default-gateway 192.168.99.1</pre>
<div class="tip">Practicá todo esto en el <a href="#/tool/ios">simulador Cisco IOS</a>.</div>` }
  ],
  english: [
    ['trunk port', 'puerto troncal', 'Configure Gi0/1 as a trunk port.'],
    ['access port', 'puerto de acceso', 'The printer is on an access port in VLAN 30.'],
    ['native VLAN mismatch', 'VLAN nativa no coincidente', 'CDP is reporting a native VLAN mismatch.'],
    ['spanning tree', 'árbol de expansión', 'Spanning tree blocked the redundant link.'],
    ['root bridge', 'puente raíz', 'Make the core switch the root bridge.'],
    ['broadcast storm', 'tormenta de broadcast', 'A loop caused a broadcast storm on the third floor.'],
    ['err-disabled', 'deshabilitado por error', 'The port went err-disabled after a security violation.'],
    ['running configuration', 'configuración en ejecución', 'Save the running configuration before rebooting.'],
    ['to tag / tagged', 'etiquetar / etiquetado', 'Voice traffic is tagged with VLAN 150.'],
    ['link aggregation', 'agregación de enlaces', 'We use link aggregation between the two switches.'],
    ['to shut down a port', 'apagar un puerto', 'Shut down all unused ports.'],
    ['MAC flapping', 'MAC que salta entre puertos', 'MAC flapping usually indicates a layer 2 loop.']
  ],
  flash: [
    ['Entrar a modo configuración global', 'configure terminal (conf t)'], ['Guardar configuración', 'copy running-config startup-config / write memory'],
    ['Ver VLANs y puertos', 'show vlan brief'], ['Tamaño del tag 802.1Q', '4 bytes (VLAN ID de 12 bits)'],
    ['¿Cómo se elige el root bridge?', 'Menor Bridge ID (prioridad + MAC)'], ['Prioridad STP por defecto', '32768'],
    ['PortFast se usa en...', 'Puertos de usuarios finales (nunca entre switches)'], ['LACP modos', 'active / passive'],
    ['Modo de violación por defecto en port-security', 'shutdown (err-disabled)'], ['Protocolo estándar de descubrimiento de vecinos', 'LLDP (802.1AB)'],
    ['Costo STP de 1 Gbps', '4']
  ],
  quiz: [
    { q: '¿Qué comando muestra las VLANs y sus puertos asignados?', o: ['show vlan brief', 'show interfaces trunk', 'show ip route', 'show mac address-table'], a: 0, e: 'show vlan brief lista VLANs, nombres y puertos access.' },
    { q: 'En un trunk 802.1Q, ¿qué VLAN viaja sin etiqueta?', o: ['VLAN 1 siempre', 'La VLAN nativa', 'La VLAN de voz', 'Ninguna'], a: 1, e: 'La nativa (por defecto 1, configurable).' },
    { q: 'Dos switches con puertos en `dynamic auto`. ¿Qué se forma?', o: ['Trunk', 'Access', 'EtherChannel', 'Error'], a: 1, e: 'Ninguno inicia la negociación → quedan en access.' },
    { q: '¿Qué criterio elige el root bridge de STP?', o: ['Mayor MAC', 'Menor Bridge ID', 'Mayor ancho de banda', 'Más puertos'], a: 1, e: 'Prioridad + MAC; gana el menor.' },
    { q: '¿Para qué sirve BPDU Guard?', o: ['Acelerar STP', 'Apagar un puerto PortFast si recibe BPDUs', 'Bloquear broadcast', 'Cifrar BPDUs'], a: 1, e: 'Protege contra switches conectados en puertos de usuario.' },
    { q: 'Protocolo estándar IEEE de EtherChannel', o: ['PAgP', 'LACP', 'DTP', 'VTP'], a: 1, e: 'LACP = 802.3ad / 802.1AX.' },
    { q: 'Un puerto quedó en err-disabled por port-security. ¿Cómo lo recuperás manualmente?', o: ['reload', 'shutdown y luego no shutdown', 'clear mac', 'no switchport'], a: 1, e: 'Primero corregí la causa y luego shut / no shut.' },
    { q: '¿Qué comando es necesario antes de `crypto key generate rsa`?', o: ['ip domain-name', 'enable secret', 'service password-encryption', 'banner motd'], a: 0, e: 'Además de un hostname distinto a "Switch", la clave RSA usa hostname + dominio.' },
    { q: 'Síntomas: CPU al 100%, MAC flapping, red caída. ¿Qué pasa?', o: ['DNS caído', 'Loop de capa 2', 'Falta de NAT', 'Error de OSPF'], a: 1, e: 'Clásico bucle L2 / tormenta de broadcast.' },
    { q: '¿Cómo se ejecuta un show desde el modo de configuración?', o: ['show ...', 'do show ...', 'exec show ...', 'no se puede'], a: 1, e: 'El prefijo do permite ejecutar comandos EXEC.' },
    { q: 'RSTP converge en:', o: ['30–50 s', 'unos pocos segundos', '5 minutos', 'no converge'], a: 1, e: 'RSTP (802.1w) usa propuestas/acuerdos y converge rápido.' }
  ],
  lab: { t: 'Lab 4: Campus con 2 switches en Packet Tracer', h: `
<ol><li>Topología: SW1 y SW2 unidos por 2 cables Gi (EtherChannel LACP trunk). 2 PCs por switch.</li>
<li>VLAN 10 VENTAS, VLAN 20 SOPORTE, VLAN 99 GESTION, VLAN 999 NATIVA.</li>
<li>Asigná las PCs a VLAN 10 y 20, configurá el Port-channel como trunk con nativa 999 y <code>allowed vlan 10,20,99</code>.</li>
<li>Hacé que SW1 sea root bridge de todas las VLANs.</li>
<li>PortFast + BPDU Guard en puertos de PCs; port-security sticky máx. 1 MAC.</li>
<li>SVI de gestión en VLAN 99 y SSH funcionando.</li>
<li>Verificá: <code>show etherchannel summary</code>, <code>show interfaces trunk</code>, <code>show spanning-tree</code>, ping entre PCs de la misma VLAN (OK) y de distinta VLAN (falla: hace falta un router → próxima unidad).</li></ol>
<div class="en">Document it in English: "SW1 is the root bridge for VLANs 10, 20 and 99. Po1 is an LACP trunk with native VLAN 999."</div>` }
});

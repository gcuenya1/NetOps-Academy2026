window.UNITS.push({
  id: 'u09', num: 9, icon: '🛰️', short: 'Operaciones NOC', time: '2.5 h', tool: 'noc',
  title: 'Operaciones NOC: monitoreo, SNMP, alertas, ITIL, SLA y gestión de incidentes',
  desc: 'Cómo trabaja un Network Operations Center: detectar antes que el cliente, actuar con método, comunicar y documentar.',
  goals: ['Explicar SNMP (versiones, OIDs, traps) y las herramientas de monitoreo más usadas', 'Interpretar métricas e interpretar severidades de syslog', 'Seguir el ciclo de vida de un incidente con ITIL', 'Calcular disponibilidad, MTTR y comunicar estados de incidente'],
  lessons: [
    { t: 'Qué es un NOC y cómo se trabaja', h: `
<p>El <b>NOC</b> monitorea 24×7 la infraestructura (red, servidores, enlaces, servicios) para <b>detectar, diagnosticar, resolver o escalar</b> incidentes y mantener los SLA. Se diferencia del <b>SOC</b>, que se enfoca en seguridad (aunque colaboran mucho).</p>
<h4>Tareas típicas de un operador NOC</h4>
<ul><li>Vigilar dashboards y la consola de alarmas; reconocer (<b>ACK</b>) alertas.</li>
<li>Triage: ¿es real o falso positivo? ¿Qué impacto tiene? ¿Hay alarmas relacionadas?</li>
<li>Diagnóstico inicial con runbooks (ping, traceroute, show interfaces, logs).</li>
<li>Abrir y actualizar tickets; abrir reclamos al proveedor (carrier/ISP) con el <b>ID de circuito</b>.</li>
<li>Escalar a N2/N3, guardias (on-call) o cuadrillas de campo.</li>
<li>Comunicar a clientes/áreas: notificaciones de incidente y de mantenimiento.</li>
<li>Ejecutar o supervisar <b>cambios</b> en ventanas de mantenimiento.</li>
<li><b>Handover</b> (pase de turno): incidentes abiertos, cambios en curso, pendientes.</li></ul>
<div class="noc">Regla de oro: <b>"Si no está en el ticket, no pasó."</b> Documentá con hora (preferentemente UTC o la hora oficial definida), acción y resultado.</div>` },
    { t: 'Monitoreo: SNMP, ICMP, agentes y flujos', h: `
<h4>SNMP</h4>
<p>Protocolo de gestión: el <b>manager</b> (NMS) consulta a los <b>agentes</b> de los equipos (UDP 161) y los agentes envían <b>traps/informs</b> al manager (UDP 162). La información se organiza en la <b>MIB</b> con identificadores <b>OID</b> (ej. <code>1.3.6.1.2.1.1.3.0</code> = sysUpTime, <code>ifInOctets</code>, <code>ifOperStatus</code>).</p>
<table><tr><th>Versión</th><th>Seguridad</th></tr><tr><td>v1</td><td>Community en texto plano</td></tr><tr><td>v2c</td><td>Community en texto plano, contadores de 64 bits, GetBulk</td></tr><tr><td><b>v3</b></td><td>Usuarios, autenticación (SHA) y cifrado (AES): <b>authPriv</b></td></tr></table>
<pre>snmpwalk -v2c -c public 10.0.0.1 1.3.6.1.2.1.2.2.1.2     # nombres de interfaces
snmpget -v3 -l authPriv -u noc -a SHA -A clave1 -x AES -X clave2 10.0.0.1 sysUpTime.0
! Cisco
snmp-server group NOC v3 priv
snmp-server user nocuser NOC v3 auth sha Clave1 priv aes 128 Clave2
snmp-server host 10.0.0.50 version 3 priv nocuser
snmp-server enable traps</pre>
<h4>Otras fuentes</h4>
<ul><li><b>ICMP</b>: disponibilidad y latencia (lo más básico).</li><li><b>Agentes</b> (Zabbix agent, node_exporter, Windows exporter) para CPU, RAM, disco, servicios.</li><li><b>Syslog</b>: eventos de los equipos.</li><li><b>NetFlow / IPFIX / sFlow</b>: quién habla con quién y cuánto (top talkers, análisis de tráfico, detección de anomalías).</li><li><b>APIs / streaming telemetry</b> (gNMI) en equipos modernos.</li><li><b>Chequeos sintéticos</b>: probar HTTP, DNS, login desde afuera.</li></ul>
<h4>Herramientas</h4>
<p><b>Zabbix</b>, <b>PRTG</b>, <b>Nagios/Icinga</b>, <b>LibreNMS/Observium</b>, <b>SolarWinds</b>, <b>Prometheus + Grafana</b> (métricas y dashboards), <b>Elastic/Graylog/Splunk</b> (logs), <b>PagerDuty/Opsgenie</b> (guardias y escalamiento), <b>Uptime Kuma</b> (simple y gratis).</p>` },
    { t: 'Métricas, umbrales y severidades', h: `
<table><tr><th>Métrica</th><th>Umbral de alerta típico</th><th>Qué puede indicar</th></tr>
<tr><td>Disponibilidad (ping)</td><td>3 pérdidas consecutivas</td><td>Equipo o enlace caído</td></tr>
<tr><td>Latencia</td><td>Aumento sostenido &gt; 2× la línea base</td><td>Congestión, ruta alternativa</td></tr>
<tr><td>Pérdida de paquetes</td><td>&gt; 1–2%</td><td>Enlace degradado, errores físicos</td></tr>
<tr><td>Utilización de interfaz</td><td>&gt; 80% por 15 min</td><td>Saturación, necesidad de upgrade, DDoS</td></tr>
<tr><td>Errores CRC / input errors</td><td>Contador creciente</td><td>Cable, conector, SFP, duplex</td></tr>
<tr><td>CPU / Memoria</td><td>&gt; 85–90% sostenido</td><td>Proceso desbocado, ataque, loop</td></tr>
<tr><td>Disco</td><td>&gt; 85% warning / &gt; 95% crítico</td><td>Logs creciendo, backups</td></tr>
<tr><td>Potencia óptica (DOM)</td><td>Fuera del rango del SFP</td><td>Fibra sucia, degradada</td></tr>
<tr><td>Temperatura / fuentes</td><td>Según fabricante</td><td>Falla de ventilación, A/C de la sala</td></tr></table>
<h4>Severidades de Syslog (RFC 5424)</h4>
<table><tr><th>#</th><th>Nivel</th><th>#</th><th>Nivel</th></tr><tr><td>0</td><td>Emergency</td><td>4</td><td>Warning</td></tr><tr><td>1</td><td>Alert</td><td>5</td><td>Notice</td></tr><tr><td>2</td><td>Critical</td><td>6</td><td>Informational</td></tr><tr><td>3</td><td>Error</td><td>7</td><td>Debug</td></tr></table>
<p>Mnemotecnia: <b>"Every Awesome Cisco Engineer Will Need Ice cream Daily"</b>. Un mensaje Cisco: <code>%LINEPROTO-5-UPDOWN: Line protocol on Interface Gi0/1, changed state to down</code> → facilidad LINEPROTO, severidad 5.</p>
<div class="tip">Evitá la <b>fatiga de alertas</b>: umbrales con histéresis, dependencias (si cae el router de la sucursal, no alertes los 30 equipos de atrás) y correlación.</div>` },
    { t: 'ITIL: incidentes, problemas y cambios', h: `
<table><tr><th>Proceso</th><th>Objetivo</th><th>Ejemplo</th></tr>
<tr><td><b>Incident Management</b></td><td>Restablecer el servicio lo antes posible</td><td>Cae el enlace → failover al backup</td></tr>
<tr><td><b>Problem Management</b></td><td>Encontrar y eliminar la causa raíz (RCA)</td><td>El enlace cae todas las noches → SFP defectuoso</td></tr>
<tr><td><b>Change Management</b></td><td>Cambios controlados con mínimo riesgo</td><td>Reemplazo del SFP en ventana aprobada (CAB)</td></tr>
<tr><td>Request Fulfillment</td><td>Pedidos estándar</td><td>Alta de VPN para un usuario</td></tr>
<tr><td>Event Management</td><td>Detectar y filtrar eventos</td><td>Alarmas del Zabbix</td></tr></table>
<p>Tipos de cambio: <b>estándar</b> (preaprobado), <b>normal</b> (pasa por CAB), <b>emergencia</b>. Todo cambio necesita: plan, impacto, ventana, <b>plan de rollback</b> y verificación.</p>
<h4>Ciclo de vida de un incidente</h4>
<pre>Detección → Registro (ticket) → Clasificación y priorización → ACK
 → Diagnóstico inicial → Escalamiento (funcional/jerárquico) → Resolución/Workaround
 → Verificación con el usuario → Cierre → (si P1/P2) Post-mortem / RCA</pre>
<h4>Métricas</h4>
<ul><li><b>MTTD</b>: tiempo medio hasta detectar.</li><li><b>MTTA</b>: tiempo medio hasta reconocer (ACK).</li><li><b>MTTR</b>: tiempo medio de reparación/restauración.</li><li><b>MTBF</b>: tiempo medio entre fallas.</li></ul>
<p><b>SLA</b> (acuerdo con el cliente) · <b>SLO</b> (objetivo interno, ej. 99.95%) · <b>SLI</b> (lo que se mide realmente) · <b>OLA</b> (acuerdo entre áreas internas).</p>` },
    { t: 'Disponibilidad, comunicación y runbooks', h: `
<h4>Disponibilidad ("los nueves")</h4>
<table><tr><th>SLA</th><th>Caída permitida por año</th><th>Por mes (30 d)</th></tr>
<tr><td>99%</td><td>3.65 días</td><td>7.2 h</td></tr><tr><td>99.5%</td><td>1.83 días</td><td>3.6 h</td></tr>
<tr><td>99.9%</td><td>8.76 h</td><td>43.2 min</td></tr><tr><td>99.95%</td><td>4.38 h</td><td>21.6 min</td></tr>
<tr><td>99.99%</td><td>52.6 min</td><td>4.3 min</td></tr><tr><td>99.999%</td><td>5.26 min</td><td>26 s</td></tr></table>
<p>Disponibilidad = (tiempo total − tiempo de caída) / tiempo total × 100. Dos componentes en <b>serie</b> multiplican: 99.9% × 99.9% = 99.8%. En <b>paralelo</b> (redundancia): 1 − (0.001 × 0.001) = 99.9999%.</p>
<h4>Plantilla de comunicación de incidente</h4>
<pre>[INCIDENTE P1] Caída de enlace WAN – Sucursal Córdoba
Estado: INVESTIGANDO | Inicio: 10:42 | Próxima actualización: 11:15
Impacto: 45 usuarios sin acceso a ERP y telefonía. Internet operativa vía backup.
Acciones: reclamo abierto con el carrier (caso #88231), técnico en camino.
Responsable: NOC – Guillermo C.</pre>
<p>Estados: Investigating → Identified → Monitoring → Resolved.</p>
<h4>Runbook (procedimiento operativo)</h4>
<p>Documento paso a paso para una alarma concreta: "Alarma: interfaz WAN down en router de sucursal" → 1) verificar en el NMS si es solo ese enlace; 2) ping/traceroute; 3) <code>show interfaces</code>, <code>show logging</code>; 4) verificar si el backup tomó; 5) abrir reclamo al carrier con ID de circuito; 6) notificar; 7) seguimiento cada 30 min.</p>
<div class="tip">Practicá en el <a href="#/tool/noc">Simulador de turno NOC</a>: 5 incidentes reales con decisiones, tiempos y puntaje.</div>` }
  ],
  english: [
    ['outage', 'caída / corte de servicio', 'We are experiencing a major outage in the north region.'],
    ['to acknowledge an alert', 'reconocer una alerta', 'Acknowledge the alert within 5 minutes.'],
    ['on-call engineer', 'ingeniero de guardia', 'I paged the on-call engineer.'],
    ['maintenance window', 'ventana de mantenimiento', 'The change is scheduled for the Sunday maintenance window.'],
    ['rollback plan', 'plan de reversión', 'Every change request needs a rollback plan.'],
    ['shift handover', 'pase de turno', 'Include all open incidents in the shift handover.'],
    ['degraded performance', 'rendimiento degradado', 'Users report degraded performance on VoIP.'],
    ['threshold', 'umbral', 'CPU usage crossed the 90% threshold.'],
    ['false positive', 'falso positivo', 'The alert was a false positive caused by maintenance.'],
    ['post-mortem / RCA', 'análisis posterior / causa raíz', 'We will share the RCA within 48 hours.'],
    ['uptime', 'tiempo en funcionamiento', 'Our SLA guarantees 99.9% uptime.'],
    ['circuit ID', 'identificador de circuito', 'Please provide the circuit ID to the carrier.'],
    ['to page someone', 'llamar/alertar a alguien de guardia', 'PagerDuty paged the network team at 3 AM.'],
    ['status update', 'actualización de estado', 'Next status update in 30 minutes.']
  ],
  phrases: [
    ['We are currently investigating an issue affecting...', 'Estamos investigando un problema que afecta a...'],
    ['The issue has been identified and a fix is being implemented.', 'El problema fue identificado y se está aplicando una solución.'],
    ['Service has been restored. We will continue monitoring.', 'El servicio fue restablecido. Seguimos monitoreando.'],
    ['I opened a ticket with the carrier, reference number 88231.', 'Abrí un reclamo con el carrier, número 88231.'],
    ['Can you confirm whether the link is up on your side?', '¿Podés confirmar si el enlace está arriba de tu lado?']
  ],
  flash: [
    ['Puertos SNMP', '161 consultas / 162 traps (UDP)'], ['Versión segura de SNMP', 'v3 con authPriv'], ['Severidad syslog 3', 'Error'], ['Severidad syslog 0', 'Emergency'],
    ['Caída permitida con 99.9% anual', '8.76 horas'], ['MTTR', 'Mean Time To Repair/Restore'], ['Incidente vs Problema', 'Incidente: restaurar ya · Problema: causa raíz'],
    ['¿Qué debe tener todo cambio?', 'Plan, impacto, ventana, rollback, verificación'], ['NetFlow sirve para...', 'Ver quién habla con quién y cuánto tráfico (top talkers)'],
    ['SLA vs SLO vs SLI', 'Acuerdo con cliente / objetivo interno / métrica medida'], ['Dying gasp + LOS en muchas ONTs', 'Correlacionar: energía vs fibra']
  ],
  quiz: [
    { q: '¿Qué versión de SNMP ofrece autenticación y cifrado?', o: ['v1', 'v2c', 'v3', 'Todas'], a: 2, e: 'SNMPv3 con nivel authPriv.' },
    { q: 'Los traps SNMP se envían por:', o: ['TCP 161', 'UDP 161', 'UDP 162', 'TCP 514'], a: 2, e: 'El agente envía traps al manager en UDP 162.' },
    { q: 'Mensaje `%LINK-3-UPDOWN`. ¿Qué severidad es 3?', o: ['Critical', 'Error', 'Warning', 'Notice'], a: 1, e: '0 Emerg, 1 Alert, 2 Crit, 3 Err, 4 Warn, 5 Notice, 6 Info, 7 Debug.' },
    { q: 'Un SLA de 99.9% mensual (30 días) permite aprox.:', o: ['4 min', '43 min', '7 h', '1 día'], a: 1, e: '0.1% de 43200 min = 43.2 min.' },
    { q: 'Restablecer el servicio con un workaround corresponde a...', o: ['Problem Management', 'Incident Management', 'Change Management', 'Capacity Management'], a: 1, e: 'El objetivo de Incident es restaurar rápido.' },
    { q: 'Cae el router de una sucursal y llegan 40 alarmas de equipos detrás. ¿Qué evita esto?', o: ['Subir umbrales', 'Dependencias / correlación de alarmas', 'Apagar el monitoreo', 'SNMPv1'], a: 1, e: 'Las dependencias suprimen alertas hijas.' },
    { q: 'Dos equipos en serie con 99% de disponibilidad cada uno dan:', o: ['99%', '98.01%', '99.99%', '100%'], a: 1, e: '0.99 × 0.99 = 0.9801.' },
    { q: 'Para saber qué IP está consumiendo todo el enlace usarías:', o: ['Ping', 'NetFlow/sFlow', 'Syslog', 'DHCP'], a: 1, e: 'Los flujos muestran top talkers y aplicaciones.' },
    { q: '¿Qué es imprescindible en un pedido de cambio?', o: ['Plan de rollback', 'Que sea en horario pico', 'Hacerlo sin avisar', 'Desactivar el monitoreo para siempre'], a: 0, e: 'Si algo sale mal, hay que poder volver atrás.' },
    { q: 'Primer paso al ver una alarma nueva en la consola:', o: ['Reiniciar el equipo', 'Reconocerla (ACK) y evaluar alcance/impacto', 'Ignorarla', 'Llamar al gerente'], a: 1, e: 'ACK + triage evita duplicar trabajo y mide MTTA.' },
    { q: 'Al abrir un reclamo a un carrier, el dato más importante es:', o: ['La MAC de tu PC', 'El ID de circuito/servicio', 'El nombre del switch', 'La VLAN nativa'], a: 1, e: 'El carrier identifica el servicio por ID de circuito.' }
  ],
  lab: { t: 'Lab 9: Montá tu mini-NOC', h: `
<ol><li>En una VM Linux con Docker, levantá <b>Uptime Kuma</b>: <code>docker run -d -p 3001:3001 --name kuma louislam/uptime-kuma:1</code> y monitoreá 5 sitios/IPs (ping, HTTP, DNS, puerto TCP).</li>
<li>(Avanzado) Levantá <b>Zabbix</b> o <b>Prometheus + Grafana + node_exporter</b> con docker compose y armá un dashboard de CPU, RAM, disco y tráfico.</li>
<li>Configurá SNMP en un router de Packet Tracer o GNS3 y hacé <code>snmpwalk</code> desde Linux.</li>
<li>Escribí un <b>runbook</b> (1 página) para la alarma "Disco &gt; 90% en servidor Linux".</li>
<li>Redactá en inglés una notificación de incidente y una de mantenimiento programado.</li>
<li>Completá los 5 escenarios del <a href="#/tool/noc">simulador NOC</a>.</li></ol>` }
});

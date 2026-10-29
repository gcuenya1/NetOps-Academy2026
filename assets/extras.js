window.ENGLISH = {
  situations: [
    { t: '🚨 Comunicación de incidentes (NOC)', p: [
      ['We are aware of an issue affecting VPN access and are actively investigating.', 'Estamos al tanto de un problema que afecta el acceso VPN y lo estamos investigando.'],
      ['Impact: approximately 200 users in the Córdoba branch cannot reach the ERP.', 'Impacto: aproximadamente 200 usuarios de la sucursal Córdoba no acceden al ERP.'],
      ['The root cause has been identified as a fiber cut on the carrier\'s side.', 'La causa raíz fue identificada como un corte de fibra del lado del carrier.'],
      ['Traffic has been rerouted to the backup link. Service is degraded but operational.', 'El tráfico fue redirigido al enlace de backup. El servicio está degradado pero operativo.'],
      ['Service was fully restored at 14:32 UTC. We will keep monitoring for the next hour.', 'El servicio quedó totalmente restablecido a las 14:32 UTC. Seguiremos monitoreando la próxima hora.'],
      ['Next update in 30 minutes or sooner if there are significant changes.', 'Próxima actualización en 30 minutos, o antes si hay cambios importantes.']] },
    { t: '📞 Soporte telefónico / chat', p: [
      ['Thank you for calling the IT service desk, this is Guillermo. How can I help you?', 'Gracias por llamar a la mesa de ayuda, habla Guillermo. ¿En qué te puedo ayudar?'],
      ['Could you please spell your username for me?', '¿Me podrías deletrear tu usuario?'],
      ['I understand how frustrating this must be. Let\'s get it sorted out.', 'Entiendo lo frustrante que debe ser. Vamos a resolverlo.'],
      ['Could you right-click the network icon and tell me what you see?', '¿Podés hacer clic derecho en el ícono de red y decirme qué ves?'],
      ['I\'m going to put you on hold for a moment while I check this.', 'Te dejo en espera un momento mientras lo verifico.'],
      ['I\'ve escalated your ticket to the network team; they will contact you within two hours.', 'Escalé tu ticket al equipo de redes; te contactarán dentro de dos horas.'],
      ['Your ticket number is INC-20431. Please keep it for future reference.', 'Tu número de ticket es INC-20431. Guardalo como referencia.']] },
    { t: '🔄 Pase de turno (shift handover)', p: [
      ['There are two open incidents: a P2 on the Rosario WAN link and a P3 printer issue.', 'Hay dos incidentes abiertos: un P2 del enlace WAN de Rosario y un P3 de impresora.'],
      ['The carrier gave us an ETA of 6 PM for the fiber repair.', 'El carrier nos dio una hora estimada de las 18 h para reparar la fibra.'],
      ['There is a scheduled maintenance on the core switches tonight from 1 to 3 AM.', 'Hay un mantenimiento programado en los switches core esta noche de 1 a 3.'],
      ['Keep an eye on the CPU of the edge firewall; it has been spiking.', 'Vigilá la CPU del firewall de borde, tuvo picos.']] },
    { t: '🛠️ Reuniones técnicas y cambios', p: [
      ['I\'d like to propose a change to upgrade the firmware on the access switches.', 'Quiero proponer un cambio para actualizar el firmware de los switches de acceso.'],
      ['What is the rollback plan if the upgrade fails?', '¿Cuál es el plan de rollback si la actualización falla?'],
      ['Could you share your screen so we can troubleshoot together?', '¿Podés compartir pantalla así lo diagnosticamos juntos?'],
      ['Let me double-check and get back to you.', 'Dejame verificarlo y te respondo.'],
      ['I don\'t know off the top of my head, but I\'ll find out.', 'No lo sé de memoria, pero lo averiguo.']] },
    { t: '🔊 Pronunciación de siglas (cómo se dicen)', p: [
      ['VLAN → "vee-lan" · SQL → "sequel" o "S-Q-L" · GUI → "gooey"', 'Las siglas que se leen como palabra'],
      ['Cisco IOS → "eye-oh-ess" · SSID → "S-S-I-D" · DNS → "D-N-S"', 'Las que se deletrean'],
      ['Router → EE.UU. "rau-ter" / Reino Unido "ru-ter" · Cache → "cash" · Linux → "li-nuks"', 'Palabras que se pronuncian distinto de lo que parece'],
      ['IP addresses: "ten dot one dot twenty dot five" · /24 → "slash twenty-four"', 'Cómo dictar direcciones IP']] }
  ],
  interview: [
    ['Tell me about yourself.', 'Presentación de 60–90 s: formación, experiencia, por qué este puesto.', 'I\'m a Telecommunications Engineer with more than six years of experience in QA automation and software engineering, at companies like Mercado Libre and Wind River. My final degree project was in communications, and I have hands-on experience with RF measurements, fiber optics and radio links. I also teach networking-related subjects and coordinate a software development program. I\'m now focusing on network operations and security, where I can combine my telecom background with my automation skills in Python and Linux.'],
    ['Walk me through what happens when you type a URL into a browser.', 'Respuesta clásica: DNS, ARP, TCP, TLS, HTTP.', 'First, the browser checks its cache and then asks the DNS resolver to translate the domain name into an IP address. Then the OS uses ARP to find the MAC address of the default gateway. The client opens a TCP connection to port 443 with a three-way handshake, and then a TLS handshake validates the server certificate and agrees on session keys. The browser sends an HTTP GET request, the traffic goes through NAT at the edge router, and the server replies with a 200 OK and the content, which the browser renders.'],
    ['How would you troubleshoot a user who says "the internet is not working"?', 'Metodología + bottom-up.', 'I would start by defining the scope: is it only this user or more people? Then I\'d work up the OSI model: check physical connectivity, run ipconfig to see if the user has a valid IP address or an APIPA address, ping the default gateway, ping a public IP like 8.8.8.8, and then test DNS with nslookup. Depending on where it fails, I can isolate the issue to the cable, DHCP, routing, firewall or DNS. Finally, I document the resolution in the ticket.'],
    ['What is the difference between TCP and UDP?', 'Conexión, fiabilidad, ejemplos.', 'TCP is connection-oriented: it uses a three-way handshake, acknowledgments, retransmissions and flow control, so it is reliable but has more overhead. It is used for web, email and SSH. UDP is connectionless and best-effort, with a small header and lower latency, so it is used for DNS queries, VoIP, video streaming, DHCP and SNMP.'],
    ['What is a VLAN and why would you use one?', 'Segmentación, broadcast, seguridad.', 'A VLAN is a logical network that splits a physical switch into multiple broadcast domains. We use VLANs to separate traffic by department or function, like users, voice, cameras and management. This improves security, reduces broadcast traffic and makes the network easier to manage. To carry multiple VLANs between switches we use 802.1Q trunks, and to route between VLANs we need a layer 3 device.'],
    ['Describe a time you handled a critical incident.', 'Método STAR: Situation, Task, Action, Result.', 'Situation: during a release, a critical service started failing for a large number of users. Task: I had to help identify the cause quickly and restore the service. Action: I checked the monitoring dashboards and logs, correlated the errors with the deployment time, reproduced the issue and coordinated a rollback with the team while keeping stakeholders updated every 15 minutes. Result: service was restored in under 30 minutes, and in the post-mortem we added an automated test that would have caught the problem.'],
    ['How does SNMP work and which version would you use?', 'Manager/agente, 161/162, v3.', 'SNMP lets a network management system poll agents on devices over UDP 161 to read values from the MIB, identified by OIDs, such as interface counters or CPU. Devices can also send traps to the manager on UDP 162 when something happens. I would use SNMPv3 with authPriv, because it provides authentication and encryption, unlike v1 and v2c which send community strings in clear text.'],
    ['What would you do if you received an alert that a core link is down at 3 AM?', 'Procedimiento NOC.', 'I would acknowledge the alert, verify it is real by checking related alarms and pinging the devices, and assess the impact: did traffic fail over to the redundant path? Then I would follow the runbook: check interface status and logs, open a ticket with the carrier including the circuit ID if it is a provider link, and escalate to the on-call engineer if the impact is high. I would send status updates on a fixed schedule and document every step in the ticket.'],
    ['What is the difference between a firewall and an IPS?', 'Política vs detección de amenazas.', 'A firewall enforces access policies, allowing or denying traffic based on rules such as IP addresses, ports, applications or users. An IPS sits inline and inspects traffic content to detect and block malicious activity using signatures or anomaly detection. Next-generation firewalls usually combine both functions.'],
    ['Why do you want to work in a NOC?', 'Motivación.', 'I enjoy solving problems under pressure and I like having visibility of the whole infrastructure. A NOC role lets me use my telecommunications background, my Linux and networking knowledge, and my automation experience to reduce repetitive work and improve response times. I also see it as a great path toward network security.']
  ],
  falseFriends: [
    ['actually', 'en realidad', 'actualmente', 'currently / nowadays'],
    ['eventually', 'finalmente, con el tiempo', 'eventualmente (quizás)', 'possibly / occasionally'],
    ['to assist', 'ayudar', 'asistir (a una reunión)', 'to attend'],
    ['sensible', 'sensato', 'sensible', 'sensitive'],
    ['library', 'biblioteca / librería de código', 'librería (negocio)', 'bookstore'],
    ['to realize', 'darse cuenta', 'realizar', 'to carry out / to perform'],
    ['support (n.)', 'soporte, ayuda', 'soportar (aguantar)', 'to put up with / to stand'],
    ['to record', 'grabar / registrar', 'recordar', 'to remember / to remind'],
    ['carpet', 'alfombra', 'carpeta', 'folder'],
    ['to pretend', 'fingir', 'pretender (aspirar)', 'to intend / to aim'],
    ['deception', 'engaño', 'decepción', 'disappointment'],
    ['commodity', 'materia prima / producto básico', 'comodidad', 'comfort / convenience']
  ]
};

window.PLAN = [
  { d: 'Día 1 · Fundamentos y direccionamiento (3–4 h)', items: ['Unidad 1: Fundamentos de redes (OSI, Ethernet, medios)', 'Unidad 2: IPv4, Subnetting, VLSM, IPv6', '🧮 Subnetting Trainer: 10 aciertos seguidos', 'English: drill de U1 y U2 + pronunciá 10 IPs en voz alta'] },
  { d: 'Día 2 · Servicios y switching (3–4 h)', items: ['Unidad 3: Protocolos y servicios (TCP/UDP, DNS, DHCP, NAT)', '⚡ Port Rush: superar 15 aciertos', 'Unidad 4: CCNA Switching (VLAN, trunk, STP, EtherChannel)', '🔀 Simulador Cisco IOS: las 10 misiones'] },
  { d: 'Día 3 · Routing y telecom (3–4 h)', items: ['Unidad 5: CCNA Routing (estático, OSPF, ACL, NAT, HSRP)', 'Unidad 6: Wireless, RF, fibra, GPON, MPLS, SD-WAN', 'Lab 6: cálculos de presupuesto óptico y radioenlace', 'English: "Walk me through what happens when you type a URL"'] },
  { d: 'Día 4 · Linux y soporte (3–4 h)', items: ['Unidad 7: Linux para redes y NOC', '🐧 Terminal Linux: completar las 14 misiones', 'Unidad 8: Soporte técnico y mesa de ayuda', 'English: role-play de llamada de soporte (Lab 8)'] },
  { d: 'Día 5 · NOC y seguridad (3–4 h)', items: ['Unidad 9: Operaciones NOC (SNMP, ITIL, SLA)', '🛰️ Simulador de turno NOC: 5 escenarios', 'Unidad 10: Ciberseguridad', 'English: redactar una notificación de incidente'] },
  { d: 'Día 6 · Automatización (3–4 h)', items: ['Unidad 11: Python para redes + 🐍 Python Lab', 'Unidad 12: Cloud, Docker, Ansible, SDN, Git', 'English: practicar las 10 preguntas de entrevista en voz alta'] },
  { d: 'Día 7 · Hacking ético (3–4 h)', items: ['Unidad 13: Hacking ético y pentesting', 'Lab 13: armar Kali + Metasploitable en red aislada y escanear con Nmap', 'DVWA: SQLi, XSS y Command Injection en nivel low', '🎓 Examen final (≥ 80%)', 'English: redactar el resumen ejecutivo del informe en inglés'] },
  { d: 'Después (semanas siguientes)', items: ['Repasar las flashcards de las unidades con quiz < 90%', 'Labs reales: Packet Tracer, VM Linux, Docker, TryHackMe', 'Objetivo de certificación: CCNA (200-301), CompTIA Security+ y luego eJPT', 'Mantener la racha: 20 minutos diarios de drill de inglés + 1 quiz'] }
];

window.RESOURCES = `<table>
<tr><th>Herramienta</th><th>Para qué</th></tr>
<tr><td><b>Cisco Packet Tracer</b> (gratis con cuenta de NetAcad / Skills for All)</td><td>Labs de CCNA: VLANs, OSPF, ACLs, NAT</td></tr>
<tr><td><b>GNS3 / EVE-NG / Cisco CML</b></td><td>Emulación con imágenes reales</td></tr>
<tr><td><b>VirtualBox + Ubuntu Server</b> o <b>WSL</b></td><td>Linux real, servicios, scripting</td></tr>
<tr><td><b>Wireshark</b></td><td>Análisis de tráfico</td></tr>
<tr><td><b>Docker Desktop</b></td><td>Montar Uptime Kuma, Grafana, Prometheus, Zabbix</td></tr>
<tr><td><b>Cisco DevNet Sandbox</b></td><td>Equipos reales por API para automatización</td></tr>
<tr><td><b>TryHackMe / Hack The Box / LetsDefend</b></td><td>Ciberseguridad práctica (blue y red team)</td></tr>
<tr><td><b>OverTheWire: Bandit</b></td><td>Linux gamificado</td></tr>
<tr><td><b>Jeremy's IT Lab</b> (YouTube) · <b>Professor Messer</b></td><td>Curso CCNA gratis · Network+ / Security+</td></tr>
<tr><td><b>subnettingpractice.com</b> · <b>regex101.com</b></td><td>Práctica de subnetting · probar expresiones regulares</td></tr>
</table>`;

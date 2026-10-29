window.UNITS.push({
  id: 'u08', num: 8, icon: '🎧', short: 'Soporte técnico', time: '2 h',
  title: 'Soporte técnico y Mesa de ayuda: metodología, Windows, AD y atención al usuario',
  desc: 'Resolver rápido y bien, documentar y comunicarse con el usuario. Lo que separa a un buen técnico N1/N2.',
  goals: ['Aplicar una metodología de troubleshooting estructurada', 'Usar comandos de diagnóstico de Windows y PowerShell', 'Resolver tareas comunes de Active Directory, GPO y cuentas', 'Gestionar tickets con prioridad, SLA, escalamiento y buena comunicación'],
  lessons: [
    { t: 'Metodología de troubleshooting (CompTIA)', h: `
<ol><li><b>Identificar el problema</b>: preguntar al usuario, reproducir, ver qué cambió recientemente, ¿afecta a uno o a muchos?</li>
<li><b>Establecer una teoría</b> de causa probable (empezá por lo obvio: ¿está enchufado?).</li>
<li><b>Probar la teoría</b>. Si no se confirma, nueva teoría o escalar.</li>
<li><b>Plan de acción</b> y evaluar su impacto (¿necesito ventana de cambio?).</li>
<li><b>Implementar</b> la solución o escalar.</li>
<li><b>Verificar</b> la funcionalidad completa del sistema (y aplicar medidas preventivas).</li>
<li><b>Documentar</b> hallazgos, acciones y resultado.</li></ol>
<h4>Preguntas clave al usuario</h4>
<ul><li>¿Qué estabas haciendo cuando ocurrió? ¿Aparece algún mensaje de error exacto?</li><li>¿Desde cuándo? ¿Funcionaba antes? ¿Qué cambió (actualización, instalación, mudanza de puesto)?</li><li>¿Le pasa a algún compañero también?</li><li>¿Lo podés reproducir? ¿Desde otro equipo/navegador funciona?</li></ul>
<div class="tip"><b>Alcance primero</b>: un usuario = problema local (su PC, su cable, su cuenta). Todo un piso = switch/AP/VLAN. Toda la empresa = core, Internet, DNS, servicio central.</div>` },
    { t: '"No tengo internet": el árbol de diagnóstico', h: `
<pre>1. ¿Hay link? (luz de la placa / ícono de red / Wi-Fi conectado)
      └─ No → cable, puerto del switch, patchera, placa, driver, Wi-Fi apagado
2. ipconfig /all → ¿Qué IP tiene?
      ├─ 169.254.x.x → no hay DHCP: VLAN, servidor DHCP, scope agotado
      └─ IP válida → seguir
3. ping al gateway   → falla: VLAN/puerto/ARP/firewall local
4. ping 8.8.8.8      → falla: ruteo, NAT, firewall perimetral, ISP
5. nslookup google.com → falla: DNS
6. ¿Abre una web? → falla: proxy, navegador, certificado, filtro de contenido
7. ¿Solo una aplicación? → puerto bloqueado, credenciales, servicio caído</pre>
<h4>Comandos Windows (CMD)</h4>
<pre>ipconfig /all          ipconfig /release   ipconfig /renew   ipconfig /flushdns
ping -t 192.168.1.1    tracert 8.8.8.8     pathping 8.8.8.8
nslookup dominio       arp -a              route print
netstat -ano           # conexiones + PID → tasklist /fi "pid eq 1234"
netsh wlan show interfaces          netsh int ip reset    netsh winsock reset
sfc /scannow           DISM /Online /Cleanup-Image /RestoreHealth
gpupdate /force        gpresult /r         whoami /groups
systeminfo             msinfo32            eventvwr.msc   services.msc   devmgmt.msc
mstsc                  # escritorio remoto</pre>
<h4>PowerShell</h4>
<pre>Get-NetIPConfiguration
Test-NetConnection 10.0.0.5 -Port 443
Resolve-DnsName google.com
Get-Service | Where-Object Status -eq 'Stopped'
Restart-Service Spooler
Get-EventLog -LogName System -Newest 20 -EntryType Error
Get-ComputerInfo | Select OsName, OsVersion</pre>` },
    { t: 'Active Directory, DNS interno y GPO', h: `
<p><b>Active Directory (AD DS)</b> es el directorio de Microsoft: usuarios, equipos, grupos y políticas en un <b>dominio</b> (ej. <i>empresa.local</i>). Los <b>Domain Controllers (DC)</b> autentican con <b>Kerberos</b> (UDP/TCP 88) y LDAP (389/636).</p>
<ul><li><b>OU</b> (Unidad Organizativa): carpetas para organizar objetos y aplicarles GPOs.</li>
<li><b>Grupos</b>: de seguridad (permisos) y de distribución (mail). Buenas prácticas: permisos a grupos, no a usuarios.</li>
<li><b>GPO</b>: políticas (fondo de pantalla, mapeo de unidades, impresoras, contraseñas, bloqueo de USB). Se aplican en orden <b>LSDOU</b>: Local, Site, Domain, OU.</li>
<li><b>DNS</b> es imprescindible: los clientes deben usar el DC como DNS, no 8.8.8.8, o no encontrarán el dominio.</li></ul>
<h4>Tareas N1 típicas</h4>
<ul><li>Reset de contraseña y <b>desbloqueo de cuenta</b> (ADUC: <i>dsa.msc</i>, o PowerShell <code>Unlock-ADAccount jperez</code>, <code>Set-ADAccountPassword</code>).</li>
<li>Alta/baja de usuarios (onboarding/offboarding) y agregado a grupos.</li>
<li>Unir equipo al dominio; "la relación de confianza entre esta estación de trabajo y el dominio principal falló" → volver a unir o <code>Reset-ComputerMachinePassword</code>.</li>
<li>Mapear unidades de red: <code>net use Z: \\\\servidor\\compartido</code>.</li></ul>
<div class="warn">Error de hora: si el reloj de la PC difiere más de 5 minutos del DC, Kerberos falla y el usuario no puede iniciar sesión.</div>
<p>Hoy también: <b>Microsoft Entra ID</b> (ex Azure AD) para la nube / Microsoft 365, con MFA y acceso condicional.</p>` },
    { t: 'Hardware, SO y periféricos', h: `
<table><tr><th>Síntoma</th><th>Posibles causas</th></tr>
<tr><td>No enciende</td><td>Fuente, cable, botón, placa madre</td></tr>
<tr><td>Enciende pero no da video / pitidos</td><td>RAM mal colocada, placa de video, POST fallido</td></tr>
<tr><td>Pantalla azul (BSOD)</td><td>Drivers, RAM (mdsched), disco, actualización reciente. Anotar el <i>stop code</i></td></tr>
<tr><td>Lentitud general</td><td>Disco al 100% o con fallas (SMART), poca RAM, malware, arranque cargado</td></tr>
<tr><td>Se apaga solo</td><td>Temperatura (polvo, cooler), fuente</td></tr>
<tr><td>Impresora no imprime</td><td>Cola trabada (reiniciar servicio <i>Spooler</i>), driver, IP de la impresora cambió, papel/tóner</td></tr>
<tr><td>Sin sonido / micrófono en Teams</td><td>Dispositivo predeterminado, permisos de privacidad, driver</td></tr></table>
<p>Herramientas: Administrador de tareas, Monitor de recursos, Visor de eventos, <code>chkdsk /f</code>, CrystalDiskInfo, Modo seguro, Restaurar sistema, imagen/clonación, BitLocker (pedir clave de recuperación al AD/Entra).</p>
<p>Respaldos: regla <b>3-2-1</b> (3 copias, 2 medios, 1 fuera del sitio).</p>` },
    { t: 'Gestión de tickets, SLA y comunicación', h: `
<h4>Niveles de soporte</h4>
<p><b>N0</b> autoservicio (KB, portal) · <b>N1</b> mesa de ayuda: registro, triage, soluciones conocidas · <b>N2</b> técnico especializado (redes, servidores) · <b>N3</b> ingeniería/proveedor.</p>
<h4>Prioridad = Impacto × Urgencia</h4>
<table><tr><th></th><th>Urgencia alta</th><th>Urgencia media</th><th>Urgencia baja</th></tr>
<tr><td><b>Impacto alto</b> (empresa)</td><td>P1 Crítica</td><td>P2 Alta</td><td>P3</td></tr>
<tr><td><b>Impacto medio</b> (área)</td><td>P2</td><td>P3 Media</td><td>P4</td></tr>
<tr><td><b>Impacto bajo</b> (1 usuario)</td><td>P3</td><td>P4</td><td>P4 Baja</td></tr></table>
<p>Herramientas: Jira Service Management, ServiceNow, GLPI, Zendesk, osTicket, Freshservice.</p>
<h4>Un buen ticket tiene</h4>
<ul><li>Usuario, ubicación, equipo/IP, contacto.</li><li>Descripción clara + mensaje de error exacto + captura.</li><li>Pasos realizados y resultados.</li><li>Categoría, prioridad, a quién se escala y por qué.</li><li>Solución final y causa (alimenta la <b>base de conocimiento</b>).</li></ul>
<h4>Comunicación</h4>
<ul><li>Escucha activa, empatía, lenguaje simple sin jerga.</li><li>Pedir permiso antes de conectarse en remoto (AnyDesk, TeamViewer, Quick Assist, RDP).</li><li>Fijar expectativas: "Lo escalo al equipo de redes, te actualizo antes de las 15 h".</li><li>Nunca pedir la contraseña del usuario.</li><li>Cerrar confirmando con el usuario que quedó resuelto.</li></ul>
<div class="en">"I'm sorry for the inconvenience. I'm going to escalate this ticket to our Tier 2 network team. You'll get an update within the next hour."</div>` }
  ],
  english: [
    ['help desk / service desk', 'mesa de ayuda', 'Please open a ticket with the service desk.'],
    ['ticket', 'ticket / caso', 'I updated the ticket with the error message.'],
    ['to escalate', 'escalar', 'I will escalate this to Tier 2.'],
    ['workaround', 'solución temporal', 'As a workaround, use the web version of Outlook.'],
    ['root cause', 'causa raíz', 'The root cause was an expired certificate.'],
    ['to reproduce an issue', 'reproducir un problema', 'Can you reproduce the issue on another PC?'],
    ['remote session', 'sesión remota', 'May I start a remote session on your computer?'],
    ['locked out account', 'cuenta bloqueada', 'Your account is locked out after too many attempts.'],
    ['password reset', 'restablecer contraseña', 'I sent you a password reset link.'],
    ['to walk someone through', 'guiar paso a paso', 'Let me walk you through the steps.'],
    ['knowledge base', 'base de conocimiento', 'I added the solution to the knowledge base.'],
    ['end user', 'usuario final', 'Explain it in plain language to the end user.'],
    ['onboarding / offboarding', 'alta / baja de personal', 'Offboarding includes disabling the AD account.']
  ],
  phrases: [
    ['Could you describe the issue in as much detail as possible?', '¿Podrías describir el problema con el mayor detalle posible?'],
    ['When did this start happening?', '¿Cuándo empezó a pasar?'],
    ['Have you made any changes recently?', '¿Hiciste algún cambio recientemente?'],
    ['Could you read me the exact error message?', '¿Me leés el mensaje de error exacto?'],
    ['Please restart your computer and let me know if the problem persists.', 'Reiniciá la computadora y avisame si el problema sigue.'],
    ['Is there anything else I can help you with?', '¿Hay algo más en lo que te pueda ayudar?']
  ],
  flash: [
    ['Pasos CompTIA (resumen)', 'Identificar → Teoría → Probar → Plan → Implementar → Verificar → Documentar'],
    ['IP 169.254.x.x en Windows', 'APIPA: falló DHCP'], ['Limpiar caché DNS en Windows', 'ipconfig /flushdns'], ['Probar puerto en PowerShell', 'Test-NetConnection host -Port 443'],
    ['Ver conexiones con PID', 'netstat -ano'], ['Forzar políticas de grupo', 'gpupdate /force'], ['Orden de aplicación de GPO', 'LSDOU: Local, Site, Domain, OU'],
    ['Desfase máximo de hora para Kerberos', '5 minutos'], ['Prioridad =', 'Impacto × Urgencia'], ['Reparar archivos de sistema', 'sfc /scannow'], ['Servicio de cola de impresión', 'Spooler']
  ],
  quiz: [
    { q: 'Primer paso de la metodología de troubleshooting', o: ['Reemplazar el equipo', 'Identificar el problema', 'Documentar', 'Escalar'], a: 1, e: 'Recolectar información y definir el alcance.' },
    { q: 'Un usuario tiene IP válida, hace ping al gateway pero no a 8.8.8.8. ¿Dónde mirás?', o: ['Placa de red', 'Ruteo/NAT/firewall perimetral o ISP', 'DNS', 'Navegador'], a: 1, e: 'La LAN funciona; el problema está de la salida a Internet hacia afuera.' },
    { q: 'Usuarios no pueden iniciar sesión en el dominio y sus PCs tienen la hora 10 min adelantada. Causa:', o: ['DHCP', 'Kerberos rechaza por desfase horario', 'GPO', 'Wi-Fi'], a: 1, e: 'Kerberos tolera hasta 5 min por defecto.' },
    { q: 'La impresora tiene trabajos trabados en cola. Acción típica:', o: ['Formatear la PC', 'Reiniciar el servicio Spooler', 'Cambiar la IP del switch', 'Actualizar BIOS'], a: 1, e: 'net stop spooler / net start spooler o Restart-Service Spooler.' },
    { q: 'Toda la empresa sin acceso al ERP. Una sola persona reportó. ¿Prioridad?', o: ['P4', 'P3', 'P1/P2 (alto impacto)', 'Ninguna'], a: 2, e: 'El impacto lo define el alcance real, no la cantidad de reportes.' },
    { q: 'Comando para ver qué proceso usa una conexión en Windows', o: ['ipconfig', 'netstat -ano + tasklist', 'tracert', 'arp -a'], a: 1, e: 'netstat -ano muestra el PID.' },
    { q: 'Los clientes de un dominio AD deben usar como DNS...', o: ['8.8.8.8', 'El router del ISP', 'Los Domain Controllers/DNS internos', 'Cualquiera'], a: 2, e: 'Sin el DNS interno no encuentran registros SRV del dominio.' },
    { q: '¿Qué NUNCA debe hacer un técnico?', o: ['Documentar', 'Pedir la contraseña del usuario', 'Escalar', 'Pedir permiso para acceso remoto'], a: 1, e: 'Se resetea, nunca se pide.' },
    { q: 'Una solución temporal que restablece el servicio sin resolver la causa se llama:', o: ['Root cause', 'Workaround', 'Hotfix', 'Rollback'], a: 1, e: 'Workaround; luego Problem Management busca la causa raíz.' },
    { q: 'Regla de backup recomendada', o: ['1-1-1', '3-2-1', '2-2-2', '5-0-1'], a: 1, e: '3 copias, 2 medios distintos, 1 fuera del sitio.' },
    { q: 'Comando PowerShell para desbloquear una cuenta de AD', o: ['Unlock-ADAccount', 'Reset-User', 'net unlock', 'gpupdate'], a: 0, e: 'Módulo ActiveDirectory: Unlock-ADAccount -Identity usuario.' }
  ],
  lab: { t: 'Lab 8: Role-play de mesa de ayuda (en inglés)', h: `
<ol><li>Escribí un ticket completo (en español y en inglés) para este caso: <i>"María, de Contabilidad (piso 2), no puede imprimir ni abrir la carpeta compartida desde las 9:00. Su compañera sí puede."</i></li>
<li>Diagnóstico: listá en orden los comandos que ejecutarías y qué esperás ver.</li>
<li>Grabate (audio del celular) haciendo la llamada en inglés usando las <i>Useful phrases</i>: saludo, preguntas, explicación, escalamiento y cierre.</li>
<li>En tu PC: ejecutá <code>systeminfo</code>, <code>gpresult /r</code>, <code>Get-NetIPConfiguration</code> y revisá en el Visor de eventos los errores del último día.</li></ol>
<details class="lesson"><summary>Ver posible diagnóstico</summary><div class="lbody"><p>Afecta a 1 usuario → local. Probables: cable/puerto (si no tiene red), sesión con credenciales vencidas o cuenta bloqueada (no accede al compartido ni a la impresora del servidor de impresión), PC perdió la relación de confianza con el dominio, o IP en 169.254 por puerto en VLAN incorrecta. Comandos: <code>ipconfig /all</code>, <code>ping servidor</code>, <code>nslookup servidor</code>, <code>whoami /groups</code>, <code>net use</code>, <code>klist</code>, <code>Test-ComputerSecureChannel</code>.</p></div></details>` }
});

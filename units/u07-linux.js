window.UNITS.push({
  id: 'u07', num: 7, icon: '🐧', short: 'Linux para redes/NOC', time: '2.5 h', tool: 'terminal',
  title: 'Linux para Redes y NOC: comandos, permisos, servicios, logs y scripting',
  desc: 'El 90% de los servidores, firewalls, herramientas de monitoreo y equipos de red corren Linux. Esta es la caja de herramientas diaria.',
  goals: ['Navegar el sistema de archivos y manipular archivos con fluidez', 'Gestionar permisos, usuarios, procesos y servicios systemd', 'Diagnosticar red con ip, ss, dig, tcpdump, curl, mtr', 'Analizar logs con grep/awk/tail y automatizar con bash + cron'],
  lessons: [
    { t: 'Sistema de archivos y navegación', h: `
<table><tr><th>Ruta</th><th>Contenido</th></tr>
<tr><td>/etc</td><td>Configuración (hosts, resolv.conf, ssh/, netplan/, nginx/)</td></tr>
<tr><td>/var/log</td><td>Logs (syslog o messages, auth.log o secure, nginx/)</td></tr>
<tr><td>/home, /root</td><td>Directorios de usuarios</td></tr>
<tr><td>/bin, /usr/bin, /sbin</td><td>Ejecutables</td></tr>
<tr><td>/tmp</td><td>Temporales (se borran al reiniciar)</td></tr>
<tr><td>/proc, /sys</td><td>Info del kernel en vivo (/proc/cpuinfo, /proc/meminfo)</td></tr>
<tr><td>/dev</td><td>Dispositivos (sda, ttyUSB0 para consola serie)</td></tr>
<tr><td>/opt, /srv</td><td>Software adicional / datos de servicios</td></tr></table>
<pre>pwd                     # dónde estoy
ls -lah                 # listar con detalles, ocultos y tamaños legibles
cd /var/log ; cd ~ ; cd -   # ir, home, volver al anterior
mkdir -p a/b/c          # crear directorios anidados
cp -r origen destino ; mv viejo nuevo ; rm -rf carpeta   # ¡cuidado con rm -rf!
touch archivo.txt ; cat archivo ; less archivo   # less: /buscar, q salir
head -n 20 archivo ; tail -n 50 archivo ; tail -f /var/log/syslog
find /etc -name "*.conf" ; find / -size +100M 2>/dev/null
which ping ; man ss ; history ; Ctrl+R (buscar en historial)</pre>
<p>Redirecciones y pipes: <code>&gt;</code> sobrescribe, <code>&gt;&gt;</code> agrega, <code>2&gt;</code> errores, <code>|</code> pasa la salida a otro comando, <code>&amp;&amp;</code> ejecuta si el anterior fue exitoso.</p>
<div class="tip">Editores: <code>nano</code> (fácil: Ctrl+O guarda, Ctrl+X sale) y <code>vim</code> (i inserta, Esc, :wq guarda y sale, :q! sale sin guardar). En un NOC te vas a cruzar con vim sí o sí.</div>` },
    { t: 'Usuarios, permisos y sudo', h: `
<pre>-rwxr-x--- 1 guille noc 1.2K Oct 29 10:00 backup.sh
│└┬┘└┬┘└┬┘   └─┬──┘ └┬┘
│ │  │  │      │     └─ grupo
│ │  │  │      └─ dueño
│ │  │  └─ otros: ---  (nada)
│ │  └─ grupo: r-x  (leer y ejecutar)
│ └─ dueño: rwx    (todo)
└─ tipo: - archivo, d directorio, l enlace</pre>
<p>Valores octales: <b>r = 4, w = 2, x = 1</b>. 755 = rwxr-xr-x · 644 = rw-r--r-- · 600 = rw------- (claves privadas SSH) · 700 = rwx------.</p>
<pre>chmod +x script.sh ; chmod 640 archivo ; chmod -R g+w carpeta
chown usuario:grupo archivo
sudo comando          # ejecutar como root (queda en /var/log/auth.log)
sudo -i               # shell de root
id ; whoami ; groups
adduser juan ; usermod -aG sudo juan ; passwd juan
cat /etc/passwd ; sudo cat /etc/shadow</pre>
<div class="warn">Principio de mínimo privilegio: no trabajes como root. Usá <code>sudo</code> para lo puntual y deshabilitá el login SSH de root (<code>PermitRootLogin no</code>).</div>` },
    { t: 'Procesos, servicios (systemd) y paquetes', h: `
<pre>ps aux | grep nginx           # procesos
top / htop                    # monitor en vivo (q para salir)
kill PID ; kill -9 PID        # terminar (15 = amable, 9 = forzado)
uptime                        # tiempo encendido y load average (1, 5, 15 min)
free -h ; df -h ; du -sh *    # memoria, disco por FS, tamaño de carpetas
lsblk ; mount ; dmesg | tail  # discos y mensajes del kernel

systemctl status nginx        # estado de un servicio
sudo systemctl start|stop|restart|reload nginx
sudo systemctl enable --now nginx   # arranque automático + iniciar ya
systemctl --failed            # servicios caídos
journalctl -u nginx -n 50 --no-pager
journalctl -f                 # seguir logs en vivo
journalctl --since "1 hour ago" -p err

# Paquetes
sudo apt update &amp;&amp; sudo apt upgrade        # Debian/Ubuntu
sudo apt install nmap tcpdump mtr dnsutils
sudo dnf install ...                       # RHEL/Rocky/Alma</pre>
<div class="noc"><b>Load average</b> mayor que la cantidad de CPUs (ver con <code>nproc</code>) de forma sostenida = sobrecarga. Un disco al 100% (<code>df -h</code>) es una de las causas más comunes de servicios que dejan de funcionar.</div>` },
    { t: 'Redes en Linux: el kit de diagnóstico', h: `
<pre>ip a                          # interfaces e IPs   (antes: ifconfig)
ip link set eth0 up|down
ip r                          # tabla de ruteo     (antes: route -n)
ip neigh                      # tabla ARP          (antes: arp -n)
ss -tulpn                     # puertos escuchando y proceso (antes: netstat -tulpn)
ss -tan state established
ping -c 4 8.8.8.8
traceroute 8.8.8.8 ; mtr 8.8.8.8     # mtr = ping + traceroute continuo
dig google.com +short ; dig @1.1.1.1 example.com MX ; nslookup host
curl -I https://sitio.com ; curl -v telnet://10.0.0.5:443
nc -zv 10.0.0.5 22            # probar si un puerto TCP está abierto
sudo tcpdump -i eth0 -nn port 53
sudo tcpdump -i any host 10.0.0.5 -w captura.pcap   # abrir en Wireshark
nmap -sV 192.168.1.0/24       # SOLO en redes propias o con autorización
ethtool eth0                  # velocidad, duplex, link
cat /etc/resolv.conf ; cat /etc/hosts</pre>
<h4>Configuración de IP</h4>
<pre># Ubuntu (netplan) /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses: [192.168.1.10/24]
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [192.168.1.1, 8.8.8.8]
# sudo netplan apply
# RHEL / NetworkManager:
nmcli con mod eth0 ipv4.addresses 192.168.1.10/24 ipv4.gateway 192.168.1.1 ipv4.method manual
nmcli con up eth0</pre>
<p>Firewall local: <code>ufw</code> (Ubuntu: <code>ufw allow 22/tcp</code>, <code>ufw status</code>), <code>firewalld</code> (RHEL: <code>firewall-cmd --add-service=http --permanent</code>), <code>nftables/iptables</code> por debajo.</p>` },
    { t: 'Logs, texto y SSH', h: `
<pre>grep -i "error" /var/log/syslog
grep -c "Failed password" /var/log/auth.log
grep "Failed password" /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr | head
tail -f /var/log/nginx/access.log | grep " 500 "
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head   # top IPs
cut -d: -f1 /etc/passwd ; wc -l archivo ; sort ; uniq ; sed 's/viejo/nuevo/g'
zcat /var/log/syslog.2.gz | grep ...      # logs rotados (logrotate)</pre>
<h4>SSH</h4>
<pre>ssh usuario@10.0.0.5 -p 22
ssh-keygen -t ed25519 -C "guille@noc"
ssh-copy-id usuario@10.0.0.5          # login con clave pública
scp archivo usuario@host:/tmp/ ; rsync -avz carpeta/ host:/backup/
ssh -L 8080:10.0.0.20:80 bastion      # túnel local (port forwarding)
# /etc/ssh/sshd_config → PermitRootLogin no, PasswordAuthentication no
sudo systemctl restart ssh</pre>
<p>Consola serie a equipos de red: <code>screen /dev/ttyUSB0 9600</code> o <code>minicom</code> (9600 8N1).</p>` },
    { t: 'Bash scripting y cron', h: `
<pre>#!/bin/bash
# check_hosts.sh — ping a una lista de equipos y avisa los caídos
HOSTS="192.168.1.1 8.8.8.8 10.0.0.99"
for h in $HOSTS; do
  if ping -c 2 -W 1 "$h" &gt; /dev/null 2&gt;&amp;1; then
    echo "$(date +%F_%T) OK   $h"
  else
    echo "$(date +%F_%T) DOWN $h" | tee -a /var/log/check_hosts.log
  fi
done</pre>
<p>Variables: <code>NOMBRE="x"</code>, <code>$NOMBRE</code>, <code>$1</code> (primer argumento), <code>$?</code> (código de salida: 0 = OK), <code>$(comando)</code>. Condicionales: <code>if [ -f archivo ]; then ... fi</code>. Bucles: <code>for</code>, <code>while read linea; do ...; done &lt; archivo</code>.</p>
<h4>cron</h4>
<pre>crontab -e
# min hora día mes díaSemana comando
*/5 * * * *  /home/guille/check_hosts.sh
0 2 * * *    /home/guille/backup.sh &gt;&gt; /var/log/backup.log 2&gt;&amp;1
30 8 * * 1-5 echo "inicio de turno"</pre>
<div class="tip">Practicá en el <a href="#/tool/terminal">simulador de terminal</a> y después en una VM real (VirtualBox + Ubuntu Server) o con WSL en Windows: <code>wsl --install</code>. Para gamificar: <b>OverTheWire Bandit</b>.</div>` }
  ],
  english: [
    ['file system', 'sistema de archivos', 'The root file system is 98% full.'],
    ['permissions', 'permisos', 'Check the permissions on the private key.'],
    ['to grant / revoke', 'otorgar / revocar', 'Grant sudo access only to the NOC team.'],
    ['daemon / service', 'servicio en segundo plano', 'The SSH daemon is not running.'],
    ['to restart a service', 'reiniciar un servicio', 'I restarted the nginx service and it is back up.'],
    ['log file', 'archivo de registro', 'Look for errors in the log file.'],
    ['to grep for', 'buscar con grep', 'Grep for "timeout" in the application logs.'],
    ['disk usage', 'uso de disco', 'Disk usage on /var reached 95%.'],
    ['load average', 'carga promedio', 'The load average is 12 on a 4-core server.'],
    ['scheduled job (cron job)', 'tarea programada', 'A cron job rotates the logs every night.'],
    ['to pipe', 'encadenar con un pipe', 'Pipe the output to wc -l to count lines.'],
    ['key pair', 'par de claves', 'Generate a new SSH key pair with ed25519.']
  ],
  flash: [
    ['Ver puertos escuchando con proceso', 'ss -tulpn'], ['Ver IPs de interfaces', 'ip a'], ['Ver tabla de ruteo', 'ip r'],
    ['Permiso octal rw-r--r--', '644'], ['Permiso de una clave privada SSH', '600'], ['Logs de un servicio systemd', 'journalctl -u servicio'],
    ['Seguir un log en vivo', 'tail -f archivo'], ['Probar puerto TCP abierto', 'nc -zv host puerto'], ['Espacio en disco', 'df -h'],
    ['Cron: cada 5 minutos', '*/5 * * * *'], ['Código de salida exitoso', '0 ($? = 0)'], ['Logs de autenticación en Debian/Ubuntu', '/var/log/auth.log']
  ],
  quiz: [
    { q: '¿Qué comando muestra qué proceso escucha en el puerto 443?', o: ['ip a', 'ss -tulpn', 'df -h', 'ps -ef'], a: 1, e: 'ss -tulpn: TCP/UDP, listening, procesos, numérico.' },
    { q: '`chmod 750 script.sh` deja los permisos...', o: ['rwxr-x---', 'rwxrwx---', 'rw-r-----', 'rwxr--r--'], a: 0, e: '7 = rwx, 5 = r-x, 0 = ---.' },
    { q: '¿Dónde se configura el DNS que usa el sistema (resolver clásico)?', o: ['/etc/hosts', '/etc/resolv.conf', '/etc/passwd', '/var/log/dns'], a: 1, e: 'resolv.conf lista los nameserver.' },
    { q: 'Querés ver los últimos 50 logs de nginx con systemd:', o: ['journalctl -u nginx -n 50', 'cat nginx', 'systemctl log nginx', 'tail nginx'], a: 0, e: 'journalctl -u <unidad> -n <líneas>.' },
    { q: '¿Qué hace `grep -c "Failed" auth.log`?', o: ['Muestra las líneas', 'Cuenta las líneas que coinciden', 'Borra las líneas', 'Ignora mayúsculas'], a: 1, e: '-c cuenta; -i ignora mayúsculas.' },
    { q: 'Un servicio no arranca y `df -h` muestra `/` al 100%. ¿Primera acción?', o: ['Reinstalar el SO', 'Liberar espacio (logs viejos, /tmp) e identificar qué creció con du', 'Reiniciar el router', 'Cambiar la IP'], a: 1, e: 'Sin espacio, muchos servicios fallan al escribir.' },
    { q: 'Línea de cron para ejecutar todos los días a las 02:00', o: ['0 2 * * *', '2 0 * * *', '* 2 * * *', '0 0 2 * *'], a: 0, e: 'minuto hora día mes díaSemana.' },
    { q: '¿Qué comando reemplaza a `ifconfig` en Linux moderno?', o: ['ip', 'netplan', 'nmap', 'iw'], a: 0, e: 'Suite iproute2: ip addr, ip route, ip link.' },
    { q: 'Para capturar tráfico DNS en eth0 sin resolver nombres:', o: ['tcpdump -i eth0 -nn port 53', 'dig eth0', 'ss -u 53', 'nmap -p53'], a: 0, e: '-nn evita resolver nombres y puertos.' },
    { q: 'Load average 8.0 en un servidor de 2 núcleos indica...', o: ['Está ocioso', 'Sobrecarga: hay 4 veces más trabajo que CPUs', 'Disco lleno', 'Red caída'], a: 1, e: 'Comparar load con nproc.' },
    { q: '¿Cuál es la forma más segura de acceso SSH?', o: ['Password de root', 'Telnet', 'Claves públicas + PermitRootLogin no', 'Puerto 23'], a: 2, e: 'Autenticación por clave y sin login de root.' }
  ],
  lab: { t: 'Lab 7: Servidor Linux real (VM o WSL)', h: `
<ol><li>Instalá Ubuntu Server en VirtualBox (o <code>wsl --install -d Ubuntu</code>).</li>
<li>Instalá herramientas: <code>sudo apt install -y nginx net-tools dnsutils tcpdump mtr nmap</code>.</li>
<li>Verificá nginx: <code>systemctl status nginx</code>, <code>ss -tulpn | grep :80</code>, <code>curl -I localhost</code>.</li>
<li>Creá el script <code>check_hosts.sh</code> de la teoría, dale permisos y programalo cada 5 min con cron.</li>
<li>Generá un par de claves SSH y conectate de tu Windows a la VM sin contraseña.</li>
<li>Activá ufw permitiendo solo 22 y 80: <code>sudo ufw allow 22/tcp; sudo ufw allow 80/tcp; sudo ufw enable</code>.</li>
<li>Generá tráfico (<code>curl localhost</code> varias veces) y sacá el top de IPs de <code>/var/log/nginx/access.log</code> con awk/sort/uniq.</li></ol>` }
});

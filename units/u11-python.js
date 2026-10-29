window.UNITS.push({
  id: 'u11', num: 11, icon: '🐍', short: 'Python para redes', time: '2.5 h', tool: 'python',
  title: 'Python para redes y automatización NOC',
  desc: 'Automatizar lo repetitivo: calcular subredes, chequear equipos, parsear logs, consumir APIs y configurar dispositivos por SSH.',
  goals: ['Repasar las estructuras de Python que más se usan en automatización', 'Usar ipaddress, socket, subprocess y re', 'Consumir APIs REST con requests y manejar JSON', 'Conectarse a equipos con Netmiko y generar configs con Jinja2'],
  lessons: [
    { t: 'Repaso exprés de Python', h: `
<pre>equipos = ["sw-core-01", "sw-acc-02", "rt-wan-01"]          # lista
equipo = {"host": "10.0.0.1", "tipo": "cisco_ios", "vlans": [10, 20]}  # dict
for e in equipos:
    print(f"Revisando {e}")
caidos = [e for e in equipos if e.startswith("sw")]       # list comprehension

def es_critico(cpu: float, umbral: float = 90.0) -&gt; bool:
    return cpu &gt;= umbral

try:
    valor = int("abc")
except ValueError as err:
    print("Error:", err)

with open("hosts.txt") as f:              # leer archivo línea por línea
    hosts = [l.strip() for l in f if l.strip()]

import json, csv
datos = json.loads('{"cpu": 93}')          # str → dict
print(json.dumps(datos, indent=2))         # dict → str</pre>
<div class="tip">Entorno: <code>python -m venv venv</code>, activar, <code>pip install netmiko requests jinja2 pyyaml</code>. Guardá las dependencias en <code>requirements.txt</code>.</div>` },
    { t: 'Módulo ipaddress: subnetting con código', h: `
<pre>import ipaddress as ip

red = ip.ip_network("192.168.10.0/24")
print(red.num_addresses - 2)              # 254 hosts útiles
print(red.netmask, red.hostmask)          # 255.255.255.0 0.0.0.255
print(red.broadcast_address)              # 192.168.10.255

for sub in red.subnets(new_prefix=26):    # dividir en /26
    hosts = list(sub.hosts())
    print(sub, hosts[0], hosts[-1])

iface = ip.ip_interface("172.16.45.130/27")
print(iface.network)                      # 172.16.45.128/27
print(ip.ip_address("10.1.1.5") in ip.ip_network("10.0.0.0/8"))  # True
print(ip.ip_address("8.8.8.8").is_private)                         # False
print(ip.ip_network("0.0.0.0/255.255.255.224").prefixlen)          # 27
print(list(ip.collapse_addresses([ip.ip_network("10.0.0.0/24"), ip.ip_network("10.0.1.0/24")])))  # [10.0.0.0/23]</pre>` },
    { t: 'Chequeos de red: socket, subprocess y concurrencia', h: `
<pre>import socket, subprocess, platform
from concurrent.futures import ThreadPoolExecutor

def puerto_abierto(host, port, timeout=2):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

def ping(host):
    flag = "-n" if platform.system() == "Windows" else "-c"
    r = subprocess.run(["ping", flag, "1", host], capture_output=True)
    return r.returncode == 0

hosts = ["192.168.1.1", "8.8.8.8", "10.99.99.99"]
with ThreadPoolExecutor(max_workers=20) as ex:      # en paralelo: mucho más rápido
    for h, ok in zip(hosts, ex.map(ping, hosts)):
        print(f"{h:15} {'UP' if ok else 'DOWN'}")

print(puerto_abierto("example.com", 443))
print(socket.gethostbyname("example.com"))         # resolución DNS</pre>
<p>Librerías útiles: <code>scapy</code> (crear/analizar paquetes), <code>dnspython</code>, <code>pysnmp</code>, <code>speedtest-cli</code>, <code>psutil</code> (métricas del sistema).</p>` },
    { t: 'Parsear logs y salidas con expresiones regulares', h: `
<pre>import re
from collections import Counter

log = open("/var/log/auth.log").read()
ips = re.findall(r"Failed password .* from (\\d{1,3}(?:\\.\\d{1,3}){3})", log)
for ip_, n in Counter(ips).most_common(5):
    print(ip_, n)

salida = """Interface   IP-Address   OK? Method Status                Protocol
Gi0/0       10.0.0.1     YES manual up                    up
Gi0/1       unassigned   YES unset  administratively down down
Gi0/2       10.0.12.1    YES manual up                    down"""
for linea in salida.splitlines()[1:]:
    campos = linea.split()
    nombre, proto = campos[0], campos[-1]
    if proto == "down":
        print("Revisar:", nombre)</pre>
<p>Patrones frecuentes: <code>\\d+</code> números, <code>\\s+</code> espacios, <code>(...)</code> grupo de captura, <code>[0-9a-f:]{17}</code> MAC aproximada. Probá tus regex en <i>regex101.com</i>.</p>
<p>Para salidas de equipos existen parsers ya hechos: <b>TextFSM</b> + plantillas <b>ntc-templates</b> y <b>Genie</b> (Cisco pyATS) que devuelven listas de dicts.</p>` },
    { t: 'APIs REST, Netmiko y Jinja2', h: `
<h4>APIs REST con requests</h4>
<pre>import requests
r = requests.get("https://api.ipify.org?format=json", timeout=5)
r.raise_for_status()
print(r.status_code, r.json())        # 200 {'ip': '...'}

# Ejemplo genérico de API de un NMS / controlador
headers = {"Authorization": "Bearer TOKEN", "Content-Type": "application/json"}
r = requests.get("https://nms.empresa.local/api/v1/alerts?state=open", headers=headers, timeout=10)
for alerta in r.json()["data"]:
    print(alerta["host"], alerta["severity"], alerta["message"])</pre>
<h4>Netmiko: SSH a equipos de red</h4>
<pre>from netmiko import ConnectHandler
sw = {"device_type": "cisco_ios", "host": "10.0.99.2",
      "username": "admin", "password": "******"}
with ConnectHandler(**sw) as conn:
    print(conn.send_command("show ip interface brief"))
    cambios = ["vlan 30", "name CAMARAS", "interface fa0/10",
               "switchport mode access", "switchport access vlan 30"]
    print(conn.send_config_set(cambios))
    conn.save_config()</pre>
<h4>Jinja2: generar configuraciones desde plantillas</h4>
<pre>from jinja2 import Template
tpl = Template("""hostname {{ host }}
{% for v in vlans %}vlan {{ v.id }}
 name {{ v.name }}
{% endfor %}""")
print(tpl.render(host="SW-PISO2", vlans=[{"id": 10, "name": "VENTAS"}, {"id": 20, "name": "SOPORTE"}]))</pre>
<p>Ecosistema: <b>NAPALM</b> (API multivendor), <b>Nornir</b> (framework de automatización en Python), <b>Ansible</b> (unidad 12), <b>pyATS</b> (testing).</p>
<div class="warn">Nunca dejes contraseñas en el código: usá variables de entorno (<code>os.environ["NET_PASS"]</code>), <code>getpass</code> o un vault.</div>` }
  ],
  english: [
    ['script', 'script / programa', 'I wrote a script to back up all switch configs.'],
    ['to parse', 'analizar / parsear', 'Parse the output of show ip interface brief.'],
    ['regular expression (regex)', 'expresión regular', 'Use a regex to extract IP addresses.'],
    ['library / module', 'librería / módulo', 'Netmiko is a library for SSH to network devices.'],
    ['to loop through', 'recorrer', 'Loop through every device in the inventory.'],
    ['inventory', 'inventario', 'Keep the device inventory in a YAML file.'],
    ['endpoint', 'punto final de la API', 'The /alerts endpoint returns JSON.'],
    ['request / response', 'petición / respuesta', 'The response contains a list of devices.'],
    ['to automate', 'automatizar', 'We automated the weekly config backup.'],
    ['template', 'plantilla', 'Generate configs from a Jinja2 template.'],
    ['exception handling', 'manejo de excepciones', 'Add exception handling for timeouts.'],
    ['concurrency', 'concurrencia', 'Use threads to add concurrency to the ping sweep.']
  ],
  flash: [
    ['Hosts útiles con ipaddress', 'ip_network(...).num_addresses - 2 o len(list(net.hosts()))'], ['Dividir red en /26', 'net.subnets(new_prefix=26)'],
    ['¿IP privada?', 'ip_address(x).is_private'], ['Probar puerto TCP', 'socket.create_connection((host, port), timeout)'],
    ['Ejecutar ping desde Python', 'subprocess.run(["ping","-c","1",host])'], ['Contar ocurrencias', 'collections.Counter(lista).most_common(n)'],
    ['Librería SSH para equipos de red', 'Netmiko (sobre Paramiko)'], ['Librería HTTP', 'requests'], ['Parsear salidas CLI a datos', 'TextFSM / ntc-templates / Genie'],
    ['Motor de plantillas de configs', 'Jinja2'], ['dict → texto JSON', 'json.dumps(d)']
  ],
  quiz: [
    { q: '¿Qué imprime `print(ipaddress.ip_network("10.0.0.0/22").num_addresses - 2)`?', o: ['1022', '1024', '510', '254'], a: 0, e: '2^10 = 1024 direcciones − 2 = 1022.' },
    { q: '¿Qué imprime `print(len(list(ipaddress.ip_network("192.168.1.0/24").subnets(new_prefix=26))))`?', o: ['2', '4', '8', '26'], a: 1, e: '/24 → /26 = 2 bits prestados = 4 subredes.' },
    { q: '¿Qué estructura usarías para guardar `{"host": "10.0.0.1", "os": "ios"}`?', o: ['Lista', 'Diccionario', 'Tupla', 'Set'], a: 1, e: 'Pares clave-valor = dict.' },
    { q: 'Mejor forma de pingear 500 IPs rápido en Python', o: ['Un for secuencial', 'ThreadPoolExecutor / asyncio', 'time.sleep', 'Recursión'], a: 1, e: 'La espera es de red (I/O bound): conviene concurrencia con hilos o asyncio.' },
    { q: '`r = requests.get(url)`; ¿cómo obtengo el cuerpo como dict?', o: ['r.text', 'r.json()', 'r.dict', 'json(r)'], a: 1, e: 'r.json() decodifica el JSON.' },
    { q: '¿Qué librería se usa para conectarse por SSH a un switch Cisco y enviar comandos?', o: ['Flask', 'Netmiko', 'Pandas', 'Jinja2'], a: 1, e: 'Netmiko simplifica SSH multivendor.' },
    { q: 'Regex que captura el número en "VLAN0010"', o: ['r"VLAN(\\d+)"', 'r"\\s+"', 'r"[a-z]"', 'r"VLAN."'], a: 0, e: '\\d+ uno o más dígitos dentro de un grupo de captura.' },
    { q: '¿Dónde guardar credenciales para un script de automatización?', o: ['Hardcodeadas en el .py', 'Variables de entorno o un vault', 'En un comentario', 'En GitHub público'], a: 1, e: 'Nunca en el código ni en el repositorio.' },
    { q: '¿Qué hace `Counter(["a","b","a"]).most_common(1)`?', o: ['[("a", 2)]', '["a"]', '2', '{"a":2}'], a: 0, e: 'Devuelve lista de tuplas (elemento, cantidad).' },
    { q: '¿Para qué sirve Jinja2 en automatización de redes?', o: ['Hacer ping', 'Generar configuraciones a partir de plantillas y variables', 'Cifrar contraseñas', 'Monitorear SNMP'], a: 1, e: 'Plantilla + datos (YAML/JSON) = config.' },
    { q: '`ipaddress.ip_address("172.20.1.1").is_private` devuelve:', o: ['True', 'False', 'Error', 'None'], a: 0, e: '172.16.0.0/12 es privada.' }
  ],
  lab: { t: 'Lab 11: Tu toolkit NOC en Python', h: `
<ol><li>Resolvé los desafíos del <a href="#/tool/python">Python Lab</a> (corren en el navegador).</li>
<li>En tu PC, armá <code>noc_toolkit.py</code> con un menú: 1) calculadora de subredes, 2) ping sweep concurrente de una red /24, 3) chequeo de puertos de una lista de servidores, 4) top IPs de un auth.log.</li>
<li>Guardá el inventario en <code>inventario.yaml</code> y leelo con PyYAML.</li>
<li>Bonus: con Netmiko contra un router virtual (Cisco DevNet Sandbox "Always-On" o GNS3/CML), hacé un backup de <code>show running-config</code> de cada equipo en un archivo con fecha.</li>
<li>Subí el proyecto a tu GitHub (gcuenya1) con un README en inglés.</li></ol>` }
});

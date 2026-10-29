window.UNITS.push({
  id: 'u12', num: 12, icon: '☁️', short: 'Cloud y automatización', time: '2 h',
  title: 'Virtualización, Cloud networking, Docker, Ansible, SDN y Git',
  desc: 'Las redes ya no son solo cables: VPCs, contenedores, infraestructura como código y controladores. Lo que piden los puestos modernos de NOC/NetOps.',
  goals: ['Diferenciar hipervisores, VMs y contenedores', 'Diseñar una VPC con subredes públicas y privadas', 'Entender redes de Docker y usar Ansible para configurar equipos', 'Conocer SDN, NETCONF/RESTCONF y el flujo básico de Git'],
  lessons: [
    { t: 'Virtualización y contenedores', h: `
<table><tr><th></th><th>Hipervisor tipo 1 (bare-metal)</th><th>Hipervisor tipo 2 (hosted)</th></tr>
<tr><td>Corre sobre</td><td>El hardware</td><td>Un sistema operativo</td></tr>
<tr><td>Ejemplos</td><td>VMware ESXi, Proxmox VE, Hyper-V, KVM</td><td>VirtualBox, VMware Workstation</td></tr></table>
<p><b>VM</b>: sistema operativo completo virtualizado. <b>Contenedor</b>: comparte el kernel del host, aísla procesos; liviano y rápido (Docker, Podman). Orquestación: <b>Kubernetes</b>.</p>
<p>Redes virtuales: vSwitch (estándar/distribuido), port groups con VLAN, NIC virtual, modos de VirtualBox (NAT, Bridged, Host-only, Internal).</p>
<h4>Docker networking</h4>
<pre>docker run -d --name web -p 8080:80 nginx      # publica 80 del contenedor en 8080 del host
docker ps ; docker logs web ; docker exec -it web sh
docker network ls                              # bridge, host, none
docker network create backend
docker run -d --network backend --name db postgres:16
docker inspect web | grep IPAddress
# docker-compose.yml
services:
  web:
    image: nginx
    ports: ["8080:80"]
  kuma:
    image: louislam/uptime-kuma:1
    ports: ["3001:3001"]</pre>
<p>Modos: <b>bridge</b> (red privada con NAT, por defecto), <b>host</b> (usa la red del host), <b>none</b>, <b>macvlan</b> (IP propia en la LAN), <b>overlay</b> (entre hosts).</p>` },
    { t: 'Cloud networking (AWS / Azure / GCP)', h: `
<pre>VPC 10.0.0.0/16  (región us-east-1)
├── Subred pública  10.0.1.0/24 (AZ a) → ruta 0.0.0.0/0 → Internet Gateway
│      └── Load Balancer, Bastion, NAT Gateway
├── Subred privada  10.0.11.0/24 (AZ a) → ruta 0.0.0.0/0 → NAT Gateway
│      └── Servidores de aplicación
└── Subred privada  10.0.21.0/24 (AZ b) → Bases de datos (sin salida a Internet)</pre>
<table><tr><th>Concepto</th><th>AWS</th><th>Azure</th><th>GCP</th></tr>
<tr><td>Red virtual</td><td>VPC</td><td>VNet</td><td>VPC</td></tr>
<tr><td>Firewall por instancia (stateful)</td><td>Security Group</td><td>NSG</td><td>Firewall rules</td></tr>
<tr><td>Firewall por subred (stateless)</td><td>Network ACL</td><td>NSG en subred</td><td>—</td></tr>
<tr><td>Salida privada a Internet</td><td>NAT Gateway</td><td>NAT Gateway</td><td>Cloud NAT</td></tr>
<tr><td>Conexión dedicada</td><td>Direct Connect</td><td>ExpressRoute</td><td>Interconnect</td></tr>
<tr><td>VPN</td><td>Site-to-Site VPN</td><td>VPN Gateway</td><td>Cloud VPN</td></tr>
<tr><td>Balanceador</td><td>ALB / NLB</td><td>App Gateway / LB</td><td>Cloud Load Balancing</td></tr>
<tr><td>DNS</td><td>Route 53</td><td>Azure DNS</td><td>Cloud DNS</td></tr></table>
<p>Conceptos: <b>regiones</b> y <b>zonas de disponibilidad</b>, peering entre VPCs, Transit Gateway / hub-and-spoke, <b>modelo de responsabilidad compartida</b> (el proveedor asegura la nube; vos asegurás lo que ponés en ella).</p>
<div class="noc">"No llego a la instancia por SSH" en cloud: ¿IP pública/bastión? → Security Group (puerto 22 desde tu IP) → NACL (ida y vuelta, puertos efímeros) → tabla de ruteo de la subred → firewall del SO.</div>` },
    { t: 'Infraestructura como código: Ansible y Terraform', h: `
<h4>Ansible</h4>
<p>Sin agente (usa SSH), idempotente, escrito en YAML. Inventario + playbooks + módulos (incluye módulos de red: <code>cisco.ios</code>, <code>junipernetworks.junos</code>, <code>arista.eos</code>).</p>
<pre># inventario.ini
[switches]
sw1 ansible_host=10.0.99.2
sw2 ansible_host=10.0.99.3
[switches:vars]
ansible_network_os=cisco.ios.ios
ansible_connection=ansible.netcommon.network_cli
ansible_user=admin

# vlans.yml
- name: Crear VLANs estándar
  hosts: switches
  gather_facts: no
  tasks:
    - name: VLANs
      cisco.ios.ios_vlans:
        config:
          - { vlan_id: 10, name: VENTAS }
          - { vlan_id: 20, name: SOPORTE }
        state: merged
    - name: Backup de config
      cisco.ios.ios_config:
        backup: yes

# ansible-playbook -i inventario.ini vlans.yml --check   (simulación)</pre>
<h4>Terraform</h4>
<p>Declarativo, multi-cloud: describís el estado deseado en HCL y Terraform lo crea. Flujo: <code>terraform init → plan → apply → destroy</code>. El estado se guarda en un <i>state file</i>.</p>
<pre>resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "vpc-noc-lab" }
}</pre>` },
    { t: 'SDN, APIs de red y modelos de datos', h: `
<p><b>SDN</b> separa el <b>plano de control</b> (decide) del <b>plano de datos</b> (reenvía), con un <b>controlador</b> centralizado. Ej.: Cisco Catalyst Center (ex DNA Center), Cisco ACI, VMware NSX, controladores SD-WAN.</p>
<ul><li><b>Northbound API</b>: entre aplicaciones/scripts y el controlador (normalmente REST).</li>
<li><b>Southbound API</b>: entre controlador y equipos (OpenFlow, NETCONF, OpFlex, SNMP, CLI).</li></ul>
<table><tr><th>Protocolo</th><th>Transporte</th><th>Formato</th></tr>
<tr><td>NETCONF</td><td>SSH (TCP 830)</td><td>XML, operaciones get-config/edit-config, candidate/commit</td></tr>
<tr><td>RESTCONF</td><td>HTTPS</td><td>JSON o XML, verbos HTTP</td></tr>
<tr><td>gNMI</td><td>gRPC</td><td>Protobuf, streaming telemetry</td></tr></table>
<p><b>YANG</b> es el lenguaje que <b>modela</b> los datos de configuración/estado (OpenConfig, modelos nativos). Formatos de datos: <b>JSON</b>, <b>XML</b>, <b>YAML</b>.</p>
<pre>{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet2",
    "description": "Uplink a CORE",
    "enabled": true
  }
}</pre>
<p>Planos: <b>datos</b> (reenvío), <b>control</b> (OSPF, STP, ARP), <b>gestión</b> (SSH, SNMP, APIs).</p>` },
    { t: 'Git y la cultura NetDevOps', h: `
<pre>git config --global user.name "Guillermo Cuenya"
git init ; git clone https://github.com/usuario/repo.git
git status ; git add archivo ; git commit -m "Agrega VLAN 30 en sw-piso2"
git log --oneline ; git diff
git branch feature/vlan30 ; git switch feature/vlan30
git push origin feature/vlan30         # luego Pull Request y revisión
git pull ; git merge ; git revert &lt;commit&gt;</pre>
<p>Flujo NetDevOps: configuraciones e inventario en Git ("source of truth" como NetBox) → Pull Request revisado → pipeline CI (lint de YAML, <code>ansible --check</code>, tests con pyATS/Batfish) → despliegue automatizado → verificación y monitoreo.</p>
<p><b>Observabilidad</b>: métricas (Prometheus), logs (Loki/Elastic), trazas; alertas con reglas en código.</p>
<div class="tip">Cisco DevNet tiene sandboxes gratuitos con equipos reales accesibles por API: ideales para practicar Netmiko, RESTCONF y Ansible.</div>` }
  ],
  english: [
    ['virtual machine (VM)', 'máquina virtual', 'Spin up a VM to test the new firmware.'],
    ['container', 'contenedor', 'The monitoring stack runs in containers.'],
    ['to spin up / tear down', 'levantar / destruir (recursos)', 'Tear down the lab environment after testing.'],
    ['availability zone', 'zona de disponibilidad', 'Deploy servers in two availability zones.'],
    ['security group', 'grupo de seguridad', 'The security group only allows port 443.'],
    ['infrastructure as code', 'infraestructura como código', 'We manage the VPCs with infrastructure as code.'],
    ['playbook', 'playbook (receta de Ansible)', 'Run the playbook in check mode first.'],
    ['idempotent', 'idempotente', 'Ansible tasks are idempotent.'],
    ['source of truth', 'fuente de verdad', 'NetBox is our source of truth for IPs.'],
    ['pull request', 'solicitud de cambios', 'Open a pull request for the VLAN change.'],
    ['control plane / data plane', 'plano de control / plano de datos', 'SDN separates the control plane from the data plane.'],
    ['shared responsibility model', 'modelo de responsabilidad compartida', 'Under the shared responsibility model, we secure the OS.']
  ],
  flash: [
    ['Hipervisor tipo 1', 'Corre sobre hardware: ESXi, Proxmox, Hyper-V, KVM'], ['Contenedor vs VM', 'Contenedor comparte el kernel del host; VM tiene SO completo'],
    ['Publicar puerto en Docker', 'docker run -p 8080:80 imagen'], ['Subred pública en AWS', 'Tiene ruta 0.0.0.0/0 hacia un Internet Gateway'],
    ['Security Group vs NACL', 'SG: stateful por instancia · NACL: stateless por subred'], ['Ansible usa...', 'SSH, sin agente, YAML, idempotente'],
    ['Flujo Terraform', 'init → plan → apply'], ['NETCONF puerto', 'TCP 830 sobre SSH'], ['Lenguaje de modelado de datos de red', 'YANG'],
    ['Northbound API', 'Entre apps y el controlador SDN (REST)'], ['Deshacer un commit publicado', 'git revert <commit>']
  ],
  quiz: [
    { q: '¿Qué hace a una subred de AWS "pública"?', o: ['Tener IPs 10.x', 'Una ruta 0.0.0.0/0 hacia un Internet Gateway', 'Tener un NAT Gateway', 'Estar en otra región'], a: 1, e: 'La tabla de ruteo con IGW la convierte en pública.' },
    { q: 'Los Security Groups de AWS son...', o: ['Stateless', 'Stateful', 'Solo de salida', 'Capa 2'], a: 1, e: 'Stateful: el retorno se permite automáticamente. Las NACL son stateless.' },
    { q: '`docker run -p 8080:80 nginx` significa:', o: ['El host 80 → contenedor 8080', 'El host 8080 → contenedor 80', 'Ambos 8080', 'Bloquea el 80'], a: 1, e: 'host:contenedor.' },
    { q: 'Característica de Ansible', o: ['Requiere agente en cada equipo', 'Sin agente, usa SSH/API y es idempotente', 'Solo funciona en Windows', 'Es un hipervisor'], a: 1, e: 'Agentless + YAML.' },
    { q: 'VirtualBox es un hipervisor...', o: ['Tipo 1', 'Tipo 2', 'Contenedor', 'SDN'], a: 1, e: 'Corre sobre un SO anfitrión.' },
    { q: 'NETCONF transporta datos en formato...', o: ['JSON sobre HTTP', 'XML sobre SSH', 'CSV sobre FTP', 'Binario sobre UDP'], a: 1, e: 'NETCONF: XML/SSH (830). RESTCONF: JSON/XML sobre HTTPS.' },
    { q: 'En SDN, la API entre el controlador y los switches se llama:', o: ['Northbound', 'Southbound', 'Eastbound', 'Westbound'], a: 1, e: 'Southbound hacia los dispositivos.' },
    { q: '¿Qué comando de Terraform muestra los cambios sin aplicarlos?', o: ['terraform apply', 'terraform plan', 'terraform init', 'terraform destroy'], a: 1, e: 'plan = previsualización.' },
    { q: 'Una instancia en subred privada necesita descargar actualizaciones de Internet. Necesitás:', o: ['Internet Gateway directo', 'NAT Gateway en la subred pública', 'Direct Connect', 'Nada'], a: 1, e: 'NAT GW permite salida sin exponer la instancia.' },
    { q: 'Comando de Git para ver qué cambió y no está confirmado', o: ['git log', 'git status / git diff', 'git push', 'git clone'], a: 1, e: 'status lista archivos; diff muestra las líneas.' },
    { q: 'Modelo de responsabilidad compartida: ¿quién parchea el SO de una VM en IaaS?', o: ['El proveedor cloud', 'El cliente', 'Nadie', 'El ISP'], a: 1, e: 'En IaaS el cliente administra el SO y lo que corre encima.' }
  ],
  lab: { t: 'Lab 12: Stack NOC en Docker + Ansible', h: `
<ol><li>Instalá Docker (Docker Desktop en Windows con WSL2, o en tu VM Linux).</li>
<li>Creá un <code>docker-compose.yml</code> con Uptime Kuma + Grafana + Prometheus + node_exporter. Levantalo con <code>docker compose up -d</code>.</li>
<li>Instalá Ansible en Linux/WSL (<code>pip install ansible</code>) y armá un playbook que en tu VM instale nginx, cree un usuario <code>noc</code> y copie un <code>index.html</code>.</li>
<li>Abrí una cuenta en Cisco DevNet y probá un sandbox IOS XE: obtené las interfaces por RESTCONF con <code>curl</code> o Postman.</li>
<li>(Opcional) Creá una cuenta free tier en AWS/Azure y armá la VPC del diagrama con una subred pública y una privada. <b>¡Borrá todo al terminar!</b></li>
<li>Versioná todo en Git y subilo a GitHub con un README en inglés.</li></ol>` }
});

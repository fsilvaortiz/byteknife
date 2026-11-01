// Puertos conocidos (IANA y usos de facto). El servicio es el nombre propio del protocolo o
// producto, así que no se traduce; la categoría y la nota sí (ports.cat.* y ports.note.*).

export type PortCategory =
  'web' | 'mail' | 'db' | 'remote' | 'files' | 'infra' | 'messaging' | 'dev' | 'security' | 'media';

export type PortNote =
  | 'data'
  | 'control'
  | 'server'
  | 'client'
  | 'tls'
  | 'noTls'
  | 'printing'
  | 'peers'
  | 'dev'
  | 'desktop'
  | 'alt'
  | 'admin';

export interface Port {
  port: number;
  proto: 'tcp' | 'udp' | 'tcp/udp';
  service: string;
  category: PortCategory;
  note?: PortNote;
}

const p = (
  port: number,
  proto: Port['proto'],
  service: string,
  category: PortCategory,
  note?: PortNote,
): Port => ({ port, proto, service, category, ...(note && { note }) });

export const PORTS: Port[] = [
  p(20, 'tcp', 'FTP', 'files', 'data'),
  p(21, 'tcp', 'FTP', 'files', 'control'),
  p(22, 'tcp', 'SSH / SFTP / SCP', 'remote'),
  p(23, 'tcp', 'Telnet', 'remote'),
  p(25, 'tcp', 'SMTP', 'mail'),
  p(53, 'tcp/udp', 'DNS', 'infra'),
  p(67, 'udp', 'DHCP', 'infra', 'server'),
  p(68, 'udp', 'DHCP', 'infra', 'client'),
  p(69, 'udp', 'TFTP', 'files'),
  p(80, 'tcp', 'HTTP', 'web'),
  p(88, 'tcp/udp', 'Kerberos', 'security'),
  p(110, 'tcp', 'POP3', 'mail'),
  p(111, 'tcp/udp', 'RPC portmapper', 'infra'),
  p(123, 'udp', 'NTP', 'infra'),
  p(135, 'tcp', 'MS RPC', 'infra'),
  p(137, 'udp', 'NetBIOS Name', 'files'),
  p(139, 'tcp', 'NetBIOS Session / SMB', 'files'),
  p(143, 'tcp', 'IMAP', 'mail'),
  p(161, 'udp', 'SNMP', 'infra'),
  p(162, 'udp', 'SNMP Trap', 'infra'),
  p(179, 'tcp', 'BGP', 'infra'),
  p(389, 'tcp/udp', 'LDAP', 'security'),
  p(443, 'tcp/udp', 'HTTPS / HTTP/3 (QUIC)', 'web'),
  p(445, 'tcp', 'SMB / CIFS', 'files'),
  p(465, 'tcp', 'SMTPS', 'mail', 'tls'),
  p(500, 'udp', 'IPsec IKE', 'security'),
  p(514, 'udp', 'Syslog', 'infra'),
  p(515, 'tcp', 'LPD', 'files', 'printing'),
  p(546, 'udp', 'DHCPv6', 'infra', 'client'),
  p(547, 'udp', 'DHCPv6', 'infra', 'server'),
  p(554, 'tcp/udp', 'RTSP', 'media'),
  p(587, 'tcp', 'SMTP Submission', 'mail'),
  p(631, 'tcp', 'IPP / CUPS', 'files'),
  p(636, 'tcp', 'LDAPS', 'security'),
  p(853, 'tcp/udp', 'DNS over TLS / QUIC', 'infra'),
  p(873, 'tcp', 'rsync', 'files'),
  p(989, 'tcp', 'FTPS', 'files', 'data'),
  p(990, 'tcp', 'FTPS', 'files', 'control'),
  p(993, 'tcp', 'IMAPS', 'mail'),
  p(995, 'tcp', 'POP3S', 'mail'),
  p(1080, 'tcp', 'SOCKS', 'security'),
  p(1194, 'udp', 'OpenVPN', 'security'),
  p(1433, 'tcp', 'Microsoft SQL Server', 'db'),
  p(1521, 'tcp', 'Oracle Database', 'db'),
  p(1701, 'udp', 'L2TP', 'security'),
  p(1723, 'tcp', 'PPTP', 'security'),
  p(1812, 'udp', 'RADIUS', 'security'),
  p(1883, 'tcp', 'MQTT', 'messaging'),
  p(2049, 'tcp/udp', 'NFS', 'files'),
  p(2181, 'tcp', 'ZooKeeper', 'infra'),
  p(2375, 'tcp', 'Docker API', 'dev', 'noTls'),
  p(2376, 'tcp', 'Docker API', 'dev', 'tls'),
  p(2379, 'tcp', 'etcd', 'infra', 'client'),
  p(2380, 'tcp', 'etcd', 'infra', 'peers'),
  p(3000, 'tcp', 'Node.js / Grafana / Rails', 'dev', 'dev'),
  p(3128, 'tcp', 'Squid proxy', 'web'),
  p(3306, 'tcp', 'MySQL / MariaDB', 'db'),
  p(3389, 'tcp/udp', 'RDP', 'remote', 'desktop'),
  p(3478, 'tcp/udp', 'STUN / TURN', 'media'),
  p(4222, 'tcp', 'NATS', 'messaging'),
  p(4317, 'tcp', 'OpenTelemetry OTLP gRPC', 'infra'),
  p(4318, 'tcp', 'OpenTelemetry OTLP HTTP', 'infra'),
  p(4321, 'tcp', 'Astro', 'dev', 'dev'),
  p(5000, 'tcp', 'Flask / Docker Registry', 'dev', 'dev'),
  p(5060, 'tcp/udp', 'SIP', 'media'),
  p(5061, 'tcp', 'SIP', 'media', 'tls'),
  p(5173, 'tcp', 'Vite', 'dev', 'dev'),
  p(5222, 'tcp', 'XMPP', 'messaging', 'client'),
  p(5353, 'udp', 'mDNS / Bonjour', 'infra'),
  p(5432, 'tcp', 'PostgreSQL', 'db'),
  p(5601, 'tcp', 'Kibana', 'dev'),
  p(5671, 'tcp', 'AMQP', 'messaging', 'tls'),
  p(5672, 'tcp', 'AMQP (RabbitMQ)', 'messaging'),
  p(5900, 'tcp', 'VNC', 'remote'),
  p(5984, 'tcp', 'CouchDB', 'db'),
  p(6379, 'tcp', 'Redis', 'db'),
  p(6443, 'tcp', 'Kubernetes API server', 'infra'),
  p(6667, 'tcp', 'IRC', 'messaging'),
  p(7000, 'tcp', 'Cassandra', 'db', 'peers'),
  p(8000, 'tcp', 'HTTP / Django', 'dev', 'alt'),
  p(8080, 'tcp', 'HTTP / proxy', 'web', 'alt'),
  p(8086, 'tcp', 'InfluxDB', 'db'),
  p(8443, 'tcp', 'HTTPS', 'web', 'alt'),
  p(8888, 'tcp', 'Jupyter', 'dev'),
  p(9000, 'tcp', 'SonarQube / PHP-FPM / MinIO', 'dev'),
  p(9042, 'tcp', 'Cassandra CQL', 'db'),
  p(9090, 'tcp', 'Prometheus', 'infra'),
  p(9092, 'tcp', 'Apache Kafka', 'messaging'),
  p(9100, 'tcp', 'Prometheus node exporter / JetDirect', 'infra'),
  p(9200, 'tcp', 'Elasticsearch / OpenSearch (HTTP)', 'db'),
  p(9300, 'tcp', 'Elasticsearch', 'db', 'peers'),
  p(9418, 'tcp', 'Git', 'dev'),
  p(10250, 'tcp', 'Kubelet API', 'infra'),
  p(11211, 'tcp/udp', 'Memcached', 'db'),
  p(15672, 'tcp', 'RabbitMQ', 'messaging', 'admin'),
  p(25565, 'tcp', 'Minecraft', 'media'),
  p(27017, 'tcp', 'MongoDB', 'db'),
  p(51820, 'udp', 'WireGuard', 'security'),
];

/** Servicios que no conviene exponer a internet sin protección. */
export const RISKY = new Set([
  23, 135, 139, 445, 1433, 2375, 3306, 3389, 5432, 5900, 6379, 9200, 11211, 27017,
]);

export type DnsRecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "NS"
  | "SOA"
  | "TXT"
  | "SRV"
  | "CAA";

export type RoutingPolicy = "Simple" | "Weighted" | "Latency" | "Failover" | "Geolocation" | "Multivalue";

export type DnsRecord = {
  id: string;
  hostedZoneId: string;
  name: string;
  type: DnsRecordType;
  routingPolicy: RoutingPolicy;
  differentiator: string;
  alias: boolean;
  value: string;
  ttl: number | null;
  healthCheckId: string;
  evaluateTargetHealth: string;
};

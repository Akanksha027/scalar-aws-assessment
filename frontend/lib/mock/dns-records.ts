import type { DnsRecord } from "@/lib/types/dns-record";

/** In-memory DNS records keyed by hosted zone id. */
const recordsByZone = new Map<string, DnsRecord[]>();

function generateRecordId(): string {
  return `R${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
}

function pickNameServers(): string[] {
  const pools = [
    ["ns-149.awsdns-18.com.", "ns-1882.awsdns-43.co.uk.", "ns-1017.awsdns-63.net.", "ns-1276.awsdns-31.org."],
    ["ns-204.awsdns-25.com.", "ns-956.awsdns-55.net.", "ns-1422.awsdns-49.org.", "ns-1701.awsdns-20.co.uk."],
    ["ns-312.awsdns-39.com.", "ns-845.awsdns-41.net.", "ns-1102.awsdns-09.org.", "ns-1998.awsdns-57.co.uk."],
  ];
  return pools[Math.floor(Math.random() * pools.length)];
}

/**
 * Seeds the default NS + SOA records AWS creates with every hosted zone.
 */
export function seedDefaultRecords(hostedZoneId: string, zoneName: string): DnsRecord[] {
  const nameServers = pickNameServers();
  const nsValue = nameServers.join("\n");
  const primaryNs = nameServers[0];
  const soaValue = `${primaryNs} awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400`;

  const records: DnsRecord[] = [
    {
      id: generateRecordId(),
      hostedZoneId,
      name: zoneName,
      type: "NS",
      routingPolicy: "Simple",
      differentiator: "-",
      alias: false,
      value: nsValue,
      ttl: 172800,
      healthCheckId: "-",
      evaluateTargetHealth: "-",
    },
    {
      id: generateRecordId(),
      hostedZoneId,
      name: zoneName,
      type: "SOA",
      routingPolicy: "Simple",
      differentiator: "-",
      alias: false,
      value: soaValue,
      ttl: 900,
      healthCheckId: "-",
      evaluateTargetHealth: "-",
    },
  ];

  recordsByZone.set(hostedZoneId, records);
  return records;
}

export function listRecords(hostedZoneId: string): DnsRecord[] {
  return [...(recordsByZone.get(hostedZoneId) ?? [])];
}

export function getRecordCount(hostedZoneId: string): number {
  return recordsByZone.get(hostedZoneId)?.length ?? 0;
}

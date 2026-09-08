import { apiFetch } from "./client";
export { ApiError } from "./client";
import type { HostedZone, HostedZoneType } from "@/lib/types/hosted-zone";
import type {
  DnsRecord,
  DnsRecordType,
  RoutingPolicy,
} from "@/lib/types/dns-record";

export type ApiUser = {
  id: number;
  email: string;
  display_name: string;
  account_id: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

type ApiZone = {
  id: string;
  domain_name: string;
  type: HostedZoneType;
  comment: string | null;
  description: string | null;
  created_by: string;
  record_count: number;
  created_at: string;
  updated_at: string;
};

type ApiRecordValue = {
  value: string;
  priority?: number | null;
  weight?: number | null;
  port?: number | null;
  flag?: number | null;
  tag?: string | null;
};

type ApiRecord = {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: DnsRecordType;
  ttl: number;
  routing_policy: RoutingPolicy;
  alias: boolean;
  is_system_record: boolean;
  values: ApiRecordValue[];
  health_check: string | null;
  created_at: string;
  updated_at: string;
};

export function mapZone(z: ApiZone): HostedZone {
  return {
    id: z.id,
    name: z.domain_name,
    type: z.type,
    createdBy: z.created_by,
    recordCount: z.record_count,
    description: z.description ?? "",
    comment: z.comment ?? undefined,
    createdAt: z.created_at,
  };
}

function formatValues(type: DnsRecordType, values: ApiRecordValue[]): string {
  return values
    .map((v) => {
      if (type === "MX") return `${v.priority ?? 10} ${v.value}`;
      if (type === "SRV") {
        return `${v.priority ?? 0} ${v.weight ?? 0} ${v.port ?? 0} ${v.value}`;
      }
      if (type === "CAA") {
        return `${v.flag ?? 0} ${v.tag ?? "issue"} "${v.value}"`;
      }
      return v.value;
    })
    .join("\n");
}

export function mapRecord(r: ApiRecord): DnsRecord & {
  isSystemRecord: boolean;
  values: ApiRecordValue[];
} {
  return {
    id: r.id,
    hostedZoneId: r.hosted_zone_id,
    name: r.name,
    type: r.type,
    routingPolicy: r.routing_policy,
    differentiator: "-",
    alias: r.alias,
    value: formatValues(r.type, r.values),
    ttl: r.ttl,
    healthCheckId: r.health_check ?? "-",
    evaluateTargetHealth: "-",
    isSystemRecord: r.is_system_record,
    values: r.values,
  };
}

export const api = {
  login(email: string, password: string) {
    return apiFetch<ApiUser>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  logout() {
    return apiFetch<{ ok: boolean }>("/api/v1/auth/logout", { method: "POST" });
  },
  me() {
    return apiFetch<ApiUser>("/api/v1/auth/me");
  },
  listZones(params: {
    search?: string;
    type?: string;
    page?: number;
    page_size?: number;
  } = {}) {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.type) q.set("type", params.type);
    q.set("page", String(params.page ?? 1));
    q.set("page_size", String(params.page_size ?? 100));
    return apiFetch<Paginated<ApiZone>>(`/api/v1/hosted-zones?${q}`).then(
      (res) => ({
        ...res,
        items: res.items.map(mapZone),
      }),
    );
  },
  getZone(id: string) {
    return apiFetch<ApiZone>(`/api/v1/hosted-zones/${id}`).then(mapZone);
  },
  createZone(input: {
    domain_name: string;
    type: HostedZoneType;
    comment?: string;
    description?: string;
  }) {
    return apiFetch<ApiZone>("/api/v1/hosted-zones", {
      method: "POST",
      body: JSON.stringify(input),
    }).then(mapZone);
  },
  updateZone(
    id: string,
    input: { comment?: string | null; description?: string | null },
  ) {
    return apiFetch<ApiZone>(`/api/v1/hosted-zones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }).then(mapZone);
  },
  deleteZone(id: string) {
    return apiFetch<void>(`/api/v1/hosted-zones/${id}`, { method: "DELETE" });
  },
  listRecords(
    zoneId: string,
    params: {
      search?: string;
      type?: string;
      page?: number;
      page_size?: number;
    } = {},
  ) {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.type) q.set("type", params.type);
    q.set("page", String(params.page ?? 1));
    q.set("page_size", String(params.page_size ?? 100));
    return apiFetch<Paginated<ApiRecord>>(
      `/api/v1/hosted-zones/${zoneId}/records?${q}`,
    ).then((res) => ({
      ...res,
      items: res.items.map(mapRecord),
    }));
  },
  createRecord(
    zoneId: string,
    input: {
      name: string;
      type: DnsRecordType;
      ttl: number;
      routing_policy?: RoutingPolicy;
      values: ApiRecordValue[];
    },
  ) {
    return apiFetch<ApiRecord>(`/api/v1/hosted-zones/${zoneId}/records`, {
      method: "POST",
      body: JSON.stringify(input),
    }).then(mapRecord);
  },
  updateRecord(
    zoneId: string,
    recordId: string,
    input: {
      name?: string;
      type?: DnsRecordType;
      ttl?: number;
      routing_policy?: RoutingPolicy;
      values?: ApiRecordValue[];
    },
  ) {
    return apiFetch<ApiRecord>(
      `/api/v1/hosted-zones/${zoneId}/records/${recordId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    ).then(mapRecord);
  },
  deleteRecords(zoneId: string, recordIds: string[]) {
    return apiFetch<{ deleted: number }>(
      `/api/v1/hosted-zones/${zoneId}/records/bulk-delete`,
      {
        method: "POST",
        body: JSON.stringify({ record_ids: recordIds }),
      },
    );
  },
};

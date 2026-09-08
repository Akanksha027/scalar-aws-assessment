"use client";

import Alert from "@cloudscape-design/components/alert";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Flashbar, { type FlashbarProps } from "@cloudscape-design/components/flashbar";
import Tabs from "@cloudscape-design/components/tabs";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConsoleShell } from "@/components/console";
import { api } from "@/lib/api";
import type { DnsRecord } from "@/lib/types/dns-record";
import type { HostedZone } from "@/lib/types/hosted-zone";
import { HostedZoneDetailHeader } from "./HostedZoneDetailHeader";
import { HostedZoneDetailsExpandable } from "./HostedZoneDetailsExpandable";
import { RecordsTable } from "./RecordsTable";
import styles from "./HostedZoneDetailPage.module.css";

export function HostedZoneDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const zoneId = params.id;

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showCreatedFlash, setShowCreatedFlash] = useState(
    () => searchParams.get("created") === "1",
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [z, recs] = await Promise.all([
        api.getZone(zoneId),
        api.listRecords(zoneId, { page: 1, page_size: 100 }),
      ]);
      setZone(z);
      setRecords(recs.items);
      setNotFound(false);
    } catch {
      setNotFound(true);
      setZone(null);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      setShowCreatedFlash(true);
      router.replace(`/hosted-zones/${zoneId}`, { scroll: false });
    }
  }, [searchParams, zoneId, router]);

  const flashItems: FlashbarProps.MessageDefinition[] = useMemo(() => {
    if (!showCreatedFlash || !zone) return [];
    return [
      {
        type: "success",
        dismissible: true,
        dismissLabel: "Dismiss",
        onDismiss: () => setShowCreatedFlash(false),
        header: `${zone.name} was successfully created.`,
        content:
          "Now you can create records in the hosted zone to specify how you want Route 53 to route traffic for your domain.",
        id: "zone-created",
      },
    ];
  }, [showCreatedFlash, zone]);

  if (notFound && !loading) {
    return (
      <ConsoleShell
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { text: "Route 53", href: "/hosted-zones" },
              { text: "Hosted zones", href: "/hosted-zones" },
            ]}
            ariaLabel="Breadcrumbs"
          />
        }
      >
        <Alert type="error" header="Hosted zone not found">
          This hosted zone does not exist or is no longer available.{" "}
          <Button variant="link" onClick={() => router.push("/hosted-zones")}>
            Back to Hosted zones
          </Button>
        </Alert>
      </ConsoleShell>
    );
  }

  return (
    <ConsoleShell
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Route 53", href: "/hosted-zones" },
            { text: "Hosted zones", href: "/hosted-zones" },
            {
              text: zone?.name ?? zoneId,
              href: `/hosted-zones/${zoneId}`,
            },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
    >
      <div className={styles.page}>
        {flashItems.length > 0 ? <Flashbar items={flashItems} /> : null}

        {zone ? <HostedZoneDetailHeader zone={zone} /> : null}

        {zone ? (
          <HostedZoneDetailsExpandable zone={zone} records={records} />
        ) : null}

        <Tabs
          tabs={[
            {
              id: "records",
              label: `Records (${records.length})`,
              content: (
                <RecordsTable
                  zoneId={zoneId}
                  zoneName={zone?.name ?? ""}
                  records={records}
                  loading={loading}
                  onRefresh={() => void refresh()}
                />
              ),
            },
            {
              id: "accelerated-recovery",
              label: "Accelerated recovery",
              content: (
                <Box padding="l" color="text-body-secondary">
                  Accelerated recovery settings will appear here.
                </Box>
              ),
            },
            {
              id: "dnssec",
              label: "DNSSEC signing",
              content: (
                <Box padding="l" color="text-body-secondary">
                  DNSSEC signing settings will appear here.
                </Box>
              ),
            },
            {
              id: "tags",
              label: "Hosted zone tags (0)",
              content: (
                <Box padding="l" color="text-body-secondary">
                  No tags associated with the resource.
                </Box>
              ),
            },
          ]}
        />
      </div>
    </ConsoleShell>
  );
}

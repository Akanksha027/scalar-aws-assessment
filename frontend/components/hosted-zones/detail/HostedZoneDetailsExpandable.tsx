"use client";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import SpaceBetween from "@cloudscape-design/components/space-between";
import type { DnsRecord } from "@/lib/types/dns-record";
import type { HostedZone } from "@/lib/types/hosted-zone";
import styles from "./HostedZoneDetailPage.module.css";

type HostedZoneDetailsExpandableProps = {
  zone: HostedZone;
  records?: DnsRecord[];
};

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <div className={styles.detailValue}>{children}</div>
    </div>
  );
}

function nameServersFromRecords(records: DnsRecord[] | undefined): string[] {
  if (!records?.length) return [];
  const nsRecord = records.find((r) => r.type === "NS");
  return nsRecord?.value.split("\n").map((v) => v.trim()).filter(Boolean) ?? [];
}

export function HostedZoneDetailsExpandable({
  zone,
  records,
}: HostedZoneDetailsExpandableProps) {
  const nameServers = nameServersFromRecords(records);

  return (
    <ExpandableSection
      headerText="Hosted zone details"
      headerActions={<Button>Edit hosted zone</Button>}
      defaultExpanded={false}
    >
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween size="l">
          <DetailField label="Hosted zone name">{zone.name}</DetailField>
          <DetailField label="Type">{zone.type}</DetailField>
          <DetailField label="Hosted zone ID">{zone.id}</DetailField>
        </SpaceBetween>
        <SpaceBetween size="l">
          <DetailField label="Description">
            {zone.description || "—"}
          </DetailField>
          <DetailField label="Record count">{zone.recordCount}</DetailField>
          <DetailField label="Comment">{zone.comment || "—"}</DetailField>
        </SpaceBetween>
        <SpaceBetween size="l">
          <DetailField label="Name servers">
            {nameServers.length ? (
              <ul className={styles.nameServerList}>
                {nameServers.map((ns) => (
                  <li key={ns}>{ns}</li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </DetailField>
        </SpaceBetween>
      </ColumnLayout>
    </ExpandableSection>
  );
}

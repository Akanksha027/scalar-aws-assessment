"use client";

import Badge from "@cloudscape-design/components/badge";
import Button from "@cloudscape-design/components/button";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import type { HostedZone } from "@/lib/types/hosted-zone";
import styles from "./HostedZoneDetailPage.module.css";

type HostedZoneDetailHeaderProps = {
  zone: HostedZone;
};

export function HostedZoneDetailHeader({ zone }: HostedZoneDetailHeaderProps) {
  return (
    <div className={styles.headerRow}>
      <div className={styles.titleBlock}>
        <Badge color="blue">{zone.type}</Badge>
        <h1 className={styles.zoneTitle}>{zone.name}</h1>
        <Link href="#" fontSize="body-s">
          Info
        </Link>
      </div>
      <SpaceBetween direction="horizontal" size="xs">
        <Button>Delete zone</Button>
        <Button>Test record</Button>
        <Button>Configure query logging</Button>
      </SpaceBetween>
    </div>
  );
}

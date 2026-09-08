"use client";

import Alert from "@cloudscape-design/components/alert";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import type { HostedZone } from "@/lib/types/hosted-zone";
import styles from "./HostedZoneDetailPage.module.css";

type HostedZoneDetailHeaderProps = {
  zone: HostedZone;
};

export function HostedZoneDetailHeader({ zone }: HostedZoneDetailHeaderProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.deleteZone(zone.id);
      setDeleteOpen(false);
      router.push("/hosted-zones");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.headerRow}>
        <div className={styles.titleBlock}>
          <Badge color="blue">{zone.type}</Badge>
          <h1 className={styles.zoneTitle}>{zone.name}</h1>
          <Link href="#" fontSize="body-s">
            Info
          </Link>
        </div>
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            onClick={() => {
              setError(null);
              setDeleteOpen(true);
            }}
          >
            Delete zone
          </Button>
          <Button>Test record</Button>
          <Button>Configure query logging</Button>
        </SpaceBetween>
      </div>

      <Modal
        visible={deleteOpen}
        onDismiss={() => setDeleteOpen(false)}
        header="Delete hosted zone"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={submitting}
                onClick={() => void handleDelete()}
              >
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          {error ? <Alert type="error">{error}</Alert> : null}
          <Box>
            Delete <b>{zone.name}</b> ({zone.id})? This cannot be undone.
          </Box>
          <Alert type="warning">
            Remove all non-system records before deleting the hosted zone.
          </Alert>
        </SpaceBetween>
      </Modal>
    </>
  );
}

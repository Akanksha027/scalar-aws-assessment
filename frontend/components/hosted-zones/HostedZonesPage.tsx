"use client";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Button from "@cloudscape-design/components/button";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Textarea from "@cloudscape-design/components/textarea";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConsoleShell } from "@/components/console";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import type { HostedZone } from "@/lib/types/hosted-zone";
import { HostedZonesHeader } from "./HostedZonesHeader";
import { HostedZonesTable } from "./HostedZonesTable";
import styles from "./HostedZonesPage.module.css";

export function HostedZonesPage() {
  const router = useRouter();
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [selectedItems, setSelectedItems] = useState<HostedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [comment, setComment] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.listZones({ page: 1, page_size: 100 });
      setZones(result.items);
      setSelectedItems([]);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const goCreate = () => router.push("/hosted-zones/create");
  const selected = selectedItems[0];
  const hasSingleSelection = selectedItems.length === 1;
  const selectedCount = selectedItems.length;

  const openEdit = () => {
    if (!selected) return;
    setDescription(selected.description ?? "");
    setComment(selected.comment ?? "");
    setFormError(null);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await api.updateZone(selected.id, { description, comment });
      setEditOpen(false);
      await refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await api.deleteZone(selected.id);
      setDeleteOpen(false);
      await refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className={styles.page}>
        <div className={styles.headerBlock}>
          <HostedZonesHeader
            count={zones.length}
            hasSelection={hasSingleSelection}
            onRefresh={() => void refresh()}
            onCreate={goCreate}
            onViewDetails={() => {
              if (selected) router.push(`/hosted-zones/${selected.id}`);
            }}
            onEdit={openEdit}
            onDelete={() => {
              setFormError(null);
              setDeleteOpen(true);
            }}
          />

          <p className={styles.infoText}>
            Automatic mode is the current search behavior optimized for best
            filter results.{" "}
            <Link href="#" fontSize="body-s">
              To change modes go to settings.
            </Link>
          </p>
        </div>

        <HostedZonesTable
          items={zones}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onCreate={goCreate}
          loading={loading}
        />
      </div>

      <div className={styles.selectionBar} role="status">
        <span>
          {selectedCount} hosted zone{selectedCount === 1 ? "" : "s"} selected
        </span>
        <span className={styles.selectionChevron} aria-hidden>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
            <path
              d="M1 6.5L6 1.5l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>

      <Modal
        visible={editOpen}
        onDismiss={() => setEditOpen(false)}
        header={`Edit hosted zone: ${selected?.name ?? ""}`}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={submitting}
                onClick={() => void handleEdit()}
              >
                Save changes
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="l">
          {formError ? <Alert type="error">{formError}</Alert> : null}
          <FormField label="Domain name">
            <Input value={selected?.name ?? ""} disabled />
          </FormField>
          <FormField label="Type">
            <Input value={selected?.type ?? ""} disabled />
          </FormField>
          <FormField label="Description - optional">
            <Input
              value={description}
              onChange={({ detail }) => setDescription(detail.value)}
            />
          </FormField>
          <FormField label="Comment - optional">
            <Textarea
              value={comment}
              onChange={({ detail }) => setComment(detail.value)}
              rows={3}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

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
          {formError ? <Alert type="error">{formError}</Alert> : null}
          <Box>
            Are you sure you want to delete hosted zone <b>{selected?.name}</b>{" "}
            ({selected?.id})?
          </Box>
          <Alert type="warning">
            This action cannot be undone. Non-system records must be removed
            first.
          </Alert>
        </SpaceBetween>
      </Modal>
    </ConsoleShell>
  );
}

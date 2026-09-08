"use client";

import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Button from "@cloudscape-design/components/button";
import Flashbar, { type FlashbarProps } from "@cloudscape-design/components/flashbar";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ConsoleShell } from "@/components/console";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import { api } from "@/lib/api";
import type { HostedZoneType } from "@/lib/types/hosted-zone";
import {
  HostedZoneConfigSection,
  TagsSection,
} from "./CreateHostedZoneFormSections";
import styles from "./CreateHostedZonePage.module.css";

type Tag = { key: string; value: string };

const CREATE_DELAY_MS = 1800;

/**
 * Create hosted zone page — matches AWS Route 53 create form layout.
 */
export function CreateHostedZonePage() {
  const router = useRouter();
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneType, setZoneType] = useState<HostedZoneType>("Public");
  const [tags, setTags] = useState<Tag[]>([]);
  const [domainError, setDomainError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [creatingName, setCreatingName] = useState<string | null>(null);

  const goBack = () => {
    if (submitting) return;
    router.push("/hosted-zones");
  };

  const handleCreate = () => {
    const trimmed = domainName.trim();
    if (!trimmed) {
      setDomainError("Domain name is required.");
      return;
    }
    if (submitting) return;

    setDomainError(undefined);
    setSubmitting(true);
    setCreatingName(trimmed);

    window.setTimeout(() => {
      void (async () => {
        try {
          const zone = await api.createZone({
            domain_name: trimmed,
            description,
            type: zoneType,
          });
          router.push(`/hosted-zones/${zone.id}?created=1`);
        } catch (error) {
          setSubmitting(false);
          setCreatingName(null);
          setDomainError(
            error instanceof Error ? error.message : "Failed to create hosted zone.",
          );
        }
      })();
    }, CREATE_DELAY_MS);
  };

  const flashItems: FlashbarProps.MessageDefinition[] = useMemo(() => {
    if (!creatingName) return [];
    return [
      {
        id: "creating-zone",
        type: "info",
        loading: true,
        dismissible: true,
        dismissLabel: "Dismiss",
        onDismiss: () => setCreatingName(null),
        header: `Creating hosted zone ${creatingName}`,
        content: "This can take a moment.",
      },
    ];
  }, [creatingName]);

  return (
    <ConsoleShell
      contentType="form"
      navigationOpenByDefault={false}
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Route 53", href: "/hosted-zones" },
            { text: "Hosted zones", href: "/hosted-zones" },
            { text: "Create hosted zone", href: "/hosted-zones/create" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
    >
      <div className={styles.page}>
        {flashItems.length > 0 ? <Flashbar items={flashItems} /> : null}

        <Header
          variant="h1"
          info={
            <Link href="#" fontSize="body-s">
              Info
            </Link>
          }
        >
          Create hosted zone
        </Header>

        <div className={styles.stack}>
          <HostedZoneConfigSection
            domainName={domainName}
            description={description}
            zoneType={zoneType}
            domainError={domainError}
            onDomainChange={(value) => {
              setDomainName(value);
              if (domainError) setDomainError(undefined);
            }}
            onDescriptionChange={setDescription}
            onTypeChange={setZoneType}
          />

          <TagsSection
            tags={tags}
            onAddTag={() =>
              setTags((prev) => [...prev, { key: "", value: "" }])
            }
            onTagChange={(index, field, value) => {
              setTags((prev) =>
                prev.map((tag, i) =>
                  i === index ? { ...tag, [field]: value } : tag,
                ),
              );
            }}
            onRemoveTag={(index) => {
              setTags((prev) => prev.filter((_, i) => i !== index));
            }}
          />
        </div>

        <div className={styles.actionsBar}>
          <Button variant="link" onClick={goBack} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={submitting}
            disabled={submitting}
            onClick={handleCreate}
            style={submitting ? undefined : awsPrimaryButtonStyle}
            className={submitting ? styles.createButtonLoading : undefined}
          >
            Create hosted zone
          </Button>
        </div>
      </div>
    </ConsoleShell>
  );
}

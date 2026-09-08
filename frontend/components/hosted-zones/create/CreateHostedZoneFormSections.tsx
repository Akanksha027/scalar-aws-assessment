"use client";

import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Textarea from "@cloudscape-design/components/textarea";
import Tiles from "@cloudscape-design/components/tiles";
import type { HostedZoneType } from "@/lib/types/hosted-zone";
import styles from "./CreateHostedZonePage.module.css";

const DOMAIN_HINT =
  'Valid characters: a-z, 0-9, ! " # $ % & \' ( ) * + , - / : ; < = > ? @ [ \\ ] ^ _ ` { | } . ~';

const DESCRIPTION_MAX = 256;

function InfoLink() {
  return (
    <Link href="#" fontSize="body-s">
      Info
    </Link>
  );
}

type HostedZoneConfigSectionProps = {
  domainName: string;
  description: string;
  zoneType: HostedZoneType;
  domainError?: string;
  onDomainChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (value: HostedZoneType) => void;
};

export function HostedZoneConfigSection({
  domainName,
  description,
  zoneType,
  domainError,
  onDomainChange,
  onDescriptionChange,
  onTypeChange,
}: HostedZoneConfigSectionProps) {
  return (
    <Container
      header={<Header variant="h2">Hosted zone configuration</Header>}
    >
      <SpaceBetween size="l">
        <p className={styles.sectionDescription}>
          A hosted zone is a container that holds information about how you want
          to route traffic for a domain, such as example.com, and its
          subdomains.
        </p>

        <FormField
          label={
            <span>
              Domain name <InfoLink />
            </span>
          }
          description="This is the name of the domain that you want to route traffic for."
          constraintText={DOMAIN_HINT}
          errorText={domainError}
        >
          <Input
            value={domainName}
            onChange={({ detail }) => onDomainChange(detail.value)}
            placeholder="example.com"
            ariaRequired
          />
        </FormField>

        <FormField
          label={
            <span>
              Description - optional <InfoLink />
            </span>
          }
          description="This value lets you distinguish hosted zones that have the same name."
          constraintText={
            <span className={styles.descriptionMeta}>
              <span>The description can have up to 256 characters.</span>
              <span>
                {description.length}/{DESCRIPTION_MAX}
              </span>
            </span>
          }
        >
          <Textarea
            value={description}
            onChange={({ detail }) =>
              onDescriptionChange(detail.value.slice(0, DESCRIPTION_MAX))
            }
            placeholder="The hosted zone is used for..."
            rows={4}
          />
        </FormField>

        <FormField
          label={
            <span>
              Type <InfoLink />
            </span>
          }
          description="The type indicates whether you want to route traffic on the internet or in an Amazon VPC."
        >
          <Tiles
            value={zoneType === "Public" ? "public" : "private"}
            onChange={({ detail }) =>
              onTypeChange(detail.value === "public" ? "Public" : "Private")
            }
            items={[
              {
                value: "public",
                label: "Public hosted zone",
                description:
                  "A public hosted zone determines how traffic is routed on the internet.",
              },
              {
                value: "private",
                label: "Private hosted zone",
                description:
                  "A private hosted zone determines how traffic is routed within an Amazon VPC.",
              },
            ]}
            columns={2}
          />
        </FormField>
      </SpaceBetween>
    </Container>
  );
}

type Tag = { key: string; value: string };

type TagsSectionProps = {
  tags: Tag[];
  onAddTag: () => void;
  onTagChange: (index: number, field: "key" | "value", value: string) => void;
  onRemoveTag: (index: number) => void;
};

export function TagsSection({
  tags,
  onAddTag,
  onTagChange,
  onRemoveTag,
}: TagsSectionProps) {
  return (
    <Container
      header={
        <Header variant="h2" info={<InfoLink />}>
          Tags
        </Header>
      }
    >
      <SpaceBetween size="m">
        <p className={styles.sectionDescription}>
          Apply tags to hosted zones to help organize and identify them.
        </p>

        {tags.length === 0 ? (
          <p className={styles.tagsEmpty}>No tags associated with the resource.</p>
        ) : (
          tags.map((tag, index) => (
            <div className={styles.tagRow} key={index}>
              <FormField label="Key">
                <Input
                  value={tag.key}
                  onChange={({ detail }) =>
                    onTagChange(index, "key", detail.value)
                  }
                  placeholder="Key"
                />
              </FormField>
              <FormField label="Value - optional">
                <Input
                  value={tag.value}
                  onChange={({ detail }) =>
                    onTagChange(index, "value", detail.value)
                  }
                  placeholder="Value"
                />
              </FormField>
              <Button
                variant="icon"
                iconName="remove"
                ariaLabel={`Remove tag ${index + 1}`}
                onClick={() => onRemoveTag(index)}
              />
            </div>
          ))
        )}

        <div>
          <Button onClick={onAddTag}>Add tag</Button>
        </div>
      </SpaceBetween>
    </Container>
  );
}

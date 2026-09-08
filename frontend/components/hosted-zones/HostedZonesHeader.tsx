"use client";

import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import styles from "./HostedZonesHeader.module.css";

type HostedZonesHeaderProps = {
  count: number;
  hasSelection: boolean;
  onRefresh: () => void;
  onCreate: () => void;
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * Page header: title + actions on one row (Cloudscape Header actions slot).
 */
export function HostedZonesHeader({
  count,
  hasSelection,
  onRefresh,
  onCreate,
  onViewDetails,
  onEdit,
  onDelete,
}: HostedZonesHeaderProps) {
  return (
    <div className={styles.header}>
      <Header
        variant="h1"
        counter={`(${count})`}
        actions={
          <div className={styles.actions}>
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                onClick={onRefresh}
              />
              <Button disabled={!hasSelection} onClick={onViewDetails}>
                View details
              </Button>
              <Button disabled={!hasSelection} onClick={onEdit}>
                Edit
              </Button>
              <Button disabled={!hasSelection} onClick={onDelete}>
                Delete
              </Button>
              <Button
                variant="primary"
                onClick={onCreate}
                style={awsPrimaryButtonStyle}
              >
                Create hosted zone
              </Button>
            </SpaceBetween>
          </div>
        }
      >
        Hosted zones
      </Header>
    </div>
  );
}

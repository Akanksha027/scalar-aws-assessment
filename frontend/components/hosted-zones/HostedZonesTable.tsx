"use client";

import Table, { type TableProps } from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences, {
  type CollectionPreferencesProps,
} from "@cloudscape-design/components/collection-preferences";
import Link from "@cloudscape-design/components/link";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { useState } from "react";
import type { HostedZone } from "@/lib/types/hosted-zone";
import { HostedZonesEmptyState } from "./HostedZonesEmptyState";

const COLUMN_DEFINITIONS: TableProps.ColumnDefinition<HostedZone>[] = [
  {
    id: "name",
    header: "Hosted zone name",
    cell: (item) => (
      <Link href={`/hosted-zones/${item.id}`} fontSize="body-m">
        {item.name}
      </Link>
    ),
    sortingField: "name",
    isRowHeader: true,
  },
  {
    id: "type",
    header: "Type",
    cell: (item) => item.type,
    sortingField: "type",
  },
  {
    id: "createdBy",
    header: "Created by",
    cell: (item) => item.createdBy,
    sortingField: "createdBy",
  },
  {
    id: "recordCount",
    header: "Record count",
    cell: (item) => item.recordCount,
    sortingField: "recordCount",
  },
  {
    id: "description",
    header: "Description",
    cell: (item) => item.description || "—",
    sortingField: "description",
  },
  {
    id: "id",
    header: "Hosted zone ID",
    cell: (item) => item.id,
    sortingField: "id",
  },
];

type HostedZonesTableProps = {
  items: HostedZone[];
  selectedItems: HostedZone[];
  onSelectionChange: (items: HostedZone[]) => void;
  onCreate: () => void;
  loading?: boolean;
};

/**
 * Hosted zones collection table with filter, pagination, and empty state.
 */
export function HostedZonesTable({
  items,
  selectedItems,
  onSelectionChange,
  onCreate,
  loading = false,
}: HostedZonesTableProps) {
  const [preferences, setPreferences] =
    useState<CollectionPreferencesProps.Preferences>({ pageSize: 20 });

  const {
    items: collectionItems,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
    actions,
  } = useCollection(items, {
    filtering: {
      empty: <HostedZonesEmptyState onCreate={onCreate} />,
      noMatch: (
        <Box textAlign="center" color="inherit" padding="xxl">
          <SpaceBetween size="m">
            <b>No matches</b>
            <Box variant="p" color="text-body-secondary">
              No hosted zones match the filter.
            </Box>
            <Button onClick={() => actions.setFiltering("")}>Clear filter</Button>
          </SpaceBetween>
        </Box>
      ),
    },
    pagination: { pageSize: preferences.pageSize },
    sorting: {},
    selection: {},
  });

  return (
    <Table
      {...collectionProps}
      variant="full-page"
      stickyHeader
      resizableColumns
      selectionType="multi"
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) =>
        onSelectionChange(detail.selectedItems)
      }
      columnDefinitions={COLUMN_DEFINITIONS}
      items={collectionItems}
      loading={loading}
      loadingText="Loading hosted zones"
      trackBy="id"
      empty={<HostedZonesEmptyState onCreate={onCreate} />}
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Filter records by property or value"
          filteringAriaLabel="Filter hosted zones"
          countText={
            filterProps.filteringText
              ? `${filteredItemsCount} matches`
              : undefined
          }
        />
      }
      pagination={<Pagination {...paginationProps} />}
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          preferences={preferences}
          onConfirm={({ detail }) => setPreferences(detail)}
          pageSizePreference={{
            title: "Page size",
            options: [
              { value: 10, label: "10 hosted zones" },
              { value: 20, label: "20 hosted zones" },
              { value: 50, label: "50 hosted zones" },
            ],
          }}
        />
      }
      ariaLabels={{
        selectionGroupLabel: "Hosted zones selection",
        allItemsSelectionLabel: () => "Select all hosted zones",
        itemSelectionLabel: (_data, item) => item.name,
      }}
    />
  );
}


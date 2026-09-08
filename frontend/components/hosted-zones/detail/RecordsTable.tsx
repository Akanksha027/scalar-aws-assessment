"use client";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CollectionPreferences, {
  type CollectionPreferencesProps,
} from "@cloudscape-design/components/collection-preferences";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import Select, { type SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table, { type TableProps } from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { useMemo, useState } from "react";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import type { DnsRecord } from "@/lib/types/dns-record";
import styles from "./HostedZoneDetailPage.module.css";

const COLUMN_DEFINITIONS: TableProps.ColumnDefinition<DnsRecord>[] = [
  {
    id: "name",
    header: "Record name",
    cell: (item) => item.name,
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
    id: "routingPolicy",
    header: "Routing policy",
    cell: (item) => item.routingPolicy,
    sortingField: "routingPolicy",
  },
  {
    id: "differentiator",
    header: "Differentiator",
    cell: (item) => item.differentiator,
    sortingField: "differentiator",
  },
  {
    id: "alias",
    header: "Alias",
    cell: (item) => (item.alias ? "Yes" : "No"),
    sortingField: "alias",
  },
  {
    id: "value",
    header: "Value/Route traffic to",
    cell: (item) => (
      <div className={styles.recordValue}>
        {item.value.split("\n").map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    ),
    minWidth: 220,
  },
  {
    id: "ttl",
    header: "TTL (seconds)",
    cell: (item) =>
      item.ttl == null ? "-" : item.ttl.toLocaleString("en-US"),
    sortingField: "ttl",
  },
  {
    id: "healthCheckId",
    header: "Health check ID",
    cell: (item) => item.healthCheckId,
  },
  {
    id: "evaluateTargetHealth",
    header: "Evaluate target health",
    cell: (item) => item.evaluateTargetHealth,
  },
];

const TYPE_OPTIONS: SelectProps.Option[] = [
  { label: "Type", value: "" },
  { label: "NS", value: "NS" },
  { label: "SOA", value: "SOA" },
  { label: "A", value: "A" },
  { label: "AAAA", value: "AAAA" },
  { label: "CNAME", value: "CNAME" },
  { label: "MX", value: "MX" },
  { label: "TXT", value: "TXT" },
];

const ROUTING_OPTIONS: SelectProps.Option[] = [
  { label: "Routing policy", value: "" },
  { label: "Simple", value: "Simple" },
  { label: "Weighted", value: "Weighted" },
  { label: "Latency", value: "Latency" },
  { label: "Failover", value: "Failover" },
];

const ALIAS_OPTIONS: SelectProps.Option[] = [
  { label: "Alias", value: "" },
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

type RecordsTableProps = {
  records: DnsRecord[];
  onRefresh: () => void;
};

export function RecordsTable({ records, onRefresh }: RecordsTableProps) {
  const [selectedItems, setSelectedItems] = useState<DnsRecord[]>([]);
  const [preferences, setPreferences] =
    useState<CollectionPreferencesProps.Preferences>({ pageSize: 20 });
  const [typeFilter, setTypeFilter] = useState<SelectProps.Option>(TYPE_OPTIONS[0]);
  const [routingFilter, setRoutingFilter] = useState<SelectProps.Option>(
    ROUTING_OPTIONS[0],
  );
  const [aliasFilter, setAliasFilter] = useState<SelectProps.Option>(
    ALIAS_OPTIONS[0],
  );

  const filteredSource = useMemo(() => {
    return records.filter((record) => {
      if (typeFilter.value && record.type !== typeFilter.value) return false;
      if (routingFilter.value && record.routingPolicy !== routingFilter.value) {
        return false;
      }
      if (aliasFilter.value === "yes" && !record.alias) return false;
      if (aliasFilter.value === "no" && record.alias) return false;
      return true;
    });
  }, [records, typeFilter, routingFilter, aliasFilter]);

  const {
    items,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
    actions,
  } = useCollection(filteredSource, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="xxl">
          <b>No records</b>
        </Box>
      ),
      noMatch: (
        <Box textAlign="center" color="inherit" padding="xxl">
          <SpaceBetween size="m">
            <b>No matches</b>
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
      variant="container"
      stickyHeader
      resizableColumns
      selectionType="multi"
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) =>
        setSelectedItems(detail.selectedItems)
      }
      columnDefinitions={COLUMN_DEFINITIONS}
      items={items}
      trackBy="id"
      loadingText="Loading records"
      header={
        <Header
          variant="h2"
          counter={`(${records.length})`}
          info={
            <Link href="#" fontSize="body-s">
              Info
            </Link>
          }
          description={
            <span className={styles.recordsHint}>
              Automatic mode is the current search behavior optimized for best
              filter results.{" "}
              <Link href="#" fontSize="body-s">
                To change modes go to settings.
              </Link>
            </span>
          }
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                onClick={onRefresh}
              />
              <Button disabled={selectedItems.length === 0}>
                Delete record
              </Button>
              <Button>Import zone file</Button>
              <Button variant="primary" style={awsPrimaryButtonStyle}>
                Create record
              </Button>
            </SpaceBetween>
          }
        >
          Records
        </Header>
      }
      filter={
        <div className={styles.filterRow}>
          <div className={styles.filterSearch}>
            <TextFilter
              {...filterProps}
              filteringPlaceholder="Filter records by property or value"
              filteringAriaLabel="Filter records"
              countText={
                filterProps.filteringText
                  ? `${filteredItemsCount} matches`
                  : undefined
              }
            />
          </div>
          <Select
            selectedOption={typeFilter}
            onChange={({ detail }) => setTypeFilter(detail.selectedOption)}
            options={TYPE_OPTIONS}
            placeholder="Type"
            selectedAriaLabel="Type"
          />
          <Select
            selectedOption={routingFilter}
            onChange={({ detail }) => setRoutingFilter(detail.selectedOption)}
            options={ROUTING_OPTIONS}
            placeholder="Routing policy"
            selectedAriaLabel="Routing policy"
          />
          <Select
            selectedOption={aliasFilter}
            onChange={({ detail }) => setAliasFilter(detail.selectedOption)}
            options={ALIAS_OPTIONS}
            placeholder="Alias"
            selectedAriaLabel="Alias"
          />
        </div>
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
              { value: 10, label: "10 records" },
              { value: 20, label: "20 records" },
              { value: 50, label: "50 records" },
            ],
          }}
        />
      }
      ariaLabels={{
        selectionGroupLabel: "Records selection",
        allItemsSelectionLabel: () => "Select all records",
        itemSelectionLabel: (_data, item) => `${item.name} ${item.type}`,
      }}
    />
  );
}

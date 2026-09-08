"use client";

import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CollectionPreferences, {
  type CollectionPreferencesProps,
} from "@cloudscape-design/components/collection-preferences";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import Input from "@cloudscape-design/components/input";
import Link from "@cloudscape-design/components/link";
import Modal from "@cloudscape-design/components/modal";
import Pagination from "@cloudscape-design/components/pagination";
import Select, { type SelectProps } from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table, { type TableProps } from "@cloudscape-design/components/table";
import Textarea from "@cloudscape-design/components/textarea";
import TextFilter from "@cloudscape-design/components/text-filter";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { useEffect, useMemo, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";
import type {
  DnsRecord,
  DnsRecordType,
  RoutingPolicy,
} from "@/lib/types/dns-record";
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

const TYPE_FILTER_OPTIONS: SelectProps.Option[] = [
  { label: "Type", value: "" },
  { label: "A", value: "A" },
  { label: "AAAA", value: "AAAA" },
  { label: "CNAME", value: "CNAME" },
  { label: "TXT", value: "TXT" },
  { label: "MX", value: "MX" },
  { label: "NS", value: "NS" },
  { label: "SOA", value: "SOA" },
  { label: "PTR", value: "PTR" },
  { label: "SRV", value: "SRV" },
  { label: "CAA", value: "CAA" },
];

const RECORD_TYPE_OPTIONS: SelectProps.Option[] = [
  { label: "A", value: "A" },
  { label: "AAAA", value: "AAAA" },
  { label: "CNAME", value: "CNAME" },
  { label: "TXT", value: "TXT" },
  { label: "MX", value: "MX" },
  { label: "NS", value: "NS" },
  { label: "PTR", value: "PTR" },
  { label: "SRV", value: "SRV" },
  { label: "CAA", value: "CAA" },
];

const ROUTING_FILTER_OPTIONS: SelectProps.Option[] = [
  { label: "Routing policy", value: "" },
  { label: "Simple", value: "Simple" },
  { label: "Weighted", value: "Weighted" },
  { label: "Latency", value: "Latency" },
  { label: "Failover", value: "Failover" },
];

const ROUTING_FORM_OPTIONS: SelectProps.Option[] = [
  { label: "Simple", value: "Simple" },
  { label: "Weighted", value: "Weighted" },
  { label: "Latency", value: "Latency" },
  { label: "Failover", value: "Failover" },
  { label: "Geolocation", value: "Geolocation" },
  { label: "Multivalue", value: "Multivalue" },
];

const ALIAS_OPTIONS: SelectProps.Option[] = [
  { label: "Alias", value: "" },
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const CAA_TAG_OPTIONS: SelectProps.Option[] = [
  { label: "issue", value: "issue" },
  { label: "issuewild", value: "issuewild" },
  { label: "iodef", value: "iodef" },
];

type ApiRecordValue = {
  value: string;
  priority?: number | null;
  weight?: number | null;
  port?: number | null;
  flag?: number | null;
  tag?: string | null;
};

type RecordFormState = {
  name: string;
  type: DnsRecordType;
  ttl: string;
  routingPolicy: RoutingPolicy;
  valuesText: string;
  mxPriority: string;
  srvPriority: string;
  srvWeight: string;
  srvPort: string;
  caaFlag: string;
  caaTag: string;
};

function defaultFormState(zoneName: string): RecordFormState {
  return {
    name: zoneName,
    type: "A",
    ttl: "300",
    routingPolicy: "Simple",
    valuesText: "",
    mxPriority: "10",
    srvPriority: "0",
    srvWeight: "0",
    srvPort: "0",
    caaFlag: "0",
    caaTag: "issue",
  };
}

function formStateFromRecord(record: DnsRecord): RecordFormState {
  const firstLine = record.value.split("\n")[0]?.trim() ?? "";
  let mxPriority = "10";
  let srvPriority = "0";
  let srvWeight = "0";
  let srvPort = "0";
  let caaFlag = "0";
  let caaTag = "issue";

  if (record.type === "MX") {
    const parts = firstLine.split(/\s+/);
    if (parts.length >= 2 && /^\d+$/.test(parts[0])) mxPriority = parts[0];
  }
  if (record.type === "SRV") {
    const parts = firstLine.split(/\s+/);
    if (parts.length >= 4) {
      if (/^\d+$/.test(parts[0])) srvPriority = parts[0];
      if (/^\d+$/.test(parts[1])) srvWeight = parts[1];
      if (/^\d+$/.test(parts[2])) srvPort = parts[2];
    }
  }
  if (record.type === "CAA") {
    const match = firstLine.match(/^(\d+)\s+(\S+)\s+"?([^"]*)"?$/);
    if (match) {
      caaFlag = match[1];
      caaTag = match[2];
    }
  }

  return {
    name: record.name,
    type: record.type,
    ttl: String(record.ttl ?? 300),
    routingPolicy: record.routingPolicy,
    valuesText: record.value,
    mxPriority,
    srvPriority,
    srvWeight,
    srvPort,
    caaFlag,
    caaTag,
  };
}

function parseRecordValues(
  type: DnsRecordType,
  valuesText: string,
  form: RecordFormState,
): ApiRecordValue[] {
  const lines = valuesText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (type === "MX") {
    return lines.map((line) => {
      const parts = line.split(/\s+/);
      if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
        return {
          priority: Number(parts[0]),
          value: parts.slice(1).join(" "),
        };
      }
      return {
        priority: Number(form.mxPriority || 10),
        value: line,
      };
    });
  }

  if (type === "SRV") {
    return lines.map((line) => {
      const parts = line.split(/\s+/);
      if (
        parts.length >= 4 &&
        /^\d+$/.test(parts[0]) &&
        /^\d+$/.test(parts[1]) &&
        /^\d+$/.test(parts[2])
      ) {
        return {
          priority: Number(parts[0]),
          weight: Number(parts[1]),
          port: Number(parts[2]),
          value: parts.slice(3).join(" "),
        };
      }
      return {
        priority: Number(form.srvPriority || 0),
        weight: Number(form.srvWeight || 0),
        port: Number(form.srvPort || 0),
        value: line,
      };
    });
  }

  if (type === "CAA") {
    return lines.map((line) => {
      const match = line.match(/^(\d+)\s+(\S+)\s+"?([^"]*)"?$/);
      if (match) {
        return {
          flag: Number(match[1]),
          tag: match[2],
          value: match[3],
        };
      }
      return {
        flag: Number(form.caaFlag || 0),
        tag: form.caaTag || "issue",
        value: line.replace(/^"|"$/g, ""),
      };
    });
  }

  return lines.map((value) => ({ value }));
}

function valuePlaceholder(type: DnsRecordType): string {
  switch (type) {
    case "A":
      return "192.0.2.1";
    case "AAAA":
      return "2001:0db8::1";
    case "CNAME":
    case "NS":
    case "PTR":
      return "example.com.";
    case "TXT":
      return '"v=spf1 include:example.com ~all"';
    case "MX":
      return "10 mail.example.com.\n(or hostname only if Priority is set above)";
    case "SRV":
      return "0 5 5060 sip.example.com.\n(or target only if Priority/Weight/Port are set above)";
    case "CAA":
      return '0 issue "letsencrypt.org"\n(or value only if Flag/Tag are set above)';
    default:
      return "";
  }
}

type RecordsTableProps = {
  zoneId: string;
  zoneName: string;
  records: DnsRecord[];
  loading?: boolean;
  onRefresh: () => void;
};

export function RecordsTable({
  zoneId,
  zoneName,
  records,
  loading = false,
  onRefresh,
}: RecordsTableProps) {
  const [selectedItems, setSelectedItems] = useState<DnsRecord[]>([]);
  const [preferences, setPreferences] =
    useState<CollectionPreferencesProps.Preferences>({ pageSize: 20 });
  const [typeFilter, setTypeFilter] = useState<SelectProps.Option>(
    TYPE_FILTER_OPTIONS[0],
  );
  const [routingFilter, setRoutingFilter] = useState<SelectProps.Option>(
    ROUTING_FILTER_OPTIONS[0],
  );
  const [aliasFilter, setAliasFilter] = useState<SelectProps.Option>(
    ALIAS_OPTIONS[0],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingRecord, setEditingRecord] = useState<DnsRecord | null>(null);
  const [form, setForm] = useState<RecordFormState>(() =>
    defaultFormState(zoneName),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    setSelectedItems((prev) =>
      prev.filter((item) => records.some((r) => r.id === item.id)),
    );
  }, [records]);

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

  const deletableSelected = selectedItems.filter((item) => !item.isSystemRecord);
  const canEdit = selectedItems.length === 1;
  const canDelete = deletableSelected.length > 0;
  const isSystemEdit = formMode === "edit" && !!editingRecord?.isSystemRecord;

  function openCreate() {
    setFormMode("create");
    setEditingRecord(null);
    setForm(defaultFormState(zoneName));
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit() {
    const record = selectedItems[0];
    if (!record) return;
    setFormMode("edit");
    setEditingRecord(record);
    setForm(formStateFromRecord(record));
    setFormError(null);
    setFormOpen(true);
  }

  function openDelete() {
    setDeleteError(null);
    setDeleteOpen(true);
  }

  function updateForm<K extends keyof RecordFormState>(
    key: K,
    value: RecordFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submitForm() {
    setFormError(null);
    const ttl = Number(form.ttl);
    if (!Number.isFinite(ttl) || ttl < 0) {
      setFormError("TTL must be 0 or greater.");
      return;
    }
    if (!form.valuesText.trim()) {
      setFormError("At least one value is required.");
      return;
    }

    const values = parseRecordValues(form.type, form.valuesText, form);
    if (values.length === 0) {
      setFormError("At least one value is required.");
      return;
    }

    setFormSubmitting(true);
    try {
      if (formMode === "create") {
        await api.createRecord(zoneId, {
          name: form.name.trim() || zoneName,
          type: form.type,
          ttl,
          routing_policy: form.routingPolicy,
          values,
        });
      } else if (editingRecord) {
        const payload: {
          name?: string;
          type?: DnsRecordType;
          ttl: number;
          routing_policy: RoutingPolicy;
          values: ApiRecordValue[];
        } = {
          ttl,
          routing_policy: form.routingPolicy,
          values,
        };
        if (!editingRecord.isSystemRecord) {
          payload.name = form.name.trim() || zoneName;
          payload.type = form.type;
        }
        await api.updateRecord(zoneId, editingRecord.id, payload);
      }
      setFormOpen(false);
      setSelectedItems([]);
      onRefresh();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Failed to save record. Please try again.",
      );
    } finally {
      setFormSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (deletableSelected.length === 0) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await api.deleteRecords(
        zoneId,
        deletableSelected.map((item) => item.id),
      );
      setDeleteOpen(false);
      setSelectedItems([]);
      onRefresh();
    } catch (error) {
      setDeleteError(
        error instanceof ApiError
          ? error.message
          : "Failed to delete records. Please try again.",
      );
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <>
      <Table
        {...collectionProps}
        variant="container"
        stickyHeader
        resizableColumns
        loading={loading}
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) =>
          setSelectedItems(detail.selectedItems)
        }
        isItemDisabled={(item) => !!item.isSystemRecord}
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
                <Button disabled={!canEdit} onClick={openEdit}>
                  Edit record
                </Button>
                <Button disabled={!canDelete} onClick={openDelete}>
                  Delete record
                </Button>
                <Button disabled>Import zone file</Button>
                <Button
                  variant="primary"
                  style={awsPrimaryButtonStyle}
                  onClick={openCreate}
                >
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
              options={TYPE_FILTER_OPTIONS}
              placeholder="Type"
              selectedAriaLabel="Type"
            />
            <Select
              selectedOption={routingFilter}
              onChange={({ detail }) => setRoutingFilter(detail.selectedOption)}
              options={ROUTING_FILTER_OPTIONS}
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

      <Modal
        visible={formOpen}
        onDismiss={() => !formSubmitting && setFormOpen(false)}
        header={formMode === "create" ? "Create record" : "Edit record"}
        size="medium"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                disabled={formSubmitting}
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={formSubmitting}
                onClick={() => void submitForm()}
                style={formSubmitting ? undefined : awsPrimaryButtonStyle}
              >
                {formMode === "create" ? "Create record" : "Save"}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          {formError ? (
            <Alert type="error" header="Unable to save record">
              {formError}
            </Alert>
          ) : null}

          {isSystemEdit ? (
            <Alert type="info">
              System records can update TTL and values only. Name and type are
              locked.
            </Alert>
          ) : null}

          <FormField
            label="Record name"
            description={`Enter a subdomain or the full zone name (${zoneName}).`}
          >
            <Input
              value={form.name}
              disabled={isSystemEdit}
              onChange={({ detail }) => updateForm("name", detail.value)}
              placeholder={zoneName}
            />
          </FormField>

          <FormField label="Record type">
            <Select
              selectedOption={
                (
                  form.type === "SOA"
                    ? [{ label: "SOA", value: "SOA" }, ...RECORD_TYPE_OPTIONS]
                    : RECORD_TYPE_OPTIONS
                ).find((o) => o.value === form.type) ?? RECORD_TYPE_OPTIONS[0]
              }
              disabled={isSystemEdit}
              onChange={({ detail }) => {
                const next = (detail.selectedOption.value ??
                  "A") as DnsRecordType;
                if (next === "SOA") return;
                updateForm("type", next);
              }}
              options={RECORD_TYPE_OPTIONS}
              selectedAriaLabel="Record type"
            />
          </FormField>

          <FormField label="TTL (seconds)">
            <Input
              type="number"
              value={form.ttl}
              onChange={({ detail }) => updateForm("ttl", detail.value)}
            />
          </FormField>

          <FormField label="Routing policy">
            <Select
              selectedOption={
                ROUTING_FORM_OPTIONS.find(
                  (o) => o.value === form.routingPolicy,
                ) ?? ROUTING_FORM_OPTIONS[0]
              }
              onChange={({ detail }) =>
                updateForm(
                  "routingPolicy",
                  (detail.selectedOption.value ?? "Simple") as RoutingPolicy,
                )
              }
              options={ROUTING_FORM_OPTIONS}
              selectedAriaLabel="Routing policy"
            />
          </FormField>

          {form.type === "MX" ? (
            <FormField
              label="Priority"
              description="Used when each value line is a hostname only."
            >
              <Input
                type="number"
                value={form.mxPriority}
                onChange={({ detail }) =>
                  updateForm("mxPriority", detail.value)
                }
              />
            </FormField>
          ) : null}

          {form.type === "SRV" ? (
            <SpaceBetween size="m" direction="horizontal">
              <FormField label="Priority">
                <Input
                  type="number"
                  value={form.srvPriority}
                  onChange={({ detail }) =>
                    updateForm("srvPriority", detail.value)
                  }
                />
              </FormField>
              <FormField label="Weight">
                <Input
                  type="number"
                  value={form.srvWeight}
                  onChange={({ detail }) =>
                    updateForm("srvWeight", detail.value)
                  }
                />
              </FormField>
              <FormField label="Port">
                <Input
                  type="number"
                  value={form.srvPort}
                  onChange={({ detail }) =>
                    updateForm("srvPort", detail.value)
                  }
                />
              </FormField>
            </SpaceBetween>
          ) : null}

          {form.type === "CAA" ? (
            <SpaceBetween size="m" direction="horizontal">
              <FormField label="Flag">
                <Input
                  type="number"
                  value={form.caaFlag}
                  onChange={({ detail }) =>
                    updateForm("caaFlag", detail.value)
                  }
                />
              </FormField>
              <FormField label="Tag">
                <Select
                  selectedOption={
                    CAA_TAG_OPTIONS.find((o) => o.value === form.caaTag) ??
                    CAA_TAG_OPTIONS[0]
                  }
                  onChange={({ detail }) =>
                    updateForm("caaTag", detail.selectedOption.value ?? "issue")
                  }
                  options={CAA_TAG_OPTIONS}
                  selectedAriaLabel="CAA tag"
                />
              </FormField>
            </SpaceBetween>
          ) : null}

          <FormField
            label="Value"
            description="Enter one value per line."
          >
            <Textarea
              value={form.valuesText}
              onChange={({ detail }) => updateForm("valuesText", detail.value)}
              rows={6}
              placeholder={valuePlaceholder(form.type)}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      <Modal
        visible={deleteOpen}
        onDismiss={() => !deleteSubmitting && setDeleteOpen(false)}
        header="Delete record"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                disabled={deleteSubmitting}
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={deleteSubmitting}
                onClick={() => void confirmDelete()}
              >
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          {deleteError ? (
            <Alert type="error" header="Unable to delete records">
              {deleteError}
            </Alert>
          ) : null}
          <Box>
            Are you sure you want to delete the following{" "}
            {deletableSelected.length === 1 ? "record" : "records"}?
          </Box>
          <ul className={styles.nameServerList}>
            {deletableSelected.map((item) => (
              <li key={item.id}>
                {item.name} ({item.type})
              </li>
            ))}
          </ul>
        </SpaceBetween>
      </Modal>
    </>
  );
}

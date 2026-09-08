import type { HostedZone, HostedZoneType } from "@/lib/types/hosted-zone";
import { seedDefaultRecords } from "@/lib/mock/dns-records";

/**
 * In-memory store for UI development.
 * Empty by default so the list page matches the empty-state screenshot.
 * Swap this module for a real API client later.
 */
let hostedZones: HostedZone[] = [];

function generateZoneId(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "Z";
  for (let i = 0; i < 21; i += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}

export function listHostedZones(): HostedZone[] {
  return [...hostedZones];
}

export function getHostedZone(id: string): HostedZone | undefined {
  return hostedZones.find((zone) => zone.id === id);
}

export function setHostedZones(zones: HostedZone[]): void {
  hostedZones = [...zones];
}

export type CreateHostedZoneInput = {
  name: string;
  description?: string;
  type: HostedZoneType;
};

export function createHostedZone(input: CreateHostedZoneInput): HostedZone {
  const name = input.name.trim().replace(/\.$/, "");
  const zone: HostedZone = {
    id: generateZoneId(),
    name,
    type: input.type,
    createdBy: "Route 53",
    recordCount: 2,
    description: input.description?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };
  seedDefaultRecords(zone.id, name);
  hostedZones = [zone, ...hostedZones];
  return zone;
}

export function seedDemoHostedZones(): void {
  const zone: HostedZone = {
    id: "Z0123456789ABCDEFGHIJ",
    name: "example.com",
    type: "Public",
    createdBy: "Route 53",
    recordCount: 2,
    description: "Demo public zone",
    createdAt: new Date().toISOString(),
  };
  seedDefaultRecords(zone.id, zone.name);
  hostedZones = [zone];
}

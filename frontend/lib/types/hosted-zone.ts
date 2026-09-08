export type HostedZoneType = "Public" | "Private";

export type HostedZone = {
  id: string;
  name: string;
  type: HostedZoneType;
  createdBy: string;
  recordCount: number;
  description: string;
  comment?: string;
  createdAt: string;
};

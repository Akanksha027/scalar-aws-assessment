"use client";

import { Suspense } from "react";
import { HostedZoneDetailPage } from "@/components/hosted-zones/detail/HostedZoneDetailPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HostedZoneDetailPage />
    </Suspense>
  );
}

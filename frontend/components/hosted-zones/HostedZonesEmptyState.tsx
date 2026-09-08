"use client";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { awsPrimaryButtonStyle } from "@/lib/constants/button-styles";

type HostedZonesEmptyStateProps = {
  onCreate: () => void;
};

/**
 * Empty table state — copy matches Route 53 hosted zones screenshot.
 */
export function HostedZonesEmptyState({ onCreate }: HostedZonesEmptyStateProps) {
  return (
    <Box textAlign="center" color="inherit" padding={{ top: "xxl", bottom: "xxl" }}>
      <SpaceBetween size="m">
        <SpaceBetween size="xxs">
          <b>No hosted zones</b>
          <Box variant="p" color="text-body-secondary">
            There are no hosted zones created for this account.
          </Box>
        </SpaceBetween>
        <Button variant="primary" onClick={onCreate} style={awsPrimaryButtonStyle}>
          Create hosted zone
        </Button>
      </SpaceBetween>
    </Box>
  );
}

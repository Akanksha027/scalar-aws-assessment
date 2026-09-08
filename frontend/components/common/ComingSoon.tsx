"use client";

import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import { ConsoleShell } from "@/components/console";

export function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <ConsoleShell
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Route 53", href: "/hosted-zones" },
            { text: title, href: "#" },
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
    >
      <SpaceBetween size="l">
        <Header variant="h1">{title}</Header>
        <Container>
          <Box textAlign="center" padding="xxl">
            <SpaceBetween size="s">
              <Box variant="h2">Coming soon</Box>
              <Box color="text-body-secondary">{description}</Box>
              <Box color="text-status-inactive" fontSize="body-s">
                This section is mocked for the Route 53 clone assessment.
              </Box>
            </SpaceBetween>
          </Box>
        </Container>
      </SpaceBetween>
    </ConsoleShell>
  );
}

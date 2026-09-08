"use client";

import SideNavigation from "@cloudscape-design/components/side-navigation";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { route53NavItems } from "@/lib/constants/navigation";

type Route53SideNavProps = {
  onFollow?: () => void;
};

/**
 * Keep "Hosted zones" highlighted for list, create, and detail routes.
 */
function resolveActiveHref(pathname: string) {
  if (pathname === "/hosted-zones" || pathname.startsWith("/hosted-zones/")) {
    return "/hosted-zones";
  }
  return pathname;
}

/**
 * Route 53 left nav links.
 * Service title ("Route 53") lives in ConsoleShell sidebar header,
 * so this component only renders the item list.
 */
export function Route53SideNav({ onFollow }: Route53SideNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activeHref = useMemo(() => resolveActiveHref(pathname), [pathname]);

  return (
    <SideNavigation
      activeHref={activeHref}
      items={route53NavItems}
      onFollow={(event) => {
        if (
          event.detail.external ||
          event.detail.href.startsWith("http") ||
          event.detail.href.startsWith("#")
        ) {
          return;
        }
        event.preventDefault();
        onFollow?.();
        router.push(event.detail.href);
      }}
    />
  );
}

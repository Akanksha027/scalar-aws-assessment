import type { SideNavigationProps } from "@cloudscape-design/components/side-navigation";

/** AWS-style "New" label: blue dotted underline text (not a solid badge/button). */
const newBadge = <span className="aws-nav-new">New</span>;

/**
 * Sidebar structure matching the Route 53 console screenshot.
 * Placeholder sections navigate to Coming Soon routes later.
 */
export const route53NavItems: SideNavigationProps.Item[] = [
  { type: "link", text: "Dashboard", href: "/dashboard" },
  { type: "link", text: "Hosted zones", href: "/hosted-zones" },
  { type: "link", text: "Health checks", href: "/health-checks" },
  { type: "link", text: "Profiles", href: "/profiles" },
  {
    type: "section",
    text: "Global Resolver",
    defaultExpanded: true,
    items: [
      {
        type: "link",
        text: "Global resolvers",
        href: "/global-resolver/resolvers",
        info: newBadge,
      },
      {
        type: "link",
        text: "Shared DNS views",
        href: "/global-resolver/dns-views",
        info: newBadge,
      },
    ],
  },
  {
    type: "section",
    text: "VPC Resolver",
    defaultExpanded: true,
    items: [
      { type: "link", text: "VPCs", href: "/vpc-resolver/vpcs" },
      {
        type: "link",
        text: "Inbound endpoints",
        href: "/vpc-resolver/inbound",
      },
      {
        type: "link",
        text: "Outbound endpoints",
        href: "/vpc-resolver/outbound",
      },
      { type: "link", text: "Rules", href: "/vpc-resolver/rules" },
      {
        type: "link",
        text: "Query logging",
        href: "/vpc-resolver/query-logging",
      },
    ],
  },
  {
    type: "section",
    text: "Domains",
    defaultExpanded: true,
    items: [
      {
        type: "link",
        text: "Registered domains",
        href: "/domains/registered",
      },
      { type: "link", text: "Requests", href: "/domains/requests" },
    ],
  },
  {
    type: "section",
    text: "IP-based routing",
    defaultExpanded: true,
    items: [
      {
        type: "link",
        text: "CIDR collections",
        href: "/ip-based-routing/cidr",
      },
    ],
  },
  {
    type: "section",
    text: "Traffic flow",
    defaultExpanded: true,
    items: [
      {
        type: "link",
        text: "Traffic policies",
        href: "/traffic-policies",
      },
      {
        type: "link",
        text: "Policy records",
        href: "/traffic-flow/policy-records",
      },
    ],
  },
  { type: "divider" },
  {
    type: "link",
    text: "DNS Firewall",
    href: "https://console.aws.amazon.com/route53/resolver/home#/dns-firewall",
    external: true,
  },
  {
    type: "link",
    text: "Application Recovery Controller",
    href: "https://console.aws.amazon.com/route53recovery/home",
    external: true,
  },
];

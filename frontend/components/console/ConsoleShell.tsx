"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BreadcrumbStrip } from "@/components/console/BreadcrumbStrip/BreadcrumbStrip";
import { ConsoleFooter } from "@/components/console/ConsoleFooter/ConsoleFooter";
import { Route53SideNav } from "@/components/console/side-navigation/Route53SideNav";
import { TopNav } from "@/components/console/TopNav/TopNav";
import { APP_NAME } from "@/lib/constants/console";
import styles from "./ConsoleShell.module.css";

type ConsoleShellProps = {
  children: ReactNode;
  breadcrumbs?: ReactNode;
  tools?: ReactNode;
  contentType?: "default" | "table" | "form" | "wizard" | "cards" | "dashboard";
  /** When false, side nav starts closed (e.g. create form). Default true. */
  navigationOpenByDefault?: boolean;
  notifications?: ReactNode;
};

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isPhone;
}

/**
 * AWS Console chrome matching Route 53:
 * TopNav → breadcrumb strip → sidebar | content → footer
 * On phone: sidebar is an overlay drawer.
 */
export function ConsoleShell({
  children,
  breadcrumbs,
  tools,
  contentType = "default",
  navigationOpenByDefault = true,
}: ConsoleShellProps) {
  const isPhone = useIsPhone();
  const [navigationOpen, setNavigationOpen] = useState(
    () => navigationOpenByDefault,
  );
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    if (isPhone) {
      setNavigationOpen(false);
    } else {
      setNavigationOpen(navigationOpenByDefault);
    }
  }, [isPhone, navigationOpenByDefault]);

  const closeNav = () => setNavigationOpen(false);

  return (
    <div className={styles.shell}>
      <TopNav />

      <BreadcrumbStrip
        breadcrumbs={breadcrumbs}
        navigationOpen={navigationOpen}
        onNavigationToggle={() => setNavigationOpen((open) => !open)}
        toolsOpen={toolsOpen}
        onToolsToggle={tools ? () => setToolsOpen((open) => !open) : undefined}
      />

      <div className={styles.workspace}>
        {navigationOpen ? (
          <>
            {isPhone ? (
              <button
                type="button"
                className={styles.backdrop}
                aria-label="Close navigation"
                onClick={closeNav}
              />
            ) : null}
            <aside
              className={`${styles.sidebar}${isPhone ? ` ${styles.sidebarDrawer}` : ""}`}
              aria-label={`${APP_NAME} navigation`}
            >
              <div className={styles.sidebarHeader}>
                <a className={styles.sidebarTitle} href="/hosted-zones">
                  {APP_NAME}
                </a>
                <button
                  type="button"
                  className={styles.collapseButton}
                  aria-label="Close side navigation"
                  onClick={closeNav}
                >
                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden>
                    <path
                      d="M10 4L5.5 10L10 16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className={styles.sidebarNav}>
                <Route53SideNav onFollow={isPhone ? closeNav : undefined} />
              </div>
            </aside>
          </>
        ) : null}

        <main
          className={`${styles.content}${contentType === "form" ? ` ${styles.contentForm}` : ""}`}
        >
          {children}
        </main>

        {tools && toolsOpen ? (
          <aside className={styles.tools} aria-label="Tools">
            {tools}
          </aside>
        ) : null}
      </div>

      <div className={styles.desktopFooter}>
        <ConsoleFooter />
      </div>
    </div>
  );
}

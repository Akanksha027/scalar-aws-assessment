"use client";

import type { ReactNode } from "react";
import styles from "./BreadcrumbStrip.module.css";

type BreadcrumbStripProps = {
  breadcrumbs: ReactNode;
  navigationOpen: boolean;
  onNavigationToggle: () => void;
  toolsOpen?: boolean;
  onToolsToggle?: () => void;
};

/**
 * Full-width strip under the dark top nav:
 * blue hamburger + breadcrumbs | tools icons.
 * Sits ABOVE the sidebar (not beside Route 53).
 */
export function BreadcrumbStrip({
  breadcrumbs,
  navigationOpen,
  onNavigationToggle,
  toolsOpen = false,
  onToolsToggle,
}: BreadcrumbStripProps) {
  return (
    <div className={styles.strip} role="navigation" aria-label="Breadcrumb bar">
      <div className={styles.left}>
        <button
          type="button"
          className={styles.hamburger}
          aria-label={navigationOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={navigationOpen}
          onClick={onNavigationToggle}
        >
          <span className={styles.hamburgerLines} aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </button>
        <div className={styles.breadcrumbs}>{breadcrumbs}</div>
      </div>

      <div className={styles.right}>
        <button
          type="button"
          className={toolsOpen ? styles.toolButtonActive : styles.toolButton}
          aria-label="Tools panel"
          aria-pressed={toolsOpen}
          onClick={onToolsToggle}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 3v10" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
        <button type="button" className={styles.toolButton} aria-label="Info">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 7.2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="5.2" r="0.85" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}

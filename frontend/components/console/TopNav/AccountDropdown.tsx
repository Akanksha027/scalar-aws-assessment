"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  ACCOUNT_MENU_LINKS,
  CONSOLE_ACCOUNT,
} from "@/lib/constants/console";
import styles from "./AccountDropdown.module.css";

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="5.5"
        y="5.5"
        width="8"
        height="8"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M10.5 5.5V3.7A1.2 1.2 0 009.3 2.5H3.7A1.2 1.2 0 002.5 3.7v5.6a1.2 1.2 0 001.2 1.2h1.8"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    /* ignore — mock UI */
  }
}

type AccountDropdownProps = {
  id?: string;
};

/**
 * AWS console account menu — free plan, account details, links, sign out.
 */
export function AccountDropdown({ id }: AccountDropdownProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const { freePlan } = CONSOLE_ACCOUNT;

  const accountId = user?.account_id ?? CONSOLE_ACCOUNT.accountId;
  const displayName = user?.display_name ?? CONSOLE_ACCOUNT.displayName;
  const accountIdFormatted =
    accountId.length === 12
      ? `${accountId.slice(0, 4)}-${accountId.slice(4, 8)}-${accountId.slice(8)}`
      : accountId;

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className={styles.dropdown} id={id} role="menu" aria-label="Account menu">
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Free plan status</h2>
        <div className={styles.statsRow}>
          <div>
            <span className={styles.statLabel}>Credits remaining</span>
            <a className={styles.statLink} href="#">
              {freePlan.creditsRemaining}
            </a>
          </div>
          <div className={styles.statsDivider} aria-hidden />
          <div>
            <span className={styles.statLabel}>Days remaining</span>
            <span className={styles.statValue}>{freePlan.daysRemaining}</span>
          </div>
        </div>
        <p className={styles.planNote}>
          Your free access to AWS services will end on {freePlan.endsOn} or when
          you have depleted all credits. To ensure uninterrupted AWS access, see{" "}
          <a href="#">upgrading your plan</a> for details.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.detailBlock}>
          <span className={styles.detailLabel}>Account ID</span>
          <div className={styles.detailValueRow}>
            <button
              type="button"
              className={styles.copyButton}
              aria-label="Copy account ID"
              onClick={() => copyText(accountId)}
            >
              <CopyIcon />
            </button>
            <span>{accountIdFormatted}</span>
          </div>
        </div>

        <div className={styles.detailBlock}>
          <span className={styles.detailLabel}>Account name</span>
          <div className={styles.detailValueRow}>
            <button
              type="button"
              className={styles.copyButton}
              aria-label="Copy account name"
              onClick={() => copyText(displayName)}
            >
              <CopyIcon />
            </button>
            <span>{displayName}</span>
          </div>
        </div>

        <div className={styles.detailBlock}>
          <span className={styles.detailLabel}>Account colour</span>
          <div className={styles.detailValueRow}>
            <span className={styles.colourSwatch} aria-hidden />
            <span className={styles.colourLabel}>
              {CONSOLE_ACCOUNT.accountColour}
            </span>
          </div>
        </div>
      </section>

      <nav className={styles.linkList} aria-label="Account links">
        {ACCOUNT_MENU_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={"muted" in link && link.muted ? styles.linkItemMuted : styles.linkItem}
            role="menuitem"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className={styles.footer}>
        <button type="button" className={styles.multiSessionButton}>
          Turn on multi-session support
        </button>
        <button
          type="button"
          className={styles.signOutButton}
          disabled={signingOut}
          onClick={() => void handleSignOut()}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

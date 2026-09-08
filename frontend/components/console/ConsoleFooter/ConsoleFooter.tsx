"use client";

import styles from "./ConsoleFooter.module.css";

const utilityLinks = [
  { label: "CloudShell", href: "#" },
  { label: "Agent Toolkit for AWS", href: "#" },
  { label: "Feedback", href: "#" },
  { label: "Console mobile app", href: "#" },
] as const;

/**
 * Dark AWS console utility footer.
 */
export function ConsoleFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        {utilityLinks.map((link) => (
          <a key={link.label} className={styles.link} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
      <div className={styles.right}>
        <span className={styles.copyright}>
          © {year}, Amazon Web Services, Inc. or its affiliates.
        </span>
        <nav className={styles.legal} aria-label="Legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookie preferences</a>
        </nav>
      </div>
    </footer>
  );
}

"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api/client";
import styles from "./LoginPage.module.css";

type UserType = "root" | "iam";
type Step = "email" | "password";

export function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("root");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = (event?: FormEvent) => {
    event?.preventDefault();
    if (!email.trim()) {
      setError("Enter your email address");
      return;
    }
    setError(null);
    setStep("password");
  };

  const handleSignIn = async (event?: FormEvent) => {
    event?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.replace("/hosted-zones");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topLinks}>
          <a href="#">Provide feedback</a>
          <button type="button">
            Multi-session disabled
            <Caret />
          </button>
          <button type="button">
            English
            <Caret />
          </button>
        </div>
      </header>

      <div className={styles.logoWrap}>
        <Image
          src="/assets/aws-logo-dark.svg"
          alt="aws"
          width={76}
          height={30}
          priority
          className={styles.logo}
        />
      </div>

      <main className={styles.shell}>
        <div className={styles.columns}>
          <div className={styles.leftCol}>
            <section className={styles.signInCard} aria-label="Sign in">
              <h1 className={styles.title}>Sign In</h1>
              <p className={styles.subtitle}>
                Access your AWS account by <a href="#">user type</a>.
              </p>

              <p className={styles.demoCred}>
                Demo: <strong>admin@example.com</strong> /{" "}
                <strong>password123</strong>
              </p>

              <p className={styles.userTypeLabel}>
                User type (<a href="#">not sure?</a>)
              </p>

              <div className={styles.radioGroup} role="radiogroup">
                <button
                  type="button"
                  role="radio"
                  aria-checked={userType === "root"}
                  className={`${styles.radioCard} ${
                    userType === "root" ? styles.radioCardSelected : ""
                  }`}
                  onClick={() => setUserType("root")}
                >
                  <span className={styles.radioDot} aria-hidden />
                  <span className={styles.radioText}>
                    <strong>Root user</strong>
                    <span>
                      Account owner that performs tasks requiring unrestricted
                      access.
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={userType === "iam"}
                  className={`${styles.radioCard} ${
                    userType === "iam" ? styles.radioCardSelected : ""
                  }`}
                  onClick={() => setUserType("iam")}
                >
                  <span className={styles.radioDot} aria-hidden />
                  <span className={styles.radioText}>
                    <strong>IAM user</strong>
                    <span>
                      User within an account that performs daily tasks.
                    </span>
                  </span>
                </button>
              </div>

              {error ? <div className={styles.error}>{error}</div> : null}

              {step === "email" ? (
                <form onSubmit={handleNext} className={styles.form}>
                  <label className={styles.label} htmlFor="login-email">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    className={styles.input}
                    type="email"
                    autoComplete="username"
                    placeholder="username@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit" className={styles.primaryBtn}>
                    Next
                  </button>
                  <div className={styles.orRow}>
                    <span>OR</span>
                  </div>
                  <button type="button" className={styles.secondaryBtn}>
                    New to AWS? Sign up
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className={styles.form}>
                  <label className={styles.label} htmlFor="login-email-2">
                    Email address
                  </label>
                  <input
                    id="login-email-2"
                    className={styles.input}
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label className={styles.label} htmlFor="login-password">
                    Password
                  </label>
                  <input
                    id="login-password"
                    className={styles.input}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={loading}
                  >
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                  <div className={styles.orRow}>
                    <span>OR</span>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setStep("email");
                      setError(null);
                    }}
                  >
                    Back
                  </button>
                </form>
              )}
            </section>

            <p className={styles.legal}>
              By continuing, you agree to{" "}
              <a href="#">AWS Customer Agreement</a> or other agreement for AWS
              services, and the <a href="#">Privacy Notice</a>. This site uses
              essential cookies. See our <a href="#">Cookie Notice</a> for more
              information.
            </p>
          </div>

          <aside className={styles.promoPane} aria-label="Amazon Quick">
            <Image
              src="/image.png"
              alt="Amazon Quick — Find answers instantly, automate repetitive work, and turn complex data into clear insights—all in one place."
              width={570}
              height={450}
              priority
              className={styles.promoImage}
              sizes="570px"
            />
          </aside>
        </div>
      </main>

      <footer className={styles.footer}>
        © 2026 Amazon Web Services, Inc. or its affiliates. All rights reserved.
      </footer>

      <button
        type="button"
        className={styles.terminalTab}
        aria-label="CloudShell"
      >
        &gt;_&lt;
      </button>
    </div>
  );
}

function Caret() {
  return <span className={styles.caret} aria-hidden />;
}

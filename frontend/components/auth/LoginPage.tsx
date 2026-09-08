"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  Form,
  FormField,
  Header,
  Input,
  SpaceBetween,
} from "@cloudscape-design/components";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api/client";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event?: FormEvent) => {
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
      <div className={styles.topNav}>
        <span className={styles.logo}>aws</span>
      </div>
      <div className={styles.card}>
        <form onSubmit={onSubmit}>
          <Form
            actions={
              <Button
                variant="primary"
                loading={loading}
                onClick={() => void onSubmit()}
              >
                Sign in
              </Button>
            }
          >
            <Container
              header={
                <Header
                  variant="h1"
                  description="Route 53 Clone — mocked authentication"
                >
                  Sign in
                </Header>
              }
            >
              <SpaceBetween size="l">
                {error ? <Alert type="error">{error}</Alert> : null}
                <Alert type="info">
                  Demo credentials: <b>admin@example.com</b> /{" "}
                  <b>password123</b>
                </Alert>
                <FormField label="Email">
                  <Input
                    value={email}
                    type="email"
                    onChange={({ detail }) => setEmail(detail.value)}
                  />
                </FormField>
                <FormField label="Password">
                  <Input
                    value={password}
                    type="password"
                    onChange={({ detail }) => setPassword(detail.value)}
                  />
                </FormField>
                <Box color="text-body-secondary" fontSize="body-s">
                  IAM, Organizations, and Billing are mocked for this
                  assessment.
                </Box>
              </SpaceBetween>
            </Container>
          </Form>
        </form>
      </div>
    </div>
  );
}

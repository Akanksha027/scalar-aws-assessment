"use client";

import Spinner from "@cloudscape-design/components/spinner";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) router.replace("/login");
    if (user && isLogin) router.replace("/hosted-zones");
  }, [user, loading, isLogin, router]);

  if (loading || (!user && !isLogin) || (user && isLogin)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f2f3f3",
        }}
      >
        <Spinner size="large" />
      </div>
    );
  }

  return <>{children}</>;
}

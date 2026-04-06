"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      let isValid = false;
      if (token) {
        try {
          const res = await fetch("/api/validate-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          isValid = data.valid;
        } catch {}
      }

      const isAuthPage =
        pathname.startsWith("/signin") || pathname.startsWith("/signup");

      if (isValid && isAuthPage) {
        router.replace("/home");
      } else if (!isValid && !isAuthPage) {
        router.replace("/signin");
      }

      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) return null;

  return <>{children}</>;
}

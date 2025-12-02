"use client";

import { useEffect } from "react";
import { initOneSignal } from "@/lib/onesignal";

export default function OneSignalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize OneSignal when app loads
    if (typeof window !== "undefined") {
      initOneSignal();
    }
  }, []);

  return <>{children}</>;
}

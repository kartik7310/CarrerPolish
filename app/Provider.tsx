"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, Suspense } from "react";
import AuthProvider from "./AuthProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Provider({ children }: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProvider client={convex}>
      <Suspense fallback={<div>Loading user...</div>}>
        <AuthProvider>{children}</AuthProvider>
      </Suspense>
    </ConvexProvider>
  );
}

"use client";

import dynamic from "next/dynamic";

const BookVault3D = dynamic(() => import("./BookVault3D"), {
  ssr: false,
  loading: () => (
    <div className="h-[min(72vw,620px)] min-h-[360px] w-full animate-pulse rounded-card border border-border bg-[#d9c8ae] p-6 shadow-sm">
      <div className="flex h-full items-center justify-center rounded-md border border-accent/30 bg-card/30 text-sm font-semibold text-primary">
        Preparing the BookVault preview...
      </div>
    </div>
  ),
});

export default function BookVault3DLoader() {
  return <BookVault3D />;
}
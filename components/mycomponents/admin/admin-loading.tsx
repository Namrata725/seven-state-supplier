"use client";

import { LoaderCircle } from "lucide-react";

type AdminLoadingProps = {
  text?: string;
};

export function AdminLoading({ text = "Loading..." }: AdminLoadingProps) {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin" />

        <span>{text}</span>
      </div>
    </div>
  );
}

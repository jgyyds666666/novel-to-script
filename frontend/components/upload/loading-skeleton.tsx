"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loading state for the chapter parsing page.
 * Shows placeholder chapter cards while AI analyzes the text.
 */
export function ParsingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary bar skeleton */}
      <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Chapter list heading */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />

        {/* Chapter cards */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border p-4 space-y-3"
            >
              {/* Chapter header */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-20" />
              </div>
              {/* Chapter summary lines */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-11/12" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              {/* Stats */}
              <div className="flex gap-3 pt-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between pt-4">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

/**
 * Skeleton loading state for the script generation page.
 * Shows placeholder preview while AI generates the screenplay.
 */
export function GenerateSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats banner skeleton */}
      <div className="rounded-lg bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Tabs + download button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-3 text-center space-y-1">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Summary block */}
        <div className="rounded-lg border p-4 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>

        {/* Character list */}
        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-4 w-20" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

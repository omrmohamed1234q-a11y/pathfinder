import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const SkillNodeSkeleton: React.FC = () => {
  return (
    <div className="glass rounded-2xl p-4 w-[200px]">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-12 h-12 rounded-xl bg-muted" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2 bg-muted" />
          <Skeleton className="h-3 w-16 bg-muted" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2 bg-muted" />
      <Skeleton className="h-3 w-3/4 bg-muted" />
    </div>
  );
};

export const SkillTreeSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 bg-muted" />
        <Skeleton className="h-10 w-32 bg-muted" />
      </div>

      {/* Stats Banner Skeleton */}
      <div className="glass rounded-2xl p-6">
        <div className="flex gap-6">
          <Skeleton className="h-20 w-32 bg-muted" />
          <Skeleton className="h-20 w-32 bg-muted" />
          <Skeleton className="h-20 w-32 bg-muted" />
        </div>
      </div>

      {/* Skill Nodes Skeleton */}
      <div className="flex flex-col items-center gap-6">
        <SkillNodeSkeleton />
        <div className="flex gap-6">
          <SkillNodeSkeleton />
          <SkillNodeSkeleton />
        </div>
        <div className="flex gap-6">
          <SkillNodeSkeleton />
          <SkillNodeSkeleton />
          <SkillNodeSkeleton />
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-xl bg-muted" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2 bg-muted" />
          <Skeleton className="h-4 w-48 bg-muted" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2 bg-muted" />
      <Skeleton className="h-4 w-3/4 bg-muted" />
    </div>
  );
};

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

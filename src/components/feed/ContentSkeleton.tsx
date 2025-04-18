import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const ContentSkeleton: React.FC = () => {
  return (
    <div className="h-[calc(100vh-10rem)] flex items-center justify-center">
      <div className="w-full max-w-md">
        <Skeleton className="h-8 w-3/4 mb-4 mx-auto" />
        <Skeleton className="h-48 w-full mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
};

export default ContentSkeleton;
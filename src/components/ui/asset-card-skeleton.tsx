import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

export function AssetCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-10 w-full rounded-md mt-4" />
      </CardContent>
    </Card>
  );
}

export function AssetGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AssetCardSkeleton key={i} />
      ))}
    </div>
  );
}


import { Skeleton } from "../ui/skeleton";
import { Card, CardTitle } from "../ui/card";

export function ChartSkeleton({ className }) {
  return (
    <Card className={className}>
      <CardTitle className="m-4">
        <Skeleton className="h-6 w-1/3 mx-auto" />
      </CardTitle>
      <div className="p-8">
        <Skeleton className="h-40 w-full" />
      </div>
    </Card>
  );
}

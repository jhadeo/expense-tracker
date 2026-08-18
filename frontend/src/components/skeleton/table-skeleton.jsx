import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader } from "../ui/card";
export function TableSkeleton({ showAction = false }) {
  return (
    <Card className={"h-full"}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          {showAction && <Skeleton className="h-8 w-28" />}
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full my-1" />
        <Skeleton className="h-4 w-full my-1" />
        <Skeleton className="h-4 w-full my-1" />
        <Skeleton className="h-4 w-full my-1" />
        <Skeleton className="h-4 w-full my-1" />
      </CardContent>
    </Card>
  );
}

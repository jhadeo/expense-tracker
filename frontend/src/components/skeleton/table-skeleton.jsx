import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader } from "../ui/card";
export function TableSkeleton() {
  return (
    <Card className={"h-full"}>
      <CardHeader>
        <Skeleton className="h-4 w-1/3" />
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

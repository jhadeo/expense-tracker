import { AlertCircle, RefreshCw } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ErrorCard({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  action,
  onRetry,
}) {
  return (
    <Card className="border-destructive">
      <CardHeader className="flex flex-row items-center gap-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <CardTitle className="text-destructive">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
        {!action && onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={onRetry}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
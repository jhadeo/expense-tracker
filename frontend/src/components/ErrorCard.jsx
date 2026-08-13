import { AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ErrorCard({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
}) {
  return (
    <Card className="border-destructive">
      <CardHeader className="flex flex-row items-center gap-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <CardTitle className="text-destructive">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
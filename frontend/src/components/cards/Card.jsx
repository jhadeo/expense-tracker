import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AppCard({ className, title, content }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {content && (
          <CardContent>
            {content}
          </CardContent>
        )}
      </CardContent>
    </Card>
  );
}

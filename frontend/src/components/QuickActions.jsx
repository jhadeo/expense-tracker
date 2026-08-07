import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";

export function QuickActions() {
  return (
    <Card className={"h-full"}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex gap-2">
          <ButtonGroup className={"w-full"}>
            <Button variant="outline" size="lg" className={"w-1/2 text-red-600"}>
              Add Expense
            </Button>
            <Button variant="outline" size="lg" className={"w-1/2 text-green-600"}>
              Add Income
            </Button>
          </ButtonGroup>
        </div>
      </CardContent>
    </Card>
  );
}

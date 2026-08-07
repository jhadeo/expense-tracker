import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SummaryCard({ title, amount, color }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className={`text-xl md:text-3xl font-bold ${color}`}>₱{amount}</p>
      </CardContent>
    </Card>
  );
}

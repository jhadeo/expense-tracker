import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MonthlyTableCard({ title, rows, className }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <Table className={"col-span-2 col-end-2"}>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Month</TableHead>
              <TableHead className="text-center">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.month}>
                <TableCell className="font-medium text-center">
                  {row?.month
                    ? new Date(row.month).toLocaleString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                      })
                    : ""}
                </TableCell>
                <TableCell
                  className={`text-center ${row?.income - row?.expenses < 0 ? "text-red-600" : "text-green-600"}`}
                >
                  ₱{row?.income - row?.expenses}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

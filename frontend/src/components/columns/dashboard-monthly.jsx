import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

const columnHelper = createColumnHelper();

export function getMonthlySummaryColumns() {
  const sortableHeader =
    (label) =>
    ({ column }) => (
      <Button variant="ghost" onClick={column.getToggleSortingHandler()}>
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );

  return columnHelper.columns([
    columnHelper.accessor("month", {
      header: sortableHeader("Month"),
    }),
    columnHelper.accessor((row) => row.income - row.expenses, {
      id: "net",
      header: sortableHeader("Net"),
      cell: ({ getValue }) => {
        const net = getValue();
        const isNegative = net < 0;

        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(Math.abs(net));

        return (
          <span className={isNegative ? "text-red-600" : "text-green-600"}>
            {isNegative ? "-" : "+"}
            {formatted}
          </span>
        );
      },
    }),
  ]);
}

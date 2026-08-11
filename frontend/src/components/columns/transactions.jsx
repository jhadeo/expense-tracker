import { createColumnHelper } from "@tanstack/react-table";
import { TransactionActions } from "../TransactionActions";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
const columnHelper = createColumnHelper();

export function getTransactionColumns({ type, onRefresh, categories }) {
  const sortableHeader =
    (label) =>
    ({ column }) => (
      <Button variant="ghost" onClick={column.getToggleSortingHandler()}>
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );

  return columnHelper.columns([
    columnHelper.accessor("title", {
      header: sortableHeader("Title"),
    }),
    columnHelper.accessor("amount", {
      header: sortableHeader("Amount"),
      cell: ({ getValue }) => {
        const amount = Number(getValue());

        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
      },
    }),
    columnHelper.accessor("category", {
      header: sortableHeader("Category"),
    }),
    columnHelper.accessor("date", {
      header: sortableHeader("Date"),
      cell: ({ getValue }) => {
        return new Date(getValue()).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <TransactionActions
          transaction={row.original}
          type={type}
          onRefresh={onRefresh}
          categories={categories}
        />
      ),
    }),
  ]);
}

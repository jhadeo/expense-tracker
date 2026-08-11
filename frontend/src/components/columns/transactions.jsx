import { createColumnHelper } from "@tanstack/react-table";
import { TransactionActions } from "../TransactionActions";
const columnHelper = createColumnHelper();

export function getTransactionColumns({ type, onRefresh, categories }) {
  return columnHelper.columns([
    columnHelper.accessor("title", {
      header: "Title",
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: ({ getValue }) => {
        const amount = Number(getValue());

        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
      },
    }),
    columnHelper.accessor("category", {
      header: "Category",
    }),
    columnHelper.accessor("date", {
      header: "Date",
      cell: ({ getValue }) => {
        return new Date(getValue()).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
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
        />
      ),
    }),
  ]);
}

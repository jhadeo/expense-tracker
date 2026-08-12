import { createColumnHelper } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
const columnHelper = createColumnHelper();

import { CategoryActions } from "../CategoryActions";

export function getCategoryColumns({ onRefresh }) {
  const sortableHeader =
    (label) =>
    ({ column }) => (
      <Button variant="ghost" onClick={column.getToggleSortingHandler()}>
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );

  return columnHelper.columns([
    columnHelper.accessor("name", {
      header: sortableHeader("Category"),
    }),
    columnHelper.accessor("type", {
      header: sortableHeader("Type"),
      cell: ({ getValue }) => (getValue() === "income" ? "Income" : "Expenses"),
    }),
    columnHelper.accessor("is_system", {
      header: sortableHeader("Source"),
      cell: ({ getValue }) => (getValue() ? "System" : "User"),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <CategoryActions category={row.original} onRefresh={onRefresh} disabled={row.original.is_system}/>
      ),
    }),
  ]);
}

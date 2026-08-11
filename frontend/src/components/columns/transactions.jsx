import { createColumnHelper } from "@tanstack/react-table";
import { buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import { Pencil, Trash2 } from "lucide-react";

const columnHelper = createColumnHelper();

export function getTransactionColumns() {
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
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8 p-0",
              })}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Pencil className="h-4 w-4"/>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4"/>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ]);
}

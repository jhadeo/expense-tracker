import { useState } from "react";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppDialog } from "@/components/AppDialog";
import { CategoryForm } from "./forms/CategoryForm";
import { deleteResource } from "@/api/transactions";

export function CategoryActions({ category, onRefresh, disabled }) {
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      deleteResource("categories", category.id)
      setOpenDelete(false);
      onRefresh?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ?? "Failed to delete. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
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
            <DropdownMenuItem
              onClick={() => setOpenEdit(true)}
              disabled={disabled}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setOpenDelete(true)}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AppDialog
        open={openDelete}
        onOpenChange={(next) => {
          if (!deleting) {
            setOpenDelete(next);
            if (!next) setError(null);
          }
        }}
        title="Delete category"
        description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
      >
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpenDelete(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </AppDialog>

      <AppDialog
        open={openEdit}
        onOpenChange={(next) => {
          setOpenEdit(next);

          if (!next) {
            setError(null);
          }
        }}
      >
        <CategoryForm
          title={`Edit ${category.name}`}
          onSuccess={onRefresh}
          onClose={() => setOpenEdit(false)}
          initialData={{
            id: category.id,
            name: category.name,
            type: category.type,
          }}
        />
      </AppDialog>
    </>
  );
}

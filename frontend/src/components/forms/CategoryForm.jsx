import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "../ui/spinner";

import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { categorySchema } from "@/schemas/categorySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/api/axios";

export function CategoryForm({ onSuccess, onClose, initialData }) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ?? {
      name: "",
      type: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const isEditing = !!initialData?.id;

  async function onSubmit(data) {
    let endpoint = "/categories";

    try {
      const request = isEditing
        ? api.patch(`${endpoint}/${initialData.id}`, data)
        : api.post(endpoint, data);

      await request;
      onSuccess?.();
      onClose?.();
      if (!isEditing) {
        reset();
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("root", {
          type: "server",
          message:
            "You are not authorized to perform this action."
        });
      }

      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors;

        Object.entries(serverErrors).forEach(([field, messages]) => {
          setError(field, {
            type: "server",
            message: messages[0],
          });
        });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Name</FieldLabel>
          <Input
            type="text"
            id="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="type">Category</FieldLabel>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem key={"income"} value={"income"}>
                    Income
                  </SelectItem>
                  <SelectItem key={"expenses"} value={"expenses"}>
                    Expenses
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && (
            <p className="text-sm text-red-600 text-center">
              {errors.type.message}
            </p>
          )}
        </Field>
      </FieldGroup>

      {errors.root && (
        <p className="text-sm text-red-600 text-center">
          {errors.root.message}
        </p>
      )}

      <DialogFooter className={"mt-4"}>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner />
              {isEditing ? "Saving..." : "Submitting..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "../ui/spinner";

import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { transactionSchema } from "@/schemas/transactionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleApiFormError } from "@/lib/utils";
import api from "@/api/axios";

export function TransactionForm({
  type,
  categories,
  onSuccess,
  onClose,
  initialData,
}) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData ?? {
      title: "",
      amount: undefined,
      date: new Date().toISOString().split("T")[0],
      category_id: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const systemCategories =
    categories
      ?.filter((category) => category.is_system && category.type === type)
      .map((category) => ({
        label: category.name,
        value: category.id.toString(),
      })) ?? [];

  const userCategories =
    categories
      ?.filter((category) => !category.is_system && category.type === type)
      .map((category) => ({
        label: category.name,
        value: category.id.toString(),
      })) ?? [];

  const allCategories = [
    { label: "Select a category", value: null },
    ...systemCategories,
    ...userCategories,
  ];

  const isEditing = !!initialData?.id;

  async function onSubmit(data) {
    let endpoint = "/expenses";
    if (type === "income") {
      endpoint = "/incomes";
    }

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
      handleApiFormError({
        error,
        setError,
        defaultMessage: "Transaction request failed. Please try again.",
        unauthorizedMessage:
          "You are not authorized to complete this transaction. Please relogin to try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            type="text"
            id="title"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="amount">Amount</FieldLabel>
          <Input
            type="number"
            id="amount"
            step="0.01"
            {...register("amount")}
            aria-invalid={!!errors.amount}
          />
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount.message}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="date">Date</FieldLabel>
          <Input
            type="date"
            id="date"
            {...register("date")}
            aria-invalid={!!errors.date}
          />
          {errors.date && (
            <p className="text-sm text-red-600">{errors.date.message}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <Select
                items={allCategories}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    <SelectLabel>System</SelectLabel>
                    {systemCategories.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>User</SelectLabel>

                    {userCategories?.length > 0 ? (
                      userCategories.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value.toString()}
                        >
                          {item.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-user-categories" disabled>
                        No user created categories.
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category_id && (
            <p className="text-sm text-red-600 text-center">
              {errors.category_id.message}
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
        <DialogClose
          render={
            <Button variant="outline" type="button">
              Cancel
            </Button>
          }
        />
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

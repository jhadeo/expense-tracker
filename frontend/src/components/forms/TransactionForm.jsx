import { Controller, useForm } from "react-hook-form";
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

import { transactionSchema } from "@/schemas/transactionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/api/axios";

export function TransactionForm({ type, categories, onSuccess, onClose }) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: "",
      amount: undefined,
      date: new Date().toISOString().split("T")[0],
      category_id: null,
    },
  });

  const systemCategories = categories
    ?.filter((category) => category.is_system && category.type == type)
    .map((category) => ({ label: category.name, value: category.id }));

  const userCategories = categories
    ?.filter((category) => !category.is_system && category.type == type)
    .map((category) => ({ label: category.name, value: category.id }));

  const allCategories = [
    { label: "Select a category", value: null },
    ...systemCategories,
    ...userCategories,
  ];

  async function onSubmit(data) {
    let endpoint = "/expenses";
    if (type === "income") {
      endpoint = "/incomes";
    }

    try {
      await api.post(endpoint, data);
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      if (error.response?.status === 401) {
        setError("root", {
          type: "server",
          message:
            "You are not authorized to complete this transaction. Please relogin to try again.",
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
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner /> Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

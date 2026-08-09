import { useState } from "react";
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

export default function ExpenseForm({ categories }) {
  const [expense, setExpense] = useState({
    title: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    category_id: 0,
  });

  const systemCategories = categories
    ?.filter((category) => category.is_system && category.type == "income")
    .map((category) => ({ label: category.name, value: category.id }));

  const userCategories = categories
    ?.filter((category) => !category.is_system && category.type == "income")
    .map((category) => ({ label: category.name, value: category.id }));

  const allCategories = [
    { label: "Select a category", value: null },
    ...systemCategories,
    ...userCategories,
  ];

  const handleChange = (e) => {
    setExpense({
      ...expense,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            type="text"
            name="title"
            id="title"
            onChange={handleChange}
            value={expense.title}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="amount">Amount</FieldLabel>
          <Input
            type="number"
            name="amount"
            id="amount"
            step="0.01"
            onChange={handleChange}
            value={expense.amount}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="date">Income Date</FieldLabel>
          <Input
            type="date"
            name="date"
            id="date"
            onChange={handleChange}
            value={expense.date}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="date">Category</FieldLabel>
          <Select items={allCategories}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
                    <SelectItem key={item.value} value={item.value}>
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
        </Field>
      </FieldGroup>
    </form>
  );
}

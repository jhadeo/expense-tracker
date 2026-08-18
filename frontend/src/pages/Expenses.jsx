import { useState, useEffect } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { getTransactionColumns } from "@/components/columns/transactions";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { ErrorCard } from "@/components/cards/ErrorCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SummaryCardSkeleton } from "@/components/skeleton/summarycard-skeleton";
import { TableSkeleton } from "@/components/skeleton/table-skeleton";
import { Button } from "@/components/ui/button";
import { AppDialog } from "@/components/AppDialog";
import { TransactionForm } from "@/components/forms/TransactionForm";

import api from "../api/axios";
export function Expenses() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenseOpen, setExpenseOpen] = useState(false);

  async function fetchExpensesPageData() {
    try {
      setError(null);
      const response = await api.get("/expenses");
      setData(response.data);
    } catch {
      setError("Unable to load expense data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const categoryResponse = await api.get("/categories");
      setCategories(categoryResponse.data);
    } catch (error) {
      console.error("Unable to load categories", error);
    }
  }

  useEffect(() => {
    fetchExpensesPageData();
    fetchCategories();
  }, []);

  function handleExpenseOpenChange(next) {
    setExpenseOpen(next);

    if (next) {
      fetchCategories();
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <div className="col-span-3">
          <TableSkeleton showAction />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Unable to load expense data"
        message="Please try again later."
        onRetry={fetchExpensesPageData}
      />
    );
  }

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
      <SummaryCard
        title={"Total Expenses"}
        amount={`₱${data.summary.sum}`}
        color={"text-red-600"}
      />
      <SummaryCard
        title={"Expense this week"}
        amount={`₱${data.summary.this_week}`}
        color={"text-red-600"}
      />
      <SummaryCard
        title={"Expense this month"}
        amount={`₱${data.summary.this_month}`}
        color={"text-red-600"}
      />

      <Card className={"col-span-3"}>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Your Expenses</CardTitle>
            <AppDialog
              open={expenseOpen}
              onOpenChange={handleExpenseOpenChange}
              trigger={<Button>Add Expense</Button>}
              title={"Add expense"}
              description="Create a new expense."
            >
              <TransactionForm
                type={"expenses"}
                categories={categories.data}
                onSuccess={fetchExpensesPageData}
                onClose={() => setExpenseOpen(false)}
              />
            </AppDialog>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data.data}
            columns={getTransactionColumns({
              type: "expenses",
              onRefresh: fetchExpensesPageData,
              categories: categories.data,
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

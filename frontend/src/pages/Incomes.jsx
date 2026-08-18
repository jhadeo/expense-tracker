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
export function Incomes() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incomeOpen, setIncomeOpen] = useState(false);

  async function fetchIncomesPageData() {
    try {
      setError(null);
      const response = await api.get("/incomes");
      setData(response.data);
    } catch {
      setError("Unable to load income data. Please try again.");
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
    fetchIncomesPageData();
    fetchCategories();
  }, []);

  function handleIncomeOpenChange(next) {
    setIncomeOpen(next);

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
        title="Unable to load income data"
        message="Please try again later."
        onRetry={fetchIncomesPageData}
      />
    );
  }

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
      <SummaryCard
        title={"Total Income"}
        amount={`₱${data.summary.sum}`}
        color={"text-green-600"}
      />
      <SummaryCard
        title={"Income this week"}
        amount={`₱${data.summary.this_week}`}
        color={"text-green-600"}
      />
      <SummaryCard
        title={"Income this month"}
        amount={`₱${data.summary.this_month}`}
        color={"text-green-600"}
      />

      <Card className={"col-span-3"}>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Your Income</CardTitle>
            <AppDialog
              open={incomeOpen}
              onOpenChange={handleIncomeOpenChange}
              trigger={<Button>Add Income</Button>}
              title={"Add income"}
              description="Create a new income."
            >
              <TransactionForm
                type={"income"}
                request={"create"}
                categories={categories.data}
                onSuccess={fetchIncomesPageData}
                onClose={() => setIncomeOpen(false)}
              />
            </AppDialog>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data.data}
            columns={getTransactionColumns({
              type: "income",
              onRefresh: fetchIncomesPageData,
              categories: categories.data,
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

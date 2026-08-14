import { useState,useEffect } from "react";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { TableCard } from "@/components/tables/TableCard";
import { AppCard } from "@/components/cards/Card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { AppDialog } from "@/components/AppDialog";
import { DialogClose } from "@/components/ui/dialog";
import { ErrorCard } from "@/components/cards/ErrorCard";

import { TransactionForm } from "@/components/forms/TransactionForm";

import { SummaryCardSkeleton } from "@/components/skeleton/summarycard-skeleton";
import { TableSkeleton } from "@/components/skeleton/table-skeleton";

import api from "../api/axios";

export function Dashboard() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  async function fetchDashboard() {
    try {
      const response = await api.get("/dashboard");

      setDashboardError(null);
      setData(response.data.data);
    } catch (error) {
      setDashboardError(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const categoryResponse = await api.get("/categories");
      setCategories(categoryResponse.data.data);
    } catch (error) {
      console.error("Unable to load categories", error);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  function handleExpenseOpenChange(next) {
    setExpenseOpen(next);

    if (next) {
      fetchCategories();
    }
  }

  function handleIncomeOpenChange(next) {
    setIncomeOpen(next);

    if (next) {
      fetchCategories();
    }
  }

  const recentHeaders = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => `₱${row.amount}`,
    },
    {
      key: "date",
      label: "Date",
      render: (row) =>
        new Date(row.date).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        }),
    },
  ];

  const monthlyHeaders = [
    {
      key: "month",
      label: "Month",
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => (
        <span
          className={
            row.income - row.expenses < 0 ? "text-red-600" : "text-green-600"
          }
        >
          {row.income - row.expenses < 0 ? "-₱" : "+₱"}
          {Math.abs(row.income - row.expenses)}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
        <div className="col-span-3">
          <SummaryCardSkeleton />
        </div>

        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />

        <div className="row-span-2">
          <TableSkeleton />
        </div>

        <div className="col-span-2">
          <TableSkeleton />
        </div>
        <div className="col-span-2">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <ErrorCard
        title="Unable to load dashboard data"
        message="Please try again later."
      />
    );
  }

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
      <AppCard
        title="Quick Actions"
        className={"col-span-3 h-full"}
        content={
          <div className="flex gap-2">
            <ButtonGroup className={"w-full"}>
              <AppDialog
                open={expenseOpen}
                onOpenChange={handleExpenseOpenChange}
                trigger={
                  <Button
                    variant="outline"
                    size="lg"
                    className={"w-1/2 text-red-600"}
                  >
                    Add Expense
                  </Button>
                }
                title={"Add an expense"}
                description="Create a new expense."
                footer={
                  <>
                    <DialogClose
                      render={<Button variant="outline">Cancel</Button>}
                    />
                    <Button type="submit">Save</Button>
                  </>
                }
              >
                <TransactionForm
                  type={"expenses"}
                  categories={categories}
                  onSuccess={fetchDashboard}
                  onClose={() => setExpenseOpen(false)}
                />
              </AppDialog>
              <AppDialog
                open={incomeOpen}
                onOpenChange={handleIncomeOpenChange}
                trigger={
                  <Button
                    variant="outline"
                    size="lg"
                    className={"w-1/2 text-green-600"}
                  >
                    Add Income
                  </Button>
                }
                title={"Add income"}
                description="Create a new income."
              >
                <TransactionForm
                  type={"income"}
                  categories={categories}
                  onSuccess={fetchDashboard}
                  onClose={() => setIncomeOpen(false)}
                />
              </AppDialog>
            </ButtonGroup>
          </div>
        }
      />

      <SummaryCard
        title="Your Balance"
        amount={`${data?.balance < 0 ? "-₱" : "₱"}${Math.abs(data.balance)}`}
        color={data?.balance > 0 ? "text-green-600" : "text-red-600"}
      />
      <SummaryCard
        title="Total Income"
        amount={`₱${data?.total_income}`}
        color="text-green-600"
      />
      <SummaryCard
        title="Total Expenses"
        amount={`₱${data?.total_expenses}`}
        color="text-red-600"
      />

      <TableCard
        title={"Monthly Summary"}
        rows={data?.monthly_summary}
        headers={monthlyHeaders}
        className="row-span-2"
      />

      <TableCard
        title={"Recent Incomes"}
        rows={data?.recent_incomes}
        headers={recentHeaders}
        className="col-span-2"
      />
      <TableCard
        title={"Recent Expenses"}
        rows={data?.recent_expenses}
        headers={recentHeaders}
        className="col-span-2"
      />
    </div>
  );
}

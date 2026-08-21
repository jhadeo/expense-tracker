import { useState, useEffect } from "react";
import { SummaryCard } from "@/components/cards/SummaryCard";
import { TableCard } from "@/components/tables/TableCard";
import { DataTable } from "@/components/tables/DataTable";
import { getMonthlySummaryColumns } from "@/components/columns/dashboard-monthly";
import { AppCard } from "@/components/cards/Card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { AppDialog } from "@/components/AppDialog";
import { DialogClose } from "@/components/ui/dialog";
import { ErrorCard } from "@/components/cards/ErrorCard";

import { TransactionForm } from "@/components/forms/TransactionForm";

import { SummaryCardSkeleton } from "@/components/skeleton/summarycard-skeleton";
import { TableSkeleton } from "@/components/skeleton/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";

import api from "../api/axios";

export function Dashboard() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  async function fetchDashboard(page = 1) {
    try {
      const response = await api.get(`/dashboard?page=${page}`);

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

  function handlePageChange(page) {
    fetchDashboard(page);
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

  if (loading) {
    return (
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
        <Card className="col-span-3 h-full">
          <CardHeader>
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <div className="flex gap-2 p-4">
            <Skeleton className="h-9 w-1/2" />
            <Skeleton className="h-9 w-1/2" />
          </div>
        </Card>

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
        onRetry={fetchDashboard}
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

      <AppCard
        title={"Monthly Summary"}
        className={"row-span-2"}
        content={
          <DataTable
            data={data?.monthly_summary.data}
            columns={getMonthlySummaryColumns()}
            serverPagination
            currentPage={data?.monthly_summary.current_page}
            lastPage={data?.monthly_summary.last_page}
            onPageChange={handlePageChange}
          />
        }
      ></AppCard>
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

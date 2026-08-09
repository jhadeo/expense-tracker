import { useState, useEffect } from "react";
import { SummaryCard } from "@/components/SummaryCard";
import { TableCard } from "@/components/TableCard";
import { AppCard } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { AppDialog } from "@/components/AppDialog";
import { DialogClose } from "@/components/ui/dialog";
import ExpenseForm from "@/components/forms/ExpenseForm";
import IncomeForm from "@/components/forms/IncomeForm";

import api from "../api/axios";

export function Dashboard() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get("/dashboard");
        const categoryResponse = await api.get("/categories");
        setCategories(categoryResponse.data.data);
        setData(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
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

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
      <AppCard
        title="Quick Actions"
        className={"col-span-3 h-full"}
        content={
          <div className="flex gap-2">
            <ButtonGroup className={"w-full"}>
              <AppDialog
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
                    <Button>Save</Button>
                  </>
                }
              >
                <ExpenseForm categories={categories}></ExpenseForm>
              </AppDialog>
              <AppDialog
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
                footer={
                  <>
                    <DialogClose
                      render={<Button variant="outline">Cancel</Button>}
                    />
                    <Button>Save</Button>
                  </>
                }
              >
                <IncomeForm categories={categories}></IncomeForm>
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

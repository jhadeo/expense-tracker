import { useState, useEffect } from "react";
import { SummaryCard } from "@/components/SummaryCard";
import { TableCard } from "@/components/TableCard";
import { QuickActions } from "@/components/QuickActions";

import api from "../api/axios";

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get("/dashboard");
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
    <div className="p-6 flex flex-col md:grid md:grid-cols-3 gap-4 bg-muted">
      <QuickActions className={"col-span-3 h-full"}></QuickActions>

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

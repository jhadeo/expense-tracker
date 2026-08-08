import { useState, useEffect } from "react";
import { SummaryCard } from "@/components/SummaryCard";
import { TableCard } from "@/components/TableCard";
import { MonthlyTableCard } from "@/components/MonthlyTableCard";
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
  return (
    <div className="p-4 flex flex-col md:grid md:grid-cols-3 gap-4">
      <QuickActions className={"col-span-3 h-full"}></QuickActions>

      <SummaryCard
        title="Your Balance"
        amount={data?.balance}
        color={data?.balance > 0 ? "text-green-600" : "text-red-600"}
      />
      <SummaryCard
        title="Total Income"
        amount={data?.total_income}
        color="text-green-600"
      />
      <SummaryCard
        title="Total Expenses"
        amount={data?.total_expenses}
        color="text-red-600"
      />

      <MonthlyTableCard
        title={"Monthly Summary"}
        rows={data?.monthly_summary}
        className="row-span-2"
      />

      <TableCard
        title={"Recent Incomes"}
        rows={data?.recent_incomes}
        className="col-span-2"
      />
      <TableCard
        title={"Recent Expenses"}
        rows={data?.recent_expenses}
        className="col-span-2"
      />
    </div>
  );
}

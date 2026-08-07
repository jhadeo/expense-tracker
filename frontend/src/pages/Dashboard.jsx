import { useState, useEffect } from "react";
import { SummaryCard } from "@/components/SummaryCard";
import { TableCard } from "@/components/TableCard";
import { MonthlyTableCard } from "@/components/MonthlyTableCard";

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
      <div className="row-span-2">
        <MonthlyTableCard title={"Monthly Summary"} rows={data?.monthly_summary} />
      </div>
      <div className="col-span-2">
        <TableCard title={"Recent Incomes"} rows={data?.recent_incomes} />
      </div>
      <div className="col-span-2">
        <TableCard title={"Recent Expenses"} rows={data?.recent_expenses} />
      </div>
    </div>
  );
}

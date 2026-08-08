import { useState, useEffect } from "react";
import { TableCard } from "@/components/TableCard";
import { SummaryCard } from "@/components/SummaryCard";

import api from "../api/axios";
export function Incomes() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchIncomes() {
      try {
        const response = await api.get("/incomes");
        setData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchIncomes();
  }, []);

  const headers = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "category",
      label: "Category",
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
    {
      key: "amount",
      label: "Amount",
      render: (row) => `₱${row.amount}`,
    },
  ];

  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
      <SummaryCard
        title={"Total Income"}
        amount={`₱${data.sum}`}
        color={"text-green-600"}
      />
      <SummaryCard
        title={"Income this week"}
        amount={`₱${data.this_week}`}
        color={"text-green-600"}
      />
      <SummaryCard
        title={"Income this month"}
        amount={`₱${data.this_month}`}
        color={"text-green-600"}
      />
      <TableCard
        className={"col-span-3"}
        title={"Income"}
        rows={data.data}
        headers={headers}
      />
    </div>
  );
}

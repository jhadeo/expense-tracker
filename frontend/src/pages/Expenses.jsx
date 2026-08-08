import { useState, useEffect } from "react";
import { TableCard } from "@/components/TableCard";


import api from "../api/axios";
export function Expenses() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await api.get("/expenses");
        setData(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
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
    <div className="p-4 flex flex-col md:grid md:grid-cols-3 gap-4">
      <TableCard
        className={"col-span-3"}
        title={"Expenses"}
        rows={data}
        headers={headers}
      ></TableCard>
    </div>
  );
}

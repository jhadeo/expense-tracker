import { useState, useEffect } from "react";
import { SummaryCard } from "@/components/SummaryCard";
import { TableCard } from "@/components/TableCard";
import { MonthlyTableCard } from "@/components/MonthlyTableCard";
import { QuickActions } from "@/components/QuickActions";

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

  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <div className="p-4 flex flex-col md:grid md:grid-cols-3 gap-4">
        
    </div>
  );
}

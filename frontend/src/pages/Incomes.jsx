import { useState, useEffect } from "react";
import { DataTable } from "@/components/DataTable";
import { getTransactionColumns } from "@/components/columns/transactions";
import { SummaryCard } from "@/components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SummaryCardSkeleton } from "@/components/skeleton/summarycard-skeleton";
import { TableSkeleton } from "@/components/skeleton/table-skeleton";

import api from "../api/axios";
export function Incomes() {
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchIncomes() {
    try {
      const response = await api.get("/incomes");
      setData(response.data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncomes();
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <div className="col-span-3">
          <TableSkeleton />
        </div>
      </div>
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
          <CardTitle>Your Income</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data.data}
            columns={getTransactionColumns({
              type: "income",
              onRefresh: fetchIncomes,
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

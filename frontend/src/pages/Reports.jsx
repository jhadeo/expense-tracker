import { useEffect, useState } from "react";
import { SummaryCardSkeleton } from "@/components/skeleton/summarycard-skeleton";
import { TableSkeleton } from "@/components/skeleton/table-skeleton";
import { ChartSkeleton } from "@/components/skeleton/chart-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/api/axios";
import { Card, CardTitle } from "@/components/ui/card";
import { ErrorCard } from "@/components/cards/ErrorCard";

import { SummaryCard } from "@/components/cards/SummaryCard";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { Button } from "@/components/ui/button";
import { getReportColumns } from "@/components/columns/report-monthly";
import { DataTable } from "@/components/tables/DataTable";

export function Reports() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState("all");

  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const currentYear = new Date().getFullYear();
  const monthLabel = months.find((item) => item.value === month)?.label;
  const selectedMonthLabel =
    months.find((item) => item.value === month)?.label ?? "Select month";

  const years = Array.from({ length: 6 }, (_, index) => {
    const year = currentYear - index;

    return {
      label: year.toString(),
      value: year,
    };
  });

  const selectedYearLabel =
    years.find((item) => item.value === year)?.label ?? "Select year";

    async function fetchReport() {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/reports/monthly", {
        params: {
          month,
          year,
        },
      });

      setData(response.data.data);
    } catch {
      setError("Unable to load report. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  if (loading) {
    return (
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
        <Card className="flex flex-row justify-center-safe gap-2 p-4 col-span-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-40" />
        </Card>

        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />

        <ChartSkeleton className="col-span-3" />

        <div className="col-span-3">
          <TableSkeleton showAction />
        </div>
      </div>
    );
  }
    if (error) {
    return (
      <ErrorCard
        title="Unable to load report"
        message="Please try again later."
        onRetry={fetchReport}
      />
    );
  }

  const rows =
    transactionFilter === "all"
      ? [...data.income, ...data.expenses]
      : transactionFilter === "income"
        ? data.income
        : data.expenses;
  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
      <Card className="flex flex-row justify-center-safe gap-2 p-4 col-span-3">
        <Select
          value={month.toString()}
          onValueChange={(value) => setMonth(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select month">
              {selectedMonthLabel}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year.toString()}
          onValueChange={(value) => setYear(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select year">
              {selectedYearLabel}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year.value} value={year.value.toString()}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <SummaryCard
        title={"Income"}
        color={"text-green-600"}
        amount={`₱${data.total_income}`}
      />
      <SummaryCard
        title={"Expenses"}
        color={"text-red-600"}
        amount={`₱${data.total_expenses}`}
      />
      <SummaryCard
        title={"Balance"}
        amount={`${data?.balance < 0 ? "-₱" : "₱"}${Math.abs(data.balance)}`}
        color={data?.balance > 0 ? "text-green-600" : "text-red-600"}
      />

      <Card className="col-span-3">
        <CardTitle className="text-base md:text-2xl text-center m-4">
          Income vs Expenses
        </CardTitle>
        <div className="p-8">
          <IncomeExpenseChart report={data} />
        </div>
      </Card>

      <Card className="col-span-3 p-4">
        <CardTitle className="text-base md:text-2xl text-center m-4">
          Your transactions this {monthLabel} {year}
        </CardTitle>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <Button
              variant={transactionFilter === "all" ? "default" : "outline"}
              onClick={() => setTransactionFilter("all")}
            >
              All
            </Button>

            <Button
              variant={transactionFilter === "income" ? "default" : "outline"}
              onClick={() => setTransactionFilter("income")}
            >
              Income
            </Button>

            <Button
              variant={transactionFilter === "expenses" ? "default" : "outline"}
              onClick={() => setTransactionFilter("expenses")}
            >
              Expenses
            </Button>
          </div>
        </div>
        <DataTable data={rows} columns={getReportColumns()} />
      </Card>
    </div>
  );
}

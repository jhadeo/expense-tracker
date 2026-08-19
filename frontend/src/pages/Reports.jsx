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
import { getCategoryReportColumns } from "@/components/columns/report-category";
import { DataTable } from "@/components/tables/DataTable";

export function Reports() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({
    income: [],
    expenses: [],
    total_income: 0,
    total_expenses: 0,
    balance: 0,
  });
  const [reportLoading, setReportLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [reportError, setReportError] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [categoryId, setCategoryId] = useState(0);
  const [catReport, setCatReport] = useState(null);
  const [categoryReportLoading, setCategoryReportLoading] = useState(false);

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
    setReportLoading(true);
    setReportError(null);

    try {
      const response = await api.get("/reports/monthly", {
        params: {
          month,
          year,
        },
      });

      setData(response.data.data);
    } catch {
      setReportError("Unable to load report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  }

  async function fetchCategories() {
    setCategoriesLoading(true);
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data ?? []);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function fetchCategoryReport() {
    if (categoryId === 0) {
      setCatReport(null);
      return;
    }

    setCategoryReportLoading(true);
    try {
      const response = await api.get("/reports/category", {
        params: {
          id: categoryId,
          month,
          year,
        },
      });
      setCatReport(response.data.data);
    } catch {
      setCatReport(null);
    } finally {
      setCategoryReportLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategoryReport();
  }, [month, year, categoryId]);

  const isInitialLoading = reportLoading && categoriesLoading;

  if (isInitialLoading) {
    return (
      <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
        <Card className="flex flex-row justify-center-safe gap-2 p-4 md:p-6 col-span-3">
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
  if (reportError) {
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
      ? [...(data?.income ?? []), ...(data?.expenses ?? [])]
      : transactionFilter === "income"
        ? (data?.income ?? [])
        : (data?.expenses ?? []);

  const selectedCategory = categories.find(
    (category) => category.id === categoryId,
  );

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
      <Card className="flex flex-row justify-center-safe gap-2 p-4 md:p-6 col-span-3">
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

      <Card className="col-span-3 p-4 md:p-6">
        <CardTitle className="text-base md:text-2xl text-left">
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

      <Card className="col-span-3 p-4 md:p-6">
        <CardTitle className="text-base md:text-2xl text-left">
          Income vs Expenses
        </CardTitle>
        <div className="pt-4">
          <IncomeExpenseChart report={data} />
        </div>
      </Card>

      <Card className="col-span-3 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between w-full">
          <div className="space-y-1 text-center md:text-left">
            <CardTitle className="text-base md:text-2xl">
              Category Report
            </CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground">
              Review category performance for {monthLabel} {year}
            </p>
          </div>
          <Select
            value={selectedCategory ? selectedCategory.name : undefined}
            onValueChange={(value) => {
              const matchedCategory = categories.find(
                (category) => category.name === value,
              );

              setCategoryId(matchedCategory ? matchedCategory.id : 0);
            }}
          >
            <SelectTrigger className="bg-muted/20">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {categoryReportLoading ? (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : catReport ? (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Category
                </p>
                <p className="mt-1 text-base font-semibold md:text-lg">
                  {catReport.category.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {catReport.category.type}
                </p>
              </div>

              <div className="rounded-lg bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Transactions
                </p>
                <p className="mt-1 text-base font-semibold md:text-lg">
                  {catReport.transaction_count}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Records found for this period
                </p>
              </div>

              <div className="rounded-lg bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total Amount
                </p>
                <p className="mt-1 text-base font-semibold md:text-lg">
                  ₱{catReport.total_amount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sum of all category transactions
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-background p-2 md:p-3">
              <p className="px-2 pb-2 text-sm font-medium text-muted-foreground">
                Transaction Details
              </p>
              <DataTable
                data={catReport.transactions}
                columns={getCategoryReportColumns()}
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Select a category to view its report.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

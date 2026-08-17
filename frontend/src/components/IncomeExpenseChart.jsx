import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  income: {
    label: "Income",
  },
  expenses: {
    label: "Expenses",
  },
};

export function IncomeExpenseChart({ report }) {
  const chartData = [
    {
      type: "Income",
      amount: Number(report.total_income),
    },
    {
      type: "Expenses",
      amount: Number(report.total_expenses),
    },
  ];

  return (
    <ChartContainer config={chartConfig} className="h-40 w-full">
      <BarChart accessibilityLayer data={chartData} layout="vertical">
        <CartesianGrid horizontal={false} />

        <XAxis type="number" dataKey="amount" />

        <YAxis
          dataKey="type"
          type="category"
          tickLine={false}
          axisLine={false}
        />

        <ChartTooltip content={<ChartTooltipContent />} />

        <Bar dataKey="amount" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

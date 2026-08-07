import { useState, useEffect } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="p-4 grid grid-cols-4 gap-4">
       <Card className="col-span-4">
        <CardHeader className="pb-2">
          <CardTitle>Your Balance</CardTitle>
          <CardDescription>
            This is the sum of all your income transactions deducted by the sum of all expense transactions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className={`text-3xl font-bold ${data.balance > 0 ? "text-green-600" : "text-red-600"}`}>
            ₱ {data?.balance}
          </p>
        </CardContent>
      </Card>
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Total Income</CardTitle>
          <CardDescription>
            This is the sum of all your income transactions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            ₱ {data?.total_income}
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Total Expenses</CardTitle>
          <CardDescription>
            This is the sum of all your expense transactions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold text-red-600">
            ₱ {data?.total_income}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

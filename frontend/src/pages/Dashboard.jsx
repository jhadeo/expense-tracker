import { useState, useEffect } from "react";
import api from "../api/axios";

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get("/dashboard");
        setData(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchDashboard();
    
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

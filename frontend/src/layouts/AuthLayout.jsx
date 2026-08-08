import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function AuthLayout() {
  return (
    <>
      <Navbar />

      <main className="bg-muted min-h-screen p-6">
        <Outlet />
      </main>
    </>
  );
}

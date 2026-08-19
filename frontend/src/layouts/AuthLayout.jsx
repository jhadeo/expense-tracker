import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout() {
  return (
    <>
      <Navbar />

      <main className="bg-muted min-h-screen p-6">
        <Outlet />
        <Toaster position="top-right"/>
      </main>
    </>
  );
}

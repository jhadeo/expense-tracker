import Navbar from "@/components/guest/Navbar";
import { Outlet } from "react-router-dom";
export default function GuestLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

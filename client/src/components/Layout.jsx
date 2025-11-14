import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen w-full bg-black">
      <Navbar />
      <Outlet /> {/* This renders the page content */}
    </div>
  );
}

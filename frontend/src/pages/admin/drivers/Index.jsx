import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminTopbar from "../components/AdminTopbar.jsx";
import DriverContent from "./DriverContent.jsx";
import DriverToolbar from "./DriverToolbar.jsx";
import "./driver.css";

export default function ManajemenDriver() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status");

  return (
    <div className="admin-page fleet-page driver-admin-layout">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="admin-content">
        <AdminTopbar setOpen={setSidebarOpen} />
        <main className="ndr-admin-main">
          <DriverToolbar
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
          />
          <DriverContent search={search} status={status} />
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminTopbar from "../components/AdminTopbar.jsx";

export default function DriverLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addedDrivers, setAddedDrivers] = useState([]);

  function addDriver(details) {
    setAddedDrivers(current => {
      // Continue the demo list after DRV-NOV-083.
      const id = `DRV-NOV-${String(84 + current.length).padStart(3, "0")}`;
      return [{ ...details, id, status: "available" }, ...current];
    });
  }

  return (
    <div className="admin-page fleet-page">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="admin-content">
        <AdminTopbar setOpen={setSidebarOpen} />
        <Outlet context={{ addedDrivers, addDriver }} />
      </div>
    </div>
  );
}

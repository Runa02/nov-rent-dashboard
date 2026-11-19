import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import DriverContent, { DriverStats } from "./DriverContent.jsx";
import DriverToolbar from "./DriverToolbar.jsx";

export default function ManajemenDriver() {
  const navigate = useNavigate();
  const { addedDrivers } = useOutletContext();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status");

  return (
        <main className="@container flex min-h-screen min-w-0 flex-col gap-[18px] bg-[#f8fafc] px-4 pt-[88px] pb-[25px] text-slate-900
          [--color-blue-600:#2863ef] min-[721px]:px-[34px] min-[721px]:pt-[98px] min-[721px]:pb-9">
          <header className="flex flex-col items-start gap-3 @min-[600px]:flex-row @min-[600px]:items-center @min-[600px]:justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-[7px] text-[8px] font-bold tracking-wider text-blue-600">OPERASIONAL RENTAL</p>
              <h1 className="text-[25px] leading-[1.2] font-extrabold tracking-[-0.6px]">Manajemen Driver</h1>
              <p className="mt-[7px] text-[11px] text-slate-500">
                Kelola data pengemudi, pantau status ketersediaan, dan atur penugasan driver NOV Rent.
              </p>
            </div>
            <button type="button" onClick={() => navigate("/admin/drivers/create")}
              className="inline-flex min-h-[35px] shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-blue-600 px-[13px] text-[10px] font-bold text-white shadow-sm hover:bg-blue-700">
              <Plus size={15} /> Tambah Sopir Baru
            </button>
          </header>
          <DriverStats />
          <DriverToolbar search={search} setSearch={setSearch} status={status} setStatus={setStatus} />
          <DriverContent search={search} status={status} addedDrivers={addedDrivers} />
        </main>
  );
}

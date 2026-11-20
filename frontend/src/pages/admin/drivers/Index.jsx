import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../config/firebase.js";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminTopbar from "../components/AdminTopbar.jsx";
import DatabaseLoading from "../components/DatabaseLoading.jsx";
import {
  ArrowRight,
  ArrowUpRight,
  CarFront,
  ChevronDown,
  Circle,
  Clock3,
  Download,
  Funnel,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Radio,
  Search,
  Smile,
  UserRound,
} from "lucide-react";

export const driverStatuses = {
  available: {
    label: "Siap Jalan",
    detail: "Tersedia untuk order",
    tone: "border-emerald-100 bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
  },
  working: {
    label: "Sedang Bertugas",
    detail: "Dalam penugasan",
    tone: "border-blue-100 bg-blue-50 text-blue-600",
    dot: "bg-blue-600",
  },
  leave: {
    label: "Cuti / Libur",
    detail: "Izin / Masa Rehat",
    tone: "border-amber-100 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  inactive: {
    label: "Nonaktif",
    detail: "Suspensi / Terminasi",
    tone: "border-slate-200 bg-slate-50 text-slate-500",
    dot: "bg-slate-400",
  },
};

export function readDriver(snapshot) {
  const data = snapshot.data();
  const status = Object.entries(driverStatuses).find(
    ([key, option]) =>
      key === data.status ||
      option.label.toLowerCase() === String(data.status).toLowerCase(),
  );
  return {
    ...data,
    id: snapshot.id,
    name: data.name || data.legalName || data.fullName || snapshot.id,
    status: status?.[0] || "inactive",
    photo: data.photo || data.photoUrl || null,
  };
}

function subscribeDrivers(onData, onError) {
  return onSnapshot(
    collection(db, "drivers"),
    (snapshot) => {
      const records = snapshot.docs.map(readDriver);
      records.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0) ||
          b.id.localeCompare(a.id),
      );
      onData(records);
    },
    onError,
  );
}

export function DriverPage({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <div className="admin-page fleet-page">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="admin-content">
        <AdminTopbar setOpen={setSidebarOpen} />
        {user === undefined ? (
          <DatabaseLoading message="Memuat akun..." />
        ) : user ? (
          children
        ) : (
          <main className="px-6 pt-24 text-sm">
            <p>Masuk dengan akun admin untuk mengakses data driver.</p>
            <Link className="mt-3 inline-block text-blue-600" to="/login">
              Masuk
            </Link>
          </main>
        )}
      </div>
    </div>
  );
}

const control =
  "flex min-h-[35px] items-center rounded-md border border-slate-100 bg-slate-50 text-slate-600";

function DriverToolbar({ search, setSearch, status, setStatus }) {
  function reset() {
    setSearch("");
    setStatus("Semua Status");
  }

  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm
      @min-[520px]:grid-cols-[minmax(0,1fr)_180px_85px]"
    >
      <label
        className={`${control} col-span-2 gap-[7px] px-2.5 focus-within:ring-2 focus-within:ring-blue-400 @min-[520px]:col-span-1`}
      >
        <Search size={15} className="shrink-0 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Cari nama atau ID driver"
          placeholder="Cari nama driver atau ID driver..."
          className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
        />
      </label>
      <div className="relative">
        <select
          aria-label="Filter status driver"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={`${control} h-full w-full cursor-pointer appearance-none pr-7 pl-[11px] text-[10px] font-medium`}
        >
          <option>Semua Status</option>
          <option>Siap Jalan</option>
          <option>Bertugas</option>
          <option>Cuti / Istirahat</option>
          <option>Nonaktif</option>
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
        />
      </div>
      <button
        type="button"
        onClick={reset}
        className={`${control} cursor-pointer justify-center gap-1.5 px-2.5 text-[10px] font-medium hover:bg-slate-100`}
      >
        <Funnel size={15} /> Reset
      </button>
    </div>
  );
}

const panel =
  "min-w-0 rounded-[9px] border border-slate-200 bg-white shadow-sm";
const heading = "text-[15px] leading-tight font-bold tracking-tight";
const blueBadge = "border-blue-100 bg-blue-50 text-blue-600";
const greenBadge = "border-emerald-100 bg-emerald-50 text-emerald-600";
const iconButton =
  "grid size-8 place-items-center rounded-full bg-blue-50 text-blue-600 disabled:cursor-not-allowed";

function Metric({ label, icon: Icon, value, unit, children, positive }) {
  return (
    <article className={`${panel} p-[15px]`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[9px] font-bold tracking-wide text-slate-500">
          {label}
        </span>
        <span className="grid size-6 place-items-center rounded-full bg-blue-50 text-blue-600">
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-2 flex items-baseline gap-1.5">
        <strong className="text-[23px] leading-tight font-bold tracking-tight">
          {value}
        </strong>
        <span
          className={
            positive
              ? "text-[11px] font-bold text-emerald-600"
              : "text-[11px] font-medium text-slate-500"
          }
        >
          {unit}
        </span>
      </p>
      <p
        className={`mt-[3px] flex items-center gap-1 text-[9px] ${positive ? "text-slate-500" : "text-emerald-600"}`}
      >
        {children}
      </p>
    </article>
  );
}

function DriverStats() {
  return (
    <section>
      <h2 className={`${heading} mb-3`}>Laporan Kinerja Minggu Ini</h2>
      <div className="grid gap-3 @min-[270px]:grid-cols-2">
        <Metric label="JAM KEMUDI" icon={Clock3} value="42" unit="Jam">
          <ArrowUpRight size={14} /> +14% beban stabil
        </Metric>
        <Metric
          label="KEPUASAN TAMU"
          icon={Smile}
          value="98%"
          unit="Puas"
          positive
        >
          Dari 64 ulasan tamu
        </Metric>
      </div>
    </section>
  );
}

function DriverCard({ driver }) {
  const working = driver.status === "working";
  const status = driverStatuses[driver.status];
  return (
    <article
      className={`${panel} relative p-[15px] hover:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
            <UserRound size={19} />
            <i
              className={`absolute right-0 bottom-0 size-3 rounded-full border-2 border-white ${status.dot}`}
            />
          </span>
          <div>
            <h3 className="text-[14px] leading-tight font-bold">
              <Link
                to={`/admin/drivers/${driver.id}/edit`}
                aria-label={`Edit data ${driver.name}`}
                className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-[9px]"
              >
                {driver.name}
              </Link>
            </h3>
            <p className="text-[10px] text-slate-400">{driver.id}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${status.tone}`}
        >
          <i className="size-2 rounded-full bg-current" /> {status.label}
        </span>
      </div>
      {working && driver.car && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-[11px]">
            <CarFront size={17} className="text-slate-500" />
            <strong className="font-semibold">{driver.car}</strong>
            <span className="rounded bg-slate-200 px-2.5 py-0.5 text-slate-600">
              {driver.plate}
            </span>
            <span className="ml-auto text-slate-500">
              {driver.transmission}
            </span>
          </div>
          {driver.from && driver.to && (
            <div className="mt-3 flex items-center gap-2 px-1 text-[11px] font-medium">
              <span className="flex items-center gap-1.5">
                <Circle size={13} strokeWidth={4} className="text-slate-500" />
                {driver.from}
              </span>
              <span className="relative h-0.5 flex-1 bg-blue-200">
                <ArrowRight
                  size={19}
                  className="absolute top-1/2 right-0 -translate-y-1/2 text-blue-600"
                />
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <MapPin size={16} />
                {driver.to}
              </span>
            </div>
          )}
        </>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2.5 text-[11px]">
        {working ? (
          <>
            <span className="flex items-center gap-2 text-slate-500">
              <UserRound size={17} />
              <span>
                {driver.guest ? (
                  <>
                    Tamu:{" "}
                    <strong className="font-semibold text-slate-800">
                      {driver.guest}
                    </strong>
                  </>
                ) : (
                  status.detail
                )}
              </span>
            </span>
            <div className="relative z-20 flex gap-2">
              <button
                type="button"
                disabled
                className={iconButton}
                title="Fitur telepon belum tersedia"
                aria-label="Telepon driver"
              >
                <Phone size={16} />
              </button>
              <button
                type="button"
                disabled
                className={iconButton}
                title="Fitur navigasi belum tersedia"
                aria-label="Navigasi driver"
              >
                <Navigation size={16} />
              </button>
            </div>
          </>
        ) : (
          <span
            className={`flex items-center gap-1.5 ${driver.status === "available" ? "text-emerald-600" : "text-slate-500"}`}
          >
            <Clock3 size={14} /> {status.detail}
          </span>
        )}
      </div>
    </article>
  );
}

function ScheduleRow({ initials, name, route, children, time, standby }) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1.5 p-[15px] sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="grid size-8 place-items-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600">
        {initials}
      </span>
      <div className="space-y-0.5">
        <h3 className="text-[13px] leading-4 font-bold">{name}</h3>
        <p className="text-[11px] text-slate-500">{route}</p>
        <p className="text-[10px] text-slate-400">{children}</p>
      </div>
      <span
        className={`col-start-2 w-fit self-center rounded-md border px-2 py-1 text-[10px] font-medium sm:col-auto ${standby ? greenBadge : blueBadge}`}
      >
        {time}
      </span>
    </li>
  );
}

function DriverContent({ search = "", status = "Semua Status", drivers }) {
  const keyword = search.toLowerCase().trim();
  const statusMap = {
    "Siap Jalan": "available",
    Bertugas: "working",
    "Cuti / Istirahat": "leave",
    Nonaktif: "inactive",
  };
  const visible = drivers.filter((driver) => {
    const textMatches = `${driver.name} ${driver.id}`
      .toLowerCase()
      .includes(keyword);
    const statusMatches =
      status === "Semua Status" || driver.status === statusMap[status];
    return textMatches && statusMatches;
  });

  return (
    <>
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className={heading}>Status Pengemudi Aktif</h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${blueBadge}`}
          >
            Live Dispatch <Radio size={15} />
          </span>
        </div>
        <div className="grid items-start gap-3 @min-[650px]:grid-cols-2">
          {visible.map((driver) => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
          {visible.length === 0 && (
            <p
              className={`${panel} col-span-full p-5 text-[12px] text-center text-slate-500`}
            >
              Tidak ada driver yang sesuai dengan pencarian atau filter.
            </p>
          )}
        </div>
      </section>
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className={heading}>Jadwal Pendampingan Tamu Hari Ini</h2>
          <span className="text-[11px] text-slate-500">2 Rute Berjalan</span>
        </div>
        <ul className={`${panel} divide-y divide-slate-100`}>
          <ScheduleRow
            initials="BS"
            name="Budi Santoso"
            route="Surabaya City Tour (House of Sampoerna • Tunjungan Plaza)"
            time="08:00 – 18:00"
          >
            Driver pendamping:{" "}
            <span className="text-slate-600">Hendra Wijaya</span>
          </ScheduleRow>
          <ScheduleRow
            initials="SM"
            name="Sarah Melinda"
            route="Penjemputan Bandara Juanda T2 → Hotel Majapahit"
            time="Standby 14:30"
            standby
          >
            Konfirmasi penerbangan tepat waktu
          </ScheduleRow>
        </ul>
      </section>
      <button
        type="button"
        disabled
        title="Fitur ekspor belum tersedia"
        className={`${panel} flex min-h-[36px] w-full items-center justify-center gap-2 px-3 text-[11px] font-semibold text-slate-700 disabled:cursor-not-allowed`}
      >
        <Download size={15} /> Unduh Laporan Operasional (PDF / XLSX)
      </button>
    </>
  );
}

function DriverList() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status");

  useEffect(
    () => subscribeDrivers(setDrivers, (failure) => setError(failure.message)),
    [attempt],
  );

  if (error)
    return (
      <main className="px-6 pt-24 text-sm">
        <p role="alert">Data driver gagal dimuat. {error}</p>
        <button
          className="mt-3 text-blue-600"
          onClick={() => {
            setError("");
            setAttempt((value) => value + 1);
          }}
        >
          Coba lagi
        </button>
      </main>
    );
  if (!drivers) return <DatabaseLoading message="Memuat data driver..." />;
  return (
    <main
      className="@container flex min-h-screen min-w-0 flex-col gap-[18px] bg-[#f8fafc] px-4 pt-[88px] pb-[25px] text-slate-900
      [--color-blue-600:#2863ef] min-[721px]:px-[34px] min-[721px]:pt-[98px] min-[721px]:pb-9"
    >
      <header className="flex flex-col items-start gap-3 @min-[600px]:flex-row @min-[600px]:items-center @min-[600px]:justify-between">
        <div className="min-w-0 flex-1">
          <p className="mb-[7px] text-[8px] font-bold tracking-wider text-blue-600">
            OPERASIONAL RENTAL
          </p>
          <h1 className="text-[25px] leading-[1.2] font-extrabold tracking-[-0.6px]">
            Manajemen Driver
          </h1>
          <p className="mt-[7px] text-[11px] text-slate-500">
            Kelola data pengemudi, pantau status ketersediaan, dan atur
            penugasan driver NOV Rent.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/drivers/create")}
          className="inline-flex min-h-[35px] shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-blue-600 px-[13px] text-[10px] font-bold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={15} /> Tambah Sopir Baru
        </button>
      </header>
      <DriverStats />
      <DriverToolbar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />
      <DriverContent search={search} status={status} drivers={drivers} />
    </main>
  );
}

export default function ManajemenDriver() {
  return (
    <DriverPage>
      <DriverList />
    </DriverPage>
  );
}

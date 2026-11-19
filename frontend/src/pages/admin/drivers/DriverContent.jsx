import {
  ArrowRight, ArrowUpRight, CarFront, Circle, Clock3, Download, MapPin,
  Navigation, Phone, Radio, Smile, UserRound,
} from "lucide-react";

// Data contoh, belum terhubung langsung ke Firestore.
const drivers = [
  {
    id: "DRV-NOV-082",
    name: "Pak Hendra Wijaya",
    status: "working",
    car: "Mitsubishi Xpander",
    plate: "L 1892 NM",
    transmission: "Matic",
    from: "Surabaya",
    to: "Sidoarjo",
    guest: "Budi Santoso",
  },
  {
    id: "DRV-NOV-083",
    name: "Mas Dian Pratama",
    status: "available",
    car: "Toyota Innova Zenix",
    plate: "W 1042 QP",
    transmission: "Hybrid",
    standby: "Pool Hub Juanda Terminal 1",
  },
];

const panel = "min-w-0 rounded-[9px] border border-slate-200 bg-white shadow-sm";
const heading = "text-[15px] leading-tight font-bold tracking-tight";
const blueBadge = "border-blue-100 bg-blue-50 text-blue-600";
const greenBadge = "border-emerald-100 bg-emerald-50 text-emerald-600";
const iconButton = "grid size-8 place-items-center rounded-full bg-blue-50 text-blue-600 disabled:cursor-not-allowed";

function Metric({ label, icon: Icon, value, unit, children, positive }) {
  return (
    <article className={`${panel} p-[15px]`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[9px] font-bold tracking-wide text-slate-500">{label}</span>
        <span className="grid size-6 place-items-center rounded-full bg-blue-50 text-blue-600"><Icon size={16} /></span>
      </div>
      <p className="mt-2 flex items-baseline gap-1.5">
        <strong className="text-[23px] leading-tight font-bold tracking-tight">{value}</strong>
        <span className={positive ? "text-[11px] font-bold text-emerald-600" : "text-[11px] font-medium text-slate-500"}>{unit}</span>
      </p>
      <p className={`mt-[3px] flex items-center gap-1 text-[9px] ${positive ? "text-slate-500" : "text-emerald-600"}`}>{children}</p>
    </article>
  );
}

export function DriverStats() {
  return (
    <section>
      <h2 className={`${heading} mb-3`}>Laporan Kinerja Minggu Ini</h2>
      <div className="grid gap-3 @min-[270px]:grid-cols-2">
        <Metric label="JAM KEMUDI" icon={Clock3} value="42" unit="Jam">
          <ArrowUpRight size={14} /> +14% beban stabil
        </Metric>
        <Metric label="KEPUASAN TAMU" icon={Smile} value="98%" unit="Puas" positive>
          Dari 64 ulasan tamu
        </Metric>
      </div>
    </section>
  );
}

function DriverCard({ driver }) {
  const working = driver.status === "working";
  return (
    <article className={`${panel} p-[15px]`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
            <UserRound size={19} />
            <i className={`absolute right-0 bottom-0 size-3 rounded-full border-2 border-white ${working ? "bg-blue-600" : "bg-emerald-500"}`} />
          </span>
          <div>
            <h3 className="text-[14px] leading-tight font-bold">{driver.name}</h3>
            <p className="text-[10px] text-slate-400">{driver.id}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${working ? blueBadge : greenBadge}`}>
          <i className="size-2 rounded-full bg-current" /> {working ? "Sedang Bertugas" : "Siap Jalan"}
        </span>
      </div>
      {working && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-[11px]">
            <CarFront size={17} className="text-slate-500" />
            <strong className="font-semibold">{driver.car}</strong>
            <span className="rounded bg-slate-200 px-2.5 py-0.5 text-slate-600">{driver.plate}</span>
            <span className="ml-auto text-slate-500">{driver.transmission}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 px-1 text-[11px] font-medium">
            <span className="flex items-center gap-1.5"><Circle size={13} strokeWidth={4} className="text-slate-500" />{driver.from}</span>
            <span className="relative h-0.5 flex-1 bg-blue-200">
              <ArrowRight size={19} className="absolute top-1/2 right-0 -translate-y-1/2 text-blue-600" />
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600"><MapPin size={16} />{driver.to}</span>
          </div>
        </>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2.5 text-[11px]">
        {working ? (
          <>
            <span className="flex items-center gap-2 text-slate-500"><UserRound size={17} />
              <span>Tamu: <strong className="font-semibold text-slate-800">{driver.guest}</strong></span>
            </span>
            <div className="flex gap-2">
              <button type="button" disabled className={iconButton} title="Fitur telepon belum tersedia" aria-label="Telepon driver"><Phone size={16} /></button>
              <button type="button" disabled className={iconButton} title="Fitur navigasi belum tersedia" aria-label="Navigasi driver"><Navigation size={16} /></button>
            </div>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-emerald-600"><Clock3 size={14} /> Tersedia untuk order</span>
        )}
      </div>
    </article>
  );
}

function ScheduleRow({ initials, name, route, children, time, standby }) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1.5 p-[15px] sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="grid size-8 place-items-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-600">{initials}</span>
      <div className="space-y-0.5">
        <h3 className="text-[13px] leading-4 font-bold">{name}</h3>
        <p className="text-[11px] text-slate-500">{route}</p>
        <p className="text-[10px] text-slate-400">{children}</p>
      </div>
      <span className={`col-start-2 w-fit self-center rounded-md border px-2 py-1 text-[10px] font-medium sm:col-auto ${standby ? greenBadge : blueBadge}`}>{time}</span>
    </li>
  );
}

export default function DriverContent({ search = "", status = "Semua Status", addedDrivers = [] }) {
  const keyword = search.toLowerCase().trim();
  const statusMap = {
    "Siap Jalan": "available",
    Bertugas: "working",
    "Cuti / Istirahat": "leave",
    Nonaktif: "inactive",
  };
  const visible = [...addedDrivers, ...drivers].filter((driver) => {
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
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${blueBadge}`}>
            Live Dispatch <Radio size={15} />
          </span>
        </div>
        <div className="grid items-start gap-3 @min-[650px]:grid-cols-2">
          {visible.map(driver => <DriverCard key={driver.id} driver={driver} />)}
          {visible.length === 0 && <p className={`${panel} col-span-full p-5 text-[12px] text-center text-slate-500`}>Tidak ada driver yang sesuai dengan pencarian atau filter.</p>}
        </div>
      </section>
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className={heading}>Jadwal Pendampingan Tamu Hari Ini</h2>
          <span className="text-[11px] text-slate-500">2 Rute Berjalan</span>
        </div>
        <ul className={`${panel} divide-y divide-slate-100`}>
          <ScheduleRow initials="BS" name="Budi Santoso" route="Surabaya City Tour (House of Sampoerna • Tunjungan Plaza)" time="08:00 – 18:00">
            Driver pendamping: <span className="text-slate-600">Hendra Wijaya</span>
          </ScheduleRow>
          <ScheduleRow initials="SM" name="Sarah Melinda" route="Penjemputan Bandara Juanda T2 → Hotel Majapahit" time="Standby 14:30" standby>
            Konfirmasi penerbangan tepat waktu
          </ScheduleRow>
        </ul>
      </section>
      <button type="button" disabled title="Fitur ekspor belum tersedia"
        className={`${panel} flex min-h-[36px] w-full items-center justify-center gap-2 px-3 text-[11px] font-semibold text-slate-700 disabled:cursor-not-allowed`}>
        <Download size={15} /> Unduh Laporan Operasional (PDF / XLSX)
      </button>
    </>
  );
}

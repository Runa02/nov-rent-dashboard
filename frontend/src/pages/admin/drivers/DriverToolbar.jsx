import { ChevronDown, Funnel, Search } from "lucide-react";

const control = "flex min-h-[35px] items-center rounded-md border border-slate-100 bg-slate-50 text-slate-600";

export default function DriverToolbar({ search, setSearch, status, setStatus }) {
  function reset() {
    setSearch("");
    setStatus("Semua Status");
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm
      @min-[520px]:grid-cols-[minmax(0,1fr)_180px_85px]">
      <label className={`${control} col-span-2 gap-[7px] px-2.5 focus-within:ring-2 focus-within:ring-blue-400 @min-[520px]:col-span-1`}>
        <Search size={15} className="shrink-0 text-slate-400" />
        <input type="search" value={search} onChange={event => setSearch(event.target.value)}
          aria-label="Cari nama atau ID driver" placeholder="Cari nama driver atau ID driver..."
          className="w-full min-w-0 bg-transparent text-[10px] outline-none placeholder:text-slate-400" />
      </label>
      <div className="relative">
        <select aria-label="Filter status driver" value={status} onChange={event => setStatus(event.target.value)}
          className={`${control} h-full w-full cursor-pointer appearance-none pr-7 pl-[11px] text-[10px] font-medium`}>
          <option>Semua Status</option>
          <option>Siap Jalan</option>
          <option>Bertugas</option>
          <option>Cuti / Istirahat</option>
          <option>Nonaktif</option>
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400" />
      </div>
      <button type="button" onClick={reset} className={`${control} cursor-pointer justify-center gap-1.5 px-2.5 text-[10px] font-medium hover:bg-slate-100`}>
        <Funnel size={15} /> Reset
      </button>
    </div>
  );
}

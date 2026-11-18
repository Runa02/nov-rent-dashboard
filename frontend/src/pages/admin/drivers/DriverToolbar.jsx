import { Search, FilterX } from "lucide-react";

export default function DriverToolbar({
  search,
  setSearch,
  status,
  setStatus,
}) {
  const reset = () => {
    setSearch("");
    setStatus("Semua Status");
  };

  return (
    <>
      <header className="ndr-page-heading">
        <span className="ndr-eyebrow">OPERASIONAL RENTAL</span>
        <h1>Manajemen Driver</h1>
        <p>
          Kelola data pengemudi, pantau status ketersediaan, dan atur penugasan
          driver NOV Rent.
        </p>
      </header>

      <div className="ndr-toolbar">
        <label className="ndr-search">
          <Search size={19} aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari nama driver atau ID driver..."
            aria-label="Cari nama atau ID driver"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Filter status driver"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option>Semua Status</option>
          <option>Siap Jalan</option>
          <option>Bertugas</option>
          <option>Cuti / Istirahat</option>
          <option>Nonaktif</option>
        </select>
        <button className="ndr-reset" type="button" onClick={reset}>
          <FilterX size={17} /> Reset
        </button>
      </div>
    </>
  );
}

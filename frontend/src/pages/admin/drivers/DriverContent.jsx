import {
  ArrowRight,
  CarFront,
  CircleDot,
  Clock3,
  Download,
  MapPin,
  Navigation,
  Phone,
  Radio,
  Smile,
  TrendingUp,
  UserRoundPlus,
  UsersRound,
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

function DriverCard({ driver }) {
  const working = driver.status === "working";
  return (
    <article className="ndr-card">
      <div className="ndr-card-head">
        <div className="ndr-person">
          <div className="ndr-avatar">
            <UsersRound size={26} />
            <span className={`ndr-avatar-dot ${working ? "blue" : "green"}`} />
          </div>
          <div className="ndr-person-text">
            <strong>{driver.name}</strong>
            <small>{driver.id}</small>
          </div>
        </div>
        <span className={`ndr-status ${working ? "working" : "available"}`}>
          <i className={`ndr-dot ${working ? "blue" : "green"}`} />
          {working ? "Sedang Bertugas" : "Siap Jalan"}
        </span>
      </div>

      <div className="ndr-vehicle">
        <div className="ndr-car-line">
          <div className="ndr-car-name">
            <CarFront size={19} />
            <strong>{driver.car}</strong>
            <span className="ndr-plate">{driver.plate}</span>
          </div>
          <span className="ndr-transmission">{driver.transmission}</span>
        </div>
        {working ? (
          <div className="ndr-route">
            <span className="ndr-place">
              <CircleDot size={19} />
              {driver.from}
            </span>
            <div className="ndr-route-track">
              <ArrowRight size={24} />
            </div>
            <span className="ndr-place destination">
              <MapPin size={19} />
              {driver.to}
            </span>
          </div>
        ) : (
          <div className="ndr-standby">
            <MapPin size={19} />
            <span>
              Standby di: <strong>{driver.standby}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="ndr-card-foot">
        {working ? (
          <>
            <span className="ndr-foot-info">
              <UsersRound size={19} />
              <span>
                Tamu: <strong>{driver.guest}</strong>
              </span>
            </span>
            <div className="ndr-actions">
              <button
                type="button"
                disabled
                title="Fitur telepon belum tersedia"
                aria-label="Telepon driver"
              >
                <Phone size={19} />
              </button>
              <button
                type="button"
                disabled
                title="Fitur navigasi belum tersedia"
                aria-label="Navigasi driver"
              >
                <Navigation size={19} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="ndr-foot-info ready">
              <Clock3 size={19} />
              Tersedia untuk order
            </span>
            <button
              type="button"
              className="ndr-assign"
              disabled
              title="Fitur penugasan belum tersedia"
            >
              Tugaskan <ArrowRight size={17} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default function DriverContent({
  search = "",
  status = "Semua Status",
}) {
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
    <div className="ndr-page">
      <section className="ndr-section">
        <div className="ndr-section-head">
          <h2>Status Pengemudi Aktif</h2>
          <span className="ndr-live-label">
            Live Dispatch <Radio size={14} />
          </span>
        </div>
        <div className="ndr-card-grid">
          {visible.length ? (
            visible.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))
          ) : (
            <div className="ndr-empty">
              Tidak ada driver yang sesuai dengan pencarian atau filter.
            </div>
          )}
        </div>
      </section>

      <section className="ndr-section">
        <div className="ndr-section-head">
          <h2>Laporan Kinerja Minggu Ini</h2>
        </div>
        <div className="ndr-stats">
          <article className="ndr-stat">
            <div className="ndr-stat-title">
              <span>JAM KEMUDI</span>
              <Clock3 size={23} />
            </div>
            <p className="ndr-stat-number">
              42 <small>Jam</small>
            </p>
            <p className="ndr-stat-caption green">
              <TrendingUp size={19} />
              <span>+14% beban stabil</span>
            </p>
          </article>
          <article className="ndr-stat">
            <div className="ndr-stat-title">
              <span>KEPUASAN TAMU</span>
              <Smile size={23} />
            </div>
            <p className="ndr-stat-number">
              98% <small className="green">Puas</small>
            </p>
            <p className="ndr-stat-caption">Dari 64 ulasan tamu</p>
          </article>
        </div>
      </section>

      <section className="ndr-section">
        <div className="ndr-section-head">
          <h2>Jadwal Pendampingan Tamu Hari Ini</h2>
          <span className="ndr-subtle">2 Rute Berjalan</span>
        </div>
        <div className="ndr-schedules">
          <div className="ndr-schedule">
            <span className="ndr-schedule-avatar">BS</span>
            <div className="ndr-schedule-main">
              <strong>Budi Santoso</strong>
              <p>Surabaya City Tour (House of Sampoerna • Tunjungan Plaza)</p>
              <small>Driver pendamping: Hendra Wijaya</small>
            </div>
            <span className="ndr-time">08:00 – 18:00</span>
          </div>
          <div className="ndr-schedule">
            <span className="ndr-schedule-avatar">SM</span>
            <div className="ndr-schedule-main">
              <strong>Sarah Melinda</strong>
              <p>Penjemputan Bandara Juanda T2 → Hotel Majapahit</p>
              <small>Konfirmasi penerbangan tepat waktu</small>
            </div>
            <span className="ndr-time standby">Standby 14:30</span>
          </div>
        </div>
      </section>

      <div className="ndr-bottom-buttons">
        <button
          type="button"
          disabled
          title="Form tambah sopir belum tersedia"
          className="ndr-primary"
        >
          <UserRoundPlus size={18} /> + Tambah Sopir Baru
        </button>
        <button
          type="button"
          disabled
          title="Fitur ekspor belum tersedia"
          className="ndr-secondary"
        >
          <Download size={18} /> Unduh Laporan Operasional (PDF / XLSX)
        </button>
      </div>
    </div>
  );
}

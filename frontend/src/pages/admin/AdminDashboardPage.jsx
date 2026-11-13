import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  CircleUserRound,
  ClipboardCheck,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import Icon from "../../components/Icon.jsx";
import AdminSidebarComponent from "./components/AdminSidebar.jsx";
import AdminTopbarComponent from "./components/AdminTopbar.jsx";

const kpis = [
  [
    "TOTAL PENGADUAN",
    "1.428",
    "+12.4%",
    "Stabil vs bulan lalu",
    FileText,
    "green",
  ],
  [
    "PERLU VERIFIKASI SEGERA",
    "14",
    "SLA < 24 Jam",
    "4 Prioritas Mendesak",
    AlertCircle,
    "orange",
  ],
  [
    "SEDANG DIKERJAKAN",
    "34",
    "Dalam Pengerjaan",
    "8 Tim PUPR/Kesra",
    BriefcaseBusiness,
    "blue",
  ],
  [
    "SELESAI DITUNTASKAN",
    "1.380",
    "96.8% Tuntas",
    "Kepuasan 4.8/5",
    ClipboardCheck,
    "mint",
  ],
  [
    "RATA-RATA DURASI SLA",
    "2.3",
    "Hari",
    "Target SOP ≤ 3.0 Hari",
    Activity,
    "purple",
  ],
];
const bars = [
  { month: "Mei (184)", received: 245, done: 205 },
  { month: "Jun (210)", received: 285, done: 252 },
  { month: "Jul (230)", received: 325, done: 296 },
  { month: "Agu (255)", received: 372, done: 333 },
  { month: "Sep (280)", received: 418, done: 390 },
  { month: "Okt (312)", received: 470, done: 425 },
];

function KpiCard({ data }) {
  const [label, value, tag, note, KpiIcon, tone] = data;
  return (
    <article className="admin-kpi">
      <div className="kpi-title">
        <span>{label}</span>
        <KpiIcon size={16} />
      </div>
      <strong>{value}</strong>
      <div className="kpi-note">
        <b className={tone}>{tag}</b>
        <span>{note}</span>
      </div>
    </article>
  );
}

function TrendChart() {
  const max = 500;
  return (
    <div className="trend-chart">
      <div className="chart-legend">
        <span>
          <i className="legend-received" /> Laporan Diterima
        </span>
        <span>
          <i className="legend-done" /> Laporan Selesai
        </span>
      </div>
      <div className="chart-grid">
        <div className="y-labels">
          <span>500</span>
          <span>400</span>
          <span>300</span>
          <span>200</span>
          <span>100</span>
          <span>0</span>
        </div>
        <div className="bars">
          {bars.map((bar) => (
            <div className="bar-group" key={bar.month}>
              <div className="bar-pair">
                <i
                  style={{ height: `${(bar.received / max) * 100}%` }}
                  title={`${bar.received} diterima`}
                />
                <i
                  style={{ height: `${(bar.done / max) * 100}%` }}
                  title={`${bar.done} selesai`}
                />
              </div>
              <small>{bar.month}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-insight">
        <CircleHelp size={14} />
        <span>
          <b>Puncak laporan terjadi pada Oktober</b> seiring tingginya curah
          hujan di Sukamaju, didominasi oleh perbaikan drainase, talang irigasi,
          dan jalan berlubang.
        </span>
      </div>
    </div>
  );
}

function CategoryChart() {
  return (
    <div className="category-chart">
      <div className="donut">
        <div>
          <b>42%</b>
          <small>INFRASTRUKTUR</small>
        </div>
      </div>
      <ul>
        <li>
          <i className="dot-infra" /> Infrastruktur & Jalan{" "}
          <b>
            42%<small>(598)</small>
          </b>
        </li>
        <li>
          <i className="dot-env" /> Lingkungan & Kebersihan{" "}
          <b>
            28%<small>(399)</small>
          </b>
        </li>
        <li>
          <i className="dot-fasum" /> Penerangan & Fasum{" "}
          <b>
            18%<small>(257)</small>
          </b>
        </li>
        <li>
          <i className="dot-admin" /> Administrasi & Layanan{" "}
          <b>
            12%<small>(174)</small>
          </b>
        </li>
      </ul>
    </div>
  );
}

const AdminSidebar = AdminSidebarComponent;
const AdminTopbar = AdminTopbarComponent;

export default function AdminDashboardPage() {
  const [active, setActive] = useState("Ringkasan");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="admin-page">
      <AdminSidebar
        active={active}
        setActive={setActive}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <div className="admin-content">
        <AdminTopbar setOpen={setSidebarOpen} />
        <main className="admin-main">
          <div className="admin-eyebrow">
            <ShieldCheck size={14} /> PORTAL ADMINISTRASI DESA TERPADU
          </div>
          <div className="admin-heading">
            <div>
              <h1>Pusat Komando & Ringkasan Pelayanan Warga</h1>
              <p>
                Pantau kinerja penanganan aspirasi, verifikasi pengaduan masuk,
                dan SLA tindak lanjut aparatur desa secara realtime.
              </p>
            </div>
            <span className="date-filter">
              <CalendarDays size={14} /> 30 Hari Terakhir (Oktober 2024)
            </span>
          </div>
          <section className="kpi-grid">
            {kpis.map((kpi) => (
              <KpiCard data={kpi} key={kpi[0]} />
            ))}
          </section>
          <section className="admin-visuals">
            <article className="visual-card trend-card">
              <h2>Tren Masuk & Penyelesaian Laporan</h2>
              <p>Periode semester berjalan (Mei - Oktober 2024)</p>
              <TrendChart />
            </article>
            <article className="visual-card category-card">
              <div className="visual-title">
                <div>
                  <h2>Distribusi Kategori</h2>
                  <p>Berdasarkan klasifikasi aduan masyarakat</p>
                </div>
                <span>1.428 Total</span>
              </div>
              <CategoryChart />
            </article>
          </section>
          <section className="admin-bottom-grid">
            <article className="active-area">
              <div>
                <MapPin size={16} />
                <b>Wilayah Teraktif: Dusun Krajan RW 02</b>
                <small>45 laporan aktif dalam penanganan tim</small>
              </div>
              <button>
                Cek Peta <ChevronDown size={13} />
              </button>
            </article>
            <article className="quick-admin">
              <div>
                <BarChart3 size={19} />
                <b>Ringkasan Cepat</b>
              </div>
              <p>
                14 laporan perlu verifikasi segera untuk menjaga target SLA
                pelayanan warga.
              </p>
              <button onClick={() => setActive("Pengaduan Masalah")}>
                Buka Antrean Verifikasi <ChevronDown size={13} />
              </button>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

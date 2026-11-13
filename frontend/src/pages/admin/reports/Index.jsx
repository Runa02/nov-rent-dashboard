import {
  AlertTriangle,
  Archive,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  Download,
  FileText,
  Filter,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminTopbar from "../components/AdminTopbar.jsx";

const reports = [
  {
    id: "#SD-2024-1082",
    date: "21 Okt 2024, 08:30 WIB",
    reporter: "Joko Santoso",
    location: "Dusun Krajan (RW 02 / RT 04)",
    contact: "0812–3456–7890",
    category: "Infrastruktur & Jalan",
    title:
      "Amblasnya Aspal dan Saluran Gorong-gorong Jalan Utama Dusun Krajan...",
    detail: "Aspal retak sepanjang 40cm pasca-hujan lebat semalam.",
    urgency: "Mendesak",
    urgencyTone: "red",
    sla: "Sisa 12 Jam",
    officer: "Pak Suyatno",
    officerRole: "Kaur Pembangunan & Tim Jalan",
    status: "Pengerjaan Lapangan (55%)",
    statusTone: "blue",
    action: "Detail & Proses",
  },
  {
    id: "#SD-2024-1085",
    date: "21 Okt 2024, 09:12 WIB",
    reporter: "Ibu Sumiati",
    location: "Dusun Mawar (RT 03 / RW 01)",
    contact: "0857–1234–5678 (WA)",
    category: "Rencana & Fasum",
    title: "Pohon Randu Tumbang Menimpa Kabel...",
    detail: "Dahan besar patah akibat angin kencang. Kabel layanan terputus...",
    urgency: "Darurat / Mendesak",
    urgencyTone: "red",
    sla: "Butuh Atas Segera",
    officer: "Belum Ada Petugas",
    officerRole: "Rekomendasi: Satgas Linmas & PLN",
    status: "Menunggu Verifikasi",
    statusTone: "orange",
    action: "Verifikasi Cepat",
  },
  {
    id: "#SD-2024-1081",
    date: "20 Okt 2024, 19:40 WIB",
    reporter: "Budi Aminah",
    location: "Dusun Kuning (RW 01 / Depan Lapangan)",
    contact: "0821–9988–7766 (WA)",
    category: "Penerangan & Fasum",
    title: "Lampu Penerangan Jalan Poros Padam 4",
    detail: "Kondisi jalan desa dalam penerangan gelap...",
    urgency: "Prioritas Sedang",
    urgencyTone: "peach",
    sla: "Sisa 3 Hari",
    officer: "Mas Rian",
    officerRole: "Teknisi Kelistrikan Desa",
    status: "Disposisi Terbit",
    statusTone: "gray",
    action: "Detail & Proses",
  },
  {
    id: "#SD-2024-1078",
    date: "19 Okt 2024, 14:15 WIB",
    reporter: "Karang Taruna RW 04",
    location: "Dusun Sukamaju",
    contact: "0813–1122–3344 (WA)",
    category: "Kebersihan & Lingkungan",
    title: "Tumpukan Pembuangan Sampah Liar...",
    detail: "Banyak oknum liar disembunyikan sampah konten plastik &...",
    urgency: "Prioritas Tinggi",
    urgencyTone: "peach",
    sla: "Sesuai Jadwal",
    officer: "Regu Kebersihan Desa",
    officerRole: "Pak Samad & 3 Petugas",
    status: "Pengerjaan Lapangan (80%)",
    statusTone: "blue",
    action: "Detail & Proses",
  },
  {
    id: "#SD-2024-1075",
    date: "18 Okt 2024, 07:06 WIB",
    reporter: "Aparatur Desa",
    location: "Dusun Tirto (RT 02 / RW 04)",
    contact: "0852–3344–5566 (WA)",
    category: "Irigrasi & Pertanian",
    title: "Pintu Air Dampar Batang Kayu &...",
    detail:
      "Aliran debit air irigasi tersendat menuju 15 hektar sawah produktif.",
    urgency: "Prioritas Tinggi",
    urgencyTone: "peach",
    sla: "Tuntas Tepat Waktu",
    officer: "Ulu-Ulu Desa",
    officerRole: "Irigrasi & Piket",
    status: "Validasi Selesai",
    statusTone: "mint",
    action: "Validasi Kades",
  },
  {
    id: "#SD-2024-1069",
    date: "15 Okt 2024, 11:20 WIB",
    reporter: "Ahmad Dani",
    location: "Dusun Ngumpul (RW 02 / Depan Mushola)",
    contact: "0877–1122–3377 (WA)",
    category: "Infrastruktur & Jalan",
    title: "Pengajuan Pembuatan Saluran Air Baru...",
    detail: "Pemasangan bibir beton 5 meter telah mengurangi genangan.",
    urgency: "Normal",
    urgencyTone: "gray",
    sla: "Tuntas Sempurna",
    officer: "Pak Suyatno",
    officerRole: "Kaur Pembangunan",
    status: "Selesai & Ditutup",
    statusTone: "mint",
    action: "Lihat Arsip",
  },
];

function Badge({ children, tone = "gray" }) {
  return <span className={`reports-badge ${tone}`}>{children}</span>;
}

function ReportRow({ report }) {
  return (
    <tr className="report-row">
      {/* Checkbox */}
      <td className="report-check">
        <input type="checkbox" aria-label={`Pilih pengaduan ${report.id}`} />
      </td>

      {/* Nomor Tiket & Tanggal */}
      <td>
        <div className="report-ticket">
          <b>{report.id}</b>
          <small>{report.date}</small>
          <em>▣ Aplikasi Mobile</em>
        </div>
      </td>

      {/* Pelapor & Lokasi */}
      <td>
        <div className="report-person">
          <b>
            <UserRound size={11} />
            {report.reporter}
          </b>

          <small>⌖ {report.location}</small>

          <a href={`tel:${report.contact.replace(/[^0-9]/g, "")}`}>
            ▣ {report.contact}
          </a>
        </div>
      </td>

      {/* Rincian Pengaduan & Bukti */}
      <td>
        <div className="report-detail">
          <Badge tone="light-blue">{report.category}</Badge>

          <b>{report.title}</b>
          <small>{report.detail}</small>

          <span className="attachment">
            ▧ {report.id.endsWith("82") ? "2" : "1"} Foto{" "}
            {report.id.endsWith("82") ? "Bukti" : "Lampiran"}
          </span>
        </div>
      </td>

      {/* Urgensi & SLA */}
      <td>
        <div className="report-urgency">
          <Badge tone={report.urgencyTone}>{report.urgency}</Badge>

          <b>
            {report.urgencyTone === "red" ? "●" : "◷"} {report.sla}
          </b>

          <small>Target SLA: 24 jam</small>
        </div>
      </td>

      {/* Disposisi Petugas */}
      <td>
        <div className="report-officer">
          <b>
            <i>{report.officer.slice(0, 2)}</i>
            {report.officer}
          </b>

          <small>{report.officerRole}</small>

          {report.officer.includes("Belum") && (
            <button type="button">
              <ClipboardCheck size={11} />
              Tugaskan Tim
            </button>
          )}
        </div>
      </td>

      {/* Status Penanganan */}
      <td>
        <div className="report-status">
          <Badge tone={report.statusTone}>{report.status}</Badge>

          <small>
            {report.statusTone === "blue"
              ? "Menunggu update terakhir"
              : report.statusTone === "orange"
                ? "Menunggu ACC Admin Desa"
                : "Estimasi pengerjaan besok"}
          </small>
        </div>
      </td>

      {/* Aksi Cepat */}
      <td>
        <div className="report-action">
          <button
            type="button"
            className={
              report.action.includes("Verifikasi") ? "primary-action" : ""
            }
          >
            {report.action}
          </button>

          <MoreVertical size={15} />
        </div>
      </td>
    </tr>
  );
}

export default function IndexReports() {
  const [active, setActive] = useState("Pengaduan Masalah");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const filteredReports = useMemo(
    () =>
      reports.filter(
        (item) =>
          `${item.id} ${item.title} ${item.reporter}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (category === "Semua Kategori" || item.category === category),
      ),
    [query, category],
  );
  return (
    <div className="admin-page reports-page">
      <AdminSidebar
        active={active}
        setActive={setActive}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />
      <div className="admin-content">
        <AdminTopbar setOpen={setSidebarOpen} />
        <main className="admin-main reports-main">
          <div className="admin-heading">
            <div>
              <h1>Manajemen Pengaduan</h1>
              <p>
                Pantau dan kelola antrean pengaduan warga, verifikasi laporan
                masuk, dan tindak lanjut petugas desa secara realtime.
              </p>
            </div>
          </div>
          <div className="reports-toolbar">
            <div className="reports-actions">
              <button className="select-action">
                <Archive size={13} /> Aksi Massal (0 dipilih){" "}
                <ChevronDown size={12} />
              </button>
              <button>
                <Download size={13} /> Ekspor Data
              </button>
              <button>
                <ClipboardCheck size={13} /> Cetak Rekap Disposisi
              </button>
              <button className="manual-report">
                <Plus size={13} /> Input Pengaduan Manual / Loket
              </button>
            </div>
          </div>
          <section className="reports-filter">
            <label className="report-search">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari tiket, judul laporan, atau nama pelapor..."
              />
            </label>
            <div className="report-filter-grid">
              <label>
                <small>KATEGORI ADUAN</small>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Semua Kategori</option>
                  <option>Infrastruktur & Jalan</option>
                  <option>Penerangan & Fasum</option>
                  <option>Kebersihan & Lingkungan</option>
                  <option>Rencana & Fasum</option>
                </select>
              </label>
              <label>
                <small>WILAYAH / DUSUN</small>
                <select>
                  <option>Semua Dusun</option>
                  <option>Dusun Krajan</option>
                  <option>Dusun Mawar</option>
                </select>
              </label>
              <label>
                <small>TINGKAT URGENSI</small>
                <select>
                  <option>Semua Urgensi</option>
                  <option>Mendesak</option>
                  <option>Prioritas Tinggi</option>
                </select>
              </label>
              <label>
                <small>RENTANG WAKTU</small>
                <div className="date-filter-input">
                  <CalendarDays size={13} /> 30 Hari Terakhir{" "}
                  <CalendarDays size={12} />
                </div>
              </label>
              <button
                className="reset-filter"
                onClick={() => {
                  setQuery("");
                  setCategory("Semua Kategori");
                }}
              >
                <RefreshCw size={12} /> Reset Filter
              </button>
            </div>
          </section>

          <section className="reports-table-card">
            <div className="reports-list-heading">
              <h2>
                Daftar Antrean Pengaduan{" "}
                <small>Menampilkan {filteredReports.length} dari 57 data</small>
              </h2>

              <span>
                Diperbarui: 2 menit yang lalu
                <RefreshCw size={11} />
              </span>
            </div>

            <div className="reports-table-wrapper">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Pilih semua pengaduan"
                      />
                    </th>
                    <th>NO. TIKET & TANGGAL</th>
                    <th>PELAPOR & LOKASI</th>
                    <th>RINCIAN PENGADUAN & BUKTI</th>
                    <th>URGENSI & SLA</th>
                    <th>DISPOSISI PETUGAS</th>
                    <th>STATUS PENANGANAN</th>
                    <th>AKSI CEPAT</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <ReportRow report={report} key={report.id} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="reports-empty">
                        Tidak ada pengaduan ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="reports-pagination">
              <span>
                Tampilkan: <b>10 data</b>
                &nbsp;&nbsp;&nbsp; Menampilkan 1 - {filteredReports.length} dari
                total 57 tiket pengaduan warga
              </span>

              <div>
                <button>‹</button>
                <button className="current">1</button>
                <button>2</button>
                <button>3</button>
                <span>...</span>
                <button>6</button>
                <button>›</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

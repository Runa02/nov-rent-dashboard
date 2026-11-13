import {
  Archive,
  ArrowDownToLine,
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  Headphones,
  MessageCircle,
  Pencil,
  Search,
  Send,
  ShieldCheck,
  ThumbsUp,
  Timer,
  Upload,
  Users,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import SiteNavbar from "../components/SiteNavbar.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import Icon from "../components/Icon.jsx";

const activities = [
  {
    type: "PENGADUAN MASALAH",
    tone: "peach",
    meta: "Infrastruktur & Jalan • Tiket #SD-2024-1082",
    title:
      "Amblasnya Aspal dan Saluran Gorong-gorong Jalan Utama Dusun Krajan RW 02",
    info: "Diajukan 21 Okt 2024, 08:30 WIB • Jl. Merak Depan Poskamling RT 04",
    status: "Sedang Dikerjakan (55%)",
    statusTone: "orange",
    progress: 55,
    update: "Pemberitahuan dari Kasi Pembangunan (Agus Setiawan, S.IP.):",
    message:
      "“Material buis beton 8 unit sudah tiba di lokasi. Pengerjaan galian dan pemasangan dimulai hari ini bersama warga setempat dan tim teknis desa.”",
  },
  {
    type: "ASPIRASI & USULAN",
    tone: "mint",
    meta: "Pendidikan & Literasi Digital • Usulan #ASP-2025-029",
    title:
      "Pemasangan Wi-Fi Gratis & Pojok Literasi Digital di Balai Dusun Mawar",
    info: "Diajukan 14 Okt 2024 • Dijadwalkan untuk Musrenbang 2025",
    status: "Lolos Kurasi BPD",
    statusTone: "mint",
    supporters: "76 Warga Mendukung",
    budget: "Rp 8.000.000",
  },
  {
    type: "PENGADUAN MASALAH",
    tone: "peach",
    meta: "Penerangan & Fasum • Tiket #SD-2024-0941",
    title: "Lampu Penerangan Jalan Umum (LPJ) Mati di Tikungan RT 04",
    info: "Diajukan 02 Okt 2024 • Selesai 04 Okt 2024 (Tuntas dalam 2 hari)",
    status: "Selesai Dituntaskan ✓",
    statusTone: "mint",
    before: true,
  },
  {
    type: "PENGADUAN MASALAH",
    tone: "peach",
    meta: "Kebersihan & Lingkungan Hidup • Tiket #SD-2024-1102",
    title: "Tumpukan Sampah Liar di Pembatas Saluran Irigasi Sawah Selatan",
    info: "Diajukan Kemarin, 16:45 WIB • Estimasi Verifikasi Berkas: Hari ini, maks 17:00 WIB",
    status: "Menunggu Verifikasi Pamong",
    statusTone: "blue",
    description:
      "Laporan telah masuk ke antrean verifikasi Sekretariat Desa Sukamaju. Pamong bertugas sedang meninjau kelengkapan koordinat lokasi dan bukti foto sebelum ditugaskan ke Satgas Kebersihan Dusun.",
  },
];

function ActivityCard({ item }) {
  return (
    <article className="activity-card">
      <div className="activity-head">
        <div>
          <span className={`activity-type ${item.tone}`}>{item.type}</span>
          <small> • {item.meta}</small>
        </div>
        <span className={`activity-status ${item.statusTone}`}>
          {item.status}
        </span>
      </div>
      <h3>{item.title}</h3>
      <p className="activity-info">
        <Clock3 size={12} /> {item.info}
      </p>
      {item.progress && (
        <>
          <div className="progress-line">
            <i style={{ width: `${item.progress}%` }} />
          </div>
          <div className="notice">
            <Users size={18} />
            <p>
              <b>{item.update}</b>
              {item.message}
            </p>
          </div>
        </>
      )}
      {item.supporters && (
        <div className="aspirasi-metrics">
          <span>
            <ThumbsUp size={16} /> {item.supporters}
          </span>
          <span>
            <WalletCards size={16} /> Estimasi Anggaran: <b>{item.budget}</b>
          </span>
        </div>
      )}
      {item.before && (
        <div className="before-after">
          <div>
            <b>Kondisi Awal (Pelapor)</b>
            <img
              src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
              alt="Kondisi awal"
            />
            <span>Sebelum</span>
          </div>
          <div>
            <b>Hasil Perbaikan (Pamong Desa)</b>
            <img
              src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80"
              alt="Hasil perbaikan"
            />
            <span>Tuntas</span>
          </div>
        </div>
      )}
      {item.description && (
        <p className="activity-description">{item.description}</p>
      )}
      {item.before && (
        <div className="rating">
          ★★★★★{" "}
          <i>“Terima kasih respon sangat cepat pamong desa dan teknisi PLN.”</i>
          <b>Rating Diberikan</b>
        </div>
      )}
      <div className="activity-actions">
        <button>
          <Icon
            icon={
              item.before
                ? FileCheck2
                : item.description
                  ? FileText
                  : item.supporters
                    ? Archive
                    : Send
            }
            size={13}
          />{" "}
          {item.before
            ? "Lihat Berita Acara Selesai"
            : item.description
              ? "Detail Tiket"
              : item.supporters
                ? "Lihat Lembar Usulan"
                : "Lacak Detail & Riwayat Progres"}
        </button>
        {item.description ? (
          <button>
            <Pencil size={13} /> Ubah Laporan
          </button>
        ) : (
          <small>
            {item.before
              ? "BAP-DESA-0941.pdf"
              : item.supporters
                ? "Sidang Pembahasan: 10 Nov 2024"
                : "Update 3 jam yang lalu"}
          </small>
        )}
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [tab, setTab] = useState("Semua Aktivitas (5)");
  return (
    <div className="dashboard-page">
      <SiteNavbar dashboard />
      <main className="dashboard-main">
        <section className="welcome-card">
          <div>
            <span className="verified-pill">
              <ShieldCheck size={13} /> Akun Terverifikasi Dukcapil • NIK:
              330208******0002
            </span>
            <h1>Halo, Pak Joko Santoso 👋</h1>
            <p>
              Pantau perkembangan tindak lanjut pengaduan fasilitas umum dan
              usulan aspirasi musrenbang desa yang telah Anda ajukan untuk Dusun
              Krajan RW 02 / RT 04.
            </p>
          </div>
          <div className="welcome-actions">
            <Link className="button button-dark" to="/lapor">
              <Send size={15} /> Buat Laporan Pengaduan Baru
            </Link>
            <button className="button button-blue">
              <BellRing size={15} /> Ajukan Aspirasi Musrenbang
            </button>
          </div>
        </section>
        <section className="dashboard-stats">
          {[
            [
              "TOTAL LAPORAN & ASPIRASI",
              "5",
              "Kontribusi aktif warga",
              FileText,
              "blue",
            ],
            [
              "SEDANG DIPROSES",
              "2",
              "1 Pengerjaan, 1 Sidang BPD",
              Timer,
              "peach",
            ],
            [
              "BERHASIL DISELESAIKAN",
              "2",
              "Tuntas & terverifikasi warga",
              CheckCircle2,
              "mint",
            ],
            [
              "DRAF BELUM TERKIRIM",
              "1",
              "Perlu kelengkapan foto",
              FileText,
              "blue",
            ],
          ].map(([label, value, note, StatIcon, tone]) => (
            <article key={label}>
              <div>
                <b className={tone}>{label}</b>
                <strong>{value}</strong>
                <small>{note}</small>
              </div>
              <Icon icon={StatIcon} size={26} />
            </article>
          ))}
        </section>
        <div className="dashboard-grid">
          <section className="activity-column">
            <div className="activity-filter">
              <div className="tabs">
                {[
                  "Semua Aktivitas (5)",
                  "Pengaduan Masalah (3)",
                  "Aspirasi & Usulan (2)",
                ].map((item) => (
                  <button
                    className={tab === item ? "selected" : ""}
                    onClick={() => setTab(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="filter-row">
                <label>
                  <Search size={16} />
                  <input placeholder="Cari berdasarkan judul atau nomor tiket..." />
                </label>
                <button>
                  Status: Semua Status <ChevronRight size={14} />
                </button>
                <button>
                  Urutan: Terbaru <ChevronRight size={14} />
                </button>
              </div>
            </div>
            {activities.map((item) => (
              <ActivityCard item={item} key={item.title} />
            ))}
          </section>
          <aside className="dashboard-aside">
            <div className="aside-card">
              <h3>
                <Archive size={18} /> Ringkasan Berkas Resmi
              </h3>
              <small>Dokumen legal pengaduan Anda</small>
              <p>
                Unduh rekapan komprehensif riwayat pelaporan aktif untuk
                keperluan arsip warga atau lampiran rapat RT.
              </p>
              <button>
                <ArrowDownToLine size={15} /> Unduh Bukti Pengaduan Saya (PDF)
              </button>
            </div>
            <div className="aside-card sla-card">
              <h3>
                <Timer size={18} /> Standar Waktu Layanan (SLA)
              </h3>
              <small>Komitmen Pemdes Sukamaju</small>
              {[
                [
                  "Verifikasi Berkas",
                  "Maksimal 1×24 Jam Kerja oleh Tim Sekretariat.",
                ],
                [
                  "Peninjauan Lapangan",
                  "1–2 hari kerja bersama RT/RW setempat.",
                ],
                [
                  "Tindak Lanjut & Eksekusi",
                  "Sesuai skala urgensi masalah & musyawarah.",
                ],
              ].map(([title, text], i) => (
                <div className="sla-item" key={title}>
                  <b>{i + 1}</b>
                  <span>
                    <strong>{title}</strong>
                    {text}
                  </span>
                </div>
              ))}
            </div>
            <div className="help-card">
              <Headphones size={23} />
              <h3>Pusat Bantuan Cepat Warga</h3>
              <small>Posko Layanan Darurat Desa</small>
              <p>
                Mengalami kendala mendesak atau butuh pendampingan langsung dari
                perangkat desa di balai dusun?
              </p>
              <a href="https://wa.me/6281234567890">
                ☎ WhatsApp: 0812–3456–7890
              </a>
              <small>Buka Setiap Hari: 07.00 - 20.00 WIB</small>
            </div>
            <div className="district-card">
              <b>Statistik Wilayah Dusun Krajan</b>
              <span>RW 02</span>
              <div>
                <i />
              </div>
              <p>
                Tingkat Kepuasan Penanganan <strong>82% Puas</strong>
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

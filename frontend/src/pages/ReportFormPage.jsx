import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  FileText,
  Info,
  Landmark,
  MapPin,
  PhoneCall,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import SiteNavbar from "../components/SiteNavbar.jsx";

const Field = ({ label, required = true, children, hint }) => (
  <label className="form-field">
    <span>
      {label} {required && <b>*</b>} {hint && <small>{hint}</small>}
    </span>
    {children}
  </label>
);

export default function ReportFormPage() {
  const [kind, setKind] = useState("Pengaduan Masalah");
  const [privacy, setPrivacy] = useState("Publik (Disarankan)");
  const [file, setFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    description: "",
  });
  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    if (!form.title || !form.location || !form.description || !agreed) return;
    setSubmitted(true);
  };

  if (submitted)
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="success-icon">
            <Check />
          </div>
          <h1>Laporan Berhasil Dikirim</h1>
          <p>
            Terima kasih, aspirasi Anda sudah diterima oleh Balai Desa Sukamaju.
          </p>
          <strong>Nomor tiket: SD-2024-0891</strong>
          <Link className="button button-dark" to="/">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );

  return (
    <div className="report-page">
      <SiteNavbar report />
      <main className="form-main">
        <div className="breadcrumbs">
          <Link to="/">⌂ Beranda</Link> <span>›</span> Layanan Warga{" "}
          <span>›</span> <b>Buat Laporan Baru</b>
        </div>
        <div className="form-title-row">
          <div>
            <div className="eyebrow form-eyebrow">
              <ShieldCheck size={13} /> Sistem Komunikasi Terbuka Desa
            </div>
            <h1>Formulir Pengaduan & Aspirasi Warga</h1>
            <p>
              Sampaikan kendala fasilitas umum atau usulan pembangunan desa
              Anda. Data laporan Anda diproses langsung oleh petugas Balai Desa.
            </p>
          </div>
          <div className="response-badge">
            <Icon icon={Save} size={25} />
            <span>
              Rata-rata Respon<strong>1 × 24 Jam</strong>
            </span>
          </div>
        </div>
        <Progress />
        <div className="form-layout">
          <form className="report-form-card" onSubmit={submit}>
            <Field label="Pilih Jenis Laporan Anda">
              <div className="choice-grid">
                <button
                  type="button"
                  className={`choice-card ${kind === "Pengaduan Masalah" ? "selected" : ""}`}
                  onClick={() => setKind("Pengaduan Masalah")}
                >
                  <i className="red-dot" />
                  <span>
                    <b>Pengaduan Masalah</b>
                    <small>
                      Laporan kerusakan jalan, lampu mati, saluran air
                      tersumbat, atau ketertiban warga.
                    </small>
                  </span>
                  {kind === "Pengaduan Masalah" && (
                    <Check className="choice-check" />
                  )}
                </button>
                <button
                  type="button"
                  className={`choice-card ${kind === "Aspirasi & Usulan" ? "selected" : ""}`}
                  onClick={() => setKind("Aspirasi & Usulan")}
                >
                  <i className="yellow-dot" />
                  <span>
                    <b>Aspirasi & Usulan</b>
                    <small>
                      Gagasan kemajuan, usulan fasilitas publik baru, atau
                      rencana pelatihan warga desa.
                    </small>
                  </span>
                  {kind === "Aspirasi & Usulan" && (
                    <Check className="choice-check" />
                  )}
                </button>
              </div>
            </Field>
            <Field
              label="Kategori Permasalahan / Bidang Usulan"
              hint="Wajib dipilih"
            >
              <div className="select-wrap">
                <select defaultValue="Infrastruktur & Jalan Desa">
                  <option>Infrastruktur & Jalan Desa</option>
                  <option>Lingkungan dan Kebersihan</option>
                  <option>Pelayanan Publik</option>
                  <option>Pemberdayaan Masyarakat</option>
                </select>
                <ChevronDown size={16} />
              </div>
            </Field>
            <Field label="Judul Laporan Singkat" hint="Maks. 80 Karakter">
              <input
                value={form.title}
                onChange={update("title")}
                placeholder="Jembatan kayu penghubung Dusun Krajan dan Dusun Mawar rapuh berlubang"
              />
              <small className="field-help">
                Tulis ringkasan inti persoalan dalam 1 kalimat jelas dan padat.
              </small>
            </Field>
            <div className="field-row">
              <Field label="Tanggal Kejadian">
                <div className="input-icon">
                  <CalendarDays size={16} />
                  <input type="date" defaultValue="2024-10-24" />
                </div>
              </Field>
              <Field label="Dusun / Lingkungan RW">
                <div className="select-wrap">
                  <select defaultValue="Dusun Krajan (RW 02 / RT 04)">
                    <option>Dusun Krajan (RW 02 / RT 04)</option>
                    <option>Dusun Mawar (RW 01 / RT 02)</option>
                  </select>
                  <ChevronDown size={16} />
                </div>
              </Field>
            </div>
            <Field label="Detail Alamat / Titik Acuan Lokasi">
              <div className="input-icon">
                <MapPin size={16} />
                <input
                  value={form.location}
                  onChange={update("location")}
                  placeholder="Dekat warung Bu Minah, 50 meter sebelah barat mushola Al-Ikhlas"
                />
              </div>
            </Field>
            <Field
              label="Deskripsi Masalah / Usulan Lengkap"
              hint="0 / 1000 karakter"
            >
              <textarea
                value={form.description}
                onChange={update("description")}
                placeholder="Kondisi kayu penyangga jembatan sudah lapuk akibat curah hujan tinggi minggu lalu..."
              />
              <small className="field-help">
                Sampaikan apa adanya tanpa rasa takut. Petugas desa akan
                memverifikasi lapangan secara langsung.
              </small>
            </Field>
            <Field
              label="Foto Bukti / Dokumen Pendukung"
              required={false}
              hint="Bisa lebih dari 1 file"
            >
              <label className="upload-box">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Icon icon={Upload} size={28} />
                <b>
                  {file
                    ? file.name
                    : "Tarik & lepas foto ke sini, atau klik untuk memilih file"}
                </b>
                <small>
                  Format yang didukung: JPG, PNG, WEBP (Maksimal 5 MB per foto)
                </small>
                <span className="browse-button">
                  <Icon icon={Camera} size={14} /> Jelajahi Galeri Ponsel /
                  Laptop
                </span>
              </label>
              {file && (
                <div className="uploaded-file">
                  <FileText size={18} />
                  <span>
                    <b>{file.name}</b>
                    <small>Berhasil dipilih</small>
                  </span>
                  <button type="button" onClick={() => setFile(null)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </Field>
            <Field label="Jaminan Privasi & Identitas Pelapor" required={false}>
              <div className="choice-grid">
                <button
                  type="button"
                  className={`privacy-card ${privacy === "Publik (Disarankan)" ? "selected" : ""}`}
                  onClick={() => setPrivacy("Publik (Disarankan)")}
                >
                  <div>
                    <ShieldCheck size={17} />
                    <b>Publik (Disarankan)</b>
                    <small>
                      Judul dan foto dapat dilihat warga lain agar bisa saling
                      dukung. Nama Anda disamarkan.
                    </small>
                  </div>
                  <em>Transparan</em>
                </button>
                <button
                  type="button"
                  className={`privacy-card ${privacy === "Rahasia & Privat" ? "selected" : ""}`}
                  onClick={() => setPrivacy("Rahasia & Privat")}
                >
                  <div>
                    <ShieldCheck size={17} />
                    <b>Rahasia & Privat</b>
                    <small>
                      Hanya Kepala Desa dan Aparatur Berwenang yang dapat
                      melihat laporan ini.
                    </small>
                  </div>
                  <em>Terbatas</em>
                </button>
              </div>
            </Field>
            <label className="agreement">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                Saya menyatakan bahwa laporan ini dibuat dengan data yang benar,
                objektif, dan tidak bermaksud merugikan pihak lain demi kemajuan
                dan kebaikan bersama masyarakat desa.
              </span>
            </label>
            <div className="form-actions">
              <button type="button" className="button button-secondary">
                <Icon icon={Save} size={15} /> Simpan Draf Laporan
              </button>
              <button type="submit" className="button button-dark">
                <Icon icon={Send} size={15} /> Kirim Laporan Sekarang
              </button>
            </div>
          </form>
          <AsideTips />
        </div>
      </main>
      <FooterMini />
    </div>
  );
}

function Progress() {
  return (
    <div className="progress-card">
      <div className="progress-step complete">
        <span>
          <Check size={16} />
        </span>
        <small>
          LANGKAH 1<b>Kategori & Jenis</b>
        </small>
      </div>
      <div className="progress-step active">
        <span>2</span>
        <small>
          LANGKAH 2 (AKTIF)<b>Rincian & Lokasi</b>
        </small>
      </div>
      <div className="progress-step">
        <span>3</span>
        <small>
          LANGKAH 3<b>Bukti Foto & Privasi</b>
        </small>
      </div>
      <div className="progress-bar">
        <i />
      </div>
    </div>
  );
}

function AsideTips() {
  return (
    <aside className="form-aside">
      <div className="tip-card">
        <h3>
          <Icon icon={LightbulbIcon} size={18} /> Tips Melapor yang Cepat
          Ditanggapi
        </h3>
        {[
          [
            "Sertakan Patokan Jelas",
            "Sebutkan nama bangunan terdekat, musholla, pos ronda, atau nomor rumah warga agar tim lapangan mudah menemukan lokasi.",
          ],
          [
            "Foto Jelas & Siang Hari",
            "Hindari foto malam hari yang gelap atau kabur agar perangkat desa bisa langsung memperkirakan volume kerusakan.",
          ],
          [
            "Bahasa Sopan & Konstruktif",
            "Laporan yang fokus pada fakta kondisi tanpa nada menyalahkan akan lebih cepat dieksekusi.",
          ],
        ].map(([title, text], i) => (
          <div className="tip-item" key={title}>
            <b>{i + 1}</b>
            <span>
              <strong>{title}</strong>
              {text}
            </span>
          </div>
        ))}
      </div>
      <div className="map-card">
        <h3>
          Cakupan Wilayah Desa <span>● GPS Aktif</span>
        </h3>
        <div className="fake-map">
          <MapPin size={16} /> Dusun Krajan (Area Target)
        </div>
        <p>
          Sistem kami memetakan titik koordinat secara otomatis agar mempermudah
          alokasi dana perbaikan RT/RW.
        </p>
      </div>
      <div className="emergency-card">
        <h3>
          <AlertTriangle size={18} /> Butuh Bantuan Darurat?
        </h3>
        <p>
          Jika terjadi pohon tumbang membahayakan, tanah longsor, atau
          kebakaran, jangan gunakan formulir biasa.
        </p>
        <strong>
          <PhoneCall size={15} /> Posko Siaga Babinsa:
          <br />
          <b>0812-3456-7890</b>
          <em>24 JAM</em>
        </strong>
      </div>
      <div className="quote-card">
        <span>👩🏻</span>
        <p>
          <b>Siti Rahayu, S.Sos</b>
          <small>Kasi Pelayanan Umum Desa</small>“Semua aduan Anda kami rekap
          dan pantau setiap hari kerja.”
        </p>
      </div>
    </aside>
  );
}

const LightbulbIcon = ({ size }) => <span style={{ fontSize: size }}>💡</span>;

function FooterMini() {
  return (
    <footer className="form-footer">
      <div>
        <h3>
          <Building2 size={18} /> Pemerintah Desa Sukamaju Berseri
        </h3>
        <p>
          Sistem saluran aspirasi dan pengaduan terintegrasi, transparan, dan
          terpercaya bagi kemajuan masyarakat rukun warga dan pedukuhan se-Desa
          Sukamaju.
        </p>
      </div>
      <div>
        <h4>Layanan Aduan & Kontak</h4>
        <p>
          ☎ Call Center: 0812-3456-7890
          <br />✉ aduan@sukamaju.desa.id
          <br />⌖ Jl. Raya Desa Sukamaju No. 12
        </p>
      </div>
      <div>
        <h4>Jam Pelayanan Balai Desa</h4>
        <p>
          Senin - Kamis: 08.00 - 15.30 WIB
          <br />
          Jumat: 08.00 - 11.30 WIB
          <br />
          Sabtu - Minggu: Tutup
        </p>
      </div>
      <div>
        <h4>Navigasi Cepat</h4>
        <p>
          Beranda Utama
          <br />
          Pedoman Pengaduan
          <br />
          Tracking Status Laporan
          <br />
          Musrenbang & Usulan
        </p>
      </div>
    </footer>
  );
}

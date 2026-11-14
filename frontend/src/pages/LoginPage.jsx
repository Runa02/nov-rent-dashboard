import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CarFront,
  Eye,
  EyeOff,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Brand() {
  return (
    <div className="login-brand">
      <span className="login-brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>Nov Rent</span>
    </div>
  );
}

function RentalDashboardPreview() {
  return (
    <div className="login-preview rental-preview" aria-hidden="true">
      <div className="preview-topbar">
        <span className="preview-dot" />
        <b>Nov Rent Dashboard</b>
        <small>•••</small>
      </div>
      <div className="preview-stats">
        <div className="preview-stat primary">
          <small>Total Pendapatan</small>
          <strong>Rp 48,6 jt</strong>
          <span><TrendingUp size={9} /> 18,4% bulan ini</span>
        </div>
        <div className="preview-stat">
          <small>Unit Tersedia</small>
          <strong>24 / 32</strong>
          <span>8 sedang disewa</span>
        </div>
      </div>
      <div className="preview-chart rental-chart">
        <div className="preview-chart-head"><b>Performa Rental</b><small>30 Hari ▾</small></div>
        <div className="chart-lines"><i /><i /><i /></div>
        <svg viewBox="0 0 420 100" preserveAspectRatio="none">
          <path d="M0 78 C35 70 52 76 78 57 S124 65 151 42 S193 58 221 35 S263 43 287 29 S326 43 351 19 S394 30 420 9" />
        </svg>
      </div>
      <div className="rental-bookings">
        <div className="rental-booking-head"><b>Booking Terbaru</b><small>Lihat semua</small></div>
        <div className="rental-booking"><span className="car-thumb"><CarFront size={15} /></span><p><b>Toyota Avanza 1.5 G</b><small>BR-2048 · Budi Santoso</small></p><strong>Aktif</strong></div>
        <div className="rental-booking"><span className="car-thumb blue"><CarFront size={15} /></span><p><b>Mitsubishi Xpander</b><small>BR-2047 · Siti Aminah</small></p><strong className="ready">Siap</strong></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ identity: "", password: "" });
  const [error, setError] = useState("");
  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    if (!form.identity || !form.password) {
      setError("Email/NIK dan kata sandi wajib diisi.");
      return;
    }
    setError("");
    navigate("/dashboard");
  };

  return (
    <main className="login-page login-page-modern">
      <section className="login-layout">
        <div className="login-form-panel">
          <Brand />
          <div className="login-form-content">
            <div className="login-heading">
              <h1>Selamat Datang Kembali</h1>
              <p>
                Masukkan email/NIK dan kata sandi untuk mengakses akun Anda.
              </p>
            </div>
            <form onSubmit={submit}>
              <label className="login-field">
                <b>Email / NIK</b>
                <span>
                  <UsersRound size={15} />
                  <input
                    value={form.identity}
                    onChange={update("identity")}
                    placeholder="Masukkan email atau NIK Anda"
                  />
                </span>
              </label>
              <label className="login-field">
                <b>Kata Sandi</b>
                <span>
                  <LockKeyhole size={15} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={update("password")}
                    placeholder="Masukkan kata sandi"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Tampilkan kata sandi"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              <div className="login-options">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />{" "}
                  Ingat saya
                </label>
                <a href="#forgot">Lupa kata sandi?</a>
              </div>
              {error && <p className="login-error">{error}</p>}
              <button className="button button-dark login-submit" type="submit">
                Masuk ke Akun <ArrowUpRight size={16} />
              </button>
              <div className="login-divider">
                <span>atau masuk dengan</span>
              </div>
            </form>
            <p className="login-register">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() =>
                  alert("Halaman pendaftaran warga akan segera tersedia.")
                }
              >
                Daftar sekarang
              </button>
            </p>
          </div>
          <div className="login-footer">
            <span>© 2025 Pemerintah Desa Sukamaju</span>
            <a href="#privacy">Kebijakan Privasi</a>
          </div>
        </div>
        <aside className="login-visual-panel rental-visual-panel">
          <div className="visual-pattern pattern-one" />
          <div className="visual-pattern pattern-two" />
          <div className="visual-copy">
            <div className="visual-eyebrow"><Gauge size={14} /> RENTAL MANAGEMENT SYSTEM</div>
            <h2>Kelola bisnis rental mobil dengan lebih <em>mudah.</em></h2>
            <p>Pantau armada, booking pelanggan, dan performa pendapatan dalam satu dashboard yang praktis.</p>
          </div>
          <RentalDashboardPreview />
          <div className="rental-metrics">
            <span><CarFront size={14} /><b>32</b><small>Total Unit</small></span>
            <span><CalendarDays size={14} /><b>126</b><small>Booking Aktif</small></span>
            <span><ShieldCheck size={14} /><b>98%</b><small>Kepuasan</small></span>
          </div>
        </aside>
      </section>
    </main>
  );
}

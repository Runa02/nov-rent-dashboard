import {
  ArrowUpRight,
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

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

// Sesuaikan path firebase.js jika lokasi LoginPage.jsx berbeda.

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
          <span>
            <TrendingUp size={9} /> 18,4% bulan ini
          </span>
        </div>

        <div className="preview-stat">
          <small>Unit Tersedia</small>
          <strong>24 / 32</strong>
          <span>8 sedang disewa</span>
        </div>
      </div>

      <div className="preview-chart rental-chart">
        <div className="preview-chart-head">
          <b>Performa Rental</b>
          <small>30 Hari ▾</small>
        </div>

        <div className="chart-lines">
          <i />
          <i />
          <i />
        </div>

        <svg viewBox="0 0 420 100" preserveAspectRatio="none">
          <path d="M0 78 C35 70 52 76 78 57 S124 65 151 42 S193 58 221 35 S263 43 287 29 S326 43 351 19 S394 30 420 9" />
        </svg>
      </div>

      <div className="rental-bookings">
        <div className="rental-booking-head">
          <b>Booking Terbaru</b>
          <small>Lihat semua</small>
        </div>

        <div className="rental-booking">
          <span className="car-thumb">
            <CarFront size={15} />
          </span>
          <p>
            <b>Toyota Avanza 1.5 G</b>
            <small>BR-2048 · Budi Santoso</small>
          </p>
          <strong>Aktif</strong>
        </div>

        <div className="rental-booking">
          <span className="car-thumb blue">
            <CarFront size={15} />
          </span>
          <p>
            <b>Mitsubishi Xpander</b>
            <small>BR-2047 · Siti Aminah</small>
          </p>
          <strong className="ready">Siap</strong>
        </div>
      </div>
    </div>
  );
}

// Terjemahkan error Firebase menjadi pesan yang ramah.
function getLoginError(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "Format email tidak valid.";

    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email atau kata sandi salah.";

    case "auth/user-disabled":
      return "Akun ini telah dinonaktifkan.";

    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi nanti.";

    case "auth/network-request-failed":
      return "Koneksi internet bermasalah.";

    case "permission-denied":
    case "firestore/permission-denied":
      return "Tidak memiliki izin membaca profil pengguna.";

    default:
      return error.message || "Terjadi kesalahan saat login.";
  }
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({
    identity: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => {
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));

    setError("");
    setSuccess("");
  };

  // LOGIN FIREBASE
  const submit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const email = form.identity.trim();

    if (!email || !form.password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Atur session berdasarkan Ingat Saya
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence,
      );

      // 2. Login ke Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        form.password,
      );

      const user = userCredential.user;

      // 3. Cari profil user di Cloud Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);

        throw new Error(
          "Akun berhasil diverifikasi, tetapi profil pengguna tidak ditemukan di database.",
        );
      }

      const userData = userSnap.data();

      // 4. Baca role pengguna
      const role = String(userData.role || "")
        .trim()
        .toLowerCase();

      // 5. Redirect berdasarkan role
      switch (role) {
        case "admin":
        case "superadmin":
          navigate("/admin/dashboard", {
            replace: true,
          });
          break;

        case "user":
          await signOut(auth);
          throw new Error(
            "Permission Denied! Anda tidak memiliki akses ke Dashboard Admin.",
          );

        default:
          await signOut(auth);

          throw new Error("Role akun belum terdaftar atau tidak dikenali.");
      }
    } catch (err) {
      console.error("Login Firebase gagal:", err);
      setError(getLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  // RESET PASSWORD
  const handleForgotPassword = async () => {
    if (loading) return;

    const email = form.identity.trim();

    if (!email) {
      setError("Masukkan email terlebih dahulu untuk reset password.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);

      setSuccess(
        "Jika email terdaftar, periksa inbox untuk instruksi reset password.",
      );
    } catch (err) {
      setError(getLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page login-page-modern">
      <section className="login-layout">
        <div className="login-form-panel">
          <Brand />

          <div className="login-form-content">
            <div className="login-heading">
              <h1>Selamat Datang Kembali</h1>
              <p>Masukkan email dan kata sandi untuk mengakses akun Anda.</p>
            </div>

            <form onSubmit={submit}>
              <label className="login-field">
                <b>Email</b>
                <span>
                  <UsersRound size={15} />
                  <input
                    type="email"
                    value={form.identity}
                    onChange={update("identity")}
                    placeholder="Masukkan email Anda"
                    autoComplete="email"
                    required
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
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
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

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Lupa kata sandi?
                </button>
              </div>

              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}

              {success && (
                <p className="login-success" role="status">
                  {success}
                </p>
              )}

              <button
                className="button button-dark login-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  "Memverifikasi akun..."
                ) : (
                  <>
                    Masuk ke Akun
                    <ArrowUpRight size={16} />
                  </>
                )}
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
                  alert("Halaman pendaftaran akan segera tersedia.")
                }
              >
                Daftar sekarang
              </button>
            </p>
          </div>

          <div className="login-footer">
            <span>© 2026 Nov Rent</span>
            <a href="#privacy">Kebijakan Privasi</a>
          </div>
        </div>

        <aside className="login-visual-panel rental-visual-panel">
          <div className="visual-pattern pattern-one" />
          <div className="visual-pattern pattern-two" />

          <div className="visual-copy">
            <div className="visual-eyebrow">
              <Gauge size={14} />
              RENTAL MANAGEMENT SYSTEM
            </div>

            <h2>
              Kelola bisnis rental mobil dengan lebih <em>mudah.</em>
            </h2>

            <p>
              Pantau armada, booking pelanggan, dan performa pendapatan dalam
              satu dashboard yang praktis.
            </p>
          </div>

          <RentalDashboardPreview />

          <div className="rental-metrics">
            <span>
              <CarFront size={14} />
              <b>32</b>
              <small>Total Unit</small>
            </span>

            <span>
              <CalendarDays size={14} />
              <b>126</b>
              <small>Booking Aktif</small>
            </span>

            <span>
              <ShieldCheck size={14} />
              <b>98%</b>
              <small>Kepuasan</small>
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

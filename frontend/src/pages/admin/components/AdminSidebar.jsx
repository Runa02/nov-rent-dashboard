import {
  AlertCircle,
  Building2,
  ClipboardCheck,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Network,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menu = [
  ["Ringkasan", LayoutDashboard, "/admin/dashboard"],
  ["Pengaduan Masalah", AlertCircle, "/admin/reports"],
  ["Aspirasi & Usulan Warga", MessageSquare, "/admin/aspirasi"],
  ["Manajemen Pengguna", Users, "/admin/pengguna"],
  ["Petugas & Disposisi", ClipboardCheck, "/admin/petugas"],
  ["Kategori & Wilayah", Network, "/admin/kategori"],
  ["Laporan & Rekap Cetak", FileBarChart, "/admin/laporan"],
];

export default function AdminSidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      <div className="admin-brand">
        <span>
          <Building2 size={20} />
        </span>
        <div>
          <b>SuaraDesa</b>
          <small>Portal Desa Sukamaju</small>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Tutup menu">
          <X size={18} />
        </button>
      </div>

      <div className="admin-menu-label">MENU UTAMA</div>

      <nav>
        {menu.map(([label, MenuIcon, path], index) => {
          const isActive =
            location.pathname === path ||
            (path !== "/admin" && location.pathname.startsWith(path + "/"));

          return (
            <button
              key={label}
              className={isActive ? "active" : ""}
              onClick={() => handleNavigate(path)}
            >
              <MenuIcon size={15} />
              <span>{label}</span>
              {index === 1 && <em>14</em>}
            </button>
          );
        })}
      </nav>

      <div className="admin-sidebar-bottom">
        <button onClick={() => handleNavigate("/admin/pengaturan")}>
          <Settings size={15} />
          Pengaturan Sistem
        </button>

        <button className="logout">
          <LogOut size={15} />
          Keluar / Logout
        </button>
      </div>
    </aside>
  );
}

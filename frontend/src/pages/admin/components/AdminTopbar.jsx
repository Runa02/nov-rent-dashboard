import {
  Bell,
  CircleUserRound,
  FileBarChart,
  Menu,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

const dummyNotifications = [
  { title: "Pesanan baru masuk", detail: "1 pesanan menunggu verifikasi.", time: "Baru saja" },
  { title: "Armada perlu perhatian", detail: "Toyota Avanza sedang dalam servis.", time: "5 menit lalu" },
  { title: "Rekap bulanan tersedia", detail: "Laporan bulan ini siap dilihat.", time: "1 jam lalu" },
];

export default function AdminTopbar({ setOpen }) {
  const [now, setNow] = useState(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="admin-topbar">
      <button
        className="admin-mobile-menu"
        onClick={() => setOpen(true)}
        aria-label="Buka sidebar"
      >
        <Menu size={19} />
      </button>
      <div className="admin-clock" aria-live="polite">
        <span>{now.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "short", year: "numeric" })}</span>
        <b>{now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</b>
      </div>
      <div className="admin-notification-wrap">
        <button
          className="admin-bell"
          aria-label="Notifikasi"
          aria-expanded={notificationsOpen}
          onClick={() => setNotificationsOpen((value) => !value)}
        >
          <Bell size={17} />
          <i>3</i>
        </button>
        {notificationsOpen && (
          <div className="admin-notification-menu">
            <div className="admin-notification-heading">
              <b>Notifikasi</b>
              <span>3 baru</span>
            </div>
            {dummyNotifications.map((notification) => (
              <button key={notification.title} className="admin-notification-item">
                <span className="admin-notification-dot" />
                <span>
                  <b>{notification.title}</b>
                  <small>{notification.detail}</small>
                  <em>{notification.time}</em>
                </span>
              </button>
            ))}
            <button className="admin-notification-footer">Lihat semua notifikasi</button>
          </div>
        )}
      </div>
      <button className="admin-user" aria-label="Profil">
        <div>
          <b>Tri Handoko</b>
        </div>
        <CircleUserRound size={22} />
      </button>
    </header>
  );
}

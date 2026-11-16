import {
  Bell,
  CircleUserRound,
  FileBarChart,
  Menu,
  Search,
} from "lucide-react";

export default function AdminTopbar({ setOpen }) {
  return (
    <header className="admin-topbar">
      <button
        className="admin-mobile-menu"
        onClick={() => setOpen(true)}
        aria-label="Buka sidebar"
      >
        <Menu size={19} />
      </button>
      <button className="admin-bell mr-4" aria-label="Notifikasi">
        <Bell size={17} />
        <i>3</i>
      </button>
      <button className="admin-user" aria-label="Profil">
        <div>
          <b>Tri Handoko</b>
        </div>
        <CircleUserRound size={22} />
      </button>
    </header>
  );
}

import { Bell, CircleUserRound, FileBarChart, Menu, Search } from 'lucide-react';

export default function AdminTopbar({ setOpen }) {
  return <header className="admin-topbar"><button className="admin-mobile-menu" onClick={() => setOpen(true)} aria-label="Buka sidebar"><Menu size={19} /></button><div className="admin-search"><Search size={15} /></div><span className="server-status"><i /> Sistem Online • Server Desa</span><button className="export-button"><FileBarChart size={14} /> Ekspor Rekap</button><button className="manual-button">＋ Tambah Pengaduan Manual</button><button className="admin-bell" aria-label="Notifikasi"><Bell size={17} /><i>3</i></button><div className="admin-user"><div><b>Tri Handoko</b><small>Sekretaris Desa</small></div><span>Super Admin</span><CircleUserRound size={22} /></div></header>;
}

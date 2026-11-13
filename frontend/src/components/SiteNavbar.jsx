import { FileText, Menu, Plus, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function SiteNavbar({ dashboard = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="navbar"><Link className="brand" to="/"><span>SuaraDesa</span><small>Portal Aspirasi Warga</small></Link><nav className={`nav-links ${menuOpen ? 'is-open' : ''}`}><Link className={!dashboard ? 'active' : ''} to="/">Beranda</Link><Link to="/lapor">Buat Laporan</Link><a href="/#aspirasi">Aspirasi Warga</a><Link className={dashboard ? 'active' : ''} to="/dashboard">Laporan Saya</Link><a href="/#footer">Bantuan</a></nav><div className="nav-actions"><Link className="button button-dark" to="/lapor"><Icon icon={FileText} size={14} /> Buat Laporan Baru</Link><div className="profile"><UserRound size={19} /><b>Pak Joko</b></div></div><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Buka menu">{menuOpen ? <Icon icon={X} /> : <Icon icon={Menu} />}</button></header>;
}

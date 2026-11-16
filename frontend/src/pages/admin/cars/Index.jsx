import {
  Bell,
  CarFront,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Edit3,
  Eye,
  Filter,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../config/firebase.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import DatabaseLoading, { useMinimumLoading } from "../components/DatabaseLoading.jsx";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminTopbar from "../components/AdminTopbar.jsx";

const statusTone = {
  Tersedia: "available",
  Disewa: "rented",
  Servis: "service",
};

function formatPrice(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ status }) {
  return (
    <span className={`fleet-status ${statusTone[status]}`}>
      <i />
      {status}
    </span>
  );
}

export default function FleetManagementPage() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Semua Tipe");
  const [status, setStatus] = useState("Semua Status");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const showLoading = useMinimumLoading(loading);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "cars"),
      (snapshot) => {
        setCars(
          snapshot.docs.map((item) => {
            const data = item.data();
            const status =
              data.status ||
              (data.isAvailable === false ? "Disewa" : "Tersedia");
            return {
              id: item.id,
              name:
                data.name ||
                [data.brand, data.model].filter(Boolean).join(" ") ||
                "Tanpa nama",
              type: data.category || data.type || "-",
              year: data.year || data.productionYear || "-",
              plate: data.plateNumber || data.plate || "-",
              price: Number(data.pricePerDay ?? data.rentalRate ?? 0),
              status,
              bookings: Number(data.bookings ?? data.totalBookings ?? 0),
              tone: data.tone || "blue",
              imageUrl: data.imageUrl || "",
            };
          }),
        );
        setLoading(false);
        setLoadError("");
      },
      (error) => {
        console.error("Gagal memuat armada:", error);
        setLoadError(
          "Data armada gagal dimuat. Periksa koneksi atau permission Firestore.",
        );
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const filteredCars = useMemo(
    () =>
      cars.filter((car) => {
        const text = `${car.name} ${car.id} ${car.plate}`.toLowerCase();
        return (
          text.includes(query.toLowerCase()) &&
          (type === "Semua Tipe" || car.type === type) &&
          (status === "Semua Status" || car.status === status)
        );
      }),
    [cars, query, type, status],
  );

  const toggleSelected = (id) =>
    setSelected((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  const toggleAll = () =>
    setSelected(
      selected.length === filteredCars.length
        ? []
        : filteredCars.map((car) => car.id),
    );
  const reset = () => {
    setQuery("");
    setType("Semua Tipe");
    setStatus("Semua Status");
  };
  const removeCar = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "cars", deleteTarget.id));
      setSelected((items) => items.filter((item) => item !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Gagal menghapus armada:", error);
      setLoadError("Kendaraan gagal dihapus. Coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page fleet-page">
      {showLoading && <DatabaseLoading message="Memuat data armada..." />}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="admin-content">
        <AdminTopbar setOpen={setSidebarOpen} />
        <main className="fleet-main">
          <div className="fleet-heading">
            <div>
              <p className="fleet-eyebrow">OPERASIONAL RENTAL</p>
              <h1>Manajemen Armada</h1>
              <p>
                Kelola seluruh kendaraan, ketersediaan unit, dan informasi tarif
                rental Anda.
              </p>
            </div>
            <button
              className="fleet-primary"
              onClick={() => navigate("/admin/cars/create")}
            >
              <Plus size={15} /> Tambah Kendaraan
            </button>
          </div>
          <section className="fleet-kpis">
            <article>
              <span>
                Total Kendaraan <CarFront size={16} />
              </span>
              <b>{cars.length}</b>
              <small>Unit terdaftar dalam armada</small>
            </article>
            <article>
              <span>
                Unit Tersedia <CheckCircle2 size={16} />
              </span>
              <b>{cars.filter((car) => car.status === "Tersedia").length}</b>
              <small className="fleet-green">Siap menerima booking</small>
            </article>
            <article>
              <span>
                Sedang Disewa <Users size={16} />
              </span>
              <b>{cars.filter((car) => car.status === "Disewa").length}</b>
              <small>Unit sedang berjalan</small>
            </article>
            <article>
              <span>
                Dalam Servis <Settings size={16} />
              </span>
              <b className="fleet-orange">
                {cars.filter((car) => car.status === "Servis").length}
              </b>
              <small>Perlu perhatian teknisi</small>
            </article>
          </section>
          <section className="fleet-filter-card">
            <label className="fleet-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama kendaraan, ID, atau nomor polisi..."
              />
            </label>
            <label className="fleet-select">
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option>Semua Tipe</option>
                <option>MPV</option>
                <option>City Car</option>
                <option>SUV</option>
              </select>
              <ChevronDown size={14} />
            </label>
            <label className="fleet-select">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option>Semua Status</option>
                <option>Tersedia</option>
                <option>Disewa</option>
                <option>Servis</option>
              </select>
              <ChevronDown size={14} />
            </label>
            <button className="fleet-reset" onClick={reset}>
              <Filter size={13} /> Reset
            </button>
          </section>
          <section className="fleet-table-card">
            <div className="fleet-table-heading">
              <h2>
                Daftar Kendaraan{" "}
                <small>
                  {filteredCars.length} dari {cars.length} unit
                </small>
              </h2>
              <span>
                {loading ? "Memuat data..." : "Sinkron dengan Firestore"}
              </span>
            </div>
            {loadError && <p className="fleet-error-banner">{loadError}</p>}
            <div className="fleet-table-wrap">
              <table className="fleet-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          filteredCars.length > 0 &&
                          selected.length === filteredCars.length
                        }
                        onChange={toggleAll}
                        aria-label="Pilih semua kendaraan"
                      />
                    </th>
                    <th>KENDARAAN</th>
                    <th>ID ARMADA</th>
                    <th>TIPE / TAHUN</th>
                    <th>TARIF HARIAN</th>
                    <th>BOOKING</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="fleet-empty">
                        Memuat data armada...
                      </td>
                    </tr>
                  ) : filteredCars.length ? (
                    filteredCars.map((car) => (
                      <tr key={car.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(car.id)}
                            onChange={() => toggleSelected(car.id)}
                            aria-label={`Pilih ${car.name}`}
                          />
                        </td>
                        <td>
                          <div className="fleet-car-name">
                            {car.imageUrl ? (
                              <img
                                className="fleet-car-icon"
                                src={car.imageUrl}
                                alt=""
                              />
                            ) : (
                              <span className={`fleet-car-icon ${car.tone}`}>
                                <CarFront size={18} />
                              </span>
                            )}
                            <div>
                              <b>{car.name}</b>
                              <small>{car.plate}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code>{car.id}</code>
                        </td>
                        <td>
                          <b>{car.type}</b>
                          <small className="fleet-muted">
                            Tahun {car.year}
                          </small>
                        </td>
                        <td>
                          <strong>{formatPrice(car.price)}</strong>
                          <small className="fleet-muted">per 24 jam</small>
                        </td>
                        <td>
                          <b>{car.bookings}</b>
                          <small className="fleet-muted">booking selesai</small>
                        </td>
                        <td>
                          <StatusBadge status={car.status} />
                        </td>
                        <td>
                          <div className="fleet-actions">
                            <button aria-label={`Lihat ${car.name}`}>
                              <Eye size={15} />
                            </button>
                            <button
                              aria-label={`Edit ${car.name}`}
                              onClick={() =>
                                navigate(`/admin/cars/${car.id}/edit`)
                              }
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              aria-label={`Hapus ${car.name}`}
                              onClick={() => setDeleteTarget(car)}
                            >
                              <Trash2 size={14} />
                            </button>
                            <MoreVertical size={15} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="fleet-empty">
                        Belum ada kendaraan di Firestore.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="fleet-pagination">
              <span>
                Menampilkan <b>{filteredCars.length}</b> dari{" "}
                <strong>{cars.length} kendaraan</strong>
              </span>
              <div>
                <button disabled>‹</button>
                <button className="current">1</button>
                <button disabled>›</button>
              </div>
            </div>
          </section>
        </main>
      </div>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus armada?"
        message={deleteTarget ? `Kendaraan ${deleteTarget.name} akan dihapus permanen dari database.` : ""}
        confirmLabel="Ya, hapus armada"
        loading={deleting}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={removeCar}
      />
    </div>
  );
}

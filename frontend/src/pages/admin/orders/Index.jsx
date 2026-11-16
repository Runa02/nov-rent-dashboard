import {
  CalendarDays,
  CarFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CornerUpRight,
  Eye,
  Filter,
  LayoutList,
  Search,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../config/firebase.js";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminTopbar from "../components/AdminTopbar.jsx";
import DatabaseLoading, { useMinimumLoading } from "../components/DatabaseLoading.jsx";

const tone = {
  "Menunggu Pembayaran": "text-indigo-700 bg-indigo-100",
  "Sudah Dibayar": "text-emerald-700 bg-emerald-100",
  "Pembayaran Gagal": "text-red-700 bg-red-100",
  Dibatalkan: "text-slate-500 bg-slate-100",
};
const money = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const displayLabel = (value) =>
  String(value || "-")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const asDateText = (value) => {
  if (!value) return "-";
  if (typeof value?.toDate === "function") {
    return value
      .toDate()
      .toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  }
  if (value instanceof Date) return value.toLocaleString("id-ID");
  return String(value);
};

function normalizeOrder(snapshot) {
  const data = snapshot.data();
  const customer = data.customer || data.user || {};
  const vehicle = data.vehicle || data.car || {};
  const start = data.startDate || data.pickupDate || data.rentalStart;
  const end = data.endDate || data.returnDate || data.rentalEnd;
  const startText = asDateText(start);
  const endText = asDateText(end);
  return [
    data.orderId || data.bookingId || data.id || snapshot.id,
    data.customerName ||
      data.userName ||
      customer.name ||
      data.name ||
      "Pelanggan",
    data.customerEmail || data.userEmail || customer.email || data.email || "-",
    data.vehicleName ||
      data.carName ||
      vehicle.name ||
      data.vehicleType ||
      "Kendaraan",
    data.plateNumber || data.plate || vehicle.plateNumber || "-",
    data.period ||
      (startText !== "-" || endText !== "-"
        ? `${startText} - ${endText}`
        : "-"),
    data.totalDays || data.duration || data.days || "-",
    Number(
      data.totalAmount ?? data.totalPrice ?? data.amount ?? data.price ?? 0,
    ),
    data.paymentMethod || data.methodPayment || data.payment_type || "-",
    data.paymentStatus ||
      data.statusPayment ||
      data.payment_status ||
      data.status ||
      "Menunggu Pembayaran",
    data.serviceType || data.rentalType || data.service || "Lepas Kunci",
    data.serviceNote || data.deliveryMethod || data.pickupLocation || "-",
    asDateText(data.createdAt || data.createdDate || data.orderDate),
    snapshot.id,
  ];
}

function PaymentBadge({ status }) {
  return (
    <span
      className={`inline-flex max-w-[120px] items-center gap-1 rounded-full px-1.5 py-1 font-bold leading-tight ${tone[status] || "text-slate-700 bg-slate-100"}`}
    >
      <i className="h-1 w-1 shrink-0 rounded-full bg-current" />
      {displayLabel(status)}
    </span>
  );
}

export default function OrderManagementPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("Semua Status Pembayaran");
  const [status, setStatus] = useState("Semua Status Sewa");
  const [service, setService] = useState("Metode Pembayaran");
  const [page, setPage] = useState(1);
  const showLoading = useMinimumLoading(loading);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        setOrders(snapshot.docs.map(normalizeOrder));
        setLoading(false);
        setLoadError("");
      },
      (error) => {
        console.error("Gagal memuat pesanan dari Firestore:", error);
        setOrders([]);
        setLoading(false);
        setLoadError(
          "Data pesanan gagal dimuat dari Firestore. Periksa koleksi orders dan permission database.",
        );
      },
    );
    return unsubscribe;
  }, []);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const text = order.slice(0, 4).join(" ").toLowerCase();
        return (
          text.includes(query.toLowerCase()) &&
          (payment === "Semua Status Pembayaran" || order[9] === payment) &&
          (service === "Metode Pembayaran" || order[8] === service) &&
          (status === "Semua Status Sewa" || order[9] === status)
        );
      }),
    [orders, query, payment, status, service],
  );
  const waitingCount = orders.filter(
    (order) =>
      order[9] === "Menunggu Pembayaran" || order[9] === "Menunggu Konfirmasi",
  ).length;
  const activeCount = orders.filter((order) =>
    ["Aktif", "Sedang Disewa", "Berjalan"].includes(order[9]),
  ).length;
  const totalRevenue = orders.reduce((total, order) => total + order[7], 0);
  const reset = () => {
    setQuery("");
    setPayment("Semua Status Pembayaran");
    setStatus("Semua Status Sewa");
    setService("Metode Pembayaran");
    setPage(1);
  };
  const exportData = () => {
    const csv = [
      "ID, pelanggan, kendaraan, status pembayaran, total",
      ...filteredOrders.map((order) =>
        [order[0], order[1], order[3], order[9], order[7]].join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "data-pesanan-nov-rent.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const inputClass =
    "h-7 rounded-md border-0 bg-indigo-50 px-2 text-slate-600 outline-none";
  const muted = "mt-1 block text-slate-400";

  return (
    <div className="admin-page bg-[#f7f8fe] text-slate-700">
      {showLoading && <DatabaseLoading message="Memuat data pesanan..." />}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="admin-content">
        <AdminTopbar setOpen={setSidebarOpen} />
        <main className="pb-8 pt-[78px] text-[11px] sm:px-7 [&_button]:text-[10px] [&_input]:text-[11px] [&_select]:text-[11px] [&_small]:text-[10px] [&_td]:text-[11px] [&_th]:text-[10px]">
          <div className="mb-5 flex w-full flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="mb-1 font-extrabold tracking-[.09em] text-blue-600">
                OPERASIONAL RENTAL
              </p>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
                Manajemen Pesanan
              </h1>
              <p className="mt-1 text-[9px] text-slate-400">
                Kelola transaksi penyewaan kendaraan, pembayaran, dan status
                pesanan pelanggan.
              </p>
            </div>
          </div>
          <section className="mx-auto mb-3 flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-100 bg-white p-2 xl:flex-nowrap">
            <label className={`${inputClass} flex min-w-[220px] flex-[1.7] items-center gap-1`}>
              <Search size={14} className="text-slate-400" />
              <input
                className="w-full bg-transparent outline-none"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama pelanggan, kendaraan, atau ID pesanan..."
              />
            </label>
            {[
              [
                payment,
                setPayment,
                [
                  "Semua Status Pembayaran",
                  "Menunggu Pembayaran",
                  "Sudah Dibayar",
                  "Pembayaran Gagal",
                  "Dibatalkan",
                ],
              ],
              [
                status,
                setStatus,
                ["Semua Status Sewa", "Sudah Dibayar", "Menunggu Pembayaran"],
              ],
              [
                service,
                setService,
                [
                  "Metode Pembayaran",
                  "BCA Virtual Account",
                  "Mandiri VA",
                  "QRIS Dinamis",
                  "Kartu Kredit",
                  "GoPay",
                ],
              ],
            ].map(([value, setter, options]) => (
              <label key={value} className="relative min-w-[140px] flex-1">
                <select
                  className={`${inputClass} w-full appearance-none pr-6`}
                  value={value}
                  onChange={(event) => setter(event.target.value)}
                >
                  {options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2 top-2 text-slate-400"
                />
              </label>
            ))}
            <div className="flex shrink-0 gap-1">
              <button
                className={`${inputClass} inline-flex items-center gap-1 px-2`}
              >
                <CalendarDays size={12} /> 11 Nov 2026 - 18 Nov 2026
              </button>
              <button
                onClick={reset}
                className={`${inputClass} inline-flex items-center gap-1 px-2 hover:bg-indigo-100`}
              >
                <Filter size={12} /> Reset Filter
              </button>
            </div>
          </section>
          <section className="mx-auto overflow-hidden rounded-lg border border-slate-100 bg-white">
            <div className="flex items-center justify-between p-3">
              <h2 className="text-[10px] font-bold text-slate-700">
                Daftar Pesanan{" "}
                <small className="ml-1 rounded bg-indigo-50 px-1.5 py-1 font-normal text-slate-500">
                  {filteredOrders.length} dari {orders.length} pesanan
                </small>
              </h2>
              <span className="hidden items-center gap-1 text-slate-500 sm:inline-flex">
                <i className="h-1 w-1 rounded-full bg-emerald-600" /> Sinkron
                dengan Firestore · Live update
              </span>
            </div>
            {loadError && (
              <div className="mx-3 mb-3 rounded-lg border border-red-100 bg-red-50 p-3 text-[10px] text-red-700">
                {loadError}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] table-fixed border-collapse text-left">
                <thead>
                  <tr className="bg-indigo-50/60 text-slate-500">
                    <th className="w-8 pl-3">
                      <input type="checkbox" aria-label="Pilih semua pesanan" />
                    </th>
                    {[
                      "PELANGGAN",
                      "KENDARAAN",
                      "PERIODE SEWA",
                      "TOTAL PEMBAYARAN",
                      "STATUS PEMBAYARAN",
                      "LAYANAN",
                      "AKSI",
                    ].map((title) => (
                      <th key={title} className="p-2">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan="8"
                        className="p-8 text-center text-slate-400"
                      >
                        Memuat pesanan dari Firestore...
                      </td>
                    </tr>
                  )}
                  {filteredOrders
                    .slice((page - 1) * 5, page * 5)
                    .map((order) => (
                      <tr
                        key={order[0]}
                        className="border-t border-slate-100 text-slate-600"
                      >
                        <td className="pl-3">
                          <input
                            type="checkbox"
                            aria-label={`Pilih ${order[0]}`}
                          />
                        </td>
                        <td className="p-2">
                          <b className="block text-slate-700">{order[1]}</b>
                          <small className={muted}>{order[2]}</small>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1.5">
                            <span className="grid h-6 w-8 shrink-0 place-items-center rounded bg-gradient-to-br from-slate-200 to-slate-400 text-slate-600">
                              <CarFront size={18} />
                            </span>
                            <div className="min-w-0">
                              <b className="block truncate text-slate-700">
                                {order[3]}
                              </b>
                              <small className={muted}>{order[4]} · 2024</small>
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <b className="block text-slate-700">{order[5]}</b>
                          <small className={muted}>{order[6]}</small>
                        </td>
                        <td className="p-2">
                          <strong className="block text-slate-700">
                            {money(order[7])}
                          </strong>
                          <small className={muted}>{order[8]}</small>
                        </td>
                        <td className="p-2">
                          <PaymentBadge status={order[9]} />
                        </td>
                        <td className="p-2">
                          <b className="block w-max rounded bg-indigo-50 px-1 py-1 font-bold text-indigo-700">
                            {displayLabel(order[10])}
                          </b>
                          <small className={muted}>{displayLabel(order[11])}</small>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                window.alert(`Detail pesanan ${order[0]}`)
                              }
                              className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-2 font-bold text-indigo-700 hover:bg-indigo-200"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/orders/${order[13] || order[0]}/confirm`,
                                )
                              }
                              className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-2 font-bold text-green-700 hover:bg-green-200"
                              aria-label={`Konfirmasi pesanan ${order[0]}`}
                            >
                              <CornerUpRight size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!filteredOrders.length && (
              <div className="p-8 text-center text-[9px] text-slate-400">
                Pesanan tidak ditemukan. Coba ubah kata kunci atau filter.
              </div>
            )}
            <div className="flex items-center justify-between p-3 text-slate-400">
              <span>
                Menampilkan{" "}
                <b>
                  {filteredOrders.length ? (page - 1) * 5 + 1 : 0}-
                  {Math.min(page * 5, filteredOrders.length)}
                </b>{" "}
                dari <strong>{filteredOrders.length} pesanan</strong>
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((value) => value - 1)}
                  className="grid h-5 w-5 place-items-center rounded border border-slate-200 disabled:opacity-40"
                >
                  <ChevronLeft size={13} />
                </button>
                <button className="grid h-5 w-5 place-items-center rounded border border-blue-600 bg-blue-600 text-white">
                  {page}
                </button>
                <button
                  disabled={page * 5 >= filteredOrders.length}
                  onClick={() => setPage((value) => value + 1)}
                  className="grid h-5 w-5 place-items-center rounded border border-slate-200 disabled:opacity-40"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

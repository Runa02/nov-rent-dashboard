import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Download,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../../config/firebase.js";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminTopbar from "../components/AdminTopbar.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import DatabaseLoading, {
  useMinimumLoading,
} from "../components/DatabaseLoading.jsx";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const dateText = (value) => {
  if (!value) return "-";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  return String(value);
};

const initials = (name) =>
  String(name || "Pelanggan")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function normalizeBooking(id, data) {
  const customer = data.customer || data.user || {};
  const vehicle = data.vehicle || data.car || {};
  const start = data.startDate || data.pickupDate || data.rentalStart;
  const end = data.endDate || data.returnDate || data.rentalEnd;
  const startText = dateText(start);
  const endText = dateText(end);
  const customerName =
    data.customerName ||
    data.userName ||
    customer.name ||
    data.name ||
    "Pelanggan";
  const total = Number(
    data.grandTotal ??
      data.totalAmount ??
      data.totalPrice ??
      data.amount ??
      data.price ??
      0,
  );
  const insuranceAmount = Number(
    data.insuranceFee ?? data.insuranceAmount ?? data.insurance ?? 0,
  );
  const driverFee = Number(data.driverFee ?? data.driverPrice ?? 0);
  const deliveryFee = Number(data.deliveryFee ?? data.deliveryPrice ?? 0);
  const baseAmount = Number(
    data.rentalFee ??
      data.rentalAmount ??
      data.rentalTotal ??
      data.subtotal ??
      data.baseAmount ??
      Math.max(total - insuranceAmount - driverFee - deliveryFee, 0),
  );

  return {
    id: data.orderId || data.bookingId || data.id || `#${id}`,
    ref: id,
    customer: customerName,
    email:
      data.customerEmail ||
      data.userEmail ||
      customer.email ||
      data.email ||
      "-",
    phone:
      data.customerPhone ||
      data.userPhone ||
      customer.phone ||
      data.phone ||
      "-",
    car:
      data.vehicleName ||
      data.carName ||
      vehicle.name ||
      data.vehicleType ||
      "Kendaraan",
    plate: data.plateNumber || data.plate || vehicle.plateNumber || "-",
    period:
      data.period ||
      (startText !== "-" || endText !== "-"
        ? `${startText} - ${endText}`
        : "-"),
    total,
    status:
      data.orderStatus ||
      data.statusOrder ||
      data.status ||
      "Menunggu Konfirmasi",
    paymentStatus:
      data.paymentStatus ||
      data.statusPayment ||
      data.payment_status ||
      data.status ||
      "Menunggu Pembayaran",
    payment:
      data.paymentMethod || data.methodPayment || data.payment_type || "-",
    service:
      data.serviceType || data.rentalType || data.service || "Lepas Kunci",
    serviceNote:
      data.serviceNote || data.deliveryMethod || data.pickupLocation || "-",
    vehicleYear: data.vehicleYear || vehicle.year || "-",
    baseAmount,
    insuranceAmount,
    driverFee,
    deliveryFee,
    created: dateText(data.createdAt || data.createdDate || data.orderDate),
    uploaded: dateText(
      data.paymentUploadedAt || data.proofUploadedAt || data.updatedAt,
    ),
    receipt:
      data.paymentProofUrl ||
      data.paymentReceiptUrl ||
      data.proofUrl ||
      data.transferProofUrl ||
      "",
    bank: data.bankName || data.paymentBank || "-",
    account:
      data.destinationAccount || data.bankAccount || data.virtualAccount || "-",
    reference:
      data.paymentReference ||
      data.transactionId ||
      data.referenceNumber ||
      "-",
    sender: data.senderName || customerName,
    transferDate: dateText(
      data.paymentUploadedAt || data.paidAt || data.paymentDate,
    ),
    raw: data,
  };
}

function normalizeUserProfile(data, booking) {
  const user = data.user || data.customer || {};
  const documents = [
    ["KTP", "ktpUrl"],
    ["Selfie", "selfieUrl"],
    ["SIM", "simUrl"],
  ].map(([label, field]) => ({
    label,
    field,
    status: data[field] || user[field] ? "Tersedia" : "Tidak tersedia",
    url: data[field] || user[field] || "",
  }));
  return {
    name: user.name || data.customerName || data.userName || booking.customer,
    email: user.email || data.customerEmail || data.userEmail || booking.email,
    phone: user.phone || data.customerPhone || data.userPhone || booking.phone,
    role: user.role || data.role || "customer",
    verificationStatus:
      user.verificationStatus ||
      data.verificationStatus ||
      "Belum diverifikasi",
    createdAt: dateText(user.createdAt || data.userCreatedAt),
    verificationSubmittedAt: dateText(
      user.verificationSubmittedAt || data.verificationSubmittedAt,
    ),
    rejectionReason: user.rejectionReason || data.rejectionReason || "",
    documents,
  };
}

async function fetchUserProfile(orderData, booking) {
  const nestedUser = orderData.user || orderData.customer || {};
  const userId =
    orderData.userId ||
    orderData.uid ||
    orderData.customerId ||
    orderData.userUid ||
    nestedUser.id ||
    nestedUser.uid;

  if (userId) {
    const userSnapshot = await getDoc(doc(db, "users", String(userId)));
    if (userSnapshot.exists()) return userSnapshot.data();
  }

  const email =
    orderData.customerEmail ||
    orderData.userEmail ||
    nestedUser.email ||
    booking.email;
  if (!email || email === "-") return null;

  const userQuery = query(collection(db, "users"), where("email", "==", email));
  const userSnapshot = await getDocs(userQuery);
  return userSnapshot.docs[0]?.data() || null;
}

function Card({ title, icon: Icon, children, action, hidden = false }) {
  const [open, setOpen] = useState(true);

  return (
    <section
      className={`${hidden ? "hidden" : ""} rounded-lg border border-slate-200 bg-white p-4 text-[11px] leading-4 sm:p-5`}
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-[12px] font-bold text-slate-800 sm:text-[13px]"
        >
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
            <Icon size={13} />
          </span>
          <span className="truncate">{title}</span>
          <ChevronDown
            size={15}
            className={`ml-auto shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {action}
      </div>
      {open && <div>{children}</div>}
    </section>
  );
}

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [booking, setBooking] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [userRecord, setUserRecord] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const showLoading = useMinimumLoading(loading || paymentLoading);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!id) {
      setLoadError("ID pesanan tidak ditemukan.");
      setLoading(false);
      setPaymentLoading(false);
      return undefined;
    }
    const unsubscribeOrder = onSnapshot(
      doc(db, "orders", id),
      (snapshot) => {
        if (!snapshot.exists()) {
          setBooking(null);
          setLoadError("Pesanan tidak ditemukan di Firestore.");
        } else {
          const data = snapshot.data();
          const normalizedBooking = normalizeBooking(snapshot.id, data);
          setBooking(normalizedBooking);
          fetchUserProfile(data, normalizedBooking)
            .then(setUserRecord)
            .catch((error) => {
              console.error("Gagal memuat profil pengguna:", error);
              setUserRecord(null);
            });
          setLoadError("");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Gagal memuat detail pesanan:", error);
        setBooking(null);
        setLoadError(
          "Detail pesanan gagal dimuat. Periksa permission Firestore.",
        );
        setLoading(false);
      },
    );
    const paymentQuery = query(
      collection(db, "payments"),
      where("orderId", "==", id),
    );
    const unsubscribePayment = onSnapshot(
      paymentQuery,
      (snapshot) => {
        setPaymentData(snapshot.docs[0]?.data() || null);
        setPaymentLoading(false);
      },
      (error) => {
        console.error("Gagal memuat bukti pembayaran:", error);
        setPaymentData(null);
        setPaymentLoading(false);
      },
    );
    return () => {
      unsubscribeOrder();
      unsubscribePayment();
    };
  }, [id]);

  const userProfile = booking
    ? normalizeUserProfile(
        {
          ...booking.raw,
          user: {
            ...(booking.raw.user || {}),
            ...(booking.raw.customer || {}),
            ...(userRecord || {}),
          },
        },
        booking,
      )
    : null;
  const paymentAmount = Number(paymentData?.amount ?? booking?.total ?? 0);
  const invoiceAmount = Number(booking?.total || paymentAmount);
  const paymentBank = paymentData?.bankName || booking?.bank || "-";
  const paymentAccount = paymentData?.accountNumber || booking?.account || "-";
  const paymentSender = paymentData?.accountHolder || booking?.sender || "-";
  const paymentReference =
    paymentData?.referenceNumber ||
    paymentData?.transactionId ||
    booking?.reference ||
    "-";
  const paymentMethod = paymentData?.method || booking?.payment || "-";
  const paymentProof = paymentData?.proofImageUrl || booking?.receipt || "";
  const paymentDate = dateText(paymentData?.createdAt || booking?.transferDate);
  const paymentStatus = String(
    paymentData?.status || booking?.paymentStatus || "pending",
  )
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const availableDocuments = userProfile?.documents.filter(
    (document) => document.url,
  ).length;
  const userIsVerified = [
    "verified",
    "terverifikasi",
    "sudah diverifikasi",
  ].includes(
    String(userProfile?.verificationStatus || "")
      .trim()
      .toLowerCase(),
  );

  const updateOrderStatus = async (updates) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, "orders", id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Gagal memperbarui status pesanan:", error);
      window.alert("Status pesanan gagal diperbarui di Firestore.");
      return false;
    }
  };

  const submitReject = async (event) => {
    event.preventDefault();
    if (!reason.trim()) return;
    const saved = await updateOrderStatus({
      paymentStatus: "Pembayaran Gagal",
      statusPayment: "Pembayaran Gagal",
      rejectionReason: reason.trim(),
    });
    if (!saved) return;
    setRejectOpen(false);
    setReason("");
    window.alert("Pesanan ditolak dan alasan berhasil disimpan.");
  };

  const confirmOrder = async () => {
    const missingDocuments =
      userProfile?.documents
        .filter((document) => !document.url)
        .map((document) => document.label) || [];

    if (!userIsVerified || missingDocuments.length > 0) {
      const reasons = [];
      if (!userIsVerified) {
        reasons.push("status pengguna belum terverifikasi");
      }
      if (missingDocuments.length > 0) {
        reasons.push("dokumen belum tersedia: " + missingDocuments.join(", "));
      }

      setValidationMessage(reasons.join(" dan "));
      setValidationDialogOpen(true);
      return;
    }

    const saved = await updateOrderStatus({
      paymentStatus: "Sudah Dibayar",
      statusPayment: "Sudah Dibayar",
      orderStatus: "Dikonfirmasi",
    });
    if (saved) setConfirmed(true);
  };

  if (showLoading) {
    return <DatabaseLoading message="Memuat detail pesanan..." />;
  }

  if (!booking || !userProfile) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8fe] p-6 text-center text-sm text-slate-500">
        <div>
          <p>{loadError || "Detail pesanan tidak tersedia."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page min-h-screen bg-[#f7f8fe] text-slate-700">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="admin-content">
        <AdminTopbar setOpen={setSidebarOpen} />
        <main className="w-full px-4 pb-8 pt-[78px] text-[11px] leading-4 sm:px-7">
          <div className="mx-auto mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-extrabold tracking-tight text-slate-800 sm:text-lg">
                  Konfirmasi Pembayaran
                </h1>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
                  ● Menunggu Konfirmasi
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Periksa bukti transfer pelanggan dan lakukan verifikasi
                pembayaran secara akurat.
              </p>
            </div>
            <span className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-600 sm:block">
              Pesanan: <b>{booking.id}</b>
            </span>
          </div>
          <div className="mx-auto mb-4 flex rounded-lg border border-slate-200 bg-white p-1">
            {[
              [1, "Konfirmasi Tahap 1", "Bukti & detail pesanan"],
              [2, "Konfirmasi Tahap 2", "Pembayaran & keputusan"],
            ].map(([step, title, description]) => (
              <button
                key={step}
                type="button"
                onClick={() => setActiveStep(step)}
                className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-3 py-2 text-left transition ${activeStep === step ? "bg-blue-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${activeStep === step ? "bg-white text-slate-800" : "bg-slate-100 text-slate-500"}`}
                >
                  {step}
                </span>
                <span className="min-w-0">
                  <b className="block text-[10px]">{title}</b>
                  <small
                    className={`block truncate text-[9px] ${activeStep === step ? "text-slate-300" : "text-slate-400"}`}
                  >
                    {description}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <div className="mx-auto grid grid-cols-1 gap-3">
            <div className={activeStep === 1 ? "contents" : "hidden"}>
              <Card title="Bukti Pembayaran Pelanggan" icon={ImageIcon}>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-3">
                    {paymentProof ? (
                      <a
                        href={paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="block max-h-[520px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
                      >
                        <img
                          src={paymentProof}
                          alt="Bukti pembayaran pelanggan"
                          className="max-h-[520px] w-full object-contain"
                        />
                      </a>
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="mx-auto mb-2" size={24} />
                        Bukti pembayaran belum tersedia.
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg text-sm border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between border-b pb-3">
                      <span className="font-bold text-blue-700">
                        {paymentBank}{" "}
                        <small className="text-[8px]">Transfer</small>
                      </span>
                      <span className="text-[8px] text-slate-400">
                        {paymentDate}
                      </span>
                    </div>
                    <div className="space-y-2 text-slate-500">
                      <div className="flex justify-between">
                        <span>Status</span>
                        <b className="text-amber-600">{paymentStatus}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Jenis Transaksi</span>
                        <b className="text-slate-700">
                          Transfer ke {paymentMethod}
                        </b>
                      </div>
                      <div className="flex justify-between">
                        <span>Pengirim</span>
                        <b className="text-slate-700">{paymentSender}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>Rekening Tujuan</span>
                        <b className="text-slate-700">{paymentAccount}</b>
                      </div>
                      <div className="flex justify-between">
                        <span>No. Referensi</span>
                        <b className="text-slate-700">{paymentReference}</b>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between rounded bg-slate-100 px-3 py-2">
                      <span>Jumlah Transfer</span>
                      <b className="text-blue-700">{rupiah(paymentAmount)}</b>
                    </div>
                    <button className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-md border border-slate-200 bg-white py-2 font-semibold text-slate-600">
                      <Download size={12} /> Unduh Berkas
                    </button>
                  </div>
                </div>
              </Card>
              <Card title="Informasi Verifikasi Transfer" icon={ClipboardCheck}>
                <div className="text-sm">
                  <p className="mb-3 text-slate-400">
                    Bandingkan data slip pelanggan dengan mutasi rekening masuk
                    NOV Rent.
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <span className="block text-slate-400">
                        METODE PEMBAYARAN
                      </span>
                      <b className="mt-1 block text-indigo-700">
                        {paymentMethod}
                      </b>
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <span className="block text-slate-400">
                        REKENING TUJUAN PERUSAHAAN
                      </span>
                      <b className="mt-1 block text-indigo-700">
                        {paymentAccount}
                      </b>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <span className="block text-slate-400">
                        NOMINAL TAGIHAN RESMI
                      </span>
                      <b className="mt-1 block text-slate-800">
                        {rupiah(invoiceAmount)}
                      </b>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <span className="block text-slate-400">
                        NOMINAL TRANSFER PELANGGAN
                      </span>
                      <b className="mt-1 block text-emerald-700">
                        {rupiah(paymentAmount)}{" "}
                        <span className="ml-1 rounded bg-emerald-500 px-1 text-[7px] text-white">
                          Cocok 100%
                        </span>
                      </b>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <span className="block text-slate-400">
                        NAMA REKENING PENGIRIM
                      </span>
                      <b>{paymentSender}</b>
                    </div>
                    <div>
                      <span className="block text-slate-400">
                        TANGGAL / WAKTU TRANSFER
                      </span>
                      <b>{paymentDate}</b>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-amber-800">
                    <CircleAlert size={14} className="shrink-0" />
                    <span>
                      <b>Perhatian Prosedur Admin:</b>
                      <br />
                      Pastikan nominal pembayaran dan nomor rekening tujuan
                      sesuai dengan invoice.
                    </span>
                  </div>
                </div>
              </Card>
              <Card title="Detail Kendaraan Sewa" icon={CarFront}>
                <div className="text-sm">
                  <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <span className="grid h-14 w-20 place-items-center rounded bg-gradient-to-br from-slate-200 to-slate-400 text-slate-600">
                      <CarFront size={28} />
                    </span>
                    <div>
                      <b className="block">{booking.car}</b>
                      <span className="block text-slate-400">
                        {booking.plate} · Tahun {booking.vehicleYear}
                      </span>
                      <span className="mt-1 inline-block rounded bg-indigo-600 px-2 py-1 font-bold text-white">
                        {booking.service}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-slate-400">
                        Layanan / Lokasi
                      </span>
                      <b>{booking.serviceNote}</b>
                    </div>
                    <div>
                      <span className="block text-slate-400">Periode Sewa</span>
                      <b>{booking.period}</b>
                    </div>
                  </div>
                </div>
              </Card>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-blue-800"
                >
                  Selanjutnya <ArrowRight size={14} />
                </button>
              </div>
            </div>
            <div className={activeStep === 2 ? "contents" : "hidden"}>
              <Card title="Rincian Pembayaran" icon={FileText}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sewa Kendaraan</span>
                    <b>{rupiah(booking.baseAmount)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Asuransi</span>
                    <b>{rupiah(booking.insuranceAmount)}</b>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Jasa Sopir / Driver</span>
                    <b>{rupiah(booking.driverFee)}</b>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Biaya Pengantaran Unit</span>
                    <b>{rupiah(booking.deliveryFee)}</b>
                  </div>
                  <div className="mt-3 flex justify-between rounded bg-slate-100 p-3 font-bold">
                    <span>Total Pembayaran</span>
                    <b className="text-blue-700">{rupiah(invoiceAmount)}</b>
                  </div>
                </div>
              </Card>
              <Card title="Data Pengguna" icon={BadgeCheck}>
                <div className="mb-3 flex text-sm items-center gap-3 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-slate-50 p-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-extrabold text-white shadow-sm">
                    {initials(userProfile.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-[13px] text-slate-800">
                      {userProfile.name}
                    </b>
                    <span className="block truncate text-slate-500">
                      {userProfile.email} • {userProfile.phone}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${userIsVerified ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                  >
                    {userProfile.verificationStatus}
                  </span>
                </div>
                <div className="mt-3 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <b className="block text-emerald-900">
                        Dokumen Verifikasi Pengguna
                      </b>
                      <span className="text-[10px] text-emerald-700/70">
                        Dokumen identitas yang diunggah pelanggan
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                      {availableDocuments} / {userProfile.documents.length}{" "}
                      tersedia
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {userProfile.documents.map((document) => (
                      <div
                        key={document.field}
                        className={`rounded-xl border p-3 text-center ${document.url ? "border-emerald-100 bg-white" : "border-slate-100 bg-slate-50/70"}`}
                      >
                        <FileText
                          size={16}
                          className={`mx-auto mb-2 ${document.url ? "text-emerald-600" : "text-slate-400"}`}
                        />
                        <b className="block text-slate-700">{document.label}</b>
                        <span
                          className={`mt-1 block ${document.url ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {document.status}
                        </span>
                        {document.url && (
                          <a
                            href={document.url}
                            download={`${document.label.toLowerCase()}-${userProfile.name.replace(/\\s+/g, "-")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mx-auto mt-3 inline-flex w-full max-w-[132px] items-center justify-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                          >
                            <Download size={12} /> Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => navigate("/admin/orders")}
                  className="mb-2 flex items-center justify-center gap-1 rounded-md bg-gray-600 py-2.5 px-2.5 font-bold text-white hover:bg-gray-700 disabled:bg-gray-300"
                >
                  <ArrowLeft size={14} /> Kembali
                </button>
                <button
                  onClick={() => setRejectOpen(true)}
                  className="mb-2 flex items-center justify-center gap-1 rounded-md bg-red-600 py-2.5 px-2.5 font-bold text-white hover:bg-red-700 disabled:bg-red-300"
                >
                  <X size={13} /> Tolak Bukti Transfer
                </button>
                <button
                  onClick={confirmOrder}
                  disabled={confirmed}
                  className="mb-2 flex items-center justify-center gap-1 rounded-md bg-emerald-600 py-2.5 px-2.5 font-bold text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                >
                  <CheckCircle2 size={13} />{" "}
                  {confirmed ? "Pesanan Dikonfirmasi" : "Konfirmasi Pesanan"}
                </button>
              </div>
            </div>
          </div>
          {rejectOpen && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
              <form
                onSubmit={submitReject}
                className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-xl bg-white p-5 shadow-2xl"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">
                      Tolak Bukti Transfer
                    </h2>
                    <p className="mt-1 text-slate-400">
                      Berikan alasan agar pelanggan dapat memperbaiki
                      pembayaran.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRejectOpen(false)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <X size={17} />
                  </button>
                </div>
                <label className="block font-bold text-slate-700">
                  Alasan penolakan <span className="text-red-500">*</span>
                  <textarea
                    required
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    placeholder="Contoh: Nominal transfer tidak sesuai dengan total tagihan..."
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 p-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                  >
                    Tolak Pesanan
                  </button>
                </div>
              </form>
            </div>
          )}
          <ConfirmDialog
            open={validationDialogOpen}
            title="Data pengguna belum lengkap"
            message={
              "Konfirmasi pesanan tidak dapat dilanjutkan karena " +
              validationMessage +
              "."
            }
            confirmLabel="Mengerti"
            cancelLabel="Tutup"
            onConfirm={() => setValidationDialogOpen(false)}
            onCancel={() => setValidationDialogOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}

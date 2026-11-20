import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bytes,
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  ArrowLeft,
  FileText,
  IdCard,
  Image as ImageIcon,
  Save,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { auth, db } from "../../../config/firebase.js";
import { uploadImage } from "../../../config/cloudinary.js";
import DatabaseLoading from "../components/DatabaseLoading.jsx";
import { DriverPage, driverStatuses, readDriver } from "./Index.jsx";

const chunkBytes = 512 * 1024;
const documentKinds = ["ktp", "sim"];
const uploadedPhotos = new WeakMap();

async function uploadPhoto(file) {
  if (!file?.size) return null;
  if (!uploadedPhotos.has(file)) {
    const url = await uploadImage(file, "drivers/photos");
    uploadedPhotos.set(file, url);
  }
  return uploadedPhotos.get(file);
}

async function prepareDocument(file, kind) {
  if (
    !file?.size ||
    file.size > 3 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "application/pdf"].includes(file.type)
  ) {
    throw new Error(
      "KTP dan SIM wajib berupa PDF, JPG, atau PNG dengan ukuran maksimal 3 MB.",
    );
  }

  const url = await uploadImage(file, `drivers/${kind}`);

  return { url };
}

function chunkRef(driverRef, kind, index) {
  return doc(driverRef, "files", `${kind}-${index}`);
}

async function addDriver({ photo, ktp, sim, ...fields }) {
  const files = {
    ktp: await prepareDocument(ktp, "ktp"),
    sim: await prepareDocument(sim, "sim"),
  };
  const photoUrl = await uploadPhoto(photo);
  const driverRef = doc(collection(db, "drivers"));
  const batch = writeBatch(db);
  batch.set(driverRef, {
    ...fields,
    name: fields.name.trim(),
    status: "available",
    photo: photoUrl,
    ktp: files.ktp,
    sim: files.sim,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return driverRef.id;
}

async function readDriverFile(id, kind, metadata) {
  if (
    !documentKinds.includes(kind) ||
    !["application/pdf", "image/png", "image/jpeg"].includes(metadata?.type) ||
    !Number.isInteger(metadata?.chunks) ||
    metadata.chunks < 1 ||
    metadata.chunks > 6
  )
    throw new Error("Metadata berkas tidak valid.");
  const driverRef = doc(db, "drivers", id);
  const parts = await Promise.all(
    Array.from({ length: metadata.chunks }, async (_, i) => {
      const snapshot = await getDoc(chunkRef(driverRef, kind, i));
      if (!snapshot.exists()) throw new Error("Berkas driver tidak lengkap.");
      return snapshot.data().content.toUint8Array();
    }),
  );
  const blob = new Blob(parts, { type: metadata.type });
  if (blob.size !== metadata.size)
    throw new Error("Ukuran berkas driver tidak sesuai.");
  return blob;
}

async function updateDriver(id, changes) {
  const patch = { ...changes };
  if (patch.photo instanceof File) patch.photo = await uploadPhoto(patch.photo);
  if (Object.keys(patch).length)
    await updateDoc(doc(db, "drivers", id), {
      ...patch,
      updatedAt: serverTimestamp(),
    });
}

async function removeDriver(id, reason) {
  const deletionReason = reason?.trim();
  if (!deletionReason) throw new Error("Cantumkan alasan penghapusan driver.");
  const driverRef = doc(db, "drivers", id);
  const auditRef = doc(db, "driverDeletions", id);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(driverRef);
    if (!snapshot.exists()) throw new Error("Driver sudah dihapus.");
    for (const kind of documentKinds) {
      const count = snapshot.data()[kind]?.chunks || 0;
      for (let i = 0; i < count; i++)
        transaction.delete(chunkRef(driverRef, kind, i));
    }
    transaction.set(auditRef, {
      driverId: id,
      reason: deletionReason,
      deletedAt: serverTimestamp(),
      deletedBy: auth.currentUser?.uid || null,
    });
    transaction.delete(driverRef);
  });
}

const panel =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
const inputStyle =
  "mt-1.5 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-blue-500";
const imageTypes = ["image/png", "image/jpeg", "image/webp"];
const documentTypes = ["application/pdf", "image/jpeg", "image/png"];

function Field({ label, required, wide, ...props }) {
  return (
    <label
      className={`block text-[11px] font-semibold text-slate-700 ${wide ? "sm:col-span-2" : ""}`}
    >
      {label}
      {required && <span className="text-red-500"> *</span>}
      <input className={inputStyle} required={required} {...props} />
    </label>
  );
}

function FileField({ name, label, profile = false, icon: Icon }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const maxMB = profile ? 5 : 3;
  const types = profile ? imageTypes : documentTypes;

  useEffect(() => {
    if (!profile || !file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profile, file]);

  function selectFile(event) {
    const input = event.currentTarget;
    const selected = input.files[0];
    let message = "";
    if (selected && !types.includes(selected.type))
      message = "Format file tidak didukung.";
    else if (selected && selected.size > maxMB * 1024 * 1024)
      message = `Ukuran file maksimal ${maxMB} MB.`;
    if (message) input.value = "";
    input.setCustomValidity(message);
    setError(message);
    setFile(message ? null : selected);
  }

  return (
    <div className="min-w-0">
      <label
        className={
          profile
            ? "relative flex min-h-36 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-blue-200 bg-slate-50/60 p-4 text-center focus-within:ring-2 focus-within:ring-blue-500"
            : "relative flex h-full min-h-16 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 focus-within:ring-2 focus-within:ring-blue-500"
        }
      >
        <input
          type="file"
          name={name}
          accept={types.join(",")}
          required={!profile}
          aria-label={label}
          onChange={selectFile}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? name + "-error" : undefined}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span
          className={`grid shrink-0 place-items-center overflow-hidden rounded-lg bg-blue-50 text-blue-600 ${profile ? "size-12" : "size-9"}`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Pratinjau foto pengemudi"
              className="size-full object-cover"
            />
          ) : (
            <Icon size={profile ? 23 : 17} />
          )}
        </span>
        <span className="min-w-0">
          <span
            className={`block text-xs font-bold ${profile ? "text-blue-600" : "text-slate-800"}`}
          >
            {label}
            {!profile && <span className="text-red-500"> *</span>}
          </span>
          <span className="mt-1 block break-all text-[10px] text-slate-500">
            {file?.name ||
              (profile
                ? "PNG, JPG atau WEBP · maksimal 5 MB"
                : "PDF, JPG atau PNG maks 3 MB")}
          </span>
        </span>
        {!profile && (
          <span className="ml-auto shrink-0 rounded-md border border-slate-300 px-2.5 py-1.5 text-[10px] font-semibold">
            {file ? "Ganti File" : "Pilih File"}
          </span>
        )}
      </label>
      {error && (
        <p
          id={name + "-error"}
          role="alert"
          className="mt-1 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function CreateForm() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function save(event) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setSaveError("");
    try {
      await addDriver(Object.fromEntries(data));
      navigate("/admin/drivers", { replace: true });
    } catch (failure) {
      setSaveError(`Driver gagal disimpan. ${failure.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pt-[88px] pb-7 text-slate-800 min-[721px]:px-[34px] min-[721px]:pt-[98px]">
      <header className="mb-5">
        <p className="mb-[7px] text-[8px] font-bold tracking-wider text-blue-600">
          OPERASIONAL RENTAL
        </p>
        <h1 className="text-[25px] leading-tight font-extrabold tracking-tight text-[#183d78]">
          Tambah Driver Baru
        </h1>
        <p className="mt-1.5 text-[11px] text-slate-500">
          Lengkapi identitas, dokumen legalitas, dan kualifikasi kemudi mitra
          driver baru NOV Rent.
        </p>
      </header>
      <form onSubmit={save} className="space-y-4">
        <fieldset disabled={saving} className="min-w-0 space-y-4">
          <section className={panel}>
            <h2 className="text-[15px] font-bold">Foto Profil Pengemudi</h2>
            <p className="mt-1 mb-3 text-[11px] text-slate-500">
              Gunakan pasfoto pengemudi resmi tampak depan, rapi, dan latar
              belakang cerah (maksimal 5 MB).
            </p>
            <FileField
              name="photo"
              label="Upload foto driver"
              icon={ImageIcon}
              profile
            />
          </section>

          <section className={panel}>
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-[15px] font-bold">
                  Informasi Identitas &amp; Kontak
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  Data pribadi mitra pengemudi terintegrasi sistem operasional.
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-red-500">
                * Wajib diisi
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nama Lengkap Sesuai KTP"
                name="name"
                autoComplete="name"
                placeholder="Contoh: Hendra Wijaya"
                required
              />
              <label className="text-[11px] font-semibold text-slate-700">
                Jenis Kelamin <span className="text-red-500">*</span>
                <select name="gender" className={inputStyle} required>
                  <option>Laki-Laki</option>
                  <option>Perempuan</option>
                </select>
              </label>
              <Field
                label="Nomor WhatsApp / HP Aktif"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Contoh: 081234567890"
                required
              />
              <Field
                label="Email Aktif"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Contoh: hendra.wijaya@gmail.com"
              />
              <Field
                label="Alamat Domisili Lengkap"
                name="address"
                autoComplete="street-address"
                placeholder="Contoh: Jl. Manyar Kertoarjo No. 42, Surabaya"
                required
              />
              <Field
                label="Kontak Darurat (Keluarga)"
                name="emergencyContact"
                placeholder="Contoh: Istri (Siti Aminah) - 081388992211"
                required
              />
              <Field
                label="Nomor Induk Kependudukan (NIK)"
                name="nik"
                inputMode="numeric"
                pattern="[0-9]{16}"
                maxLength={16}
                title="Masukkan 16 digit NIK"
                placeholder="Contoh: 3578012345678901"
                required
                wide
              />
            </div>
          </section>

          <section className={panel}>
            <div className="mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-[15px] font-bold">
                Legalitas &amp; Dokumen Pengemudi
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Surat Izin Mengemudi dan berkas verifikasi identitas resmi
                mitra.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <FileField
                name="ktp"
                label="Scan / Foto Asli KTP"
                icon={IdCard}
              />
              <FileField
                name="sim"
                label="Scan / Foto Fisik SIM"
                icon={FileText}
              />
            </div>
          </section>
          {saveError && (
            <p role="alert" className="text-xs text-red-600">
              {saveError}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2 pt-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => navigate("/admin/drivers")}
              className="min-h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 shadow-sm hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 text-white shadow-sm hover:bg-blue-700"
            >
              <Save size={15} />{" "}
              {saving ? "Menyimpan..." : "Simpan Driver Baru"}
            </button>
          </div>
        </fieldset>
      </form>
    </main>
  );
}

function DeleteDriverDialog({ driver, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const [reason, setReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const trimmedReason = reason.trim();
  const initials = (driver.legalName || driver.name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const assignment =
    driver.status === "working" && driver.car
      ? [driver.car, driver.plate && `(${driver.plate})`]
          .filter(Boolean)
          .join(" ")
      : "Belum ada penugasan aktif";

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (!trimmedReason || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await onConfirm(trimmedReason);
    } catch (failure) {
      setError(`Penghapusan gagal. ${failure.message}`);
      setDeleting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-driver-title"
      aria-describedby="delete-driver-description"
      onCancel={(event) => {
        if (deleting) event.preventDefault();
        else onCancel();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/50"
    >
      <form onSubmit={submit}>
        <fieldset disabled={deleting} className="min-w-0">
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600">
                <Trash2 size={24} />
              </span>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Tutup dialog"
                className="grid size-8 cursor-pointer place-items-center rounded-md text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <h2
              id="delete-driver-title"
              className="mt-4 text-xl font-bold tracking-tight"
            >
              Hapus Data Mitra Driver?
            </h2>
            <p
              id="delete-driver-description"
              className="mt-1 text-sm leading-relaxed text-slate-500"
            >
              Apakah Anda yakin ingin menghapus mitra pengemudi ini dari daftar
              driver NOV Rent? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="my-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-100 font-bold text-blue-600">
                {initials}
              </span>
              <div className="min-w-0 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="break-words text-sm">{driver.name}</strong>
                  <span className="rounded border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-bold text-slate-600">
                    {driver.id}
                  </span>
                </div>
                <p className="mt-1 text-slate-600">Penugasan: {assignment}</p>
              </div>
            </div>
            <label
              htmlFor="delete-driver-reason"
              className="text-xs font-semibold text-slate-700"
            >
              Cantumkan alasan untuk konfirmasi pembatalan kontrak{" "}
              <span className="text-rose-600">*</span>
            </label>
            <input
              id="delete-driver-reason"
              name="reason"
              required
              placeholder="Ketik di sini..."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm placeholder:text-slate-400 focus:outline-blue-500"
            />
          </div>
          {error && (
            <p role="alert" className="px-5 pb-2 text-xs text-red-600">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs font-semibold sm:px-6">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-9 cursor-pointer rounded-lg border border-slate-300 px-4 text-slate-700 hover:bg-white"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={!trimmedReason}
              className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-rose-600 px-4 text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={14} />{" "}
              {deleting ? "Menghapus..." : "Ya, Hapus Driver"}
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}

const mainStyle =
  "min-h-screen bg-slate-50 px-4 pt-[88px] pb-7 text-slate-800 min-[721px]:px-[34px] min-[721px]:pt-[98px]";
const button =
  "inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 text-xs font-semibold";
const listUrl = "/admin/drivers";

function useFileUrl(file) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!(file instanceof Blob) || !file.size) {
      setUrl("");
      return;
    }
    const value = URL.createObjectURL(file);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [file]);
  const remote = typeof file === "string" ? file : file?.url;
  return file instanceof Blob
    ? url
    : typeof remote === "string" && remote.startsWith("https://")
      ? remote
      : "";
}

function DocumentCard({ driverId, kind, file, label, icon: Icon }) {
  const [blob, setBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const url = useFileUrl(blob || file);
  async function preview() {
    setLoading(true);
    setError("");
    try {
      setBlob(await readDriverFile(driverId, kind, file));
    } catch (failure) {
      setError(`Berkas gagal dimuat. ${failure.message}`);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <span className="grid size-9 place-items-center rounded-lg bg-blue-100 text-blue-600">
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <strong className="block break-all text-xs">
          {file?.name || label}
        </strong>
        <span className="text-[10px] text-slate-500">
          {file?.size
            ? `${label} · ${Math.ceil(file.size / 1024)} KB`
            : url
              ? label
              : "Berkas belum tersedia"}
        </span>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Lihat berkas ${label}`}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-blue-600"
        >
          Lihat Berkas
        </a>
      ) : (
        <button
          type="button"
          disabled={!file?.chunks || loading}
          onClick={preview}
          className="rounded-md border border-slate-200 px-2 py-1.5 text-[10px] text-blue-600 disabled:text-slate-400"
        >
          {loading ? "Memuat..." : "Pratinjau Berkas"}
        </button>
      )}
      {blob && url && (
        <div className="w-full">
          {blob.type === "application/pdf" ? (
            <object
              data={url}
              type="application/pdf"
              className="h-64 w-full rounded-md"
              aria-label={label}
            >
              Gunakan Lihat Berkas untuk membuka PDF.
            </object>
          ) : (
            <img
              src={url}
              alt={`Pratinjau ${label}`}
              className="max-h-64 w-full object-contain"
            />
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="w-full text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function EditForm({ driver: initialDriver }) {
  const [driver] = useState(initialDriver);
  const navigate = useNavigate();
  const [status, setStatus] = useState(driver.status);
  const [photo, setPhoto] = useState(driver.photo);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const preview = useFileUrl(photo);
  const current = driverStatuses[status];
  const legalName = driver.legalName || driver.name;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function changePhoto(event) {
    const input = event.currentTarget;
    const file = input.files[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > 3 * 1024 * 1024
    ) {
      input.value = "";
      setError("Pilih foto JPG atau PNG berukuran maksimal 3 MB.");
      return;
    }
    setError("");
    setPhoto(file);
  }

  async function save(event) {
    event.preventDefault();
    if (saving) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const name = fields.legalName.trim();
    fields.legalName = name;
    const changes = Object.fromEntries(
      Object.entries(fields).filter(
        ([key, value]) => value !== (driver[key] ?? ""),
      ),
    );
    if (name !== legalName) changes.name = name;
    if (photo instanceof File) changes.photo = photo;
    setSaving(true);
    setSaveError("");
    try {
      await updateDriver(driver.id, changes);
      navigate(listUrl, { replace: true });
    } catch (failure) {
      setSaveError(`Perubahan gagal disimpan. ${failure.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={mainStyle}>
      <header className="mb-5">
        <p className="mb-2 text-[8px] font-bold tracking-wider text-blue-600">
          OPERASIONAL RENTAL
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="mr-1 text-[25px] leading-tight font-extrabold tracking-tight text-[#183d78]">
            Edit Data Driver
          </h1>
          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold">
            {driver.id}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${current.tone}`}
          >
            <i className="size-2 rounded-full bg-current" />
            {current.label}
          </span>
          <Link
            to={listUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 sm:ml-auto"
          >
            <ArrowLeft size={15} /> Kembali ke Daftar Driver
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Perbarui informasi driver, status tugas, dan dokumen pengemudi.
        </p>
      </header>
      <form className="space-y-4" onSubmit={save}>
        <fieldset disabled={saving} className="min-w-0 space-y-4">
          <section className={panel}>
            <h2 className="text-[15px] font-bold">
              Foto Driver &amp; Status Ketersediaan
            </h2>
            <p className="mt-1 mb-4 text-[11px] text-slate-500">
              Perbarui pasfoto formal dan ubah status operasional harian driver.
            </p>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="grid h-28 w-24 place-items-center overflow-hidden rounded-lg border-2 border-white bg-blue-50 text-blue-500 shadow-sm">
                  {preview ? (
                    <img
                      src={preview}
                      alt={`Foto ${driver.name}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <UserRound size={36} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-sm">{driver.name}</strong>
                  <p className="mb-2 text-[10px] text-slate-500">
                    ID: {driver.id}
                  </p>
                  <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-1.5 text-[11px] font-semibold text-blue-600 focus-within:ring-2">
                    <Upload size={13} /> Ganti Foto Driver
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      aria-label="Ganti Foto Driver"
                      onChange={changePhoto}
                      className="absolute inset-0 size-full cursor-pointer opacity-0"
                    />
                  </label>
                  <p className="mt-2 text-[10px] text-slate-500">
                    JPG, PNG · maks. 3 MB
                  </p>
                  {error && (
                    <p role="alert" className="text-xs text-red-600">
                      {error}
                    </p>
                  )}
                </div>
              </div>
              <fieldset className="min-w-0 self-center">
                <legend className="mb-2 text-[10px] font-bold tracking-wide">
                  PILIH STATUS PENUGASAN SAAT INI
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(driverStatuses).map(([key, option]) => (
                    <label
                      key={key}
                      className={`relative grid cursor-pointer place-items-center gap-1 rounded-lg border p-2 text-center focus-within:ring-2 focus-within:ring-blue-400 ${status === key ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600" : "border-slate-200"}`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="status"
                        value={key}
                        checked={status === key}
                        onChange={() => setStatus(key)}
                      />
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                        <i className={`size-2 rounded-full ${option.dot}`} />
                        {option.label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {key === "working" && driver.car
                          ? `${driver.car} (${driver.plate})`
                          : option.detail}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
          <section className={panel}>
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-[15px] font-bold">
                  Informasi Identitas &amp; Kontak
                </h2>
                <p className="mt-1 text-[11px] text-slate-500">
                  Data kependudukan resmi dan saluran komunikasi aktif
                  pengemudi.
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-red-500">
                * Wajib diisi
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nama Lengkap Sesuai KTP"
                name="legalName"
                defaultValue={legalName}
                required
                pattern=".*\S.*"
              />
              <Field
                label="Nomor Induk Kependudukan (NIK)"
                name="nik"
                defaultValue={driver.nik}
                required
                inputMode="numeric"
                pattern="[0-9]{16}"
                maxLength={16}
                title="Masukkan 16 digit NIK"
              />
              <Field
                label="Nomor Telepon / WhatsApp Aktif"
                name="phone"
                type="tel"
                defaultValue={driver.phone}
                required
              />
              <Field
                label="Alamat Email Perusahaan"
                name="email"
                type="email"
                defaultValue={driver.email}
              />
              <label className="text-[11px] font-semibold sm:col-span-2">
                Jenis Kelamin <span className="text-red-500">*</span>
                <select
                  className={inputStyle}
                  name="gender"
                  defaultValue={driver.gender || ""}
                  required
                >
                  <option value="" disabled>
                    Pilih jenis kelamin
                  </option>
                  <option>Laki-Laki</option>
                  <option>Perempuan</option>
                </select>
              </label>
              <Field
                label="Alamat Domisili Operasional"
                name="address"
                defaultValue={driver.address}
                required
                wide
              />
              <Field
                label="Kontak Darurat (Keluarga Terdekat)"
                name="emergencyContact"
                defaultValue={driver.emergencyContact}
                required
                wide
              />
            </div>
          </section>
          <section className={panel}>
            <h2 className="text-[15px] font-bold">
              Legalitas Dokumen &amp; Masa Berlaku
            </h2>
            <p className="mt-1 border-b border-slate-100 pb-3 text-[11px] text-slate-500">
              Kelengkapan lisensi berkendara (SIM) dan verifikasi identitas
              resmi pengemudi.
            </p>
            <p className="mt-4 mb-2 text-[11px] font-semibold">
              Pratinjau Berkas KTP &amp; SIM
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <DocumentCard
                driverId={driver.id}
                kind="ktp"
                file={driver.ktp}
                label="KTP"
                icon={IdCard}
              />
              <DocumentCard
                driverId={driver.id}
                kind="sim"
                file={driver.sim}
                label="SIM"
                icon={FileText}
              />
            </div>
          </section>
          {saveError && (
            <p role="alert" className="text-xs text-red-600">
              {saveError}
            </p>
          )}
          <footer className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-white p-3">
            <button
              type="button"
              className={`${button} mr-auto border-red-200 bg-red-50 text-red-600`}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={14} /> Hapus Driver
            </button>
            <Link className={`${button} border-slate-200`} to={listUrl}>
              Batal
            </Link>
            <button
              className={`${button} border-blue-600 bg-blue-600 text-white`}
              type="submit"
            >
              <Save size={14} />{" "}
              {saving ? "Menyimpan..." : "Simpan Perubahan Data"}
            </button>
          </footer>
        </fieldset>
      </form>
      {confirmDelete && (
        <DeleteDriverDialog
          driver={driver}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async (reason) => {
            await removeDriver(driver.id, reason);
            navigate(listUrl, { replace: true });
          }}
        />
      )}
    </main>
  );
}

function LoadEditForm({ id }) {
  const [driver, setDriver] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getDoc(doc(db, "drivers", id))
      .then((snapshot) => {
        if (!active) return;
        if (snapshot.exists()) setDriver(readDriver(snapshot));
        else setError("Driver tidak ditemukan.");
      })
      .catch((failure) => {
        if (active) setError(`Data driver gagal dimuat. ${failure.message}`);
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (error)
    return (
      <main className={mainStyle}>
        <p role="alert">{error}</p>
        <Link to={listUrl} className="text-sm text-blue-600">
          Kembali ke Daftar Driver
        </Link>
      </main>
    );
  if (!driver) return <DatabaseLoading message="Memuat data driver..." />;
  return <EditForm driver={driver} />;
}

export default function DriverFormPage() {
  const { id } = useParams();
  return (
    <DriverPage>
      {id ? <LoadEditForm key={id} id={id} /> : <CreateForm />}
    </DriverPage>
  );
}

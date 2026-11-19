import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FileText, IdCard, Image as ImageIcon, Save } from "lucide-react";

const panel = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
const inputStyle = "mt-1.5 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-blue-500";
const imageTypes = ["image/png", "image/jpeg", "image/webp"];
const documentTypes = ["application/pdf", "image/jpeg", "image/png"];

function Field({ label, required, wide, ...props }) {
  return (
    <label className={`block text-[11px] font-semibold text-slate-700 ${wide ? "sm:col-span-2" : ""}`}>
      {label}{required && <span className="text-red-500"> *</span>}
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
    if (selected && !types.includes(selected.type)) message = "Format file tidak didukung.";
    else if (selected && selected.size > maxMB * 1024 * 1024) message = `Ukuran file maksimal ${maxMB} MB.`;
    if (message) input.value = "";
    input.setCustomValidity(message);
    setError(message);
    setFile(message ? null : selected);
  }

  return (
    <div className="min-w-0">
      <label className={profile
        ? "relative flex min-h-36 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-blue-200 bg-slate-50/60 p-4 text-center focus-within:ring-2 focus-within:ring-blue-500"
        : "relative flex h-full min-h-16 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 focus-within:ring-2 focus-within:ring-blue-500"}>
        <input type="file" name={name} accept={types.join(",")} required={!profile} aria-label={label}
          onChange={selectFile} aria-invalid={Boolean(error)} aria-describedby={error ? name + "-error" : undefined}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        <span className={`grid shrink-0 place-items-center overflow-hidden rounded-lg bg-blue-50 text-blue-600 ${profile ? "size-12" : "size-9"}`}>
          {preview ? <img src={preview} alt="Pratinjau foto pengemudi" className="size-full object-cover" /> : <Icon size={profile ? 23 : 17} />}
        </span>
        <span className="min-w-0">
          <span className={`block text-xs font-bold ${profile ? "text-blue-600" : "text-slate-800"}`}>
            {label}{!profile && <span className="text-red-500"> *</span>}
          </span>
          <span className="mt-1 block break-all text-[10px] text-slate-500">
            {file?.name || (profile ? "PNG, JPG atau WEBP · maksimal 5 MB" : "PDF, JPG atau PNG maks 3 MB")}
          </span>
        </span>
        {!profile && <span className="ml-auto shrink-0 rounded-md border border-slate-300 px-2.5 py-1.5 text-[10px] font-semibold">{file ? "Ganti File" : "Pilih File"}</span>}
      </label>
      {error && <p id={name + "-error"} role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function DriverForm() {
  const navigate = useNavigate();
  const { addDriver } = useOutletContext();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  function save(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addDriver(Object.fromEntries(data));
    navigate("/admin/drivers", { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pt-[88px] pb-7 text-slate-800 min-[721px]:px-[34px] min-[721px]:pt-[98px]">
      <header className="mb-5">
        <p className="mb-[7px] text-[8px] font-bold tracking-wider text-blue-600">OPERASIONAL RENTAL</p>
        <h1 className="text-[25px] leading-tight font-extrabold tracking-tight text-[#183d78]">Tambah Driver Baru</h1>
        <p className="mt-1.5 text-[11px] text-slate-500">Lengkapi identitas, dokumen legalitas, dan kualifikasi kemudi mitra driver baru NOV Rent.</p>
      </header>
      <form onSubmit={save} className="space-y-4">
        <section className={panel}>
          <h2 className="text-[15px] font-bold">Foto Profil Pengemudi</h2>
          <p className="mt-1 mb-3 text-[11px] text-slate-500">Gunakan pasfoto pengemudi resmi tampak depan, rapi, dan latar belakang cerah (maksimal 5 MB).</p>
          <FileField name="photo" label="Upload foto driver" icon={ImageIcon} profile />
        </section>

        <section className={panel}>
          <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-[15px] font-bold">Informasi Identitas &amp; Kontak</h2>
              <p className="mt-1 text-[11px] text-slate-500">Data pribadi mitra pengemudi terintegrasi sistem operasional.</p>
            </div>
            <span className="shrink-0 text-[10px] text-red-500">* Wajib diisi</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Lengkap Sesuai KTP" name="name" autoComplete="name" placeholder="Contoh: Hendra Wijaya" required />
            <label className="text-[11px] font-semibold text-slate-700">Jenis Kelamin <span className="text-red-500">*</span>
              <select name="gender" className={inputStyle} required><option>Laki-Laki</option><option>Perempuan</option></select>
            </label>
            <Field label="Nomor WhatsApp / HP Aktif" name="phone" type="tel" autoComplete="tel" placeholder="Contoh: 081234567890" required />
            <Field label="Email Aktif" name="email" type="email" autoComplete="email" placeholder="Contoh: hendra.wijaya@gmail.com" />
            <Field label="Alamat Domisili Lengkap" name="address" autoComplete="street-address" placeholder="Contoh: Jl. Manyar Kertoarjo No. 42, Surabaya" required />
            <Field label="Kontak Darurat (Keluarga)" name="emergencyContact" placeholder="Contoh: Istri (Siti Aminah) - 081388992211" required />
            <Field label="Nomor Induk Kependudukan (NIK)" name="nik" inputMode="numeric" pattern="[0-9]{16}" maxLength={16}
              title="Masukkan 16 digit NIK" placeholder="Contoh: 3578012345678901" required wide />
          </div>
        </section>

        <section className={panel}>
          <div className="mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-[15px] font-bold">Legalitas &amp; Dokumen Pengemudi</h2>
            <p className="mt-1 text-[11px] text-slate-500">Surat Izin Mengemudi dan berkas verifikasi identitas resmi mitra.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FileField name="ktp" label="Scan / Foto Asli KTP" icon={IdCard} />
            <FileField name="sim" label="Scan / Foto Fisik SIM" icon={FileText} />
          </div>
        </section>
        <div className="flex flex-wrap justify-end gap-2 pt-2 text-xs font-semibold">
          <button type="button" onClick={() => navigate("/admin/drivers")} className="min-h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 shadow-sm hover:bg-slate-100">Batal</button>
          <button type="submit" className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 text-white shadow-sm hover:bg-blue-700">
            <Save size={15} /> Simpan Driver Baru
          </button>
        </div>
      </form>
    </main>
  );
}

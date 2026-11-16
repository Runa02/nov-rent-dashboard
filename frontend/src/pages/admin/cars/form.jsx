import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase.js";
import { uploadImage } from "../../../config/cloudinary.js";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminTopbar from "../components/AdminTopbar.jsx";
import DatabaseLoading, { useMinimumLoading } from "../components/DatabaseLoading.jsx";

const emptyForm = {
  photo: null,
  brand: "",
  model: "",
  plateNumber: "",
  productionYear: "",
  transmission: "Manual",
  passengerCapacity: "",
  fuel: "Bensin",
  rentalRate: "",
  rentalService: "Harian",
  odometer: "",
  fuelCondition: "Penuh",
};

const demoCar = {
  brand: "Toyota",
  model: "Avanza 1.5 G",
  plateNumber: "B 2048 NVR",
  productionYear: "2023",
  transmission: "Automatic",
  passengerCapacity: "7",
  fuel: "Bensin",
  rentalRate: "350000",
  rentalService: "Harian",
  odometer: "18450",
  fuelCondition: "3/4",
};

function Field({ label, required, hint, children }) {
  return (
    <label className="fleet-form-field">
      <span>
        {label}
        {required && <em>*</em>}
      </span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export default function FleetFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const fileRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState(
    isEdit ? { ...emptyForm, ...demoCar } : emptyForm,
  );
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const showLoading = useMinimumLoading(loadingData);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    document.title = `${isEdit ? "Edit" : "Tambah"} Armada | NovRent`;
    if (!isEdit) return undefined;

    getDoc(doc(db, "cars", id))
      .then((snapshot) => {
        setLoadingData(false);
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        setForm((current) => ({
          ...current,
          brand: data.brand || "",
          model: data.model || data.name || "",
          plateNumber: data.plateNumber || data.plate || "",
          productionYear: String(data.productionYear || data.year || ""),
          transmission:
            data.transmission === "Matic"
              ? "Automatic"
              : data.transmission || "Manual",
          passengerCapacity: String(
            data.passengerCapacity || data.capacity || "",
          ),
          fuel: data.fuel || data.fuelType || "Bensin",
          rentalRate: String(data.rentalRate || data.pricePerDay || ""),
          rentalService: data.rentalService || "Harian",
          odometer: String(data.odometer || ""),
          fuelCondition: data.fuelCondition || "Penuh",
        }));
        setPreview(data.imageUrl || null);
      })
      .catch((error) => {
        console.error("Gagal memuat armada:", error);
        setLoadingData(false);
        setSubmitError("Data armada gagal dimuat.");
      });
  }, [isEdit]);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const choosePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Ukuran foto maksimal 5 MB.");
      event.target.value = "";
      return;
    }
    setForm((current) => ({ ...current, photo: file }));
    setSubmitError("");
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const required = [
      "brand",
      "model",
      "plateNumber",
      "productionYear",
      "passengerCapacity",
      "rentalRate",
      "odometer",
    ];
    const nextErrors = Object.fromEntries(
      required
        .filter((key) => !String(form[key]).trim())
        .map((key) => [key, "Wajib diisi"]),
    );
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSubmitError("");
    try {
      let imageUrl = preview && !preview.startsWith("blob:") ? preview : "";
      let imageWarning = "";
      if (form.photo) {
        try {
          imageUrl = await uploadImage(form.photo, "cars");
        } catch (error) {
          console.error("Foto armada gagal diupload ke Cloudinary:", error);
          imageWarning = `Foto gagal diupload ke Cloudinary: ${error.message}. Data armada tetap disimpan.`;
          imageUrl = "";
        }
      }
      const payload = {
        brand: form.brand.trim(),
        model: form.model.trim(),
        name: `${form.brand.trim()} ${form.model.trim()}`.trim(),
        plateNumber: form.plateNumber.trim().toUpperCase(),
        year: Number(form.productionYear),
        productionYear: Number(form.productionYear),
        transmission: form.transmission === "Automatic" ? "Matic" : "Manual",
        capacity: Number(form.passengerCapacity),
        passengerCapacity: Number(form.passengerCapacity),
        fuelType: form.fuel,
        fuel: form.fuel,
        pricePerDay: Number(form.rentalRate),
        rentalRate: Number(form.rentalRate),
        rentalService: form.rentalService,
        odometer: Number(form.odometer),
        fuelCondition: form.fuelCondition,
        ...(imageUrl ? { imageUrl } : {}),
        updatedAt: serverTimestamp(),
      };
      if (isEdit) {
        await updateDoc(doc(db, "cars", id), payload);
      } else {
        await addDoc(collection(db, "cars"), {
          ...payload,
          isAvailable: true,
          status: "Tersedia",
          createdAt: serverTimestamp(),
        });
      }
      if (imageWarning) window.alert(imageWarning);
      navigate("/admin/cars");
    } catch (error) {
      console.error("Gagal menyimpan armada:", error);
      setSubmitError(
        `Armada gagal disimpan (${error.code || "error"}). Periksa permission Firestore dan coba lagi.`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page fleet-page fleet-form-page">
      {showLoading && <DatabaseLoading message="Memuat data armada..." />}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="admin-content">
        <AdminTopbar setOpen={setSidebarOpen} />
        <main className="fleet-main">
          <div className="fleet-form-heading">
            <div>
              <p className="fleet-eyebrow">OPERASIONAL RENTAL</p>
              <h1>{isEdit ? "Edit Armada" : "Tambah Armada Baru"}</h1>
              <p>
                {isEdit
                  ? "Perbarui informasi kendaraan agar data armada selalu akurat."
                  : "Lengkapi informasi kendaraan yang akan ditambahkan ke dalam armada."}
              </p>
            </div>
          </div>
          <form onSubmit={submit}>
            {submitError && <p className="fleet-error-banner">{submitError}</p>}
            <section className="fleet-form-card fleet-photo-card">
              <div className="fleet-form-card-title">
                <div>
                  <h2>Foto Unit</h2>
                  <p>
                    Gunakan foto kendaraan yang jelas dengan ukuran maksimal 5
                    MB.
                  </p>
                </div>
              </div>
              <div
                className={`fleet-upload-box ${preview ? "has-preview" : ""}`}
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview kendaraan" />
                ) : (
                  <>
                    <ImagePlus size={27} />
                    <b>Upload foto kendaraan</b>
                    <small>PNG, JPG atau WEBP · maksimal 5 MB</small>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={choosePhoto}
                />
              </div>
            </section>
            <section className="fleet-form-card">
              <div className="fleet-form-card-title">
                <div>
                  <h2>Informasi Kendaraan</h2>
                  <p>Data utama kendaraan dan identitas unit.</p>
                </div>
                <span className="fleet-required-note">
                  <em>*</em> Wajib diisi
                </span>
              </div>
              <div className="fleet-form-grid">
                <Field label="Merk Mobil" required>
                  <input
                    value={form.brand}
                    onChange={update("brand")}
                    placeholder="Contoh: Toyota"
                  />
                  {errors.brand && (
                    <small className="fleet-error">{errors.brand}</small>
                  )}
                </Field>
                <Field label="Tipe / Model Mobil" required>
                  <input
                    value={form.model}
                    onChange={update("model")}
                    placeholder="Contoh: Avanza 1.5 G"
                  />
                  {errors.model && (
                    <small className="fleet-error">{errors.model}</small>
                  )}
                </Field>
                <Field label="Plat Nomor" required>
                  <input
                    value={form.plateNumber}
                    onChange={update("plateNumber")}
                    placeholder="Contoh: B 1234 ABC"
                    style={{ textTransform: "uppercase" }}
                  />
                  {errors.plateNumber && (
                    <small className="fleet-error">{errors.plateNumber}</small>
                  )}
                </Field>
                <Field label="Tahun Produksi" required>
                  <input
                    type="number"
                    min="1980"
                    max="2099"
                    value={form.productionYear}
                    onChange={update("productionYear")}
                    placeholder="Contoh: 2023"
                  />
                  {errors.productionYear && (
                    <small className="fleet-error">
                      {errors.productionYear}
                    </small>
                  )}
                </Field>
                <Field label="Tipe Transmisi" required>
                  <div className="fleet-radio-group">
                    <label>
                      <input
                        type="radio"
                        name="transmission"
                        value="Manual"
                        checked={form.transmission === "Manual"}
                        onChange={update("transmission")}
                      />{" "}
                      Manual
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="transmission"
                        value="Automatic"
                        checked={form.transmission === "Automatic"}
                        onChange={update("transmission")}
                      />{" "}
                      Matic
                    </label>
                  </div>
                </Field>
                <Field label="Kapasitas Penumpang" required>
                  <div className="fleet-input-suffix">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={form.passengerCapacity}
                      onChange={update("passengerCapacity")}
                      placeholder="Contoh: 7"
                    />
                    <span>orang</span>
                  </div>
                  {errors.passengerCapacity && (
                    <small className="fleet-error">
                      {errors.passengerCapacity}
                    </small>
                  )}
                </Field>
                <Field label="Bahan Bakar" required>
                  <select value={form.fuel} onChange={update("fuel")}>
                    <option>Bensin</option>
                    <option>Solar</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                  </select>
                </Field>
                <Field
                  label="Odometer Saat Ini"
                  required
                  hint="Masukkan angka kilometer terakhir kendaraan."
                >
                  <div className="fleet-input-suffix">
                    <input
                      type="number"
                      min="0"
                      value={form.odometer}
                      onChange={update("odometer")}
                      placeholder="Contoh: 18500"
                    />
                    <span>km</span>
                  </div>
                  {errors.odometer && (
                    <small className="fleet-error">{errors.odometer}</small>
                  )}
                </Field>
              </div>
            </section>
            <section className="fleet-form-card">
              <div className="fleet-form-card-title">
                <div>
                  <h2>Tarif & Layanan Sewa</h2>
                  <p>Tentukan harga dan periode layanan yang tersedia.</p>
                </div>
              </div>
              <div className="fleet-form-grid fleet-form-grid-three">
                <Field label="Tarif Sewa" required>
                  <div className="fleet-input-prefix">
                    <span>Rp</span>
                    <input
                      type="number"
                      min="0"
                      value={form.rentalRate}
                      onChange={update("rentalRate")}
                      placeholder="350000"
                    />
                  </div>
                  {errors.rentalRate && (
                    <small className="fleet-error">{errors.rentalRate}</small>
                  )}
                </Field>
                <Field label="Layanan Sewa" required>
                  <select
                    value={form.rentalService}
                    onChange={update("rentalService")}
                  >
                    <option>Harian</option>
                    <option>Mingguan</option>
                    <option>Bulanan</option>
                    <option>Harian & Mingguan</option>
                  </select>
                </Field>
                <Field label="Kondisi BBM Saat Ini" required>
                  <select
                    value={form.fuelCondition}
                    onChange={update("fuelCondition")}
                  >
                    <option>Penuh</option>
                    <option>3/4</option>
                    <option>1/2</option>
                    <option>1/4</option>
                    <option>Kosong</option>
                  </select>
                </Field>
              </div>
            </section>
            <div className="fleet-form-actions">
              <button
                type="button"
                className="fleet-cancel"
                onClick={() => navigate("/admin/cars")}
              >
                Batal
              </button>
              <button type="submit" className="fleet-primary" disabled={saving}>
                <Save size={15} />{" "}
                {saving
                  ? "Menyimpan..."
                  : isEdit
                    ? "Simpan Perubahan"
                    : "Simpan Armada"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

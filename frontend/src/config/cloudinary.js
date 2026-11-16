const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "novrent123";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "identitas_user";

/**
 * Upload gambar ke Cloudinary menggunakan unsigned upload preset.
 * Mengembalikan secure_url yang siap disimpan ke Firestore.
 */
export async function uploadImage(file, folder = "uploads") {
  if (!(file instanceof File)) {
    throw new Error("File gambar tidak valid.");
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Konfigurasi Cloudinary belum tersedia.");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const body = new FormData();
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  body.append("folder", folder);
  body.append("file", file, file.name || "upload.jpg");

  const response = await fetch(endpoint, { method: "POST", body });
  const result = await response.json();

  if (!response.ok || !result.secure_url) {
    throw new Error(
      result?.error?.message ||
        `Cloudinary upload gagal (${response.status || "unknown"})`,
    );
  }

  return result.secure_url;
}

export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
};

# Nov Rent Dashboard

Aplikasi dashboard manajemen rental mobil berbasis React dan Vite.

## Struktur Project

```text
nov-rent-dashboard/
|-- frontend/       # Aplikasi React/Vite
```

Saat ini konfigurasi `package.json` berada di dalam folder `frontend`, jadi seluruh perintah npm dijalankan dari folder tersebut.

## Requirements

- Node.js 18 atau lebih baru
- npm
- Akun dan project Firebase jika fitur autentikasi, Firestore, atau Storage digunakan

Cek instalasi Node.js dan npm:

```bash
node --version
npm --version
```

## Instalasi

Masuk ke folder frontend, lalu install dependency:

```bash
cd frontend
npm install
```

## Konfigurasi Firebase

Buat file `frontend/.env.local` dan isi dengan konfigurasi Firebase:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Jangan commit file `.env.local` ke repository karena berisi konfigurasi project pribadi.

## Menjalankan Development Server

Dari folder `frontend`:

```bash
npm run dev
```

Buka URL yang ditampilkan Vite, biasanya:

```text
http://localhost:5173
```

Halaman utama akan mengarahkan pengguna ke `/login`. Dashboard admin tersedia melalui route berikut:

```text
/admin/dashboard
/admin/reports
/admin/aspirasi
/admin/pengguna
/admin/petugas
/admin/kategori
/admin/laporan
/admin/wilayah
```

## Build Production

Untuk membuat build production:

```bash
cd frontend
npm run build
```

Hasil build akan dibuat di folder `frontend/dist`.

Untuk melihat hasil build secara lokal:

```bash
npm run preview
```

## Troubleshooting

Jika PowerShell memblokir `npm.ps1`, gunakan executable npm berikut:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
```

Jika dependency bermasalah, hapus `node_modules` dan install ulang:

```powershell
Remove-Item -Recurse -Force node_modules
npm.cmd install
```

## Tech Stack

- React
- Vite
- React Router
- Lucide React
- Firebase Authentication
- Firebase Firestore
- Firebase Storage

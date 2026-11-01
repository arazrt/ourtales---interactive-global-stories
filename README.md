# Our Tales 🌍📖

**Our Tales** adalah aplikasi web interaktif untuk berbagi cerita berbasis lokasi. Pengguna dapat menambahkan, melihat, dan membaca cerita berdasarkan peta interaktif. Dibangun menggunakan HTML, CSS, dan JavaScript modular dengan pendekatan SPA (Single Page Application) dan arsitektur MVP (Model-View-Presenter).

## 🎯 Fitur Utama

- **Arsitektur MVP** - Implementasi pola Model-View-Presenter untuk manajemen kode yang lebih baik
- **Single Page Application** - Navigasi antar halaman tanpa reload
- **Peta Interaktif** - Menggunakan Leaflet.js untuk visualisasi lokasi cerita
- **Manajemen Autentikasi**
  - Login/logout pengguna
  - Akses terbatas untuk tamu (guest)
  - Redirect otomatis ke halaman login
- **Fitur Tamu (Guest)**
  - Tamu dapat menambahkan cerita tanpa login
  - Akses terbatas ke daftar cerita (memerlukan login)
- **Desain Responsif** - Antarmuka yang bersih dan adaptif untuk berbagai ukuran layar

## 🏗️ Struktur Proyek

```
src/
├── scripts/
│   ├── api/          # API endpoints dan services
│   ├── models/       # Model data
│   ├── presenters/   # Presenter logic
│   ├── router/       # Router configuration
│   ├── utils/        # Utility functions
│   └── view/         # View components
├── styles/           # CSS styles
└── index.html        # Entry point
```

## 🚀 Cara Menjalankan Proyek

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Server
```bash
npm run start-dev
```

### 3. Production Build 
```bash
npm run build 
```
## 🔒 Akses Pengguna

- **Pengguna Terdaftar**
  - Akses penuh ke semua fitur
  - Dapat melihat dan menambahkan cerita
  - Dapat mengakses detail cerita
  - Dapat mengakses menu peta

- **Tamu (Guest)**
  - Dapat menambahkan cerita tanpa login
  - Diarahkan ke halaman login saat mencoba mengakses daftar cerita
  - Tidak dapat melihat detail cerita
  - Tidak dapat akses menu peta

### Credits
Dibuat dengan ❤️ oleh Vanya. Berbagi cerita, dari kita untuk dunia.

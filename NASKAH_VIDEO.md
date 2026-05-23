# NASKAH VIDEO PENJELASAN
## Tugas Praktik 2 — Implementasi Vue.js
## Aplikasi SITTA: Sistem Informasi Tata Kelola Bahan Ajar Universitas Terbuka
### Durasi: ±12–14 Menit

---

## BAGIAN 1 — PEMBUKAAN (±1 menit)

**[Tampilkan: halaman index.html di browser]**

Halo, Assalamu'alaikum Warahmatullahi Wabarakatuh.

Perkenalkan, saya [Nama Mahasiswa], NIM [NIM], Program Studi [Prodi].

Pada video ini saya akan mempresentasikan hasil pengerjaan Tugas Praktik 2 mata kuliah Pemrograman Web, yaitu mengimplementasikan Vue.js untuk membangun aplikasi **SITTA** — Sistem Informasi Tata Kelola Bahan Ajar Universitas Terbuka.

Aplikasi ini terdiri dari tiga halaman:
- `index.html` sebagai halaman beranda dan navigasi utama
- `stok.html` sebagai Halaman 1: Manajemen Stok Bahan Ajar
- `tracking.html` sebagai Halaman 2: Tracking Delivery Order

Mari kita mulai dengan melihat struktur proyeknya.

---

## BAGIAN 2 — ARSITEKTUR & STRUKTUR PROYEK (±1,5 menit)

**[Tampilkan: struktur folder di file explorer / terminal]**

Struktur proyek saya mengikuti panduan yang sudah disepakati, yaitu:

```
/tugas2-vue-ut/
├─ index.html
├─ stok.html
├─ tracking.html
├─ css/
│   └─ style.css
└─ js/
    ├─ dataBahanAjar.js   ← data dummy
    ├─ stok-app.js        ← logika Vue untuk stok.html
    └─ tracking-app.js    ← logika Vue untuk tracking.html
```

**[Tampilkan: file dataBahanAjar.js]**

File `dataBahanAjar.js` berisi dua array data dummy:
- `dataBahanAjar`: menyimpan informasi stok bahan ajar seperti kode, judul, penulis, stok, status, dan fakultas.
- `dataTrackingDO`: menyimpan data pengiriman seperti nomor DO, ekspedisi, resi, status, dan UPBJJ tujuan.

Pemisahan logika ke file `.js` terpisah — `stok-app.js` dan `tracking-app.js` — bertujuan agar kode lebih modular, mudah dipahami, dan mudah dimaintain. Masing-masing file berisi satu instance Vue yang di-mount pada elemen HTML yang berbeda.

---

## BAGIAN 3 — HALAMAN 1: STOK BAHAN AJAR (±5 menit)

**[Buka stok.html di browser]**

### 3.1 — Struktur Vue Instance

**[Tampilkan: stok-app.js, bagian `data()`]**

Setiap aplikasi Vue dimulai dengan `createApp({...}).mount('#stok-app')`. Di dalam objek konfigurasi, saya mendefinisikan empat bagian utama: `data`, `computed`, `watch`, dan `methods`.

Pada property `data()`, saya mendefinisikan semua state reaktif, termasuk:
- `dataBahanAjar` — salinan dari data dummy
- `cariKata`, `filterFakultas`, `filterStatus` — untuk keperluan filter dan pencarian
- `form` — objek yang menampung input dari pengguna di form pemesanan
- `errors` — untuk menyimpan pesan validasi
- `notifications` — untuk notifikasi watcher

### 3.2 — Menampilkan Data: Mustache & v-text

**[Tunjuk di browser: tabel bahan ajar, kartu statistik]**

Untuk menampilkan data, saya menggunakan dua pendekatan:

Pertama, **interpolasi mustache** `{{ }}` — digunakan untuk teks pendek yang bercampur dengan konten lain. Contohnya pada badge jumlah dan notifikasi.

Kedua, **directive `v-text`** — digunakan untuk konten yang sepenuhnya diisi dari data Vue. Misalnya pada sel tabel:
```html
<td class="code-cell" v-text="item.kode"></td>
```

Saya lebih memilih `v-text` untuk konten tabel karena lebih eksplisit dan menghindari flash of unrendered content. Sedangkan `mustache` saya gunakan ketika perlu menyisipkan data di tengah-tengah teks.

### 3.3 — Data Binding: v-bind & v-model

**[Tunjuk input pencarian dan dropdown filter]**

Untuk **two-way data binding**, saya menggunakan `v-model` pada semua elemen input:
```html
<input type="text" v-model="cariKata" placeholder="Cari kode / judul…" />
```

Ketika pengguna mengetik, `cariKata` langsung terupdate, dan karena `bahanAjarFiltered` adalah computed property yang bergantung pada `cariKata`, tabel otomatis memfilter secara reaktif — tanpa perlu menulis event listener secara manual.

Untuk **one-way binding**, saya menggunakan `v-bind` (atau `:`) — misalnya untuk mewarnai stok secara dinamis:
```html
<span :style="{ color: warnaiStok(item.stok) }">{{ item.stok }}</span>
```

Dan untuk binding class dinamis pada badge status:
```html
<span class="badge" :class="badgeFakultas(item.fakultas)">{{ item.fakultas }}</span>
```

### 3.4 — Conditional: v-if, v-else-if, v-else, v-show

**[Tunjuk badge status di tabel]**

Untuk menampilkan badge status bahan ajar, saya menggunakan kombinasi `v-if`, `v-else-if`, dan `v-else`:
```html
<span v-if="item.status === 'tersedia'" class="badge badge-success">✅ Tersedia</span>
<span v-else-if="item.status === 'hampir habis'" class="badge badge-warning">⚠️ Hampir Habis</span>
<span v-else class="badge badge-danger">❌ Habis</span>
```

Saya memilih `v-if/v-else` karena hanya satu elemen yang relevan ditampilkan pada satu waktu, sehingga DOM lebih bersih.

**[Tunjuk peringatan stok kritis]**

Sedangkan untuk peringatan stok tidak cukup di form, saya menggunakan `v-show`:
```html
<div v-show="peringatanStokTidakCukup" class="alert alert-warning">
  ⚠️ Jumlah pesanan melebihi stok yang tersedia!
</div>
```

Alasannya: `v-show` hanya mengubah CSS `display` tanpa merender ulang DOM. Ini cocok untuk elemen yang sering muncul-hilang berdasarkan input pengguna secara real-time, karena lebih efisien.

### 3.5 — Computed Property

**[Tampilkan: bagian computed di stok-app.js]**

Computed property sangat berguna untuk nilai yang diturunkan dari data utama. Contoh kuncinya adalah `bahanAjarFiltered`:

```javascript
bahanAjarFiltered() {
  return this.dataBahanAjar.filter((item) => {
    const cocokCari = !this.cariKata || item.kode.toLowerCase().includes(...) || ...
    const cocokFakultas = !this.filterFakultas || item.fakultas === this.filterFakultas;
    const cocokStatus = !this.filterStatus || item.status === this.filterStatus;
    return cocokCari && cocokFakultas && cocokStatus;
  });
}
```

Vue secara otomatis mendeteksi bahwa property ini bergantung pada `cariKata`, `filterFakultas`, dan `filterStatus`. Setiap kali salah satunya berubah, Vue menghitung ulang nilainya dan tabel pun diperbarui otomatis.

Saya juga membuat computed untuk statistik: `totalJudul`, `totalStok`, `jumlahTersedia`, `jumlahHabis`, dan `stokKritis`.

### 3.6 — Watchers

**[Tampilkan: bagian watch di stok-app.js, lalu demo di browser]**

Saya mengimplementasikan **empat watcher** di `stok-app.js`:

1. **`cariKata`** — Memantau pencarian dan menampilkan notifikasi berapa hasil ditemukan
2. **`filterStatus`** — Memantau perubahan filter status dan menampilkan jumlah DO yang sesuai
3. **`form.jumlah`** — Memantau jika pesanan lebih dari 100 eksemplar untuk memberi peringatan khusus (menggunakan sintaks dot notation untuk nested property)
4. **`form.kode`** — Memantau input kode di form; jika kode valid ditemukan, langsung menampilkan nama bahan ajar dan stoknya

Fungsi watcher berbeda dari computed: watcher digunakan untuk **efek samping** seperti menampilkan notifikasi, memanggil API, atau logging — bukan untuk menghitung nilai baru.

### 3.7 — Form Validasi

**[Demo: klik Ajukan Pemesanan tanpa mengisi form]**

Validasi dilakukan di method `ajukanPemesanan()`. Saya me-reset semua error terlebih dahulu, lalu mengecek satu per satu field yang wajib diisi. Jika ada yang kosong atau tidak valid, pesan error disimpan ke objek `errors` dan form tidak disubmit.

Pesan error ditampilkan menggunakan `v-if`:
```html
<span v-if="errors.kode" class="invalid-feedback">{{ errors.kode }}</span>
```

---

## BAGIAN 4 — HALAMAN 2: TRACKING DO (±4 menit)

**[Buka tracking.html di browser]**

### 4.1 — Filter & Pencarian DO

Halaman tracking menggunakan pola yang sama: `v-model` untuk pencarian dan filter, dengan `doFiltered` sebagai computed property yang menggabungkan semua kriteria filter.

**[Demo: ketik di search, lihat tabel berubah real-time]**

### 4.2 — v-if / v-else untuk Status DO

**[Tunjuk kolom status di tabel]**

Badge status DO menggunakan empat kondisi:
```html
<span v-if="item.status === 'terkirim'" ...>✅ Terkirim</span>
<span v-else-if="item.status === 'dalam perjalanan'" ...>🚚 Dalam Perjalanan</span>
<span v-else-if="item.status === 'diproses'" ...>⚙️ Diproses</span>
<span v-else ...>🕐 Pending</span>
```

### 4.3 — Detail DO & Timeline

**[Klik tombol Detail salah satu DO]**

Ketika tombol "Detail" diklik, method `lihatDetail(item)` menyalin data DO ke `selectedDO`. Panel detail kemudian ditampilkan menggunakan `v-if="selectedDO"`.

Yang menarik adalah **timeline pengiriman** — saya membuat method `stepClass(step)` yang menentukan class CSS setiap langkah berdasarkan posisi status saat ini dalam urutan proses:
```javascript
stepClass(step) {
  const urutan = ['pending', 'diproses', 'dalam perjalanan', 'terkirim'];
  const statusUrutan = urutan.indexOf(this.selectedDO?.status);
  const stepUrutan = urutan.indexOf(step);
  if (stepUrutan < statusUrutan) return 'done';
  if (stepUrutan === statusUrutan) return 'active';
  return '';
}
```

### 4.4 — Update Status & v-bind:disabled

**[Demo: ubah status DO]**

Tombol "Simpan Status" menggunakan `v-bind:disabled` untuk menonaktifkan tombol jika belum ada status yang dipilih:
```html
<button :disabled="!statusBaru" @click="updateStatus">Simpan Status</button>
```

Ini adalah contoh one-way data binding untuk atribut HTML.

### 4.5 — Watchers Tracking

**[Tampilkan: bagian watch di tracking-app.js]**

Di `tracking-app.js`, saya mengimplementasikan **empat watcher**:

1. **`cariNoDO`** — Notifikasi hasil pencarian nomor DO
2. **`filterStatusDO`** — Notifikasi saat filter status diubah
3. **`selectedDO`** — Notifikasi saat detail DO dibuka (memuat info nomor dan tujuan)
4. **`filterTujuan`** — Notifikasi saat filter UPBJJ dipilih

---

## BAGIAN 5 — KESIMPULAN (±1 menit)

**[Kembali ke index.html]**

Dari implementasi Tugas Praktik 2 ini, saya menyimpulkan beberapa hal:

**Pertama**, Vue.js sangat memudahkan pengembangan antarmuka yang reaktif. Cukup dengan mendefinisikan data dan computed property, tampilan otomatis sinkron tanpa manipulasi DOM manual.

**Kedua**, pemisahan kepentingan antara `data`, `computed`, `watch`, dan `methods` membuat kode lebih terorganisir dan mudah di-debug.

**Ketiga**, perbedaan penggunaan `v-if` vs `v-show`, dan `computed` vs `methods` vs `watch` menjadi jelas setelah mengimplementasikannya langsung: masing-masing memiliki kasus penggunaan yang optimal.

**Keempat**, two-way binding dengan `v-model` adalah fitur paling produktif untuk form — menggantikan puluhan baris kode JavaScript manual yang biasanya diperlukan.

Demikian penjelasan Tugas Praktik 2 saya. Semoga bermanfaat.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.

---

## CATATAN TEKNIS UNTUK PEREKAMAN VIDEO

- **Durasi total**: ±12–14 menit (di bawah batas 15 menit)
- **Urutan tampilan**: index.html → struktur folder → stok-app.js → stok.html (demo) → tracking-app.js → tracking.html (demo) → penutup
- **Tips**: Zoom browser ke 110% agar kode dan UI terlihat jelas
- **Rekomendasi tools perekaman**: OBS Studio / Loom / Camtasia
- **Rekomendasi**: Tampilkan kode dan browser secara berdampingan (split screen) saat menjelaskan implementasi

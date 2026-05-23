// stok-app.js — Vue Logic untuk Halaman Stok Bahan Ajar SITTA UT

const { createApp } = Vue;

createApp({
  // ============================================================
  // DATA PROPERTY
  // Menyimpan semua state reaktif dari aplikasi
  // ============================================================
  data() {
    return {
      // Data utama dari dataBahanAjar.js
      dataBahanAjar: [...dataBahanAjar],

      // Filter & pencarian (two-way binding dengan v-model)
      cariKata: "",
      filterFakultas: "",
      filterStatus: "",

      // Data daftar UPBJJ UT
      daftarUPBJJ: [
        "UPBJJ Bandung",
        "UPBJJ Surabaya",
        "UPBJJ Yogyakarta",
        "UPBJJ Medan",
        "UPBJJ Makassar",
        "UPBJJ Semarang",
        "UPBJJ Jakarta",
        "UPBJJ Palembang",
        "UPBJJ Denpasar",
      ],

      // Form pemesanan
      form: {
        kode: "",
        namaPemesan: "",
        upbjj: "",
        jumlah: 0,
        catatan: "",
      },

      // Validasi error messages
      errors: {
        kode: "",
        namaPemesan: "",
        upbjj: "",
        jumlah: "",
      },

      // State UI
      pesanBerhasil: false,
      nomorReferensi: "",

      // Watcher notifications (untuk menampilkan notifikasi)
      notifications: [],
    };
  },

  // ============================================================
  // COMPUTED PROPERTIES
  // Nilai turunan yang dihitung otomatis saat data berubah
  // ============================================================
  computed: {
    // Filter + pencarian gabungan
    bahanAjarFiltered() {
      return this.dataBahanAjar.filter((item) => {
        const cocokCari =
          !this.cariKata ||
          item.kode.toLowerCase().includes(this.cariKata.toLowerCase()) ||
          item.judul.toLowerCase().includes(this.cariKata.toLowerCase());
        const cocokFakultas =
          !this.filterFakultas || item.fakultas === this.filterFakultas;
        const cocokStatus =
          !this.filterStatus || item.status === this.filterStatus;
        return cocokCari && cocokFakultas && cocokStatus;
      });
    },

    // Daftar unik fakultas dari data
    daftarFakultas() {
      return [...new Set(this.dataBahanAjar.map((b) => b.fakultas))];
    },

    // Statistik
    totalJudul() {
      return this.dataBahanAjar.length;
    },
    totalStok() {
      return this.dataBahanAjar.reduce((sum, b) => sum + b.stok, 0);
    },
    jumlahTersedia() {
      return this.dataBahanAjar.filter((b) => b.status === "tersedia").length;
    },
    jumlahHabis() {
      return this.dataBahanAjar.filter((b) => b.status === "habis").length;
    },

    // Bahan ajar dengan stok kritis (≤10)
    stokKritis() {
      return this.dataBahanAjar.filter(
        (b) => b.stok > 0 && b.stok <= 10
      );
    },

    // Stok bahan ajar yang sedang dipilih pada form
    stokBahanAjarDipilih() {
      if (!this.form.kode) return null;
      const item = this.dataBahanAjar.find(
        (b) => b.kode.toLowerCase() === this.form.kode.toLowerCase()
      );
      return item ? item.stok : null;
    },

    // Peringatan jika jumlah pesanan melebihi stok
    peringatanStokTidakCukup() {
      if (!this.stokBahanAjarDipilih || this.form.jumlah <= 0) return false;
      return this.form.jumlah > this.stokBahanAjarDipilih;
    },
  },

  // ============================================================
  // WATCHERS
  // Memantau perubahan data tertentu dan menjalankan efek samping
  // ============================================================
  watch: {
    // WATCHER 1: Pantau perubahan kata pencarian
    cariKata(newVal) {
      if (newVal.length > 2) {
        const jumlah = this.bahanAjarFiltered.length;
        this.tampilkanNotif(
          `🔍 Ditemukan ${jumlah} hasil untuk "${newVal}"`,
          "🔍"
        );
      }
    },

    // WATCHER 2: Pantau perubahan filter status
    filterStatus(newVal) {
      if (newVal) {
        const jumlah = this.bahanAjarFiltered.length;
        this.tampilkanNotif(
          `🏷️ Filter status "${newVal}": ${jumlah} bahan ajar ditemukan`,
          "🏷️"
        );
      }
    },

    // WATCHER 3: Pantau jumlah pesanan (deep watch dengan handler)
    "form.jumlah": {
      handler(newVal) {
        if (newVal > 100) {
          this.tampilkanNotif(
            `📦 Pesanan ${newVal} eksemplar — jumlah besar memerlukan persetujuan khusus`,
            "📦"
          );
        }
      },
    },

    // WATCHER 4: Pantau kode bahan ajar yang diisi di form
    "form.kode": {
      handler(newVal) {
        if (newVal.length >= 7) {
          const item = this.dataBahanAjar.find(
            (b) => b.kode.toLowerCase() === newVal.toLowerCase()
          );
          if (item) {
            this.tampilkanNotif(
              `✅ Ditemukan: "${item.judul}" — Stok: ${item.stok}`,
              "✅"
            );
          }
        }
      },
    },
  },

  // ============================================================
  // METHODS
  // Fungsi-fungsi yang dapat dipanggil dari template
  // ============================================================
  methods: {
    // Mengisi form saat tombol "Pesan" diklik dari tabel
    pilihBahanAjar(item) {
      this.form.kode = item.kode;
      this.form.jumlah = 1;
      this.pesanBerhasil = false;
      // Scroll ke form
      document.querySelector(".card:last-child").scrollIntoView({
        behavior: "smooth",
      });
    },

    // Validasi dan ajukan pemesanan
    ajukanPemesanan() {
      this.errors = { kode: "", namaPemesan: "", upbjj: "", jumlah: "" };
      let valid = true;

      if (!this.form.kode.trim()) {
        this.errors.kode = "Kode bahan ajar wajib diisi";
        valid = false;
      }
      if (!this.form.namaPemesan.trim()) {
        this.errors.namaPemesan = "Nama pemesan wajib diisi";
        valid = false;
      }
      if (!this.form.upbjj) {
        this.errors.upbjj = "UPBJJ tujuan wajib dipilih";
        valid = false;
      }
      if (!this.form.jumlah || this.form.jumlah <= 0) {
        this.errors.jumlah = "Jumlah pesanan harus lebih dari 0";
        valid = false;
      }

      if (!valid) return;

      // Simulasi pengajuan berhasil
      this.nomorReferensi =
        "REF-" +
        Date.now().toString().slice(-6) +
        "-" +
        this.form.kode.slice(-4);
      this.pesanBerhasil = true;
      this.tampilkanNotif(
        `🎉 Pemesanan ${this.form.kode} berhasil! No. Ref: ${this.nomorReferensi}`,
        "🎉"
      );
    },

    // Reset form
    resetForm() {
      this.form = { kode: "", namaPemesan: "", upbjj: "", jumlah: 0, catatan: "" };
      this.errors = { kode: "", namaPemesan: "", upbjj: "", jumlah: "" };
      this.pesanBerhasil = false;
    },

    // Helper: warna stok berdasarkan jumlah
    warnaiStok(stok) {
      if (stok === 0) return "var(--danger)";
      if (stok <= 10) return "var(--warning)";
      return "var(--secondary)";
    },

    // Helper: persentase progress bar stok (max 200)
    progressStok(stok) {
      return Math.min((stok / 200) * 100, 100);
    },

    // Helper: kelas badge per fakultas
    badgeFakultas(fak) {
      const map = {
        FE: "badge-info",
        FMIPA: "badge-success",
        FHISIP: "badge-warning",
        FKIP: "badge-gray",
        MKDU: "badge-info",
      };
      return map[fak] || "badge-gray";
    },

    // Tampilkan notifikasi sementara (hilang otomatis 3 detik)
    tampilkanNotif(pesan, icon = "ℹ️") {
      const notif = { pesan, icon };
      this.notifications.push(notif);
      setTimeout(() => {
        const idx = this.notifications.indexOf(notif);
        if (idx !== -1) this.notifications.splice(idx, 1);
      }, 3000);
    },
  },
}).mount("#stok-app");

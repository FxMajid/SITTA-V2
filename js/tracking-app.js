// tracking-app.js — Vue Logic untuk Halaman Tracking DO SITTA UT

const { createApp } = Vue;

createApp({
  // ============================================================
  // DATA PROPERTY
  // ============================================================
  data() {
    return {
      // Data utama dari dataBahanAjar.js
      dataTrackingDO: [...dataTrackingDO],

      // Filter
      cariNoDO: "",
      filterTujuan: "",
      filterStatusDO: "",

      // Detail DO yang sedang dipilih
      selectedDO: null,

      // Form update status
      statusBaru: "",

      // Notifikasi watcher
      notifications: [],
    };
  },

  // ============================================================
  // COMPUTED PROPERTIES
  // ============================================================
  computed: {
    // Filter DO berdasarkan pencarian dan filter
    doFiltered() {
      return this.dataTrackingDO.filter((item) => {
        const cocokNoDO =
          !this.cariNoDO ||
          item.noDO.toLowerCase().includes(this.cariNoDO.toLowerCase()) ||
          item.kode.toLowerCase().includes(this.cariNoDO.toLowerCase());
        const cocokTujuan =
          !this.filterTujuan || item.tujuan === this.filterTujuan;
        const cocokStatus =
          !this.filterStatusDO || item.status === this.filterStatusDO;
        return cocokNoDO && cocokTujuan && cocokStatus;
      });
    },

    // Daftar tujuan unik dari data
    daftarTujuan() {
      return [...new Set(this.dataTrackingDO.map((d) => d.tujuan))];
    },

    // Statistik
    totalDO() {
      return this.dataTrackingDO.length;
    },
    jumlahTerkirim() {
      return this.dataTrackingDO.filter((d) => d.status === "terkirim").length;
    },
    jumlahDalamPerjalanan() {
      return this.dataTrackingDO.filter(
        (d) => d.status === "dalam perjalanan"
      ).length;
    },
    jumlahProsesPending() {
      return this.dataTrackingDO.filter(
        (d) => d.status === "diproses" || d.status === "pending"
      ).length;
    },
  },

  // ============================================================
  // WATCHERS
  // ============================================================
  watch: {
    // WATCHER 1: Pantau pencarian nomor DO
    cariNoDO(newVal) {
      if (newVal.length >= 3) {
        const jumlah = this.doFiltered.length;
        this.tampilkanNotif(
          `🔍 Pencarian "${newVal}": ${jumlah} DO ditemukan`,
          "🔍"
        );
      }
    },

    // WATCHER 2: Pantau filter status DO
    filterStatusDO(newVal) {
      if (newVal) {
        const jumlah = this.doFiltered.length;
        this.tampilkanNotif(
          `📦 Status "${newVal}": ${jumlah} DO`,
          "📦"
        );
      }
    },

    // WATCHER 3: Pantau perubahan selectedDO
    selectedDO(newVal) {
      if (newVal) {
        this.tampilkanNotif(
          `📋 Membuka detail: ${newVal.noDO} → ${newVal.tujuan}`,
          "📋"
        );
        this.statusBaru = "";
      }
    },

    // WATCHER 4: Pantau filter tujuan UPBJJ
    filterTujuan(newVal) {
      if (newVal) {
        this.tampilkanNotif(
          `🗺️ Filter tujuan: ${newVal}`,
          "🗺️"
        );
      }
    },
  },

  // ============================================================
  // METHODS
  // ============================================================
  methods: {
    // Tampilkan detail DO
    lihatDetail(item) {
      this.selectedDO = { ...item };
      this.$nextTick(() => {
        document.querySelector(".card:last-child").scrollIntoView({
          behavior: "smooth",
        });
      });
    },

    // Update status DO
    updateStatus() {
      if (!this.statusBaru || !this.selectedDO) return;

      const idx = this.dataTrackingDO.findIndex(
        (d) => d.noDO === this.selectedDO.noDO
      );
      if (idx !== -1) {
        this.dataTrackingDO[idx].status = this.statusBaru;
        this.selectedDO = { ...this.dataTrackingDO[idx] };
        this.tampilkanNotif(
          `✅ Status DO ${this.selectedDO.noDO} diperbarui menjadi "${this.statusBaru}"`,
          "✅"
        );
        this.statusBaru = "";
      }
    },

    // Reset semua filter
    resetFilter() {
      this.cariNoDO = "";
      this.filterTujuan = "";
      this.filterStatusDO = "";
    },

    // Cek apakah DO terlambat
    terlambat(item) {
      if (!item.estimasiTiba || item.status === "terkirim") return false;
      const today = new Date();
      const estimasi = new Date(item.estimasiTiba);
      return today > estimasi;
    },

    // Format tanggal ke format Indonesia
    formatTanggal(tgl) {
      if (!tgl) return "—";
      const d = new Date(tgl);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },

    // Menentukan class untuk timeline step
    stepClass(step) {
      const urutan = ["pending", "diproses", "dalam perjalanan", "terkirim"];
      const statusUrutan = urutan.indexOf(this.selectedDO?.status || "pending");
      const stepUrutan = urutan.indexOf(step);

      if (stepUrutan < statusUrutan) return "done";
      if (stepUrutan === statusUrutan) return "active";
      return "";
    },

    // Tampilkan notifikasi sementara
    tampilkanNotif(pesan, icon = "ℹ️") {
      const notif = { pesan, icon };
      this.notifications.push(notif);
      setTimeout(() => {
        const idx = this.notifications.indexOf(notif);
        if (idx !== -1) this.notifications.splice(idx, 1);
      }, 3000);
    },
  },
}).mount("#tracking-app");

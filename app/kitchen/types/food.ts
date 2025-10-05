// Tambahkan MakananOption jika belum ada
export interface MakananOption {
  idMakanan: number;
  namaMakanan: string;
  jenis: Jenis;
}

export interface KomponenUtama {
  id: number;
  nama: string;
  jenis: Jenis;
}

export interface Makanan {
  id: number;
  nama: string;
  jenis: Jenis;
  isPaket?: boolean;
  gambar: string | null;
  createdBy: string;
  utamaDari: KomponenUtama[];
  tanggalTersedia: MakananTanggal[];
}

export interface MakananTanggal {
  id: number;
  tanggal: string; // ISO string dari backend
}

export interface ApiMakanan {
  idMakanan: number;
  namaMakanan: string;
  jenis: Jenis;
  isPaket: boolean;
  gambar: string | null;
  user: {
    namaUser: string;
  };
  utamaDari: {
    idMakanan: number;
    namaMakanan: string;
    jenis: Jenis;
  }[];
  tanggalTersedia: MakananTanggal[];
}

export interface DetailMakanan {
  id: number;
  namaMakanan: string;
  jenis: Jenis;
}

// --- PERUBAHAN: Menyesuaikan tipe dengan backend ---
export interface ApiPesananDetail {
  idPesananDetail: number;
  makanan: {
    namaMakanan: string;
    jenis: Jenis;
  } | null; // Makanan bisa null
  namaMakananHistory?: string;
  jenisHistory?: string;
}

export interface ApiPesanan {
  idPesanan: number;
  sesi: string;
  tanggal: string;
  status: "PENDING" | "SELESAI" | "DITERIMA" | "BATAL";
  namaPasienHistory: string | null;
  ruanganInapHistory: string | null; // Tambahan
  pasien: {
    namaPasien: string;
    ruanganInap: string;
  } | null; // Pasien bisa null
  PesananDetail: ApiPesananDetail[];
}
// ----------------------------------------------------

export interface Pesanan {
  id: number;
  sesi: string;
  tanggal: Date;
  namaPasien: string;
  ruanganInap: string; // Tambahkan ruangan inap
  status: "PENDING" | "SELESAI" | "DITERIMA" | "BATAL";
  detail: DetailMakanan[];
}

export enum Jenis {
  Lauk = "Lauk",
  Karbohidrat = "Karbohidrat",
  Sayur = "Sayur",
  Buah = "Buah",
  Snack = "Snack",
  Minuman = "Minuman",
}

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
  isPaket: boolean;
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
  idMakanan: number;
  namaMakanan: string;
  jenis: Jenis;
}

export interface ApiPesananDetail {
  idPesananDetail: number;
  makanan: DetailMakanan;
}

export interface ApiPesanan {
  idPesanan: number;
  sesi: string;
  tanggal: string;
  status: "PENDING" | "SELESAI" | "DITERIMA" | "BATAL"; // Tambahkan status
  namaPasienHistory: string | null; // Tambahkan histori nama
  pasien: {
    // Pasien bisa null
    namaPasien: string;
    ruanganInap: string;
  } | null;
  PesananDetail: ApiPesananDetail[];
}
export interface Pesanan {
  id: number;
  sesi: string;
  tanggal: Date;
  namaPasien: string;
  ruanganInap: string; // Tambahkan ruangan inap
  status: "PENDING" | "SELESAI" | "DITERIMA" | "BATAL"; // Tambahkan status
  detail: {
    id: number;
    namaMakanan: string;
    jenis: Jenis;
  }[];
}

export enum Jenis {
  Lauk = "Lauk",
  Karbohidrat = "Karbohidrat",
  Sayur = "Sayur",
  Buah = "Buah",
  Snack = "Snack",
  Minuman = "Minuman",
}

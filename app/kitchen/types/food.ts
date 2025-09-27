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
  sesi: string; // 'Menu Pagi', 'Menu Siang', dll.
  tanggal: string;
  pasien: {
    namaPasien: string;
  };
  PesananDetail: ApiPesananDetail[];
}

export interface Pesanan {
  id: number;
  sesi: string;
  tanggal: Date;
  namaPasien: string;
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

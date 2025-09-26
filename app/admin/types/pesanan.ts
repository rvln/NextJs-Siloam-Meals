// Mendefinisikan tipe data yang diterima dari API backend untuk halaman Admin

export interface DetailMakanan {
  namaMakanan: string;
  jenis: string;
}

export interface PesananDetail {
  makanan: DetailMakanan;
}

export interface ApiPesanan {
  idPesanan: number;
  pasien: {
    namaPasien: string;
  };
  sesi: string;
  tanggal: string; // ISO string date
  PesananDetail: PesananDetail[];
}

// Mendefinisikan tipe data yang digunakan di komponen frontend
export interface Pesanan {
  id: number;
  namaPasien: string;
  sesi: string;
  tanggal: Date;
  detail: DetailMakanan[];
}

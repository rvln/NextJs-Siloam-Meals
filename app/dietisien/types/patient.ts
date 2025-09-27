import { Feedback } from "./feedback";

export interface PengecualianMakanan {
  makananId: number;
  makanan: {
    namaMakanan: string;
  };
}

export interface ApiPantangan {
  idPantangan: number;
  namaPantangan: string;
  makanan: {
    idMakanan: number;
    namaMakanan: string;
  };
}

export interface ApiPatient {
  idPasien: number;
  uuid: string;
  mr: string;
  namaPasien: string;
  ruanganInap: string;
  diagnosa: string;
  noKtp: string | null;
  tanggalLahir: string | null;
  status: string;
  validate: boolean;
  Pantangan: ApiPantangan[];
  Feedback: Feedback[]; // Menambahkan feedback
  PengecualianMakanan: PengecualianMakanan[];
}

export interface Patient {
  id: number;
  uuid: string;
  namaPasien: string;
  mr: string;
  ruanganInap: string;
  diagnosa: string;
  validate: boolean;
  Pantangan: {
    namaPantangan: string;
    namaMakanan?: string;
  }[];
  Feedback: Feedback[]; // Menambahkan feedback
  PengecualianMakanan: PengecualianMakanan[];
}

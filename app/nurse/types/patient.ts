import { Feedback } from "./feedback";

export interface ApiMakananInfo {
  idMakanan: number;
  namaMakanan: string;
}

export interface ApiPantangan {
  idPantangan: number;
  namaPantangan: string;
  makanan: ApiMakananInfo;
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
  link: string;
  created_at: string;
  updated_at: string;
  createdBy: number;
  validatedBy: number | null;
  user: {
    namaUser: string;
  };
  Pantangan: ApiPantangan[];
  Feedback: Feedback[]; // Menambahkan feedback
}

export interface PantanganForm {
  namaPantangan: string;
  makananId: number | null;
  namaMakanan?: string;
}

export interface Patient {
  id: number;
  uuid: string;
  namaPasien: string;
  mr: string;
  ruanganInap: string;
  diagnosa: string;
  noKtp: string | null;
  tanggalLahir: string | null;
  validate: boolean;
  Pantangan: PantanganForm[];
  Feedback: Feedback[]; // Menambahkan feedback
}

export interface CreatePatientFormData {
  namaPasien: string;
  mr: string;
  ruanganInap: string;
  diagnosa: string;
  noKtp: string;
  tanggalLahir: string;
  Pantangan: PantanganForm[];
}

export interface MakananOption {
  idMakanan: number;
  namaMakanan: string;
}

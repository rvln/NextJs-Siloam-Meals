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
  noKtp: string;
  tanggalLahir: string;
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
  ruanganInap: string; // Diubah dari tempatTidur
  diagnosa: string;
  noKtp?: string | null; // Ditambahkan
  tanggalLahir?: string | null; // Ditambahkan
  validate: boolean;
  Pantangan: PantanganForm[];
}

export interface CreatePatientFormData {
  namaPasien: string;
  mr: string;
  ruanganInap: string;
  diagnosa: string;
  noKtp?: string;
  tanggalLahir?: string;
  Pantangan: PantanganForm[];
}

export interface PatientPayload {
  namaPasien: string;
  mr: string;
  ruanganInap: string;
  diagnosa: string;
  noKtp?: string;
  tanggalLahir?: string;
  Pantangan: {
    namaPantangan: string;
    makananId: number;
  }[];
}

export interface MakananOption {
  idMakanan: number;
  namaMakanan: string;
}

// Mendefinisikan tipe data yang diterima dari API backend
export interface ApiMakananInfo {
  idMakanan: number;
  namaMakanan: string;
}

export interface ApiPantangan {
  idPantangan: number;
  namaPantangan: string;
  makanan: ApiMakananInfo | null;
}

export interface ApiPatient {
  idPasien: number;
  uuid: string;
  mr: string;
  namaPasien: string;
  tempatTidur: string;
  diagnosa: string;
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

// Mendefinisikan tipe data yang digunakan di komponen frontend
export interface Pantangan {
  namaPantangan: string;
  makananId: number | null;
  namaMakanan?: string;
}

export interface Patient {
  id: number;
  namaPasien: string;
  mr: string;
  tempatTidur: string;
  diagnosa: string;
  validate: boolean;
  Pantangan: Pantangan[];
}

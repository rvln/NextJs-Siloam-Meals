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
}


export enum Jenis {
    Lauk = 'Lauk',
    Karbohidrat = 'Karbohidrat',
    Sayur = 'Sayur',
    Buah = 'Buah',
    Snack = 'Snack',
    Minuman = 'Minuman',
}
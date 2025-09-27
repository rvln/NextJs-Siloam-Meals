export interface Feedback {
  idFeedback: number;
  pesan: string;
  isResolved: boolean;
  created_at: string;
  pengirim: {
    namaUser: string;
    role: string;
  };
}

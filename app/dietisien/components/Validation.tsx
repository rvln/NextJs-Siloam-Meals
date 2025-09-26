"use client";

import { useEffect, useState, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { Patient, ApiPatient } from "../types/patient";
import LogoutButton from "@/components/ui/LogoutButton";
import { Button } from "@/components/ui/button";
import NotificationModal from "@/components/ui/NotificationModal";
import { CheckCircle2, ShieldAlert } from "lucide-react";

interface JwtPayload {
  username: string;
  role: string;
}

export default function Validation() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        setLoggedInUser(decodedToken.username);
      } catch (error) {
        console.error("Token tidak valid:", error);
        setError("Sesi Anda tidak valid, silakan login kembali.");
      }
    }
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token)
          throw new Error("Token tidak ditemukan. Harap login kembali.");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pasien`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data pasien.");

        const dataFromApi: ApiPatient[] = await res.json();

        const mappedPatients: Patient[] = dataFromApi.map((p) => ({
          id: p.idPasien,
          namaPasien: p.namaPasien,
          mr: p.mr,
          tempatTidur: p.tempatTidur,
          diagnosa: p.diagnosa,
          validate: p.validate,
          Pantangan: p.Pantangan
            ? p.Pantangan.map((pt) => ({
                namaPantangan: pt.namaPantangan,
                makananId: pt.makanan?.idMakanan || null,
                namaMakanan: pt.makanan?.namaMakanan || "N/A",
              }))
            : [],
        }));

        setPatients(mappedPatients);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const patientsToValidate = useMemo(() => {
    return patients.filter((p) => !p.validate);
  }, [patients]);

  const handleValidate = async (patientId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token)
        throw new Error("Token tidak ditemukan. Harap login kembali.");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pasien/validate/${patientId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal memvalidasi pasien.");
      }

      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.id === patientId ? { ...p, validate: true } : p
        )
      );

      setModalContent({
        title: "Berhasil!",
        message: "Data pantangan pasien telah berhasil divalidasi.",
        type: "success",
      });
      setIsModalOpen(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui";
      setModalContent({
        title: "Terjadi Kesalahan",
        message,
        type: "error",
      });
      setIsModalOpen(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen">
      <header className="bg-gray-800/50 p-4 rounded-lg shadow-md border border-gray-700 mb-8 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">
            Selamat Datang, <strong>{loggedInUser || "Ahli Gizi"}</strong>!
          </h1>
          <div className="w-32">
            <LogoutButton />
          </div>
        </div>
      </header>

      <h2 className="text-2xl font-bold text-white mb-6">
        Pasien Perlu Validasi Pantangan
      </h2>

      {isLoading && (
        <p className="text-center p-8 text-gray-300">Memuat data pasien...</p>
      )}
      {error && <p className="text-center p-8 text-red-400">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="space-y-6">
          {patientsToValidate.length > 0 ? (
            patientsToValidate.map((patient) => (
              <div
                key={patient.id}
                className="bg-gray-800/70 rounded-lg shadow-lg border border-gray-700 overflow-hidden backdrop-blur-sm"
              >
                <div className="p-5 border-b border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="md:col-span-2">
                    <h3 className="font-bold text-lg text-white">
                      {patient.namaPasien}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                      <span>
                        MR: <span className="font-mono">{patient.mr}</span>
                      </span>
                      <span>Kamar: {patient.tempatTidur}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                      <strong>Diagnosa:</strong> {patient.diagnosa}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <Button
                      onClick={() => handleValidate(patient.id)}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Validasi Pasien
                    </Button>
                  </div>
                </div>
                <div className="p-5 bg-gray-900/50">
                  <h4 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-orange-400" />
                    Pantangan Makanan
                  </h4>
                  {patient.Pantangan && patient.Pantangan.length > 0 ? (
                    <ul className="space-y-2">
                      {patient.Pantangan.map((restriction, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-300 bg-gray-700/50 p-2 rounded-md"
                        >
                          <strong>{restriction.namaPantangan}</strong>
                          {restriction.namaMakanan !== "N/A" && (
                            <span className="text-gray-400 text-xs ml-2">
                              (Terkait: {restriction.namaMakanan})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      Tidak ada pantangan makanan yang tercatat.
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-800/50 rounded-lg shadow-md border border-gray-700 backdrop-blur-sm">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">
                Semua data pasien sudah tervalidasi.
              </p>
            </div>
          )}
        </div>
      )}

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </div>
  );
}

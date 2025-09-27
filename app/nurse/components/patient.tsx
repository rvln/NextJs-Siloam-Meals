"use client";

import { useEffect, useState } from "react";
import PatientDetailView from "./DetailPatient";
import CreatePatient from "./CreatePatient";
import EditPatient from "./EditPatient";
import NotificationModal from "@/components/ui/NotificationModal";
import { Patient, ApiPatient, CreatePatientFormData } from "../types/patient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/ui/LogoutButton";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  username: string;
  role: string;
}

export default function ManagePatient() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        setLoggedInUser(decodedToken.username);
      } catch (error) {
        console.error("Token tidak valid:", error);
        setModalContent({
          title: "Terjadi Kesalahan",
          message: error instanceof Error ? error.message : String(error),
          type: "error",
        });
        setIsModalOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const token = localStorage.getItem("accessToken");
        const url = `${process.env.NEXT_PUBLIC_API_URL}/pasien`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Gagal mengambil data pasien");
        }
        const result = await res.json();

        const dataArray: ApiPatient[] = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
          ? result.data
          : [];

        const mappedPatients: Patient[] = dataArray.map((p) => ({
          id: p.idPasien,
          uuid: p.uuid,
          namaPasien: p.namaPasien,
          mr: p.mr,
          ruanganInap: p.ruanganInap,
          diagnosa: p.diagnosa,
          noKtp: p.noKtp,
          tanggalLahir: p.tanggalLahir,
          validate: p.validate, // Memasukkan data validasi
          Pantangan: p.Pantangan
            ? p.Pantangan.map((pt) => ({
                namaPantangan: pt.namaPantangan,
                makananId: pt.makanan ? pt.makanan.idMakanan : null,
                namaMakanan: pt.makanan ? pt.makanan.namaMakanan : "",
              }))
            : [],
        }));

        setPatients(mappedPatients);
      } catch (err) {
        console.error("Gagal fetch pasien:", err);
        if (err instanceof Error) {
          setModalContent({
            title: "Terjadi Kesalahan",
            message: err.message,
            type: "error",
          });
        } else {
          setModalContent({
            title: "Terjadi Kesalahan",
            message: "Terjadi kesalahan yang tidak diketahui",
            type: "error",
          });
        }
        setIsModalOpen(true);
      }
    }

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      patient.namaPasien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.noKtp &&
        patient.noKtp.toLowerCase().includes(searchTerm.toLowerCase())) ||
      patient.ruanganInap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnosa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePatient = async (newPatientData: CreatePatientFormData) => {
    try {
      const token = localStorage.getItem("accessToken");

      const cleanedData = {
        ...newPatientData,
        Pantangan: newPatientData.Pantangan.filter(
          (p) => p.makananId && p.namaPantangan
        ),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pasien`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal mengambil data pasien");
      }

      const created: ApiPatient = await res.json();

      const mapped: Patient = {
        id: created.idPasien,
        uuid: created.uuid,
        namaPasien: created.namaPasien,
        mr: created.mr,
        ruanganInap: created.ruanganInap,
        diagnosa: created.diagnosa,
        noKtp: created.noKtp,
        tanggalLahir: created.tanggalLahir,
        validate: created.validate,
        Pantangan: created.Pantangan.map((pt) => ({
          namaPantangan: pt.namaPantangan,
          makananId: pt.makanan ? pt.makanan.idMakanan : null,
          namaMakanan: pt.makanan ? pt.makanan.namaMakanan : "",
        })),
      };

      setPatients([...patients, mapped]);
      setIsCreating(false);
      setModalContent({
        title: "Berhasil!",
        message: "Pasien baru telah berhasil ditambahkan ke dalam sistem.",
        type: "success",
      });
      setIsModalOpen(true);
    } catch (err: unknown) {
      console.error("Gagal tambah pasien:", err);
      if (err instanceof Error) {
        setModalContent({
          title: "Terjadi Kesalahan",
          message: err.message,
          type: "error",
        });
      } else {
        setModalContent({
          title: "Terjadi Kesalahan",
          message: "Terjadi kesalahan yang tidak diketahui",
          type: "error",
        });
      }
      setIsModalOpen(true);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditing(true);
  };

  const handleSavePatient = async (updatedPatient: Patient) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pasien/${updatedPatient.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedPatient),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal update pasien");
      }

      const saved: ApiPatient = await res.json();

      const mapped: Patient = {
        id: saved.idPasien,
        uuid: saved.uuid,
        namaPasien: saved.namaPasien,
        mr: saved.mr,
        ruanganInap: saved.ruanganInap,
        diagnosa: saved.diagnosa,
        noKtp: saved.noKtp,
        tanggalLahir: saved.tanggalLahir,
        validate: saved.validate,
        Pantangan: saved.Pantangan.map((pt) => ({
          namaPantangan: pt.namaPantangan,
          makananId: pt.makanan ? pt.makanan.idMakanan : null,
          namaMakanan: pt.makanan ? pt.makanan.namaMakanan : "",
        })),
      };

      setPatients(patients.map((p) => (p.id === mapped.id ? mapped : p)));
      setSelectedPatient(mapped);
      setIsEditing(false);
      setModalContent({
        title: "Berhasil!",
        message: "Data pasien telah berhasil diperbarui.",
        type: "success",
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Gagal edit pasien:", err);
      if (err instanceof Error) {
        setModalContent({
          title: "Terjadi Kesalahan",
          message: err.message,
          type: "error",
        });
      } else {
        setModalContent({
          title: "Terjadi Kesalahan",
          message: "Terjadi kesalahan yang tidak diketahui",
          type: "error",
        });
      }
      setIsModalOpen(true);
    }
  };

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token)
        throw new Error("Token tidak ditemukan, harap login kembali.");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pasien/${patientToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menghapus data pasien");
      }

      setPatients(patients.filter((p) => p.id !== patientToDelete.id));

      if (selectedPatient?.id === patientToDelete.id) {
        setSelectedPatient(null);
        setIsEditing(false);
      }

      setModalContent({
        title: "Berhasil!",
        message: `Data pasien ${patientToDelete.namaPasien} telah berhasil dihapus.`,
        type: "success",
      });
      setIsModalOpen(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setModalContent({
          title: "Terjadi Kesalahan",
          message: err.message,
          type: "error",
        });
      } else {
        setModalContent({
          title: "Terjadi Kesalahan",
          message: "Terjadi kesalahan yang tidak diketahui",
          type: "error",
        });
      }
      setIsModalOpen(true);
    } finally {
      setPatientToDelete(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="bg-gray-200 p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-800">
              Selamat Datang <strong>{loggedInUser || "Pengguna"}</strong>!{" "}
            </p>
            <div className="w-32">
              <LogoutButton />
            </div>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-gray-200 rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Daftar Pasien
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredPatients.length} pasien
                  </span>
                </div>

                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari pasien..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
                  />
                </div>

                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Tambah Pasien Baru
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedPatient?.id === patient.id
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {patient.namaPasien}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {patient.ruanganInap}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      MR: {patient.mr}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      {patient.diagnosa}
                    </p>
                    <div className="flex items-center justify-between">
                      {patient.validate ? (
                        <span className="text-xs text-green-600 font-medium">
                          Tervalidasi
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-600 font-medium">
                          Belum Tervalidasi
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePatient(patient);
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 lg:mt-0 lg:col-span-8 xl:col-span-9">
            {isCreating ? (
              <CreatePatient
                onCreate={handleCreatePatient}
                onCancel={() => setIsCreating(false)}
              />
            ) : selectedPatient ? (
              isEditing ? (
                <EditPatient
                  patient={selectedPatient}
                  onSave={handleSavePatient}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <PatientDetailView
                  patient={selectedPatient}
                  onEdit={() => handleEditPatient(selectedPatient)}
                />
              )
            ) : (
              <div className="bg-gray-200 rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-600 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Pilih Pasien
                </h3>
                <p className="text-gray-500">
                  Pilih pasien dari daftar di sebelah kiri untuk melihat detail
                  dan mengelola data pasien.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />

      <Dialog
        open={!!patientToDelete}
        onOpenChange={() => setPatientToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data pasien atas nama{" "}
              <strong>{patientToDelete?.namaPasien}</strong>? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPatientToDelete(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

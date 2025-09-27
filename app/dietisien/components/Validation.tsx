"use client";

import { useEffect, useState } from "react";
import { Patient, ApiPatient } from "../types/patient";
import { Feedback } from "../types/feedback";
import { Button } from "@/components/ui/button";
import NotificationModal from "@/components/ui/NotificationModal";
import {
  CheckCircle,
  MessageSquare,
  Send,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { MakananOption } from "@/app/kitchen/types/food";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Filter } from "lucide-react";

// Komponen Badge untuk Makanan yang Dikecualikan
const ExclusionBadge = ({
  text,
  onRemove,
}: {
  text: string;
  onRemove: () => void;
}) => (
  <div className="flex items-center gap-1 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full">
    <span>{text}</span>
    <button onClick={onRemove} className="hover:bg-red-200 rounded-full">
      <XCircle className="h-3.5 w-3.5" />
    </button>
  </div>
);

export default function Validation() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [newFeedback, setNewFeedback] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });
  // State BARU untuk fitur filtering
  const [allFoodOptions, setAllFoodOptions] = useState<MakananOption[]>([]);
  const [excludedFoodIds, setExcludedFoodIds] = useState<Set<number>>(
    new Set()
  );
  const [openExclusionPopover, setOpenExclusionPopover] = useState(false);

  // Fungsi untuk mengambil semua data makanan yang tersedia
  useEffect(() => {
    const fetchAllFoods = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/makanan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil daftar makanan");
        const data: MakananOption[] = await res.json();
        setAllFoodOptions(data);
      } catch (error) {
        handleError(error);
      }
    };
    fetchAllFoods();
  }, []);

  useEffect(() => {
    fetchPatients();
  }, []);

  // Perbarui daftar pengecualian saat pasien dipilih
  useEffect(() => {
    if (selectedPatient) {
      const initialExclusions = new Set(
        selectedPatient.PengecualianMakanan.map((p) => p.makananId)
      );
      setExcludedFoodIds(initialExclusions);
      fetchFeedback(selectedPatient.id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pasien`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengambil data pasien");
      const data: ApiPatient[] = await res.json();
      const mappedPatients: Patient[] = data.map((p) => ({
        id: p.idPasien,
        uuid: p.uuid,
        namaPasien: p.namaPasien,
        mr: p.mr,
        ruanganInap: p.ruanganInap,
        diagnosa: p.diagnosa,
        validate: p.validate,
        Pantangan: p.Pantangan.map((pt) => ({
          namaPantangan: pt.namaPantangan,
          namaMakanan: pt.makanan?.namaMakanan,
        })),
        PengecualianMakanan: p.PengecualianMakanan,
        Feedback: p.Feedback,
      }));
      setPatients(mappedPatients);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchFeedback = async (pasienId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/feedback/pasien/${pasienId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Gagal mengambil data feedback");
      const data: Feedback[] = await res.json();
      setFeedbackList(data);
    } catch (error) {
      handleError(error);
    }
  };

  const handleValidate = async (patientId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pasien/validate/${patientId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal memvalidasi pasien");
      }

      setModalContent({
        title: "Berhasil",
        message: "Pasien berhasil divalidasi.",
        type: "success",
      });
      setIsModalOpen(true);
      fetchPatients(); // Refresh data pasien
    } catch (error) {
      handleError(error);
    }
  };

  const handleSendFeedback = async () => {
    if (!selectedPatient || !newFeedback.trim()) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pasienId: selectedPatient.id,
          pesan: newFeedback,
        }),
      });
      if (!res.ok) throw new Error("Gagal mengirim feedback");

      setNewFeedback("");
      fetchFeedback(selectedPatient.id); // Refresh feedback list
      setModalContent({
        title: "Berhasil",
        message: "Feedback berhasil dikirim ke perawat.",
        type: "success",
      });
      setIsModalOpen(true);
    } catch (error) {
      handleError(error);
    }
  };

  // Fungsi BARU untuk menyimpan daftar pengecualian
  const handleSaveExclusions = async () => {
    if (!selectedPatient) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pasien/${selectedPatient.id}/pengecualian`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            makananIds: Array.from(excludedFoodIds),
          }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan pengecualian");
      }
      setModalContent({
        title: "Berhasil",
        message: "Daftar pengecualian makanan berhasil diperbarui.",
        type: "success",
      });
      setIsModalOpen(true);
      fetchPatients(); // Refresh data pasien untuk mendapatkan data terbaru
    } catch (error) {
      handleError(error);
    }
  };

  // Fungsi untuk menambah/menghapus item dari daftar pengecualian
  const toggleExclusion = (makananId: number) => {
    setExcludedFoodIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(makananId)) {
        newSet.delete(makananId);
      } else {
        newSet.add(makananId);
      }
      return newSet;
    });
  };

  const handleError = (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan yang tidak diketahui";
    setModalContent({ title: "Terjadi Kesalahan", message, type: "error" });
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Kolom Daftar Pasien */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-gray-200 rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Daftar Pasien
                </h2>
                <p className="text-sm text-gray-600">
                  Pilih pasien untuk divalidasi
                </p>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedPatient?.id === patient.id
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {patient.namaPasien}
                      </h3>
                      {patient.validate ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Tervalidasi
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">MR: {patient.mr}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Detail dan Validasi */}
          <div className="mt-8 lg:mt-0 lg:col-span-8 xl:col-span-9">
            {selectedPatient ? (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedPatient.namaPasien}
                    </h3>
                    <p className="text-sm text-gray-500">
                      MR: {selectedPatient.mr} | Ruangan:{" "}
                      {selectedPatient.ruanganInap}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleValidate(selectedPatient.id)}
                    disabled={selectedPatient.validate}
                  >
                    {selectedPatient.validate ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    {selectedPatient.validate
                      ? "Sudah Tervalidasi"
                      : "Validasi Pasien"}
                  </Button>
                </div>

                {/* Detail Pantangan */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Data Pantangan Makanan:
                  </h4>
                  {selectedPatient.Pantangan.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {selectedPatient.Pantangan.map((p, index) => (
                        <li key={index}>
                          {p.namaPantangan} ({p.namaMakanan})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Tidak ada data pantangan.
                    </p>
                  )}
                </div>

                {/* Fitur Feedback */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" /> Feedback untuk
                    Perawat
                  </h4>
                  <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                    {feedbackList.map((fb) => (
                      <div
                        key={fb.idFeedback}
                        className={`p-3 rounded-lg ${
                          fb.isResolved ? "bg-gray-100" : "bg-blue-50"
                        }`}
                      >
                        <p className="text-sm text-gray-800">{fb.pesan}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-500">
                            Dari: {fb.pengirim.namaUser} -{" "}
                            {formatDate(fb.created_at)}
                          </p>
                          {fb.isResolved && (
                            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              Telah Disesuaikan
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      placeholder="Tulis catatan atau permintaan penyesuaian untuk perawat..."
                      className="w-full p-2 border rounded-md text-sm text-black"
                      rows={2}
                    />
                    <Button onClick={handleSendFeedback}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-200 rounded-lg p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Pilih Pasien
                </h3>
                <p className="text-gray-500">
                  Pilih pasien dari daftar di sebelah kiri untuk melihat detail
                  dan melakukan validasi.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bagian BARU: Filtering Makanan oleh Dietisien */}
      <div className="p-6 border-t bg-gray-50 rounded-lg shadow-sm">
        {/* Judul */}
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5 text-blue-600" />
          Pengecualian Makanan Spesifik
        </h4>
        <p className="text-sm text-gray-500 mb-6">
          Pilih makanan yang ingin Anda kecualikan dari menu pesanan pasien ini.
        </p>

        {/* Popover Input */}
        <Popover
          open={openExclusionPopover}
          onOpenChange={setOpenExclusionPopover}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal mb-4 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              {excludedFoodIds.size > 0 ? (
                <span className="text-blue-700 font-medium">
                  {excludedFoodIds.size} makanan dikecualikan
                </span>
              ) : (
                <span className="text-gray-500">
                  Pilih makanan untuk dikecualikan
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0 shadow-lg rounded-md border border-gray-200 bg-white"
            align="start"
          >
            <Command>
              <CommandInput
                placeholder="Cari makanan..."
                className="focus:ring-0 focus:outline-none"
              />
              <CommandList>
                <CommandEmpty className="p-4 text-sm text-gray-500">
                  Makanan tidak ditemukan.
                </CommandEmpty>
                <CommandGroup>
                  {allFoodOptions.map((option) => (
                    <CommandItem
                      key={option.idMakanan}
                      onSelect={() => toggleExclusion(option.idMakanan)}
                      className="cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                      <div
                        className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                          excludedFoodIds.has(option.idMakanan)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-gray-800">
                        {option.namaMakanan}{" "}
                        <span className="text-xs text-gray-500">
                          ({option.jenis})
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Badge makanan yang dipilih */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from(excludedFoodIds).map((id) => {
            const food = allFoodOptions.find((f) => f.idMakanan === id);
            return food ? (
              <ExclusionBadge
                key={id}
                text={food.namaMakanan}
                onRemove={() => toggleExclusion(id)}
              />
            ) : null;
          })}
        </div>

        {/* Tombol Simpan */}
        <Button
          onClick={handleSaveExclusions}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
        >
          Simpan Perubahan
        </Button>
      </div>

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

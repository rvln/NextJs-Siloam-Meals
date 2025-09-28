"use client";

import { useEffect, useState } from "react";
import { Patient } from "../types/patient";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  FilePenLine,
  MessageSquare,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import NotificationModal from "@/components/ui/NotificationModal";
import { Feedback } from "../types/feedback";

interface PatientDetailViewProps {
  patient: Patient;
  onEdit: () => void;
}

export default function PatientDetailView({
  patient,
  onEdit,
}: PatientDetailViewProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  const handleError = (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan yang tidak diketahui";
    setModalContent({
      title: "Terjadi Kesalahan",
      message,
      type: "error",
    });
    setIsModalOpen(true);
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
      setFeedbacks(data);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    if (patient) {
      fetchFeedback(patient.id);
    }
  }, [patient]);

  const handleGenerateQr = async () => {
    setIsLoadingQr(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pasien/qr/${patient.uuid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal membuat QR Code");
      }

      const data = await response.json();
      setQrCodeUrl(data.qrCodeUrl);
    } catch (err) {
      console.error("Error generating QR Code:", err);
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
      setIsLoadingQr(false);
    }
  };

  const handleDownloadImage = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr-code-${patient.namaPasien}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleResolveFeedback = async (feedbackId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/feedback/${feedbackId}/resolve`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Gagal menyelesaikan feedback");
      fetchFeedback(patient.id); // Refresh feedback list
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Detail Pasien</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                {/* PERUBAHAN DI SINI: Tombol di-disable jika pasien belum tervalidasi */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateQr}
                  className="flex-1 sm:flex-initial flex items-center gap-2 text-black"
                  disabled={!patient.validate}
                  title={
                    !patient.validate
                      ? "Pasien harus divalidasi oleh dietisien terlebih dahulu"
                      : "Tampilkan QR Code"
                  }
                >
                  <QrCode className="h-4 w-4" />
                  Tampilkan QR
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center text-xl">
                    QR Code Pemesanan
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4 flex flex-col items-center justify-center">
                  {isLoadingQr && (
                    <p className="text-gray-500">Membuat QR Code...</p>
                  )}
                  {qrCodeUrl && (
                    <>
                      <Image
                        src={qrCodeUrl}
                        alt={`QR Code for ${patient.namaPasien}`}
                        width={250}
                        height={250}
                      />
                      <p className="mt-4 text-sm text-gray-700 font-medium">
                        {patient.namaPasien}
                      </p>
                      <p className="text-xs text-gray-500">MR: {patient.mr}</p>
                    </>
                  )}
                </div>
                <DialogFooter className="sm:flex-col gap-2 sm:gap-0">
                  <Button onClick={handleDownloadImage} disabled={!qrCodeUrl}>
                    Download Gambar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              size="sm"
              onClick={onEdit}
              className="flex-1 sm:flex-initial flex items-center gap-2"
            >
              <FilePenLine className="h-4 w-4" />
              Edit Pasien
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Status Validasi */}
        <div className="mb-6">
          {patient.validate ? (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md flex items-center">
              <ShieldCheck className="h-6 w-6 mr-3" />
              <div>
                <p className="font-bold">Tervalidasi oleh Dietisien</p>
                <p className="text-sm">
                  Pasien sudah dapat menggunakan QR code untuk memesan makanan.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md flex items-center">
              <ShieldAlert className="h-6 w-6 mr-3" />
              <div>
                <p className="font-bold">Belum Tervalidasi</p>
                <p className="text-sm">
                  Tombol "Tampilkan QR" akan aktif setelah data divalidasi oleh
                  ahli gizi.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-150 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {patient.namaPasien}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Medical Record
                  </p>
                  <p className="text-gray-900 font-mono">{patient.mr}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Ruangan Inap
                  </p>
                  <p className="text-gray-900">{patient.ruanganInap}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Diagnosa</p>
                  <p className="text-gray-900">{patient.diagnosa}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">No. KTP</p>
                  <p className="text-gray-900">{patient.noKtp || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tanggal Lahir
                  </p>
                  <p className="text-gray-900">
                    {patient.tanggalLahir
                      ? new Date(patient.tanggalLahir).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-orange-150 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                Pantangan Makanan
              </h4>
              {patient.Pantangan && patient.Pantangan.length > 0 ? (
                <div className="space-y-3">
                  {patient.Pantangan.map((restriction, index) => (
                    <div
                      key={index}
                      className="bg-white border border-orange-200 rounded-md p-3"
                    >
                      <p className="text-orange-800 font-medium text-sm">
                        {restriction.namaPantangan}
                      </p>
                      {restriction.namaMakanan && (
                        <p className="text-orange-600 text-xs mt-1">
                          Makanan Terkait:{" "}
                          <strong>{restriction.namaMakanan}</strong>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Tidak ada pantangan makanan
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Feedback dari Dietisien
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {feedbacks.length > 0 ? (
                feedbacks.map((feedback) => (
                  <div
                    key={feedback.idFeedback}
                    className="bg-white border border-blue-200 rounded-md p-3 flex justify-between items-start gap-4"
                  >
                    <div>
                      <p className="text-sm text-gray-800">{feedback.pesan}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Oleh: <strong>{feedback.pengirim.namaUser}</strong> -{" "}
                        {new Date(feedback.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {feedback.isResolved ? (
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                          Selesai
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleResolveFeedback(feedback.idFeedback)
                          }
                          className="text-xs text-black border-gray-300 hover:bg-gray-200 transition-colors"
                        >
                          Selesaikan
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  Belum ada feedback untuk pasien ini.
                </p>
              )}
            </div>
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
    </div>
  );
}

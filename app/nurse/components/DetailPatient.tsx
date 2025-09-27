"use client";

import { useEffect, useState } from "react";
import { Patient } from "../types/patient";
import { Feedback } from "../types/feedback";
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
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  Check,
} from "lucide-react";
import Image from "next/image";
import NotificationModal from "@/components/ui/NotificationModal";

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
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);

  useEffect(() => {
    if (patient) {
      fetchFeedback(patient.id);
    }
  }, [patient]);

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

      // Perbarui state secara lokal
      setFeedbackList((prev) =>
        prev.map((fb) =>
          fb.idFeedback === feedbackId ? { ...fb, isResolved: true } : fb
        )
      );

      setModalContent({
        title: "Berhasil",
        message: "Feedback telah ditandai selesai.",
        type: "success",
      });
      setIsModalOpen(true);
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan yang tidak diketahui";
    setModalContent({ title: "Terjadi Kesalahan", message, type: "error" });
    setIsModalOpen(true);
  };

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
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal membuat QR Code");
      }

      const data = await response.json();
      setQrCodeUrl(data.qrCodeUrl);
    } catch (err) {
      handleError(err);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Detail Pasien</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateQr}
                  className="flex-1 sm:flex-initial flex items-center gap-2 text-black"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {patient.namaPasien}
                </h3>
                {patient.validate ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Tervalidasi oleh Dietisien
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Belum Tervalidasi
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black">
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
                <div>
                  <p className="text-sm font-medium text-gray-500">No. KTP</p>
                  <p className="text-gray-900">{patient.noKtp || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tanggal Lahir
                  </p>
                  <p className="text-gray-900">
                    {formatDate(patient.tanggalLahir || "")}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Diagnosa</p>
                  <p className="text-gray-900">{patient.diagnosa}</p>
                </div>
              </div>
            </div>

            {/* Kotak Feedback */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Feedback dari Dietisien
              </h4>
              {feedbackList.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {feedbackList.map((fb) => (
                    <div
                      key={fb.idFeedback}
                      className={`p-3 rounded-lg flex justify-between items-start ${
                        fb.isResolved ? "bg-gray-100" : "bg-white"
                      }`}
                    >
                      <div>
                        <p className="text-sm text-gray-800">{fb.pesan}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Dari: {fb.pengirim.namaUser} -{" "}
                          {formatDateTime(fb.created_at)}
                        </p>
                      </div>
                      {!fb.isResolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveFeedback(fb.idFeedback)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Selesai
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Tidak ada feedback.</p>
              )}
            </div>
          </div>

          {/* Kolom Pantangan */}
          <div>
            <div className="bg-orange-50 rounded-lg p-6">
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

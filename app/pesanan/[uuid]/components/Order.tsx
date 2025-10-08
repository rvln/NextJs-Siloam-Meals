"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ChefHat } from "lucide-react";

// Tipe data tetap sama
type Utama = {
  idMakanan: number;
  namaMakanan: string;
  jenis?: string;
  gambar?: string;
};

interface MenuItem {
  makananId: number;
  nama: string;
  image: string;
  jenis: string;
  utamaDari?: Utama[];
}

interface OrderProps {
  selectedDish: MenuItem;
  uuid: string;
  sesi: string;
  onBack: () => void;
}

/**
 * Halaman Pemilihan Makanan Pendamping
 * Didesain ulang agar bersih, fokus, dan konsisten dengan halaman menu.
 */
export default function Order({
  selectedDish,
  sesi,
  uuid,
  onBack,
}: OrderProps) {
  const [selectedByJenis, setSelectedByJenis] = useState<
    Record<string, number | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [allMakanan, setAllMakanan] = useState<Utama[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/pesanan/makanan/${uuid}`;
    fetch(url)
      .then((res) =>
        res.ok
          ? res.json()
          : Promise.reject("Gagal memuat pilihan makanan pendamping")
      )
      .then((data: Utama[]) => {
        const filtered = data.filter((item: Utama) => item.jenis !== "Lauk");
        setAllMakanan(filtered);
      })
      .catch((error) => console.error("Error fetching makanan:", error))
      .finally(() => setLoading(false));
  }, [uuid]);

  useEffect(() => {
    if (selectedDish.utamaDari) {
      const defaults: Record<string, number | null> = {};
      selectedDish.utamaDari.forEach((u) => {
        if (u.jenis) defaults[u.jenis] = u.idMakanan;
      });
      setSelectedByJenis((prev) => ({ ...prev, ...defaults }));
    }
  }, [selectedDish]);

  const grouped = allMakanan.reduce<Record<string, Utama[]>>((acc, m) => {
    if (!m.jenis) return acc;
    if (!acc[m.jenis]) acc[m.jenis] = [];
    acc[m.jenis].push(m);
    return acc;
  }, {});

  const handleCategorySelection = (jenis: string, itemId: number) => {
    setSelectedByJenis((prev) => ({ ...prev, [jenis]: itemId }));
  };

  const handleOrderNow = async () => {
    setProcessing(true);
    try {
      const details = Object.values(selectedByJenis)
        .filter((id) => id !== null)
        .map((makananId) => ({
          makananId,
        }));
      details.push({ makananId: selectedDish.makananId });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pesanan/${uuid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sesi, details }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Gagal membuat pesanan");
      }
      setOpenModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
      setProcessing(false);
    }
  };

  const isOrderComplete = Object.keys(grouped).every(
    (jenis) => selectedByJenis[jenis]
  );

  const selectedItems = Object.values(selectedByJenis)
    .map((id) => allMakanan.find((m) => m.idMakanan === id))
    .filter(Boolean) as Utama[];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-gray-600 hover:bg-gray-200"
          >
            <ArrowLeft size={20} className="mr-2" />
            Kembali ke Menu
          </Button>
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-6">
            <div className="relative h-24 w-24 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={selectedDish.image || "/placeholder.svg"}
                alt={selectedDish.nama}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-500">
                Menu Utama Pilihan Anda
              </h2>
              <h1 className="text-3xl font-bold" style={{ color: "#003d79" }}>
                {selectedDish.nama}
              </h1>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {loading ? (
            <p className="text-center text-gray-500">Memuat pilihan...</p>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border">
              <ChefHat size={40} className="mx-auto text-gray-300" />
              <p className="text-gray-500 mt-4 font-semibold">
                Tidak ada makanan pendamping tersedia.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([jenis, items]) => (
              <div key={jenis}>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  {jenis}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <button
                      key={item.idMakanan}
                      onClick={() =>
                        handleCategorySelection(jenis, item.idMakanan)
                      }
                      className={`relative bg-white rounded-xl p-3 text-center border-2 transition-all duration-200 ${
                        selectedByJenis[jenis] === item.idMakanan
                          ? "border-green-500 shadow-lg scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-2 relative">
                        <Image
                          src={
                            item.gambar ||
                            "https://placehold.co/400x400/e2e8f0/e2e8f0"
                          }
                          alt={item.namaMakanan}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <p className="text-gray-800 text-sm font-medium">
                        {item.namaMakanan}
                      </p>
                      {selectedByJenis[jenis] === item.idMakanan && (
                        <div className="absolute top-1 right-1 bg-white rounded-full p-0.5">
                          <Check
                            size={16}
                            className="text-white"
                            style={{
                              backgroundColor: "#43a047",
                              borderRadius: "99px",
                            }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating Action Bar */}
        <div className="sticky bottom-0 left-0 right-0 p-4 mt-12 bg-white/80 backdrop-blur-sm border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => setOpenModal(true)}
              disabled={!isOrderComplete || loading}
              className="w-full py-6 text-lg font-semibold transition-all"
              style={{
                backgroundColor: isOrderComplete ? "#43a047" : undefined,
              }}
            >
              Lanjutkan Pesanan
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 m-4">
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: "#003d79" }}
            >
              Konfirmasi Pesanan
            </h2>
            <p className="text-gray-600 mb-5">
              Anda akan memesan menu berikut:
            </p>
            <div className="mb-6 space-y-2 p-4 bg-slate-50 rounded-lg border">
              <div className="font-bold text-gray-800 flex items-center gap-2">
                <Check size={18} className="text-green-500" />
                {selectedDish.nama}
              </div>
              {selectedItems.map((item) => (
                <div
                  key={item.idMakanan}
                  className="text-gray-600 pl-7 text-sm"
                >
                  + {item.namaMakanan}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setOpenModal(false)}
                disabled={processing}
              >
                Batal
              </Button>
              <Button
                onClick={handleOrderNow}
                disabled={processing}
                style={{ backgroundColor: "#43a047" }}
              >
                {processing ? "Memproses..." : "Ya, Pesan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 m-4 text-center">
            <Check
              size={48}
              className="mx-auto text-white p-2 rounded-full mb-4"
              style={{ backgroundColor: "#43a047" }}
            />
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: "#003d79" }}
            >
              Pesanan Berhasil
            </h2>
            <p className="text-gray-600 mb-6">
              Pesanan Anda telah kami terima. Silakan kembali ke menu utama.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              style={{ backgroundColor: "#003d79" }}
            >
              Selesai
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

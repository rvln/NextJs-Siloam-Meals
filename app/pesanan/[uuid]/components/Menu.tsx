"use client";

import { useEffect, useState } from "react";
import Order from "./Order";
import Image from "next/image";
import { Calendar, Check, ChefHat } from "lucide-react";
import { FoodCard } from "./FoodCard"; // Impor komponen baru
import { Button } from "@/components/ui/button";

// Definisi tipe data tetap sama
export interface Utama {
  idMakanan: number;
  namaMakanan: string;
  jenis?: string;
}

export interface ApiMakanan {
  idMakanan: number;
  namaMakanan: string;
  gambar: string;
  jenis: string;
  isPaket: boolean;
  utamaDari?: Utama[];
}

export interface ApiMenu {
  idMenu: number;
  namaMenu: string;
  Makanan: ApiMakanan[];
}

export interface MenuItem {
  makananId: number;
  nama: string;
  image: string;
  jenis: string;
  isPaket: boolean;
  utamaDari?: Utama[];
}

interface MenuProps {
  uuid: string;
  initialData: ApiMenu[];
}

/**
 * Halaman Utama Pemesanan Makanan
 * Menerapkan skema warna 60-30-10, layout grid, dan prinsip-prinsip UX
 * untuk kemudahan penggunaan oleh pasien.
 */
export default function Menu({ uuid, initialData }: MenuProps) {
  // Semua state dan useEffect Anda tetap di sini, tidak ada perubahan logika
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [menuList, setMenuList] = useState<ApiMenu[]>(initialData);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disabledSessions, setDisabledSessions] = useState<string[]>([]);
  const [showPackageConfirm, setShowPackageConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const menu = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pesanan/menu/${uuid}`
        );
        if (!menu.ok) throw new Error("Network response was not ok");
        const data: ApiMenu[] = await menu.json();
        setMenuList(data);

        const resPesanan = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pesanan/${uuid}`
        );
        if (resPesanan.ok) {
          const existing: any[] = await resPesanan.json();

          // PERBAIKAN LOGIKA: Pesanan dibuat untuk besok, jadi kita cek pesanan untuk besok.
          const orderDate = new Date();
          orderDate.setDate(orderDate.getDate() + 1);

          const sessions = existing
            .filter((p) => isSameDate(p.tanggal, orderDate))
            .map((p) => p.sesi);
          setDisabledSessions(sessions);

          const firstAvailable = data.find(
            (menu) => !sessions.includes(menu.namaMenu)
          );
          setSelectedMenuId(firstAvailable ? firstAvailable.idMenu : null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuData();
  }, [uuid]);

  const getOrderDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const handlePackageOrder = (dishData: ApiMakanan) => {
    const dishToOrder: MenuItem = {
      makananId: dishData.idMakanan,
      nama: dishData.namaMakanan,
      image: dishData.gambar,
      jenis: dishData.jenis,
      isPaket: dishData.isPaket,
      utamaDari: dishData.utamaDari,
    };
    setSelectedDish(dishToOrder);
    setShowPackageConfirm(true);
  };

  const confirmPackageOrder = async () => {
    if (!selectedDish) return;
    setProcessing(true);
    try {
      const mainDish = { makananId: selectedDish.makananId };
      const sideDishes =
        selectedDish.utamaDari?.map((item) => ({
          makananId: item.idMakanan,
        })) ?? [];
      const details = [mainDish, ...sideDishes];

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pesanan/${uuid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sesi: activeMenu?.namaMenu, details }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Gagal membuat pesanan");
      }
      setShowPackageConfirm(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleFlexibleOrderClick = (dishData: ApiMakanan) => {
    const dishToOrder: MenuItem = {
      makananId: dishData.idMakanan,
      nama: dishData.namaMakanan,
      image: dishData.gambar,
      jenis: dishData.jenis,
      isPaket: dishData.isPaket,
      utamaDari: dishData.utamaDari,
    };
    setSelectedDish(dishToOrder);
    setShowOrder(true);
  };

  const handleBackToMenu = () => {
    setShowOrder(false);
    setSelectedDish(null);
  };

  const activeMenu = menuList.find((menu) => menu.idMenu === selectedMenuId);

  if (showOrder && selectedDish) {
    return (
      <Order
        selectedDish={selectedDish}
        uuid={uuid}
        sesi={activeMenu?.namaMenu || ""}
        onBack={handleBackToMenu}
      />
    );
  }

  // Desain UI Baru
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ color: "#003d79" }}
          >
            Menu Makanan Anda
          </h1>
          <p className="text-gray-500 mt-3 flex items-center justify-center gap-2 text-lg">
            <Calendar size={20} className="text-gray-400" />
            <span>
              Pemesanan untuk: <strong>{getOrderDate()}</strong>
            </span>
          </p>
        </header>

        {!isLoading && !error && menuList.length > 0 && (
          <div className="flex justify-center mb-10">
            <div className="bg-white rounded-full p-1.5 shadow-sm border flex gap-2">
              {menuList.map((menu) => {
                const isDisabled = disabledSessions.includes(menu.namaMenu);
                return (
                  <button
                    key={menu.idMenu}
                    onClick={() =>
                      !isDisabled && setSelectedMenuId(menu.idMenu)
                    }
                    disabled={isDisabled}
                    className={`flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                      selectedMenuId === menu.idMenu
                        ? "text-white shadow-md"
                        : isDisabled
                        ? "bg-green-100 text-green-800 cursor-not-allowed" // Style baru untuk disabled
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    style={
                      selectedMenuId === menu.idMenu
                        ? { backgroundColor: "#003d79" }
                        : {}
                    }
                  >
                    {/* Logika Tampilan Baru untuk Tombol Disabled */}
                    {isDisabled ? (
                      <>
                        <Check size={16} className="mr-1.5" /> Sudah Dipesan
                      </>
                    ) : (
                      menu.namaMenu
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-gray-500 mt-16">Memuat menu...</p>
        ) : error ? (
          <p className="text-center text-red-500 mt-16">Error: {error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMenu && activeMenu.Makanan.length > 0 ? (
              activeMenu.Makanan.map((item) => (
                <FoodCard
                  key={item.idMakanan}
                  item={item}
                  onOrderClick={
                    item.isPaket ? handlePackageOrder : handleFlexibleOrderClick
                  }
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-sm border">
                <ChefHat size={48} className="mx-auto text-gray-300" />
                <p className="text-gray-500 mt-4 font-semibold">
                  {!activeMenu
                    ? "Anda sudah memesan untuk semua sesi hari ini."
                    : "Tidak ada menu yang tersedia."}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Silakan cek kembali nanti atau hubungi perawat.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal Konfirmasi Pesanan Paket */}
        {showPackageConfirm && selectedDish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6 m-4">
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: "#003d79" }}
              >
                Konfirmasi Pesanan Paket
              </h2>
              <p className="text-gray-600 mb-5">
                Anda akan memesan paket{" "}
                <span className="font-bold">{selectedDish.nama}</span> beserta
                pendampingnya.
              </p>

              <div className="mb-6 space-y-2 p-4 bg-slate-50 rounded-lg border">
                <div className="font-bold text-gray-800 flex items-center gap-2">
                  <Check size={18} className="text-green-500" />
                  {selectedDish.nama}
                </div>
                {selectedDish.utamaDari?.map((item) => (
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
                  onClick={() => setShowPackageConfirm(false)}
                  disabled={processing}
                >
                  Batal
                </Button>
                <Button
                  onClick={confirmPackageOrder}
                  disabled={processing}
                  style={{ backgroundColor: "#43a047" }} // Siloam Green
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
                Pesanan Anda telah kami terima dan akan segera diproses.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                style={{ backgroundColor: "#003d79" }} // Siloam Blue
              >
                Selesai
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function isSameDate(a: string | Date, b: string | Date) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

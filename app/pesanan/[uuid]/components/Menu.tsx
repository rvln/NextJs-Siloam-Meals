"use client";

import { useEffect, useState } from "react";
import Order from "./Order";
import Image from "next/image";
import { Calendar, Check } from "lucide-react";

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

export default function Menu({ uuid, initialData }: MenuProps) {
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [showOrder, setShowOrder] = useState(false);

  const [menuList, setMenuList] = useState<ApiMenu[]>(initialData); // Menyimpan data menu dari API
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null); // Menu mana yang sedang aktif
  const [isLoading, setIsLoading] = useState(true); // Status loading
  const [error, setError] = useState<string | null>(null); // Status jika ada error

  const [disabledSessions, setDisabledSessions] = useState<string[]>([]);
  // STATE BARU UNTUK MENU PAKET
  const [showPackageConfirm, setShowPackageConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // GANTI DENGAN URL API ANDA
        const menu = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pesanan/menu/${uuid}`
        );
        if (!menu.ok) {
          throw new Error("Network response was not ok");
        }
        const data: ApiMenu[] = await menu.json();
        setMenuList(data);

        const resPesanan = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pesanan/${uuid}`
        );
        if (resPesanan.ok) {
          const existing: unknown = await resPesanan.json();
          const today = new Date();
          // bisa array atau single object
          let sessions: string[] = [];

          if (Array.isArray(existing)) {
            // pastikan setiap item adalah object dengan properti sesi string
            sessions = existing
              .filter((p) => {
                if (
                  typeof p === "object" &&
                  p !== null &&
                  "sesi" in p &&
                  "tanggal" in p
                ) {
                  const obj = p as Record<string, unknown>;
                  const tanggal = obj.tanggal;
                  if (typeof tanggal === "string" || tanggal instanceof Date) {
                    return isSameDate(tanggal as string | Date, today); // hanya ambil pesanan hari ini
                  }
                }
                return false;
              })
              .map((p) => (p as Record<string, unknown>).sesi as string);
          } else if (
            typeof existing === "object" &&
            existing !== null &&
            "sesi" in existing &&
            "tanggal" in existing &&
            (() => {
              const obj = existing as Record<string, unknown>;
              const tanggal = obj.tanggal;
              return typeof tanggal === "string" || tanggal instanceof Date
                ? isSameDate(tanggal as string | Date, today)
                : false;
            })()
          ) {
            sessions = [(existing as Record<string, unknown>).sesi as string];
          }

          setDisabledSessions(sessions);

          const firstAvailable = data.find(
            (menu) => !sessions.includes(menu.namaMenu)
          );
          if (firstAvailable) {
            setSelectedMenuId(firstAvailable.idMenu);
          } else {
            setSelectedMenuId(null); // Tidak ada tab aktif
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [uuid]);

  // FUNGSI BARU UNTUK PESAN PAKET
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

  // FUNGSI BARU UNTUK KONFIRMASI PESANAN PAKET
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
        alert("Gagal membuat pesanan: " + error.message);
        return;
      }
      setShowPackageConfirm(false);
    } catch (err) {
      console.error("Error saat membuat pesanan:", err);
      alert("Terjadi kesalahan saat membuat pesanan");
    } finally {
      setProcessing(false);
      setShowSuccessModal(true);
    }
  };

  // FUNGSI LAMA UNTUK PESAN MENU FLEKSIBEL
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

  return (
    <div className="min-h-screen bg-gray-400 px-6 py-16">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl sm:text-3xl font-semibold">
              Menu Pesanan Anda
            </h1>
            {/* Tampilkan tanggal pemesanan */}
            {/* <p className="text-green-200 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <Calendar size={16} />
              <span>
                Untuk hari: <strong>{getOrderDate()}</strong>
              </span>
            </p> */}
          </div>
          <div>
            <h1 className="text-white text-2xl sm:text-3xl font-semibold">
              Menu Hari Ini
            </h1>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-3">
            <div className="text-sm text-green-100 bg-white/5 px-3 py-1 rounded-full">
              {activeMenu?.Makanan.length} menu
            </div>
          </div>
        </div>

        {/* Tampilan Loading */}
        {isLoading && <p className="text-white">Memuat menu...</p>}

        {/* Tampilan Error */}
        {error && <p className="text-red-300">Error: {error}</p>}

        {!isLoading && !error && menuList.length > 0 && (
          <div className="flex bg-white rounded-xl p-1 max-w-sm mx-auto gap-1">
            {menuList.map((menu) => {
              const isDisabled = disabledSessions.includes(menu.namaMenu);
              return (
                <button
                  key={menu.idMenu}
                  onClick={() => !isDisabled && setSelectedMenuId(menu.idMenu)}
                  disabled={isDisabled}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                                        ${
                                          selectedMenuId === menu.idMenu
                                            ? "bg-green-600 text-white"
                                            : isDisabled
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "text-gray-600 hover:text-gray-800"
                                        }`}
                >
                  {isDisabled ? "Sudah dipesan" : menu.namaMenu}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="space-y-12">
        {activeMenu
          ? activeMenu.Makanan.map((item) => (
              <div
                key={item.idMakanan}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm"
              >
                {/* Food Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={item.gambar || "/placeholder.svg"}
                    alt={item.namaMakanan}
                    className="w-full h-full object-cover"
                    width={80}
                    height={80}
                    sizes="(max-width: 80px) 100vw, 80px"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-gray-800 font-medium text-lg mb-3">
                    {item.namaMakanan}
                  </h3>
                  {item.isPaket && item.utamaDari && (
                    <p className="text-xs text-gray-500 mb-3">
                      Sudah termasuk:{" "}
                      {item.utamaDari.map((u) => u.namaMakanan).join(", ")}
                    </p>
                  )}

                  {/* LOGIKA TOMBOL BARU */}
                  {item.isPaket ? (
                    <button
                      onClick={() => handlePackageOrder(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors self-start"
                    >
                      Pesan Paket Ini
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFlexibleOrderClick(item)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors self-start"
                    >
                      Pilih Pendamping
                    </button>
                  )}
                  {/* MODAL BARU UNTUK KONFIRMASI PAKET */}
                  {showPackageConfirm && selectedDish && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-fadeIn">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                          Konfirmasi Pesanan Paket
                        </h2>
                        <p className="text-gray-600 mb-4">
                          Anda akan memesan paket berikut:
                        </p>

                        <div className="mb-6 space-y-2 p-4 bg-gray-50 rounded-lg">
                          <div className="font-bold text-gray-800 flex items-center gap-2">
                            {" "}
                            <Check size={16} className="text-green-500" />{" "}
                            {selectedDish.nama}
                          </div>
                          {selectedDish.utamaDari?.map((item) => (
                            <div
                              key={item.idMakanan}
                              className="text-gray-600 pl-6 text-sm flex items-center gap-2"
                            >
                              <Check size={14} className="text-green-500" />
                              {item.namaMakanan}
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition text-black"
                            onClick={() => {
                              setShowPackageConfirm(false);
                              setSelectedDish(null);
                            }}
                            disabled={processing}
                          >
                            Batal
                          </button>
                          <button
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
                            onClick={confirmPackageOrder}
                            disabled={processing}
                          >
                            {processing ? "Memproses..." : "Ya, Pesan"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          : !isLoading && (
              <p className="text-white text-center">
                Kamu sudah selesai memesan
              </p>
            )}
        {activeMenu && activeMenu.Makanan.length === 0 && (
          <p className="text-center text-white">
            Tidak ada makanan di menu ini.
          </p>
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

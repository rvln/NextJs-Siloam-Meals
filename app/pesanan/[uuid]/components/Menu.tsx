"use client";

import { useEffect, useState } from "react";
import Order from "./Order";
import Image from "next/image";
import { Calendar } from "lucide-react";

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

  // **LOGIKA BARU: Tentukan tanggal untuk ditampilkan**
  const getOrderDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(tomorrow);
  };

  const handleOrderClick = (dishData: ApiMakanan) => {
    // Transformasi data dari API ke format yang dibutuhkan komponen Order
    const dishToOrder: MenuItem = {
      makananId: dishData.idMakanan,
      nama: dishData.namaMakanan,
      image: dishData.gambar,
      jenis: dishData.jenis,
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
    console.log("selectedDish di menu.tsx:", selectedDish);
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
            <p className="text-green-200 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <Calendar size={16} />
              <span>
                Untuk hari: <strong>{getOrderDate()}</strong>
              </span>
            </p>
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

                  {/* Order Button */}
                  <button
                    onClick={() => handleOrderClick(item)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors self-start"
                  >
                    Klik untuk pesan
                  </button>
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

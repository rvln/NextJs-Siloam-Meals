"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Pesanan, ApiPesanan } from "../types/pesanan";
import LogoutButton from "@/components/ui/LogoutButton";
import { Calendar, Utensils, User, NotebookText } from "lucide-react";

interface JwtPayload {
  username: string;
  role: string;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Pesanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

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
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token)
          throw new Error("Token tidak ditemukan. Harap login kembali.");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pesanan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Gagal mengambil data pesanan.");

        const dataFromApi: ApiPesanan[] = await res.json();

        const mappedOrders: Pesanan[] = dataFromApi.map((o) => ({
          id: o.idPesanan,
          namaPasien: o.pasien.namaPasien,
          sesi: o.sesi,
          tanggal: new Date(o.tanggal),
          detail: o.PesananDetail.map((d) => ({
            namaMakanan: d.makanan.namaMakanan,
            jenis: d.makanan.jenis,
          })),
        }));

        // Sort orders by date, most recent first
        mappedOrders.sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());

        setOrders(mappedOrders);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen">
      <header className="bg-gray-800/50 p-4 rounded-lg shadow-md border border-gray-700 mb-8 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">
            Selamat Datang, <strong>{loggedInUser || "Admin"}</strong>!
          </h1>
          <div className="w-32">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Riwayat Semua Pesanan</h2>
        <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
          {orders.length} total pesanan
        </span>
      </div>

      {isLoading && (
        <p className="text-center p-8 text-gray-300">Memuat data pesanan...</p>
      )}
      {error && <p className="text-center p-8 text-red-400">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800/70 rounded-lg shadow-lg border border-gray-700 overflow-hidden backdrop-blur-sm transition-all hover:border-green-500/50"
              >
                <div className="p-4 border-b border-gray-600">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <p className="font-bold text-lg text-white flex items-center gap-2">
                      <User size={18} /> {order.namaPasien}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} /> {formatDate(order.tanggal)}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Utensils size={14} /> {order.sesi}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-900/50">
                  <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <NotebookText size={16} /> Detail Makanan
                  </h4>
                  <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {order.detail.map((item, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-300 bg-gray-700/50 p-2 rounded-md"
                      >
                        <span className="font-semibold text-xs text-green-400 block">
                          {item.jenis}
                        </span>
                        {item.namaMakanan}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-800/50 rounded-lg shadow-md border border-gray-700 backdrop-blur-sm">
              <p className="text-gray-400 text-lg">
                Belum ada riwayat pesanan yang tercatat.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { ApiPesanan, Pesanan } from "../types/food";

const JenisBadge = ({ jenis }: { jenis: string }) => {
  const getColor = () => {
    switch (jenis.toLowerCase()) {
      case "lauk":
        return "bg-red-100 text-red-800";
      case "sayur":
        return "bg-green-100 text-green-800";
      case "karbohidrat":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getColor()}`}
    >
      {jenis}
    </span>
  );
};

export default function KitchenView() {
  const [orders, setOrders] = useState<Pesanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sesiCounts, setSesiCounts] = useState<{ [key: string]: number }>({
    Pagi: 0,
    Siang: 0,
    Malam: 0,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Token tidak ditemukan.");

        // PERUBAHAN DI SINI: Panggil endpoint baru '/pesanan/dapur'
        const resOrders = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pesanan/dapur`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!resOrders.ok)
          throw new Error("Gagal mengambil data pesanan dapur");
        const dataFromApi: ApiPesanan[] = await resOrders.json();

        // Ambil data jumlah pesanan per sesi (endpoint ini tetap sama)
        const resCounts = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pesanan/count-by-sesi`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!resCounts.ok) throw new Error("Gagal mengambil jumlah pesanan");
        const countsData = await resCounts.json();
        setSesiCounts(countsData);

        const mappedOrders: Pesanan[] = dataFromApi.map((p: ApiPesanan) => ({
          id: p.idPesanan,
          sesi: p.sesi,
          tanggal: new Date(p.tanggal),
          namaPasien:
            p.pasien?.namaPasien ?? p.namaPasienHistory ?? "Pasien Dihapus",
          ruanganInap: p.pasien?.ruanganInap ?? "N/A",
          status: p.status ?? "BATAL",
          detail: p.PesananDetail.map((d) => ({
            id: d.idPesananDetail,
            namaMakanan: d.makanan.namaMakanan,
            jenis: d.makanan.jenis,
          })),
        }));
        setOrders(mappedOrders);
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
    fetchAllData();
  }, []);

  // Mengelompokkan pesanan berdasarkan sesi
  const groupedOrders = orders.reduce((acc, order) => {
    const key = order.sesi;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(order);
    return acc;
  }, {} as Record<string, Pesanan[]>);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pesanan Dapur</h2>
      <div className="space-y-8">
        {Object.keys(groupedOrders).length > 0 ? (
          Object.entries(groupedOrders).map(([sesi, pesananSesi]) => (
            <div key={sesi}>
              {/* PERUBAHAN DI SINI: Tampilkan jumlah pesanan di samping judul sesi */}
              <h3 className="text-xl font-semibold text-white-800 mb-4 pb-2 border-b-2 border-blue-500">
                {sesi} ({sesiCounts[sesi] || 0})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pesananSesi.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-lg text-gray-900">
                            {order.namaPasien}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ruangan: {order.ruanganInap}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "SELESAI"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "DITERIMA"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800" // BATAL
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Detail Pesanan:
                        </h4>
                        <ul className="space-y-2">
                          {order.detail.map((item) => (
                            <li
                              key={item.id}
                              className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md"
                            >
                              <span className="font-medium text-gray-800">
                                {item.namaMakanan}
                              </span>
                              <span className="text-xs text-gray-500">
                                {" "}
                                ({item.jenis})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">
            Tidak ada pesanan untuk hari ini.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { ApiPesanan, Pesanan, Jenis } from "../types/food";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Tipe data untuk rekapitulasi lauk
type LaukRekap = {
  [sesi: string]: {
    [namaLauk: string]: number;
  };
};

export default function OrderHistory() {
  const [history, setHistory] = useState<Pesanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State untuk filter
  const [filterType, setFilterType] = useState<"bulanan" | "mingguan">(
    "bulanan"
  );
  const [currentDate, setCurrentDate] = useState(new Date()); // Untuk filter bulanan
  const [startDate, setStartDate] = useState(""); // Untuk filter mingguan
  const [endDate, setEndDate] = useState(""); // Untuk filter mingguan

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      let start: Date, end: Date;

      if (filterType === "bulanan") {
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
          23,
          59,
          59
        );
      } else {
        // Mingguan
        if (!startDate || !endDate) {
          setIsLoading(false);
          setHistory([]); // Kosongkan data jika tanggal tidak lengkap
          return;
        }
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set ke akhir hari
      }

      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/pesanan/riwayat?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Gagal mengambil data riwayat pesanan");

        const dataFromApi: ApiPesanan[] = await res.json();
        const mappedHistory: Pesanan[] = dataFromApi.map((p) => ({
          id: p.idPesanan,
          sesi: p.sesi,
          tanggal: new Date(p.tanggal),
          // --- PERUBAHAN: Gunakan data history sebagai fallback ---
          namaPasien:
            p.pasien?.namaPasien ?? p.namaPasienHistory ?? "Pasien Dihapus",
          ruanganInap: p.pasien?.ruanganInap ?? p.ruanganInapHistory ?? "N/A",
          // --------------------------------------------------------
          status: p.status ?? "BATAL",
          detail: p.PesananDetail.map((d) => ({
            id: d.idPesananDetail,
            // --- PERUBAHAN: Gunakan data history sebagai fallback ---
            namaMakanan:
              d.makanan?.namaMakanan ??
              d.namaMakananHistory ??
              "Makanan Dihapus",
            jenis: d.makanan?.jenis ?? (d.jenisHistory as Jenis) ?? Jenis.Lauk, // fallback enum default
            // --------------------------------------------------------
          })),
        }));
        setHistory(mappedHistory);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [currentDate, filterType, startDate, endDate]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Logika untuk rekapitulasi jumlah lauk per sesi
  const laukRekap = useMemo(() => {
    const rekap: LaukRekap = {
      "Menu Pagi": {},
      "Menu Siang": {},
      "Menu Malam": {},
    };
    history.forEach((order) => {
      const lauk = order.detail.find((item) => item.jenis === "Lauk");
      if (lauk && rekap[order.sesi]) {
        rekap[order.sesi][lauk.namaMakanan] =
          (rekap[order.sesi][lauk.namaMakanan] || 0) + 1;
      }
    });
    return rekap;
  }, [history]);

  if (isLoading)
    return <p className="text-center p-8 text-gray-500">Memuat riwayat...</p>;
  if (error)
    return <p className="text-center p-8 text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-8">
      {/* Kontrol Filter */}
      {/* <div className="p-4 bg-white rounded-lg shadow-sm border flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border-gray-300 rounded-md shadow-sm text-sm"
          >
            <option value="bulanan">Bulanan</option>
            <option value="mingguan">Tanggal</option>
          </select>
        </div>
        {filterType === "bulanan" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold w-32 text-center">
              {currentDate.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <label>Dari:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm p-1"
            />
            <label>Sampai:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm p-1"
            />
          </div>
        )}
      </div> */}

      {isLoading ? (
        <p className="text-center p-8 text-gray-500">Memuat riwayat...</p>
      ) : error ? (
        <p className="text-center p-8 text-red-500">Error: {error}</p>
      ) : (
        <>
          {/* Rekapitulasi Lauk */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Rekapitulasi Jumlah Menu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(laukRekap).map(([sesi, lauks]) => (
                <div
                  key={sesi}
                  className="bg-white p-4 rounded-lg shadow-sm border"
                >
                  <h4 className="font-bold text-gray-700 mb-2">{sesi}</h4>
                  {Object.keys(lauks).length > 0 ? (
                    <ul className="space-y-1 text-sm">
                      {Object.entries(lauks).map(([namaLauk, jumlah]) => (
                        <li key={namaLauk} className="flex justify-between">
                          <span>{namaLauk}</span>
                          <span className="font-semibold">{jumlah} porsi</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">Tidak ada data.</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tabel Riwayat */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Tabel Riwayat Pesanan
            </h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pasien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Detail Pesanan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sesi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.namaPasien}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.ruanganInap}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="text-sm text-gray-700 space-y-1">
                          {order.detail.map((item) => (
                            <li key={item.id}>
                              {item.namaMakanan}{" "}
                              <span className="text-xs text-gray-500">
                                ({item.jenis})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.tanggal.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {order.sesi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "SELESAI"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "DITERIMA"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

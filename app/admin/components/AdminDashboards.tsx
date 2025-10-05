"use client";

import { useEffect, useState, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import { Pesanan, ApiPesanan, DetailMakanan } from "../types/pesanan";
import LogoutButton from "@/components/ui/LogoutButton";
import {
  Calendar,
  Utensils,
  User,
  NotebookText,
  Trash2,
  ChevronDown,
  Clock,
  Search,
  Users,
  ClipboardList,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import NotificationModal from "@/components/ui/NotificationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Selected";

interface JwtPayload {
  username: string;
  role: string;
}

interface GroupedOrder {
  pasienName: string;
  tanggal: string;
  orders: Pesanan[];
}

export default function AdminDashboard() {
  const [allOrders, setAllOrders] = useState<Pesanan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Pesanan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  // State for dashboard stats
  const [patientCount, setPatientCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [todayOrders, setTodayOrders] = useState<Pesanan[]>([]);

  // State for filters
  const [searchName, setSearchName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterSesi, setFilterSesi] = useState("");

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Token tidak ditemukan.");

      // Fetch all data in parallel
      const [pasienRes, pesananRes, todayRes, historyRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pasien/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pesanan/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pesanan/today`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pesanan`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!pasienRes.ok) throw new Error("Gagal mengambil jumlah pasien.");
      if (!pesananRes.ok) throw new Error("Gagal mengambil jumlah pesanan.");
      if (!todayRes.ok) throw new Error("Gagal mengambil pesanan hari ini.");
      if (!historyRes.ok) throw new Error("Gagal mengambil riwayat pesanan.");

      const pasienData = await pasienRes.json();
      const pesananData = await pesananRes.json();
      const todayData: ApiPesanan[] = await todayRes.json();
      const historyData: ApiPesanan[] = await historyRes.json();

      setPatientCount(pasienData.count);
      setOrderCount(pesananData.count);

      const mapApiPesanan = (p: ApiPesanan): Pesanan => ({
        id: p.idPesanan,
        namaPasien:
          p.pasien?.namaPasien ?? p.namaPasienHistory ?? "Pasien Dihapus",
        sesi: p.sesi,
        status: p.status,
        tanggal: new Date(p.tanggal),
        detail: p.PesananDetail.map((d) => ({
          namaMakanan:
            d.makanan?.namaMakanan ?? d.namaMakananHistory ?? "Makanan Dihapus",
          jenis: d.makanan?.jenis ?? d.jenisHistory ?? "N/A",
        })),
      });

      setTodayOrders(todayData.map(mapApiPesanan));
      setAllOrders(historyData.map(mapApiPesanan));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

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
    fetchDashboardData();
  }, []);

  const filteredAndGroupedOrders = useMemo(() => {
    const filtered = allOrders.filter((order) => {
      const matchName =
        searchName === "" ||
        order.namaPasien.toLowerCase().includes(searchName.toLowerCase());
      const matchSesi = filterSesi === "" || order.sesi === filterSesi;
      const matchDate =
        filterDate === "" ||
        new Date(order.tanggal).toISOString().split("T")[0] === filterDate;
      return matchName && matchSesi && matchDate;
    });

    const grouped = filtered.reduce((acc, order) => {
      const orderDate = order.tanggal.toISOString().split("T")[0];
      const key = `${order.namaPasien}-${orderDate}`;
      if (!acc[key]) {
        acc[key] = {
          pasienName: order.namaPasien,
          tanggal: orderDate,
          orders: [],
        };
      }
      acc[key].orders.push(order);
      return acc;
    }, {} as Record<string, GroupedOrder>);

    return Object.values(grouped);
  }, [allOrders, searchName, filterDate, filterSesi]);

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pesanan/${orderToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Gagal menghapus riwayat pesanan.");
      }

      setAllOrders(allOrders.filter((o) => o.id !== orderToDelete.id));
      setOrderToDelete(null);
      setModalContent({
        title: "Berhasil",
        message: "Riwayat pesanan telah dihapus.",
        type: "success",
      });
      setIsModalOpen(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui.";
      setModalContent({
        title: "Gagal Menghapus",
        message,
        type: "error",
      });
      setIsModalOpen(true);
      setOrderToDelete(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Memuat data dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-400">
        Error: {error}
      </div>
    );
  }

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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-gray-800/70 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Pasien
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientCount}</div>
            <p className="text-xs text-gray-400">Pasien terdaftar</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/70 border-gray-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Riwayat Pesanan
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <p className="text-xs text-gray-400">Pesanan tercatat</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Orders Highlights */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Sorotan Pesanan Hari Ini
        </h2>
        {todayOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todayOrders.slice(0, 3).map((order) => (
              <Card
                key={order.id}
                className="bg-gray-800/70 border-gray-700 text-white"
              >
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{order.namaPasien}</span>
                    <span className="text-xs font-medium bg-green-900/50 text-green-300 px-2 py-1 rounded-full">
                      {order.sesi}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {order.detail.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.namaMakanan}</span>
                        <span className="text-gray-400">{item.jenis}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400">Tidak ada pesanan untuk hari ini.</p>
          </div>
        )}
      </div>

      {/* Order History Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Riwayat Pesanan Pasien
        </h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-900/50">
          <div className="relative w-full sm:flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Cari nama pasien..."
              className="pl-10 w-full bg-white text-black placeholder:text-gray-500 border-gray-300"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-white text-black border-gray-300"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Select
              value={filterSesi || "all"}
              onValueChange={(value) =>
                setFilterSesi(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-white text-black border-gray-300">
                <SelectValue placeholder="Semua Sesi" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                <SelectItem value="all">Semua Sesi</SelectItem>
                <SelectItem value="Menu Pagi">Menu Pagi</SelectItem>
                <SelectItem value="Menu Siang">Menu Siang</SelectItem>
                <SelectItem value="Menu Malam">Menu Malam</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            className="bg-white text-black border-gray-400 hover:bg-gray-100"
            onClick={() => {
              setSearchName("");
              setFilterDate("");
              setFilterSesi("");
            }}
          >
            Reset
          </Button>
        </div>

        {filteredAndGroupedOrders.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {filteredAndGroupedOrders.map((group, index) => (
              <AccordionItem
                value={`item-${index}`}
                key={index}
                className="bg-gray-800/70 border-gray-700 rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="text-left">
                      <p className="font-bold text-lg text-white">
                        {group.pasienName}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDate(group.tanggal)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {group.orders.map((o) => (
                        <span
                          key={o.id}
                          className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-700 text-gray-300"
                        >
                          {o.sesi.replace("Menu ", "")}
                        </span>
                      ))}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {group.orders
                      .sort((a, b) => a.sesi.localeCompare(b.sesi))
                      .map((order) => (
                        <div
                          key={order.id}
                          className="p-4 bg-gray-900/50 rounded-md"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-green-400">
                              {order.sesi}
                            </h4>
                            {/* <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setOrderToDelete(order)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-900/20 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button> */}
                          </div>
                          <ul className="text-sm text-gray-300 space-y-1 pl-2 border-l-2 border-gray-700">
                            {order.detail.map((item, idx) => (
                              <li
                                key={idx}
                                className="ml-2 flex justify-between"
                              >
                                <span>{item.namaMakanan}</span>
                                <span className="text-gray-500">
                                  {item.jenis}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-16 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400">
              Tidak ada riwayat pesanan yang cocok dengan filter.
            </p>
          </div>
        )}
      </div>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
      <Dialog
        open={!!orderToDelete}
        onOpenChange={() => setOrderToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus riwayat pesanan ini? Tindakan
              ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderToDelete(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import ManageFood from "./components/Food";
import KitchenView from "./components/KitchenView";
import LogoutButton from "@/components/ui/LogoutButton";
import { jwtDecode } from "jwt-decode";
import NotificationModal from "@/components/ui/NotificationModal";
import MonthlyScheduleView from "./components/MonthlyScheduleView";
import OrderHistory from "./components/OrderHistory";

interface JwtPayload {
  username: string;
  role: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    "kitchen" | "food" | "schedule" | "history"
  >("kitchen"); // Default tab is now kitchen
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        setLoggedInUser(decodedToken.username);
      } catch (error) {
        console.error("Token tidak valid:", error);
        setModalContent({
          title: "Terjadi Kesalahan",
          message: error instanceof Error ? error.message : String(error),
          type: "error",
        });
        setIsModalOpen(true);
      }
    }
  }, []);

  return (
    // PERUBAHAN: Menerapkan tema gelap seperti halaman Admin secara langsung
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header disesuaikan dengan tema gelap */}
      <header className="sticky top-0 z-10 mb-6 bg-gray-900/70 p-4 shadow-md backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-white">
            Selamat Datang, <strong>{loggedInUser || "Pengguna Dapur"}</strong>!
          </h1>
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Tabs navigasi disesuaikan dengan tema gelap */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("kitchen")}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === "kitchen"
                  ? "border-green-400 text-green-400"
                  : "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              Pesanan Dapur
            </button>
            <button
              onClick={() => setActiveTab("food")}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === "food"
                  ? "border-green-400 text-green-400"
                  : "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              Kelola Makanan
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === "schedule"
                  ? "border-green-400 text-green-400"
                  : "border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              Jadwal Menu Bulanan
            </button>
          </nav>
        </div>

        {/* Konten Berdasarkan Tab */}
        {activeTab === "kitchen" && <KitchenView />}
        {activeTab === "food" && <ManageFood />}
        {activeTab === "schedule" && <MonthlyScheduleView />}
        {activeTab === "history" && <OrderHistory />}
      </div>

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </main>
  );
}

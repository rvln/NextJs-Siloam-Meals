"use client";

import { useEffect, useState } from "react";
import ManageFood from "./components/Food";
import KitchenView from "./components/KitchenView";
import LogoutButton from "@/components/ui/LogoutButton";
import { jwtDecode } from "jwt-decode";
import NotificationModal from "@/components/ui/NotificationModal";
import MonthlyScheduleView from "./components/MonthlyScheduleView"; // Import komponen baru
import OrderHistory from "./components/OrderHistory"; // <-- IMPORT KOMPONEN BARU

interface JwtPayload {
  username: string;
  role: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    "food" | "kitchen" | "schedule" | "history"
  >("food");
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

  // Helper untuk merender konten berdasarkan tab yang aktif
  const renderContent = () => {
    switch (activeTab) {
      case "food":
        return <ManageFood />;
      case "kitchen":
        return <KitchenView />;
      case "schedule":
        return <MonthlyScheduleView />;
      case "history": // <-- TAMBAHKAN CASE BARU
        return <OrderHistory />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm border-b border-gray-200 mb-6 sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-800">
            Selamat Datang <strong>{loggedInUser || "Pengguna Dapur"}</strong>!
          </h1>
          <div className="flex gap-4 items-center">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs navigasi */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("kitchen")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "kitchen"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pesanan Dapur
            </button>
            <button
              onClick={() => setActiveTab("food")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "food"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Kelola Makanan
            </button>
            {/* Tombol Tab Baru */}
            <button
              onClick={() => setActiveTab("schedule")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "schedule"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Jadwal Menu Bulanan
            </button>
            {/* TOMBOL TAB RIWAYAT PESANAN */}
            {/* <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Riwayat Pesanan
            </button> */}
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

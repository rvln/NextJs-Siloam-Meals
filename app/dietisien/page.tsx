"use client";

import { useEffect, useState } from "react";
import ManageValidation from "./components/Validation";
import LogoutButton from "@/components/ui/LogoutButton";
import { jwtDecode } from "jwt-decode";
import NotificationModal from "@/components/ui/NotificationModal";

// Interface untuk payload token
interface JwtPayload {
  username: string;
  role: string;
}

export default function DietisienPage() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  // Mengambil nama pengguna dari token saat komponen dimuat
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header ditambahkan di sini */}
        <header className="bg-gray-200 p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-800">
              Selamat Datang <strong>{loggedInUser || "Dietisien"}</strong>!
            </p>
            <div className="w-32">
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Komponen validasi yang sudah ada */}
        <ManageValidation />
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

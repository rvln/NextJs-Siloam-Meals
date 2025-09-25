"use client";

import { useEffect, useState } from "react";
import ManageFood from "./components/Food";
import KitchenView from "./components/KitchenView";
import LogoutButton from "@/components/ui/LogoutButton";
import { jwtDecode } from "jwt-decode";
import NotificationModal from "@/components/ui/NotificationModal";

interface JwtPayload {
    username: string;
    role: string;
}

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<"food" | "kitchen">("food");
    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'error',
    });
    
        useEffect(() => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const decodedToken = jwtDecode<JwtPayload>(token);
                    setLoggedInUser(decodedToken.username);
                } catch (error) {
                    console.error("Token tidak valid:", error);
                    setModalContent({
                        title: "Terjadi Kesalahan",
                        message: error instanceof Error ? error.message : String(error),
                        type: 'error'
                    });
                    setIsModalOpen(true);
                }
            }
        }, []);

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            {/* Header */}
            <header className="bg-gray-200 p-4 rounded-b-lg shadow-sm border-b border-gray-300 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-semibold text-gray-800">
                        Selamat Datang <strong>{loggedInUser || 'Pengguna'}</strong>!
                    </h1>
                    <div className="flex gap-4 items-center">
                        {/* Tabs navigasi */}
                        <nav className="flex gap-4">
                            <button
                                onClick={() => setActiveTab("food")}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === "food"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                                    }`}
                            >
                                Kelola Makanan
                            </button>
                            <button
                                onClick={() => setActiveTab("kitchen")}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === "kitchen"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                                    }`}
                            >
                                Pesanan Dapur
                            </button>
                        </nav>

                        {/* Logout */}
                        <div className="w-28">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Konten */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {activeTab === "food" ? <ManageFood /> : <KitchenView />}
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

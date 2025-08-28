"use client"

import { useRouter } from "next/navigation";
import { Button } from "./button"; // Asumsi Anda menggunakan shadcn/ui
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        // 1. Hapus token dari localStorage
        localStorage.removeItem('accessToken');

        // 2. Arahkan pengguna kembali ke halaman login (root)
        router.push('/');

        // Optional: Refresh halaman untuk memastikan semua state lama bersih
        router.refresh();
    };

    return (
        <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-2"
        >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
        </Button>
    );
}
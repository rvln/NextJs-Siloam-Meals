"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

type Utama = {
    idMakanan: number;
    namaMakanan: string;
    jenis?: string;
    gambar?: string;
};

interface MenuItem {
    makananId: number;
    nama: string;
    image: string;
    jenis: string;
    utamaDari?: Utama[]; // relasi dari backend
}

interface OrderProps {
    selectedDish: MenuItem;
    uuid: string;
    sesi: string;
    onBack: () => void;
}


export default function Order({ selectedDish, sesi, uuid, onBack }: OrderProps) {
    const [selectedByJenis, setSelectedByJenis] = useState<Record<string, number | null>>({});
    const [loading, setLoading] = useState(true);
    const [allMakanan, setAllMakanan] = useState<Utama[]>([]);

    const [openModal, setOpenModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/pesanan/makanan/${uuid}`;
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((data: Utama[]) => {
                const filtered = data.filter((item: Utama) => item.jenis !== "Lauk");
                setAllMakanan(filtered);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching makanan:", error);
                setLoading(false);
            });
    }, [uuid]);

    useEffect(() => {
        if (selectedDish.utamaDari) {
            const defaults: Record<string, number | null> = {}
            selectedDish.utamaDari.forEach((u) => {
                if (u.jenis) defaults[u.jenis] = u.idMakanan
            })
            setSelectedByJenis((prev) => ({ ...prev, ...defaults }))
        }
    }, [selectedDish])

    const grouped = allMakanan.reduce<Record<string, Utama[]>>((acc, m) => {
        if (!m.jenis) return acc
        if (!acc[m.jenis]) acc[m.jenis] = []
        acc[m.jenis].push(m)
        return acc
    }, {})

    if (loading) {
        return <p>Loading makanan...</p>;
    }

    const handleCategorySelection = (jenis: string, itemId: number) => {
        setSelectedByJenis((prev) => ({ ...prev, [jenis]: itemId }))
    }
    
    const handleOrderNow = async () => {
        setProcessing(true);
        try {
            const details = Object.values(selectedByJenis).map((makananId) => ({
                makananId,
            }));

            if (selectedDish) {
                details.push({ makananId: selectedDish.makananId });
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pesanan/${uuid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sesi, details }),
            });

            if (!res.ok) {
                const error = await res.json();
                alert("Gagal membuat pesanan: " + error.message);
                return;
            }
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Error saat membuat pesanan:", err);
            alert("Terjadi kesalahan saat membuat pesanan");
        } finally {
            setProcessing(false);
        }
    }
    
    const isOrderComplete = Object.keys(grouped).every(
        (jenis) => selectedByJenis[jenis] !== null
    );

    
    return (
        <div className="min-h-screen bg-gray-400">
            {/* Hero Image */}
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={selectedDish.image || "/placeholder.svg?height=200&width=400&query=nasi tim dish"}
                    alt={selectedDish.nama}
                    className="w-full h-full object-cover"
                    width={400}
                    height={200}
                    sizes="(max-width: 400px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-white text-2xl font-bold">{selectedDish.nama}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
               
                {Object.entries(grouped).map(([jenis, items]) => (
                    <div key={jenis}>
                        <h2 className="text-white text-lg font-medium mb-3">{jenis}</h2>
                        <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
                            {items.map((item) => (
                                <button
                                    key={item.idMakanan}
                                    onClick={() => handleCategorySelection(jenis, item.idMakanan)}
                                    className={`relative min-w-[140px] bg-white rounded-xl p-3 transition-all duration-300 
                                        ${selectedByJenis[jenis] === item.idMakanan
                                            ? "shadow-lg shadow-green-200 scale-105"
                                            : "hover:scale-105 hover:shadow-md"
                                        }`}
                                >
                                    {/* Image */}
                                    <div className="aspect-square rounded-lg overflow-hidden mb-2">
                                        <Image
                                            src={item.gambar || "/placeholder.svg"}
                                            alt={item.namaMakanan}
                                            className="w-full h-full object-cover"
                                            width={120}
                                            height={120}
                                        />
                                    </div>

                                    {/* Nama Makanan */}
                                    <p className="text-gray-800 text-sm font-medium text-center">
                                        {item.namaMakanan}
                                    </p>

                                    {/* Checkmark overlay jika terpilih */}
                                    {selectedByJenis[jenis] === item.idMakanan && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                            ✅
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Order Button */}
                <div className="pt-4">
                    <button
                        onClick={() => setOpenModal(true)}
                        disabled={!isOrderComplete}
                        className={`w-full py-4 rounded-xl text-white font-medium text-lg transition-all ${isOrderComplete ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 cursor-not-allowed"}`}
                    >
                        Pesan Sekarang
                    </button>
                    <button
                        onClick={onBack}
                        className="mt-2 w-full py-3 rounded-xl bg-white text-gray-700 font-medium"
                    >
                        Kembali
                    </button>
                </div>
            </div>
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-white rounded-xl shadow-lg w-3xs p-6 animate-fadeIn">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Konfirmasi Pesanan</h2>
                        <p className="text-gray-600 mb-4">
                            Apakah Anda yakin ingin memesan <span className="font-bold">{selectedDish?.nama}</span> beserta pilihan lauk & pendamping?
                        </p>

                        {/* Ringkasan pesanan */}
                        <ul className="mb-6 space-y-2">
                            {Object.entries(selectedByJenis).map(([jenis, makananId]) => {
                                const makanan = allMakanan.find((m) => m.idMakanan === makananId);
                                return (
                                    makanan && (
                                        <li key={jenis} className="flex justify-between">
                                            <span className="font-bold text-gray-700">{makanan.namaMakanan}</span>
                                        </li>
                                    )
                                );
                            })}
                        </ul>

                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition text-black"
                                onClick={() => setOpenModal(false)}
                                disabled={processing}
                            >
                                Batal
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 transition"
                                onClick={handleOrderNow}
                                disabled={processing}
                            >
                                {processing ? "Memproses..." : "Ya, Pesan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal sukses */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-80 text-center">
                        <h2 className="text-lg font-semibold mb-3">Pesanan Berhasil 🎉</h2>
                        <p className="text-gray-600 mb-6">Pesanan kamu sudah dibuat.</p>
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                onBack();
                                // Ensure the page reflects the new order by forcing a reload after navigation completes
                                setTimeout(() => {
                                    if (typeof window !== "undefined") {
                                        window.location.reload();
                                    }
                                }, 100);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full"
                        >
                            Kembali ke Menu
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

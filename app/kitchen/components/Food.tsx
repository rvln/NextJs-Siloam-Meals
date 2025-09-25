"use client"

import NotificationModal from "@/components/ui/NotificationModal"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { ApiMakanan, Makanan } from "../types/food"
import CreateFood from "./CreateFood"
import EditFood from "./EditFood"
import FoodDetailView from "./DetailFood"

export default function ManageFood() {
    const [activeTab, setActiveTab] = useState<'utama' | 'pendamping'>('utama');
    const [selectedFood, setSelectedFood] = useState<Makanan | null>(null)
    const [foodToDelete, setFoodToDelete] = useState<Makanan | null>(null);
    const [isEditing, setIsEditing] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [foods, setFoods] = useState<Makanan[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'error',
    });

    useEffect(() => {
        async function fetchFood() {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/makanan`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Gagal mengambil data makanan");

                const dataFromApi: ApiMakanan[] = await res.json();

                const cleanedFoods: Makanan[] = dataFromApi.map(apiItem => ({
                    id: apiItem.idMakanan,
                    nama: apiItem.namaMakanan,
                    jenis: apiItem.jenis,
                    gambar: apiItem.gambar,
                    createdBy: apiItem.user.namaUser,
                    utamaDari: apiItem.utamaDari ? apiItem.utamaDari.map(k => ({
                        id: k.idMakanan,
                        nama: k.namaMakanan,
                        jenis: k.jenis,
                    })) : [],
                    tanggalTersedia: apiItem.tanggalTersedia.map(t => ({
                        id: t.id,
                        tanggal: t.tanggal,
                    })),
                }))

                setFoods(cleanedFoods);
            } catch (err: unknown) {
                console.error("Gagal mengambil data:", err);
                if (err instanceof Error) {
                    setModalContent({
                        title: "Terjadi Kesalahan",
                        message: err.message,
                        type: 'error'
                    });
                } else {
                    setModalContent({
                        title: "Terjadi Kesalahan",
                        message: "Terjadi kesalahan yang tidak diketahui",
                        type: 'error'
                    });
                }
                setIsModalOpen(true);
            }
        }
        fetchFood();
    }, []);

    const { makananUtama, makananPendamping } = useMemo(() => {
        const utama = foods.filter(f => f.jenis === 'Lauk');
        const pendamping = foods.filter(f => f.jenis !== 'Lauk');
        return { makananUtama: utama, makananPendamping: pendamping };
    }, [foods]);

    const sideDishOptions = useMemo(() => {
        return makananPendamping.reduce((acc, food) => {
            if (!acc[food.jenis]) acc[food.jenis] = [];
            acc[food.jenis].push(food);
            return acc;
        }, {} as Record<string, Makanan[]>);
    }, [makananPendamping]);


    const filteredFoodItems = (activeTab === 'utama' ? makananUtama : makananPendamping)
        .filter(food => food.nama.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCreateFood = async (formData: FormData) => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/makanan`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Gagal membuat makanan baru");
            }
            const created: ApiMakanan = await res.json();
            const newFood: Makanan = {
                id: created.idMakanan,
                nama: created.namaMakanan,
                jenis: created.jenis,
                gambar: created.gambar,
                createdBy: created.user.namaUser,
                utamaDari: created.utamaDari.map(k => ({
                    id: k.idMakanan,
                    nama: k.namaMakanan,
                    jenis: k.jenis,
                })),
                tanggalTersedia: created.tanggalTersedia.map(t => ({
                    id: t.id,
                    tanggal: t.tanggal,
                })),
            };

            setFoods(prev => [...prev, newFood]);
            setIsCreating(false);
            setModalContent({
                title: "Berhasil",
                message: "Makanan baru berhasil ditambahkan.",
                type: 'success'
            });
            setIsModalOpen(true);
        } catch (err: unknown) {
            console.error("Gagal tambah makanan:", err);
            if (err instanceof Error) {
                setModalContent({
                    title: "Terjadi Kesalahan",
                    message: err.message,
                    type: 'error'
                });
            } else {
                setModalContent({
                    title: "Terjadi Kesalahan",
                    message: "Terjadi kesalahan yang tidak diketahui",
                    type: 'error'
                });
            }
            setIsModalOpen(true);
        }
    };

    const handleEditFood = (food: Makanan) => {
        setSelectedFood(food);
        setIsEditing(true);
    };

    const handleSaveFood = async (id: number, formData: FormData) => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/makanan/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Gagal memperbarui makanan");
            }
            const saved: ApiMakanan = await res.json();
            const updated: Makanan = {
                id: saved.idMakanan,
                nama: saved.namaMakanan,
                jenis: saved.jenis,
                gambar: saved.gambar,
                createdBy: saved.user.namaUser,
                utamaDari: saved.utamaDari.map(k => ({
                    id: k.idMakanan,
                    nama: k.namaMakanan,
                    jenis: k.jenis,
                })),
                tanggalTersedia: saved.tanggalTersedia.map(t => ({
                    id: t.id,
                    tanggal: t.tanggal,
                })),
            };
            setFoods(foods.map(f => f.id === updated.id ? updated : f));
            setSelectedFood(updated);
            setIsEditing(false);
            setModalContent({
                title: "Berhasil",
                message: "Data makanan berhasil diperbarui.",
                type: 'success'
            });
            setIsModalOpen(true);
        } catch (err: unknown) {
            console.error("Gagal memperbarui data makanan:", err);
            if (err instanceof Error) {
                setModalContent({
                    title: "Terjadi Kesalahan",
                    message: err.message,
                    type: 'error'
                });
            } else {
                setModalContent({
                    title: "Terjadi Kesalahan",
                    message: "Terjadi kesalahan yang tidak diketahui",
                    type: 'error'
                });
            }
            setIsModalOpen(true);
        }
    };

    const handleDeleteFood = (food: Makanan) => {
        setFoodToDelete(food);
    };

    const confirmDelete = async () => {
        if (!foodToDelete) return;
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/makanan/${foodToDelete.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Gagal menghapus makanan");
            }
            setFoods(foods.filter(f => f.id !== foodToDelete.id));
            if (selectedFood?.id === foodToDelete.id) {
                setSelectedFood(null);
            }
            setModalContent({
                title: "Berhasil",
                message: `Makanan "${foodToDelete.nama}" telah dihapus.`,
                type: 'success'
            });
            setIsModalOpen(true);
        } catch (err: unknown) {
            console.error("Gagal menghapus makanan:", err);
            if (err instanceof Error) {
                setModalContent({
                    title: "Terjadi Kesalahan",
                    message: err.message,
                    type: 'error'
                });
            } else {
                setModalContent({
                    title: "Terjadi Kesalahan",
                    message: "Terjadi kesalahan yang tidak diketahui",
                    type: 'error'
                });
            }
            setIsModalOpen(true);
        } finally {
            setFoodToDelete(null);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="bg-gray-200 rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Daftar Makanan</h2>
                                    <span className="text-sm text-gray-500">{filteredFoodItems.length} makanan</span>
                                </div>
                                <div className="mb-4 border-b">
                                    <nav className="-mb-px flex space-x-6">
                                        <button
                                            onClick={() => setActiveTab('utama')}
                                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'utama' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                        >
                                            Utama ({makananUtama.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('pendamping')}
                                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pendamping' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                        >
                                            Pendamping ({makananPendamping.length})
                                        </button>
                                    </nav>
                                </div>
                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari makanan..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Tambah Makanan Baru
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {filteredFoodItems.map((food) => (
                                    <div
                                        key={food.id}
                                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedFood?.id === food.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                            }`}
                                        onClick={() => { setSelectedFood(food); setIsEditing(false); }}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-medium text-gray-900 text-sm">{food.nama}</h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{food.jenis}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">{food.createdBy}</p>
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteFood(food);
                                                }}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 lg:mt-0 lg:col-span-8 xl:col-span-9">
                        {isCreating ? (
                            <CreateFood 
                            onCreate={handleCreateFood} 
                            onCancel={() => setIsCreating(false)}
                            sideDishOptions={sideDishOptions}
                            />
                        ) : selectedFood ? (
                            isEditing ? (
                                <EditFood
                                    food={selectedFood}
                                    onSave={handleSaveFood}
                                    onCancel={() => setIsEditing(false)}
                                    sideDishOptions={sideDishOptions}
                                />
                            ) : (
                                <FoodDetailView food={selectedFood} onEdit={() => handleEditFood(selectedFood)} />
                            )
                        ) : (
                            <div className="bg-gray-200 rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <svg
                                    className="w-16 h-16 text-gray-600 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Makanan</h3>
                                <p className="text-gray-500">
                                    Pilih makanan dari daftar di sebelah kiri untuk melihat detail dan mengelola data makanan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <NotificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalContent.title}
                message={modalContent.message}
                type={modalContent.type}
            />

            <Dialog open={!!foodToDelete} onOpenChange={() => setFoodToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus data makanan atas nama{" "}
                            <strong>{foodToDelete?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFoodToDelete(null)}>Batal</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

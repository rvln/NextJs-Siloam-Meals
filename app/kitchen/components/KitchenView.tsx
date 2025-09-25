"use client"

import { useEffect, useState, useMemo } from "react";
import { ApiPesanan, Pesanan } from "../types/food";

const JenisBadge = ({ jenis }: { jenis: string }) => {
    const getColor = () => {
        switch (jenis.toLowerCase()) {
            case 'lauk': return 'bg-red-100 text-red-800';
            case 'sayur': return 'bg-green-100 text-green-800';
            case 'karbohidrat': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getColor()}`}>{jenis}</span>
}

export default function KitchenView() {
    const [orders, setOrders] = useState<Pesanan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pesanan`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Gagal mengambil data pesanan");

                const dataFromApi: ApiPesanan[] = await res.json();

                const cleanedOrders: Pesanan[] = dataFromApi.map(order => ({
                    id: order.idPesanan,
                    sesi: order.sesi,
                    tanggal: new Date(order.tanggal),
                    namaPasien: order.pasien.namaPasien,
                    detail: order.PesananDetail.map(d => ({
                        id: d.idPesananDetail,
                        namaMakanan: d.makanan.namaMakanan,
                        jenis: d.makanan.jenis,
                    })),
                }));
                setOrders(cleanedOrders);
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
        fetchOrders();
    }, []);

    // Gunakan useMemo untuk mengelompokkan pesanan berdasarkan sesi
    const groupedOrders = useMemo(() => {
        return orders.reduce((acc, order) => {
            const { sesi } = order;
            if (!acc[sesi]) acc[sesi] = [];
            acc[sesi].push(order);
            return acc;
        }, {} as Record<string, Pesanan[]>);
    }, [orders]);

    if (isLoading) return <p className="text-center p-8">Memuat data pesanan...</p>;
    if (error) return <p className="text-center p-8 text-red-500">Error: {error}</p>;

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Daftar Pesanan Dapur</h1>

            <div className="space-y-8">
                {Object.keys(groupedOrders).length > 0 ? (
                    Object.entries(groupedOrders).map(([sesi, pesananSesi]) => (
                        <section key={sesi}>
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">{sesi} ({pesananSesi.length} Pesanan)</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {pesananSesi.map(order => (
                                    <div key={order.id} className="bg-white rounded-lg shadow-md border overflow-hidden">
                                        <div className="p-4 bg-gray-50 border-b">
                                            <h3 className="font-bold text-gray-800">{order.namaPasien}</h3>
                                            <p className="text-xs text-gray-500">
                                                ID Pesanan: {order.id}
                                            </p>
                                        </div>
                                        <ul className="p-4 space-y-2">
                                            {order.detail.map(item => (
                                                <li key={item.id} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-700">{item.namaMakanan}</span>
                                                    <JenisBadge jenis={item.jenis} />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow border">
                        <p className="text-gray-500">Tidak ada pesanan untuk hari ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
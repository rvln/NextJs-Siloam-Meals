"use client"

import { Makanan } from "../types/food"
import { Button } from "@/components/ui/button";
import { FilePenLine } from "lucide-react";
import Image from "next/image";

interface FoodDetailViewProps {
    food: Makanan;
    onEdit: () => void;
}

export default function FoodDetailView({ food, onEdit }: FoodDetailViewProps) {
    const getJenisBadgeColor = (jenis: string) => {
        switch (jenis.toLowerCase()) {
            case 'lauk': return 'bg-red-100 text-red-800';
            case 'sayur': return 'bg-green-100 text-green-800';
            case 'karbohidrat': return 'bg-yellow-100 text-yellow-800';
            case 'buah': return 'bg-pink-100 text-pink-800';
            case 'snack': return 'bg-indigo-100 text-indigo-800';
            case 'minuman': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }


    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Detail Makanan</h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button size="sm" onClick={onEdit} className="flex-1 sm:flex-initial flex items-center gap-2">
                            <FilePenLine className="h-4 w-4" />
                            Edit Makanan
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Kolom Gambar */}
                    <div className="md:col-span-1 p-6">
                        <div className="aspect-square relative rounded-lg overflow-hidden border">
                            <Image
                                src={food.gambar || "/placeholder.svg"}
                                alt={food.nama}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 p-6">

                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getJenisBadgeColor(food.jenis)}`}>
                            {food.jenis}
                        </span>

                        <h3 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{food.nama}</h3>

                        <dl>
                            <dt className="text-sm font-medium text-gray-500">Dibuat Oleh</dt>
                            <dd className="mt-1 text-gray-900">{food.createdBy}</dd>
                        </dl>
                        {food.jenis === 'Lauk' && food.utamaDari.length > 0 && (
                            <div className="border-t pt-6">
                                <h4 className="text-base font-semibold text-gray-800 mb-3">
                                    Paket Makanan Pendamping
                                </h4>
                                <ul className="space-y-2">
                                    {food.utamaDari.map(komponen => (
                                        <li key={komponen.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                                            <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${getJenisBadgeColor(komponen.jenis)}`}>
                                                {komponen.jenis}
                                            </span>
                                            <span className="text-sm text-gray-700">{komponen.nama}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

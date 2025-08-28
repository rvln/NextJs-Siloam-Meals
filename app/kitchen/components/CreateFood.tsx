"use client"

import { useState } from "react"
import { Jenis, Makanan } from "../types/food";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CreateFoodProps {
    onCreate: (formData: FormData) => void;
    onCancel: () => void;
    sideDishOptions: Record<string, Makanan[]>;
}

const menuOptions = [
    { id: 1, name: 'Menu Pagi' },
    { id: 2, name: 'Menu Siang' },
    { id: 3, name: 'Menu Malam' },
];

export default function CreateFood({ onCreate, onCancel, sideDishOptions }: CreateFoodProps) {
    const [namaMakanan, setNamaMakanan] = useState("");
    const [jenis, setJenis] = useState<Jenis>(Jenis.Lauk);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedSideDishes, setSelectedSideDishes] = useState<Record<string, number | ''>>({});
    const [menuId, setMenuId] = useState<number | ''>('');

    const handleSideDishChange = (jenisSideDish: string, selectedId: string) => {
        setSelectedSideDishes(prev => ({
            ...prev,
            [jenisSideDish]: selectedId ? parseInt(selectedId, 10) : '',
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreate = () => {
        if (!namaMakanan || !jenis) {
            alert("Nama Makanan dan Jenis wajib diisi.");
            return;
        }

        const formData = new FormData();
        formData.append('namaMakanan', namaMakanan);
        formData.append('jenis', jenis);

        if (imageFile) {
            formData.append('gambar', imageFile);
        }

        if (jenis === Jenis.Lauk && menuId) {
            formData.append('menuId', String(menuId));
        }

        const sideDishIds = Object.values(selectedSideDishes).filter(id => id !== '' && !isNaN(Number(id)));
        if (sideDishIds.length > 0) {
            sideDishIds.forEach(id => {
                formData.append('utamaDariIds[]', String(id));
            });
        }

        onCreate(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Tambah Makanan Baru</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Makanan</label>
                        <input
                            type="text"
                            placeholder="Contoh: Nasi Goreng Spesial"
                            value={namaMakanan}
                            onChange={(e) => setNamaMakanan(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Makanan</label>
                        <select
                            value={jenis}
                            onChange={(e) => setJenis(e.target.value as Jenis)}
                            className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
                        >
                            {Object.values(Jenis).map((jenisValue) => (
                                <option key={jenisValue} value={jenisValue}>{jenisValue}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {jenis === Jenis.Lauk && (
                    <div className="mt-6 pt-6 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alokasi Menu</label>
                                <select
                                    value={menuId}
                                    onChange={(e) => setMenuId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
                                >
                                    <option value="">-- Tidak Masuk Menu --</option>
                                    {menuOptions.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {jenis === 'Lauk' && (
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="text-md font-semibold text-gray-800 mb-4">Pilih Makanan Pendamping (1 per jenis)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.keys(sideDishOptions).map((jenisSideDish) => {
                                const options = sideDishOptions[jenisSideDish];
                                return (
                                    <div key={jenisSideDish}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{jenisSideDish}</label>
                                        <select
                                            value={selectedSideDishes[jenisSideDish] || ''}
                                            onChange={(e) => handleSideDishChange(jenisSideDish, e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
                                        >
                                            <option value="">-- Tidak Dipilih --</option>
                                            {options.map(option => (
                                                <option key={option.id} value={option.id}>
                                                    {option.nama}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Gambar</label>
                    <div className="mt-1 flex items-center gap-4">
                        {previewUrl && (
                            <div className="w-24 h-24 relative border rounded-md overflow-hidden">
                                <Image src={previewUrl} alt="Preview" layout="fill" objectFit="cover" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                    <Button variant="outline" onClick={onCancel}>Batal</Button>
                    <Button onClick={handleCreate}>Simpan Makanan</Button>
                </div>
            </div>
        </div>
    )
}

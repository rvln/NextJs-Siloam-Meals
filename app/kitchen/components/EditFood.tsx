"use client"

import { useEffect, useState } from "react";
import { Jenis, Makanan } from "../types/food";
import Image from "next/image";

interface EditFoodProps {
    food: Makanan;
    onSave: (id: number, formData: FormData) => void;
    onCancel: () => void;
    sideDishOptions: Record<string, Makanan[]>;
}

export default function EditFood({ food, onSave, onCancel, sideDishOptions }: EditFoodProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(food.gambar);
    const [editForm, setEditForm] = useState<Makanan>({ ...food });
    const [selectedSideDishes, setSelectedSideDishes] = useState<Record<string, number | ''>>({});

    useEffect(() => {
        setEditForm({ ...food });
        setPreviewUrl(food.gambar);
        setImageFile(null);

        const initialSideDishes = food.utamaDari.reduce((acc, komponen) => {
            acc[komponen.jenis] = komponen.id;
            return acc;
        }, {} as Record<string, number>);
        setSelectedSideDishes(initialSideDishes);

    }, [food]);

    useEffect(() => {
        setEditForm({ ...food });
        setPreviewUrl(food.gambar);
        setImageFile(null);
    }, [food]);

    const handleInputChange = (field: keyof Makanan, value: string | Jenis) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSideDishChange = (jenisSideDish: string, selectedId: string) => {
        setSelectedSideDishes(prev => ({
            ...prev,
            [jenisSideDish]: selectedId ? parseInt(selectedId, 10) : '',
        }));
    };


    const handleSave = () => {
        const formData = new FormData();
        formData.append('namaMakanan', editForm.nama);
        formData.append('jenis', editForm.jenis);

        if (imageFile) {
            formData.append('gambar', imageFile);
        }

        const sideDishIds = Object.values(selectedSideDishes).filter(id => id !== '' && !isNaN(Number(id)));
        if (sideDishIds.length > 0) {
            sideDishIds.forEach(id => {
                formData.append('utamaDariIds[]', String(id));
            });
        }

        onSave(editForm.id, formData);
    };
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Edit Makanan</h2>
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
                            value={editForm.nama}
                            onChange={(e) => handleInputChange("nama", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Makanan</label>
                        <select
                            value={editForm.jenis}
                            onChange={(e) => handleInputChange("jenis", e.target.value as Jenis)}
                            className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
                        >
                            {Object.values(Jenis).map((jenisValue) => (
                                <option key={jenisValue} value={jenisValue}>
                                    {jenisValue}
                                </option>
                            ))}
                        </select>
                    </div>

                    {editForm.jenis === 'Lauk' && (
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="text-md font-semibold text-gray-800 mb-4">Edit Makanan Pendamping</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(sideDishOptions).map(([jenisSideDish, options]) => (
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
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="md:col-span-2">
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
                </div>
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    )
}

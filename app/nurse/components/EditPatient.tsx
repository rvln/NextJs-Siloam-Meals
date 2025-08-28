"use client"

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronsUpDown, Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react"
import { Patient, PantanganForm, MakananOption } from "../types/patient"

interface EditPatientProps {
    patient: Patient;
    onSave: (patient: Patient) => void;
    onCancel: () => void;
}

export default function EditPatient({ patient, onSave, onCancel }: EditPatientProps) {
    const [editForm, setEditForm] = useState<Patient>({ ...patient });
    const [makananOptions, setMakananOptions] = useState<MakananOption[]>([]);

    useEffect(() => {
        setEditForm({ ...patient });
    }, [patient]);

    useEffect(() => {
        const fetchMakanan = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/makanan`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error("Gagal mengambil daftar makanan");
                const data = await response.json();
                setMakananOptions(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchMakanan();
    }, []);

    const handleInputChange = (field: keyof Omit<Patient, 'id' | 'Pantangan'>, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };


    const handleAddRestriction = () => {
        setEditForm({
            ...editForm,
            Pantangan: [...editForm.Pantangan, { namaPantangan: "", makananId: null }],
        });
    };

    const handleRestrictionChange = (index: number, field: keyof PantanganForm, value: string | number | null) => {
        const updatedRestrictions = editForm.Pantangan.map((restriction, i) =>
            i === index ? { ...restriction, [field]: value } : restriction
        );
        setEditForm({ ...editForm, Pantangan: updatedRestrictions });
    };

    const handleRemoveRestriction = (index: number) => {
        setEditForm({
            ...editForm,
            Pantangan: editForm.Pantangan.filter((_, i) => i !== index),
        });
    };

    const handleSave = () => {
        const cleanedForm = {
            ...editForm,
            Pantangan: editForm.Pantangan.filter(p => p.makananId && p.namaPantangan),
        };
        onSave(cleanedForm);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Edit Pasien</h2>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pasien</label>
                        <input
                            type="text"
                            value={editForm.namaPasien}
                            onChange={(e) => handleInputChange("namaPasien", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Medical Record</label>
                        <input
                            type="text"
                            value={editForm.mr}
                            onChange={(e) => handleInputChange("mr", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tempat Tidur</label>
                        <input
                            type="text"
                            value={editForm.tempatTidur}
                            onChange={(e) => handleInputChange("tempatTidur", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosa</label>
                        <input
                            type="text"
                            value={editForm.diagnosa}
                            onChange={(e) => handleInputChange("diagnosa", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">Pantangan Makanan</label>
                        <button
                            onClick={handleAddRestriction}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Pantangan
                        </button>
                    </div>
                    <div className="space-y-3">
                        {editForm.Pantangan.map((restriction, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 items-start p-4 bg-gray-50 rounded-lg border">
                                <div className="w-full md:w-1/2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pantangan</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Rendah Garam"
                                        value={restriction.namaPantangan}
                                        onChange={(e) => handleRestrictionChange(index, "namaPantangan", e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-black"
                                    />
                                </div>
                                <div className="w-full md:w-1/2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Makanan Terkait</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-black">
                                                {restriction.makananId
                                                    ? makananOptions.find((m) => m.idMakanan === restriction.makananId)?.namaMakanan
                                                    : "Pilih makanan..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 text-black">
                                            <Command>
                                                <CommandInput placeholder="Cari makanan..." />
                                                <CommandList>
                                                    <CommandEmpty>Tidak ada makanan ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        {makananOptions.map((makanan) => (
                                                            <CommandItem
                                                                key={makanan.idMakanan}
                                                                value={makanan.namaMakanan}
                                                                onSelect={() => handleRestrictionChange(index, "makananId", makanan.idMakanan)}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", restriction.makananId === makanan.idMakanan ? "opacity-100" : "opacity-0")} />
                                                                {makanan.namaMakanan}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveRestriction(index)} className="text-red-500 hover:text-red-700 mt-auto">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        ))}
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

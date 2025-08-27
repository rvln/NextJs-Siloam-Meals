"use client"

import { useState } from "react"

interface Pantangan {
    namaPantangan: string
    makananId: number
}

interface Patient {
    id: number
    namaPasien: string
    mr: string
    tempatTidur: string
    diagnosa: string
    Pantangan: Pantangan[]
}

interface CreatePatientProps {
    onCreate: (patient: Omit<Patient, "id">) => void
    onCancel: () => void
}

export default function CreatePatient({ onCreate, onCancel }: CreatePatientProps) {
    const [createForm, setCreateForm] = useState<Omit<Patient, "id">>({
        namaPasien: "",
        mr: "",
        tempatTidur: "",
        diagnosa: "",
        Pantangan: [],
    })

    const handleAddRestriction = () => {
        setCreateForm({
            ...createForm,
            Pantangan: [...createForm.Pantangan, { namaPantangan: "", makananId: 0 }],
        })
    }

    const handleRemoveRestriction = (index: number) => {
        setCreateForm({
            ...createForm,
            Pantangan: createForm.Pantangan.filter((_, i) => i !== index),
        })
    }

    const handleRestrictionChange = (index: number, field: keyof Pantangan, value: string | number) => {
        const updatedRestrictions = createForm.Pantangan.map((restriction, i) =>
            i === index ? { ...restriction, [field]: value } : restriction,
        )
        setCreateForm({ ...createForm, Pantangan: updatedRestrictions })
    }

    const handleCreate = () => {
        onCreate(createForm)
        setCreateForm({
            namaPasien: "",
            mr: "",
            tempatTidur: "",
            diagnosa: "",
            Pantangan: [],
        })
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Tambah Pasien Baru</h2>
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
                            value={createForm.namaPasien}
                            onChange={(e) => setCreateForm({ ...createForm, namaPasien: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Medical Record</label>
                        <input
                            type="text"
                            value={createForm.mr}
                            onChange={(e) => setCreateForm({ ...createForm, mr: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tempat Tidur</label>
                        <input
                            type="text"
                            value={createForm.tempatTidur}
                            onChange={(e) => setCreateForm({ ...createForm, tempatTidur: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosa</label>
                        <input
                            type="text"
                            value={createForm.diagnosa}
                            onChange={(e) => setCreateForm({ ...createForm, diagnosa: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        {createForm.Pantangan.map((restriction, index) => (
                            <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-md">
                                <input
                                    type="text"
                                    placeholder="Nama pantangan"
                                    value={restriction.namaPantangan}
                                    onChange={(e) => handleRestrictionChange(index, "namaPantangan", e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    placeholder="ID Makanan"
                                    value={restriction.makananId}
                                    onChange={(e) => handleRestrictionChange(index, "makananId", Number.parseInt(e.target.value) || 0)}
                                    className="w-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button onClick={() => handleRemoveRestriction(index)} className="text-red-500 hover:text-red-700 p-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </button>
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
                        onClick={handleCreate}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Simpan Pasien
                    </button>
                </div>
            </div>
        </div>
    )
}

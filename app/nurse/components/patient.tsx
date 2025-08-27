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

const mockPatients: Patient[] = [
    {
        id: 1,
        namaPasien: "Herman",
        mr: "SHMN-00-00-07-21",
        tempatTidur: "C-05",
        diagnosa: "Hipertensi",
        Pantangan: [
            {
                namaPantangan: "Tidak boleh asin",
                makananId: 1,
            },
            {
                namaPantangan: "Tidak boleh gorengan",
                makananId: 2,
            },
        ],
    },
    {
        id: 2,
        namaPasien: "Siti Aminah",
        mr: "SHMN-00-00-08-21",
        tempatTidur: "A-12",
        diagnosa: "Diabetes Mellitus",
        Pantangan: [
            {
                namaPantangan: "Tidak boleh manis",
                makananId: 3,
            },
            {
                namaPantangan: "Batasi karbohidrat",
                makananId: 4,
            },
        ],
    },
    {
        id: 3,
        namaPasien: "Budi Santoso",
        mr: "SHMN-00-00-09-21",
        tempatTidur: "B-08",
        diagnosa: "Gastritis",
        Pantangan: [
            {
                namaPantangan: "Tidak boleh pedas",
                makananId: 5,
            },
            {
                namaPantangan: "Tidak boleh asam",
                makananId: 6,
            },
        ],
    },
]

export default function Patient() {
    const [patients, setPatients] = useState<Patient[]>(mockPatients)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<Patient | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [createForm, setCreateForm] = useState<Omit<Patient, "id">>({
        namaPasien: "",
        mr: "",
        tempatTidur: "",
        diagnosa: "",
        Pantangan: [],
    })

    const handleEditPatient = (patient: Patient) => {
        setSelectedPatient(patient)
        setEditForm({ ...patient })
        setIsEditing(true)
    }

    const handleSavePatient = () => {
        if (editForm) {
            setPatients(patients.map((p) => (p.id === editForm.id ? editForm : p)))
            setIsEditing(false)
            setSelectedPatient(editForm)
            setEditForm(null)
        }
    }

    const handleCreatePatient = () => {
        const newId = Math.max(...patients.map((p) => p.id)) + 1
        const newPatient: Patient = {
            id: newId,
            ...createForm,
        }
        setPatients([...patients, newPatient])
        setIsCreating(false)
        setCreateForm({
            namaPasien: "",
            mr: "",
            tempatTidur: "",
            diagnosa: "",
            Pantangan: [],
        })
    }

    const handleDeletePatient = (patientId: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus data pasien ini?")) {
            setPatients(patients.filter((p) => p.id !== patientId))
            if (selectedPatient?.id === patientId) {
                setSelectedPatient(null)
                setIsEditing(false)
                setEditForm(null)
            }
        }
    }

    const handleAddRestriction = () => {
        if (editForm) {
            setEditForm({
                ...editForm,
                Pantangan: [...editForm.Pantangan, { namaPantangan: "", makananId: 0 }],
            })
        }
    }

    const handleAddRestrictionCreate = () => {
        setCreateForm({
            ...createForm,
            Pantangan: [...createForm.Pantangan, { namaPantangan: "", makananId: 0 }],
        })
    }

    const handleRemoveRestriction = (index: number) => {
        if (editForm) {
            setEditForm({
                ...editForm,
                Pantangan: editForm.Pantangan.filter((_, i) => i !== index),
            })
        }
    }

    const handleRemoveRestrictionCreate = (index: number) => {
        setCreateForm({
            ...createForm,
            Pantangan: createForm.Pantangan.filter((_, i) => i !== index),
        })
    }

    const handleRestrictionChange = (index: number, field: keyof Pantangan, value: string | number) => {
        if (editForm) {
            const updatedRestrictions = editForm.Pantangan.map((restriction, i) =>
                i === index ? { ...restriction, [field]: value } : restriction,
            )
            setEditForm({ ...editForm, Pantangan: updatedRestrictions })
        }
    }

    const handleRestrictionChangeCreate = (index: number, field: keyof Pantangan, value: string | number) => {
        const updatedRestrictions = createForm.Pantangan.map((restriction, i) =>
            i === index ? { ...restriction, [field]: value } : restriction,
        )
        setCreateForm({ ...createForm, Pantangan: updatedRestrictions })
    }

    return (
        <div className="min-h-screen bg-gray-400 p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-white text-xl font-bold text-center mb-6">Kelola Data Pasien</h1>

                {!selectedPatient && !isCreating ? (
                    // Patient List View
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Pasien Baru
                        </button>

                        {patients.map((patient) => (
                            <div key={patient.id} className="bg-white rounded-lg p-4 shadow-sm">
                                <div
                                    className="cursor-pointer hover:bg-gray-50 -m-4 p-4 rounded-lg"
                                    onClick={() => setSelectedPatient(patient)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-800">{patient.namaPasien}</h3>
                                        <span className="text-sm text-gray-500">{patient.tempatTidur}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">MR: {patient.mr}</p>
                                    <p className="text-sm text-gray-600 mb-2">Diagnosa: {patient.diagnosa}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-green-600 font-medium">{patient.Pantangan.length} Pantangan</span>
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => handleDeletePatient(patient.id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isCreating ? (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => {
                                    setIsCreating(false)
                                    setCreateForm({
                                        namaPasien: "",
                                        mr: "",
                                        tempatTidur: "",
                                        diagnosa: "",
                                        Pantangan: [],
                                    })
                                }}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="font-bold text-gray-800">Tambah Pasien Baru</h2>
                            <div className="w-6"></div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pasien</label>
                                <input
                                    type="text"
                                    value={createForm.namaPasien}
                                    onChange={(e) => setCreateForm({ ...createForm, namaPasien: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Record</label>
                                <input
                                    type="text"
                                    value={createForm.mr}
                                    onChange={(e) => setCreateForm({ ...createForm, mr: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Tidur</label>
                                <input
                                    type="text"
                                    value={createForm.tempatTidur}
                                    onChange={(e) => setCreateForm({ ...createForm, tempatTidur: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosa</label>
                                <input
                                    type="text"
                                    value={createForm.diagnosa}
                                    onChange={(e) => setCreateForm({ ...createForm, diagnosa: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Pantangan Makanan</label>
                                    <button
                                        onClick={handleAddRestrictionCreate}
                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                    >
                                        + Tambah
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {createForm.Pantangan.map((restriction, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="Nama pantangan"
                                                value={restriction.namaPantangan}
                                                onChange={(e) => handleRestrictionChangeCreate(index, "namaPantangan", e.target.value)}
                                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                            />
                                            <input
                                                type="number"
                                                placeholder="ID"
                                                value={restriction.makananId}
                                                onChange={(e) =>
                                                    handleRestrictionChangeCreate(index, "makananId", Number.parseInt(e.target.value) || 0)
                                                }
                                                className="w-16 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                            />
                                            <button
                                                onClick={() => handleRemoveRestrictionCreate(index)}
                                                className="text-red-500 hover:text-red-700"
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
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => {
                                        setIsCreating(false)
                                        setCreateForm({
                                            namaPasien: "",
                                            mr: "",
                                            tempatTidur: "",
                                            diagnosa: "",
                                            Pantangan: [],
                                        })
                                    }}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleCreatePatient}
                                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Patient Detail View
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => {
                                    setSelectedPatient(null)
                                    setIsEditing(false)
                                    setEditForm(null)
                                }}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="font-bold text-gray-800">Detail Pasien</h2>
                            <button
                                onClick={() => selectedPatient && handleEditPatient(selectedPatient)}
                                className="text-green-600 hover:text-green-800"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </button>
                        </div>

                        {isEditing && editForm ? (
                            // Edit Form
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pasien</label>
                                    <input
                                        type="text"
                                        value={editForm.namaPasien}
                                        onChange={(e) => setEditForm({ ...editForm, namaPasien: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Medical Record</label>
                                    <input
                                        type="text"
                                        value={editForm.mr}
                                        onChange={(e) => setEditForm({ ...editForm, mr: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Tidur</label>
                                    <input
                                        type="text"
                                        value={editForm.tempatTidur}
                                        onChange={(e) => setEditForm({ ...editForm, tempatTidur: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosa</label>
                                    <input
                                        type="text"
                                        value={editForm.diagnosa}
                                        onChange={(e) => setEditForm({ ...editForm, diagnosa: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Pantangan Makanan</label>
                                        <button
                                            onClick={handleAddRestriction}
                                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                                        >
                                            + Tambah
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {editForm.Pantangan.map((restriction, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    placeholder="Nama pantangan"
                                                    value={restriction.namaPantangan}
                                                    onChange={(e) => handleRestrictionChange(index, "namaPantangan", e.target.value)}
                                                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="ID"
                                                    value={restriction.makananId}
                                                    onChange={(e) =>
                                                        handleRestrictionChange(index, "makananId", Number.parseInt(e.target.value) || 0)
                                                    }
                                                    className="w-16 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                                />
                                                <button
                                                    onClick={() => handleRemoveRestriction(index)}
                                                    className="text-red-500 hover:text-red-700"
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
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false)
                                            setEditForm(null)
                                        }}
                                        className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSavePatient}
                                        className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div className="space-y-4">
                                {selectedPatient ? (
                                    <>
                                        <div>
                                            <h3 className="font-semibold text-gray-800 text-lg">{selectedPatient.namaPasien}</h3>
                                            <p className="text-gray-600">MR: {selectedPatient.mr}</p>
                                            <p className="text-gray-600">Tempat Tidur: {selectedPatient.tempatTidur}</p>
                                            <p className="text-gray-600">Diagnosa: {selectedPatient.diagnosa}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-800 mb-2">Pantangan Makanan:</h4>
                                            {selectedPatient.Pantangan.length > 0 ? (
                                                <div className="space-y-2">
                                                    {selectedPatient.Pantangan.map((restriction, index) => (
                                                        <div key={index} className="bg-red-50 border border-red-200 rounded-md p-2">
                                                            <p className="text-red-800 text-sm font-medium">{restriction.namaPantangan}</p>
                                                            <p className="text-red-600 text-xs">ID Makanan: {restriction.makananId}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-sm">Tidak ada pantangan makanan</p>
                                            )}
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

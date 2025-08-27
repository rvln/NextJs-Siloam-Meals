"use client"

import { useState } from "react"
import PatientDetailView from "./DetailPatient"
import CreatePatient from "./CreatePatient"
import EditPatient from "./EditPatient"

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
    {
        id: 4,
        namaPasien: "Maria Santos",
        mr: "SHMN-00-00-10-21",
        tempatTidur: "D-15",
        diagnosa: "Kolesterol Tinggi",
        Pantangan: [
            {
                namaPantangan: "Tidak boleh berlemak",
                makananId: 7,
            },
        ],
    },
    {
        id: 5,
        namaPasien: "Ahmad Wijaya",
        mr: "SHMN-00-00-11-21",
        tempatTidur: "E-03",
        diagnosa: "Asam Urat",
        Pantangan: [
            {
                namaPantangan: "Tidak boleh jeroan",
                makananId: 8,
            },
            {
                namaPantangan: "Batasi protein tinggi",
                makananId: 9,
            },
        ],
    },
]

export default function ManagePatient() {
    const [patients, setPatients] = useState<Patient[]>(mockPatients)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredPatients = patients.filter(
        (patient) =>
            patient.namaPasien.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.mr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.tempatTidur.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.diagnosa.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleEditPatient = (patient: Patient) => {
        setSelectedPatient(patient)
        setIsEditing(true)
    }

    const handleSavePatient = (updatedPatient: Patient) => {
        setPatients(patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)))
        setIsEditing(false)
        setSelectedPatient(updatedPatient)
    }

    const handleCreatePatient = (newPatientData: Omit<Patient, "id">) => {
        const newId = Math.max(...patients.map((p) => p.id)) + 1
        const newPatient: Patient = {
            id: newId,
            ...newPatientData,
        }
        setPatients([...patients, newPatient])
        setIsCreating(false)
    }

    const handleDeletePatient = (patientId: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus data pasien ini?")) {
            setPatients(patients.filter((p) => p.id !== patientId))
            if (selectedPatient?.id === patientId) {
                setSelectedPatient(null)
                setIsEditing(false)
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Daftar Pasien</h2>
                                    <span className="text-sm text-gray-500">{filteredPatients.length} pasien</span>
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
                                        placeholder="Cari pasien..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>

                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Tambah Pasien Baru
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {filteredPatients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedPatient?.id === patient.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                            }`}
                                        onClick={() => setSelectedPatient(patient)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-medium text-gray-900 text-sm">{patient.namaPasien}</h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{patient.tempatTidur}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">MR: {patient.mr}</p>
                                        <p className="text-xs text-gray-600 mb-2">{patient.diagnosa}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-orange-600 font-medium">{patient.Pantangan.length} Pantangan</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeletePatient(patient.id)
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
                            <CreatePatient onCreate={handleCreatePatient} onCancel={() => setIsCreating(false)} />
                        ) : selectedPatient ? (
                            isEditing ? (
                                <EditPatient
                                    patient={selectedPatient}
                                    onSave={handleSavePatient}
                                    onCancel={() => setIsEditing(false)}
                                />
                            ) : (
                                <PatientDetailView patient={selectedPatient} onEdit={() => handleEditPatient(selectedPatient)} />
                            )
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <svg
                                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Pasien</h3>
                                <p className="text-gray-500">
                                    Pilih pasien dari daftar di sebelah kiri untuk melihat detail dan mengelola data pasien.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

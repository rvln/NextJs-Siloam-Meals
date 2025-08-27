"use client"

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

interface PatientDetailViewProps {
    patient: Patient
    onEdit: () => void
}

export default function PatientDetailView({ patient, onEdit }: PatientDetailViewProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Detail Pasien</h2>
                    <button
                        onClick={onEdit}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                        Edit
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">{patient.namaPasien}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Medical Record</p>
                                    <p className="text-gray-900 font-mono">{patient.mr}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tempat Tidur</p>
                                    <p className="text-gray-900">{patient.tempatTidur}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-sm font-medium text-gray-500">Diagnosa</p>
                                    <p className="text-gray-900">{patient.diagnosa}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="bg-orange-50 rounded-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                                Pantangan Makanan
                            </h4>
                            {patient.Pantangan.length > 0 ? (
                                <div className="space-y-3">
                                    {patient.Pantangan.map((restriction, index) => (
                                        <div key={index} className="bg-white border border-orange-200 rounded-md p-3">
                                            <p className="text-orange-800 font-medium text-sm">{restriction.namaPantangan}</p>
                                            <p className="text-orange-600 text-xs mt-1">ID Makanan: {restriction.makananId}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Tidak ada pantangan makanan</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

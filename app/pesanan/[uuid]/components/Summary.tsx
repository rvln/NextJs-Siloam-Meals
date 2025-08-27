"use client"

interface Patient {
    idPasien: number
    mr: string
    namaPasien: string
    tempatTidur: string
    diagnosa: string
    status: string
}

interface OrderDetail {
    makananId: number
    penggantiId?: number
    qty: number
}

interface Menu {
    idMenu: number
    namaMenu: string
    items: Array<{
        makananId: number
        nama: string
        kategori: string
    }>
}

interface SummaryProps {
    patient: Patient
    orderDetails: OrderDetail[]
    menus: Menu[]
    onRemoveItem: (index: number) => void
    onSubmitOrder: () => void
}

export default function Summary({ patient, orderDetails, menus, onRemoveItem, onSubmitOrder }: SummaryProps) {
    // Helper function to find item name by ID
    const getItemName = (makananId: number) => {
        for (const menu of menus) {
            const item = menu.items.find((item) => item.makananId === makananId)
            if (item) return item.nama
        }
        return "Unknown Item"
    }

    if (orderDetails.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>
                <p className="text-gray-600">No items added to order yet.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>

            {/* Patient Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Name:</span> {patient.namaPasien}
                    </div>
                    <div>
                        <span className="text-gray-600">MR:</span> {patient.mr}
                    </div>
                    <div>
                        <span className="text-gray-600">Room:</span> {patient.tempatTidur}
                    </div>
                    <div>
                        <span className="text-gray-600">Diagnosis:</span> {patient.diagnosa}
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-6">
                <h3 className="font-medium text-gray-800">Ordered Items</h3>
                {orderDetails.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                            <p className="font-medium text-gray-800">{getItemName(detail.makananId)}</p>
                            {detail.penggantiId && (
                                <p className="text-sm text-blue-600">Substituted with: {getItemName(detail.penggantiId)}</p>
                            )}
                            <p className="text-sm text-gray-600">Quantity: {detail.qty}</p>
                        </div>
                        <button
                            onClick={() => onRemoveItem(index)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    onClick={onSubmitOrder}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Submit Order ({orderDetails.length} items)
                </button>
            </div>
        </div>
    )
}

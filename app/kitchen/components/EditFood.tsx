"use client";

import { useEffect, useState } from "react";
import { Jenis, Makanan } from "../types/food";
import Image from "next/image";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditFoodProps {
  food: Makanan;
  onSave: (id: number, formData: FormData) => void;
  onCancel: () => void;
  sideDishOptions: Record<string, Makanan[]>;
}

export default function EditFood({
  food,
  onSave,
  onCancel,
  sideDishOptions,
}: EditFoodProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(food.gambar);
  const [editForm, setEditForm] = useState<Makanan>({ ...food });
  const [isPaket, setIsPaket] = useState(food.isPaket ?? false);
  const [selectedSideDishes, setSelectedSideDishes] = useState<
    Record<string, number | "">
  >({});
  // State baru untuk tanggal tersedia
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    setEditForm({ ...food });
    setPreviewUrl(food.gambar);
    setIsPaket(food.isPaket ?? false);
    setImageFile(null);

    // Inisialisasi tanggal tersedia
    const initialDates = food.tanggalTersedia.map((t) => new Date(t.tanggal));
    setAvailableDates(initialDates.sort((a, b) => a.getTime() - b.getTime()));

    const initialSideDishes = food.utamaDari.reduce((acc, komponen) => {
      acc[komponen.jenis] = komponen.id;
      return acc;
    }, {} as Record<string, number>);
    setSelectedSideDishes(initialSideDishes);
  }, [food]);

  const handleInputChange = (field: keyof Makanan, value: string | Jenis) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSideDishChange = (jenisSideDish: string, selectedId: string) => {
    setSelectedSideDishes((prev) => ({
      ...prev,
      [jenisSideDish]: selectedId ? parseInt(selectedId, 10) : "",
    }));
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("namaMakanan", editForm.nama);
    formData.append("jenis", editForm.jenis);
    formData.append("isPaket", String(isPaket));

    if (imageFile) {
      formData.append("gambar", imageFile);
    }

    const sideDishIds = Object.values(selectedSideDishes).filter(
      (id) => id !== "" && !isNaN(Number(id))
    );
    if (sideDishIds.length > 0) {
      sideDishIds.forEach((id) => {
        formData.append("utamaDariIds[]", String(id));
      });
    }

    // Tambahkan tanggal ke FormData
    availableDates.forEach((date) => {
      formData.append("tanggalTersedia[]", date.toISOString());
    });

    onSave(editForm.id, formData);
  };

  const handleAddDate = () => {
    if (dateInput) {
      const newDate = new Date(dateInput);
      if (!availableDates.find((d) => d.getTime() === newDate.getTime())) {
        setAvailableDates(
          [...availableDates, newDate].sort((a, b) => a.getTime() - b.getTime())
        );
      }
      setDateInput("");
    }
  };

  const handleRemoveDate = (dateToRemove: Date) => {
    setAvailableDates(
      availableDates.filter((d) => d.getTime() !== dateToRemove.getTime())
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Edit Makanan</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Makanan
            </label>
            <input
              type="text"
              value={editForm.nama}
              onChange={(e) => handleInputChange("nama", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Makanan
            </label>
            <select
              value={editForm.jenis}
              onChange={(e) =>
                handleInputChange("jenis", e.target.value as Jenis)
              }
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
            >
              {Object.values(Jenis).map((jenisValue) => (
                <option key={jenisValue} value={jenisValue}>
                  {jenisValue}
                </option>
              ))}
            </select>
          </div>

          {editForm.jenis === "Lauk" && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-md font-semibold text-gray-800 mb-4">
                Edit Makanan Pendamping
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(sideDishOptions).map(
                  ([jenisSideDish, options]) => (
                    <div key={jenisSideDish}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {jenisSideDish}
                      </label>
                      <select
                        value={selectedSideDishes[jenisSideDish] || ""}
                        onChange={(e) =>
                          handleSideDishChange(jenisSideDish, e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
                      >
                        <option value="">-- Tidak Dipilih --</option>
                        {options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* --- FITUR BARU: TANGGAL TERSEDIA --- */}
          <div className="mt-6 pt-6 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Tanggal Tersedia
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddDate}
                className="text-black"
              >
                Tambah
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableDates.map((date) => (
                <div
                  key={date.toISOString()}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  <button
                    onClick={() => handleRemoveDate(date)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CHECKBOX BARU UNTUK isPaket */}
          {editForm.jenis === "Lauk" && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="isPaketEdit"
                checked={isPaket}
                onChange={(e) => setIsPaket(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="isPaketEdit"
                className="text-sm font-medium text-gray-700"
              >
                Ini adalah Menu Paket (sudah termasuk pendamping)
              </label>
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Gambar
            </label>
            <div className="mt-1 flex items-center gap-4">
              {previewUrl && (
                <div className="w-24 h-24 relative border rounded-md overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    layout="fill"
                    objectFit="cover"
                  />
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
  );
}

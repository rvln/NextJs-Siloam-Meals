"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Check, PlusCircle, Trash2 } from "lucide-react";
import {
  PantanganForm,
  MakananOption,
  CreatePatientFormData,
} from "../types/patient";
import NotificationModal from "@/components/ui/NotificationModal";
import { Jenis } from "@/app/kitchen/types/food";

interface CreatePatientProps {
  onCreate: (patient: CreatePatientFormData) => void;
  onCancel: () => void;
}

export default function CreatePatient({
  onCreate,
  onCancel,
}: CreatePatientProps) {
  const [createForm, setCreateForm] = useState<CreatePatientFormData>({
    namaPasien: "",
    mr: "",
    ruanganInap: "",
    diagnosa: "",
    noKtp: "",
    tanggalLahir: "",
    Pantangan: [],
  });

  const [makananOptions, setMakananOptions] = useState<MakananOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "success" as "success" | "error",
  });

  // State for adding new food
  const [isAddFoodModalOpen, setAddFoodModalOpen] = useState(false);
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodType, setNewFoodType] = useState<Jenis>(Jenis.Lauk);
  const [currentRestrictionIndex, setCurrentRestrictionIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchMakanan = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // Corrected token key
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/makanan`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Gagal mengambil daftar makanan");
        const data = await response.json();
        setMakananOptions(
          data.map((m: any) => ({
            idMakanan: m.idMakanan,
            namaMakanan: m.namaMakanan,
          }))
        );
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          setModalContent({
            title: "Terjadi Kesalahan",
            message: err.message,
            type: "error",
          });
        } else {
          setModalContent({
            title: "Terjadi Kesalahan",
            message: "Terjadi kesalahan yang tidak diketahui",
            type: "error",
          });
        }
        setIsModalOpen(true);
      }
    };
    fetchMakanan();
  }, []);

  const handleAddRestriction = () => {
    setCreateForm({
      ...createForm,
      Pantangan: [...createForm.Pantangan, { namaPantangan: "", makananId: 0 }],
    });
  };

  const handleRemoveRestriction = (index: number) => {
    setCreateForm({
      ...createForm,
      Pantangan: createForm.Pantangan.filter((_, i) => i !== index),
    });
  };

  const handleRestrictionChange = (
    index: number,
    field: keyof PantanganForm,
    value: string | number | null
  ) => {
    const updatedRestrictions = createForm.Pantangan.map((restriction, i) =>
      i === index ? { ...restriction, [field]: value } : restriction
    );
    setCreateForm({ ...createForm, Pantangan: updatedRestrictions });
  };

  const handleCreate = () => {
    onCreate(createForm);
    setCreateForm({
      namaPasien: "",
      mr: "",
      ruanganInap: "",
      diagnosa: "",
      noKtp: "",
      tanggalLahir: "",
      Pantangan: [],
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Tambah Pasien Baru
          </h2>
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
              Nama Pasien
            </label>
            <input
              type="text"
              value={createForm.namaPasien}
              onChange={(e) =>
                setCreateForm({ ...createForm, namaPasien: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Record (MR)
            </label>
            <input
              type="text"
              value={createForm.mr}
              onChange={(e) =>
                setCreateForm({ ...createForm, mr: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              No. KTP
            </label>
            <input
              type="text"
              value={createForm.noKtp}
              onChange={(e) =>
                setCreateForm({ ...createForm, noKtp: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={createForm.tanggalLahir}
              onChange={(e) =>
                setCreateForm({ ...createForm, tanggalLahir: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ruangan Inap
            </label>
            <input
              type="text"
              value={createForm.ruanganInap}
              onChange={(e) =>
                setCreateForm({ ...createForm, ruanganInap: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnosa
            </label>
            <input
              type="text"
              value={createForm.diagnosa}
              onChange={(e) =>
                setCreateForm({ ...createForm, diagnosa: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Pantangan Makanan
            </label>
            <button
              onClick={handleAddRestriction}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Pantangan
            </button>
          </div>
          <div className="space-y-3">
            {createForm.Pantangan.map((restriction, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-4 items-start p-4 bg-gray-50 rounded-lg border"
              >
                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pantangan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rendah Garam"
                    value={restriction.namaPantangan}
                    onChange={(e) =>
                      handleRestrictionChange(
                        index,
                        "namaPantangan",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div className="w-full md:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Makanan Terkait
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between font-normal text-black",
                          !restriction.makananId && "text-muted-foreground"
                        )}
                      >
                        {restriction.makananId
                          ? makananOptions.find(
                              (m) => m.idMakanan === restriction.makananId
                            )?.namaMakanan
                          : "Pilih makanan..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Cari makanan..." />
                        <CommandList>
                          <CommandEmpty>
                            Tidak ada makanan ditemukan.
                          </CommandEmpty>
                          <CommandGroup>
                            {makananOptions.map((makanan) => (
                              <CommandItem
                                key={makanan.idMakanan}
                                value={makanan.namaMakanan}
                                onSelect={() => {
                                  handleRestrictionChange(
                                    index,
                                    "makananId",
                                    makanan.idMakanan
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    restriction.makananId === makanan.idMakanan
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {makanan.namaMakanan}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                        <CommandSeparator />
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-shrink-0 pt-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRestriction(index)}
                    className="text-red-500 hover:bg-red-100 hover:text-red-700"
                    aria-label="Hapus pantangan"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
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

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
        type={modalContent.type}
      />
    </div>
  );
}

"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import { ApiMakanan } from "./Menu";

interface FoodCardProps {
  item: ApiMakanan;
  onOrderClick: (item: ApiMakanan) => void;
}

/**
 * Komponen FoodCard
 * Menampilkan satu item makanan dalam bentuk kartu yang menarik dan informatif.
 * Menerapkan prinsip hierarki visual dan kejelasan.
 */
export function FoodCard({ item, onOrderClick }: FoodCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col border border-gray-200/80">
      {/* Gambar Makanan */}
      <div className="relative h-48 w-full">
        <Image
          src={item.gambar || "https://placehold.co/600x400/e2e8f0/e2e8f0"}
          alt={item.namaMakanan}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {item.isPaket && (
          <span
            className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: "#003d79", color: "#FFFFFF" }} // Siloam Blue
          >
            PAKET
          </span>
        )}
      </div>

      {/* Detail Makanan */}
      <div className="p-5 flex flex-col flex-grow">
        <h3
          className="text-lg font-bold text-gray-800 mb-2"
          style={{ color: "#003d79" }}
        >
          {item.namaMakanan}
        </h3>

        {item.isPaket && item.utamaDari && item.utamaDari.length > 0 && (
          <p className="text-xs text-gray-500 mb-4 flex-grow">
            Termasuk: {item.utamaDari.map((u) => u.namaMakanan).join(", ")}
          </p>
        )}

        {/* Placeholder for description if available in the future */}
        {!item.isPaket && <div className="flex-grow"></div>}

        {/* Tombol Aksi */}
        <div className="mt-auto">
          <Button
            onClick={() => onOrderClick(item)}
            className="w-full font-semibold mt-4 transition-transform active:scale-95"
            style={{ backgroundColor: "#43a047" }} // Siloam Green
          >
            {item.isPaket ? "Pesan Paket Ini" : "Pilih Pendamping"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

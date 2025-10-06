"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Filter } from "lucide-react";
import { Jenis } from "../types/food";

interface ScheduledFood {
  id: number;
  nama: string;
  jenis: string;
}

interface DailySchedule {
  Pagi: ScheduledFood[];
  Siang: ScheduledFood[];
  Malam: ScheduledFood[];
  Lainnya: ScheduledFood[];
}

// Komponen untuk menampilkan detail menu harian
const DayDetailView = ({
  date,
  schedule,
}: {
  date: Date;
  schedule: DailySchedule | null;
}) => {
  if (!schedule) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        Tidak ada menu yang dijadwalkan untuk tanggal ini.
      </div>
    );
  }

  const sessions: (keyof DailySchedule)[] = ["Pagi", "Siang", "Malam"];

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Menu untuk{" "}
        {date.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sessions.map((sesi) => (
          <div key={sesi}>
            <h4 className="font-semibold text-gray-700 border-b pb-2 mb-2">
              {sesi}
            </h4>
            {schedule[sesi] && schedule[sesi].length > 0 ? (
              <ul className="space-y-2">
                {schedule[sesi].map((food) => (
                  <li
                    key={food.id}
                    className="text-sm text-gray-600 p-2 bg-white rounded-md shadow-sm"
                  >
                    <span className="font-medium">{food.nama}</span> (
                    {food.jenis})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Kosong</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MonthlyScheduleView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [schedule, setSchedule] = useState<Record<string, DailySchedule>>({});
  const [isLoading, setIsLoading] = useState(true);

  // State untuk filter
  const [filterJenis, setFilterJenis] = useState<string>("");

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/makanan/schedule?month=${month}&year=${year}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Gagal mengambil data jadwal");
        const data = await res.json();
        setSchedule(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, [currentDate]);

  const filteredSchedule = useMemo(() => {
    if (!filterJenis) return schedule;

    const filtered: Record<string, DailySchedule> = {};
    for (const date in schedule) {
      const daily = schedule[date];
      const newDaily: DailySchedule = {
        Pagi: [],
        Siang: [],
        Malam: [],
        Lainnya: [],
      };
      let hasMatch = false;

      (Object.keys(daily) as (keyof DailySchedule)[]).forEach((sesi) => {
        const filteredFoods = daily[sesi].filter(
          (food) => food.jenis === filterJenis
        );
        if (filteredFoods.length > 0) {
          newDaily[sesi] = filteredFoods;
          hasMatch = true;
        }
      });

      if (hasMatch) {
        filtered[date] = newDaily;
      }
    }
    return filtered;
  }, [schedule, filterJenis]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const emptyDays = Array.from(
    { length: firstDayOfMonth },
    () => null as number | null
  );
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarDays = [...emptyDays, ...monthDays];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const changeMonth = (offset: number) => {
    setSelectedDate(null); // Reset selection when month changes
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    const newSelectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newSelectedDate);
  };

  const getDaySchedule = (day: number | null): DailySchedule | null => {
    if (!day) return null;
    const dateString = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return filteredSchedule[dateString] || null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-black">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Jadwal Menu Bulanan</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-gray-700 w-32 text-center">
            {currentDate.toLocaleString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-md border">
        <Filter className="h-5 w-5 text-gray-500" />
        <select
          value={filterJenis}
          onChange={(e) => setFilterJenis(e.target.value)}
          className="w-full sm:w-48 p-2 border border-gray-300 rounded-md bg-white text-sm"
        >
          <option value="">Semua Jenis</option>
          {Object.values(Jenis).map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Memuat jadwal...</div>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-xs text-gray-500 py-2 bg-gray-100"
            >
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            if (!day) return <div key={index} className="bg-gray-50"></div>;

            const daySchedule = getDaySchedule(day);
            const isComplete =
              daySchedule &&
              daySchedule.Pagi.length > 0 &&
              daySchedule.Siang.length > 0 &&
              daySchedule.Malam.length > 0;
            const hasMenu =
              daySchedule &&
              (daySchedule.Pagi.length > 0 ||
                daySchedule.Siang.length > 0 ||
                daySchedule.Malam.length > 0);

            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const isToday = date.getTime() === today.getTime();
            const isSelected =
              selectedDate && date.getTime() === selectedDate.getTime();

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={`relative h-28 p-2 text-left align-top transition-colors
                  ${
                    isSelected
                      ? "bg-blue-100 border-2 border-blue-400"
                      : "bg-white hover:bg-gray-50"
                  }
                `}
              >
                <span
                  className={`font-semibold ${
                    isToday
                      ? "text-white bg-blue-600 rounded-full flex items-center justify-center h-6 w-6"
                      : "text-gray-800"
                  }`}
                >
                  {day}
                </span>
                {isComplete && (
                  <span title="Menu Lengkap">
                    <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-green-500" />
                  </span>
                )}
                {hasMenu && !isComplete && (
                  <div
                    className="absolute top-2 right-2 h-3 w-3 bg-yellow-400 rounded-full"
                    title="Menu belum lengkap"
                  ></div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Detail View Section */}
      {selectedDate && (
        <DayDetailView
          date={selectedDate}
          schedule={getDaySchedule(selectedDate.getDate())}
        />
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { getAllAbsensi } from "../../api/absensi";
import { getAllUsers } from "../../api/user";
import { FaCheckCircle, FaTimesCircle, FaSync } from "react-icons/fa";

type Absensi = {
    user_id: string | number;
    tanggal: string;
    status: string;
};
type User = {
    id: string | number;
    name: string;
};

const AbsensiRealtimeStatus = () => {
    const [hadir, setHadir] = useState<string[]>([]);
    const [belum, setBelum] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = (isManual = false) => {
        if (isManual) setRefreshing(true);

        Promise.all([getAllUsers(), getAllAbsensi()])
            .then(([userRes, absensiRes]) => {
                // users: backend response { success, data: [...], ... }
                const users: User[] = Array.isArray(userRes)
                    ? userRes
                    : userRes && Array.isArray(userRes.data)
                    ? userRes.data
                    : [];
                // absensi: backend response { success, data: [...], ... }
                const absensi: Absensi[] = Array.isArray(absensiRes)
                    ? absensiRes
                    : absensiRes && Array.isArray(absensiRes.data)
                    ? absensiRes.data
                    : [];

                // Get today date in local timezone
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                console.log(
                    "Realtime Status - Today range:",
                    today,
                    "to",
                    tomorrow,
                );

                // user_id yang sudah absen hari ini
                // Normalize to string untuk comparison
                const absenUserIds = new Set(
                    absensi
                        .filter((a) => {
                            if (!a.tanggal) return false;
                            const tanggalDate = new Date(a.tanggal);
                            return (
                                tanggalDate >= today && tanggalDate < tomorrow
                            );
                        })
                        .map((a) => String(a.user_id)),
                );

                console.log("Realtime Status - Today:", today);
                console.log("Realtime Status - Total Users:", users.length);
                console.log(
                    "Realtime Status - Total Absensi Today:",
                    absenUserIds.size,
                );
                console.log(
                    "Realtime Status - Absen User IDs:",
                    Array.from(absenUserIds),
                );

                setHadir(
                    users
                        .filter((u) => absenUserIds.has(String(u.id)))
                        .map((u) => u.name)
                        .slice(0, 10), // Limit 10 teratas
                );
                setBelum(
                    users
                        .filter((u) => !absenUserIds.has(String(u.id)))
                        .map((u) => u.name)
                        .slice(0, 10), // Limit 10 teratas
                );
                setLastUpdate(new Date());
                setLoading(false);
                setError("");
                if (isManual) setRefreshing(false);
            })
            .catch((err) => {
                console.error("Realtime Status Error:", err);
                setError("Gagal mengambil data kehadiran realtime");
                setLoading(false);
                if (isManual) setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchData();

        // Auto refresh setiap 30 detik
        const interval = setInterval(() => {
            fetchData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                    Status Kehadiran Realtime
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Update: {lastUpdate.toLocaleTimeString("id-ID")}
                    </span>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors disabled:opacity-50"
                        title="Refresh data">
                        <FaSync
                            className={`text-sm ${
                                refreshing ? "animate-spin" : ""
                            }`}
                        />
                    </button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                <div className="flex-1 bg-green-50 dark:bg-green-800/40 rounded-lg p-4 border border-green-200 dark:border-green-600">
                    <div className="flex items-center gap-2 mb-2">
                        <FaCheckCircle className="text-green-500 dark:text-green-400 text-xl" />
                        <span className="font-semibold text-green-700 dark:text-green-200">
                            Sudah Absen
                        </span>
                        <span className="ml-auto text-xs bg-green-100 dark:bg-green-700/40 text-green-700 dark:text-green-200 px-2 py-0.5 rounded-full font-semibold">
                            {hadir.length}
                        </span>
                    </div>
                    <ul className="text-sm text-gray-700 dark:text-gray-100 space-y-1">
                        {hadir.length === 0 ? (
                            <li className="italic text-gray-400 dark:text-gray-500">
                                Tidak ada
                            </li>
                        ) : (
                            hadir.map((nama) => (
                                <li
                                    key={nama}
                                    className="flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 dark:bg-green-300"></span>
                                    {nama}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
                <div className="flex-1 bg-red-50 dark:bg-red-800/40 rounded-lg p-4 border border-red-200 dark:border-red-600">
                    <div className="flex items-center gap-2 mb-2">
                        <FaTimesCircle className="text-red-500 dark:text-red-400 text-xl" />
                        <span className="font-semibold text-red-700 dark:text-red-200">
                            Belum Absen
                        </span>
                        <span className="ml-auto text-xs bg-red-100 dark:bg-red-700/40 text-red-700 dark:text-red-200 px-2 py-0.5 rounded-full font-semibold">
                            {belum.length}
                        </span>
                    </div>
                    <ul className="text-sm text-gray-700 dark:text-gray-100 space-y-1">
                        {belum.length === 0 ? (
                            <li className="italic text-gray-400 dark:text-gray-500">
                                Tidak ada
                            </li>
                        ) : (
                            belum.map((nama) => (
                                <li
                                    key={nama}
                                    className="flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-400 dark:bg-red-300"></span>
                                    {nama}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AbsensiRealtimeStatus;

import React, { useEffect, useState } from "react";
import { getAllAbsensi } from "../../api/absensi";
import {
    FaUserCheck,
    FaUserTimes,
    FaUserClock,
    FaUserAltSlash,
    FaUserTie,
    FaSync,
} from "react-icons/fa";

type Absensi = {
    status: string; // "hadir", "izin", "cuti", "telat", "pulang_cepat"
    tanggal: string;
    // ...atribut lain dari backend
};

const AbsensiSummary = () => {
    const [summary, setSummary] = useState({
        hadir: 0,
        izin: 0,
        cuti: 0,
        telat: 0,
        pulangCepat: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = (isManual = false) => {
        if (isManual) setRefreshing(true);

        getAllAbsensi()
            .then((data) => {
                // Backend response: { success: true, data: [...], count: n }
                const absensiArr = Array.isArray(data)
                    ? data
                    : data && Array.isArray(data.data)
                    ? data.data
                    : [];

                // Get today date in local timezone
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const daily = absensiArr.filter((a: Absensi) => {
                    if (!a.tanggal) return false;
                    const tanggalDate = new Date(a.tanggal);
                    return tanggalDate >= today && tanggalDate < tomorrow;
                });

                const newSummary = {
                    hadir: daily.filter((a: Absensi) => a.status === "hadir")
                        .length,
                    izin: daily.filter((a: Absensi) => a.status === "izin")
                        .length,
                    cuti: daily.filter((a: Absensi) => a.status === "cuti")
                        .length,
                    telat: daily.filter((a: Absensi) => a.status === "telat")
                        .length,
                    pulangCepat: daily.filter(
                        (a: Absensi) => a.status === "pulang_cepat",
                    ).length,
                };

                console.log("Summary - Today:", today);
                console.log("Summary - Total Absensi Today:", daily.length);
                console.log("Summary - Data:", newSummary);

                setSummary(newSummary);
                setLastUpdate(new Date());
                setLoading(false);
                setError("");
                if (isManual) setRefreshing(false);
            })
            .catch((err) => {
                console.error("Summary Error:", err);
                setError("Gagal mengambil data absensi");
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

    const data = [
        {
            label: "Hadir",
            value: summary.hadir,
            color: "bg-green-100 text-green-700 border-green-300",
            icon: <FaUserCheck className="text-green-500 text-2xl mb-1" />,
        },
        {
            label: "Izin",
            value: summary.izin,
            color: "bg-yellow-100 text-yellow-700 border-yellow-300",
            icon: <FaUserTie className="text-yellow-500 text-2xl mb-1" />,
        },
        {
            label: "Cuti",
            value: summary.cuti,
            color: "bg-blue-100 text-blue-700 border-blue-300",
            icon: <FaUserAltSlash className="text-blue-500 text-2xl mb-1" />,
        },
        {
            label: "Telat",
            value: summary.telat,
            color: "bg-red-100 text-red-700 border-red-300",
            icon: <FaUserClock className="text-red-500 text-2xl mb-1" />,
        },
        {
            label: "Pulang Cepat",
            value: summary.pulangCepat,
            color: "bg-pink-100 text-pink-700 border-pink-300",
            icon: <FaUserTimes className="text-pink-500 text-2xl mb-1" />,
        },
    ];

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="bg-white/70 dark:bg-[#232b3b]/70 backdrop-blur-md rounded-2xl shadow-lg p-6 transition-all">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Rekapitulasi Hari Ini
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Update: {lastUpdate.toLocaleTimeString("id-ID")}
                    </span>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors disabled:opacity-50"
                        title="Refresh data">
                        <FaSync
                            className={`text-xs ${
                                refreshing ? "animate-spin" : ""
                            }`}
                        />
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-6 justify-between">
                {data.map((item) => (
                    <div
                        key={item.label}
                        className={`flex flex-col items-center flex-1 min-w-[120px] max-w-[180px] border rounded-2xl py-5 px-3 shadow-md ${item.color} dark:bg-white/5 dark:border-white/10 hover:scale-105 hover:shadow-xl transition-all duration-200`}
                        style={{ backdropFilter: "blur(6px)" }}>
                        {item.icon}
                        <span className="text-3xl font-extrabold mb-1 animate-fadeIn">
                            {item.value}
                        </span>
                        <span className="text-sm font-medium tracking-wide uppercase">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AbsensiSummary;

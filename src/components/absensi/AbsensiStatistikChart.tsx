import React, { useEffect, useState } from "react";
import { getAllAbsensi } from "../../api/absensi";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";
import type { TooltipProps } from "recharts";

type Absensi = {
    tanggal: string;
    status: string;
};

// Helper: format tanggal ke "YYYY-MM-DD"
function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

type StatistikData = {
    tanggal: string;
    hadir: number;
    izin: number;
    cuti: number;
    telat: number;
    pulang_cepat: number;
};

const AbsensiStatistikChart = () => {
    const [data, setData] = useState<StatistikData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = () => {
        getAllAbsensi()
            .then((res) => {
                // Backend response: { success, data: [...], ... }
                const absensiArr = Array.isArray(res)
                    ? res
                    : res && Array.isArray(res.data)
                    ? res.data
                    : [];
                // Ambil 7 hari terakhir
                const days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return formatDate(d);
                });
                // Group by tanggal & status
                const stat: Record<
                    string,
                    {
                        hadir: number;
                        izin: number;
                        cuti: number;
                        telat: number;
                        pulang_cepat: number;
                        [key: string]: number;
                    }
                > = {};
                days.forEach((tgl) => {
                    stat[tgl] = {
                        hadir: 0,
                        izin: 0,
                        cuti: 0,
                        telat: 0,
                        pulang_cepat: 0,
                    };
                });

                absensiArr.forEach((a: Absensi) => {
                    if (!a.tanggal) return;
                    // Convert to local date string YYYY-MM-DD
                    const tanggalDate = new Date(a.tanggal);
                    const tgl = formatDate(tanggalDate);

                    if (tgl && stat[tgl] && a.status) {
                        if (stat[tgl][a.status] !== undefined)
                            stat[tgl][a.status]++;
                    }
                });
                setData(days.map((tgl) => ({ tanggal: tgl, ...stat[tgl] })));
                setLoading(false);
            })
            .catch(() => {
                setError("Gagal mengambil data statistik absensi");
                setLoading(false);
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

    if (loading)
        return (
            <div className="bg-white/70 dark:bg-[#232b3b]/70 backdrop-blur-md rounded-2xl shadow-lg p-6 h-64 flex items-center justify-center border border-gray-100 dark:border-white/10">
                <span className="text-gray-400">Loading...</span>
            </div>
        );
    if (error)
        return (
            <div className="bg-white/70 dark:bg-[#232b3b]/70 backdrop-blur-md rounded-2xl shadow-lg p-6 h-64 flex items-center justify-center border border-gray-100 dark:border-white/10">
                <span className="text-red-500">{error}</span>
            </div>
        );

    // Custom Tooltip
    interface CustomTooltipPayload {
        color: string;
        dataKey: string;
        name: string;
        value: number;
    }
    type CustomTooltipProps = {
        active?: boolean;
        payload?: CustomTooltipPayload[];
        label?: string;
    };
    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow text-xs">
                    <div className="font-semibold mb-1 text-gray-700 dark:text-gray-100">
                        {label}
                    </div>
                    {payload.map((entry: CustomTooltipPayload) => (
                        <div
                            key={entry.dataKey}
                            className="flex items-center gap-2 mb-0.5">
                            <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ background: entry.color }}></span>
                            <span className="capitalize text-gray-600 dark:text-gray-200">
                                {entry.name}:
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white/70 dark:bg-[#232b3b]/70 backdrop-blur-md rounded-2xl shadow-lg p-6 h-80 border border-gray-100 dark:border-white/10">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Grafik Statistik Kehadiran 7 Hari Terakhir
            </h3>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        strokeOpacity={0.4}
                    />
                    <XAxis
                        dataKey="tanggal"
                        fontSize={12}
                        tick={{ fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        fontSize={12}
                        tick={{ fill: "#64748b" }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                        dataKey="hadir"
                        stackId="a"
                        fill="#22c55e"
                        name="Hadir"
                        radius={[6, 6, 0, 0]}
                    />
                    <Bar
                        dataKey="izin"
                        stackId="a"
                        fill="#eab308"
                        name="Izin"
                        radius={[6, 6, 0, 0]}
                    />
                    <Bar
                        dataKey="cuti"
                        stackId="a"
                        fill="#3b82f6"
                        name="Cuti"
                        radius={[6, 6, 0, 0]}
                    />
                    <Bar
                        dataKey="telat"
                        stackId="a"
                        fill="#ef4444"
                        name="Telat"
                        radius={[6, 6, 0, 0]}
                    />
                    <Bar
                        dataKey="pulang_cepat"
                        stackId="a"
                        fill="#ec4899"
                        name="Pulang Cepat"
                        radius={[6, 6, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AbsensiStatistikChart;

import { useEffect, useState } from "react";
import { getDashboardStats } from "../../api/cabang";
import {
    FaBuilding,
    FaUsers,
    FaMapMarkerAlt,
    FaExclamationTriangle,
} from "react-icons/fa";

interface DashboardStats {
    total_cabang_active: number;
    total_cabang_inactive: number;
    total_users: number;
    total_lokasi: number;
    expiring_cabang: Array<{
        id: number;
        nama_cabang: string;
        days_remaining: number;
        subscription_end: string;
    }>;
    top_cabang: Array<{
        nama_cabang: string;
        kode_cabang: string;
        total_users: number;
    }>;
}

export default function SuperadminStats() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await getDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching superadmin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-[#1e2633] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Total Cabang Aktif */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">
                                Cabang Aktif
                            </p>
                            <p className="text-3xl font-bold mt-2">
                                {stats.total_cabang_active}
                            </p>
                            {stats.total_cabang_inactive > 0 && (
                                <p className="text-blue-100 text-xs mt-1">
                                    {stats.total_cabang_inactive} tidak aktif
                                </p>
                            )}
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <FaBuilding className="text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Total Users */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">
                                Total User
                            </p>
                            <p className="text-3xl font-bold mt-2">
                                {stats.total_users}
                            </p>
                            <p className="text-green-100 text-xs mt-1">
                                Seluruh cabang
                            </p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <FaUsers className="text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Total Lokasi */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">
                                Total Lokasi
                            </p>
                            <p className="text-3xl font-bold mt-2">
                                {stats.total_lokasi}
                            </p>
                            <p className="text-purple-100 text-xs mt-1">
                                Lokasi kantor aktif
                            </p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <FaMapMarkerAlt className="text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Cabang Akan Expired */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">
                                Akan Expired
                            </p>
                            <p className="text-3xl font-bold mt-2">
                                {stats.expiring_cabang.length}
                            </p>
                            <p className="text-orange-100 text-xs mt-1">
                                {"< 30 hari"}
                            </p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg">
                            <FaExclamationTriangle className="text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Expiring Cabang */}
                {stats.expiring_cabang.length > 0 && (
                    <div className="bg-white dark:bg-[#1e2633] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <FaExclamationTriangle className="text-orange-500" />
                            Cabang Akan Expired
                        </h3>
                        <div className="space-y-3">
                            {stats.expiring_cabang.map((cabang) => (
                                <div
                                    key={cabang.id}
                                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-100">
                                            {cabang.nama_cabang}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Expired:{" "}
                                            {new Date(
                                                cabang.subscription_end,
                                            ).toLocaleDateString("id-ID")}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                                        {cabang.days_remaining} hari
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Cabang */}
                <div className="bg-white dark:bg-[#1e2633] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Top 5 Cabang (User Terbanyak)
                    </h3>
                    <div className="space-y-3">
                        {stats.top_cabang.map((cabang, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white font-bold rounded-full text-sm">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-100">
                                            {cabang.nama_cabang}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {cabang.kode_cabang}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-full">
                                    {cabang.total_users} user
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

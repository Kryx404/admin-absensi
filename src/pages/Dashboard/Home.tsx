import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import AbsensiSummary from "../../components/absensi/AbsensiSummary";
import AbsensiStatistikChart from "../../components/absensi/AbsensiStatistikChart";
import AbsensiRealtimeStatus from "../../components/absensi/AbsensiRealtimeStatus";
import AbsensiApprovalInfo from "../../components/absensi/AbsensiApprovalInfo";
import SuperadminStats from "../../components/superadmin/SuperadminStats";

export default function Home() {
    const [userRole, setUserRole] = useState<string>("");

    useEffect(() => {
        // Get user role from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserRole(user.role || "");
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    const isSuperadmin = userRole === "superadmin";

    return (
        <>
            <PageMeta
                title={
                    isSuperadmin
                        ? "Dashboard Superadmin"
                        : "Dashboard Absensi Karyawan"
                }
                description="Dashboard utama aplikasi absensi admin."
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#151a23] dark:via-[#181f2a] dark:to-[#1e2633] py-8 px-2 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                            {isSuperadmin
                                ? "Dashboard Superadmin"
                                : "Dashboard Absensi"}
                        </h1>
                        {isSuperadmin && (
                            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                                Superadmin
                            </span>
                        )}
                    </div>

                    {isSuperadmin ? (
                        // Superadmin Dashboard
                        <div className="space-y-6">
                            <SuperadminStats />

                            {/* Still show regular stats for overview */}
                            <div className="grid grid-cols-12 gap-4 md:gap-6">
                                <div className="col-span-12">
                                    <section>
                                        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                                            Statistik Kehadiran Global
                                        </h2>
                                        <AbsensiStatistikChart />
                                    </section>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Regular Admin Dashboard
                        <div className="grid grid-cols-12 gap-4 md:gap-6">
                            <div className="col-span-12 xl:col-span-7 space-y-6">
                                <section>
                                    <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
                                        Rekapitulasi Hari Ini
                                    </h2>
                                    <AbsensiSummary />
                                </section>
                                <section>
                                    <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
                                        Statistik Kehadiran
                                    </h2>
                                    <AbsensiStatistikChart />
                                </section>
                            </div>
                            <div className="col-span-12 xl:col-span-5 space-y-6">
                                <section>
                                    <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
                                        Status Realtime
                                    </h2>
                                    <AbsensiRealtimeStatus />
                                </section>
                                <section>
                                    <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">
                                        Approval Izin/Cuti
                                    </h2>
                                    <AbsensiApprovalInfo />
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

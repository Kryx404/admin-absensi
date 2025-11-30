import PageMeta from "../../components/common/PageMeta";
import AbsensiSummary from "../../components/absensi/AbsensiSummary";
import AbsensiStatistikChart from "../../components/absensi/AbsensiStatistikChart";
import AbsensiRealtimeStatus from "../../components/absensi/AbsensiRealtimeStatus";
import AbsensiApprovalInfo from "../../components/absensi/AbsensiApprovalInfo";

export default function Home() {
    return (
        <>
            <PageMeta
                title="Dashboard Absensi Karyawan"
                description="Dashboard utama aplikasi absensi admin."
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#151a23] dark:via-[#181f2a] dark:to-[#1e2633] py-8 px-2 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                        Dashboard Absensi
                    </h1>
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
                </div>
            </div>
        </>
    );
}

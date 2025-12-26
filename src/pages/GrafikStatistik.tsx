import { useEffect, useState, useCallback } from "react";
import PageMeta from "../components/common/PageMeta";
import { getStatistikAbsensi, getStatusDistribution } from "../api/absensi";
import {
    FaCalendar,
    FaFilter,
    FaTimes,
    FaUsers,
    FaChartLine,
    FaClock,
    FaCheckCircle,
} from "react-icons/fa";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

type TrendData = {
    tanggal?: string;
    date_formatted?: string;
    month_formatted?: string;
    hadir: number;
    terlambat: number;
    pulang_cepat: number;
    tidak_hadir: number;
    total: number;
};

type EmployeeData = {
    user_id: number;
    nik: string;
    user_name: string;
    position: string;
    hadir: number;
    terlambat: number;
    pulang_cepat: number;
    tidak_hadir: number;
    total: number;
    persentase_hadir: number;
};

type DistributionData = {
    status: string;
    count: number;
    percentage: number;
};

type Summary = {
    total_karyawan: number;
    total_records: number;
    total_hadir: number;
    total_terlambat: number;
    total_pulang_cepat: number;
    total_tidak_hadir: number;
    avg_kehadiran: number;
    avg_durasi: string;
};

const COLORS = {
    hadir: "#22c55e",
    terlambat: "#eab308",
    pulang_cepat: "#f97316",
    tidak_hadir: "#ef4444",
};

interface Branch {
    id: number;
    nama_cabang: string;
}

const GrafikStatistik = () => {
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
    const [distributionData, setDistributionData] = useState<
        DistributionData[]
    >([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedCabangId, setSelectedCabangId] = useState<string>("");
    const [needSelection, setNeedSelection] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [divisi, setDivisi] = useState("");
    const [departemen, setDepartemen] = useState("");
    const [groupBy, setGroupBy] = useState<"day" | "month">("day");

    const fetchData = useCallback(
        async (cabangId?: string) => {
            setLoading(true);
            setError("");

            try {
                const params: {
                    startDate?: string;
                    endDate?: string;
                    divisi?: string;
                    departemen?: string;
                    groupBy?: "day" | "month" | "employee";
                    cabang_id?: number;
                } = {};

                if (startDate && endDate) {
                    params.startDate = startDate;
                    params.endDate = endDate;
                }
                if (divisi) params.divisi = divisi;
                if (departemen) params.departemen = departemen;
                if (cabangId) params.cabang_id = parseInt(cabangId);

                // Fetch trend data
                const trendResponse = await getStatistikAbsensi({
                    ...params,
                    groupBy: groupBy,
                });

                // Check if superadmin needs to select a branch
                if (
                    trendResponse &&
                    "needSelection" in trendResponse &&
                    trendResponse.needSelection
                ) {
                    setNeedSelection(true);
                    setBranches(trendResponse.branches || []);
                    setTrendData([]);
                    setEmployeeData([]);
                    setDistributionData([]);
                    setSummary(null);
                    setLoading(false);
                    return;
                } else {
                    setNeedSelection(false);
                }

                // Fetch employee comparison
                const employeeResponse = await getStatistikAbsensi({
                    ...params,
                    groupBy: "employee",
                });

                // Fetch distribution
                const distributionResponse = await getStatusDistribution(
                    params,
                );

                if (trendResponse.success) {
                    setTrendData(trendResponse.data || []);
                    setSummary(trendResponse.summary || null);
                }

                if (employeeResponse.success) {
                    setEmployeeData(employeeResponse.data || []);
                }

                if (distributionResponse.success) {
                    setDistributionData(distributionResponse.data || []);
                }
            } catch (err) {
                console.error("Fetch statistik error:", err);
                setError("Terjadi kesalahan saat mengambil data statistik");
            } finally {
                setLoading(false);
            }
        },
        [startDate, endDate, divisi, departemen, groupBy],
    );

    useEffect(() => {
        // Set default date range (last 30 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchData(selectedCabangId);
        }
    }, [fetchData, startDate, endDate, selectedCabangId]);

    const handleCabangChange = (cabangId: string) => {
        setSelectedCabangId(cabangId);
        fetchData(cabangId);
    };

    const handleSearch = () => {
        fetchData(selectedCabangId);
    };

    const handleResetFilter = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        setStartDate(start.toISOString().split("T")[0]);
        setEndDate(end.toISOString().split("T")[0]);
        setDivisi("");
        setDepartemen("");
        setGroupBy("day");
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
        });
    };

    const CustomTooltip = ({
        active,
        payload,
        label,
    }: {
        active?: boolean;
        payload?: Array<{
            dataKey: string;
            name: string;
            value: number;
            color: string;
        }>;
        label?: string;
    }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
                    <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        {label}
                    </div>
                    {payload.map((entry) => (
                        <div
                            key={entry.dataKey}
                            className="flex items-center gap-2 text-sm">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600 dark:text-gray-300 capitalize">
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Memuat data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!trendData.length && needSelection) {
        return (
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                            Grafik Statistik Kehadiran
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Pilih cabang untuk melihat statistik kehadiran
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="text-center mb-6">
                            <FaChartLine className="w-16 h-16 mx-auto text-blue-500 dark:text-blue-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                Pilih Cabang
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Pilih cabang untuk melihat data statistik
                            </p>
                        </div>

                        <select
                            value={selectedCabangId}
                            onChange={(e) => handleCabangChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-lg">
                            <option value="">-- Pilih Cabang --</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.nama_cabang}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Grafik Statistik Kehadiran"
                description="Visualisasi statistik kehadiran karyawan"
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#151a23] dark:via-[#181f2a] dark:to-[#1e2633] py-8 px-2 md:px-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                            Grafik Statistik Kehadiran
                        </h1>
                        {needSelection && branches.length > 0 && (
                            <select
                                value={selectedCabangId}
                                onChange={(e) =>
                                    handleCabangChange(e.target.value)
                                }
                                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="">-- Ganti Cabang --</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.nama_cabang}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <FaFilter className="text-blue-500" />
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Filter Data
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <FaCalendar className="inline mr-2" />
                                    Tanggal Mulai
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <FaCalendar className="inline mr-2" />
                                    Tanggal Akhir
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tampilkan Per
                                </label>
                                <select
                                    value={groupBy}
                                    onChange={(e) =>
                                        setGroupBy(
                                            e.target.value as "day" | "month",
                                        )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100">
                                    <option value="day">Harian</option>
                                    <option value="month">Bulanan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Divisi
                                </label>
                                <select
                                    value={divisi}
                                    onChange={(e) => setDivisi(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                    disabled>
                                    <option value="">Semua Divisi</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Departemen
                                </label>
                                <select
                                    value={departemen}
                                    onChange={(e) =>
                                        setDepartemen(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                    disabled>
                                    <option value="">Semua Departemen</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                                <FaChartLine />
                                Tampilkan Grafik
                            </button>
                            <button
                                onClick={handleResetFilter}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg font-medium transition-colors flex items-center gap-2">
                                <FaTimes />
                                Reset Filter
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-12 text-center border border-gray-100 dark:border-gray-700">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">
                                Memuat data statistik...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-12 text-center text-red-500 border border-gray-100 dark:border-gray-700">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            {summary && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Total Karyawan
                                                </p>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {summary.total_karyawan}
                                                </p>
                                            </div>
                                            <FaUsers className="text-4xl text-blue-500" />
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Total Records
                                                </p>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {summary.total_records}
                                                </p>
                                            </div>
                                            <FaChartLine className="text-4xl text-purple-500" />
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Rata-rata Kehadiran
                                                </p>
                                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {summary.avg_kehadiran}%
                                                </p>
                                            </div>
                                            <FaCheckCircle className="text-4xl text-green-500" />
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Rata-rata Durasi Kerja
                                                </p>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {summary.avg_durasi}
                                                </p>
                                            </div>
                                            <FaClock className="text-4xl text-orange-500" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Trend Chart */}
                                <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                                        Trend Kehadiran{" "}
                                        {groupBy === "day"
                                            ? "Harian"
                                            : "Bulanan"}
                                    </h3>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}>
                                        <LineChart data={trendData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e5e7eb"
                                            />
                                            <XAxis
                                                dataKey={
                                                    groupBy === "day"
                                                        ? "date_formatted"
                                                        : "month_formatted"
                                                }
                                                tickFormatter={formatDate}
                                                fontSize={12}
                                                tick={{ fill: "#64748b" }}
                                            />
                                            <YAxis
                                                fontSize={12}
                                                tick={{ fill: "#64748b" }}
                                            />
                                            <Tooltip
                                                content={<CustomTooltip />}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="hadir"
                                                stroke={COLORS.hadir}
                                                strokeWidth={2}
                                                name="Hadir"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="terlambat"
                                                stroke={COLORS.terlambat}
                                                strokeWidth={2}
                                                name="Terlambat"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="pulang_cepat"
                                                stroke={COLORS.pulang_cepat}
                                                strokeWidth={2}
                                                name="Pulang Cepat"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="tidak_hadir"
                                                stroke={COLORS.tidak_hadir}
                                                strokeWidth={2}
                                                name="Tidak Hadir"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Distribution Pie Chart */}
                                <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                                        Distribusi Status Kehadiran
                                    </h3>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}>
                                        <PieChart>
                                            <Pie
                                                data={distributionData}
                                                dataKey="count"
                                                nameKey="status"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label={(entry) =>
                                                    entry.percent
                                                        ? `${(
                                                              entry.percent *
                                                              100
                                                          ).toFixed(1)}%`
                                                        : ""
                                                }
                                                labelLine={false}>
                                                {distributionData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={
                                                                COLORS[
                                                                    entry.status as keyof typeof COLORS
                                                                ] || "#94a3b8"
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <Tooltip
                                                content={<CustomTooltip />}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Employee Comparison Bar Chart */}
                                <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 lg:col-span-2">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                                        Top 10 Karyawan Berdasarkan Persentase
                                        Kehadiran
                                    </h3>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={400}>
                                        <BarChart
                                            data={employeeData}
                                            layout="vertical"
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 100,
                                                bottom: 5,
                                            }}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e5e7eb"
                                            />
                                            <XAxis
                                                type="number"
                                                fontSize={12}
                                                tick={{ fill: "#64748b" }}
                                            />
                                            <YAxis
                                                dataKey="user_name"
                                                type="category"
                                                fontSize={12}
                                                tick={{ fill: "#64748b" }}
                                                width={90}
                                            />
                                            <Tooltip
                                                content={<CustomTooltip />}
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="persentase_hadir"
                                                fill="#22c55e"
                                                name="% Kehadiran"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default GrafikStatistik;

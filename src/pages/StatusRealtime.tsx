import { useState, useCallback, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import { getRealtimeStatus } from "../api/absensi";
import {
    FaSearch,
    FaFilter,
    FaTimes,
    FaSync,
    FaUsers,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
} from "react-icons/fa";

type RealtimeData = {
    user_id: number;
    nik: string;
    name: string;
    position: string;
    email: string;
    phone: string;
    absensi_id: number | null;
    tanggal: string | null;
    clock_in_time: string | null;
    clock_out_time: string | null;
    clock_in_photo: string | null;
    clock_in_address: string | null;
    clock_in_distance: number | null;
    status: string | null;
    keterangan: string | null;
    nama_kantor: string | null;
    current_status: string;
};

type Summary = {
    total_karyawan: number;
    sudah_absen: number;
    belum_absen: number;
    hadir: number;
    terlambat: number;
    persentase_kehadiran: number;
};

interface Branch {
    id: number;
    nama_cabang: string;
}

const StatusRealtime = () => {
    const [data, setData] = useState<RealtimeData[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [tanggal, setTanggal] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedCabangId, setSelectedCabangId] = useState<string>("");
    const [needSelection, setNeedSelection] = useState(false);

    // Filter states
    const [search, setSearch] = useState("");
    const [divisi, setDivisi] = useState("");
    const [departemen, setDepartemen] = useState("");
    const [position, setPosition] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

    // Fetch summary (without filters) - always shows all data
    const fetchSummary = useCallback(async (cabangId?: string) => {
        try {
            const params: {
                cabang_id?: number;
            } = {};

            if (cabangId) params.cabang_id = parseInt(cabangId);

            const response = await getRealtimeStatus(params);

            // Check if superadmin needs to select a branch
            if (
                response &&
                "needSelection" in response &&
                response.needSelection
            ) {
                setNeedSelection(true);
                setBranches(response.branches || []);
                setSummary(null);
                setTanggal("");
                return;
            } else {
                setNeedSelection(false);
            }

            if (response.success) {
                setSummary(response.summary || null);
                setTanggal(response.tanggal || "");
            }
        } catch (err) {
            console.error("Fetch summary error:", err);
        }
    }, []);

    // Fetch table data (with filters)
    const fetchData = useCallback(
        async (cabangId?: string) => {
            setLoading(true);
            setError("");

            try {
                const params: {
                    search?: string;
                    divisi?: string;
                    departemen?: string;
                    position?: string;
                    sortBy?: string;
                    sortOrder?: "ASC" | "DESC";
                    cabang_id?: number;
                } = {
                    sortBy,
                    sortOrder,
                };

                if (search) params.search = search;
                if (divisi) params.divisi = divisi;
                if (departemen) params.departemen = departemen;
                if (position) params.position = position;
                if (cabangId) params.cabang_id = parseInt(cabangId);

                const response = await getRealtimeStatus(params);

                // Check if superadmin needs to select a branch
                if (
                    response &&
                    "needSelection" in response &&
                    response.needSelection
                ) {
                    setNeedSelection(true);
                    setBranches(response.branches || []);
                    setData([]);
                } else {
                    setNeedSelection(false);
                    if (response.success) {
                        setData(response.data || []);
                        // Don't update summary here, keep the original summary
                    } else {
                        setError("Gagal mengambil data status realtime");
                    }
                }
            } catch (err) {
                console.error("Fetch realtime error:", err);
                setError("Terjadi kesalahan saat mengambil data");
            } finally {
                setLoading(false);
            }
        },
        [search, divisi, departemen, position, sortBy, sortOrder],
    );

    const handleCabangChange = (cabangId: string) => {
        setSelectedCabangId(cabangId);
        fetchSummary(cabangId);
        fetchData(cabangId);
    };

    const handleSearch = () => {
        fetchData(selectedCabangId);
    };

    const handleRefresh = () => {
        fetchSummary(selectedCabangId); // Refresh summary
        fetchData(selectedCabangId); // Refresh table data
    };

    const handleResetFilter = () => {
        setSearch("");
        setDivisi("");
        setDepartemen("");
        setPosition("");
        setSortBy("name");
        setSortOrder("ASC");
        setTimeout(() => fetchData(selectedCabangId), 100);
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(field);
            setSortOrder("ASC");
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchSummary(selectedCabangId); // Fetch summary once on mount
        fetchData(selectedCabangId); // Fetch table data
    }, [fetchSummary, fetchData, selectedCabangId]);

    // Fetch data when sort changes
    useEffect(() => {
        if (data.length > 0) {
            fetchData(selectedCabangId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, sortOrder]);

    // Auto refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchSummary(selectedCabangId); // Refresh summary
            fetchData(selectedCabangId); // Refresh table data
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [fetchSummary, fetchData, selectedCabangId]);

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> =
            {
                hadir: {
                    label: "Hadir",
                    className:
                        "bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-200 border-green-200 dark:border-green-600",
                },
                terlambat: {
                    label: "Terlambat",
                    className:
                        "bg-yellow-100 dark:bg-yellow-800/40 text-yellow-700 dark:text-yellow-200 border-yellow-200 dark:border-yellow-600",
                },
                pulang_cepat: {
                    label: "Pulang Cepat",
                    className:
                        "bg-orange-100 dark:bg-orange-800/40 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-600",
                },
                tidak_hadir: {
                    label: "Tidak Hadir",
                    className:
                        "bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-200 border-red-200 dark:border-red-600",
                },
                belum_absen: {
                    label: "Belum Absen",
                    className:
                        "bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600",
                },
            };

        const statusInfo = statusMap[status] || statusMap["belum_absen"];

        return (
            <span
                className={`px-2 py-1 rounded-lg text-xs font-semibold border ${statusInfo.className}`}>
                {statusInfo.label}
            </span>
        );
    };

    const formatTime = (datetime: string | null) => {
        if (!datetime) return "-";
        const date = new Date(datetime);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (date: string) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const getRowClassName = (record: RealtimeData) => {
        if (record.current_status === "terlambat") {
            return "bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20";
        }
        return "hover:bg-gray-50 dark:hover:bg-gray-800";
    };

    if (loading && !data.length) {
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

    if (!data.length && needSelection) {
        return (
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                            Status Kehadiran Realtime
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Pilih cabang untuk melihat status kehadiran realtime
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="text-center mb-6">
                            <FaUsers className="w-16 h-16 mx-auto text-blue-500 dark:text-blue-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                Pilih Cabang
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Pilih cabang untuk melihat data kehadiran
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
                title="Status Kehadiran Realtime"
                description="Monitoring kehadiran karyawan secara realtime"
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#151a23] dark:via-[#181f2a] dark:to-[#1e2633] py-8 px-2 md:px-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                                Status Kehadiran Realtime
                            </h1>
                            {tanggal && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {formatDate(tanggal)}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {needSelection && branches.length > 0 && (
                                <select
                                    value={selectedCabangId}
                                    onChange={(e) =>
                                        handleCabangChange(e.target.value)
                                    }
                                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="">-- Ganti Cabang --</option>
                                    {branches.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id}>
                                            {branch.nama_cabang}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                                <FaSync
                                    className={loading ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {summary && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                                            Sudah Absen
                                        </p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {summary.sudah_absen}
                                        </p>
                                    </div>
                                    <FaCheckCircle className="text-4xl text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Belum Absen
                                        </p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {summary.belum_absen}
                                        </p>
                                    </div>
                                    <FaTimesCircle className="text-4xl text-red-500" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Terlambat
                                        </p>
                                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                            {summary.terlambat}
                                        </p>
                                    </div>
                                    <FaClock className="text-4xl text-yellow-500" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            % Kehadiran
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {summary.persentase_kehadiran}%
                                        </p>
                                    </div>
                                    <FaCheckCircle className="text-4xl text-blue-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter Section */}
                    <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <FaFilter className="text-blue-500" />
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Filter Data
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <FaSearch className="inline mr-2" />
                                    Cari (Nama/NIK)
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Ketik nama atau NIK..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") handleSearch();
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Posisi
                                </label>
                                <input
                                    type="text"
                                    value={position}
                                    onChange={(e) =>
                                        setPosition(e.target.value)
                                    }
                                    placeholder="Cari posisi..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") handleSearch();
                                    }}
                                />
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
                                <FaSearch />
                                Cari
                            </button>
                            <button
                                onClick={handleResetFilter}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg font-medium transition-colors flex items-center gap-2">
                                <FaTimes />
                                Reset Filter
                            </button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Data Kehadiran Realtime
                            </h3>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-400">
                                    Memuat data...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center text-red-500">
                                {error}
                            </div>
                        ) : data.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                Tidak ada data karyawan
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                #
                                            </th>
                                            <th
                                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() =>
                                                    handleSort("nik")
                                                }>
                                                NIK{" "}
                                                {sortBy === "nik" &&
                                                    (sortOrder === "ASC"
                                                        ? "↑"
                                                        : "↓")}
                                            </th>
                                            <th
                                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() =>
                                                    handleSort("name")
                                                }>
                                                Nama{" "}
                                                {sortBy === "name" &&
                                                    (sortOrder === "ASC"
                                                        ? "↑"
                                                        : "↓")}
                                            </th>
                                            <th
                                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() =>
                                                    handleSort("position")
                                                }>
                                                Posisi{" "}
                                                {sortBy === "position" &&
                                                    (sortOrder === "ASC"
                                                        ? "↑"
                                                        : "↓")}
                                            </th>
                                            <th
                                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() =>
                                                    handleSort("clock_in_time")
                                                }>
                                                Waktu Check-in{" "}
                                                {sortBy === "clock_in_time" &&
                                                    (sortOrder === "ASC"
                                                        ? "↑"
                                                        : "↓")}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Lokasi
                                            </th>
                                            <th
                                                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() =>
                                                    handleSort("status")
                                                }>
                                                Status{" "}
                                                {sortBy === "status" &&
                                                    (sortOrder === "ASC"
                                                        ? "↑"
                                                        : "↓")}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Keterangan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {data.map((record, index) => (
                                            <tr
                                                key={record.user_id}
                                                className={`transition-colors ${getRowClassName(
                                                    record,
                                                )}`}>
                                                <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {record.nik}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {record.name}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {record.position}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {formatTime(
                                                        record.clock_in_time,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    <div className="max-w-xs truncate">
                                                        {record.clock_in_address ||
                                                            "-"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {getStatusBadge(
                                                        record.current_status,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {record.keterangan || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatusRealtime;

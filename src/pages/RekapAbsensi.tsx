import { useEffect, useState, useCallback } from "react";
import PageMeta from "../components/common/PageMeta";
import { getRekapAbsensi } from "../api/absensi";
import {
    FaSearch,
    FaCalendar,
    FaFilter,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaImage,
} from "react-icons/fa";

type AbsensiRecord = {
    id: number | null;
    tanggal: string | null;
    clock_in_time: string | null;
    clock_in_latitude: number | null;
    clock_in_longitude: number | null;
    clock_in_address: string | null;
    clock_in_distance: number | null;
    clock_in_photo: string | null;
    clock_out_time: string | null;
    clock_out_latitude: number | null;
    clock_out_longitude: number | null;
    clock_out_address: string | null;
    clock_out_distance: number | null;
    clock_out_photo: string | null;
    durasi_kerja: string | null;
    status: string | null;
    keterangan: string | null;
    current_status: string;
    user_id: number;
    nik: string;
    user_name: string;
    position: string;
    email: string;
    phone: string | null;
    lokasi_id: number | null;
    nama_kantor: string | null;
    alamat_kantor: string | null;
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

const RekapAbsensi = () => {
    const [data, setData] = useState<AbsensiRecord[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter states
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [search, setSearch] = useState("");
    const [divisi, setDivisi] = useState("");
    const [departemen, setDepartemen] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("tanggal");
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

    const fetchData = useCallback(
        async (page: number = 1) => {
            setLoading(true);
            setError("");

            try {
                const params: {
                    page: number;
                    limit: number;
                    sortBy: string;
                    sortOrder: "ASC" | "DESC";
                    startDate?: string;
                    endDate?: string;
                    search?: string;
                    divisi?: string;
                    departemen?: string;
                    status?: string;
                } = {
                    page,
                    limit: 25,
                    sortBy,
                    sortOrder,
                };

                if (startDate && endDate) {
                    params.startDate = startDate;
                    params.endDate = endDate;
                }

                if (search) params.search = search;
                if (divisi) params.divisi = divisi;
                if (departemen) params.departemen = departemen;
                if (statusFilter) params.status = statusFilter;

                const response = await getRekapAbsensi(params);

                if (response.success) {
                    setData(response.data || []);
                    setPagination(response.pagination);
                } else {
                    setError("Gagal mengambil data rekap absensi");
                }
            } catch (err) {
                console.error("Fetch rekap error:", err);
                setError("Terjadi kesalahan saat mengambil data");
            } finally {
                setLoading(false);
            }
        },
        [
            sortBy,
            sortOrder,
            startDate,
            endDate,
            search,
            divisi,
            departemen,
            statusFilter,
        ],
    );

    useEffect(() => {
        fetchData(1);
    }, [fetchData]);

    const handleSearch = () => {
        fetchData(1);
    };

    const handleResetFilter = () => {
        setStartDate("");
        setEndDate("");
        setSearch("");
        setDivisi("");
        setDepartemen("");
        setStatusFilter("");
        setSortBy("tanggal");
        setSortOrder("DESC");
        setTimeout(() => fetchData(1), 100);
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortBy(field);
            setSortOrder("DESC");
        }
    };

    const getStatusBadge = (status: string | null) => {
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

        const statusInfo =
            statusMap[status || "belum_absen"] || statusMap["belum_absen"];

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

    const formatDate = (date: string | null) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const formatDistance = (distance: number | null) => {
        if (!distance) return "-";
        if (distance < 1000) return `${Math.round(distance)}m`;
        return `${(distance / 1000).toFixed(2)}km`;
    };

    return (
        <>
            <PageMeta
                title="Rekap Absensi Harian/Bulanan"
                description="Laporan rekap kehadiran karyawan"
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#151a23] dark:via-[#181f2a] dark:to-[#1e2633] py-8 px-2 md:px-8">
                <div className="max-w-[1600px] mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                        Rekap Absensi Harian/Bulanan
                    </h1>

                    {/* Filter Section */}
                    <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-4">
                            <FaFilter className="text-blue-500" />
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Filter Data
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Date Range */}
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

                            {/* Search */}
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

                            {/* Divisi (prepared for future) */}
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

                            {/* Departemen (prepared for future) */}
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

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status Kehadiran
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100">
                                    <option value="">Semua Status</option>
                                    <option value="hadir">Hadir</option>
                                    <option value="terlambat">Terlambat</option>
                                    <option value="pulang_cepat">
                                        Pulang Cepat
                                    </option>
                                    <option value="tidak_hadir">
                                        Tidak Hadir
                                    </option>
                                    <option value="belum_absen">
                                        Belum Absen
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
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
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    Data Rekap Absensi
                                </h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Total: {pagination.total} data
                                </span>
                            </div>
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
                                Tidak ada data rekap absensi
                            </div>
                        ) : (
                            <>
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
                                                        handleSort("tanggal")
                                                    }>
                                                    Tanggal{" "}
                                                    {sortBy === "tanggal" &&
                                                        (sortOrder === "ASC"
                                                            ? "↑"
                                                            : "↓")}
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Check-In
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Check-Out
                                                </th>
                                                <th
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={() =>
                                                        handleSort(
                                                            "durasi_kerja",
                                                        )
                                                    }>
                                                    Durasi{" "}
                                                    {sortBy ===
                                                        "durasi_kerja" &&
                                                        (sortOrder === "ASC"
                                                            ? "↑"
                                                            : "↓")}
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
                                                    key={
                                                        record.id ||
                                                        `user-${record.user_id}`
                                                    }
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {(pagination.page - 1) *
                                                            pagination.limit +
                                                            index +
                                                            1}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {record.nik}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {record.user_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {record.position}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {formatDate(
                                                            record.tanggal,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="space-y-1 text-sm">
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                                {formatTime(
                                                                    record.clock_in_time,
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                                📍{" "}
                                                                {record.clock_in_address ||
                                                                    "-"}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                📏{" "}
                                                                {formatDistance(
                                                                    record.clock_in_distance,
                                                                )}
                                                            </div>
                                                            {record.clock_in_photo && (
                                                                <a
                                                                    href={`http://localhost:3001/${record.clock_in_photo.replace(
                                                                        "public/",
                                                                        "",
                                                                    )}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                                                    <FaImage />
                                                                    Lihat Foto
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="space-y-1 text-sm">
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                                {formatTime(
                                                                    record.clock_out_time,
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                                📍{" "}
                                                                {record.clock_out_address ||
                                                                    "-"}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                📏{" "}
                                                                {formatDistance(
                                                                    record.clock_out_distance,
                                                                )}
                                                            </div>
                                                            {record.clock_out_photo && (
                                                                <a
                                                                    href={`http://localhost:3001/${record.clock_out_photo.replace(
                                                                        "public/",
                                                                        "",
                                                                    )}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                                                    <FaImage />
                                                                    Lihat Foto
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {record.durasi_kerja ||
                                                            "-"}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {getStatusBadge(
                                                            record.current_status,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {record.keterangan ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Menampilkan{" "}
                                        {(pagination.page - 1) *
                                            pagination.limit +
                                            1}{" "}
                                        -{" "}
                                        {Math.min(
                                            pagination.page * pagination.limit,
                                            pagination.total,
                                        )}{" "}
                                        dari {pagination.total} data
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                fetchData(pagination.page - 1)
                                            }
                                            disabled={pagination.page === 1}
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                            <FaChevronLeft />
                                            Prev
                                        </button>
                                        <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                            Halaman {pagination.page} dari{" "}
                                            {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() =>
                                                fetchData(pagination.page + 1)
                                            }
                                            disabled={
                                                pagination.page ===
                                                pagination.totalPages
                                            }
                                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                            Next
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Photo Modal */}
        </>
    );
};

export default RekapAbsensi;

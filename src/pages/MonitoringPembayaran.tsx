import { useState, useEffect } from "react";
import {
    getAllPembayaran,
    verifyPembayaran,
    deletePembayaran,
    Pembayaran,
} from "../api/pembayaran";
import { getAllCabang, Cabang } from "../api/cabang";
import {
    FiCheck,
    FiX,
    FiEye,
    FiTrash2,
    FiDownload,
    FiFilter,
} from "react-icons/fi";

const MonitoringPembayaran = () => {
    const [pembayaran, setPembayaran] = useState<Pembayaran[]>([]);
    const [cabangList, setCabangList] = useState<Cabang[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedPembayaran, setSelectedPembayaran] =
        useState<Pembayaran | null>(null);
    const [verifyAction, setVerifyAction] = useState<"verified" | "rejected">(
        "verified",
    );
    const [catatan, setCatatan] = useState("");

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterCabang, setFilterCabang] = useState<string>("");
    const [filterPeriode, setFilterPeriode] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
        fetchCabang();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, filterCabang, filterPeriode]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number> = {};
            if (filterStatus) params.status = filterStatus;
            if (filterCabang) params.cabang_id = parseInt(filterCabang);
            if (filterPeriode) params.periode = filterPeriode;

            const response = await getAllPembayaran(params);
            if (response.success) {
                setPembayaran(response.data);
            }
        } catch (error) {
            console.error("Error fetching pembayaran:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCabang = async () => {
        try {
            const response = await getAllCabang();
            if (response.success) {
                setCabangList(response.data);
            }
        } catch (error) {
            console.error("Error fetching cabang:", error);
        }
    };

    const handleVerify = (
        data: Pembayaran,
        action: "verified" | "rejected",
    ) => {
        setSelectedPembayaran(data);
        setVerifyAction(action);
        setCatatan("");
        setShowModal(true);
    };

    const confirmVerify = async () => {
        if (!selectedPembayaran) return;

        try {
            setLoading(true);
            await verifyPembayaran(selectedPembayaran.id, {
                status: verifyAction,
                catatan,
            });
            setShowModal(false);
            fetchData();
            alert(
                `Pembayaran berhasil ${
                    verifyAction === "verified" ? "diverifikasi" : "ditolak"
                }`,
            );
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(
                err.response?.data?.message || "Gagal memverifikasi pembayaran",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Yakin ingin menghapus data pembayaran ini?")) return;

        try {
            await deletePembayaran(id);
            fetchData();
            alert("Pembayaran berhasil dihapus");
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || "Gagal menghapus pembayaran");
        }
    };

    const handleViewBukti = (buktiPath: string) => {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
        const url = `${API_URL}/${buktiPath}`;
        window.open(url, "_blank");
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
            verified: "bg-green-500/20 text-green-300 border-green-500/50",
            rejected: "bg-red-500/20 text-red-300 border-red-500/50",
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    const filteredData = pembayaran.filter((item) => {
        const matchSearch =
            item.nama_cabang
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            item.kode_cabang?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchSearch;
    });

    const totalPending = filteredData
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + p.jumlah, 0);

    const totalVerified = filteredData
        .filter((p) => p.status === "verified")
        .reduce((sum, p) => sum + p.jumlah, 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Monitoring Pembayaran
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kelola dan verifikasi pembayaran subscription dari semua
                        cabang
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium mb-1">
                                    Pending
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {
                                        pembayaran.filter(
                                            (p) => p.status === "pending",
                                        ).length
                                    }
                                </p>
                                <p className="text-yellow-600 dark:text-yellow-400/80 text-sm mt-1">
                                    {formatCurrency(totalPending)}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-yellow-500/20 dark:bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <FiFilter className="text-yellow-600 dark:text-yellow-300 text-2xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-700 dark:text-green-300 text-sm font-medium mb-1">
                                    Verified
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {
                                        pembayaran.filter(
                                            (p) => p.status === "verified",
                                        ).length
                                    }
                                </p>
                                <p className="text-green-600 dark:text-green-400/80 text-sm mt-1">
                                    {formatCurrency(totalVerified)}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-green-500/20 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                                <FiCheck className="text-green-600 dark:text-green-300 text-2xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-1">
                                    Total Cabang
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {cabangList.length}
                                </p>
                                <p className="text-blue-600 dark:text-blue-400/80 text-sm mt-1">
                                    {
                                        cabangList.filter(
                                            (c) => c.status === "active",
                                        ).length
                                    }{" "}
                                    Active
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-blue-500/20 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                                <FiDownload className="text-blue-600 dark:text-blue-300 text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari cabang..."
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cabang
                            </label>
                            <select
                                value={filterCabang}
                                onChange={(e) =>
                                    setFilterCabang(e.target.value)
                                }
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Semua Cabang</option>
                                {cabangList.map((cabang) => (
                                    <option key={cabang.id} value={cabang.id}>
                                        {cabang.nama_cabang}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Periode
                            </label>
                            <input
                                type="month"
                                value={filterPeriode}
                                onChange={(e) =>
                                    setFilterPeriode(e.target.value)
                                }
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Cabang
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Periode
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Jumlah
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Tgl Bayar
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Bukti
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-8 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada data pembayaran
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {item.nama_cabang}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.kode_cabang}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {new Date(
                                                    item.periode_bulan,
                                                ).toLocaleDateString("id-ID", {
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                                                {formatCurrency(item.jumlah)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {item.tanggal_bayar
                                                    ? formatDate(
                                                          item.tanggal_bayar,
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                                                        item.status,
                                                    )}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.bukti_transfer ? (
                                                    <button
                                                        onClick={() =>
                                                            handleViewBukti(
                                                                item.bukti_transfer!,
                                                            )
                                                        }
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 text-sm">
                                                        <FiEye /> Lihat
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">
                                                        No file
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {item.status ===
                                                        "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleVerify(
                                                                        item,
                                                                        "verified",
                                                                    )
                                                                }
                                                                className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-300 rounded-lg transition-colors"
                                                                title="Verifikasi">
                                                                <FiCheck />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleVerify(
                                                                        item,
                                                                        "rejected",
                                                                    )
                                                                }
                                                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-300 rounded-lg transition-colors"
                                                                title="Tolak">
                                                                <FiX />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id,
                                                            )
                                                        }
                                                        className="p-2 bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                                                        title="Hapus">
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Verify Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {verifyAction === "verified"
                                ? "Verifikasi"
                                : "Tolak"}{" "}
                            Pembayaran
                        </h3>
                        <div className="mb-4">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                Cabang:{" "}
                                <strong>
                                    {selectedPembayaran?.nama_cabang}
                                </strong>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                Jumlah:{" "}
                                <strong>
                                    {formatCurrency(
                                        selectedPembayaran?.jumlah || 0,
                                    )}
                                </strong>
                            </p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Catatan (opsional)
                            </label>
                            <textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tambahkan catatan..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors">
                                Batal
                            </button>
                            <button
                                onClick={confirmVerify}
                                disabled={loading}
                                className={`flex-1 px-4 py-2 ${
                                    verifyAction === "verified"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-red-500 hover:bg-red-600"
                                } text-white rounded-lg transition-colors disabled:opacity-50`}>
                                {loading ? "Processing..." : "Konfirmasi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonitoringPembayaran;

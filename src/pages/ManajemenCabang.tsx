import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageMeta from "../components/common/PageMeta";
import { Modal } from "../components/ui/modal";
import {
    getAllCabang,
    createCabang,
    updateCabang,
    deleteCabang,
    toggleStatusCabang,
    extendSubscription,
} from "../api/cabang";
import {
    FaBuilding,
    FaEdit,
    FaTrash,
    FaPlus,
    FaTimes,
    FaCheckCircle,
    FaTimesCircle,
    FaCalendarPlus,
    FaPowerOff,
} from "react-icons/fa";

interface Cabang {
    id: number;
    nama_cabang: string;
    kode_cabang: string;
    alamat: string;
    telepon: string;
    email: string;
    status: string;
    subscription_start: string;
    subscription_end: string;
    max_users: number;
    paket: string;
    total_users: number;
    total_lokasi: number;
    days_remaining: number;
}

export default function ManajemenCabang() {
    const [cabang, setCabang] = useState<Cabang[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [selectedCabang, setSelectedCabang] = useState<Cabang | null>(null);
    const [extendForm, setExtendForm] = useState({
        subscription_end: "",
        paket: "",
    });
    const [form, setForm] = useState({
        nama_cabang: "",
        kode_cabang: "",
        alamat: "",
        telepon: "",
        email: "",
        subscription_start: "",
        subscription_end: "",
        max_users: 50,
        paket: "basic",
    });

    useEffect(() => {
        fetchCabang();
    }, []);

    const fetchCabang = async () => {
        setLoading(true);
        try {
            const response = await getAllCabang();
            setCabang(response.data);
        } catch (err: any) {
            toast.error(err.message || "Gagal mengambil data cabang");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editId) {
                await updateCabang(editId.toString(), form);
                toast.success("Cabang berhasil diupdate!");
            } else {
                await createCabang(form);
                toast.success("Cabang berhasil ditambahkan!");
            }
            setShowForm(false);
            setEditId(null);
            setForm({
                nama_cabang: "",
                kode_cabang: "",
                alamat: "",
                telepon: "",
                email: "",
                subscription_start: "",
                subscription_end: "",
                max_users: 50,
                paket: "basic",
            });
            fetchCabang();
        } catch (err: any) {
            toast.error(err.message || "Gagal menyimpan data cabang");
        }
    };

    const handleEdit = (cab: Cabang) => {
        setEditId(cab.id);
        setForm({
            nama_cabang: cab.nama_cabang,
            kode_cabang: cab.kode_cabang,
            alamat: cab.alamat || "",
            telepon: cab.telepon || "",
            email: cab.email || "",
            subscription_start: cab.subscription_start
                ? cab.subscription_start.split("T")[0]
                : "",
            subscription_end: cab.subscription_end
                ? cab.subscription_end.split("T")[0]
                : "",
            max_users: cab.max_users,
            paket: cab.paket,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Yakin hapus cabang ini?")) return;
        try {
            await deleteCabang(id.toString());
            toast.success("Cabang berhasil dihapus!");
            fetchCabang();
        } catch (err: any) {
            toast.error(err.message || "Gagal menghapus cabang");
        }
    };

    const handleToggleStatus = async (cab: Cabang) => {
        const newStatus = cab.status === "active" ? "inactive" : "active";
        const confirmMessage =
            newStatus === "inactive"
                ? "Nonaktifkan cabang ini? Semua user di cabang ini tidak akan bisa login."
                : "Aktifkan cabang ini? User di cabang ini akan bisa login kembali.";

        if (!window.confirm(confirmMessage)) return;

        try {
            await toggleStatusCabang(cab.id, newStatus);
            toast.success(
                `Cabang berhasil ${
                    newStatus === "active" ? "diaktifkan" : "dinonaktifkan"
                }!`,
            );
            fetchCabang();
        } catch (err: any) {
            toast.error(err.message || "Gagal mengubah status cabang");
        }
    };

    const handleOpenExtendModal = (cab: Cabang) => {
        setSelectedCabang(cab);
        setExtendForm({
            subscription_end: cab.subscription_end
                ? cab.subscription_end.split("T")[0]
                : "",
            paket: cab.paket,
        });
        setShowExtendModal(true);
    };

    const handleExtendSubscription = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCabang) return;

        try {
            await extendSubscription(selectedCabang.id, {
                subscription_end: extendForm.subscription_end,
                paket: extendForm.paket || undefined,
            });
            toast.success("Subscription berhasil diperpanjang!");
            setShowExtendModal(false);
            setSelectedCabang(null);
            setExtendForm({ subscription_end: "", paket: "" });
            fetchCabang();
        } catch (err: any) {
            toast.error(err.message || "Gagal memperpanjang subscription");
        }
    };

    const handleCloseExtendModal = () => {
        setShowExtendModal(false);
        setSelectedCabang(null);
        setExtendForm({ subscription_end: "", paket: "" });
    };

    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: string } = {
            active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            inactive:
                "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
            suspended:
                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        return styles[status] || styles.inactive;
    };

    const getPaketBadge = (paket: string) => {
        const styles: { [key: string]: string } = {
            basic: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            pro: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
            enterprise:
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        };
        return styles[paket] || styles.basic;
    };

    return (
        <>
            <PageMeta title="Manajemen Cabang" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#151a23] dark:via-[#181f2a] dark:to-[#1e2633] py-8 px-2 md:px-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                            Manajemen Cabang
                        </h2>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                <FaPlus />
                                Tambah Cabang
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="mb-6 bg-white dark:bg-[#1e2633] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {editId
                                        ? "Edit Cabang"
                                        : "Tambah Cabang Baru"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditId(null);
                                        setForm({
                                            nama_cabang: "",
                                            kode_cabang: "",
                                            alamat: "",
                                            telepon: "",
                                            email: "",
                                            subscription_start: "",
                                            subscription_end: "",
                                            max_users: 50,
                                            paket: "basic",
                                        });
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nama Cabang *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.nama_cabang}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    nama_cabang: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Kode Cabang *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.kode_cabang}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    kode_cabang:
                                                        e.target.value.toUpperCase(),
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Telepon
                                        </label>
                                        <input
                                            type="text"
                                            value={form.telepon}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    telepon: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Alamat
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={form.alamat}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    alamat: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tanggal Mulai Berlangganan
                                        </label>
                                        <input
                                            type="date"
                                            value={form.subscription_start}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    subscription_start:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tanggal Akhir Berlangganan
                                        </label>
                                        <input
                                            type="date"
                                            value={form.subscription_end}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    subscription_end:
                                                        e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Maksimal User
                                        </label>
                                        <input
                                            type="number"
                                            value={form.max_users}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    max_users: parseInt(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Paket
                                        </label>
                                        <select
                                            value={form.paket}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    paket: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100">
                                            <option value="basic">Basic</option>
                                            <option value="pro">Pro</option>
                                            <option value="enterprise">
                                                Enterprise
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditId(null);
                                        }}
                                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                        {editId ? "Update" : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white dark:bg-[#1e2633] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Cabang
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Kontak
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Paket
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Users
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Expired
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : cabang.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Belum ada data cabang
                                            </td>
                                        </tr>
                                    ) : (
                                        cabang.map((cab) => (
                                            <tr
                                                key={cab.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <FaBuilding className="text-blue-500 text-xl" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                {
                                                                    cab.nama_cabang
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {
                                                                    cab.kode_cabang
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                                        {cab.email || "-"}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {cab.telepon || "-"}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaketBadge(
                                                            cab.paket,
                                                        )}`}>
                                                        {cab.paket.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-900 dark:text-gray-100">
                                                        {cab.total_users} /{" "}
                                                        {cab.max_users}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {cab.total_lokasi}{" "}
                                                        lokasi
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {cab.subscription_end ? (
                                                        <div>
                                                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                                                {new Date(
                                                                    cab.subscription_end,
                                                                ).toLocaleDateString(
                                                                    "id-ID",
                                                                )}
                                                            </p>
                                                            {cab.days_remaining <=
                                                                30 &&
                                                                cab.days_remaining >=
                                                                    0 && (
                                                                    <p className="text-xs text-orange-600 dark:text-orange-400">
                                                                        {
                                                                            cab.days_remaining
                                                                        }{" "}
                                                                        hari
                                                                        lagi
                                                                    </p>
                                                                )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getStatusBadge(
                                                            cab.status,
                                                        )}`}>
                                                        {cab.status ===
                                                        "active" ? (
                                                            <FaCheckCircle />
                                                        ) : (
                                                            <FaTimesCircle />
                                                        )}
                                                        {cab.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleOpenExtendModal(
                                                                    cab,
                                                                )
                                                            }
                                                            title="Perpanjang Subscription"
                                                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                                                            <FaCalendarPlus />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleToggleStatus(
                                                                    cab,
                                                                )
                                                            }
                                                            title={
                                                                cab.status ===
                                                                "active"
                                                                    ? "Nonaktifkan Cabang"
                                                                    : "Aktifkan Cabang"
                                                            }
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                cab.status ===
                                                                "active"
                                                                    ? "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                                                    : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                            }`}>
                                                            <FaPowerOff />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(cab)
                                                            }
                                                            title="Edit Cabang"
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    cab.id,
                                                                )
                                                            }
                                                            title="Hapus Cabang"
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                            <FaTrash />
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

                    {/* Modal Perpanjang Subscription */}
                    <Modal
                        isOpen={showExtendModal && selectedCabang !== null}
                        onClose={handleCloseExtendModal}
                        className="max-w-[500px] m-4">
                        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
                            <div className="px-2 pr-14">
                                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                                    Perpanjang Subscription
                                </h4>
                                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                                    Perpanjang masa aktif subscription cabang
                                </p>
                            </div>

                            {selectedCabang && (
                                <form
                                    className="flex flex-col"
                                    onSubmit={handleExtendSubscription}>
                                    <div className="px-2 pb-3">
                                        {/* Info Cabang */}
                                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Cabang:
                                            </p>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                {selectedCabang.nama_cabang}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Expired saat ini:{" "}
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {selectedCabang.subscription_end
                                                        ? new Date(
                                                              selectedCabang.subscription_end,
                                                          ).toLocaleDateString(
                                                              "id-ID",
                                                          )
                                                        : "-"}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="space-y-5">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Tanggal Expired Baru{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={
                                                        extendForm.subscription_end
                                                    }
                                                    onChange={(e) =>
                                                        setExtendForm({
                                                            ...extendForm,
                                                            subscription_end:
                                                                e.target.value,
                                                        })
                                                    }
                                                    required
                                                    className="w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Paket (Opsional)
                                                </label>
                                                <select
                                                    value={extendForm.paket}
                                                    onChange={(e) =>
                                                        setExtendForm({
                                                            ...extendForm,
                                                            paket: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full px-4 py-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                                                    <option value="">
                                                        Tidak Ubah Paket
                                                    </option>
                                                    <option value="basic">
                                                        Basic
                                                    </option>
                                                    <option value="pro">
                                                        Pro
                                                    </option>
                                                    <option value="enterprise">
                                                        Enterprise
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 px-2 mt-6 justify-end">
                                        <button
                                            type="button"
                                            onClick={handleCloseExtendModal}
                                            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700">
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                            <FaCalendarPlus />
                                            Perpanjang
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </Modal>
                </div>
            </div>
        </>
    );
}

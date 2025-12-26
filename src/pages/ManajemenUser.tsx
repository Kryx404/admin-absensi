import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllUsers, createUser, updateUser, deleteUser } from "../api/user";

interface User {
    id: string;
    nik: string;
    name: string;
    email: string;
    password?: string;
    position: string;
    role: string;
    phone?: string;
    address?: string;
    status?: string;
}

interface Branch {
    id: number;
    nama_cabang: string;
}

const ManajemenUser: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<Partial<User>>({});
    const [editId, setEditId] = useState<string | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedCabangId, setSelectedCabangId] = useState<string>("");
    const [needSelection, setNeedSelection] = useState(false);

    const fetchUsers = async (cabangId?: string) => {
        setLoading(true);
        try {
            const data = await getAllUsers(
                cabangId ? parseInt(cabangId) : undefined,
            );

            // Check if superadmin needs to select a branch
            if (data && "needSelection" in data && data.needSelection) {
                setNeedSelection(true);
                setBranches(data.branches || []);
                setUsers([]);
            } else {
                setNeedSelection(false);
                // Backend response: { success: true, data: [...], count: n }
                if (Array.isArray(data)) {
                    setUsers(data);
                } else if (data && Array.isArray(data.data)) {
                    setUsers(data.data);
                } else {
                    setUsers([]);
                }
            }
        } catch (e: any) {
            toast.error(e.message || "Gagal mengambil data user");
            setUsers([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCabangChange = (cabangId: string) => {
        setSelectedCabangId(cabangId);
        fetchUsers(cabangId);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await updateUser(editId, form);
                toast.success("User berhasil diupdate!");
            } else {
                await createUser(form);
                toast.success("User berhasil ditambahkan!");
            }
            setForm({});
            setEditId(null);
            fetchUsers();
        } catch (e: any) {
            toast.error(e.message || "Gagal simpan user");
        }
    };

    const handleEdit = (user: User) => {
        setForm(user);
        setEditId(user.id);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Yakin hapus user ini?")) return;
        try {
            await deleteUser(id);
            toast.success("User berhasil dihapus!");
            fetchUsers(selectedCabangId);
        } catch (e: any) {
            toast.error(e.message || "Gagal menghapus user");
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Memuat data user...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!users.length && needSelection) {
        return (
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                            Manajemen Pengguna & Hak Akses
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Pilih cabang untuk melihat dan mengelola data user
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="text-center mb-6">
                            <svg
                                className="w-16 h-16 mx-auto text-blue-500 dark:text-blue-400 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                Pilih Cabang
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Pilih cabang untuk melihat data user
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
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold mb-1">
                        Manajemen Pengguna & Hak Akses
                    </h2>
                    {users.length > 0 &&
                        users[0] &&
                        "nama_cabang" in users[0] && (
                            <p className="text-sm text-gray-600">
                                Cabang: {(users[0] as any).nama_cabang}
                            </p>
                        )}
                </div>
                {needSelection && branches.length > 0 && (
                    <select
                        value={selectedCabangId}
                        onChange={(e) => handleCabangChange(e.target.value)}
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
            <form
                onSubmit={handleSubmit}
                className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            NIK <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="nik"
                            value={form.nik || ""}
                            onChange={handleChange}
                            placeholder="Nomor Induk Karyawan"
                            className="w-full border p-2 rounded"
                            required
                            disabled={!!editId}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Nama <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="name"
                            value={form.name || ""}
                            onChange={handleChange}
                            placeholder="Nama Lengkap"
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={form.email || ""}
                            onChange={handleChange}
                            placeholder="email@example.com"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    {!editId && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={form.password || ""}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full border p-2 rounded"
                                required={!editId}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Posisi/Jabatan
                        </label>
                        <input
                            name="position"
                            value={form.position || ""}
                            onChange={handleChange}
                            placeholder="Misal: Manager, Staff, dll"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={form.role || ""}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required>
                            <option value="">Pilih Role</option>
                            <option value="admin">Admin</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            No. Telepon
                        </label>
                        <input
                            name="phone"
                            value={form.phone || ""}
                            onChange={handleChange}
                            placeholder="08xxxxxxxxxx"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                            Alamat
                        </label>
                        <input
                            name="address"
                            value={form.address || ""}
                            onChange={handleChange}
                            placeholder="Alamat lengkap"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                        {editId ? "Update User" : "Tambah User"}
                    </button>
                    {editId && (
                        <button
                            type="button"
                            onClick={() => {
                                setForm({});
                                setEditId(null);
                            }}
                            className="px-6 py-2 rounded border hover:bg-gray-100">
                            Batal
                        </button>
                    )}
                </div>
            </form>
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="border p-3 text-left">NIK</th>
                                <th className="border p-3 text-left">Nama</th>
                                <th className="border p-3 text-left">Email</th>
                                <th className="border p-3 text-left">Posisi</th>
                                <th className="border p-3 text-left">Role</th>
                                <th className="border p-3 text-left">
                                    Telepon
                                </th>
                                <th className="border p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="border p-4 text-center text-gray-500">
                                        Belum ada data user
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="border p-3">
                                            {user.nik}
                                        </td>
                                        <td className="border p-3">
                                            {user.name}
                                        </td>
                                        <td className="border p-3">
                                            {user.email || "-"}
                                        </td>
                                        <td className="border p-3">
                                            {user.position || "-"}
                                        </td>
                                        <td className="border p-3">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    user.role === "admin"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="border p-3">
                                            {user.phone || "-"}
                                        </td>
                                        <td className="border p-3">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(user)
                                                    }
                                                    className="text-blue-600 hover:text-blue-800 font-medium">
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(user.id)
                                                    }
                                                    className="text-red-600 hover:text-red-800 font-medium">
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManajemenUser;

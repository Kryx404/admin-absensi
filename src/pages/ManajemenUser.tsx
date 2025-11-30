import React, { useEffect, useState } from "react";
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

const ManajemenUser: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState<Partial<User>>({});
    const [editId, setEditId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            // Backend response: { success: true, data: [...], count: n }
            if (Array.isArray(data)) {
                setUsers(data);
            } else if (data && Array.isArray(data.data)) {
                setUsers(data.data);
            } else {
                setUsers([]);
            }
            setError("");
        } catch (e: any) {
            setError(e.message || "Gagal mengambil data user");
            setUsers([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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
            } else {
                await createUser(form);
            }
            setForm({});
            setEditId(null);
            fetchUsers();
        } catch (e: any) {
            setError(e.message || "Gagal simpan user");
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
            fetchUsers();
        } catch (e: any) {
            setError(e.message || "Gagal hapus user");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
                Manajemen Pengguna & Hak Akses
            </h2>
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
            {error && (
                <div className="text-red-500 mb-2 bg-red-50 p-3 rounded">
                    {error}
                </div>
            )}
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

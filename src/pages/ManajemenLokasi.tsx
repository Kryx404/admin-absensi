import React, { useEffect, useState } from "react";
import {
    getAllLokasi,
    createLokasi,
    updateLokasi,
    deleteLokasi,
} from "../api/lokasi";

interface Lokasi {
    id: number;
    nama_kantor: string;
    alamat: string;
    latitude: number;
    longitude: number;
    radius: number;
    is_active: boolean;
}

const ManajemenLokasi: React.FC = () => {
    const [lokasi, setLokasi] = useState<Lokasi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState<Partial<Lokasi>>({
        radius: 100,
        is_active: true,
    });
    const [editId, setEditId] = useState<number | null>(null);

    const fetchLokasi = async () => {
        setLoading(true);
        try {
            const data = await getAllLokasi();
            // Backend response: { success: true, data: [...] }
            if (Array.isArray(data)) {
                setLokasi(data);
            } else if (data && Array.isArray(data.data)) {
                setLokasi(data.data);
            } else {
                setLokasi([]);
            }
            setError("");
        } catch (e: any) {
            setError(e.message || "Gagal mengambil data lokasi");
            setLokasi([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLokasi();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            setForm({
                ...form,
                [name]: (e.target as HTMLInputElement).checked,
            });
        } else if (
            name === "latitude" ||
            name === "longitude" ||
            name === "radius"
        ) {
            setForm({ ...form, [name]: parseFloat(value) || 0 });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Mapping field ke format backend (camelCase)
            const payload = {
                namaKantor: form.nama_kantor,
                alamat: form.alamat,
                latitude: form.latitude,
                longitude: form.longitude,
                radius: form.radius || 100,
                is_active: form.is_active ?? true,
            };

            if (editId) {
                await updateLokasi(editId.toString(), payload);
            } else {
                await createLokasi(payload);
            }
            setForm({ radius: 100, is_active: true });
            setEditId(null);
            fetchLokasi();
        } catch (e: any) {
            setError(e.message || "Gagal simpan lokasi");
        }
    };

    const handleEdit = (lok: Lokasi) => {
        setForm(lok);
        setEditId(lok.id);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Yakin hapus lokasi ini?")) return;
        try {
            await deleteLokasi(id.toString());
            fetchLokasi();
        } catch (e: any) {
            setError(e.message || "Gagal hapus lokasi");
        }
    };

    const getLocationFromMap = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setForm({
                        ...form,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    alert("Gagal mendapatkan lokasi: " + error.message);
                },
            );
        } else {
            alert("Browser tidak mendukung geolocation");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Manajemen Lokasi Kantor</h2>
            <form
                onSubmit={handleSubmit}
                className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Nama Kantor <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="nama_kantor"
                            value={form.nama_kantor || ""}
                            onChange={handleChange}
                            placeholder="Contoh: Kantor Pusat"
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                            Alamat <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="alamat"
                            value={form.alamat || ""}
                            onChange={handleChange}
                            placeholder="Alamat lengkap kantor"
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            rows={2}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Latitude <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="latitude"
                            type="number"
                            step="any"
                            value={form.latitude || ""}
                            onChange={handleChange}
                            placeholder="-7.395769"
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Longitude <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="longitude"
                            type="number"
                            step="any"
                            value={form.longitude || ""}
                            onChange={handleChange}
                            placeholder="112.779663"
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Radius (meter){" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="radius"
                            type="number"
                            value={form.radius || 100}
                            onChange={handleChange}
                            placeholder="100"
                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                            required
                        />
                        <small className="text-gray-500 text-xs">
                            Jarak maksimal absensi dari titik kantor
                        </small>
                    </div>
                    <div className="flex items-center pt-6">
                        <button
                            type="button"
                            onClick={getLocationFromMap}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                            📍 Gunakan Lokasi Saat Ini
                        </button>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active ?? true}
                            onChange={handleChange}
                            className="w-4 h-4"
                        />
                        <label className="text-sm font-medium">
                            Aktif (dapat digunakan untuk absensi)
                        </label>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
                        {editId ? "Update Lokasi" : "Tambah Lokasi"}
                    </button>
                    {editId && (
                        <button
                            type="button"
                            onClick={() => {
                                setForm({ radius: 100, is_active: true });
                                setEditId(null);
                            }}
                            className="px-6 py-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700">
                            Batal
                        </button>
                    )}
                </div>
            </form>
            {error && (
                <div className="text-red-500 mb-2 bg-red-50 dark:bg-red-900/20 p-3 rounded">
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
                                <th className="border p-3 text-left">
                                    Nama Kantor
                                </th>
                                <th className="border p-3 text-left">Alamat</th>
                                <th className="border p-3 text-center">
                                    Koordinat
                                </th>
                                <th className="border p-3 text-center">
                                    Radius (m)
                                </th>
                                <th className="border p-3 text-center">
                                    Status
                                </th>
                                <th className="border p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lokasi.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="border p-4 text-center text-gray-500">
                                        Belum ada data lokasi kantor
                                    </td>
                                </tr>
                            ) : (
                                lokasi.map((lok) => (
                                    <tr
                                        key={lok.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="border p-3 font-medium">
                                            {lok.nama_kantor}
                                        </td>
                                        <td className="border p-3 text-sm">
                                            {lok.alamat}
                                        </td>
                                        <td className="border p-3 text-center text-xs">
                                            <div>{lok.latitude}</div>
                                            <div>{lok.longitude}</div>
                                        </td>
                                        <td className="border p-3 text-center">
                                            {lok.radius}m
                                        </td>
                                        <td className="border p-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    lok.is_active
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}>
                                                {lok.is_active
                                                    ? "Aktif"
                                                    : "Nonaktif"}
                                            </span>
                                        </td>
                                        <td className="border p-3">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(lok)
                                                    }
                                                    className="text-blue-600 hover:text-blue-800 font-medium">
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(lok.id)
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

export default ManajemenLokasi;

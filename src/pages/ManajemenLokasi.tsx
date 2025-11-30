import React, { useEffect, useState } from "react";
import {
    getAllLokasi,
    createLokasi,
    updateLokasi,
    deleteLokasi,
} from "../api/lokasi";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
    FaMapMarkerAlt,
    FaMap,
    FaEdit,
    FaTrash,
    FaCheckCircle,
    FaTimesCircle,
} from "react-icons/fa";

// Fix default marker icon issue in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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
    const [showMap, setShowMap] = useState(false);

    // Component untuk handle klik di map
    function LocationMarker() {
        useMapEvents({
            async click(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;

                setForm({
                    ...form,
                    latitude: lat,
                    longitude: lng,
                });

                // Reverse geocoding untuk mendapatkan alamat
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                    );
                    const data = await response.json();

                    if (data.display_name) {
                        setForm((prev) => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                            alamat: data.display_name,
                        }));
                    }
                } catch (error) {
                    console.error("Error getting address:", error);
                }
            },
        });

        return form.latitude && form.longitude ? (
            <Marker position={[form.latitude, form.longitude]} />
        ) : null;
    }

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
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                radius: Number(form.radius) || 100,
                is_active: form.is_active ?? true,
            };

            console.log("Submit payload:", payload);
            console.log("Edit ID:", editId);

            if (editId) {
                const result = await updateLokasi(editId.toString(), payload);
                console.log("Update result:", result);
            } else {
                const result = await createLokasi(payload);
                console.log("Create result:", result);
            }
            setForm({ radius: 100, is_active: true });
            setEditId(null);
            setShowMap(false);
            fetchLokasi();
        } catch (e: any) {
            console.error("Submit error:", e);
            setError(e.message || "Gagal simpan lokasi");
        }
    };

    const handleEdit = (lok: Lokasi) => {
        setForm(lok);
        setEditId(lok.id);
        setShowMap(false); // Reset map state saat edit
        // Scroll ke form
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setForm({ radius: 100, is_active: true });
        setEditId(null);
        setShowMap(false);
        setError("");
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
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    setForm({
                        ...form,
                        latitude: lat,
                        longitude: lng,
                    });

                    // Reverse geocoding untuk mendapatkan alamat
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                        );
                        const data = await response.json();

                        if (data.display_name) {
                            setForm((prev) => ({
                                ...prev,
                                latitude: lat,
                                longitude: lng,
                                alamat: data.display_name,
                            }));
                        }
                    } catch (error) {
                        console.error("Error getting address:", error);
                    }
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

            {editId && (
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                            ✏️ Mode Edit - Mengubah data lokasi
                        </span>
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className={`mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${
                    editId
                        ? "border-2 border-blue-400 dark:border-blue-600"
                        : ""
                }`}>
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
                    <div className="flex items-center pt-6 gap-2">
                        <button
                            type="button"
                            onClick={getLocationFromMap}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
                            <FaMapMarkerAlt /> Gunakan Lokasi Saat Ini
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowMap(!showMap)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
                            <FaMap /> {showMap ? "Tutup Map" : "Pilih di Map"}
                        </button>
                    </div>

                    {/* Map Picker */}
                    {showMap && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Klik pada map untuk memilih lokasi
                            </label>
                            <div
                                className="border rounded-lg overflow-hidden"
                                style={{ height: "400px" }}>
                                <MapContainer
                                    center={[
                                        form.latitude || -7.395769,
                                        form.longitude || 112.779663,
                                    ]}
                                    zoom={15}
                                    style={{ height: "100%", width: "100%" }}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    <LocationMarker />
                                </MapContainer>
                            </div>
                            {form.latitude && form.longitude && (
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Koordinat terpilih:{" "}
                                    {form.latitude.toFixed(6)},{" "}
                                    {form.longitude.toFixed(6)}
                                </div>
                            )}
                        </div>
                    )}

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
                            onClick={handleCancelEdit}
                            className="px-6 py-2 rounded border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
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
                                                className={`px-2 py-1 rounded text-xs flex items-center gap-1 justify-center ${
                                                    lok.is_active
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}>
                                                {lok.is_active ? (
                                                    <>
                                                        <FaCheckCircle /> Aktif
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaTimesCircle />{" "}
                                                        Nonaktif
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="border p-3">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(lok)
                                                    }
                                                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                                                    <FaEdit /> Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(lok.id)
                                                    }
                                                    className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                                                    <FaTrash /> Hapus
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

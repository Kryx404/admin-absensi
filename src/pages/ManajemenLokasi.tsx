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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#151a23] dark:via-[#181f2a] dark:to-[#1e2633] py-8 px-2 md:px-8">
            <div className="max-w-[1600px] mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                    Manajemen Lokasi Kantor
                </h2>

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
                    className={`mb-6 bg-white dark:bg-[#181f2a] p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 ${
                        editId ? "ring-2 ring-blue-400 dark:ring-blue-600" : ""
                    }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Nama Kantor{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="nama_kantor"
                                value={form.nama_kantor || ""}
                                onChange={handleChange}
                                placeholder="Contoh: Kantor Pusat"
                                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Alamat <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="alamat"
                                value={form.alamat || ""}
                                onChange={handleChange}
                                placeholder="Alamat lengkap kantor"
                                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                rows={2}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Latitude <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="latitude"
                                type="number"
                                step="any"
                                value={form.latitude || ""}
                                onChange={handleChange}
                                placeholder="-7.395769"
                                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Longitude{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="longitude"
                                type="number"
                                step="any"
                                value={form.longitude || ""}
                                onChange={handleChange}
                                placeholder="112.779663"
                                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Radius (meter){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                name="radius"
                                type="number"
                                value={form.radius || 100}
                                onChange={handleChange}
                                placeholder="100"
                                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                required
                            />
                            <small className="text-gray-500 dark:text-gray-400 text-xs">
                                Jarak maksimal absensi dari titik kantor
                            </small>
                        </div>
                        <div className="flex items-center pt-6 gap-2">
                            <button
                                type="button"
                                onClick={getLocationFromMap}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                <FaMapMarkerAlt /> Gunakan Lokasi Saat Ini
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowMap(!showMap)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                <FaMap />{" "}
                                {showMap ? "Tutup Map" : "Pilih di Map"}
                            </button>
                        </div>

                        {/* Map Picker */}
                        {showMap && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Klik pada map untuk memilih lokasi
                                </label>
                                <div
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                                    style={{ height: "400px" }}>
                                    <MapContainer
                                        center={[
                                            form.latitude || -7.395769,
                                            form.longitude || 112.779663,
                                        ]}
                                        zoom={15}
                                        style={{
                                            height: "100%",
                                            width: "100%",
                                        }}>
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
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                            />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Aktif (dapat digunakan untuk absensi)
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            {editId ? "Update Lokasi" : "Tambah Lokasi"}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors">
                                Batal
                            </button>
                        )}
                    </div>
                </form>
                {error && (
                    <div className="text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                            Memuat data...
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="border-b border-gray-200 dark:border-gray-700 p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Nama Kantor
                                        </th>
                                        <th className="border-b border-gray-200 dark:border-gray-700 p-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Alamat
                                        </th>
                                        <th className="border-b border-gray-200 dark:border-gray-700 p-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Koordinat
                                        </th>
                                        <th className="border-b border-gray-200 dark:border-gray-700 p-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Radius (m)
                                        </th>
                                        <th className="border-b border-gray-200 dark:border-gray-700 p-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="border-b border-gray-200 dark:border-gray-700 p-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {lokasi.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                Belum ada data lokasi kantor
                                            </td>
                                        </tr>
                                    ) : (
                                        lokasi.map((lok) => (
                                            <tr
                                                key={lok.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
                                                    {lok.nama_kantor}
                                                </td>
                                                <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {lok.alamat}
                                                </td>
                                                <td className="p-3 text-center text-xs text-gray-600 dark:text-gray-400">
                                                    <div>{lok.latitude}</div>
                                                    <div>{lok.longitude}</div>
                                                </td>
                                                <td className="p-3 text-center text-gray-700 dark:text-gray-300">
                                                    {lok.radius}m
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                                                            lok.is_active
                                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-700"
                                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700"
                                                        }`}>
                                                        {lok.is_active ? (
                                                            <>
                                                                <FaCheckCircle />{" "}
                                                                Aktif
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaTimesCircle />{" "}
                                                                Nonaktif
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(lok)
                                                            }
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
                                                            <FaEdit /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    lok.id,
                                                                )
                                                            }
                                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium flex items-center gap-1 transition-colors">
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManajemenLokasi;

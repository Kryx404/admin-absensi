import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    getPengaturan,
    updatePengaturan,
    PengaturanCabang,
    JamKerja,
} from "../api/pengaturan";

const Settings = () => {
    const [pengaturan, setPengaturan] = useState<PengaturanCabang | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const days = [
        { key: "senin", label: "Senin" },
        { key: "selasa", label: "Selasa" },
        { key: "rabu", label: "Rabu" },
        { key: "kamis", label: "Kamis" },
        { key: "jumat", label: "Jumat" },
        { key: "sabtu", label: "Sabtu" },
        { key: "minggu", label: "Minggu" },
    ];

    useEffect(() => {
        loadPengaturan();
    }, []);

    const loadPengaturan = async () => {
        try {
            setLoading(true);
            const data = await getPengaturan();
            setPengaturan(data);
        } catch (err) {
            toast.error("Gagal memuat pengaturan");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJamKerjaChange = (
        day: string,
        field: "mulai" | "selesai",
        value: string,
    ) => {
        if (!pengaturan) return;

        setPengaturan({
            ...pengaturan,
            jam_kerja: {
                ...pengaturan.jam_kerja,
                [day]: pengaturan.jam_kerja[
                    day as keyof typeof pengaturan.jam_kerja
                ]
                    ? {
                          ...(pengaturan.jam_kerja[
                              day as keyof typeof pengaturan.jam_kerja
                          ] as JamKerja),
                          [field]: value,
                      }
                    : { mulai: "08:00", selesai: "17:00", [field]: value },
            },
        });
    };

    const handleLiburChange = (day: string, isLibur: boolean) => {
        if (!pengaturan) return;

        setPengaturan({
            ...pengaturan,
            jam_kerja: {
                ...pengaturan.jam_kerja,
                [day]: isLibur ? null : { mulai: "08:00", selesai: "17:00" },
            },
        });
    };

    const handleToleranceChange = (value: number) => {
        if (!pengaturan) return;
        setPengaturan({
            ...pengaturan,
            toleransi_keterlambatan: value,
        });
    };

    const handleNotifChange = (
        field:
            | "notif_reminder_absen"
            | "notif_keterlambatan"
            | "notif_approval",
        value: boolean,
    ) => {
        if (!pengaturan) return;
        setPengaturan({
            ...pengaturan,
            [field]: value,
        });
    };

    const handleSave = async () => {
        if (!pengaturan) return;

        try {
            setSaving(true);

            await updatePengaturan({
                jam_kerja: pengaturan.jam_kerja,
                toleransi_keterlambatan: pengaturan.toleransi_keterlambatan,
                notif_reminder_absen: pengaturan.notif_reminder_absen,
                notif_keterlambatan: pengaturan.notif_keterlambatan,
                notif_approval: pengaturan.notif_approval,
            });

            toast.success("Pengaturan berhasil disimpan!");
        } catch (err) {
            toast.error("Gagal menyimpan pengaturan");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Memuat pengaturan...</div>
            </div>
        );
    }

    if (!pengaturan) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-500">
                    Pengaturan tidak ditemukan
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Pengaturan Sistem
                </h1>
                {pengaturan.nama_cabang && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Cabang: {pengaturan.nama_cabang}
                    </p>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {successMessage}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Jam Kerja
                </h2>

                <div className="space-y-4">
                    {days.map((day) => {
                        const jamKerja =
                            pengaturan.jam_kerja[
                                day.key as keyof typeof pengaturan.jam_kerja
                            ];
                        const isLibur = jamKerja === null;

                        return (
                            <div
                                key={day.key}
                                className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded">
                                <div className="w-24">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {day.label}
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={isLibur}
                                        onChange={(e) =>
                                            handleLiburChange(
                                                day.key,
                                                e.target.checked,
                                            )
                                        }
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Libur
                                    </span>
                                </div>

                                {!isLibur && jamKerja && (
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-600 dark:text-gray-400">
                                                Mulai:
                                            </label>
                                            <input
                                                type="time"
                                                value={jamKerja.mulai}
                                                onChange={(e) =>
                                                    handleJamKerjaChange(
                                                        day.key,
                                                        "mulai",
                                                        e.target.value,
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-600 dark:text-gray-400">
                                                Selesai:
                                            </label>
                                            <input
                                                type="time"
                                                value={jamKerja.selesai}
                                                onChange={(e) =>
                                                    handleJamKerjaChange(
                                                        day.key,
                                                        "selesai",
                                                        e.target.value,
                                                    )
                                                }
                                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Toleransi Keterlambatan
                </h2>

                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        value={pengaturan.toleransi_keterlambatan}
                        onChange={(e) =>
                            handleToleranceChange(parseInt(e.target.value))
                        }
                        min="0"
                        max="60"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-24"
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                        menit
                    </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Batas waktu keterlambatan yang masih diperbolehkan sebelum
                    dianggap terlambat
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Notifikasi
                </h2>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={pengaturan.notif_reminder_absen}
                            onChange={(e) =>
                                handleNotifChange(
                                    "notif_reminder_absen",
                                    e.target.checked,
                                )
                            }
                            className="w-4 h-4"
                        />
                        <label className="text-gray-700 dark:text-gray-300">
                            Reminder Absen (notifikasi pengingat untuk absen)
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={pengaturan.notif_keterlambatan}
                            onChange={(e) =>
                                handleNotifChange(
                                    "notif_keterlambatan",
                                    e.target.checked,
                                )
                            }
                            className="w-4 h-4"
                        />
                        <label className="text-gray-700 dark:text-gray-300">
                            Notifikasi Keterlambatan (notifikasi saat karyawan
                            terlambat)
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={pengaturan.notif_approval}
                            onChange={(e) =>
                                handleNotifChange(
                                    "notif_approval",
                                    e.target.checked,
                                )
                            }
                            className="w-4 h-4"
                        />
                        <label className="text-gray-700 dark:text-gray-300">
                            Notifikasi Approval (notifikasi untuk persetujuan
                            absensi)
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                    {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
            </div>
        </div>
    );
};

export default Settings;

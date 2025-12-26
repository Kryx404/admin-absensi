import { useState, useEffect } from "react";
import {
    getPengaturan,
    updatePengaturan,
    PengaturanCabang,
    JamKerja,
} from "../api/pengaturan";

const PengaturanSistem = () => {
    const [pengaturan, setPengaturan] = useState<PengaturanCabang | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
            setError(null);
            const data = await getPengaturan();
            setPengaturan(data);
        } catch (err) {
            setError("Gagal memuat pengaturan");
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
            setError(null);
            setSuccessMessage(null);

            await updatePengaturan({
                jam_kerja: pengaturan.jam_kerja,
                toleransi_keterlambatan: pengaturan.toleransi_keterlambatan,
                notif_reminder_absen: pengaturan.notif_reminder_absen,
                notif_keterlambatan: pengaturan.notif_keterlambatan,
                notif_approval: pengaturan.notif_approval,
            });

            setSuccessMessage("Pengaturan berhasil disimpan!");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError("Gagal menyimpan pengaturan");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Memuat pengaturan...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!pengaturan) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-red-500 text-lg">
                            Pengaturan tidak ditemukan
                        </p>
                        <button
                            onClick={loadPengaturan}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Pengaturan Sistem
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Konfigurasi pengaturan aplikasi absensi
                    </p>
                    {pengaturan.nama_cabang && (
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                            {pengaturan.nama_cabang}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg flex items-start">
                        <svg
                            className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div>
                            <p className="font-medium">Error</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg flex items-start">
                        <svg
                            className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div>
                            <p className="font-medium">Berhasil</p>
                            <p className="text-sm mt-1">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Jam Kerja Section */}
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm mb-6">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                            <svg
                                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Jam Kerja
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Atur jam mulai dan selesai untuk setiap hari
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {days.map((day) => {
                            const jamKerja =
                                pengaturan.jam_kerja[
                                    day.key as keyof typeof pengaturan.jam_kerja
                                ];
                            const isLibur = jamKerja === null;

                            return (
                                <div
                                    key={day.key}
                                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="w-28">
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
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
                                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
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
                                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Toleransi Keterlambatan Section */}
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm mb-6">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-3">
                            <svg
                                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Toleransi Keterlambatan
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Waktu toleransi sebelum dianggap terlambat
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={pengaturan.toleransi_keterlambatan}
                            onChange={(e) =>
                                handleToleranceChange(parseInt(e.target.value))
                            }
                            min="0"
                            max="120"
                            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32 text-center text-lg font-semibold focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                        />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                            menit
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                        Karyawan yang clock-in dalam toleransi ini akan tetap
                        dianggap tepat waktu
                    </p>
                </div>

                {/* Notifikasi Section */}
                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm mb-6">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                            <svg
                                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Pengaturan Notifikasi
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Aktifkan atau nonaktifkan notifikasi sistem
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <input
                                type="checkbox"
                                checked={pengaturan.notif_reminder_absen}
                                onChange={(e) =>
                                    handleNotifChange(
                                        "notif_reminder_absen",
                                        e.target.checked,
                                    )
                                }
                                className="w-5 h-5 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <div className="flex-1">
                                <label className="text-gray-900 dark:text-gray-100 font-medium cursor-pointer">
                                    Reminder Absen
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Kirim pengingat kepada karyawan untuk
                                    melakukan absensi
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <input
                                type="checkbox"
                                checked={pengaturan.notif_keterlambatan}
                                onChange={(e) =>
                                    handleNotifChange(
                                        "notif_keterlambatan",
                                        e.target.checked,
                                    )
                                }
                                className="w-5 h-5 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <div className="flex-1">
                                <label className="text-gray-900 dark:text-gray-100 font-medium cursor-pointer">
                                    Notifikasi Keterlambatan
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Kirim notifikasi ketika karyawan terlambat
                                    masuk kerja
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <input
                                type="checkbox"
                                checked={pengaturan.notif_approval}
                                onChange={(e) =>
                                    handleNotifChange(
                                        "notif_approval",
                                        e.target.checked,
                                    )
                                }
                                className="w-5 h-5 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <div className="flex-1">
                                <label className="text-gray-900 dark:text-gray-100 font-medium cursor-pointer">
                                    Notifikasi Approval
                                </label>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Kirim notifikasi untuk persetujuan izin dan
                                    cuti karyawan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={loadPengaturan}
                        disabled={saving}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                        {saving ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                Simpan Pengaturan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PengaturanSistem;

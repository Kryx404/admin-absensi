import { useEffect, useState, useCallback } from "react";
import PageMeta from "../components/common/PageMeta";
import { getRekapAbsensi } from "../api/absensi";
import {
    FaSearch,
    FaCalendar,
    FaFilter,
    FaTimes,
    FaFileExcel,
    FaFilePdf,
    FaDownload,
} from "react-icons/fa";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type AbsensiRecord = {
    id: number | null;
    tanggal: string | null;
    clock_in_time: string | null;
    clock_out_time: string | null;
    durasi_kerja: string | null;
    status: string | null;
    keterangan: string | null;
    current_status: string;
    user_id: number;
    nik: string;
    user_name: string;
    position: string;
    nama_kantor: string | null;
    alamat_kantor: string | null;
};

interface Branch {
    id: number;
    nama_cabang: string;
}

const ExportData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dataCount, setDataCount] = useState(0);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedCabangId, setSelectedCabangId] = useState<string>("");
    const [needSelection, setNeedSelection] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
    );
    const [endDate, setEndDate] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [search, setSearch] = useState("");
    const [divisi, setDivisi] = useState("");
    const [departemen, setDepartemen] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Fetch data count for preview
    const fetchDataCount = useCallback(
        async (cabangId?: string) => {
            try {
                const params: any = {
                    page: 1,
                    limit: 1,
                    startDate,
                    endDate,
                };

                if (search) params.search = search;
                if (divisi) params.divisi = divisi;
                if (departemen) params.departemen = departemen;
                if (statusFilter) params.status = statusFilter;
                if (cabangId) params.cabang_id = parseInt(cabangId);

                const response = await getRekapAbsensi(params);

                // Check if superadmin needs to select a branch
                if (
                    response &&
                    "needSelection" in response &&
                    response.needSelection
                ) {
                    setNeedSelection(true);
                    setBranches(response.branches || []);
                    setDataCount(0);
                    return;
                } else {
                    setNeedSelection(false);
                }

                setDataCount(response.pagination.total);
            } catch (error) {
                console.error("Error fetching data count:", error);
                setDataCount(0);
            }
        },
        [startDate, endDate, search, divisi, departemen, statusFilter],
    );

    useEffect(() => {
        fetchDataCount(selectedCabangId);
    }, [fetchDataCount, selectedCabangId]);

    // Fetch all data for export
    const fetchAllData = async (
        cabangId?: string,
    ): Promise<AbsensiRecord[]> => {
        const params: any = {
            page: 1,
            limit: 10000, // Get all data
            sortBy: "tanggal",
            sortOrder: "DESC",
            startDate,
            endDate,
        };

        if (search) params.search = search;
        if (divisi) params.divisi = divisi;
        if (departemen) params.departemen = departemen;
        if (statusFilter) params.status = statusFilter;
        if (cabangId) params.cabang_id = parseInt(cabangId);

        const response = await getRekapAbsensi(params);
        return response.data;
    };

    // Format date for display
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Format time for display
    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return "-";
        return timeStr;
    };

    // Get status badge text
    const getStatusText = (status: string | null) => {
        if (!status) return "Belum Absen";
        const statusMap: { [key: string]: string } = {
            hadir: "Hadir",
            izin: "Izin",
            sakit: "Sakit",
            cuti: "Cuti",
            alpa: "Alpa",
            belum_absen: "Belum Absen",
        };
        return statusMap[status] || status;
    };

    // Export to Excel
    const exportToExcel = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await fetchAllData(selectedCabangId);

            if (data.length === 0) {
                setError("Tidak ada data untuk di-export");
                setLoading(false);
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Rekap Absensi");

            // Add header with company info
            worksheet.mergeCells("A1:J1");
            const titleCell = worksheet.getCell("A1");
            titleCell.value = "REKAP DATA ABSENSI";
            titleCell.font = { size: 16, bold: true };
            titleCell.alignment = { horizontal: "center", vertical: "middle" };

            worksheet.mergeCells("A2:J2");
            const periodCell = worksheet.getCell("A2");
            periodCell.value = `Periode: ${formatDate(
                startDate,
            )} - ${formatDate(endDate)}`;
            periodCell.font = { size: 12 };
            periodCell.alignment = { horizontal: "center", vertical: "middle" };

            // Add empty row
            worksheet.addRow([]);

            // Add column headers
            const headerRow = worksheet.addRow([
                "No",
                "NIK",
                "Nama",
                "Posisi",
                "Tanggal",
                "Check In",
                "Check Out",
                "Durasi Kerja",
                "Lokasi Kantor",
                "Status",
            ]);

            // Style header row
            headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
            headerRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF4472C4" },
            };
            headerRow.alignment = { horizontal: "center", vertical: "middle" };
            headerRow.height = 25;

            // Add data rows
            data.forEach((record, index) => {
                const row = worksheet.addRow([
                    index + 1,
                    record.nik,
                    record.user_name,
                    record.position || "-",
                    formatDate(record.tanggal),
                    formatTime(record.clock_in_time),
                    formatTime(record.clock_out_time),
                    record.durasi_kerja || "-",
                    record.nama_kantor || "-",
                    getStatusText(record.status),
                ]);

                // Alternate row colors
                if (index % 2 === 0) {
                    row.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFF2F2F2" },
                    };
                }

                row.alignment = { vertical: "middle" };
            });

            // Set column widths
            worksheet.columns = [
                { key: "no", width: 5 },
                { key: "nik", width: 15 },
                { key: "nama", width: 25 },
                { key: "posisi", width: 20 },
                { key: "tanggal", width: 15 },
                { key: "checkin", width: 12 },
                { key: "checkout", width: 12 },
                { key: "durasi", width: 15 },
                { key: "lokasi", width: 30 },
                { key: "status", width: 15 },
            ];

            // Add borders to all cells
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber >= 4) {
                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                        };
                    });
                }
            });

            // Generate filename
            const filename = `Rekap_Absensi_${startDate}_to_${endDate}.xlsx`;

            // Download file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);

            setLoading(false);
        } catch (err: any) {
            console.error("Export Excel error:", err);
            setError(err.message || "Gagal export ke Excel");
            setLoading(false);
        }
    };

    // Export to PDF
    const exportToPDF = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await fetchAllData(selectedCabangId);

            if (data.length === 0) {
                setError("Tidak ada data untuk di-export");
                setLoading(false);
                return;
            }

            const doc = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4",
            });

            // Add header
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text(
                "REKAP DATA ABSENSI",
                doc.internal.pageSize.getWidth() / 2,
                15,
                {
                    align: "center",
                },
            );

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(
                `Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`,
                doc.internal.pageSize.getWidth() / 2,
                22,
                { align: "center" },
            );

            // Prepare table data
            const tableData = data.map((record, index) => [
                index + 1,
                record.nik,
                record.user_name,
                record.position || "-",
                formatDate(record.tanggal),
                formatTime(record.clock_in_time),
                formatTime(record.clock_out_time),
                record.durasi_kerja || "-",
                record.nama_kantor || "-",
                getStatusText(record.status),
            ]);

            // Add table
            autoTable(doc, {
                head: [
                    [
                        "No",
                        "NIK",
                        "Nama",
                        "Posisi",
                        "Tanggal",
                        "Check In",
                        "Check Out",
                        "Durasi",
                        "Lokasi",
                        "Status",
                    ],
                ],
                body: tableData,
                startY: 28,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [68, 114, 196],
                    textColor: 255,
                    fontStyle: "bold",
                    halign: "center",
                },
                alternateRowStyles: {
                    fillColor: [242, 242, 242],
                },
                columnStyles: {
                    0: { cellWidth: 10, halign: "center" },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 20, halign: "center" },
                    5: { cellWidth: 18, halign: "center" },
                    6: { cellWidth: 18, halign: "center" },
                    7: { cellWidth: 20, halign: "center" },
                    8: { cellWidth: 40 },
                    9: { cellWidth: 20, halign: "center" },
                },
                margin: { left: 10, right: 10 },
            });

            // Generate filename
            const filename = `Rekap_Absensi_${startDate}_to_${endDate}.pdf`;

            // Download file
            doc.save(filename);

            setLoading(false);
        } catch (err: any) {
            console.error("Export PDF error:", err);
            setError(err.message || "Gagal export ke PDF");
            setLoading(false);
        }
    };

    const handleCabangChange = (cabangId: string) => {
        setSelectedCabangId(cabangId);
        fetchDataCount(cabangId);
    };

    const handleReset = () => {
        setStartDate(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
        );
        setEndDate(new Date().toISOString().split("T")[0]);
        setSearch("");
        setDivisi("");
        setDepartemen("");
        setStatusFilter("");
    };

    if (loading && dataCount === 0) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Memuat data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (dataCount === 0 && needSelection) {
        return (
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                            Export Data Absensi
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Pilih cabang untuk mengekspor data absensi
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md border border-gray-200 dark:border-gray-700">
                        <div className="text-center mb-6">
                            <FaDownload className="w-16 h-16 mx-auto text-blue-500 dark:text-blue-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                Pilih Cabang
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Pilih cabang untuk mengekspor data
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
        <>
            <PageMeta
                title="Export Data Absensi"
                description="Ekspor data rekap absensi ke format Excel atau PDF"
            />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#151a23] dark:via-[#181f2a] dark:to-[#1e2633]">
                <div className="p-4 md:p-8 space-y-6">
                    {/* Header */}
                    <div className="bg-white dark:bg-[#1e2633] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                    Export Data Absensi
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Ekspor data rekap absensi ke format Excel
                                    atau PDF
                                </p>
                            </div>
                            {needSelection && branches.length > 0 && (
                                <select
                                    value={selectedCabangId}
                                    onChange={(e) =>
                                        handleCabangChange(e.target.value)
                                    }
                                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="">-- Ganti Cabang --</option>
                                    {branches.map((branch) => (
                                        <option
                                            key={branch.id}
                                            value={branch.id}>
                                            {branch.nama_cabang}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Filter Section */}
                    <div className="bg-white dark:bg-[#1e2633] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaFilter className="text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Filter Data
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
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
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>

                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <FaSearch className="inline mr-2" />
                                    Cari NIK/Nama
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari berdasarkan NIK atau nama..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100">
                                    <option value="">Semua Status</option>
                                    <option value="hadir">Hadir</option>
                                    <option value="izin">Izin</option>
                                    <option value="sakit">Sakit</option>
                                    <option value="cuti">Cuti</option>
                                    <option value="alpa">Alpa</option>
                                    <option value="belum_absen">
                                        Belum Absen
                                    </option>
                                </select>
                            </div>

                            {/* Reset Button */}
                            <div className="flex items-end">
                                <button
                                    onClick={handleReset}
                                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                    <FaTimes />
                                    Reset Filter
                                </button>
                            </div>
                        </div>

                        {/* Data Count Preview */}
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>{dataCount}</strong> data akan di-export
                                berdasarkan filter yang dipilih
                            </p>
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="bg-white dark:bg-[#1e2633] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaDownload className="text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Pilih Format Export
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Export to Excel */}
                            <button
                                onClick={exportToExcel}
                                disabled={loading || dataCount === 0}
                                className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                                <FaFileExcel className="text-2xl" />
                                <div className="text-left">
                                    <div className="font-semibold">
                                        Export ke Excel
                                    </div>
                                    <div className="text-sm opacity-90">
                                        Format: .xlsx
                                    </div>
                                </div>
                            </button>

                            {/* Export to PDF */}
                            <button
                                onClick={exportToPDF}
                                disabled={loading || dataCount === 0}
                                className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                                <FaFilePdf className="text-2xl" />
                                <div className="text-left">
                                    <div className="font-semibold">
                                        Export ke PDF
                                    </div>
                                    <div className="text-sm opacity-90">
                                        Format: .pdf
                                    </div>
                                </div>
                            </button>
                        </div>

                        {loading && (
                            <div className="mt-4 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    Sedang memproses export...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ExportData;

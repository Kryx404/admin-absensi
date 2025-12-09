const Bantuan = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Bantuan & Panduan
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Dokumentasi dan tutorial penggunaan aplikasi
                </p>

                <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                        Halaman ini akan berisi dokumentasi seperti:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-4 space-y-2">
                        <li>Cara menambah user baru</li>
                        <li>Cara mengatur lokasi kantor</li>
                        <li>Cara approval izin/cuti</li>
                        <li>Cara membaca laporan absensi</li>
                        <li>Cara export data</li>
                        <li>FAQ (Frequently Asked Questions)</li>
                        <li>Video tutorial</li>
                        <li>Troubleshooting umum</li>
                    </ul>
                    <div className="mt-6 text-yellow-400">
                        🚧 Under Construction - Coming Soon
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bantuan;

const BackupData = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-2">
                    Backup Data
                </h1>
                <p className="text-gray-400 mb-8">
                    Export dan backup seluruh data aplikasi
                </p>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
                    <p className="text-gray-300">
                        Halaman ini akan menyediakan fitur backup seperti:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 mt-4 space-y-2">
                        <li>Backup database lengkap (SQL dump)</li>
                        <li>Export semua data user</li>
                        <li>Export semua data absensi</li>
                        <li>Backup file bukti transfer & foto absen</li>
                        <li>Jadwal backup otomatis</li>
                        <li>Restore dari backup</li>
                    </ul>
                    <div className="mt-6 text-yellow-400">
                        🚧 Under Construction - Coming Soon
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupData;

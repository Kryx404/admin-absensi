const TentangAplikasi = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-2">
                    Tentang Aplikasi
                </h1>
                <p className="text-gray-400 mb-8">
                    Informasi versi dan aplikasi
                </p>

                <div className="space-y-6">
                    {/* App Info */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Sistem Absensi Multi-Tenant
                        </h2>
                        <div className="space-y-3 text-gray-300">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Versi:</span>
                                <span className="font-semibold">
                                    1.0.0 Beta
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Rilis:</span>
                                <span>Desember 2024</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">
                                    Developer:
                                </span>
                                <span>Your Company Name</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Lisensi:</span>
                                <span>Commercial</span>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">
                            Fitur Utama
                        </h3>
                        <ul className="list-disc list-inside text-gray-400 space-y-2">
                            <li>Absensi dengan selfie & GPS</li>
                            <li>Multi-tenant / Multi-cabang</li>
                            <li>Manajemen user & hak akses</li>
                            <li>Laporan & statistik lengkap</li>
                            <li>Export Excel & PDF</li>
                            <li>Monitoring pembayaran (Superadmin)</li>
                            <li>Notifikasi real-time</li>
                        </ul>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">
                            Technology Stack
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-gray-300">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">
                                    Frontend
                                </p>
                                <p>React 18 + TypeScript</p>
                                <p>Vite + Tailwind CSS</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">
                                    Backend
                                </p>
                                <p>Node.js + Express</p>
                                <p>MySQL Database</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">
                                    Mobile
                                </p>
                                <p>React Native + Expo</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">
                                    Libraries
                                </p>
                                <p>ExcelJS, jsPDF</p>
                                <p>React Router, Axios</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">
                            Hubungi Kami
                        </h3>
                        <div className="space-y-2 text-gray-300">
                            <p>📧 Email: support@yourdomain.com</p>
                            <p>📱 WhatsApp: +62 XXX XXXX XXXX</p>
                            <p>🌐 Website: www.yourdomain.com</p>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-center text-gray-400 text-sm">
                        <p>© 2024 Your Company Name. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TentangAplikasi;

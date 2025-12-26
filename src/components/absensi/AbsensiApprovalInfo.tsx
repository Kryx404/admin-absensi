import React from "react";

const AbsensiApprovalInfo = () => {
    // Dummy data, replace with real data from API/state
    const waiting = [
        { nama: "Rina", jenis: "Izin" },
        { nama: "Dewi", jenis: "Cuti" },
    ];
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">
                Approval Izin & Cuti
            </h3>
            {waiting.length === 0 ? (
                <div className="text-gray-400 dark:text-gray-500">
                    Tidak ada pengajuan menunggu approval.
                </div>
            ) : (
                <ul className="text-sm text-gray-700 dark:text-gray-200">
                    {waiting.map((item, idx) => (
                        <li key={idx}>
                            <span className="font-bold">{item.nama}</span> -{" "}
                            {item.jenis}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AbsensiApprovalInfo;

import React, { useState } from 'react';
import axios from 'axios';

const PermintaanShow = ({ permintaan, project, projectprogresses, logAktivitas, userPermissions }) => {
    const [expandedStep, setExpandedStep] = useState(null);
    const [constrainData, setConstrainData] = useState({});

    // Fungsi untuk mengonfirmasi tahapan
    const handleConfirmStep = async (projectprogressId) => {
        try {
            const response = await axios.post(`/permintaan/${permintaan.id}/confirm-step`, {
                projectprogressId,
            });
            alert(response.data.message);
            // Refresh halaman atau update state jika diperlukan
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengonfirmasi tahapan.');
        }
    };

    // Fungsi untuk mengedit constrain (contoh sederhana)
    const handleEditConstrain = async (constrainId, projectprogressId) => {
        try {
            const response = await axios.post(`/permintaan/${permintaan.id}/edit-constrain/${constrainId}`, {
                constrain_type: constrainData[constrainId]?.type || 'default_type',
                status: 'fulfilled', // Status bisa diubah sesuai input pengguna
            });
            alert(response.data.message);
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengedit constrain.');
        }
    };

    // Fungsi untuk menangani perubahan input constrain
    const handleConstrainChange = (constrainId, field, value) => {
        setConstrainData((prev) => ({
            ...prev,
            [constrainId]: { ...prev[constrainId], [field]: value },
        }));
    };

    return (
        <div className="container mx-auto p-6">
            {/* Detail Permintaan */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">Detail Permintaan</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p><strong>Nomor Tiket:</strong> {permintaan.nomertiket}</p>
                    <p><strong>Judul:</strong> {permintaan.title}</p>
                    <p><strong>Deskripsi:</strong> {permintaan.description || '-'}</p>
                    <p><strong>Status:</strong> {permintaan.status}</p>
                    <p><strong>Anggaran:</strong> {permintaan.anggaran}</p>
                    <p><strong>Pengaju:</strong> {permintaan.users.name}</p>
                </div>
            </div>

            {/* Timeline Progres Proyek */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Progres Proyek</h2>
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-300"></div>
                    {projectprogresses.map((progress, index) => {
                        const hasPermission = userPermissions.includes(progress.projecttahapan_id);
                        const allConstrainsFulfilled = progress.tahapanconstrains.every((c) => c.status === 'fulfilled');

                        return (
                            <div key={progress.id} className="mb-8 flex items-start">
                                <div className="relative z-10">
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${
                                            progress.status === 'completed'
                                                ? 'bg-green-500'
                                                : progress.status === 'current'
                                                ? 'bg-blue-500'
                                                : 'bg-gray-400'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="ml-8 p-4 bg-gray-100 rounded-lg w-full">
                                    <h3 className="font-semibold text-lg">{progress.tahapan.name}</h3>
                                    <p><strong>Status:</strong> {progress.status}</p>
                                    <p><strong>Deskripsi:</strong> {progress.description || '-'}</p>
                                    <button
                                        onClick={() =>
                                            setExpandedStep(expandedStep === progress.id ? null : progress.id)
                                        }
                                        className="mt-2 text-blue-600 hover:underline"
                                    >
                                        {expandedStep === progress.id ? 'Sembunyikan' : 'Lihat Detail'}
                                    </button>

                                    {expandedStep === progress.id && (
                                        <div className="mt-4">
                                            <h4 className="font-medium text-gray-700">Constrains:</h4>
                                            {progress.tahapanconstrains.length === 0 ? (
                                                <p className="text-gray-500">Tidak ada constrain untuk tahapan ini.</p>
                                            ) : (
                                                progress.tahapanconstrains.map((constrain) => (
                                                    <div key={constrain.id} className="mt-2 p-2 bg-white rounded border">
                                                        <p><strong>Tipe:</strong> {constrain.constrain_type}</p>
                                                        <p><strong>Status:</strong> {constrain.status}</p>
                                                        {hasPermission && progress.status === 'current' && (
                                                            <div className="mt-2">
                                                                {constrain.status === 'pending' ? (
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Masukkan data constrain"
                                                                        value={constrainData[constrain.id]?.type || ''}
                                                                        onChange={(e) =>
                                                                            handleConstrainChange(
                                                                                constrain.id,
                                                                                'type',
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        className="border rounded p-1 w-full"
                                                                    />
                                                                ) : (
                                                                    allConstrainsFulfilled && (
                                                                        <div className="flex space-x-2">
                                                                            <button
                                                                                onClick={() => handleConfirmStep(progress.id)}
                                                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                                            >
                                                                                Konfirmasi
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleEditConstrain(constrain.id, progress.id)
                                                                                }
                                                                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                            {!hasPermission && progress.status === 'current' && (
                                                <p className="mt-2 text-red-500">
                                                    Tahapan ini belum diisi oleh role yang berwenang.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Log Aktivitas */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Log Aktivitas</h2>
                {logAktivitas.length === 0 ? (
                    <p className="text-gray-500">Belum ada aktivitas untuk proyek ini.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {logAktivitas.map((log) => (
                            <li key={log.id} className="py-4">
                                <p className="text-sm text-gray-900">
                                    <strong>{log.user.name}</strong> - {log.action}
                                </p>
                                <p className="text-sm text-gray-600">{log.description || '-'}</p>
                                <p className="text-xs text-gray-400">
                                    {new Date(log.created_at).toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PermintaanShow;

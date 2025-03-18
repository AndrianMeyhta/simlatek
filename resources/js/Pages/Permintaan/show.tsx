import React, { useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Layout from "../../Layouts/layout";
import { Head } from "@inertiajs/react";
import { ProjectProgress, PageProps } from "../../types";

const ShowPermintaan: React.FC<PageProps> = ({
    permintaan,
    project,
    projectprogresses,
    logAktivitas,
    userPermissions,
}) => {
    const [editConstrain, setEditConstrain] = useState<{
        [key: number]: boolean;
    }>({});
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleEditConstrain = (constrainId: number) => {
        setEditConstrain((prev) => ({
            ...prev,
            [constrainId]: !prev[constrainId],
        }));
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (
        e: React.DragEvent<HTMLDivElement>,
        constrainId: number
    ) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFileUpload(files[0], constrainId);
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        constrainId: number
    ) => {
        if (e.target.files?.[0])
            handleFileUpload(e.target.files[0], constrainId);
    };

    const handleFileUpload = (file: File, constrainId: number) => {
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire({
                icon: "error",
                title: "File Terlalu Besar",
                text: "Ukuran file maksimum adalah 10MB.",
            });
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("constrain_type", "upload_file");
        formData.append("status", "fulfilled");
        formData.append("project_id", project.id.toString());
        handleEditConstrain(constrainId, formData);
    };

    const confirmStep = async (progressId: number) => {
        setIsLoading((prev) => ({ ...prev, [progressId]: true }));
        Swal.fire({
            title: "Konfirmasi Tahapan?",
            text: "Apakah Anda yakin ingin melanjutkan ke tahapan berikutnya?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Lanjutkan!",
            cancelButtonText: "Batal",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(
                        `/permintaan/${permintaan.id}/confirm-step`,
                        {
                            projectprogressId: progressId,
                            project_id: project.id,
                            _token: document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute("content"),
                        }
                    );
                    Swal.fire({
                        icon: "success",
                        title: "Berhasil!",
                        text: "Tahapan berhasil dikonfirmasi.",
                        timer: 1500,
                        showConfirmButton: false,
                    }).then(() => window.location.reload());
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Terjadi kesalahan saat mengonfirmasi tahapan.",
                    });
                } finally {
                    setIsLoading((prev) => ({ ...prev, [progressId]: false }));
                }
            } else {
                setIsLoading((prev) => ({ ...prev, [progressId]: false }));
            }
        });
    };

    const handleEditConstrain = async (
        constrainId: number,
        formData: FormData
    ) => {
        setIsLoading((prev) => ({ ...prev, [constrainId]: true }));
        try {
            formData.append(
                "_token",
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || ""
            );
            await axios.post(
                `/permintaan/${permintaan.id}/constrain/${constrainId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Constrain berhasil diedit.",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                window.location.reload();
                toggleEditConstrain(constrainId);
            });
        } catch (error: any) {
            console.error("Error saat mengedit constrain:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || "Kesalahan tidak diketahui";
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Terjadi kesalahan saat mengedit constrain: " + errorMessage,
            });
        } finally {
            setIsLoading((prev) => ({ ...prev, [constrainId]: false }));
        }
    };

    // Ubah fungsi ini untuk hanya memeriksa apakah semua constrain sudah terpenuhi (fulfilled)
    const canConfirmStep = (progress: ProjectProgress) =>
        progress.status === "current" &&
        progress.tahapanconstrains.every((c) => c.constraindata?.status === "fulfilled" || c.constraindata?.status === "confirmed");

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-500";
            case "current":
                return "bg-blue-500";
            case "upcoming":
                return "bg-gray-300 dark:bg-gray-600";
            default:
                return "bg-gray-300";
        }
    };

    // Fungsi untuk merender data constrain yang sudah diisi
    const renderConstrainData = (constrain: any) => {
        if (constrain.type === "upload_file" && constrain.target_data) {
            return (
                <div className="mt-2">
                    <p className="text-sm font-medium">File terlampir:</p>
                    <a
                        href={`/storage/${constrain.target_data.filepath?.replace('public/', '')}`}
                        className="text-blue-600 hover:underline text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {constrain.target_data.filename || "Lihat file"}
                    </a>
                </div>
            );
        } else if (constrain.type === "schedule" && constrain.target_data) {
            return (
                <div className="mt-2">
                    <p className="text-sm font-medium">Jadwal:</p>
                    <p className="text-sm">
                        {new Date(constrain.target_data.jadwalrapat).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </p>
                </div>
            );
        } else if (constrain.type === "text" && constrain.target_data) {
            return (
                <div className="mt-2">
                    <p className="text-sm font-medium">Teks:</p>
                    <p className="text-sm">{constrain.target_data.text || constrain.target_data.value || constrain.target_data.filename || "Tidak tersedia"}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <Head title="Simlatek - Detail Permintaan" />
            <Layout currentActive="permohonan_daftar">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
                    {/* Header Proyek */}
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6 p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {project.name}
                                </h2>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">
                                    {project.description}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Nomor Tiket
                                </p>
                                <p className="font-semibold text-gray-800 dark:text-white">
                                    {permintaan.nomertiket}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Pemohon
                                </p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {permintaan.users?.name || "Tidak diketahui"}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Dikelola oleh
                                </p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {project.dikelola?.name || "Tidak diketahui"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Tanggal Dibuat
                                </p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {permintaan.created_at
                                        ? new Date(permintaan.created_at).toLocaleDateString("id-ID", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                          })
                                        : "Tidak tersedia"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Permintaan */}
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            Progress Permintaan
                        </h3>
                        <div className="space-y-6">
                            {projectprogresses.length > 0 ? (
                                projectprogresses.map((progress, index) => (
                                    <div
                                        key={progress.id}
                                        className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(
                                                        progress.status
                                                    )}`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {progress.tahapan?.name ||
                                                        `Tahapan ${progress.projecttahapan_id} (Tidak Diketahui)`}
                                                </h4>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className={`text-sm font-medium ${
                                                        progress.status === "completed"
                                                            ? "text-green-600"
                                                            : progress.status === "current"
                                                            ? "text-blue-600"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {progress.percentage}%
                                                </span>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${
                                                        progress.status === "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : progress.status === "current"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {progress.status === "completed"
                                                        ? "Selesai"
                                                        : progress.status === "current"
                                                        ? "Berjalan"
                                                        : "Belum Dimulai"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600 mb-4">
                                            <div
                                                className={`h-2.5 rounded-full ${getStatusColor(
                                                    progress.status
                                                )}`}
                                                style={{ width: `${progress.percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            {progress.description || "Tidak ada deskripsi"}
                                        </p>

                                        {/* Daftar Constrain */}
                                        {progress.tahapanconstrains?.length > 0 ? (
                                            <div className="space-y-4">
                                                {progress.tahapanconstrains.map((constrain) => {
                                                    const constrainStatus = constrain.constraindata?.status ?? "pending";
                                                    const hasPermission = userPermissions.includes(progress.projecttahapan_id);

                                                    return (
                                                        <div
                                                            key={constrain.id}
                                                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                                                        >
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="flex items-center space-x-2">
                                                                    {constrain.type === "schedule" && (
                                                                        <svg
                                                                            className="w-5 h-5 text-gray-500"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                            />
                                                                        </svg>
                                                                    )}
                                                                    {constrain.type === "upload_file" && (
                                                                        <svg
                                                                            className="w-6 h-6 text-gray-500"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                                                                            />
                                                                        </svg>
                                                                    )}
                                                                    {constrain.type === "text" && (
                                                                        <svg
                                                                            className="w-5 h-5 text-gray-500"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                            />
                                                                        </svg>
                                                                    )}
                                                                    <h6 className="text-md font-semibold text-gray-900 dark:text-white">
                                                                        {constrain.name || "Unnamed Constrain"}
                                                                    </h6>
                                                                </div>
                                                                <span
                                                                    className={`text-sm font-medium ${
                                                                        constrainStatus === "confirmed" || constrainStatus === "fulfilled"
                                                                            ? "text-green-600"
                                                                            : "text-red-600"
                                                                    }`}
                                                                >
                                                                    {constrainStatus === "confirmed" || constrainStatus === "fulfilled"
                                                                        ? "Terpenuhi"
                                                                        : "Pending"}
                                                                </span>
                                                            </div>

                                                            {/* Tampilkan data constrain yang sudah diisi untuk semua user */}
                                                            {(constrainStatus === "fulfilled" || constrainStatus === "confirmed") &&
                                                                renderConstrainData(constrain)
                                                            }

                                                            {/* Form edit hanya untuk user yang berwenang */}
                                                            {!editConstrain[constrain.id] ? (
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {hasPermission &&
                                                                        progress.status === "current" && (
                                                                            <div className="mt-2">
                                                                                <button
                                                                                    onClick={() => toggleEditConstrain(constrain.id)}
                                                                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200"
                                                                                >
                                                                                    {constrainStatus === "pending" ? "Isi" : "Edit"}
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            ) : (
                                                                <form
                                                                    onSubmit={(e) => {
                                                                        e.preventDefault();
                                                                        const formData = new FormData(e.currentTarget);
                                                                        formData.append("constrain_type", constrain.type);
                                                                        formData.append("project_id", project.id.toString());
                                                                        formData.append(
                                                                            "status",
                                                                            constrain.type === "schedule" || constrain.type === "text"
                                                                                ? formData.get("value")
                                                                                    ? "fulfilled"
                                                                                    : "pending"
                                                                                : formData.get("file")
                                                                                ? "fulfilled"
                                                                                : "pending"
                                                                        );
                                                                        handleEditConstrain(constrain.id, formData);
                                                                    }}
                                                                    className="space-y-4"
                                                                >
                                                                    {constrain.type === "schedule" && (
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                Jadwal
                                                                            </label>
                                                                            <input
                                                                                type="datetime-local"
                                                                                name="value"
                                                                                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                                                required
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {constrain.type === "upload_file" && (
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                Unggah File
                                                                            </label>
                                                                            <div
                                                                                onDragEnter={handleDragEnter}
                                                                                onDragOver={handleDragOver}
                                                                                onDragLeave={handleDragLeave}
                                                                                onDrop={(e) => handleDrop(e, constrain.id)}
                                                                                onClick={() => fileInputRef.current?.click()}
                                                                                className={`mt-1 p-4 border-2 border-dashed rounded-md text-center cursor-pointer ${
                                                                                    isDragging
                                                                                        ? "border-blue-500 bg-blue-50"
                                                                                        : "border-gray-300 hover:border-blue-400"
                                                                                }`}
                                                                            >
                                                                                <input
                                                                                    type="file"
                                                                                    name="file"
                                                                                    ref={fileInputRef}
                                                                                    className="hidden"
                                                                                    onChange={(e) =>
                                                                                        handleFileChange(e, constrain.id)
                                                                                    }
                                                                                    required
                                                                                />
                                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                    {isDragging
                                                                                        ? "Drop file di sini"
                                                                                        : "Drag & drop atau klik untuk memilih"}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">Maks. 10MB</p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {constrain.type === "text" && (
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                Teks
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                name="value"
                                                                                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                                                required
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            type="submit"
                                                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                                                                            disabled={isLoading[constrain.id]}
                                                                        >
                                                                            {isLoading[constrain.id]
                                                                                ? "Menyimpan..."
                                                                                : "Simpan"}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleEditConstrain(constrain.id)}
                                                                            className="px-4 py-2 border rounded-md text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50"
                                                                        >
                                                                            Batal
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Tidak ada constrain untuk tahapan ini.
                                            </p>
                                        )}

                                        {/* Tombol konfirmasi tahapan - hanya tampil jika semua constrain terpenuhi */}
                                        {userPermissions.includes(progress.projecttahapan_id) &&
                                            canConfirmStep(progress) && (
                                                <button
                                                    onClick={() => confirmStep(progress.id)}
                                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                                                    disabled={isLoading[progress.id]}
                                                >
                                                    {isLoading[progress.id]
                                                        ? "Mengonfirmasi..."
                                                        : "Konfirmasi Tahapan"}
                                                </button>
                                            )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                    Belum ada tahapan proyek.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Log Aktivitas */}
                    <div className="mt-6 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Log Aktivitas
                        </h3>
                        {logAktivitas.length > 0 ? (
                            <div className="relative">
                                <div className="absolute top-0 bottom-0 left-2 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                                {logAktivitas.map((log) => (
                                    <div key={log.id} className="relative flex items-start mb-6">
                                        <div className="w-4 h-4 bg-blue-500 rounded-full absolute left-0 top-1"></div>
                                        <div className="ml-8">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <strong>
                                                    {log.users?.name || "Pengguna Tidak Diketahui"}
                                                </strong>{" "}
                                                - {log.action}: {log.description}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {log.created_at
                                                    ? new Date(log.created_at).toLocaleString("id-ID")
                                                    : "Tanggal tidak tersedia"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">Belum ada log aktivitas.</p>
                        )}
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default ShowPermintaan;

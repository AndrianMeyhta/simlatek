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
        formData.append("constrain_type", "upload_file"); // Sesuaikan dengan backend
        formData.append("status", "fulfilled");
        formData.append("project_id", project.id.toString());
        handleEditConstrain(constrainId, formData);
    };

    const confirmConstrain = async (constrainId: number) => {
        setIsLoading((prev) => ({ ...prev, [constrainId]: true }));
        Swal.fire({
            title: "Konfirmasi Constrain?",
            text: "Apakah Anda yakin data constrain sudah benar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Konfirmasi!",
            cancelButtonText: "Batal",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(
                        `/permintaan/${permintaan.id}/constrain/${constrainId}/confirm`,
                        {
                            project_id: project.id,
                            _token: document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute("content"),
                        }
                    );
                    Swal.fire({
                        icon: "success",
                        title: "Berhasil!",
                        text: "Constrain berhasil dikonfirmasi.",
                        timer: 1500,
                        showConfirmButton: false,
                    }).then(() => window.location.reload());
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "Terjadi kesalahan saat mengonfirmasi constrain.",
                    });
                } finally {
                    setIsLoading((prev) => ({ ...prev, [constrainId]: false }));
                }
            } else {
                setIsLoading((prev) => ({ ...prev, [constrainId]: false }));
            }
        });
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
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Terjadi kesalahan saat mengedit constrain.",
            });
        } finally {
            setIsLoading((prev) => ({ ...prev, [constrainId]: false }));
        }
    };

    const canConfirmStep = (progress: ProjectProgress) =>
        progress.status === "current" &&
        progress.tahapanconstrains.every((c) => c.status === "confirmed");

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-500";
            case "current":
                return "bg-blue-500";
            case "not_started":
                return "bg-gray-300 dark:bg-gray-600";
            default:
                return "bg-gray-300";
        }
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
                                    {permintaan.users?.name ||
                                        "Tidak diketahui"}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Dikelola oleh
                                </p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {project.dikelola?.name ||
                                        "Tidak diketahui"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Tanggal Dibuat
                                </p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {permintaan.created_at
                                        ? new Date(
                                              permintaan.created_at
                                          ).toLocaleDateString("id-ID", {
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
                                                        progress.status ===
                                                        "completed"
                                                            ? "text-green-600"
                                                            : progress.status ===
                                                              "current"
                                                            ? "text-blue-600"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {progress.percentage}%
                                                </span>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${
                                                        progress.status ===
                                                        "completed"
                                                            ? "bg-green-100 text-green-800"
                                                            : progress.status ===
                                                              "current"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {progress.status ===
                                                    "completed"
                                                        ? "Selesai"
                                                        : progress.status ===
                                                          "current"
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
                                                style={{
                                                    width: `${progress.percentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            {progress.description ||
                                                "Tidak ada deskripsi"}
                                        </p>

                                        {/* Daftar Constrain */}
                                        {progress.tahapanconstrains?.length >
                                        0 ? (
                                            <div className="space-y-4">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Constrain
                                                </h5>
                                                {progress.tahapanconstrains.map(
                                                    (constrain) => (
                                                        <div
                                                            key={constrain.id}
                                                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                                                        >
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="flex items-center space-x-2">
                                                                    {constrain.type ===
                                                                        "schedule" && (
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
                                                                    {constrain.type ===
                                                                        "upload_file" && (
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
                                                                    {constrain.type ===
                                                                        "text" && (
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
                                                                        {constrain.name ||
                                                                            "Unnamed Constrain"}
                                                                    </h6>
                                                                </div>
                                                                <span
                                                                    className={`text-sm font-medium ${
                                                                        constrain.status ===
                                                                        "confirmed"
                                                                            ? "text-green-600"
                                                                            : constrain.status ===
                                                                              "fulfilled"
                                                                            ? "text-blue-600"
                                                                            : "text-red-600"
                                                                    }`}
                                                                >
                                                                    {constrain.status ===
                                                                    "confirmed"
                                                                        ? "Dikonfirmasi"
                                                                        : constrain.status ===
                                                                          "fulfilled"
                                                                        ? "Terpenuhi"
                                                                        : "Pending"}
                                                                </span>
                                                            </div>

                                                            {!editConstrain[
                                                                constrain.id
                                                            ] ? (
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {constrain.type ===
                                                                        "schedule" && (
                                                                        <p>
                                                                            Jadwal:{" "}
                                                                            {constrain.value ||
                                                                                "Belum diisi"}
                                                                        </p>
                                                                    )}
                                                                    {constrain.type ===
                                                                        "upload_file" && (
                                                                        <p>
                                                                            File:{" "}
                                                                            {constrain.file_path ? (
                                                                                <a
                                                                                    href={`/storage/${constrain.file_path}`}
                                                                                    target="_blank"
                                                                                    className="text-blue-600 hover:underline"
                                                                                >
                                                                                    Lihat
                                                                                </a>
                                                                            ) : (
                                                                                "Belum diunggah"
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                    {constrain.type ===
                                                                        "text" && (
                                                                        <p>
                                                                            Teks:{" "}
                                                                            {constrain.value ||
                                                                                "Belum diisi"}
                                                                        </p>
                                                                    )}
                                                                    {userPermissions.includes(
                                                                        progress.projecttahapan_id
                                                                    ) &&
                                                                        progress.status ===
                                                                            "current" && (
                                                                            <div className="mt-2 flex space-x-2">
                                                                                {constrain.status ===
                                                                                    "pending" && (
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            toggleEditConstrain(
                                                                                                constrain.id
                                                                                            )
                                                                                        }
                                                                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200"
                                                                                    >
                                                                                        Isi/Edit
                                                                                    </button>
                                                                                )}
                                                                                {constrain.status ===
                                                                                    "fulfilled" && (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                confirmConstrain(
                                                                                                    constrain.id
                                                                                                )
                                                                                            }
                                                                                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                                                                                            disabled={
                                                                                                isLoading[
                                                                                                    constrain
                                                                                                        .id
                                                                                                ]
                                                                                            }
                                                                                        >
                                                                                            {isLoading[
                                                                                                constrain
                                                                                                    .id
                                                                                            ]
                                                                                                ? "Mengonfirmasi..."
                                                                                                : "Konfirmasi"}
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                toggleEditConstrain(
                                                                                                    constrain.id
                                                                                                )
                                                                                            }
                                                                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200"
                                                                                        >
                                                                                            Edit
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            ) : (
                                                                <form
                                                                    onSubmit={(
                                                                        e
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        const formData =
                                                                            new FormData(
                                                                                e.currentTarget
                                                                            );
                                                                        formData.append(
                                                                            "constrain_type",
                                                                            constrain.type
                                                                        ); // Gunakan type
                                                                        formData.append(
                                                                            "project_id",
                                                                            project.id.toString()
                                                                        );
                                                                        formData.append(
                                                                            "status",
                                                                            constrain.type ===
                                                                                "schedule" ||
                                                                                constrain.type ===
                                                                                    "text"
                                                                                ? formData.get(
                                                                                      "value"
                                                                                  )
                                                                                    ? "fulfilled"
                                                                                    : "pending"
                                                                                : formData.get(
                                                                                      "file"
                                                                                  ) ||
                                                                                  constrain.file_path
                                                                                ? "fulfilled"
                                                                                : "pending"
                                                                        );
                                                                        handleEditConstrain(
                                                                            constrain.id,
                                                                            formData
                                                                        );
                                                                    }}
                                                                    className="space-y-4"
                                                                >
                                                                    {constrain.type ===
                                                                        "schedule" && (
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                Jadwal
                                                                            </label>
                                                                            <input
                                                                                type="datetime-local"
                                                                                name="value"
                                                                                defaultValue={
                                                                                    constrain.value
                                                                                        ? new Date(
                                                                                              constrain.value
                                                                                          )
                                                                                              .toISOString()
                                                                                              .slice(
                                                                                                  0,
                                                                                                  16
                                                                                              )
                                                                                        : ""
                                                                                }
                                                                                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                                                required // Sesuaikan dengan logika Anda
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {constrain.type ===
                                                                        "upload_file" && (
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                Unggah
                                                                                File
                                                                            </label>
                                                                            <div
                                                                                onDragEnter={
                                                                                    handleDragEnter
                                                                                }
                                                                                onDragOver={
                                                                                    handleDragOver
                                                                                }
                                                                                onDragLeave={
                                                                                    handleDragLeave
                                                                                }
                                                                                onDrop={(
                                                                                    e
                                                                                ) =>
                                                                                    handleDrop(
                                                                                        e,
                                                                                        constrain.id
                                                                                    )
                                                                                }
                                                                                onClick={() =>
                                                                                    fileInputRef.current?.click()
                                                                                }
                                                                                className={`mt-1 p-4 border-2 border-dashed rounded-md text-center cursor-pointer ${
                                                                                    isDragging
                                                                                        ? "border-blue-500 bg-blue-50"
                                                                                        : "border-gray-300 hover:border-blue-400"
                                                                                }`}
                                                                            >
                                                                                <input
                                                                                    type="file"
                                                                                    name="file"
                                                                                    ref={
                                                                                        fileInputRef
                                                                                    }
                                                                                    className="hidden"
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleFileChange(
                                                                                            e,
                                                                                            constrain.id
                                                                                        )
                                                                                    }
                                                                                    required={
                                                                                        !constrain.file_path
                                                                                    } // Hanya wajib jika belum ada file
                                                                                />
                                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                    {isDragging
                                                                                        ? "Drop file di sini"
                                                                                        : "Drag & drop atau klik untuk memilih"}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    Maks.
                                                                                    10MB
                                                                                </p>
                                                                                {constrain.file_path && (
                                                                                    <p className="mt-2 text-blue-600">
                                                                                        <a
                                                                                            href={`/storage/${constrain.file_path}`}
                                                                                            target="_blank"
                                                                                        >
                                                                                            File
                                                                                            saat
                                                                                            ini
                                                                                        </a>
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {constrain.type ===
                                                                        "text" && (
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                Teks
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                name="value"
                                                                                defaultValue={
                                                                                    constrain.value ||
                                                                                    ""
                                                                                }
                                                                                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                                                required // Sesuaikan dengan logika Anda
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            type="submit"
                                                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                                                                            disabled={
                                                                                isLoading[
                                                                                    constrain
                                                                                        .id
                                                                                ]
                                                                            }
                                                                        >
                                                                            {isLoading[
                                                                                constrain
                                                                                    .id
                                                                            ]
                                                                                ? "Menyimpan..."
                                                                                : "Simpan"}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                toggleEditConstrain(
                                                                                    constrain.id
                                                                                )
                                                                            }
                                                                            className="px-4 py-2 border rounded-md text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50"
                                                                        >
                                                                            Batal
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Tidak ada constrain untuk
                                                tahapan ini.
                                            </p>
                                        )}

                                        {userPermissions.includes(
                                            progress.projecttahapan_id
                                        ) &&
                                            canConfirmStep(progress) && (
                                                <button
                                                    onClick={() =>
                                                        confirmStep(progress.id)
                                                    }
                                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                                                    disabled={
                                                        isLoading[progress.id]
                                                    }
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
                                    <div
                                        key={log.id}
                                        className="relative flex items-start mb-6"
                                    >
                                        <div className="w-4 h-4 bg-blue-500 rounded-full absolute left-0 top-1"></div>
                                        <div className="ml-8">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                <strong>
                                                    {log.users?.name ||
                                                        "Pengguna Tidak Diketahui"}
                                                </strong>{" "}
                                                - {log.action}:{" "}
                                                {log.description}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {log.created_at
                                                    ? new Date(
                                                          log.created_at
                                                      ).toLocaleString("id-ID")
                                                    : "Tanggal tidak tersedia"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">
                                Belum ada log aktivitas.
                            </p>
                        )}
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default ShowPermintaan;

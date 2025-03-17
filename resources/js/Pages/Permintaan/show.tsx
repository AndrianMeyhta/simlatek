import React, { useState, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Layout from "../../Layouts/layout";
import { Head } from "@inertiajs/react";

// Definisi Tipe (diperbarui dengan constrain_detail)
interface User {
    id: number;
    name: string;
}

interface ProjectTahapan {
    id: number;
    name: string;
}

interface ConstrainDetail {
    name: string;
    // tambahkan properti lain jika ada
}

interface TahapanConstrain {
    id: number;
    projecttahapan_id: number;
    constrain_type: 'schedule' | 'upload_file' | 'text';
    constrain_detail: ConstrainDetail[]; // Array detail constrain
    required: boolean;
    target_table: string;
    target_column: string;
    status: 'pending' | 'fulfilled' | 'confirmed';
    value?: string | null;
    file_path?: string | null;
}

interface ProjectProgress {
    id: number;
    project_id: number;
    projecttahapan_id: number;
    status: 'not_started' | 'current' | 'completed';
    percentage: number;
    description?: string | null;
    tahapan: ProjectTahapan;
    tahapanconstrains: TahapanConstrain[];
}

interface Project {
    id: number;
    name: string;
    description: string;
    progress: ProjectProgress[];
    dikelola: User;
}

interface Permintaan {
    id: number;
    nomertiket: string;
    created_at: string;
    users: User;
    projects: Project;
}

interface LogAktivitas {
    id: number;
    projectprogress_id: number;
    user_id: number;
    action: string;
    description: string;
    created_at: string;
    users: User;
}

interface PageProps {
    permintaan: Permintaan;
    project: Project;
    projectprogresses: ProjectProgress[];
    logAktivitas: LogAktivitas[];
    userPermissions: number[];
}

const ShowPermintaan: React.FC<PageProps> = ({
    permintaan,
    project,
    projectprogresses,
    logAktivitas,
    userPermissions,
}) => {
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [editConstrain, setEditConstrain] = useState<{ [key: number]: boolean }>({});
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleStep = (stepId: number) => {
        setActiveStep(activeStep === stepId ? null : stepId);
    };

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

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, constrainId: number) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const formData = new FormData();
            formData.append('file', files[0]);
            formData.append('constrain_type', 'upload_file');
            formData.append('status', 'fulfilled');
            handleEditConstrain(constrainId, formData);
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const confirmConstrain = async (constrainId: number) => {
        Swal.fire({
            title: 'Konfirmasi Constrain?',
            text: 'Apakah Anda yakin data constrain sudah benar?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Konfirmasi!',
            cancelButtonText: 'Batal',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(`/permintaan/${permintaan.id}/constrain/${constrainId}/confirm`, {
                        _token: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    });
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Constrain berhasil dikonfirmasi.',
                        timer: 1500,
                        showConfirmButton: false,
                    }).then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Terjadi kesalahan saat mengonfirmasi constrain.',
                    });
                }
            }
        });
    };

    const confirmStep = async (progressId: number) => {
        Swal.fire({
            title: 'Konfirmasi Tahapan?',
            text: 'Apakah Anda yakin ingin melanjutkan ke tahapan berikutnya?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Lanjutkan!',
            cancelButtonText: 'Batal',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(`/permintaan/${permintaan.id}/confirm-step`, {
                        projectprogressId: progressId,
                        _token: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    });
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Tahapan berhasil dikonfirmasi.',
                        timer: 1500,
                        showConfirmButton: false,
                    }).then(() => {
                        window.location.reload();
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Terjadi kesalahan saat mengonfirmasi tahapan.',
                    });
                }
            }
        });
    };

    const handleEditConstrain = async (constrainId: number, formData: FormData) => {
        try {
            formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');
            await axios.post(`/permintaan/${permintaan.id}/constrain/${constrainId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Constrain berhasil diedit.',
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                window.location.reload();
                toggleEditConstrain(constrainId);
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Terjadi kesalahan saat mengedit constrain.',
            });
        }
    };

    return (
        <>
            <Head title="Simlatek - Constrain" />
            <Layout currentActive="constrain">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{project.name}</h2>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">{project.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Nomor Tiket</p>
                                    <p className="font-medium dark:text-white">{permintaan.nomertiket}</p>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Pemohon</p>
                                    <p className="font-medium dark:text-white">{permintaan.users.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Dikelola</p>
                                    <p className="font-medium dark:text-white">{project.dikelola.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Tanggal Dibuat</p>
                                    <p className="font-medium dark:text-white">
                                        {new Date(permintaan.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Progress Permintaan</h3>
                            <div className="space-y-6">
                                {projectprogresses.map((progress, index) => (
                                    <div key={progress.id} className="relative flex items-start">
                                        {index < projectprogresses.length - 1 && (
                                            <div className="absolute top-8 left-4 -bottom-12 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                        )}
                                        <div
                                            className={`relative flex items-center justify-center shrink-0 w-8 h-8 rounded-full ${progress.status === 'completed'
                                                ? 'bg-green-500'
                                                : progress.status === 'current'
                                                    ? 'bg-blue-500'
                                                    : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <span className="text-white text-sm">{index + 1}</span>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <button
                                                onClick={() => toggleStep(progress.projecttahapan_id)}
                                                className="flex items-center justify-between w-full text-left"
                                            >
                                                <span className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {progress.tahapan.name}
                                                </span>
                                                <div className="flex items-center">
                                                    <span
                                                        className={`mr-2 ${progress.status === 'completed'
                                                            ? 'text-green-500 dark:text-green-400'
                                                            : progress.status === 'current'
                                                                ? 'text-blue-500 dark:text-blue-400'
                                                                : 'text-gray-500 dark:text-gray-400'
                                                            }`}
                                                    >
                                                        {progress.percentage}%
                                                    </span>
                                                    <svg
                                                        className={`w-5 h-5 transform transition-transform text-gray-500 dark:text-gray-400 ${activeStep === progress.projecttahapan_id ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5 5 5M7 19l5-5 5 5" />
                                                    </svg>
                                                </div>
                                            </button>

                                            {activeStep === progress.projecttahapan_id && (
                                                <div className="mt-4 space-y-4 animate-fade-in">
                                                    <div className="flex items-center space-x-2">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${progress.status === 'completed'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                : progress.status === 'current'
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                }`}
                                                        >
                                                            {progress.status === 'completed'
                                                                ? 'Selesai'
                                                                : progress.status === 'current'
                                                                    ? 'Sedang Berjalan'
                                                                    : 'Belum Dimulai'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {progress.description || 'Belum ada deskripsi'}
                                                    </p>

                                                    <div className="space-y-4">
                                                        {progress.tahapanconstrains.map((constrain) => (
                                                            <div key={constrain.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                                                <div className="flex justify-between items-center">
                                                                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                                                                        {constrain.constrain_detail[0]?.name || 'Unnamed Constrain'}
                                                                    </h4>
                                                                    <span
                                                                        className={`text-sm ${constrain.status === 'confirmed'
                                                                            ? 'text-green-600 dark:text-green-400'
                                                                            : constrain.status === 'fulfilled'
                                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                                : 'text-red-600 dark:text-red-400'
                                                                            }`}
                                                                    >
                                                                        {constrain.status === 'confirmed'
                                                                            ? 'Dikonfirmasi'
                                                                            : constrain.status === 'fulfilled'
                                                                                ? 'Terpenuhi'
                                                                                : 'Pending'}
                                                                    </span>
                                                                </div>

                                                                {!editConstrain[constrain.id] ? (
                                                                    <div className="mt-2">
                                                                        {constrain.constrain_type === 'schedule' && (
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                Jadwal: {constrain.value || 'Belum diisi'}
                                                                            </p>
                                                                        )}
                                                                        {constrain.constrain_type === 'upload_file' && (
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                File:{' '}
                                                                                {constrain.file_path ? (
                                                                                    <a
                                                                                        href={`/storage/${constrain.file_path}`}
                                                                                        target="_blank"
                                                                                        className="text-blue-600 hover:underline"
                                                                                    >
                                                                                        Lihat File
                                                                                    </a>
                                                                                ) : (
                                                                                    'Belum diunggah'
                                                                                )}
                                                                            </p>
                                                                        )}
                                                                        {constrain.constrain_type === 'text' && (
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                Teks: {constrain.value || 'Belum diisi'}
                                                                            </p>
                                                                        )}

                                                                        {userPermissions.includes(progress.projecttahapan_id) &&
                                                                            progress.status === 'current' && (
                                                                                <div className="mt-2 flex space-x-2">
                                                                                    {constrain.status === 'pending' && (
                                                                                        <button
                                                                                            onClick={() => toggleEditConstrain(constrain.id)}
                                                                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50"
                                                                                        >
                                                                                            Isi/Edit
                                                                                        </button>
                                                                                    )}
                                                                                    {constrain.status === 'fulfilled' && (
                                                                                        <>
                                                                                            <button
                                                                                                onClick={() => confirmConstrain(constrain.id)}
                                                                                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                                                            >
                                                                                                Konfirmasi Constrain
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => toggleEditConstrain(constrain.id)}
                                                                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50"
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
                                                                        onSubmit={(e) => {
                                                                            e.preventDefault();
                                                                            const formData = new FormData(e.currentTarget);
                                                                            formData.append('constrain_type', constrain.constrain_type);
                                                                            formData.append(
                                                                                'status',
                                                                                constrain.constrain_type === 'schedule'
                                                                                    ? formData.get('value') ? 'fulfilled' : 'pending'
                                                                                    : constrain.constrain_type === 'upload_file'
                                                                                        ? formData.get('file') ? 'fulfilled' : 'pending'
                                                                                        : formData.get('value') ? 'fulfilled' : 'pending'
                                                                            );
                                                                            handleEditConstrain(constrain.id, formData);
                                                                        }}
                                                                        className="mt-2 space-y-4"
                                                                    >
                                                                        {constrain.constrain_type === 'schedule' && (
                                                                            <div className="relative">
                                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    {constrain.constrain_detail[0]?.name || 'Jadwal'}
                                                                                </label>
                                                                                <div className="relative">
                                                                                    <input
                                                                                        type="datetime-local"
                                                                                        name="value"
                                                                                        defaultValue={
                                                                                            constrain.value
                                                                                                ? new Date(constrain.value).toISOString().slice(0, 16)
                                                                                                : ''
                                                                                        }
                                                                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                                                        required={constrain.required}
                                                                                    />
                                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                        </svg>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {constrain.constrain_type === 'upload_file' && (
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    {constrain.constrain_detail[0]?.name || 'Unggah File'}
                                                                                </label>
                                                                                <div
                                                                                    onDragEnter={handleDragEnter}
                                                                                    onDragOver={handleDragOver}
                                                                                    onDragLeave={handleDragLeave}
                                                                                    onDrop={(e) => handleDrop(e, constrain.id)}
                                                                                    onClick={handleFileClick}
                                                                                    className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                                                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                                                                        }`}
                                                                                >
                                                                                    <input
                                                                                        type="file"
                                                                                        name="file"
                                                                                        ref={fileInputRef}
                                                                                        className="hidden"
                                                                                        onChange={(e) => {
                                                                                            if (e.target.files?.[0]) {
                                                                                                const formData = new FormData();
                                                                                                formData.append('file', e.target.files[0]);
                                                                                                formData.append('constrain_type', 'upload_file');
                                                                                                formData.append('status', 'fulfilled');
                                                                                                handleEditConstrain(constrain.id, formData);
                                                                                            }
                                                                                        }}
                                                                                        required={constrain.required && !constrain.file_path}
                                                                                    />
                                                                                    <div className="flex flex-col items-center space-y-2">
                                                                                        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0113 5a5 5 0 014.9 4.097A4 4 0 0117 16H7z" />
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12v6m-3-3l3-3 3 3" />
                                                                                        </svg>
                                                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                            {isDragging
                                                                                                ? 'Drop file di sini'
                                                                                                : 'Drag & drop file atau klik untuk memilih'}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                                                                            Maksimum 10MB
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                {constrain.file_path && (
                                                                                    <div className="mt-2 flex items-center space-x-2">
                                                                                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                                        </svg>
                                                                                        <a
                                                                                            href={`/storage/${constrain.file_path}`}
                                                                                            target="_blank"
                                                                                            className="text-sm text-blue-600 hover:underline"
                                                                                        >
                                                                                            Lihat file saat ini
                                                                                        </a>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {constrain.constrain_type === 'text' && (
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                                                    {constrain.constrain_detail[0]?.name || 'Teks'}
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    name="value"
                                                                                    defaultValue={constrain.value || ''}
                                                                                    className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                                                    required={constrain.required}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex space-x-2">
                                                                            <button
                                                                                type="submit"
                                                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                                                            >
                                                                                Simpan
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => toggleEditConstrain(constrain.id)}
                                                                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                                                            >
                                                                                Batal
                                                                            </button>
                                                                        </div>
                                                                    </form>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {userPermissions.includes(progress.projecttahapan_id) &&
                                                        progress.status === 'current' &&
                                                        progress.tahapanconstrains.every((c) => c.status === 'confirmed') && (
                                                            <button
                                                                onClick={() => confirmStep(progress.id)}
                                                                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                            >
                                                                Konfirmasi Tahapan
                                                            </button>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Log Aktivitas</h3>
                            <div className="space-y-4">
                                {logAktivitas.map((log) => (
                                    <div key={log.id} className="text-sm text-gray-600 dark:text-gray-300">
                                        <p>
                                            <strong>{log.users.name}</strong> - {log.action}: {log.description}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default ShowPermintaan;

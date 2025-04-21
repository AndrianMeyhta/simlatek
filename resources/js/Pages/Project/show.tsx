import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Layout from "../../Layouts/layout";
import axios from "axios";
import Swal from "sweetalert2";
import { PageProps } from "../../types";

interface Project {
    id: number;
    name: string;
    description: string;
    dikelola: { id: string | null; name: string };
    created_at: string;
}

interface Dokumen {
    id: number;
    filename: string;
    filepath: string;
    dokumenkategori_id: number;
    dokumenkategori_name: string; // Add this
}

interface Testing {
    id: number;
    testingtype: string;
    status: string;
    created_at: string;
}

interface SkplData {
    id: number;
    extracted_data: string[];
    created_at: string;
}

interface Domainlink {
    id: number;
    links: string;
    typedomain: string;
}

interface User {
    id: string;
    name: string;
    skills?: { name: string; category: string }[];
    application_count: number;
}

interface AplikasiShowProps extends PageProps {
    project: Project;
    dokumens: Dokumen[];
    testings: Testing[];
    skplData: SkplData[];
    domainlinks: Domainlink[];
    canEditPengelola: boolean;
    availableUsers: User[];
}

const AplikasiShow: React.FC<AplikasiShowProps> = ({
    project,
    dokumens,
    testings,
    skplData,
    domainlinks,
    canEditPengelola,
    availableUsers,
}) => {
    const [showEditPengelolaModal, setShowEditPengelolaModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleEditPengelola = async () => {
        if (!selectedUserId) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Pilih pengguna terlebih dahulu!",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                `/aplikasi/${project.id}/update-pengelola`,
                {
                    user_id: selectedUserId,
                },
            );
            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Pengelola berhasil diperbarui.",
                timer: 1500,
            }).then(() => {
                window.location.reload();
            });
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Gagal memperbarui pengelola: ${error.response?.data?.message || error.message}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderDokumens = () => {
        if (!dokumens || dokumens.length === 0) return null;
        return (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Dokumen Terkait
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dokumens.map((dokumen) => (
                        <div
                            key={dokumen.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-2.5">
                                    <svg
                                        className="w-5 h-5 text-blue-500"
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
                                </div>
                                <h6 className="text-md font-semibold text-gray-900 dark:text-white">
                                    {dokumen.dokumenkategori_name}
                                </h6>
                            </div>
                            <div className="mt-3 pl-10">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    File terlampir:
                                </p>
                                <a
                                    href={`/storage/${dokumen.filepath.replace("public/", "")}`}
                                    className="mt-1 inline-flex items-center text-blue-600 hover:text-blue-700 text-sm group"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg
                                        className="w-4 h-4 mr-1.5 group-hover:translate-x-0.5 transition-transform duration-150"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="group-hover:underline">
                                        {dokumen.filename || "Lihat file"}
                                    </span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderTestings = () => {
        if (!testings || testings.length === 0) return null;
        return (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Hasil Testing
                </h3>
                <div className="space-y-4">
                    {testings.map((testing) => (
                        <div
                            key={testing.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="rounded-full bg-green-50 dark:bg-green-900/20 p-2.5">
                                    <svg
                                        className="w-5 h-5 text-green-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h6 className="text-md font-semibold text-gray-900 dark:text-white">
                                        {testing.testingtype}
                                    </h6>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Status: {testing.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSkplData = () => {
        if (!skplData || skplData.length === 0) return null;
        return (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Hasil Ekstraksi SKPL
                </h3>
                <div className="space-y-4">
                    {skplData.map((data) => (
                        <div
                            key={data.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <h6 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                                Ekstraksi pada{" "}
                                {new Date(data.created_at).toLocaleString(
                                    "id-ID",
                                )}
                            </h6>
                            {data.extracted_data.length > 0 ? (
                                <ol className="list-decimal pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                                    {data.extracted_data.map((item, index) => (
                                        <li key={index} className="pl-2">
                                            {item}
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Tidak ada data ekstraksi.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDomainlinks = () => {
        if (!domainlinks || domainlinks.length === 0) return null;
        return (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Link Domain
                </h3>
                <div className="space-y-4">
                    {domainlinks.map((domain) => (
                        <div
                            key={domain.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="rounded-full bg-amber-50 dark:bg-amber-900/20 p-2.5">
                                    <svg
                                        className="w-5 h-5 text-amber-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h6 className="text-md font-semibold text-gray-900 dark:text-white">
                                        {domain.typedomain}
                                    </h6>
                                    <a
                                        href={domain.links}
                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {domain.links}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title={`Simlatek - ${project.name}`} />
            <Layout currentActive="aplikasi_daftar">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                        <div className="bg-gradient-to-r mb-6 from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="h-3 bg-blue-500 dark:bg-blue-600"></div>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="max-w-xl">
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mr-3">
                                            {project.name}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            {project.description ||
                                                "Tidak ada deskripsi"}
                                        </p>
                                        <div className="inline-flex items-center bg-white dark:bg-gray-800 py-1 px-3 rounded-full shadow-sm text-sm text-gray-700 dark:text-gray-300">
                                            <svg
                                                className="w-4 h-4 mr-2 text-blue-500"
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
                                            <span>
                                                {new Date(
                                                    project.created_at,
                                                ).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    {canEditPengelola && (
                                        <button
                                            onClick={() =>
                                                setShowEditPengelolaModal(true)
                                            }
                                            className="px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150 flex items-center shadow-sm"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-1.5"
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
                                            Edit Pengelola
                                        </button>
                                    )}
                                </div>
                                <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                        <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg mr-3">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Pengelola
                                            </p>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                {project.dikelola.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {renderDokumens()}
                        {renderTestings()}
                        {renderSkplData()}
                        {renderDomainlinks()}
                    </div>
                </div>

                {showEditPengelolaModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full animate-fadeIn border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2 text-blue-500"
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
                                Edit Pengelola
                            </h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Pilih Pengelola Baru
                                </label>
                                <select
                                    value={selectedUserId}
                                    onChange={(e) =>
                                        setSelectedUserId(e.target.value)
                                    }
                                    className="w-full p-2.5 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                >
                                    <option value="">Pilih Pengguna</option>
                                    {availableUsers.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}{" "}
                                            {user.skills &&
                                            user.skills.length > 0
                                                ? `(${user.skills.map((s) => s.name).join(", ")})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() =>
                                        setShowEditPengelolaModal(false)
                                    }
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleEditPengelola}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-150 flex items-center"
                                    disabled={isLoading || !selectedUserId}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                className="w-4 h-4 mr-1.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            Simpan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    );
};

export default AplikasiShow;

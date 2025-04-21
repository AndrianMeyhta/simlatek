import React from "react";
import { Head } from "@inertiajs/react";
import Layout from "../../Layouts/layout";
import { PageProps } from "../../types";

interface Project {
    id: number;
    name: string;
    description: string;
    dikelola: string;
    created_at: string;
}

interface AplikasiIndexProps extends PageProps {
    projects: Project[];
}

const AplikasiIndex: React.FC<AplikasiIndexProps> = ({ projects }) => {
    return (
        <>
            <Head title="Simlatek - Daftar Aplikasi" />
            <Layout currentActive="aplikasi_daftar">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                Daftar Aplikasi
                            </h2>
                        </div>
                        {projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <a
                                        key={project.id}
                                        href={`/aplikasi/${project.id}`}
                                        className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                            {project.description ||
                                                "Tidak ada deskripsi"}
                                        </p>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center">
                                                <svg
                                                    className="w-4 h-4 mr-1.5 text-gray-500"
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
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {project.dikelola}
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Belum ada aplikasi
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Belum ada aplikasi yang tersedia.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default AplikasiIndex;

import React from "react";
import { Link } from "@inertiajs/react";
import Layout from "../../Layouts/layout";
import { Head } from "@inertiajs/react";
import { PermintaanIndexProps } from "../../types";

const PermintaanIndex: React.FC<PermintaanIndexProps> = ({ permintaans }) => {
    return (
        <>
            <Head title="Simlatek - Permohonan" />
            <Layout currentActive="permohonan_daftar">
                <div className="container mx-auto p-6">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                        Daftar Permintaan
                    </h1>
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Nomor Tiket
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Judul
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {permintaans.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Tidak ada permintaan yang tersedia.
                                        </td>
                                    </tr>
                                ) : (
                                    permintaans.map((permintaan) => (
                                        <tr
                                            key={permintaan.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {permintaan.nomertiket}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {permintaan.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {permintaan.status}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{
                                                            width: `${permintaan.progress}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                    {`${permintaan.progress}%`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/permintaan/${permintaan.id}`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Lihat Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default PermintaanIndex;

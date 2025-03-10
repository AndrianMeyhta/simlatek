import React from "react";
import { Link } from "@inertiajs/react";
import { Helmet } from "react-helmet";
import Layout from "../../Layouts/layout";

const PermintaanIndex = ({ permintaans }) => {
    return (
        <>
            <Helmet>
                <title>Simlatek - Permintaan</title>
            </Helmet>
            <Layout currentActive="permohonan_daftar">
                <div className="container mx-auto p-6">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">
                        Daftar Permintaan
                    </h1>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nomor Tiket
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Judul
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {permintaans.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            Tidak ada permintaan yang tersedia.
                                        </td>
                                    </tr>
                                ) : (
                                    permintaans.map((permintaan) => (
                                        <tr
                                            key={permintaan.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {permintaan.nomertiket}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {permintaan.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {permintaan.status}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{
                                                            width: `${permintaan.progress}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                    {permintaan.progress}%
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

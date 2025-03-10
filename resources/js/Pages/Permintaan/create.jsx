import React, { useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import Layout from "../../Layouts/layout";
import { usePage } from "@inertiajs/react";
import { Upload } from "lucide-react";

const CreatePermintaan = () => {
    const { props } = usePage();
    const nomertiket = props.nomertiket || "";

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        anggaran: "",
        files: {
            suratPermohonan: null,
            dataUsulan: null,
            petaPerencanaan: null,
        },
    });
    const [dragOver, setDragOver] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (category, file) => {
        setFormData((prev) => ({
            ...prev,
            files: { ...prev.files, [category]: file },
        }));
    };

    const handleDrop = (e, category) => {
        e.preventDefault();
        setDragOver((prev) => ({ ...prev, [category]: false }));
        const file = e.dataTransfer.files[0];
        handleFileChange(category, file);
    };

    const handleDragOver = (e, category) => {
        e.preventDefault();
        setDragOver((prev) => ({ ...prev, [category]: true }));
    };

    const handleDragLeave = (e, category) => {
        setDragOver((prev) => ({ ...prev, [category]: false }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("anggaran", formData.anggaran);
        data.append("suratPermohonan", formData.files.suratPermohonan);
        data.append("dataUsulan", formData.files.dataUsulan);
        data.append("petaPerencanaan", formData.files.petaPerencanaan);

        try {
            await axios.post("/permintaan", data);
            alert("Permintaan berhasil dibuat!");
            setFormData({
                title: "",
                description: "",
                anggaran: "",
                files: { suratPermohonan: null, dataUsulan: null, petaPerencanaan: null },
            });
        } catch (error) {
            console.error(error);
            alert("Gagal membuat permintaan.");
        }
    };

    return (
        <>
            <Helmet>
                <title>Simlatek - Buat Permohonan</title>
            </Helmet>
            <Layout currentActive="permohonan_pengajuan">
                <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
                    <div className="max-w-4xl mx-auto">
                        <header className="mb-6">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                                Buat Permohonan Baru
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Lengkapi formulir di bawah untuk mengajukan permohonan
                            </p>
                        </header>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nomor Tiket */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nomor Tiket
                                    </label>
                                    <input
                                        type="text"
                                        value={nomertiket}
                                        disabled
                                        className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed focus:outline-none"
                                    />
                                </div>

                                {/* Judul */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Judul Permohonan
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400 transition-colors"
                                        required
                                    />
                                </div>

                                {/* Deskripsi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400 transition-colors resize-y"
                                    />
                                </div>

                                {/* Anggaran */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Anggaran
                                    </label>
                                    <input
                                        type="text"
                                        name="anggaran"
                                        value={formData.anggaran}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-400 dark:focus:border-cyan-400 transition-colors"
                                        required
                                    />
                                </div>

                                {/* File Upload Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Upload Dokumen Persyaratan
                                    </h3>
                                    {[
                                        { key: "suratPermohonan", label: "Surat Permohonan" },
                                        { key: "dataUsulan", label: "Data Usulan" },
                                        { key: "petaPerencanaan", label: "Peta Perencanaan SPBE" },
                                    ].map((doc) => (
                                        <div
                                            key={doc.key}
                                            className={`relative rounded-lg border-2 ${
                                                dragOver[doc.key]
                                                    ? "border-cyan-500 bg-cyan-50/50 dark:border-cyan-400 dark:bg-cyan-900/20"
                                                    : "border-dashed border-gray-300 dark:border-gray-600"
                                            } transition-all duration-200`}
                                            onDrop={(e) => handleDrop(e, doc.key)}
                                            onDragOver={(e) => handleDragOver(e, doc.key)}
                                            onDragLeave={(e) => handleDragLeave(e, doc.key)}
                                        >
                                            <input
                                                type="file"
                                                onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
                                                className="hidden"
                                                id={doc.key}
                                            />
                                            <label
                                                htmlFor={doc.key}
                                                className="flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {doc.label}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formData.files[doc.key]
                                                                ? formData.files[doc.key].name
                                                                : "Drag & drop atau klik untuk upload"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {formData.files[doc.key] && (
                                                    <span className="text-xs text-cyan-600 dark:text-cyan-400">
                                                        Uploaded
                                                    </span>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800"
                                >
                                    Submit Permohonan
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default CreatePermintaan;

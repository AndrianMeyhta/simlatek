import React, { useState, DragEvent } from "react";
import axios from "axios";
import { Head } from "@inertiajs/react";
import Layout from "../../Layouts/layout";
import { usePage } from "@inertiajs/react";
import { Upload } from "lucide-react";
import { confirmAlert, successAlert, errorAlert, toastNotification } from "../../Components/sweetAlert";

interface FormData {
    title: string;
    description: string;
    anggaran: string;
    files: {
        suratPermohonan: File | null;
        dataUsulan: File | null;
        petaPerencanaan: File | null;
    };
}

interface PageProps {
    nomertiket?: string;
}

const CreatePermintaan = () => {
    const { props } = usePage<{ props: PageProps }>();
    const nomertiket = (props.nomertiket as string | undefined) ?? "";

    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        anggaran: "",
        files: {
            suratPermohonan: null,
            dataUsulan: null,
            petaPerencanaan: null,
        },
    });
    const [dragOver, setDragOver] = useState<Record<string, boolean>>({});

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (
        category: keyof FormData["files"],
        file: File | null
    ) => {
        setFormData((prev) => ({
            ...prev,
            files: { ...prev.files, [category]: file },
        }));
    };

    const handleDrop = (
        e: DragEvent<HTMLDivElement>,
        category: keyof FormData["files"]
    ) => {
        e.preventDefault();
        setDragOver((prev) => ({ ...prev, [category]: false }));
        const file = e.dataTransfer.files[0];
        handleFileChange(category, file);
    };

    const handleDragOver = (
        e: DragEvent<HTMLDivElement>,
        category: keyof FormData["files"]
    ) => {
        e.preventDefault();
        setDragOver((prev) => ({ ...prev, [category]: true }));
    };

    const handleDragLeave = (
        e: DragEvent<HTMLDivElement>,
        category: keyof FormData["files"]
    ) => {
        setDragOver((prev) => ({ ...prev, [category]: false }));
    };

    const validateForm = () => {
        // Check if all required fields are filled
        if (!formData.title || !formData.anggaran) {
            errorAlert(
                "Data tidak lengkap",
                "Harap isi judul dan anggaran permohonan"
            );
            return false;
        }

        // Check if all files are uploaded
        if (
            !formData.files.suratPermohonan ||
            !formData.files.dataUsulan ||
            !formData.files.petaPerencanaan
        ) {
            errorAlert(
                "File tidak lengkap",
                "Harap upload semua dokumen yang diperlukan"
            );
            return false;
        }

        return true;
    };

    const submitForm = async () => {
        if (!validateForm()) return false;

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("anggaran", formData.anggaran);
        data.append("suratPermohonan", formData.files.suratPermohonan as File);
        data.append("dataUsulan", formData.files.dataUsulan as File);
        data.append("petaPerencanaan", formData.files.petaPerencanaan as File);

        try {
            await axios.post("/permintaan", data);

            successAlert(
                "Permohonan Berhasil",
                "Permohonan telah berhasil diajukan"
            );
            toastNotification("success", "Permohonan berhasil diajukan");

            // Reset form
            setFormData({
                title: "",
                description: "",
                anggaran: "",
                files: {
                    suratPermohonan: null,
                    dataUsulan: null,
                    petaPerencanaan: null,
                },
            });
            // window.location.href = "/permintaan";
            return true;
        } catch (error) {
            console.error(error);
            errorAlert(
                "Gagal Mengajukan",
                "Terjadi kesalahan saat mengajukan permohonan"
            );
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        confirmAlert(
            "Konfirmasi Pengajuan",
            "Apakah Anda yakin ingin mengajukan permohonan ini?",
            submitForm,
            "Ya, Ajukan",
            "Batalkan",
            "Permohonan berhasil diajukan.",
            "Gagal mengajukan permohonan."
        );
    };

    return (
        <>
            <Head title="Simlatek - Pengajuan" />
            <Layout currentActive="permohonan_pengajuan">
                <div className="p-6 min-h-screen">
                    <div className="max-w-4xl mx-auto">
                        <header className="mb-6">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                                Buat Permohonan Baru
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Lengkapi formulir di bawah untuk mengajukan
                                permohonan
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
                                        rows={4}
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
                                        {
                                            key: "suratPermohonan",
                                            label: "Surat Permohonan",
                                        },
                                        {
                                            key: "dataUsulan",
                                            label: "Data Usulan",
                                        },
                                        {
                                            key: "petaPerencanaan",
                                            label: "Peta Perencanaan SPBE",
                                        },
                                    ].map((doc) => (
                                        <div
                                            key={doc.key}
                                            className={`relative rounded-lg border-2 ${
                                                dragOver[doc.key]
                                                    ? "border-cyan-500 bg-cyan-50/50 dark:border-cyan-400 dark:bg-cyan-900/20"
                                                    : "border-dashed border-gray-300 dark:border-gray-600"
                                            } transition-all duration-200`}
                                            onDrop={(e) =>
                                                handleDrop(
                                                    e,
                                                    doc.key as keyof FormData["files"]
                                                )
                                            }
                                            onDragOver={(e) =>
                                                handleDragOver(
                                                    e,
                                                    doc.key as keyof FormData["files"]
                                                )
                                            }
                                            onDragLeave={(e) =>
                                                handleDragLeave(
                                                    e,
                                                    doc.key as keyof FormData["files"]
                                                )
                                            }
                                        >
                                            <input
                                                type="file"
                                                onChange={(e) =>
                                                    handleFileChange(
                                                        doc.key as keyof FormData["files"],
                                                        e.target.files?.[0] ||
                                                            null
                                                    )
                                                }
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
                                                            {formData.files[
                                                                doc.key as keyof FormData["files"]
                                                            ]
                                                                ? formData
                                                                      .files[
                                                                      doc.key as keyof FormData["files"]
                                                                  ]?.name
                                                                : "Drag & drop atau klik untuk upload"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {formData.files[
                                                    doc.key as keyof FormData["files"]
                                                ] && (
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

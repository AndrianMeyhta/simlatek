import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Layout from "../../Layouts/layout";
import { Head } from "@inertiajs/react";
import { SkplData, permintaanprogress, PageProps } from "../../types";
import echo from "../../echo";

interface ProgressReport {
    id: number;
    description: string;
    percentage_change: number;
    created_at: string;
    file?: { filename: string; filepath: string };
    related_files?: { filename: string; filepath: string }[];
}

const ShowPermintaan: React.FC<PageProps> = ({
    permintaan,
    project,
    permintaanprogresses: initialProgresses,
    logAktivitas,
    userPermissions,
    permintaanDokumens,
    canAddUsers,
    availableUsers,
    rekomendasi,
    role_id,
}) => {
    const [localPermintaanProgresses, setLocalPermintaanProgresses] =
        useState<permintaanprogress[]>(initialProgresses);
    const [editConstrain, setEditConstrain] = useState<{
        [key: number]: boolean;
    }>({});
    const [isDragging, setIsDragging] = useState(false);
    const [showSkplModal, setShowSkplModal] = useState(false);
    const [skplData, setSkplData] = useState<SkplData | null>({
        extracted_data: [],
    });
    const [selectedConstrainId, setSelectedConstrainId] = useState<
        number | null
    >(null);
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [progressReports, setProgressReports] = useState<{
        [key: number]: ProgressReport[];
    }>({});
    const [skillSearch, setSkillSearch] = useState("");
    const [filteredUsers, setFilteredUsers] = useState(availableUsers);
    const [rekomendasiData, setRekomendasiData] = useState(
        rekomendasi || { status: "", created_at: null },
    );
    const [rekomendasiStatus, setRekomendasiStatus] = useState<string>(
        rekomendasi?.status || "",
    );
    const [draftStatus, setDraftStatus] = useState<string>(
        rekomendasi?.status || "",
    );
    const [sortOrder, setSortOrder] = useState("asc");

    // Effect untuk mengambil progress reports
    useEffect(() => {
        const fetchProgressReports = async () => {
            try {
                for (const progress of localPermintaanProgresses) {
                    for (const constrain of progress.tahapanconstrains) {
                        if (constrain.type === "progress") {
                            const response = await axios.get(
                                `/permintaan/${permintaan.id}/progress-reports/${constrain.id}`,
                            );
                            setProgressReports((prev) => ({
                                ...prev,
                                [constrain.id]: response.data,
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch progress reports:", error);
            }
        };
        fetchProgressReports();
    }, [localPermintaanProgresses, permintaan.id]);

    // Effect untuk mengambil SKPL data
    useEffect(() => {
        const fetchSkplData = async () => {
            if (!selectedConstrainId) {
                console.log("No constrain ID selected");
                return;
            }

            try {
                console.log(
                    "Fetching SKPL data for constrain ID:",
                    selectedConstrainId,
                );
                const response = await axios.get<{ extracted_data: string[] }>(
                    `/permintaan/${permintaan.id}/skpl/${selectedConstrainId}`,
                );
                console.log("SKPL response:", response.data);
                setSkplData({
                    extracted_data: Array.isArray(response.data.extracted_data)
                        ? response.data.extracted_data
                        : [],
                });
            } catch (error) {
                console.error("Failed to fetch SKPL data:", error);
                setSkplData({ extracted_data: [] });
            }
        };

        if (showSkplModal && selectedConstrainId) {
            fetchSkplData();
        }
    }, [permintaan.id, showSkplModal, selectedConstrainId]);

    // Effect untuk mendengarkan event real-time
    useEffect(() => {
        // Berlangganan ke channel privat
        echo.private(`permintaan.${permintaan.id}`).listen(
            ".permintaan.updated",
            (e: { permintaan_id: number; action: string; data: any }) => {
                console.log("Received event:", e);
                if (e.action === "update_constrain") {
                    const {
                        constrain_id,
                        progress_id,
                        percentage,
                        status,
                        target_data,
                    } = e.data;
                    setLocalPermintaanProgresses((prev) =>
                        prev.map((p) =>
                            p.id === progress_id
                                ? {
                                      ...p,
                                      percentage,
                                      tahapanconstrains:
                                          p.tahapanconstrains.map((c) =>
                                              c.id === constrain_id
                                                  ? {
                                                        ...c,
                                                        constraindata: {
                                                            ...(c.constraindata || {
                                                                id: undefined,
                                                                permintaan_id:
                                                                    p.permintaan_id,
                                                                tahapanconstrain_id:
                                                                    c.id,
                                                                status: "pending",
                                                            }),
                                                            status,
                                                        },
                                                        target_data,
                                                    }
                                                  : c,
                                          ),
                                  }
                                : p,
                        ),
                    );

                    if (target_data?.percentage) {
                        // Perbarui progress reports
                        axios
                            .get(
                                `/permintaan/${permintaan.id}/progress-reports/${constrain_id}`,
                            )
                            .then((response) => {
                                setProgressReports((prev) => ({
                                    ...prev,
                                    [constrain_id]: response.data,
                                }));
                            })
                            .catch((error) => {
                                console.error(
                                    "Failed to fetch progress reports:",
                                    error,
                                );
                            });
                    }
                } else if (e.action === "confirm_step") {
                    const {
                        progress_id,
                        next_progress_id,
                        percentage,
                        status,
                    } = e.data;
                    setLocalPermintaanProgresses((prev) =>
                        prev.map((p) =>
                            p.id === progress_id
                                ? {
                                      ...p,
                                      status,
                                      percentage,
                                  }
                                : next_progress_id && p.id === next_progress_id
                                  ? {
                                        ...p,
                                        status: "current",
                                        description: "Tahapan sedang berjalan",
                                    }
                                  : p,
                        ),
                    );
                } else if (e.action === "rekomendasi") {
                    const { id, status, created_at } = e.data;
                    setRekomendasiStatus(status);
                    setRekomendasiData({
                        id: id || rekomendasi?.id || 0,
                        status,
                        created_at: created_at || new Date().toISOString(),
                    });
                    if (status === "Rejected") {
                        setLocalPermintaanProgresses((prev) =>
                            prev.map((p) => ({
                                ...p,
                                status: "completed",
                                percentage: 100,
                                description:
                                    p.id === e.data.progress_id
                                        ? "Tahapan ditutup karena permintaan ditolak"
                                        : p.description,
                            })),
                        );
                    }
                }
            },
        );

        // Bersihkan langganan saat komponen unmount
        return () => {
            echo.leave(`permintaan.${permintaan.id}`);
        };
    }, [permintaan.id]);

    // Effect untuk filter users berdasarkan skill
    useEffect(() => {
        setFilteredUsers(
            skillSearch.trim() === ""
                ? availableUsers
                : availableUsers.filter(
                      (user) =>
                          user.name
                              .toLowerCase()
                              .includes(skillSearch.toLowerCase()) ||
                          user.skills?.some(
                              (skill) =>
                                  skill.name
                                      .toLowerCase()
                                      .includes(skillSearch.toLowerCase()) ||
                                  skill.category
                                      .toLowerCase()
                                      .includes(skillSearch.toLowerCase()),
                          ),
                  ),
        );
    }, [skillSearch, availableUsers]);

    const hasRbieRule = (tahapanconstrain_id: number) => {
        return localPermintaanProgresses.some((progress) =>
            progress.tahapanconstrains.some(
                (constrain) =>
                    constrain.id === tahapanconstrain_id &&
                    constrain.hasRbieRule,
            ),
        );
    };

    const toggleEditConstrain = (constrainId: number) => {
        setEditConstrain((prev) => ({
            ...prev,
            [constrainId]: !prev[constrainId],
        }));
        setSelectedFile(null);
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

    const handleDrop = async (
        e: React.DragEvent<HTMLDivElement>,
        constrainId: number,
    ) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            setSelectedFile(file);
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
            }

            // Auto-save untuk upload_file yang belum fulfilled
            const progress = localPermintaanProgresses.find((p) =>
                p.tahapanconstrains.some((c) => c.id === constrainId),
            );
            const constrain = progress?.tahapanconstrains.find(
                (c) => c.id === constrainId,
            );

            if (
                constrain &&
                constrain.type === "upload_file" &&
                (!constrain.constraindata ||
                    constrain.constraindata.status === "pending")
            ) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("permintaan_id", permintaan.id.toString());
                formData.append("constrain_type", "upload_file");

                await handleEditConstrain(constrainId, formData);
            }
        }
    };

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        constrainId?: number,
    ) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Auto-save hanya untuk upload_file yang statusnya belum fulfilled
            if (constrainId) {
                const progress = localPermintaanProgresses.find((p) =>
                    p.tahapanconstrains.some((c) => c.id === constrainId),
                );
                const constrain = progress?.tahapanconstrains.find(
                    (c) => c.id === constrainId,
                );

                if (
                    constrain &&
                    constrain.type === "upload_file" &&
                    (!constrain.constraindata ||
                        constrain.constraindata.status === "pending")
                ) {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("permintaan_id", permintaan.id.toString());
                    formData.append("constrain_type", "upload_file");

                    await handleEditConstrain(constrainId, formData);
                }
            }
        }
    };

    const getConstrainStatus = (constrain: any, progressStatus: string) => {
        // Jika tahapan bukan 'current', anggap constrain belum dimulai
        if (progressStatus === "upcoming") {
            return "not_started";
        }
        // Jika tahapan completed, gunakan status fulfilled jika ada, jika tidak tetap completed
        if (progressStatus === "completed") {
            return constrain.constraindata?.status === "fulfilled"
                ? "fulfilled"
                : "completed";
        }
        // Untuk tahapan current, gunakan status constraindata atau default ke pending
        return constrain.constraindata?.status ?? "pending";
    };

    const handleInviteUser = async () => {
        if (!selectedUser || selectedUser.length === 0) return;
        try {
            await Promise.all(
                selectedUser.map((userId) =>
                    axios.post(`/permintaan/${permintaan.id}/invite-user`, {
                        user_id: userId,
                    }),
                ),
            );
            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "User berhasil diundang.",
                timer: 1500,
            });
            window.location.reload();
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Gagal mengundang user: ${error.response?.data?.message || error.message}`,
            });
        }
    };

    const handleEditConstrain = async (
        constrainId: number,
        formData: FormData,
    ) => {
        setIsLoading((prev) => ({ ...prev, [constrainId]: true }));
        try {
            formData.append(
                "_token",
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "",
            );
            const response = await axios.post(
                `/permintaan/${permintaan.id}/constrain/${constrainId}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );

            const { target_data, constrain, progress } = response.data;

            setLocalPermintaanProgresses((prev) =>
                prev.map((p) =>
                    p.id === progress.id
                        ? {
                              ...p,
                              percentage: progress.percentage,
                              tahapanconstrains: p.tahapanconstrains.map((c) =>
                                  c.id === constrainId
                                      ? {
                                            ...c,
                                            constraindata: {
                                                ...(c.constraindata || {
                                                    id: undefined,
                                                    permintaan_id:
                                                        p.permintaan_id,
                                                    tahapanconstrain_id: c.id,
                                                    status: "pending",
                                                }), // Default jika undefined
                                                status: constrain.status,
                                            },
                                            target_data,
                                        }
                                      : c,
                              ),
                          }
                        : p,
                ),
            );

            if (target_data?.percentage) {
                const progressReportsResponse = await axios.get(
                    `/permintaan/${permintaan.id}/progress-reports/${constrainId}`,
                );
                setProgressReports((prev) => ({
                    ...prev,
                    [constrainId]: progressReportsResponse.data,
                }));
            }

            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Constrain berhasil diedit.",
                timer: 1500,
            }).then(() => toggleEditConstrain(constrainId));
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            });
        } finally {
            setIsLoading((prev) => ({ ...prev, [constrainId]: false }));
        }
    };

    const handleProgressWithFile = async (
        constrainId: number,
        progressConstrainId: number,
        formData: FormData,
    ) => {
        setIsLoading((prev) => ({
            ...prev,
            [constrainId]: true,
            [progressConstrainId]: true,
        }));
        try {
            if (!selectedFile) throw new Error("File upload required");
            formData.append("file", selectedFile);
            const response = await axios.post(
                `/permintaan/${permintaan.id}/constrain/${progressConstrainId}/with-file`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );

            const { target_data, progress_report, progress } = response.data;

            setLocalPermintaanProgresses((prev) =>
                prev.map((p) =>
                    p.id === progress.id
                        ? {
                              ...p,
                              percentage: progress.percentage,
                              tahapanconstrains: p.tahapanconstrains.map((c) =>
                                  c.id === progressConstrainId ||
                                  c.type === "upload_file"
                                      ? {
                                            ...c,
                                            constraindata: {
                                                ...(c.constraindata || {
                                                    id: undefined,
                                                    permintaan_id:
                                                        p.permintaan_id,
                                                    tahapanconstrain_id: c.id,
                                                    status: "pending",
                                                }),
                                                status: "fulfilled",
                                            },
                                            target_data:
                                                c.type === "upload_file"
                                                    ? target_data
                                                    : c.target_data,
                                        }
                                      : c,
                              ),
                          }
                        : p,
                ),
            );

            setProgressReports((prev) => ({
                ...prev,
                [progressConstrainId]: [
                    ...(prev[progressConstrainId] || []),
                    progress_report,
                ],
            }));

            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Progress dan file berhasil diupload.",
                timer: 1500,
            }).then(() => toggleEditConstrain(progressConstrainId));
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            });
        } finally {
            setIsLoading((prev) => ({
                ...prev,
                [constrainId]: false,
                [progressConstrainId]: false,
            }));
            setSelectedFile(null);
        }
    };

    const handleRekomendasiSubmit = async (progressId: number) => {
        setIsLoading((prev) => ({ ...prev, [progressId]: true }));
        try {
            const formData = new FormData();
            formData.append("permintaan_id", permintaan.id.toString());
            formData.append("status", draftStatus); // Gunakan draftStatus dari state komponen
            formData.append(
                "_token",
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "",
            );

            const response = await axios.post(
                `/permintaan/${permintaan.id}/rekomendasi`,
                formData,
            );

            // Update rekomendasiData dan rekomendasiStatus setelah sukses
            setRekomendasiData(response.data.rekomendasi);
            setRekomendasiStatus(response.data.rekomendasi.status);

            if (response.data.rekomendasi.status === "Rejected") {
                setLocalPermintaanProgresses((prev) =>
                    prev.map((p) => ({
                        ...p,
                        status: "completed",
                        percentage: 100,
                        description:
                            p.id === progressId
                                ? "Tahapan ditutup karena permintaan ditolak"
                                : p.description,
                    })),
                );
                Swal.fire({
                    icon: "warning",
                    title: "Proyek Ditolak",
                    text: "Permintaan telah ditolak dan proyek ditutup.",
                    timer: 1500,
                }).then(() => {
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Rekomendasi telah disimpan.",
                    timer: 1500,
                });
            }
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
            });
        } finally {
            setIsLoading((prev) => ({ ...prev, [progressId]: false }));
        }
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
                    const response = await axios.post(
                        `/permintaan/${permintaan.id}/confirm-step`,
                        {
                            permintaanprogressId: progressId,
                            permintaan_id: permintaan.id,
                            _token: document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute("content"),
                        },
                    );

                    const { current_progress, next_progress } = response.data;

                    setLocalPermintaanProgresses((prev) =>
                        prev.map((p) =>
                            p.id === current_progress.id
                                ? {
                                      ...p,
                                      status: current_progress.status,
                                      percentage: current_progress.percentage,
                                      description: current_progress.description,
                                  }
                                : next_progress && p.id === next_progress.id
                                  ? {
                                        ...p,
                                        status: next_progress.status,
                                        description: next_progress.description,
                                    }
                                  : p,
                        ),
                    );

                    Swal.fire({
                        icon: "success",
                        title: "Berhasil!",
                        text: "Tahapan berhasil dikonfirmasi.",
                        timer: 1500,
                    });
                } catch (error: any) {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: `Gagal mengonfirmasi tahapan: ${error.response?.data?.message || error.message}`,
                    });
                } finally {
                    setIsLoading((prev) => ({ ...prev, [progressId]: false }));
                }
            } else {
                setIsLoading((prev) => ({ ...prev, [progressId]: false }));
            }
        });
    };

    const canConfirmStep = (progress: permintaanprogress, index: number) => {
        if (
            progress.status !== "current" ||
            progress.tahapanconstrains.length === 0
        )
            return false;

        const hasUploadFile = progress.tahapanconstrains.some(
            (c) => c.type === "upload_file",
        );
        const hasProgress = progress.tahapanconstrains.some(
            (c) => c.type === "progress",
        );
        const allUploadFilesFulfilled = progress.tahapanconstrains
            .filter((c) => c.type === "upload_file")
            .every((c) => c.constraindata?.status === "fulfilled");
        const progressPercentage = progress.percentage >= 100;

        if (index === 3) {
            return (
                (hasUploadFile && hasProgress
                    ? allUploadFilesFulfilled && progressPercentage
                    : hasProgress
                      ? progressPercentage
                      : progress.tahapanconstrains.every(
                            (c) => c.constraindata?.status === "fulfilled",
                        )) &&
                rekomendasiStatus !== "" &&
                rekomendasiStatus !== "Pending"
            );
        }

        return hasUploadFile && hasProgress
            ? allUploadFilesFulfilled && progressPercentage
            : hasProgress
              ? progressPercentage
              : progress.tahapanconstrains.every(
                    (c) => c.constraindata?.status === "fulfilled",
                );
    };

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

    const renderPermintaanDokumens = () => {
        if (!permintaanDokumens || permintaanDokumens.length === 0) return null;
        const kategoriNames = {
            1: "Surat Permohonan",
            2: "Data Usulan",
            3: "Peta Perencanaan",
        };
        return (
            <div className="mt-4">
                <h6 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                    Dokumen Permintaan
                </h6>
                <div className="flex flex-col gap-3">
                    {permintaanDokumens.map((dokumen) => (
                        <div
                            key={dokumen.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
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
                                    {kategoriNames[
                                        dokumen.dokumenkategori_id as keyof typeof kategoriNames
                                    ] || "Dokumen Lain"}
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

    const renderProgressReports = (constrainId: number) => {
        const reports = progressReports[constrainId] || [];
        if (reports.length === 0)
            return (
                <p className="text-sm text-gray-500">
                    Belum ada riwayat progress.
                </p>
            );
        return (
            <div className="mt-3 space-y-3 max-h-60 overflow-y-auto pr-1">
                <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Riwayat Progress:
                </h6>
                <div className="space-y-3">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-gray-50 dark:bg-gray-700 p-3.5 rounded-md border border-gray-100 dark:border-gray-600"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {report.description}
                                    </p>
                                    <div className="flex items-center mt-1.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            +{report.percentage_change}%
                                        </span>
                                        <span className="mx-1.5 text-gray-300 dark:text-gray-600">
                                            •
                                        </span>
                                        <p className="text-xs text-gray-500">
                                            {new Date(
                                                report.created_at,
                                            ).toLocaleString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1.5">
                                    {report.file && (
                                        <a
                                            href={`/storage/${report.file.filepath.replace("public/", "")}`}
                                            className="text-blue-600 hover:text-blue-700 text-xs flex items-center group"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-1 group-hover:translate-y-[-1px] transition-transform duration-150"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                                />
                                            </svg>
                                            <span className="group-hover:underline">
                                                {report.file.filename}
                                            </span>
                                        </a>
                                    )}
                                    {report.related_files?.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={`/storage/${file.filepath.replace("public/", "")}`}
                                            className="text-blue-600 hover:text-blue-700 text-xs flex items-center group"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-1 group-hover:translate-y-[-1px] transition-transform duration-150"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                                />
                                            </svg>
                                            <span className="group-hover:underline">
                                                {file.filename}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderConstrainData = (constrain: any) => {
        if (
            constrain.type === "upload_file" &&
            constrain.constraindata?.status === "fulfilled" &&
            constrain.target_data
        ) {
            return (
                <div className="mt-2.5 pl-7">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        File terlampir:
                    </p>
                    <a
                        href={`/storage/${constrain.target_data.filepath?.replace("public/", "")}`}
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
                            {constrain.target_data.filename || "Lihat file"}
                        </span>
                    </a>
                </div>
            );
        } else if (constrain.type === "schedule" && constrain.target_data) {
            return (
                <div className="mt-2.5 pl-7">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Jadwal:
                    </p>
                    <p className="text-sm mt-1 flex items-center text-gray-800 dark:text-gray-200">
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        {new Date(
                            constrain.target_data.jadwalrapat,
                        ).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>
            );
        } else if (constrain.type === "text" && constrain.target_data) {
            return (
                <div className="mt-2.5 pl-7">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Teks:
                    </p>
                    <p className="text-sm mt-1 text-gray-800 dark:text-gray-200">
                        {constrain.target_data.links ||
                            constrain.target_data.text ||
                            constrain.target_data.value ||
                            "Tidak tersedia"}
                    </p>
                </div>
            );
        } else if (constrain.type === "progress") {
            return renderProgressReports(constrain.id);
        }
        return null;
    };

    return (
        <>
            <Head title="Simlatek - Detail Permintaan" />
            <Layout currentActive="permohonan_daftar">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                        <div className="bg-gradient-to-r mb-6 from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="h-3 bg-blue-500 dark:bg-blue-600"></div>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="max-w-xl">
                                        <div className="flex items-center mb-2">
                                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mr-3">
                                                {project.name}
                                            </h2>
                                            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                                {permintaan.nomertiket}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                            {project.description}
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
                                                {permintaan.created_at
                                                    ? new Date(
                                                          permintaan.created_at,
                                                      ).toLocaleDateString(
                                                          "id-ID",
                                                          {
                                                              day: "numeric",
                                                              month: "long",
                                                              year: "numeric",
                                                          },
                                                      )
                                                    : "Tidak tersedia"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:items-end justify-between">
                                        <div className="mb-4">
                                            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                                                    Status:
                                                </span>
                                                {localPermintaanProgresses.some(
                                                    (p) =>
                                                        p.status === "current",
                                                ) ? (
                                                    <span className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                                                        Dalam Proses
                                                    </span>
                                                ) : localPermintaanProgresses.every(
                                                      (p) =>
                                                          p.status ===
                                                          "completed",
                                                  ) ? (
                                                    <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                        Selesai
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-yellow-600 dark:text-yellow-400 font-medium">
                                                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                                        Menunggu
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {canAddUsers && (
                                                <button
                                                    onClick={() =>
                                                        setShowInviteModal(true)
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
                                                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                                        />
                                                    </svg>
                                                    Invite
                                                </button>
                                            )}
                                            <button
                                                onClick={() =>
                                                    setShowLogModal(true)
                                                }
                                                className="px-4 py-2 bg-white dark:bg-gray-800 text-yellow-600 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-150 flex items-center shadow-sm"
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
                                                        d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z"
                                                    />
                                                </svg>
                                                Log
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
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
                                                Pemohon
                                            </p>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                {permintaan.users?.name ||
                                                    "Tidak diketahui"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                        <div className="flex-shrink-0 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 p-2 rounded-lg mr-3">
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
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Dikelola oleh
                                            </p>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                {project.dikelola?.name ||
                                                    "Tidak diketahui"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                            <svg
                                className="w-5 h-5 mr-2 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            Progress Permintaan
                        </h3>
                        <div className="space-y-6">
                            {localPermintaanProgresses.length > 0 ? (
                                localPermintaanProgresses.map(
                                    (progress, index) => (
                                        <div
                                            key={progress.id}
                                            className="relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getStatusColor(progress.status)} shadow-sm`}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                                        {progress.tahapan
                                                            ?.name ||
                                                            `Tahapan ${progress.permintaantahapan_id} (Tidak Diketahui)`}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <span
                                                        className={`text-sm font-medium ${progress.status === "completed" ? "text-green-600" : progress.status === "current" ? "text-blue-600" : "text-gray-500"}`}
                                                    >
                                                        {progress.percentage}%
                                                    </span>
                                                    <span
                                                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                                            progress.status ===
                                                            "completed"
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                : progress.status ===
                                                                    "current"
                                                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
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
                                                    className={`h-2.5 rounded-full ${getStatusColor(progress.status)}`}
                                                    style={{
                                                        width: `${progress.percentage}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                {progress.description ||
                                                    "Tidak ada deskripsi"}
                                            </p>
                                            {index === 0 &&
                                                renderPermintaanDokumens()}
                                            {progress.tahapanconstrains
                                                ?.length > 0 && (
                                                <div className="space-y-4 mt-5">
                                                    {progress.tahapanconstrains.map(
                                                        (constrain) => {
                                                            const constrainStatus =
                                                                getConstrainStatus(
                                                                    constrain,
                                                                    progress.status,
                                                                ); // Menggunakan fungsi getConstrainStatus
                                                            const hasPermission =
                                                                userPermissions.includes(
                                                                    progress.permintaantahapan_id,
                                                                );
                                                            const progressConstrains =
                                                                progress.tahapanconstrains.filter(
                                                                    (c) =>
                                                                        c.type ===
                                                                        "progress",
                                                                );
                                                            const uploadFileConstrains =
                                                                progress.tahapanconstrains.filter(
                                                                    (c) =>
                                                                        c.type ===
                                                                        "upload_file",
                                                                );
                                                            const hasProgressAndUploadFile =
                                                                progressConstrains.length >
                                                                    0 &&
                                                                uploadFileConstrains.length >
                                                                    0;

                                                            if (
                                                                hasProgressAndUploadFile &&
                                                                constrain.type ===
                                                                    "upload_file"
                                                            )
                                                                return null;

                                                            return (
                                                                <div
                                                                    key={
                                                                        constrain.id
                                                                    }
                                                                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                                                                >
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <div className="flex items-center space-x-2.5">
                                                                            {constrain.type ===
                                                                                "schedule" && (
                                                                                <div className="rounded-full bg-indigo-50 dark:bg-indigo-900/20 p-1.5">
                                                                                    <svg
                                                                                        className="w-5 h-5 text-indigo-500"
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
                                                                                </div>
                                                                            )}
                                                                            {constrain.type ===
                                                                                "upload_file" && (
                                                                                <div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-1.5">
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
                                                                            )}
                                                                            {constrain.type ===
                                                                                "text" && (
                                                                                <div className="rounded-full bg-amber-50 dark:bg-amber-900/20 p-1.5">
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
                                                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                                        />
                                                                                    </svg>
                                                                                </div>
                                                                            )}
                                                                            {constrain.type ===
                                                                                "progress" && (
                                                                                <div className="rounded-full bg-green-50 dark:bg-green-900/20 p-1.5">
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
                                                                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                                                        />
                                                                                    </svg>
                                                                                </div>
                                                                            )}
                                                                            <h6 className="text-md font-semibold text-gray-900 dark:text-white">
                                                                                {constrain.name ||
                                                                                    "Unnamed Constrain"}
                                                                                {hasProgressAndUploadFile &&
                                                                                    constrain.type ===
                                                                                        "progress" && (
                                                                                        <span className="ml-2 text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                                            Memerlukan
                                                                                            File
                                                                                        </span>
                                                                                    )}
                                                                            </h6>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            {hasPermission &&
                                                                                hasRbieRule(
                                                                                    constrain.id,
                                                                                ) &&
                                                                                (progress.status ===
                                                                                    "current" ||
                                                                                    getConstrainStatus(
                                                                                        constrain,
                                                                                        progress.status,
                                                                                    ) ===
                                                                                        "fulfilled" ||
                                                                                    progress.status ===
                                                                                        "completed") && (
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            console.log(
                                                                                                "Opening modal for constrain ID:",
                                                                                                constrain.id,
                                                                                            );
                                                                                            setSelectedConstrainId(
                                                                                                constrain.id,
                                                                                            );
                                                                                            setShowSkplModal(
                                                                                                true,
                                                                                            );
                                                                                        }}
                                                                                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors duration-150"
                                                                                    >
                                                                                        Ringkasan
                                                                                        (Beta)
                                                                                    </button>
                                                                                )}
                                                                            <span
                                                                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                                                    constrainStatus ===
                                                                                        "fulfilled" ||
                                                                                    constrainStatus ===
                                                                                        "confirmed"
                                                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                                        : constrainStatus ===
                                                                                            "not_started"
                                                                                          ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                                                          : constrainStatus ===
                                                                                              "completed"
                                                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                                                }`}
                                                                            >
                                                                                {constrainStatus ===
                                                                                    "fulfilled" ||
                                                                                constrainStatus ===
                                                                                    "confirmed"
                                                                                    ? "Terpenuhi"
                                                                                    : constrainStatus ===
                                                                                        "not_started"
                                                                                      ? "Belum Dimulai"
                                                                                      : constrainStatus ===
                                                                                          "completed"
                                                                                        ? "Selesai"
                                                                                        : "Pending"}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {(constrainStatus ===
                                                                        "fulfilled" ||
                                                                        constrainStatus ===
                                                                            "confirmed") &&
                                                                        renderConstrainData(
                                                                            constrain,
                                                                        )}
                                                                    {constrainStatus !==
                                                                        "not_started" &&
                                                                    !editConstrain[
                                                                        constrain
                                                                            .id
                                                                    ]
                                                                        ? hasPermission &&
                                                                          progress.status ===
                                                                              "current" && (
                                                                              <div className="mt-3 pl-7 flex items-center space-x-2">
                                                                                  <button
                                                                                      onClick={() =>
                                                                                          toggleEditConstrain(
                                                                                              constrain.id,
                                                                                          )
                                                                                      }
                                                                                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-150 flex items-center text-sm"
                                                                                  >
                                                                                      <svg
                                                                                          className="w-4 h-4 mr-1"
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
                                                                                      {constrainStatus ===
                                                                                      "pending"
                                                                                          ? "Isi Data"
                                                                                          : "Edit Data"}
                                                                                  </button>
                                                                              </div>
                                                                          )
                                                                        : constrainStatus !==
                                                                              "not_started" && (
                                                                              <form
                                                                                  onSubmit={(
                                                                                      e,
                                                                                  ) => {
                                                                                      e.preventDefault();
                                                                                      const formData =
                                                                                          new FormData(
                                                                                              e.currentTarget,
                                                                                          );
                                                                                      formData.append(
                                                                                          "permintaan_id",
                                                                                          permintaan.id.toString(),
                                                                                      );
                                                                                      if (
                                                                                          constrain.type ===
                                                                                              "progress" &&
                                                                                          hasProgressAndUploadFile
                                                                                      ) {
                                                                                          if (
                                                                                              !selectedFile
                                                                                          ) {
                                                                                              Swal.fire(
                                                                                                  {
                                                                                                      icon: "error",
                                                                                                      title: "File Dibutuhkan",
                                                                                                      text: "Anda harus mengunggah file untuk update progress ini.",
                                                                                                  },
                                                                                              );
                                                                                              return;
                                                                                          }
                                                                                          handleProgressWithFile(
                                                                                              uploadFileConstrains[0]
                                                                                                  ?.id ||
                                                                                                  constrain.id,
                                                                                              constrain.id,
                                                                                              formData,
                                                                                          );
                                                                                      } else {
                                                                                          formData.append(
                                                                                              "constrain_type",
                                                                                              constrain.type,
                                                                                          );
                                                                                          handleEditConstrain(
                                                                                              constrain.id,
                                                                                              formData,
                                                                                          );
                                                                                      }
                                                                                  }}
                                                                                  className="space-y-4 mt-4 pl-7 border-t border-gray-100 dark:border-gray-700 pt-4"
                                                                              >
                                                                                  {constrain.type ===
                                                                                      "schedule" && (
                                                                                      <div>
                                                                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                                              Jadwal
                                                                                          </label>
                                                                                          <input
                                                                                              type="datetime-local"
                                                                                              name="value"
                                                                                              className="w-full p-2.5 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                                                                              required
                                                                                          />
                                                                                      </div>
                                                                                  )}
                                                                                  {constrain.type ===
                                                                                      "upload_file" && (
                                                                                      <div>
                                                                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                                                                                                  e,
                                                                                              ) =>
                                                                                                  handleDrop(
                                                                                                      e,
                                                                                                      constrain.id,
                                                                                                  )
                                                                                              }
                                                                                              onClick={() =>
                                                                                                  fileInputRef.current?.click()
                                                                                              }
                                                                                              className={`p-5 border-2 border-dashed rounded-md text-center cursor-pointer transition-all duration-200 ${
                                                                                                  isDragging
                                                                                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                                                                      : selectedFile
                                                                                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                                                                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                                                                                              }`}
                                                                                          >
                                                                                              <input
                                                                                                  type="file"
                                                                                                  name="file"
                                                                                                  ref={
                                                                                                      fileInputRef
                                                                                                  }
                                                                                                  className="hidden"
                                                                                                  onChange={
                                                                                                      handleFileChange
                                                                                                  }
                                                                                                  required
                                                                                              />
                                                                                              {selectedFile ? (
                                                                                                  <div className="flex flex-col items-center">
                                                                                                      <svg
                                                                                                          className="w-10 h-10 text-green-500 mb-2"
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
                                                                                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                                          File
                                                                                                          dipilih:{" "}
                                                                                                          {
                                                                                                              selectedFile.name
                                                                                                          }
                                                                                                      </p>
                                                                                                      <p className="text-xs text-gray-500 mt-1">
                                                                                                          Klik
                                                                                                          untuk
                                                                                                          mengganti
                                                                                                      </p>
                                                                                                  </div>
                                                                                              ) : isDragging ? (
                                                                                                  <div className="flex flex-col items-center">
                                                                                                      <svg
                                                                                                          className="w-10 h-10 text-blue-500 mb-2"
                                                                                                          fill="none"
                                                                                                          stroke="currentColor"
                                                                                                          viewBox="0 0 24 24"
                                                                                                      >
                                                                                                          <path
                                                                                                              strokeLinecap="round"
                                                                                                              strokeLinejoin="round"
                                                                                                              strokeWidth="2"
                                                                                                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                                                                                          />
                                                                                                      </svg>
                                                                                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                                          Drop
                                                                                                          file
                                                                                                          di
                                                                                                          sini
                                                                                                      </p>
                                                                                                  </div>
                                                                                              ) : (
                                                                                                  <div className="flex flex-col items-center">
                                                                                                      <svg
                                                                                                          className="w-10 h-10 text-gray-400 mb-2"
                                                                                                          fill="none"
                                                                                                          stroke="currentColor"
                                                                                                          viewBox="0 0 24 24"
                                                                                                      >
                                                                                                          <path
                                                                                                              strokeLinecap="round"
                                                                                                              strokeLinejoin="round"
                                                                                                              strokeWidth="2"
                                                                                                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                                                                                          />
                                                                                                      </svg>
                                                                                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                                          Drag
                                                                                                          &
                                                                                                          drop
                                                                                                          atau
                                                                                                          klik
                                                                                                          untuk
                                                                                                          memilih
                                                                                                      </p>
                                                                                                      <p className="text-xs text-gray-500 mt-1">
                                                                                                          Maks.
                                                                                                          10MB
                                                                                                      </p>
                                                                                                  </div>
                                                                                              )}
                                                                                          </div>
                                                                                      </div>
                                                                                  )}
                                                                                  {constrain.type ===
                                                                                      "text" && (
                                                                                      <div>
                                                                                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                                              Teks
                                                                                          </label>
                                                                                          <input
                                                                                              type="text"
                                                                                              name="value"
                                                                                              className="w-full p-2.5 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                                                                              required
                                                                                          />
                                                                                      </div>
                                                                                  )}
                                                                                  {constrain.type ===
                                                                                      "progress" && (
                                                                                      <div className="space-y-4">
                                                                                          <div>
                                                                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                                                  Deskripsi
                                                                                              </label>
                                                                                              <textarea
                                                                                                  name="description"
                                                                                                  className="w-full p-2.5 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                                                                                  rows={
                                                                                                      3
                                                                                                  }
                                                                                                  required
                                                                                              />
                                                                                          </div>
                                                                                          <div>
                                                                                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                                                  Persentase
                                                                                                  Perubahan
                                                                                              </label>
                                                                                              <div className="relative">
                                                                                                  <input
                                                                                                      type="number"
                                                                                                      name="percentage_change"
                                                                                                      min="0"
                                                                                                      max="100"
                                                                                                      className="w-full p-2.5 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 pr-8"
                                                                                                      required
                                                                                                  />
                                                                                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                                                                      <span className="text-gray-500">
                                                                                                          %
                                                                                                      </span>
                                                                                                  </div>
                                                                                              </div>
                                                                                          </div>
                                                                                          {hasProgressAndUploadFile && (
                                                                                              <div>
                                                                                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                                                      Unggah
                                                                                                      File{" "}
                                                                                                      <span className="text-red-500 ml-1">
                                                                                                          *
                                                                                                      </span>
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
                                                                                                          e,
                                                                                                      ) =>
                                                                                                          handleDrop(
                                                                                                              e,
                                                                                                              constrain.id,
                                                                                                          )
                                                                                                      }
                                                                                                      onClick={() =>
                                                                                                          fileInputRef.current?.click()
                                                                                                      }
                                                                                                      className={`p-5 border-2 border-dashed rounded-md text-center cursor-pointer transition-all duration-200 ${
                                                                                                          isDragging
                                                                                                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                                                                              : selectedFile
                                                                                                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                                                                                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                                                                                                      }`}
                                                                                                  >
                                                                                                      <input
                                                                                                          type="file"
                                                                                                          name="file"
                                                                                                          ref={
                                                                                                              fileInputRef
                                                                                                          }
                                                                                                          className="hidden"
                                                                                                          onChange={
                                                                                                              handleFileChange
                                                                                                          }
                                                                                                          required
                                                                                                      />
                                                                                                      {selectedFile ? (
                                                                                                          <div className="flex flex-col items-center">
                                                                                                              <svg
                                                                                                                  className="w-10 h-10 text-green-500 mb-2"
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
                                                                                                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                                                  File
                                                                                                                  dipilih:{" "}
                                                                                                                  {
                                                                                                                      selectedFile.name
                                                                                                                  }
                                                                                                              </p>
                                                                                                              <p className="text-xs text-gray-500 mt-1">
                                                                                                                  Klik
                                                                                                                  untuk
                                                                                                                  mengganti
                                                                                                              </p>
                                                                                                          </div>
                                                                                                      ) : isDragging ? (
                                                                                                          <div className="flex flex-col items-center">
                                                                                                              <svg
                                                                                                                  className="w-10 h-10 text-blue-500 mb-2"
                                                                                                                  fill="none"
                                                                                                                  stroke="currentColor"
                                                                                                                  viewBox="0 0 24 24"
                                                                                                              >
                                                                                                                  <path
                                                                                                                      strokeLinecap="round"
                                                                                                                      strokeLinejoin="round"
                                                                                                                      strokeWidth="2"
                                                                                                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                                                                                                  />
                                                                                                              </svg>
                                                                                                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                                                  Drop
                                                                                                                  file
                                                                                                                  di
                                                                                                                  sini
                                                                                                              </p>
                                                                                                          </div>
                                                                                                      ) : (
                                                                                                          <div className="flex flex-col items-center">
                                                                                                              <svg
                                                                                                                  className="w-10 h-10 text-gray-400 mb-2"
                                                                                                                  fill="none"
                                                                                                                  stroke="currentColor"
                                                                                                                  viewBox="0 0 24 24"
                                                                                                              >
                                                                                                                  <path
                                                                                                                      strokeLinecap="round"
                                                                                                                      strokeLinejoin="round"
                                                                                                                      strokeWidth="2"
                                                                                                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                                                                                                  />
                                                                                                              </svg>
                                                                                                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                                                                  Drag
                                                                                                                  &
                                                                                                                  drop
                                                                                                                  atau
                                                                                                                  klik
                                                                                                                  untuk
                                                                                                                  memilih
                                                                                                              </p>
                                                                                                              <p className="text-xs text-gray-500 mt-1">
                                                                                                                  Maks.
                                                                                                                  10MB
                                                                                                              </p>
                                                                                                          </div>
                                                                                                      )}
                                                                                                  </div>
                                                                                                  <p className="text-xs text-red-500 mt-1">
                                                                                                      File
                                                                                                      wajib
                                                                                                      diunggah
                                                                                                      untuk
                                                                                                      setiap
                                                                                                      update
                                                                                                      progress
                                                                                                  </p>
                                                                                              </div>
                                                                                          )}
                                                                                      </div>
                                                                                  )}
                                                                                  <div className="flex space-x-2">
                                                                                      <button
                                                                                          type="submit"
                                                                                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-150 flex items-center"
                                                                                          disabled={
                                                                                              isLoading[
                                                                                                  constrain
                                                                                                      .id
                                                                                              ] ||
                                                                                              (hasProgressAndUploadFile &&
                                                                                                  constrain.type ===
                                                                                                      "progress" &&
                                                                                                  !selectedFile)
                                                                                          }
                                                                                      >
                                                                                          {isLoading[
                                                                                              constrain
                                                                                                  .id
                                                                                          ] ? (
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
                                                                                      <button
                                                                                          type="button"
                                                                                          onClick={() =>
                                                                                              toggleEditConstrain(
                                                                                                  constrain.id,
                                                                                              )
                                                                                          }
                                                                                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                                                                      >
                                                                                          Batal
                                                                                      </button>
                                                                                  </div>
                                                                              </form>
                                                                          )}
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                    {index === 3 && (
                                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="flex items-center space-x-2.5">
                                                                    <div className="rounded-full bg-purple-50 dark:bg-purple-900/20 p-1.5">
                                                                        <svg
                                                                            className="w-5 h-5 text-purple-500"
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
                                                                    <h6 className="text-md font-semibold text-gray-900 dark:text-white">
                                                                        Rekomendasi
                                                                    </h6>
                                                                </div>
                                                                <span
                                                                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                                        rekomendasiStatus ===
                                                                        "Approved"
                                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                            : rekomendasiStatus ===
                                                                                "Rejected"
                                                                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                                              : progress.status ===
                                                                                  "current"
                                                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                                    }`}
                                                                >
                                                                    {rekomendasiStatus ===
                                                                    "Approved"
                                                                        ? "Disetujui"
                                                                        : rekomendasiStatus ===
                                                                            "Rejected"
                                                                          ? "Ditolak"
                                                                          : progress.status ===
                                                                              "current"
                                                                            ? "Pending"
                                                                            : "Belum Dimulai"}
                                                                </span>
                                                            </div>
                                                            {progress.status ===
                                                                "current" &&
                                                            (!rekomendasiStatus ||
                                                                rekomendasiStatus ===
                                                                    "") &&
                                                            userPermissions.includes(
                                                                progress.permintaantahapan_id,
                                                            ) ? (
                                                                <form
                                                                    onSubmit={(
                                                                        e,
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        handleRekomendasiSubmit(
                                                                            progress.id,
                                                                        );
                                                                    }}
                                                                    className="space-y-4 mt-4 pl-7 border-t border-gray-100 dark:border-gray-700 pt-4"
                                                                >
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                                            Pilih
                                                                            Rekomendasi
                                                                        </label>
                                                                        <select
                                                                            value={
                                                                                draftStatus
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setDraftStatus(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="w-full p-2.5 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                                                            required
                                                                        >
                                                                            <option value="">
                                                                                Pilih
                                                                                Status
                                                                            </option>
                                                                            <option value="Approved">
                                                                                Disetujui
                                                                            </option>
                                                                            <option value="Rejected">
                                                                                Ditolak
                                                                            </option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            type="submit"
                                                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-150 flex items-center"
                                                                            disabled={
                                                                                isLoading[
                                                                                    progress
                                                                                        .id
                                                                                ] ||
                                                                                !draftStatus
                                                                            }
                                                                        >
                                                                            {isLoading[
                                                                                progress
                                                                                    .id
                                                                            ] ? (
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
                                                                </form>
                                                            ) : (
                                                                <div className="mt-2.5 pl-7">
                                                                    {rekomendasiStatus &&
                                                                    rekomendasiStatus !==
                                                                        "" ? (
                                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                            Status
                                                                            telah
                                                                            ditentukan
                                                                            pada:{" "}
                                                                            {rekomendasiData.created_at
                                                                                ? new Date(
                                                                                      rekomendasiData.created_at,
                                                                                  ).toLocaleString(
                                                                                      "id-ID",
                                                                                      {
                                                                                          day: "numeric",
                                                                                          month: "long",
                                                                                          year: "numeric",
                                                                                          hour: "2-digit",
                                                                                          minute: "2-digit",
                                                                                      },
                                                                                  )
                                                                                : "Tidak diketahui"}
                                                                        </p>
                                                                    ) : progress.status !==
                                                                      "current" ? (
                                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                            Rekomendasi
                                                                            belum
                                                                            tersedia
                                                                            untuk
                                                                            tahapan
                                                                            ini
                                                                        </p>
                                                                    ) : (
                                                                        <p className="text-sm text-red-500"></p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {userPermissions.includes(
                                                progress.permintaantahapan_id,
                                            ) &&
                                                canConfirmStep(
                                                    progress,
                                                    index,
                                                ) && (
                                                    <button
                                                        onClick={() =>
                                                            confirmStep(
                                                                progress.id,
                                                            )
                                                        }
                                                        className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-150 flex items-center"
                                                        disabled={
                                                            isLoading[
                                                                progress.id
                                                            ]
                                                        }
                                                    >
                                                        {isLoading[
                                                            progress.id
                                                        ] ? (
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
                                                                Mengonfirmasi...
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
                                                                Konfirmasi
                                                                Tahapan
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                        </div>
                                    ),
                                )
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
                                        Belum ada tahapan
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Belum ada tahapan proyek yang tersedia.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    {showInviteModal && (
                        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full animate-fadeIn border border-gray-200 dark:border-gray-700">
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
                                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                        />
                                    </svg>
                                    Undang Pengguna
                                </h3>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Cari berdasarkan nama atau skill
                                    </label>
                                    <input
                                        type="text"
                                        value={skillSearch}
                                        onChange={(e) =>
                                            setSkillSearch(e.target.value)
                                        }
                                        className="w-full p-2.5 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                                        placeholder="Ketik nama, skill, atau kategori..."
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 dark:border-gray-600 rounded-md">
                                    <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                                        <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                                            <tr>
                                                <th className="p-2 text-left">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => {
                                                            const checked =
                                                                e.target
                                                                    .checked;
                                                            setSelectedUser(
                                                                checked
                                                                    ? filteredUsers.map(
                                                                          (u) =>
                                                                              u.id.toString(),
                                                                      )
                                                                    : [],
                                                            );
                                                        }}
                                                        checked={
                                                            filteredUsers.length >
                                                                0 &&
                                                            filteredUsers.every(
                                                                (u) =>
                                                                    selectedUser.includes(
                                                                        u.id.toString(),
                                                                    ),
                                                            )
                                                        }
                                                    />
                                                </th>
                                                <th className="p-2 text-left">
                                                    Nama
                                                </th>
                                                <th className="p-2 text-left">
                                                    Skill
                                                </th>
                                                <th className="p-2 text-left">
                                                    Jumlah Aplikasi
                                                    <button
                                                        onClick={() => {
                                                            setFilteredUsers(
                                                                [
                                                                    ...filteredUsers,
                                                                ].sort(
                                                                    (a, b) =>
                                                                        sortOrder ===
                                                                        "asc"
                                                                            ? a.application_count -
                                                                              b.application_count
                                                                            : b.application_count -
                                                                              a.application_count,
                                                                ),
                                                            );
                                                            setSortOrder(
                                                                sortOrder ===
                                                                    "asc"
                                                                    ? "desc"
                                                                    : "asc",
                                                            );
                                                        }}
                                                        className="ml-2 text-blue-500 hover:text-blue-700"
                                                    >
                                                        {sortOrder === "asc"
                                                            ? "↑"
                                                            : "↓"}
                                                    </button>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map((user) => (
                                                    <tr
                                                        key={user.id}
                                                        className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <td className="p-2">
                                                            <input
                                                                type="checkbox"
                                                                value={user.id}
                                                                checked={selectedUser.includes(
                                                                    user.id.toString(),
                                                                )}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const value =
                                                                        e.target
                                                                            .value;
                                                                    setSelectedUser(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev
                                                                                ? e
                                                                                      .target
                                                                                      .checked
                                                                                    ? [
                                                                                          ...prev,
                                                                                          value,
                                                                                      ]
                                                                                    : prev.filter(
                                                                                          (
                                                                                              id,
                                                                                          ) =>
                                                                                              id !==
                                                                                              value,
                                                                                      )
                                                                                : [
                                                                                      value,
                                                                                  ],
                                                                    );
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            {user.name}
                                                        </td>
                                                        <td className="p-2">
                                                            {user.skills
                                                                ?.map(
                                                                    (s) =>
                                                                        s.name,
                                                                )
                                                                .join(", ") ||
                                                                "Tidak ada skill"}
                                                        </td>
                                                        <td className="p-2">
                                                            {
                                                                user.application_count
                                                            }
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="p-2 text-center text-gray-500"
                                                    >
                                                        Tidak ada pengguna yang
                                                        ditemukan
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() =>
                                            setShowInviteModal(false)
                                        }
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleInviteUser}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-150 flex items-center"
                                        disabled={
                                            !selectedUser ||
                                            selectedUser.length === 0
                                        }
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
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Undang
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showLogModal && (
                        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full animate-fadeIn border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 text-yellow-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z"
                                        />
                                    </svg>
                                    Log Aktivitas
                                </h3>
                                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                                    {logAktivitas && logAktivitas.length > 0 ? (
                                        logAktivitas.map((log) => (
                                            <div
                                                key={log.id}
                                                className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                            {log.description}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(
                                                                log.created_at,
                                                            ).toLocaleString(
                                                                "id-ID",
                                                                {
                                                                    day: "numeric",
                                                                    month: "long",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                },
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        {log.users?.name ||
                                                            "Sistem"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                            Belum ada log aktivitas.
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => setShowLogModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showSkplModal && (
                        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-3xl w-full animate-fadeIn border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                                        <svg
                                            className="w-5 h-5 mr-2 text-purple-500"
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
                                        Ringkasan Hasil Ekstraksi
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowSkplModal(false);
                                            setSelectedConstrainId(null); // Reset saat tutup
                                        }}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
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
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                                    {skplData &&
                                    skplData.extracted_data.length > 0 ? (
                                        <ol className="list-decimal pl-8 space-y-3 text-gray-700 dark:text-gray-300">
                                            {skplData.extracted_data.map(
                                                (
                                                    item: string,
                                                    index: number,
                                                ) => (
                                                    <li
                                                        key={index}
                                                        className="pl-2 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 break-words"
                                                    >
                                                        {item}
                                                    </li>
                                                ),
                                            )}
                                        </ol>
                                    ) : (
                                        <div className="text-center py-4">
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
                                                    d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zM9 12h6m-6 4h6"
                                                />
                                            </svg>
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                Tidak ada data hasil ekstraksi
                                                tersedia untuk constrain ini.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => {
                                            setShowSkplModal(false);
                                            setSelectedConstrainId(null); // Reset saat tutup
                                        }}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        </>
    );
};

export default ShowPermintaan;

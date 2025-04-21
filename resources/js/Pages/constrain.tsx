import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "../Layouts/layout";
import { Head } from "@inertiajs/react";
import ConstrainForm from "../Components/constrainForm";
import ConstrainList from "../Components/constrainList";
import { Props, Constraint, ConstrainFormData } from "../types";

const ConstrainIndex: React.FC = () => {
    const { props } = usePage<Props>();
    const { tahapans, dokumenKategoris } = props;

    const queryClient = useQueryClient();

    // Update ConstrainFormData untuk mendukung target_columns
    const [form, setForm] = useState<ConstrainFormData>({
        id: null,
        permintaantahapan_id: "",
        type: "schedule",
        name: "",
        required: true,
        target_table: "",
        target_column: "",
        target_columns: [],
        dokumenkategori_id: null,
        relasi: "",
        isTesting: false,
        testingtype: "",
        isDomain: false,
        domainType: "",
    });

    const relationOptions = [
        "rapat",
        "rekomendasi",
        "project",
        "progressreport",
    ];

    const { data: constraints, isLoading } = useQuery<Constraint[]>({
        queryKey: ["constraints"],
        queryFn: async () => {
            const response = await axios.get("/constrain");
            return response.data.constraints || props.constraints || [];
        },
        initialData: props.constraints || [],
    });

    const createMutation = useMutation({
        mutationFn: (newConstraint: ConstrainFormData) => {
            const payload = {
                permintaantahapan_id: newConstraint.permintaantahapan_id,
                type: newConstraint.type,
                name: newConstraint.name,
                detail: {
                    required: newConstraint.required,
                    target_table: newConstraint.target_table,
                    ...(newConstraint.type === "progress"
                        ? {
                              target_columns: [
                                  "description",
                                  "percentage_change",
                              ],
                          }
                        : newConstraint.type === "text" &&
                            newConstraint.isDomain
                          ? {
                                target_column: "links",
                                is_domain: newConstraint.isDomain,
                                domain_type: newConstraint.domainType,
                            }
                          : { target_column: newConstraint.target_column }),
                    dokumenkategori_id: newConstraint.dokumenkategori_id
                        ? Number(newConstraint.dokumenkategori_id)
                        : null,
                    relasi: newConstraint.relasi || null,
                    ...(newConstraint.type === "upload_file" && {
                        isTesting: newConstraint.isTesting,
                        testingtype: newConstraint.isTesting
                            ? newConstraint.testingtype || null
                            : null,
                    }),
                },
            };
            return axios.post("/constrain", payload, {
                headers: {
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["constraints"] });
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (updatedConstraint: ConstrainFormData) => {
            const payload = {
                permintaantahapan_id: updatedConstraint.permintaantahapan_id,
                type: updatedConstraint.type,
                name: updatedConstraint.name,
                detail: {
                    required: updatedConstraint.required,
                    target_table: updatedConstraint.target_table,
                    ...(updatedConstraint.type === "progress"
                        ? {
                              target_columns: [
                                  "description",
                                  "percentage_change",
                              ],
                          }
                        : updatedConstraint.type === "text" &&
                            updatedConstraint.isDomain
                          ? {
                                target_column: "links",
                                is_domain: updatedConstraint.isDomain,
                                domain_type: updatedConstraint.domainType,
                            }
                          : { target_column: updatedConstraint.target_column }),
                    dokumenkategori_id: updatedConstraint.dokumenkategori_id
                        ? Number(updatedConstraint.dokumenkategori_id)
                        : null,
                    relasi: updatedConstraint.relasi || null,
                    ...(updatedConstraint.type === "upload_file" && {
                        isTesting: updatedConstraint.isTesting,
                        testingtype: updatedConstraint.isTesting
                            ? updatedConstraint.testingtype || null
                            : null,
                    }),
                },
            };
            return axios.put(`/constrain/${updatedConstraint.id}`, payload, {
                headers: {
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["constraints"] });
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) =>
            axios.delete(`/constrain/${id}`, {
                headers: {
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["constraints"] });
        },
        onError: (error) => {
            console.error("Gagal menghapus constraint:", error);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.id) {
            updateMutation.mutate(form, {
                onSuccess: () => {
                    window.location.reload();
                },
            });
        } else {
            createMutation.mutate(form, {
                onSuccess: () => {
                    window.location.reload();
                },
            });
        }
    };

    const handleEdit = (constraint: Constraint) => {
        setForm({
            id: constraint.id,
            permintaantahapan_id: constraint.permintaantahapan_id.toString(),
            type: constraint.type,
            name: constraint.name,
            required: constraint.detail.required,
            target_table: constraint.detail.target_table,
            target_column: constraint.detail.target_column || "",
            target_columns: constraint.detail.target_columns || [],
            dokumenkategori_id:
                constraint.detail.dokumenkategori_id?.toString() || null,
            relasi: constraint.detail.relasi || "",
            isTesting: constraint.detail.isTesting || false,
            testingtype: constraint.detail.testingtype || "",
            isDomain: constraint.detail.is_domain || false,
            domainType: constraint.detail.domain_type || "",
        });
    };

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus constraint ini?")) {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    window.location.reload();
                },
            });
        }
    };

    const resetForm = () => {
        setForm({
            id: null,
            permintaantahapan_id: "",
            type: "schedule",
            name: "",
            required: true,
            target_table: "",
            target_column: "",
            target_columns: [],
            dokumenkategori_id: null,
            relasi: "",
            isTesting: false,
            testingtype: "",
            isDomain: false,
            domainType: "",
        });
    };

    if (isLoading) {
        return (
            <Layout currentActive="constrain">
                <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
                        <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                            Memuat...
                        </span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <>
            <Head title="Simlatek - Kelola Constraint" />
            <Layout currentActive="constrain">
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto">
                        <header className="mb-10">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-cyan-500 pb-3">
                                Kelola Constraint Tahapan
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Atur dan kelola constraint tahapan dengan mudah
                                dan efisien
                            </p>
                        </header>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-all duration-200">
                            <ConstrainForm
                                form={form}
                                setForm={setForm}
                                tahapans={tahapans}
                                dokumenKategoris={dokumenKategoris}
                                onSubmit={handleSubmit}
                                isPending={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                }
                                resetForm={resetForm}
                                relationOptions={relationOptions}
                            />
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-200">
                            <ConstrainList
                                constraints={constraints || []}
                                dokumenKategoris={dokumenKategoris}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                isDeleting={deleteMutation.isPending}
                            />
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default ConstrainIndex;

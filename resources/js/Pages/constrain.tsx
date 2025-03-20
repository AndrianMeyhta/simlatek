// resources/js/Pages/Constrain/Index.tsx
import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "../Layouts/layout";
import { Head } from "@inertiajs/react";
import ConstrainForm from ".././Components/constrainForm";
import ConstrainList from ".././Components/constrainList";
import { Props, Constraint, ConstrainFormData } from ".././types";

const ConstrainIndex: React.FC = () => {
    const { props } = usePage<Props>();
    const { tahapans, dokumenKategoris } = props;

    const queryClient = useQueryClient();

    const [form, setForm] = useState<ConstrainFormData>({
        id: null,
        projecttahapan_id: "",
        type: "schedule",
        name: "",
        required: true,
        target_table: "",
        target_column: "",
        dokumenkategori_id: null,
        relasi: "",
        isTesting: false,
        testingtype: "",
    });

    const relationOptions = ["rapat", "testing", "rekomendasi", "project"];

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
                projecttahapan_id: newConstraint.projecttahapan_id,
                type: newConstraint.type,
                name: newConstraint.name,
                required: newConstraint.required,
                target_table: newConstraint.target_table,
                target_column: newConstraint.target_column,
                dokumenkategori_id: newConstraint.dokumenkategori_id ? Number(newConstraint.dokumenkategori_id) : null,
                relasi: newConstraint.relasi || null,
                isTesting: newConstraint.isTesting || false, // Tambahkan ini
                testingtype: newConstraint.isTesting ? newConstraint.testingtype || null : null,
            };
            return axios.post("/constrain", payload, {
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
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
                projecttahapan_id: updatedConstraint.projecttahapan_id,
                type: updatedConstraint.type,
                name: updatedConstraint.name,
                required: updatedConstraint.required,
                target_table: updatedConstraint.target_table,
                target_column: updatedConstraint.target_column,
                dokumenkategori_id: updatedConstraint.dokumenkategori_id ? Number(updatedConstraint.dokumenkategori_id) : null,
                relasi: updatedConstraint.relasi || null,
                isTesting: updatedConstraint.isTesting || false,
                testingtype: updatedConstraint.isTesting ? updatedConstraint.testingtype || null : null,
            };
            return axios.put(`/constrain/${updatedConstraint.id}`, payload, {
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
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
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
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
            updateMutation.mutate(form);
        } else {
            createMutation.mutate(form);
        }
    };

    const handleEdit = (constraint: Constraint) => {
        setForm({
            id: constraint.id,
            projecttahapan_id: constraint.projecttahapan_id.toString(),
            type: constraint.type,
            name: constraint.name,
            required: constraint.detail.required,
            target_table: constraint.detail.target_table,
            target_column: constraint.detail.target_column,
            dokumenkategori_id: constraint.detail.dokumenkategori_id?.toString() || null,
            relasi: constraint.detail.relasi || "",
            isTesting: constraint.detail.isTesting || false,
            testingtype: constraint.detail.testingtype || "",
        });
    };

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus constraint ini?")) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setForm({
            id: null,
            projecttahapan_id: "",
            type: "schedule",
            name: "",
            required: true,
            target_table: "",
            target_column: "",
            dokumenkategori_id: null,
            relasi: "",
            isTesting: false,
            testingtype: "",
        });
    };

    if (isLoading) {
        return (
            <Layout currentActive="constrain">
                <div className="text-center mt-10 text-gray-600 animate-pulse">Memuat...</div>
            </Layout>
        );
    }

    return (
        <>
            <Head title="Simlatek - Kelola Constraint" />
            <Layout currentActive="constrain">
                <div className="max-w-7xl mx-auto p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-2">Kelola Constraint Tahapan</h1>

                    {/* Formulir */}
                    <ConstrainForm
                        form={form}
                        setForm={setForm}
                        tahapans={tahapans}
                        dokumenKategoris={dokumenKategoris}
                        onSubmit={handleSubmit}
                        isPending={createMutation.isPending || updateMutation.isPending}
                        resetForm={resetForm}
                        relationOptions={relationOptions}
                    />

                    {/* Daftar */}
                    <ConstrainList
                        constraints={constraints || []}
                        dokumenKategoris={dokumenKategoris}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={deleteMutation.isPending}
                    />
                </div>
            </Layout>
        </>
    );
};

export default ConstrainIndex;

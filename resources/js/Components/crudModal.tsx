// resources/js/Components/CrudModal.tsx
import React from "react";
import { successAlert, warningAlert } from "./sweetAlert";
import { CrudModalProps } from "../types";

const CrudModal: React.FC<CrudModalProps> = ({
    show,
    onClose,
    title,
    formData,
    onChange,
    onSubmit,
    fields,
}) => {
    if (!show) return null;

    console.log("CrudModal - formData:", formData);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check if any required field is empty
        const hasInvalidField = fields.some((field) => {
            const value = formData[field.key] || "";
            if (field.required && !value) {
                if (field.type === "select") {
                    warningAlert(
                        "Warning",
                        `Please select a valid ${field.label} before saving.`,
                    );
                    return true;
                }
                if (
                    field.type === "text" ||
                    field.type === "number" ||
                    field.type === "textarea"
                ) {
                    warningAlert(
                        "Warning",
                        `Please fill in the ${field.label} field before saving.`,
                    );
                    return true;
                }
            }
            return false;
        });

        if (hasInvalidField) return;

        successAlert("Success", "Data berhasil disimpan");
        onSubmit(e); // Proceed with submit if valid
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-950 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {title}
                </h3>
                <form onSubmit={handleSubmit}>
                    {fields.map((field) => (
                        <div key={field.key} className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                {field.label}
                            </label>
                            {field.type === "select" ? (
                                <select
                                    value={formData[field.key] || ""}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLSelectElement>,
                                    ) => {
                                        console.log(
                                            `Changing ${field.key} to:`,
                                            e.target.value,
                                        );
                                        onChange(field.key, e.target.value);
                                    }}
                                    className="w-full p-2 border rounded-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Select {field.label}
                                    </option>
                                    {field.options?.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : field.type === "textarea" ? (
                                <textarea
                                    value={formData[field.key] || ""}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => {
                                        console.log(
                                            `Changing ${field.key} to:`,
                                            e.target.value,
                                        );
                                        onChange(field.key, e.target.value);
                                    }}
                                    className="w-full p-2 border rounded-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    required={field.required !== false}
                                />
                            ) : field.type === "number" ? (
                                <input
                                    type="number"
                                    value={formData[field.key] || ""}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => {
                                        console.log(
                                            `Changing ${field.key} to:`,
                                            e.target.value,
                                        );
                                        onChange(field.key, e.target.value);
                                    }}
                                    min={field.min}
                                    max={field.max}
                                    placeholder={field.placeholder}
                                    className="w-full p-2 border rounded-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={field.required !== false}
                                />
                            ) : (
                                <input
                                    type={field.type}
                                    value={formData[field.key] || ""}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => {
                                        console.log(
                                            `Changing ${field.key} to:`,
                                            e.target.value,
                                        );
                                        onChange(field.key, e.target.value);
                                    }}
                                    className="w-full p-2 border rounded-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={field.required !== false}
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 rounded-sm hover:bg-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrudModal;

import React from "react";
import { GenericTableProps } from "../types";

const GenericTable: React.FC<GenericTableProps> = ({
    columns,
    data,
    onEdit,
    onDelete,
}) => {
    console.log("GenericTable - Data:", data);
    console.log("GenericTable - Columns:", columns);

    const safeData = Array.isArray(data) ? data : [];

    if (safeData.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No data available
            </div>
        );
    }

    const getNestedValue = (item: any, key: string): string => {
        if (!key.includes(".")) {
            return item[key] !== undefined && item[key] !== null
                ? String(item[key])
                : "N/A";
        }

        const keys = key.split(".");
        let value: any = item;
        for (const k of keys) {
            value = value?.[k] ?? "N/A";
            if (value === "N/A") break;
        }
        return String(value);
    };

    return (
        <table className="min-w-full border-collapse">
            <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                    {columns.map((col) => (
                        <th
                            key={col.key}
                            className="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-white"
                        >
                            {col.label}
                        </th>
                    ))}
                    {(onEdit || onDelete) && (
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                            Actions
                        </th>
                    )}
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-950">
                {safeData.map((item) => (
                    <tr
                        key={item.id || `row-${Math.random()}`}
                        className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                        {columns.map((col) => (
                            <td
                                key={`${item.id || "row"}-${col.key}`}
                                className="px-6 py-4 text-sm text-gray-900 dark:text-white"
                            >
                                {col.render
                                    ? col.render(item)
                                    : getNestedValue(item, col.key)}
                            </td>
                        ))}
                        <td className="px-6 py-4 text-sm">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(item)}
                                    className="text-blue-600 hover:text-blue-800 mr-4"
                                >
                                    Edit
                                </button>
                            )}
                            {onDelete && item.id !== undefined && (
                                <button
                                    onClick={() => onDelete(item.id)} // item.id pasti string | number
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default GenericTable;

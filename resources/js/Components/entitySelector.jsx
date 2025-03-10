// resources/js/Components/EntitySelector.jsx
import React from "react";

const EntitySelector = ({ entities, currentEntity, onChange }) => {
    return (
        <select
            value={currentEntity}
            onChange={(e) => onChange(e.target.value)}
            className="w-full md:w-64 p-2 border rounded-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {entities.map((entity) => (
                <option key={entity.value} value={entity.value}>
                    {entity.label}
                </option>
            ))}
        </select>
    );
};

export default EntitySelector;

// AddButton.jsx
import React from "react";
import { PlusIcon } from "lucide-react";

const AddButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-sm hover:bg-blue-600 flex items-center gap-2"
        >
            <PlusIcon size={16} />
            Add New
        </button>
    );
};

export default AddButton;

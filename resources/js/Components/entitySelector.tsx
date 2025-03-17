// resources/js/Components/EntitySelector.tsx
import React from "react";
import { EntitySelectorProps } from "../types";

const EntitySelector: React.FC<EntitySelectorProps> = ({
    entities,
    currentEntity,
    onChange,
    className,
}) => {
    return (
        <select
            value={currentEntity}
            onChange={(e) => onChange(e.target.value)}
            className={className} // Use the className prop
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

import React from "react";
import { Button } from "../Atoms/Button/Button";
import { FaBookmark, FaTrash } from "react-icons/fa";

type ImageActionsProps = {
  isMain: boolean;
  onDelete: () => void;
  onSetAsMain: () => void;
  disabled?: boolean;
  className?: string;
};

export const ImageActions: React.FC<ImageActionsProps> = ({
  isMain,
  onDelete,
  onSetAsMain,
  disabled = false,
  className = "",
}) => (
  <div
    className={`absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 ${className}`}
  >
    {!isMain && (
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSetAsMain}
          title="Establecer como principal"
          disabled={disabled}
          className="p-1.5 bg-white hover:bg-gray-100"
          leftIcon={FaBookmark}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          title="Eliminar imagen"
          disabled={disabled}
          className="p-1.5 text-red-600 hover:bg-red-50"
          leftIcon={FaTrash}
        />
      </div>
    )}
  </div>
);

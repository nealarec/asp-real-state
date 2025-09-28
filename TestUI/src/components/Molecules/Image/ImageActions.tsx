import React from 'react';

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
  className = '',
}) => (
  <div className={`absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 ${className}`}>
    {!isMain && (
      <>
        <button
          type="button"
          onClick={onSetAsMain}
          className="p-1.5 bg-white rounded-full text-gray-800 hover:bg-gray-100 transition-colors"
          title="Establecer como principal"
          disabled={disabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
          title="Eliminar imagen"
          disabled={disabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </>
    )}
  </div>
);

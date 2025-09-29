import { useCallback, useState } from "react";
import { useDropzone, type FileWithPath } from "react-dropzone";
import { FiUpload, FiX } from "react-icons/fi";
import { DeleteConfirmation } from "@/components/Molecules/DeleteConfirmation/DeleteConfirmation";

type ImageDropzoneProps = {
  onDrop: (acceptedFiles: FileWithPath[]) => Promise<void>;
  onDelete?: (id: string) => void;
  images?: Array<{ id: string; url: string }>;
  maxFiles?: number;
  maxSize?: number; // in bytes (default: 5MB)
  accept?: Record<string, string[]>;
  disabled?: boolean;
  className?: string;
};

export function ImageDropzone({
  onDrop,
  onDelete,
  images = [],
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
  },
  disabled = false,
  className = "",
}: ImageDropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [newPreviews, setNewPreviews] = useState<{ id: string; url: string; isNew: true }[]>([]);
  const [imageToDelete, setImageToDelete] = useState<{ id: string; isNew: boolean } | null>(null);

  const onDropCallback = useCallback(
    (acceptedFiles: FileWithPath[], fileRejections: any[]) => {
      setError(null);

      // Handle file rejections
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0].code === "file-too-large") {
          setError(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
          return;
        }
        if (rejection.errors[0].code === "file-invalid-type") {
          setError("Invalid file type. Please upload an image file.");
          return;
        }
        if (rejection.errors[0].code === "too-many-files") {
          return;
        }
      }

      // Create previews for accepted files
      const newFiles = acceptedFiles.map(file => ({
        id: `new-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        isNew: true as const,
        file,
      }));

      setNewPreviews(prev => [...prev, ...newFiles].slice(0, maxFiles - images.length));

      // Call the parent's onDrop with accepted files
      onDrop(acceptedFiles).then(() => {
        setNewPreviews([]);
      });
    },
    [maxFiles, maxSize, onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept,
    maxSize,
    disabled,
  });

  const handleRemove = (id: string, isNew: boolean) => {
    setImageToDelete({ id, isNew });
  };

  const confirmDelete = () => {
    if (!imageToDelete) return;

    const { id, isNew } = imageToDelete;
    if (isNew) {
      setNewPreviews(prev => prev.filter(img => img.id !== id));
    } else if (onDelete) {
      onDelete(id);
    }
    setImageToDelete(null);
  };

  const cancelDelete = () => {
    setImageToDelete(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...images, ...newPreviews].map(item => (
          <div key={item.id} className="relative group">
            <img src={item.url} alt="Property" className="w-full h-32 object-cover rounded-lg" />
            {!disabled && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleRemove(item.id, "isNew" in item);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} disabled={disabled} />
        <div className="space-y-2">
          <FiUpload className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Suelta las imágenes aquí..."
              : "Arrastra y suelta imágenes aquí, o haz clic para seleccionar"}
          </p>
          <p className="text-xs text-gray-500">
            Formatos: {Object.values(accept).flat().join(", ")} (máx. {maxSize / (1024 * 1024)}MB)
          </p>
        </div>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      <DeleteConfirmation
        isOpen={!!imageToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="¿Eliminar imagen?"
        message="¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={false}
      />
    </div>
  );
}

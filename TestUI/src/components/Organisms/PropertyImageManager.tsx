import React from "react";
import { ImageGrid } from "../Molecules/Image/ImageGrid";
import { ImageDropzone } from "@/components/Atoms/Image/ImageDropzone";
import { DeleteConfirmation } from "../Molecules/DeleteConfirmation/DeleteConfirmation";
import type { PropertyImage } from "@/schemas/PropertyImage";

type PropertyImageManagerProps = {
  images: PropertyImage[];
  onUpload: (files: FileList) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetAsMain: (id: string) => Promise<void>;
  isLoading?: boolean;
  uploadTitle?: string;
  emptyMessage?: string;
  className?: string;
};

export const PropertyImageManager: React.FC<PropertyImageManagerProps> = ({
  images = [],
  onUpload,
  onDelete,
  onSetAsMain,
  isLoading = false,
  uploadTitle = "Agregar imágenes",
  className = "",
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleDrop = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      // Convert File[] to FileList
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      await onUpload(dataTransfer.files);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setIsConfirmingDelete(id);
  };

  const confirmDelete = async () => {
    if (isConfirmingDelete) {
      await onDelete(isConfirmingDelete);
      setIsConfirmingDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmingDelete(null);
  };

  return (
    <div className={`pt-4 border-t border-gray-200 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Imágenes de la propiedad</h3>

      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">
          {images.length === 0 ? uploadTitle || "Agregar imágenes" : "Agregar más imágenes"}
        </h4>
        <ImageDropzone
          onDrop={handleDrop}
          onDelete={onDelete}
          images={images.map(img => ({
            id: img.id,
            url: img.fileUrl,
          }))}
          disabled={isLoading || isUploading}
          maxFiles={10}
        />
      </div>

      <DeleteConfirmation
        isOpen={!!isConfirmingDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

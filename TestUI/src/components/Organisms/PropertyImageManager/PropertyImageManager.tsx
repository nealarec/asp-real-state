import React from "react";
import { useForm } from "react-hook-form";
import { ImageGrid } from "../../Molecules/Image/ImageGrid";
import { ImageUploader } from "../../Atoms/Image/ImageUploader";
import { DeleteConfirmation } from "../../Molecules/DeleteConfirmation/DeleteConfirmation";

type PropertyImage = {
  id: string;
  fileUrl: string;
  enabled: boolean;
};

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

  const { control, watch, reset } = useForm<{ images?: FileList }>();
  const selectedImages = watch("images");

  // Auto-upload when files are selected
  React.useEffect(() => {
    const uploadFiles = async () => {
      if (selectedImages && selectedImages.length > 0) {
        try {
          setIsUploading(true);
          await onUpload(selectedImages);
          reset();
        } catch (error) {
          console.error("Error uploading images:", error);
        } finally {
          setIsUploading(false);
        }
      }
    };

    uploadFiles();
  }, [selectedImages]);

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

      <ImageGrid
        images={images}
        onDelete={handleDeleteClick}
        onSetAsMain={onSetAsMain}
        isLoading={isLoading}
      />

      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">
          {images.length === 0 ? uploadTitle : "Agregar más imágenes"}
        </h4>
        <div className="relative">
          <ImageUploader
            name="images"
            control={control}
            isUploading={isUploading}
            disabled={isLoading}
            multiple
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {isUploading
            ? "Subiendo imágenes..."
            : "Selecciona una o más imágenes para subir automáticamente"}
        </p>
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

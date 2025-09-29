import React from "react";
import { ImageThumbnail } from "@/components/Atoms/Image/ImageThumbnail";
import { ImageActions } from "./ImageActions";

type ImageItem = {
  id: string;
  fileUrl: string;
  enabled: boolean;
};

type ImageGridProps = {
  images: ImageItem[];
  onDelete: (id: string) => void;
  onSetAsMain: (id: string) => void;
  isLoading?: boolean;
  className?: string;
};

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onDelete,
  onSetAsMain,
  isLoading = false,
  className = "",
}) => {
  if (images.length === 0) return null;

  return (
    <div className={`mb-6 ${className}`}>
      <h4 className="text-md font-medium text-gray-700 mb-3">Imágenes actuales</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map(image => (
          <div key={image.id} className="relative group">
            <ImageThumbnail
              src={image.fileUrl}
              alt={`Imagen de la propiedad`}
              isMain={image.enabled}
            />
            <ImageActions
              isMain={image.enabled}
              onDelete={() => onDelete(image.id)}
              onSetAsMain={() => onSetAsMain(image.id)}
              disabled={isLoading}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

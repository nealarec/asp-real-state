import { useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "../Atoms/Button/Button";

interface ImageItem {
  id: string;
  fileUrl: string;
}

interface PropertyImageGalleryProps {
  images?: ImageItem[];
  className?: string;
}

export function PropertyImageGallery({ images = [], className = "" }: PropertyImageGalleryProps) {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  const goToPrevious = () => {
    if (!images || images.length === 0) return;
    setMainImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    if (!images || images.length === 0) return;
    setMainImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Don't render anything if there are no images
  if (!images || images.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={images[mainImageIndex]?.fileUrl || ""}
          alt="Property"
          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={openLightbox}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image, index) => (
            <div
              key={image.id}
              className={`relative aspect-square rounded-md overflow-hidden cursor-pointer transition-opacity ${
                index === mainImageIndex ? "ring-2 ring-blue-500" : "opacity-80 hover:opacity-100"
              }`}
              onClick={() => setMainImageIndex(index)}
            >
              <img
                src={image.fileUrl}
                alt={`Property ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-medium">
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && images[mainImageIndex] && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <Button
            type="button"
            variant="ghost"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:bg-white/10 p-2"
            aria-label="Close gallery"
            leftIcon={FiX}
          />

          <Button
            type="button"
            variant="ghost"
            onClick={goToPrevious}
            className="absolute left-4 p-2 text-white hover:bg-white/10"
            aria-label="Previous image"
            leftIcon={FiChevronLeft}
          />

          <div className="max-w-4xl w-full">
            <img
              src={images[mainImageIndex].fileUrl}
              alt={`Property image ${mainImageIndex + 1}`}
              className="max-h-[80vh] w-auto mx-auto"
            />
            <div className="text-white text-center mt-2">
              {mainImageIndex + 1} / {images.length}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={goToNext}
            className="absolute right-4 p-2 text-white hover:bg-white/10"
            aria-label="Next image"
            leftIcon={FiChevronRight}
          />
        </div>
      )}
    </div>
  );
}

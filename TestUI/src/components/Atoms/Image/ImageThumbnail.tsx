import React from "react";

type ImageThumbnailProps = {
  src: string;
  alt: string;
  isMain?: boolean;
  className?: string;
};

export const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
  src,
  alt,
  isMain = false,
  className = "",
}) => (
  <div className={`relative rounded-md overflow-hidden border border-gray-200 ${className}`}>
    <img src={src} alt={alt} className="w-full h-32 object-cover" />
    {isMain && (
      <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
        Principal
      </span>
    )}
  </div>
);

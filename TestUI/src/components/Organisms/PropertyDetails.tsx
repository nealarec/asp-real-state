import type { Property } from "@/schemas/Property";
import type { Owner } from "@/schemas/Owner";
import { FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "@/components/Atoms/Button/Button";

interface PropertyImage {
  id: string;
  idProperty: string;
  fileUrl: string;
  enabled: boolean;
  idPropertyImage?: string | undefined;
}

export interface PropertyDetailsProps {
  property: Property;
  isLoadingImages: boolean;
  images: PropertyImage[];
  isLoadingOwner: boolean;
  owner: Owner | null;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAsSold: () => void;
}

export const PropertyDetails = ({
  property,
  isLoadingImages,
  images,
  isLoadingOwner,
  owner,
  isDeleting,
  onEdit,
  onDelete,
  onMarkAsSold,
}: PropertyDetailsProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <p className="text-gray-600">{property.address}</p>

          {isLoadingOwner && (
            <div className="mt-2 text-sm text-gray-500">Loading owner info...</div>
          )}
        </div>

        <div className="w-full sm:w-auto">
          <div className="inline-flex rounded-lg overflow-hidden shadow-sm border border-gray-200" role="group">
            <Button
              variant="warning"
              size="sm"
              onClick={onEdit}
              disabled={isDeleting}
              className="rounded-none border-0 border-r border-white/20"
              leftIcon={FaEdit}
              title="Edit"
            >
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={onMarkAsSold}
              className="rounded-none border-0 border-r border-white/20"
              leftIcon={FaCheckCircle}
              title="Mark as Sold"
            >
              <span className="hidden sm:inline">Mark as Sold</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-none"
              leftIcon={FaTrash}
              title={isDeleting ? "Deleting..." : "Delete"}
            >
              <span className="hidden sm:inline">
                {isDeleting ? "Deleting..." : "Delete"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="mb-8">
          {isLoadingImages ? (
            <div className="aspect-video bg-gray-100 rounded-lg animate-pulse"></div>
          ) : images && images.length > 0 ? (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {images[0]?.fileUrl ? (
                <img
                  src={images[0].fileUrl}
                  alt={property.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No images available</span>
            </div>
          )}
        </div>

        <div>
          <span className="text-xl font-semibold text-green-700">
            ${property.price?.toLocaleString()}
          </span>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 md:min-h-[100px]">
              {property.name || "No description available."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-1/3">
              <h3 className="text-sm font-medium text-gray-500">Year</h3>
              <p>{property.year}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Owner</h3>
              {property.idOwner ? (
                <Link to={`/owners/${property.idOwner}`} className="text-blue-600 hover:underline">
                  {owner && (
                    <div className="mt-2 flex items-center gap-2">
                      {owner.photo && (
                        <img
                          src={owner.photo}
                          alt="Owner"
                          className="mt-2 h-16 w-16 rounded-full object-cover"
                        />
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">{owner.name}</span>
                        <span className="block">{owner.address}</span>
                      </p>
                    </div>
                  )}
                </Link>
              ) : (
                <p>Not available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

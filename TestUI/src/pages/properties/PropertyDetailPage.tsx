import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MarkAsSoldModal } from "@/components/Molecules/MarkAsSoldModal";
import { usePropertyImages } from "@/hooks/usePropertyImages";
import { useProperties } from "@/hooks/useProperties";
import { useOwners } from "@/hooks/useOwners";
import { usePropertyTraces } from "@/hooks/usePropertyTraces";
import { DeleteConfirmation } from "@/components/Molecules/DeleteConfirmation";
import { PropertyDetails } from "@/components/Organisms/PropertyDetails";
import { PropertyHistory } from "@/components/Organisms/PropertyHistory";
import type { Property } from "@/schemas/Property";
import type { PropertyTrace } from "@/schemas/PropertyTrace";
import toast from "react-hot-toast";

export default function PropertyDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isMarkAsSoldModalOpen, setIsMarkAsSoldModalOpen] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<PropertyTrace | null>(null);
  const [toDeleteTrace, setToDeleteTrace] = useState<PropertyTrace | null>(null);

  const { getProperty, deleteProperty, isDeleting } = useProperties();
  const { data: property, isLoading, error } = getProperty(id);
  const { data: images = [], isLoading: isLoadingImages } = usePropertyImages(id);
  const { data: owner, isLoading: isLoadingOwner } = useOwners().getOwner(property?.idOwner || "");

  const {
    propertyTraces = [],
    isLoading: isLoadingTraces,
    createPropertyTrace,
    updatePropertyTrace,
    deletePropertyTrace,
  } = usePropertyTraces(id);

  const handleMarkAsSold = async (data: Omit<PropertyTrace, "id">) => {
    if (!property) return;

    try {
      const traceData = {
        ...data,
        idProperty: property.id,
        dateSale: data["dateSale"] || new Date(),
      };
      if (selectedTrace?.id) {
        await updatePropertyTrace({ id: selectedTrace.id, data: traceData });
      } else {
        await createPropertyTrace(traceData);
      }
      setIsMarkAsSoldModalOpen(false);
      // Refresh the page to show the new trace
      navigate(0);
    } catch (error) {
      console.error("Error marking property as sold:", error);
      // In a real app, you might want to show an error toast/message here
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteTrace = () => {
    if (!toDeleteTrace?.id) return;
    deletePropertyTrace(toDeleteTrace.id, {
      onSuccess: () => {
        setToDeleteTrace(null);
      },
      onError: () => {
        toast.error("Error deleting property trace");
      },
    });
  };

  const handleConfirmDelete = async () => {
    if (!property) return;

    try {
      await deleteProperty(property.id);
      // Redirect to properties list after successful deletion
      navigate("/properties");
    } catch (error) {
      console.error("Error deleting property:", error);
      // In a real app, show error toast/message
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleEditProperty = () => {
    if (property) {
      navigate(`/properties/edit/${property.id}`);
    }
  };

  // Early return if property is not loaded yet
  if (isLoading) return <div className="p-4">Loading property...</div>;
  if (error) return <div className="p-4">Error loading property</div>;
  if (!property) return <div className="p-4">Property not found</div>;

  return (
    <div className="p-4 space-y-8">
      <Link to="/properties" className="text-blue-600 hover:underline inline-block">
        &larr; Back to Properties
      </Link>

      {property && (
        <PropertyDetails
          property={property}
          isLoadingImages={isLoadingImages}
          images={images || []}
          isLoadingOwner={isLoadingOwner}
          owner={owner || null}
          isDeleting={isDeleting}
          onEdit={handleEditProperty}
          onDelete={handleDeleteClick}
          onMarkAsSold={() => setIsMarkAsSoldModalOpen(true)}
        />
      )}

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Property History</h2>
        <PropertyHistory
          propertyTraces={propertyTraces}
          isLoading={isLoadingTraces}
          onEdit={trace => {
            setSelectedTrace(trace);
            setIsMarkAsSoldModalOpen(true);
          }}
          onDelete={setToDeleteTrace}
        />
      </div>

      <MarkAsSoldModal
        isOpen={isMarkAsSoldModalOpen}
        onClose={() => {
          setIsMarkAsSoldModalOpen(false);
          setSelectedTrace(null);
        }}
        onConfirm={handleMarkAsSold}
        property={property as unknown as Property} // Temporary type assertion
        propertyTrace={selectedTrace}
      />

      <DeleteConfirmation
        isOpen={showDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        isLoading={isDeleting}
      />
      <DeleteConfirmation
        isOpen={toDeleteTrace !== null}
        onConfirm={() => handleDeleteTrace()}
        onCancel={() => setToDeleteTrace(null)}
        title="Delete Property Trace"
        message={`Are you sure you want to delete this property trace: ${toDeleteTrace?.name}? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
}

import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Input, Textarea, FormGroup } from "@/components/Atoms/Form";
import { Button } from "@/components/Atoms/Button";
import { propertyFormSchema } from "@/schemas/Property";
import type { PropertyFormData } from "@/schemas/Property";
import { PropertyImageManager } from "@/components/Organisms/PropertyImageManager";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyImages } from "@/hooks/usePropertyImages";
import { OwnerSelect } from "@/components/Molecules/OwnerSelect";

const PropertyFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  // Use the properties hook
  const {
    getProperty,
    createProperty,
    updateProperty,
    isCreating,
    isUpdating,
    error: propertyError,
  } = useProperties();

  // Get property data
  const { data: property } = getProperty(id || "");

  const isSubmitting = isCreating || isUpdating;

  // Form setup
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      price: 0,
      codeInternal: "",
      year: new Date().getFullYear(),
      idOwner: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = form;

  // Use the property images hook
  const {
    data: images = [],
    isLoading: isLoadingImages,
    uploadImage: handleImageUpload,
    deleteImage: handleDeleteImage,
    error: imagesError,
  } = usePropertyImages(id);

  // Reset form when property data is loaded
  React.useEffect(() => {
    if (property) {
      reset(property);
    }
  }, [property, reset]);

  // Handle form submission
  const onSubmit = async (data: PropertyFormData) => {
    try {
      if (isEditMode && id) {
        await updateProperty({ id, data });
        toast.success("Property updated successfully");
      } else {
        await createProperty(data);
        toast.success("Property created successfully");
      }
      navigate(isEditMode ? `/properties/${id}` : "/properties");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // Handle setting an image as main
  const handleSetAsMain = async (_imageId: string) => {
    if (!id) return;
    try {
      // Note: Implement setMainPropertyImage in your API if needed
      // For now, we'll just show a message
      toast.success("Setting main image is not yet implemented");
    } catch (error) {
      toast.error("Error updating main image");
      console.error("Set main image error:", error);
    }
  };

  // Handle loading and error states

  if (propertyError || imagesError) {
    const errorMessage =
      propertyError?.message || imagesError?.message || "An error occurred while loading data";

    return (
      <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
        <div className="text-center py-4 text-red-500">Error: {errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
      {id ? (
        <div className="mt-8 mb-8 border-b border-gray-200 pb-4">
          <PropertyImageManager
            images={images || []}
            onUpload={handleImageUpload}
            onDelete={handleDeleteImage}
            onSetAsMain={handleSetAsMain}
            isLoading={isLoadingImages || isSubmitting}
            uploadTitle="Upload Images"
            emptyMessage="No images uploaded yet"
          />
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormGroup label="Property Name" error={errors.name?.message}>
          <Input {...register("name")} placeholder="Enter property name" disabled={isSubmitting} />
        </FormGroup>

        <FormGroup label="Address" error={errors.address?.message}>
          <Textarea
            {...register("address")}
            placeholder="Enter property address"
            disabled={isSubmitting}
            rows={3}
          />
        </FormGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup label="Price ($)" error={errors.price?.message}>
            <Input
              type="number"
              {...register("price", { valueAsNumber: true })}
              placeholder="Enter price"
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup label="Year Built" error={errors.year?.message}>
            <Input
              type="number"
              {...register("year", { valueAsNumber: true })}
              placeholder="Enter year built"
              disabled={isSubmitting}
            />
          </FormGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup label="Internal Code" error={errors.codeInternal?.message}>
            <Input
              {...register("codeInternal")}
              placeholder="Enter internal code"
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup label="Owner" error={errors.idOwner?.message}>
            <OwnerSelect
              value={watch("idOwner")}
              onChange={value => form.setValue("idOwner", value)}
              disabled={isSubmitting || !!id}
            />
          </FormGroup>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(id ? `/properties/${id}` : "/properties")}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !isDirty} className="w-full sm:w-auto">
            {isSubmitting ? "Saving..." : "Save Property"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyFormPage;

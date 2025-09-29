import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import * as propertyService from "@/services/properties/propertyService";
import { Input, Textarea, Button, FormGroup } from "@/components/Atoms/Form";
import { propertyFormSchema, type Property, type PropertyFormData } from "@/schemas/Property";
import { PropertyImageManager } from "@/components/Organisms/PropertyImageManager";
import usePropertyImages from "@/hooks/usePropertyImages";

const PropertyFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PropertyFormData>({
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

  // Fetch property data in edit mode
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property | null>({
    queryKey: ["property", id],
    queryFn: () => (id ? propertyService.getPropertyById(id) : null),
    enabled: isEditMode,
  });

  const { data: images = [], isLoading: isLoadingImages } = usePropertyImages(id);

  // Reset form when property data is loaded
  React.useEffect(() => {
    if (property) {
      reset(property);
    }
  }, [property, reset]);

  // Mutation for saving property
  const savePropertyMutation = useMutation({
    mutationFn: (data: PropertyFormData) =>
      isEditMode && id
        ? propertyService.updateProperty(id, data)
        : propertyService.createProperty(data),
    onSuccess: () => {
      const message = isEditMode
        ? "Property updated successfully"
        : "Property created successfully";
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/properties");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Handle image operations
  const handleImageUpload = async (files: FileList) => {
    if (!id) return;
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append("file", file);
      });
      await propertyService.uploadPropertyImage(id, formData);
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      toast.success("Images uploaded successfully");
    } catch (error) {
      toast.error("Error uploading images");
      console.error("Upload error:", error);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!id) return;
    try {
      await propertyService.deletePropertyImage(id, imageId);
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Error deleting image");
    }
  };

  const handleSetAsMain = async (_imageId: string) => {
    if (!id) return;
    try {
      // Note: Implement setMainPropertyImage in your API if needed
      // For now, we'll just show a message
      toast.success("Setting main image is not yet implemented");
      queryClient.invalidateQueries({ queryKey: ["property", id] });
    } catch (error) {
      toast.error("Error updating main image");
      console.error("Set main image error:", error);
    }
  };

  const onSubmit = (data: PropertyFormData) => {
    return savePropertyMutation.mutateAsync(data);
  };

  if (isLoadingProperty) {
    return <div className="text-center py-8">Loading property data...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Property" : "Create New Property"}
      </h1>

      {id && (
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
      )}

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

        <FormGroup label="Internal Code" error={errors.codeInternal?.message}>
          <Input
            {...register("codeInternal")}
            placeholder="Enter internal code"
            disabled={isSubmitting}
          />
        </FormGroup>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/properties")}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? "Saving..." : "Save Property"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyFormPage;

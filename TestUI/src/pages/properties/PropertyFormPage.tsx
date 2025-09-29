import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as propertyService from "../../services/properties/propertyService";
import { Input, Textarea, Button, FormGroup } from "../../components/Atoms/Form";
import { propertyFormSchema, type Property } from "@/schemas/Property";
import type { PropertyImage } from "@/schemas/PropertyImage";
import type { PropertyFormData } from "@/types/property";

type FormValues = PropertyFormData & {
  images?: FileList;
};

import { PropertyImageManager } from "@/components/Organisms/PropertyImageManager";

const PropertyImagesForm: React.FC<{
  propertyImages: PropertyImage[];
  onUpload: (files: FileList) => Promise<void>;
  onDelete: (imageId: string) => Promise<void>;
  onSetAsMain: (imageId: string) => Promise<void>;
  isLoading?: boolean;
}> = ({ propertyImages, onUpload, onDelete, onSetAsMain, isLoading = false }) => {
  return (
    <PropertyImageManager
      images={propertyImages}
      onUpload={onUpload}
      onDelete={onDelete}
      onSetAsMain={onSetAsMain}
      isLoading={isLoading}
      uploadTitle="Agregar imágenes"
      emptyMessage="No hay imágenes para mostrar"
    />
  );
};

const PropertyFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [propertyId, setPropertyId] = React.useState<string | null>(id || null);

  // Fetch property data in edit mode
  const { data: property, isLoading: isLoadingProperty } = useQuery<Property | null>({
    queryKey: ["property", id],
    queryFn: () => (id ? propertyService.getPropertyById(id) : null),
    enabled: isEditMode,
  });

  // Fetch property images
  const { data: propertyImages = [] } = useQuery<PropertyImage[]>({
    queryKey: ["propertyImages", propertyId],
    queryFn: () => (propertyId ? propertyService.getPropertyImages(propertyId) : []),
    enabled: !!propertyId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: React.useMemo(
      () => ({
        name: property?.name || "",
        address: property?.address || "",
        price: property?.price || 0,
        codeInternal: property?.codeInternal || "",
        year: property?.year || new Date().getFullYear(),
        idOwner: property?.idOwner || "",
      }),
      [property]
    ),
  });

  // Reset form when property data is loaded
  React.useEffect(() => {
    if (property) {
      setPropertyId(property.id);
      reset(property);
    }
  }, [property, reset]);

  // Create or update property mutation
  const propertyMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (isEditMode && id) {
        return propertyService.updateProperty(id, data);
      }
      return propertyService.createProperty(data);
    },
    onSuccess: data => {
      setPropertyId(data.id);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      if (!isEditMode) {
        navigate(`/propiedades/editar/${data.id}`);
      } else {
        reset(data);
      }
    },
  });

  // Upload images mutation
  const imageUploadMutation = useMutation({
    mutationFn: async ({ propertyId, files }: { propertyId: string; files: FileList }) => {
      const uploadPromises = Array.from(files).map(async file => {
        const formData = new FormData();
        console.log(file);
        formData.append("file", file, file.name);
        return propertyService.uploadPropertyImage(propertyId, formData);
      });
      return Promise.all(uploadPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["propertyImages", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      // Show success message or toast
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!propertyId) throw new Error("Property ID is required");
      return propertyService.deletePropertyImage(propertyId, imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propertyImages", propertyId] });
      // Show success message or toast
    },
  });

  const handleDeleteImage = async (imageId: string) => {
    if (!propertyId) return;

    try {
      await deleteImageMutation.mutateAsync(imageId);
    } catch (error) {
      console.error("Error deleting image:", error);
      // Show error message or toast
    }
  };

  const handleSetAsMain = async (imageId: string) => {
    if (!propertyId) return;

    try {
      const response = await fetch(
        `${import.meta.env["VITE_API_BASE_URL"]}/properties/${propertyId}/images/${imageId}/set-as-main`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al establecer como imagen principal");
      }

      queryClient.invalidateQueries({ queryKey: ["propertyImages", propertyId] });
      // Show success message or toast
    } catch (error) {
      console.error("Error setting image as main:", error);
      // Show error message or toast
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async data => {
    try {
      // Save or update property
      const result = await propertyMutation.mutateAsync(data);

      // Handle image upload if files are selected
      if (data.images && data.images.length > 0) {
        await imageUploadMutation.mutateAsync({
          propertyId: result.id,
          files: data.images,
        });
      }

      if (!isEditMode) {
        navigate("/propiedades");
      }
    } catch (error) {
      console.error("Error saving property:", error);
      // Handle error (show toast, etc.)
    }
  };

  const isLoading =
    propertyMutation.isPending || imageUploadMutation.isPending || isLoadingProperty;

  // Nuevo componente para gestión de imágenes

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? "Editar Propiedad" : "Nueva Propiedad"}
      </h2>
      <div className="pb-6">
        {/* El formulario de imágenes ahora es independiente */}
        {propertyId && (
          <PropertyImagesForm
            propertyImages={propertyImages}
            onUpload={async (files: FileList) => {
              await imageUploadMutation.mutateAsync({ propertyId, files });
            }}
            onDelete={handleDeleteImage}
            onSetAsMain={handleSetAsMain}
            isLoading={imageUploadMutation.isPending || deleteImageMutation.isPending}
          />
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <p className="text-gray-600">
            {isEditMode
              ? "Edita la información de la propiedad."
              : "Completa el formulario para agregar una nueva propiedad."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup label="Nombre" error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder="Nombre de la propiedad"
                error={!!errors.name}
              />
            </FormGroup>

            <FormGroup label="Código Interno" error={errors.codeInternal?.message}>
              <Input
                {...register("codeInternal")}
                placeholder="Código único de identificación"
                error={!!errors.codeInternal}
              />
            </FormGroup>

            <FormGroup label="Dirección" error={errors.address?.message} className="md:col-span-2">
              <Textarea
                {...register("address")}
                placeholder="Dirección completa de la propiedad"
                rows={2}
                error={!!errors.address}
              />
            </FormGroup>

            <FormGroup label="Precio" error={errors.price?.message}>
              <Input
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="Precio en USD"
                error={!!errors.price}
              />
            </FormGroup>

            <FormGroup label="Año de construcción" error={errors.year?.message}>
              <Input
                type="number"
                {...register("year", { valueAsNumber: true })}
                placeholder="Año de construcción"
                error={!!errors.year}
              />
            </FormGroup>

            <FormGroup label="ID del Propietario" error={errors.idOwner?.message}>
              <Input
                {...register("idOwner")}
                placeholder="ID del propietario"
                error={!!errors.idOwner}
              />
            </FormGroup>
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading || !isDirty}>
            {isEditMode ? "Guardar Cambios" : "Crear Propiedad"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyFormPage;

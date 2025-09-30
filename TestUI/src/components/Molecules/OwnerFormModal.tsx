import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Atoms/Button";
import Input from "@/components/Atoms/Form/Input";
import { format } from "date-fns";
import { FaTimes } from "react-icons/fa";
import { ownerSchema, type Owner } from "@/schemas/Owner";

interface OwnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Owner, cb: () => void) => Promise<void>;
}

export function OwnerFormModal({ isOpen, onClose, onSubmit }: OwnerFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Owner>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      name: "",
      address: "",
      birthday: new Date(),
    },
  });

  const handleFormSubmit = async (data: Owner) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data, () => {
        reset();
        onClose();
      });
    } catch (error) {
      console.error("Error creating owner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Owner</h2>
          <Button onClick={onClose} variant="ghost" disabled={isSubmitting}>
            <FaTimes />
          </Button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <Input
              {...register("name")}
              placeholder="John Doe"
              error={errors.name}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <Input
              {...register("address")}
              placeholder="123 Main St, City, Country"
              error={errors.address}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Birthday *</label>
            <Input
              type="date"
              {...register("birthday")}
              max={format(new Date(), "yyyy-MM-dd")}
              error={errors.birthday}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo URL (optional)
            </label>
            <Input
              {...register("photo")}
              placeholder="https://example.com/photo.jpg"
              error={errors.photo}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Owner"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

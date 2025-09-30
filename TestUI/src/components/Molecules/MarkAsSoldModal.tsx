import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/Atoms/Form/Input";
import { Button } from "@/components/Atoms/Button/Button";
import { propertyTraceSchema, type PropertyTrace } from "@/schemas/PropertyTrace";
import { type Property } from "@/schemas/Property";

type MarkAsSoldModalProps = {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: PropertyTrace) => void;
};

export function MarkAsSoldModal({ property, isOpen, onClose, onConfirm }: MarkAsSoldModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyTrace>({
    resolver: zodResolver(propertyTraceSchema),
    defaultValues: {
      value: 0,
      tax: 0,
      name: "",
      idProperty: property.id,
    },
  });

  const onSubmit = (data: PropertyTrace) => {
    console.log(data);
    onConfirm(data);
    reset();
  };

  // Get owners list for the owner selector

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Mark "{property.name}" as Sold
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input label="Name" type="text" error={!!errors.name} {...field} />
                    )}
                  />
                  <Controller
                    name="value"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Sale Value ($)"
                        type="number"
                        min="0"
                        step="0.01"
                        error={!!errors.value}
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />

                  <Controller
                    name="tax"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Tax ($)"
                        type="number"
                        min="0"
                        step="0.01"
                        error={!!errors.tax}
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    )}
                  />

                  <Controller
                    name="dateSale"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Date Sold"
                        type="date"
                        error={!!errors.dateSale}
                        {...field}
                        value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                      />
                    )}
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="success">
                      Mark as Sold
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

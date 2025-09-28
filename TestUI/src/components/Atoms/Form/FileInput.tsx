import { useController, type UseControllerProps, type FieldValues, type Path, type PathValue } from 'react-hook-form';
import { type ComponentProps, useState, type ChangeEvent } from 'react';

type FileInputProps<T extends FieldValues> = Omit<ComponentProps<'input'>, 'defaultValue' | 'name' | 'onChange' | 'value'> & {
  label?: string;
  error?: string;
  containerClassName?: string;
  previewUrl?: string | null;
  onFileChange?: (file: File | null) => void;
  name: Path<T>;
  control?: UseControllerProps<T>['control'];
  rules?: {
    required?: string | { value: boolean; message: string };
    [key: string]: any;
  };
  defaultValue?: PathValue<T, Path<T>>;
};

export function FileInput<T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  label,
  error,
  containerClassName = '',
  className = '',
  accept = 'image/*',
  previewUrl: initialPreviewUrl,
  onFileChange,
  ...props
}: FileInputProps<T>) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  
  const {
    field: { onChange, value, ref, ...field },
    fieldState: { error: fieldError },
  } = useController<T>({
    name,
    control,
    rules,
    defaultValue,
  } as UseControllerProps<T>);

  const errorMessage = error || fieldError?.message;
  const fileInputId = props.id || `file-input-${name}`;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(initialPreviewUrl || null);
    }

    onChange(file);
    if (onFileChange) onFileChange(file);
  };

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={fileInputId}>
          {label}
          {(typeof rules?.required === 'string' || rules?.required?.value) && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <div className="mt-1 flex items-center">
        <label
          htmlFor={fileInputId}
          className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {value ? 'Cambiar archivo' : 'Seleccionar archivo'}
        </label>
        <input
          id={fileInputId}
          ref={ref}
          type="file"
          className="sr-only"
          accept={accept}
          onChange={handleFileChange}
          {...field}
          {...props}
        />
        <span className="ml-2 text-sm text-gray-500">
          {value?.name || "Ningún archivo seleccionado"}
        </span>
      </div>

      {previewUrl && (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Vista previa"
            className="h-32 w-32 object-cover rounded-md"
          />
        </div>
      )}

      {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}

export default FileInput;

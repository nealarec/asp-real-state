import { useController } from 'react-hook-form';
import type { FieldValues, Path, RegisterOptions, Control } from 'react-hook-form';
import { type ComponentProps, type ChangeEvent } from 'react';

type FileInputRules<T extends FieldValues> = Omit<
  RegisterOptions<T, Path<T>>, 
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
> & {
  required?: string | { value: boolean; message: string } | boolean;
};

type FileInputProps<T extends FieldValues> = Omit<ComponentProps<'input'>, 'defaultValue' | 'name' | 'onChange' | 'value'> & {
  label?: string;
  error?: string;
  containerClassName?: string;
  name: Path<T>;
  control: Control<T>;
  rules?: FileInputRules<T>;
  accept?: string;
  multiple?: boolean;
};

export function FileInput<T extends FieldValues>({
  name,
  control,
  rules,
  label,
  error,
  containerClassName = '',
  className = '',
  accept = 'image/*',
  multiple = false,
  ...props
}: FileInputProps<T>) {
  const {
    field: { onChange, ref, ...field },
    fieldState: { error: fieldError },
  } = useController<T>({
    name,
    control,
    rules: rules as any, // Type assertion to handle the custom required type
  });

  const errorMessage = error || fieldError?.message;
  const fileInputId = `file-input-${name}`;
  const isRequired = rules?.required !== undefined && rules.required !== false;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    // This is for react-hook-form
    if (files) {
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach(file => dataTransfer.items.add(file));
      e.target.files = dataTransfer.files;
    }
    
    onChange(e);
  };

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={fileInputId}>
          {label}
          {isRequired && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}
      <div className="mt-1 flex items-center">
        <input
          id={fileInputId}
          type="file"
          ref={ref}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${className}`}
          {...field}
          {...props}
        />
      </div>
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}

export default FileInput;

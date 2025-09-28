import type { FieldValues, Path, Control } from 'react-hook-form';
import { FileInput } from '../Form/FileInput';

type ImageUploaderProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  isUploading?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
};

export function ImageUploader<T extends FieldValues>({
  name,
  control,
  isUploading = false,
  multiple = true,
  disabled = false,
  className = "",
}: ImageUploaderProps<T>) {
  return (
    <div className={`relative ${className}`}>
      <FileInput
        name={name}
        control={control}
        accept="image/*"
        multiple={multiple}
        disabled={disabled || isUploading}
      />
      {isUploading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}

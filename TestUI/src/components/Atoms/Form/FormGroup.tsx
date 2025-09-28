import { type ReactNode } from "react";

interface FormGroupProps {
  children: ReactNode;
  className?: string;
  error?: string;
  label?: string;
  htmlFor?: string;
  required?: boolean;
  description?: string;
}

const FormGroup = ({
  children,
  className = "",
  error,
  label,
  htmlFor,
  required,
  description,
}: FormGroupProps) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}

      {children}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormGroup;

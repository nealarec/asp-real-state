import { type InputHTMLAttributes, forwardRef } from "react";
import { type FieldError } from "react-hook-form";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", containerClassName = "", ...props }, ref) => {
    const checkboxId =
      props.id || props.name || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <div className={`flex items-center ${containerClassName}`}>
        <input
          id={checkboxId}
          type="checkbox"
          ref={ref}
          className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className} ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...props}
        />
        {label && (
          <label htmlFor={checkboxId} className="ml-2 block text-sm text-gray-900">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

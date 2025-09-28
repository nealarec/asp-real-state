import { type SelectHTMLAttributes, forwardRef } from "react";
import { type FieldError } from "react-hook-form";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldError;
  options: SelectOption[];
  containerClassName?: string;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      className = "",
      containerClassName = "",
      placeholder = "Seleccione una opción",
      ...props
    },
    ref
  ) => {
    const selectId = props.id || props.name || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${className} ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;

import { type TextareaHTMLAttributes, forwardRef } from "react";
import { type FieldError } from "react-hook-form";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldError | boolean;
  containerClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", containerClassName = "", ...props }, ref) => {
    const textareaId =
      props.id || props.name || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={3}
          className={`block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${className} ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...props}
        />
        {error && typeof error === 'object' && error.message && (
          <p className="mt-1 text-sm text-red-600">{error.message}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;

import { type FieldError } from "react-hook-form";

interface FormErrorProps {
  error?: FieldError | string;
  className?: string;
}

const FormError = ({ error, className = "" }: FormErrorProps) => {
  if (!error) return null;

  const errorMessage = typeof error === "string" ? error : error.message;

  return <p className={`mt-1 text-sm text-red-600 ${className}`}>{errorMessage}</p>;
};

export default FormError;

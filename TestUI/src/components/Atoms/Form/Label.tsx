import { type LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
  required?: boolean;
}

const Label = ({ children, className = "", required = false, ...props }: LabelProps) => (
  <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

export default Label;

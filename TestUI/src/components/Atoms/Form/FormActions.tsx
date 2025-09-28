import { type ReactNode } from "react";
import Button from "./Button";

interface FormActionsProps {
  onCancel?: () => void;
  onSave?: () => void;
  isLoading?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  className?: string;
  children?: ReactNode;
}

const FormActions = ({
  onCancel,
  onSave,
  isLoading = false,
  saveLabel = "Guardar",
  cancelLabel = "Cancelar",
  className = "",
  children,
}: FormActionsProps) => {
  return (
    <div
      className={`flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 ${className}`}
    >
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
      )}

      {onSave && (
        <Button type="submit" variant="primary" onClick={onSave} isLoading={isLoading}>
          {saveLabel}
        </Button>
      )}

      {children}
    </div>
  );
};

export default FormActions;

import { format } from "date-fns";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Button } from "../Atoms/Button/Button";
import type { PropertyTrace } from "@/schemas/PropertyTrace";

interface PropertyHistoryProps {
  propertyTraces: PropertyTrace[];
  isLoading: boolean;
  onEdit?: (trace: PropertyTrace) => void;
  onDelete?: (trace: PropertyTrace) => void;
}

export const PropertyHistory = ({
  propertyTraces,
  isLoading,
  onEdit,
  onDelete,
}: PropertyHistoryProps) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  if (propertyTraces.length === 0) {
    return <div className="text-center py-8 text-gray-500">No property history available</div>;
  }

  return (
    <div className="space-y-4">
      {propertyTraces.map(trace => (
        <div key={trace.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium">{trace.name}</h3>
              {trace.dateSale && (
                <p className="text-sm text-gray-600">
                  {format(new Date(trace.dateSale), "MMM d, yyyy")}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium">${trace.value.toLocaleString()}</p>
              {trace.tax > 0 && (
                <p className="text-sm text-gray-600">Tax: ${trace.tax.toLocaleString()}</p>
              )}
            </div>
            {(onEdit || onDelete) && (
              <div className="flex flex-col sm:flex-row">
                {onEdit && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => onEdit(trace)}
                    className="rounded-none rounded-t md:rounded-none md:rounded-l"
                    aria-label="Edit property trace"
                  >
                    <FaEdit className="h-5 w-5" />
                  </Button>
                )}
                {onDelete && trace.id && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(trace)}
                    className="rounded-none rounded-b md:rounded-none md:rounded-r"
                    aria-label="Delete property trace"
                  >
                    <FaTrash className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

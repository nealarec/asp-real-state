import { format } from "date-fns";

export interface PropertyTrace {
  id?: string;
  idPropertyTrace?: string;
  idProperty?: string;
  name: string;
  dateSale?: string | Date;
  value: number;
  tax: number;
  [key: string]: any; // Allow additional properties
}

interface PropertyHistoryProps {
  propertyTraces: PropertyTrace[];
  isLoading: boolean;
}

export const PropertyHistory = ({ propertyTraces, isLoading }: PropertyHistoryProps) => {
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
        <div
          key={trace.idPropertyTrace || trace.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
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
          </div>
        </div>
      ))}
    </div>
  );
};

import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

const PropertyFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Aquí irá la lógica del formulario

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? "Editar Propiedad" : "Nueva Propiedad"}
      </h2>

      <div className="space-y-6">
        <p className="text-gray-600">
          {isEditMode
            ? "Edita la información de la propiedad."
            : "Completa el formulario para agregar una nueva propiedad."}
        </p>

        {/* Aquí irán los campos del formulario */}

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditMode ? "Guardar Cambios" : "Crear Propiedad"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFormPage;

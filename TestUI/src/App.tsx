import * as React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import OwnersPage from "./pages/owners/OwnersPage";
import OwnerDetailPage from "./pages/owners/OwnerDetailPage";
import PropertiesPage from "./pages/properties/PropertiesPage";
import PropertyDetailPage from "./pages/properties/PropertyDetailPage";

// Componente de diseño común (layout)
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-800">
                  Inmobiliaria
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/propietarios">Propietarios</Link>
                <Link to="/propiedades">Propiedades</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

// Componente para enlaces de navegación
const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        isActive
          ? "border-blue-500 text-gray-900"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
      }`}
    >
      {children}
    </Link>
  );
};

// Type assertion for Routes and Route components
const AppRoutes = Routes as React.FC<{ children: React.ReactNode }>;
const AppRoute = Route as React.FC<{ path: string; element: React.ReactNode }>;

const App: React.FC = () => {
  return (
    <AppRoutes>
      <AppRoute
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <AppRoute
        path="/propietarios"
        element={
          <Layout>
            <OwnersPage />
          </Layout>
        }
      />
      <AppRoute
        path="/propietarios/:id"
        element={
          <Layout>
            <OwnerDetailPage />
          </Layout>
        }
      />
      <AppRoute
        path="/propiedades"
        element={
          <Layout>
            <PropertiesPage />
          </Layout>
        }
      />
      <AppRoute
        path="/propiedades/:id"
        element={
          <Layout>
            <PropertyDetailPage />
          </Layout>
        }
      />
      {/* Ruta 404 */}
      <AppRoute
        path="*"
        element={
          <Layout>
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600">Página no encontrada</p>
              <Link
                to="/"
                className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </Layout>
        }
      />
    </AppRoutes>
  );
};

export default App;

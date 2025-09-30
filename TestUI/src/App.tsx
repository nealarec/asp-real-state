import * as React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Layout } from "./components/Layouts";
import HomePage from "./pages/HomePage";
import OwnersPage from "./pages/owners/OwnersPage";
import OwnerDetailPage from "./pages/owners/OwnerDetailPage";
import PropertiesPage from "./pages/properties/PropertiesPage";
import PropertyDetailPage from "./pages/properties/PropertyDetailPage";
import PropertyFormPage from "./pages/properties/PropertyFormPage";
import { Toaster } from "react-hot-toast";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Los componentes Layout y NavLink han sido movidos a /src/components/Layout/

const AppRoutes = Routes as React.FC<{ children: React.ReactNode }>;
const AppRoute = Route as React.FC<{ path: string; element: React.ReactNode }>;

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
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
            path="/owners"
            element={
              <Layout>
                <OwnersPage />
              </Layout>
            }
          />
          <AppRoute
            path="/owners/:id"
            element={
              <Layout>
                <OwnerDetailPage />
              </Layout>
            }
          />
          <AppRoute
            path="/properties"
            element={
              <Layout>
                <PropertiesPage />
              </Layout>
            }
          />
          <AppRoute
            path="/properties/new"
            element={
              <Layout>
                <PropertyFormPage />
              </Layout>
            }
          />
          <AppRoute
            path="/properties/edit/:id"
            element={
              <Layout>
                <PropertyFormPage />
              </Layout>
            }
          />
          <AppRoute
            path="/properties/:id"
            element={
              <Layout>
                <PropertyDetailPage />
              </Layout>
            }
          />
          <AppRoute
            path="*"
            element={
              <Layout>
                <div className="text-center py-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-6">Page not found</p>
                  <Link
                    to="/"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to home
                  </Link>
                </div>
              </Layout>
            }
          />
        </AppRoutes>
      </div>
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      <Toaster position="top-center" reverseOrder={false} />
    </QueryClientProvider>
  );
};

export default App;

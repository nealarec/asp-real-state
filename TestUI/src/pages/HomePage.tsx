export default function HomePage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-6">Sistema de Gestión de Propiedades</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <a
          href="/propietarios"
          className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white"
        >
          <h2 className="text-xl font-semibold mb-2">Propietarios</h2>
          <p className="text-gray-600">Gestión de propietarios y sus propiedades</p>
        </a>
        <a
          href="/propiedades"
          className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white"
        >
          <h2 className="text-xl font-semibold mb-2">Propiedades</h2>
          <p className="text-gray-600">Explora y gestiona todas las propiedades</p>
        </a>
      </div>
    </div>
  );
}

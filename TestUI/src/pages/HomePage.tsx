export default function HomePage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-6">Property Management System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <a
          href="/properties"
          className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white"
        >
          <h2 className="text-xl font-semibold mb-2">Properties</h2>
          <p className="text-gray-600">Explore and manage all properties</p>
        </a>
        <a
          href="/owners"
          className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white"
        >
          <h2 className="text-xl font-semibold mb-2">Owners</h2>
          <p className="text-gray-600">Manage property owners and their properties</p>
        </a>
      </div>
    </div>
  );
}

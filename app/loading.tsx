export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <header className="text-center mb-12">
          <div className="h-12 w-64 mx-auto bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="h-6 w-96 mx-auto bg-gray-200 rounded-lg animate-pulse" />
        </header>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Pokemon Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse" />
              <div className="h-48 bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

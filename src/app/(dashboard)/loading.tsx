export default function DashboardLoading() {
  return (
    <div className="space-y-4 animate-pulse max-w-4xl">
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />
      <div className="bg-white rounded-lg border divide-y">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-4">
            <div className="space-y-2">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

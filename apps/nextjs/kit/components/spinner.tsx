export const Spinner = () => (
  <div className="text-center py-20">
    <div className="inline-block relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300" />
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-900 absolute top-0 left-0" />
    </div>
  </div>
)

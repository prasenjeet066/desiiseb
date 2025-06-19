export default function HeaderSkeleton() {
  return (
    <header className="border-b border-gray-800/50 bg-black/95 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <div className="skeleton h-8 w-24 rounded"></div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="skeleton h-11 w-full rounded-full"></div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-1 flex-shrink-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-10 w-20 rounded-full"></div>
          ))}
        </nav>
      </div>
    </header>
  )
}

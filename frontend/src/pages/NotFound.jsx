import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-gray-100 select-none">404</p>
        <h1 className="text-2xl font-bold mt-2 mb-2">Page Not Found</h1>
        <p className="text-gray-400 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/"
            className="bg-black text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
            Go Home
          </Link>
          <Link to="/women"
            className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:border-gray-400 transition">
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  )
}

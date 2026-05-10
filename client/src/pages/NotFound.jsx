import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <h1 className="text-9xl font-bold text-purple-500">404</h1>
      <h2 className="text-4xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-slate-400 mt-4 text-lg text-center max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-bold transition-all"
      >
        Go Back Home
      </Link>
    </div>
  )
}

export default NotFound

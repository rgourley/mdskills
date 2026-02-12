import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-neutral-900">404</h1>
      <p className="mt-2 text-neutral-600">Page not found</p>
      <Link
        href="/"
        className="mt-6 text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back home
      </Link>
    </div>
  )
}

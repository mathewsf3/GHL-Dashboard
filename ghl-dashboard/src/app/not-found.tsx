import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-6xl font-bold text-white mb-4">404</h2>
        <p className="text-xl text-gray-300 mb-8">Page not found</p>
        <Link 
          href="/landing" 
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Go to Landing Page
        </Link>
      </div>
    </div>
  );
}
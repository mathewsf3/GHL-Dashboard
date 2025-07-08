export default function StyleTest() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-4">Style Test Page</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-purple-600 p-4 rounded-lg">
          <p className="text-white">Purple Box</p>
        </div>
        
        <div className="bg-blue-600 p-4 rounded-lg">
          <p className="text-white">Blue Box</p>
        </div>
        
        <div className="bg-green-600 p-4 rounded-lg">
          <p className="text-white">Green Box</p>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
        <h2 className="text-2xl font-semibold text-white">Gradient Test</h2>
        <p className="text-gray-100 mt-2">If you can see this styled properly, Tailwind is working!</p>
      </div>
    </div>
  );
}
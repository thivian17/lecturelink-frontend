import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="px-8 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🎙️</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">LectureLink</span>
          </div>
          
          <div className="flex gap-4">
            <Link href="/login">
              <button className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition">
                Log in
              </button>
            </Link>
            <Link href="/login">
              <button className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition shadow-lg shadow-blue-200">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-8 pt-20 pb-32 text-center fade-in">
        <div className="mb-8">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-8">
            ✨ Never miss a lecture again
          </span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Your lectures,
          <br />
          <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            brilliantly organized
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
          Upload your lecture recordings and slides. Get AI-powered transcripts, 
          intelligent summaries, and study guides in minutes.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <button className="px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition shadow-xl shadow-blue-200 flex items-center gap-2">
              <span className="text-xl">🚀</span>
              Start Processing Lectures
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to transform your lectures
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-blue-200">
                📤
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                1. Upload Files
              </h3>
              <p className="text-gray-600">
                Upload your lecture audio (MP3, WAV, M4A) and slides (PDF, PPTX). 
                We support files up to 500MB.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100">
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-purple-200">
                🤖
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                2. AI Processing
              </h3>
              <p className="text-gray-600">
                Our AI transcribes audio, extracts slide content, and aligns 
                everything using advanced semantic analysis.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100">
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-green-200">
                📚
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                3. Study Smarter
              </h3>
              <p className="text-gray-600">
                Get key concepts, definitions, and actionable study guides. 
                Everything organized and ready to review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-500 font-semibold mb-4 block">Powered by AI</span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Intelligent content extraction
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Key Concepts</h4>
                    <p className="text-gray-600">Automatically identifies and explains important topics</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Definitions</h4>
                    <p className="text-gray-600">Extracts and organizes technical terms</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Slide Alignment</h4>
                    <p className="text-gray-600">Links spoken content to specific slides</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Study Questions</h4>
                    <p className="text-gray-600">Generates questions to test your understanding</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <div className="text-gray-400"># Processing lecture...</div>
                <div className="text-green-400">✓ Audio transcribed (1,234 sentences)</div>
                <div className="text-green-400">✓ Slides processed (45 slides)</div>
                <div className="text-green-400">✓ Content aligned (94% coverage)</div>
                <div className="text-green-400">✓ Summary generated</div>
                <div className="text-blue-400 mt-4">→ Ready for study!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-500 to-blue-600">
        <div className="max-w-4xl mx-auto px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to transform your lectures?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join students who are studying smarter with AI-powered lecture processing
          </p>
          <Link href="/login">
            <button className="px-10 py-5 bg-white text-blue-600 rounded-2xl text-xl font-semibold hover:shadow-2xl transition transform hover:scale-105 inline-flex items-center gap-3">
              <span className="text-2xl">🎙️</span>
              Get Started Free
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎙️</span>
            </div>
            <span className="text-xl font-bold text-white">LectureLink</span>
          </div>
          <p className="text-sm mb-4">
            Helping students learn better, one lecture at a time.
          </p>
          <p className="text-xs text-gray-500">
            © 2025 LectureLink. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}

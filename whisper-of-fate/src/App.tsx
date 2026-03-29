import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TarotPage from './pages/TarotPage';
import NatalPage from './pages/NatalPage';

function App() {
  return (
    <Router>
      <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
        <nav className="flex justify-center gap-8 mb-12">
          <Link to="/" className="text-magical-gold hover:text-white transition-colors uppercase tracking-widest text-sm font-bold border-b border-transparent hover:border-magical-gold pb-1">
            🎴 Таро
          </Link>
          <Link to="/natal" className="text-magical-gold hover:text-white transition-colors uppercase tracking-widest text-sm font-bold border-b border-transparent hover:border-magical-gold pb-1">
            ✨ Натальна карта
          </Link>
        </nav>

        <header className="text-center mb-16">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-magical-accent via-white to-magical-gold mb-3">
            Whisper of Fate
          </h1>
          <p className="text-gray-400 font-light tracking-widest">DIGITAL ORACLE</p>
        </header>

        <Routes>
          <Route path="/" element={<TarotPage />} />
          <Route path="/natal" element={<NatalPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
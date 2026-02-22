import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Submit from './pages/Submit';
import Treasurer from './pages/Treasurer';
import { Wallet } from 'lucide-react';

function App() {
  return (
    <>
      <header className="header">
        <Link to="/" className="logo">
          <Wallet size={28} color="#8b5cf6" />
          <span>XRPayroll</span>
        </Link>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Register</Link>
          <Link to="/submit" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Submit Receipt</Link>
          <Link to="/treasurer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>Treasurer</Link>
        </nav>
      </header>

      <main className="container animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/treasurer" element={<Treasurer />} />
        </Routes>
      </main>
    </>
  );
}

export default App;

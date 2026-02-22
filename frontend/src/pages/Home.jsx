import { Link } from 'react-router-dom';
import { Camera, ShieldCheck, CreditCard } from 'lucide-react';

export default function Home() {
    return (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>Reimburse Your Team<br />at Lightning Speed.</h1>
            <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
                Snap a picture of your receipt, let AI extract the details, and get paid directly to your XRP Ledger wallet instantly upon approval.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '4rem' }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                            <ShieldCheck size={40} color="#3b82f6" />
                        </div>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Register Profile</h2>
                        <p style={{ textAlign: 'center', fontSize: '0.95rem' }}>Link your testnet address to join the club payroll.</p>
                    </div>
                </Link>

                <Link to="/submit" style={{ textDecoration: 'none' }}>
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                            <Camera size={40} color="#8b5cf6" />
                        </div>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Submit Receipt</h2>
                        <p style={{ textAlign: 'center', fontSize: '0.95rem' }}>AI automatically extracts amount and merchant.</p>
                    </div>
                </Link>

                <Link to="/treasurer" style={{ textDecoration: 'none' }}>
                    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem' }}>
                        <div style={{ background: 'rgba(244, 63, 94, 0.2)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
                            <CreditCard size={40} color="#f43f5e" />
                        </div>
                        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Treasurer</h2>
                        <p style={{ textAlign: 'center', fontSize: '0.95rem' }}>Review requests and execute on-chain payments.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

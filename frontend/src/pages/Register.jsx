import { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('password', password);
            formData.append('xrpl_address', address);

            const res = await fetch('http://127.0.0.1:8000/users', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Could not register user. Address might already exist.");
            const data = await res.json();
            setResult({ success: true, message: `Welcome ${data.name}! Your Employee ID is ${data.id}.` });
            setName(''); setPassword(''); setAddress('');
        } catch (err) {
            setResult({ success: false, message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '450px', margin: '4rem auto' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <UserPlus size={28} color="#8b5cf6" />
                    <h2 style={{ color: 'white' }}>Join the Club</h2>
                </div>

                {result && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        background: result.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: result.success ? '#86efac' : '#fca5a5',
                        border: `1px solid ${result.success ? '#4ade80' : '#f87171'}`
                    }}>
                        {result.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input
                            required type="text" className="input-field"
                            value={name} onChange={e => setName(e.target.value)}
                            placeholder="Joshua Zhang"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Secure Password</label>
                        <input
                            required type="password" className="input-field"
                            value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">XRP Testnet Address</label>
                        <input
                            required type="text" className="input-field"
                            value={address} onChange={e => setAddress(e.target.value)}
                            placeholder="rPr..."
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Register Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Camera, Send, Loader2, CheckCircle } from 'lucide-react';

export default function Submit() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [password, setPassword] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/users')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error("Failed to load users", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setResult({ success: false, message: "Please select an image file." });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('submitter_id', selectedUser);
            formData.append('password', password);
            formData.append('file', file);

            const res = await fetch('http://127.0.0.1:8000/submit-receipt', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Submission failed");

            setResult({
                success: true,
                message: 'Receipt submitted successfully!',
                details: `Identified ${data.receipt.merchant} for $${data.receipt.amount}`
            });
            setPassword('');
            setFile(null);
        } catch (err) {
            setResult({ success: false, message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '4rem auto' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Camera size={28} color="#8b5cf6" />
                    <h2 style={{ color: 'white' }}>Submit Receipt</h2>
                </div>

                {result && (
                    <div className="animate-fade-in" style={{
                        padding: '1.5rem',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        background: result.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${result.success ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)'}`
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: result.details ? '0.5rem' : 0 }}>
                            {result.success && <CheckCircle size={20} color="#4ade80" />}
                            <strong style={{ color: result.success ? '#4ade80' : '#f87171' }}>{result.message}</strong>
                        </div>
                        {result.details && <p style={{ margin: 0, color: '#a7f3d0' }}>{result.details}</p>}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Select Employee Profile</label>
                        <select
                            required className="input-field"
                            value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
                        >
                            <option value="" disabled>Choose your name...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} (ID: {u.id})</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            required type="password" className="input-field"
                            value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="Verify it's you..."
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Receipt Image</label>
                        <input
                            required type="file" accept="image/*" className="input-field"
                            onChange={e => setFile(e.target.files[0])}
                            style={{ padding: '0.75rem 1rem' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
                        {loading ? (
                            <><Loader2 size={20} className="animate-spin" /> Analyzing with AI...</>
                        ) : (
                            <><Send size={20} /> Submit for Approval</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

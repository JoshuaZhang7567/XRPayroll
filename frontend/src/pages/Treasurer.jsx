import { useState, useEffect } from 'react';
import { CreditCard, Check, Loader2, ExternalLink } from 'lucide-react';

export default function Treasurer() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState(null);
    const [result, setResult] = useState(null);

    const fetchPending = () => {
        fetch('http://127.0.0.1:8000/pending-receipts')
            .then(res => res.json())
            .then(data => {
                setReceipts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load receipts", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id) => {
        setApprovingId(id);
        setResult(null);
        try {
            const res = await fetch(`http://127.0.0.1:8000/approve-receipt/${id}`, { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || "Approval failed");

            setResult({
                success: true,
                message: 'Payment sent on XRP Ledger!',
                tx_hash: data.tx_hash
            });
            fetchPending(); // Refresh list
        } catch (err) {
            setResult({ success: false, message: err.message });
        } finally {
            setApprovingId(null);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '4rem auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                <CreditCard size={36} color="#f43f5e" />
                <h2 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>Treasurer Dashboard</h2>
            </div>

            {result && (
                <div className="animate-fade-in glass-panel" style={{
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    background: result.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderLeft: `4px solid ${result.success ? '#4ade80' : '#f87171'}`
                }}>
                    <h3 style={{ color: result.success ? '#4ade80' : '#f87171', marginBottom: '0.5rem' }}>
                        {result.message}
                    </h3>
                    {result.tx_hash && (
                        <a
                            href={`https://testnet.xrpl.org/transactions/${result.tx_hash}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}
                        >
                            View on XRPL Explorer <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 size={40} className="animate-spin" color="#8b5cf6" />
                </div>
            ) : receipts.length === 0 ? (
                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--text-secondary)' }}>No pending receipts to review!</h3>
                    <p style={{ marginTop: '1rem' }}>You're all caught up.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {receipts.map(r => (
                        <div key={r.id} className="glass-card animate-fade-in" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', color: 'white', margin: 0 }}>${r.amount.toFixed(2)}</h3>
                                        <p style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '1.1rem', margin: '0.25rem 0' }}>{r.merchant}</p>
                                    </div>
                                    <span style={{ background: 'var(--surface-hover)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                        ID: #{r.id}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Submitter</span>
                                        <p style={{ margin: 0, fontWeight: 500, color: 'white' }}>{r.submitter}</p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date on Receipt</span>
                                        <p style={{ margin: 0, fontWeight: 500, color: 'white' }}>{r.date}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '200px' }}>
                                <button
                                    onClick={() => handleApprove(r.id)}
                                    disabled={approvingId === r.id}
                                    className="btn-primary"
                                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                                >
                                    {approvingId === r.id ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><Check size={18} /> Approve & Pay</>}
                                </button>
                                <div style={{ textAlign: 'center' }}>
                                    <a
                                        href={`http://127.0.0.1:8000/${r.image_path}`}
                                        target="_blank" rel="noreferrer"
                                        style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'underline' }}
                                    >
                                        View Original Image
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

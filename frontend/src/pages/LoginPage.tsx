import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiError } from '../api/apiService';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { await login(email, password); navigate((location.state as { from?: string } | null)?.from || '/dashboard', { replace: true }); } catch (reason) { setError(apiError(reason)); } finally { setBusy(false); } };
  return <div className="auth-page"><section className="auth-panel"><div className="auth-heading"><span className="eyebrow">Welcome back</span><h1>Sign in to your account</h1><p>Manage listings, offers, saved furniture, and conversations.</p></div>{error && <Alert message={error} />}<form onSubmit={submit} className="stack-form"><label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="button button-primary button-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form><p className="auth-switch">New to Furnish Exchange? <Link to="/register">Create an account</Link></p></section><aside className="auth-aside"><span>Buy thoughtfully.</span><strong>Exchange directly.</strong><p>Keep useful furniture moving through your community.</p></aside></div>;
}

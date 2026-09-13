import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState('03196253a8');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError('Invalid credentials or API error. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-logo">I</div>

        <p className="login-kicker">IVY HOMES</p>
        <h1>Welcome back.</h1>
        <p className="login-subtitle">
          Sign in to continue exploring properties.
        </p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="login-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="login-footer">Ivy Homes Property Platform</p>
      </div>
    </main>
  );
}
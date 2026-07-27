import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MESSAGES, UI_CONSTANTS, VALIDATION_RULES } from '../constants/config';
import Alert from '../components/Alert';
import './Auth.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate input
    if (!email || !password) {
      setError(MESSAGES.REQUIRED_FIELD);
      return;
    }

    if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      setError(MESSAGES.INVALID_EMAIL);
      return;
    }

    try {
      await login(email, password);
      setSuccess(MESSAGES.LOGIN_SUCCESS);
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      setError(err.message || MESSAGES.LOGIN_FAILED);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="text-center mb-4">{UI_CONSTANTS.PAGE_TITLES.LOGIN}</h1>
        <p className="text-center text-muted mb-3">
          Demo login: <strong>demo@example.com</strong> / <strong>demo1234</strong>
        </p>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : UI_CONSTANTS.BUTTONS.LOGIN}
          </button>
        </form>

        <p className="text-center">
          Don't have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

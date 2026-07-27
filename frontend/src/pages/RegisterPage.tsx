import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MESSAGES, UI_CONSTANTS, VALIDATION_RULES } from '../constants/config';
import Alert from '../components/Alert';
import './Auth.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      setError(MESSAGES.REQUIRED_FIELD);
      return;
    }

    if (name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
      setError('Name must be at least 2 characters.');
      return;
    }

    if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      setError(MESSAGES.INVALID_EMAIL);
      return;
    }

    if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      setError(MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }

    if (password !== confirmPassword) {
      setError(MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    try {
      await register(name, email, password);
      setSuccess(MESSAGES.REGISTER_SUCCESS);
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      setError(err.message || MESSAGES.REGISTER_FAILED);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="text-center mb-4">{UI_CONSTANTS.PAGE_TITLES.REGISTER}</h1>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>

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
              placeholder="Enter password (min 8 characters)"
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : UI_CONSTANTS.BUTTONS.REGISTER}
          </button>
        </form>

        <p className="text-center">
          Already have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

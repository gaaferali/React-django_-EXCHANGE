import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { User } from '../types';
import { UI_CONSTANTS, MESSAGES } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<Partial<User>>(
    user || { name: '', email: '' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setIsLoading(true);
      const updatedUser = await apiService.updateProfile(formData);
      updateUser(updatedUser);
      setSuccess(MESSAGES.PROFILE_UPDATED);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">{UI_CONSTANTS.PAGE_TITLES.PROFILE}</h1>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {isLoading && <LoadingSpinner message="Updating profile..." />}

      {!isLoading && (
        <div className="row">
          <div className="col-lg-6">
            <div className="card p-4">
              {!isEditing ? (
                <>
                  <div className="mb-3">
                    <label className="form-label text-muted">Name</label>
                    <p className="h5">{user?.name}</p>
                  </div>
                  <div className="mb-4">
                    <label className="form-label text-muted">Email</label>
                    <p className="h5">{user?.email}</p>
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(user || { name: '', email: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;

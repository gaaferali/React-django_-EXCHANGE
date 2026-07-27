import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UI_CONSTANTS } from '../constants/config';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <a className="navbar-brand fw-bold" onClick={() => navigate('/')}>
          🛋️ {UI_CONSTANTS.NAVBAR_BRAND}
        </a>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a
                className="nav-link"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
              >
                {UI_CONSTANTS.BUTTONS.BROWSE}
              </a>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    onClick={() => navigate('/create-listing')}
                    style={{ cursor: 'pointer' }}
                  >
                    {UI_CONSTANTS.BUTTONS.CREATE_LISTING}
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    onClick={() => navigate('/my-listings')}
                    style={{ cursor: 'pointer' }}
                  >
                    {UI_CONSTANTS.BUTTONS.MY_LISTINGS}
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    onClick={() => navigate('/messages')}
                    style={{ cursor: 'pointer' }}
                  >
                    {UI_CONSTANTS.BUTTONS.MY_MESSAGES}
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    role="button"
                    data-bs-toggle="dropdown"
                    style={{ cursor: 'pointer' }}
                  >
                    {user?.name || 'Profile'}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a
                        className="dropdown-item"
                        onClick={() => navigate('/profile')}
                        style={{ cursor: 'pointer' }}
                      >
                        {UI_CONSTANTS.BUTTONS.MY_PROFILE}
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                        style={{ cursor: 'pointer' }}
                      >
                        {UI_CONSTANTS.BUTTONS.LOGOUT}
                      </a>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    onClick={() => navigate('/login')}
                    style={{ cursor: 'pointer' }}
                  >
                    {UI_CONSTANTS.BUTTONS.LOGIN}
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    onClick={() => navigate('/register')}
                    style={{ cursor: 'pointer' }}
                  >
                    {UI_CONSTANTS.BUTTONS.REGISTER}
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

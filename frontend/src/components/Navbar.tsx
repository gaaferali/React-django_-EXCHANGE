import { Heart, Menu, MessageCircle, Plus, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`;

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const handleLogout = async () => {
    await logout();
    close();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="site-header-inner container">
        <Link className="brand" to="/" onClick={close} aria-label="Furnish Exchange home">
          <span className="brand-mark">FE</span>
          <span>Furnish Exchange</span>
        </Link>
        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
        <nav className={`site-nav${open ? ' open' : ''}`} aria-label="Main navigation">
          <NavLink className={navClass} to="/marketplace" onClick={close}>Marketplace</NavLink>
          {isAuthenticated && (
            <>
              <NavLink className={navClass} to="/favorites" onClick={close}><Heart size={17} /> Saved</NavLink>
              <NavLink className={navClass} to="/requests" onClick={close}>Offers</NavLink>
              <NavLink className={navClass} to="/messages" onClick={close}><MessageCircle size={17} /> Messages</NavLink>
              <NavLink className={navClass} to="/dashboard" onClick={close}>My listings</NavLink>
              {user?.is_staff && <NavLink className={navClass} to="/admin" onClick={close}>Admin</NavLink>}
            </>
          )}
          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <NavLink className="icon-link" to="/profile" onClick={close} aria-label="Profile"><UserRound size={20} /><span>{user?.name}</span></NavLink>
                <button className="button button-ghost button-small" type="button" onClick={handleLogout}>Sign out</button>
                <Link className="button button-primary button-small" to="/listings/new" onClick={close}><Plus size={17} /> List an item</Link>
              </>
            ) : (
              <>
                <Link className="button button-ghost button-small" to="/login" onClick={close}>Sign in</Link>
                <Link className="button button-primary button-small" to="/register" onClick={close}>Create account</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

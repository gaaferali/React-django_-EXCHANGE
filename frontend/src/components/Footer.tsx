import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><div className="brand footer-brand"><span className="brand-mark">FE</span><span>Furnish Exchange</span></div><p>Give useful furniture a second home through local sales and exchanges.</p></div>
        <div><strong>Marketplace</strong><Link to="/marketplace">Browse listings</Link><Link to="/listings/new">List an item</Link></div>
        <div><strong>Account</strong><Link to="/dashboard">My listings</Link><Link to="/requests">Offers</Link><Link to="/messages">Messages</Link></div>
      </div>
      <div className="container footer-bottom">Built as a full-stack marketplace portfolio project.</div>
    </footer>
  );
}

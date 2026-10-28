import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanelPage from './pages/AdminPanelPage';
import BrowseListingsPage from './pages/BrowseListingsPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import ExchangeRequestsPage from './pages/ExchangeRequestsPage';
import FavoritesPage from './pages/FavoritesPage';
import ListingDetailPage from './pages/ListingDetailPage';
import LoginPage from './pages/LoginPage';
import MessagesPage from './pages/MessagesPage';
import MyListingsPage from './pages/MyListingsPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<BrowseListingsPage home />} />
            <Route path="/marketplace" element={<BrowseListingsPage />} />
            <Route path="/listings/:listingId" element={<ListingDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<MyListingsPage />} />
              <Route path="/my-listings" element={<Navigate to="/dashboard" replace />} />
              <Route path="/listings/new" element={<CreateListingPage />} />
              <Route path="/listings/:listingId/edit" element={<EditListingPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/requests" element={<ExchangeRequestsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:conversationId" element={<MessagesPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
            </Route>
            <Route element={<ProtectedRoute admin />}><Route path="/admin" element={<AdminPanelPage />} /></Route>
            <Route path="*" element={<div className="container not-found"><span>404</span><h1>Page not found</h1><a className="button button-primary" href="/">Return home</a></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

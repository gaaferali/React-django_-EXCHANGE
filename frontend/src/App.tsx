import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Pages - Main
import BrowseListingsPage from './pages/BrowseListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import MyListingsPage from './pages/MyListingsPage';
import MessagesPage from './pages/MessagesPage';
import UserProfilePage from './pages/UserProfilePage';

// Pages - Admin
import AdminPanelPage from './pages/AdminPanelPage';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Routes */}
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<BrowseListingsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/listing/:itemID" element={<ListingDetailPage />} />
            {/* delet later */}
            <Route path="/admin" element={<AdminPanelPage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/edit-listing/:itemID" element={<EditListingPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<UserProfilePage />} />

            {/* Protected Routes *
            <Route element={<ProtectedRoute />}>
              <Route path="/my-listings" element={<MyListingsPage />} />
              <Route path="/create-listing" element={<CreateListingPage />} />
              <Route path="/edit-listing/:itemID" element={<EditListingPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
            </Route>
            /}

            {/* Admin Routes 
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminPanelPage />} />
            </Route>*/}

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

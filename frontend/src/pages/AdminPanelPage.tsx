import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { AdminStats, User, FurnitureItem } from '../types';
import { UI_CONSTANTS, MESSAGES } from '../constants/config';

const AdminPanelPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<FurnitureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'listings'>('stats');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab, currentPage]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (activeTab === 'stats') {
        const statsData = await apiService.getAdminStats();
        setStats(statsData);
      } else if (activeTab === 'users') {
        const usersData = await apiService.getAllUsers(currentPage);
        setUsers(usersData.data || []);
      } else if (activeTab === 'listings') {
        const listingsData = await apiService.getAllListingsAdmin(currentPage);
        setListings(listingsData.data || []);
      }
    } catch (err: any) {
      setError(err.message || MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userID: number) => {
    const reason = prompt('Enter reason for banning:');
    if (reason) {
      try {
        await apiService.banUser(userID, reason);
        setUsers(users.filter((user) => user.userID !== userID));
        alert('User banned successfully');
      } catch (err: any) {
        setError(err.message || MESSAGES.SERVER_ERROR);
      }
    }
  };

  const handleRemoveListing = async (itemID: number) => {
    const reason = prompt('Enter reason for removal:');
    if (reason) {
      try {
        await apiService.removeListingAdmin(itemID, reason);
        setListings(listings.filter((item) => item.itemID !== itemID));
        alert('Listing removed successfully');
      } catch (err: any) {
        setError(err.message || MESSAGES.SERVER_ERROR);
      }
    }
  };

  if (isLoading && activeTab === 'stats') {
    return <LoadingSpinner fullScreen message="Loading admin panel..." />;
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">{UI_CONSTANTS.PAGE_TITLES.ADMIN_PANEL}</h1>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('stats');
              setCurrentPage(1);
            }}
            style={{ cursor: 'pointer' }}
          >
            Dashboard Statistics
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('users');
              setCurrentPage(1);
            }}
            style={{ cursor: 'pointer' }}
          >
            Manage Users
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('listings');
              setCurrentPage(1);
            }}
            style={{ cursor: 'pointer' }}
          >
            Manage Listings
          </a>
        </li>
      </ul>

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-primary">{stats.totalUsers}</h3>
                <p className="card-text">Total Users</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-success">{stats.totalListings}</h3>
                <p className="card-text">Total Listings</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-info">{stats.totalMessages}</h3>
                <p className="card-text">Total Messages</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h3 className="text-warning">{stats.reportedContent}</h3>
                <p className="card-text">Reported Content</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {isLoading ? (
            <LoadingSpinner message="Loading users..." />
          ) : users.length === 0 ? (
            <div className="alert alert-info">No users found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userID}>
                      <td>{user.userID}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleBanUser(user.userID)}
                        >
                          Ban
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <>
          {isLoading ? (
            <LoadingSpinner message="Loading listings..." />
          ) : listings.length === 0 ? (
            <div className="alert alert-info">No listings found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.itemID}>
                      <td>{listing.itemID}</td>
                      <td>{listing.title}</td>
                      <td>{listing.category}</td>
                      <td>${listing.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${listing.status === 'available' ? 'success' : 'secondary'}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveListing(listing.itemID)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanelPage;

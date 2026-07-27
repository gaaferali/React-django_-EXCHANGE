import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import FurnitureCard from '../components/FurnitureCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { FurnitureItem } from '../types';
import { UI_CONSTANTS, MESSAGES } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const MyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<FurnitureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user) {
      fetchUserListings();
    }
  }, [user, currentPage]);

  const fetchUserListings = async () => {
    try {
      setIsLoading(true);
      setError('');
      const result = await apiService.getUserListings(user!.userID, currentPage);
      setListings(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (err: any) {
      setError(err.message || MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemID: number) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await apiService.deleteListing(itemID);
        setListings(listings.filter((item) => item.itemID !== itemID));
        alert(MESSAGES.LISTING_DELETED);
      } catch (err: any) {
        setError(err.message || MESSAGES.SERVER_ERROR);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading your listings..." />;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{UI_CONSTANTS.PAGE_TITLES.HOME}</h1>
        <button
          className="btn btn-success"
          onClick={() => navigate('/create-listing')}
        >
          + Create New Listing
        </button>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {listings.length === 0 ? (
        <div className="alert alert-info text-center py-5">
          <p>You don't have any listings yet.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/create-listing')}
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {listings.map((item) => (
              <div key={item.itemID} className="col-md-6 col-lg-4">
                <FurnitureCard
                  item={item}
                  onDelete={handleDelete}
                  showActions={true}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default MyListingsPage;

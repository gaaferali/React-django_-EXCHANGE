import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import FurnitureCard from '../components/FurnitureCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { FurnitureItem, SearchFilter } from '../types';
import { PLACEHOLDERS } from '../constants/uiOptions';
import { UI_CONSTANTS, MESSAGES } from '../constants/config';
import { useAuth } from '../context/AuthContext';
import './BrowseListings.css';

const BrowseListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState<FurnitureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchListings();
  }, [currentPage, category]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Create filter object
      const filters: SearchFilter = {};
      if (category) filters.category = category;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      if (searchTerm) filters.searchTerm = searchTerm;

      // If filters exist, use search endpoint, otherwise get all listings
      let result;
      if (Object.keys(filters).length > 0) {
        result = await apiService.searchFurniture(filters, currentPage);
      } else {
        result = await apiService.getAllListings(currentPage);
      }

      setListings(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (err: any) {
      setError(err.message || MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
    fetchListings();
  };

  return (
    <div className="browse-listings-page">
      <div className="container-fluid py-4">
        <h1 className="mb-4">{UI_CONSTANTS.PAGE_TITLES.HOME}</h1>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        {/* Filter Section */}
        <div className="card mb-4 filter-card">
          <div className="card-body">
            <h5 className="card-title">Search & Filter</h5>
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {PLACEHOLDERS.CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>

                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary w-100">
                    Search
                  </button>
                </div>

                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-secondary w-100"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Create Listing Button */}
        {isAuthenticated && (
          <div className="mb-3">
            <button
              className="btn btn-success"
              onClick={() => navigate('/create-listing')}
            >
              + Create New Listing
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <LoadingSpinner message="Loading listings..." />
        ) : listings.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <p>No listings found. Try adjusting your filters or check back later!</p>
          </div>
        ) : (
          <>
            <div className="row g-4 mb-4">
              {listings.map((item) => (
                <div key={item.itemID} className="col-md-6 col-lg-4">
                  <FurnitureCard item={item} />
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
    </div>
  );
};

export default BrowseListingsPage;

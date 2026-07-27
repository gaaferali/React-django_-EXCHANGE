import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { FurnitureItem } from '../types';
import { PLACEHOLDERS } from '../constants/uiOptions';
import { UI_CONSTANTS, MESSAGES } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const ListingDetailPage: React.FC = () => {
  const { itemID } = useParams<{ itemID: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState<FurnitureItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [itemID]);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await apiService.getListingById(parseInt(itemID!));
      setListing(data);
    } catch (err: any) {
      setError(err.message || MESSAGES.NOT_FOUND);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!messageContent.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setIsSendingMessage(true);
      await apiService.sendMessage(listing!.userID, messageContent);
      setMessageContent('');
      alert(MESSAGES.MESSAGE_SENT);
    } catch (err: any) {
      setError(err.message || MESSAGES.SERVER_ERROR);
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading listing..." />;
  }

  if (!listing) {
    return (
      <div className="container py-4">
        <Alert type="danger" message={error || MESSAGES.NOT_FOUND} />
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button className="btn btn-secondary mb-4" onClick={() => navigate('/')}>
        ← Back
      </button>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <img
            src={listing.imagePath || PLACEHOLDERS.DEFAULT_FURNITURE_IMAGE}
            alt={listing.title}
            className="img-fluid rounded"
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
        </div>

        <div className="col-lg-6">
          <h1 className="mb-2">{listing.title}</h1>
          <div className="mb-3">
            <span className={`badge bg-primary me-2`}>{listing.category}</span>
            <span className="badge bg-secondary me-2">{listing.condition}</span>
            <span className={`badge status-${listing.status}`}>{listing.status}</span>
          </div>

          <h3 className="text-success mb-4">${listing.price.toFixed(2)}</h3>

          <p className="mb-4">{listing.description}</p>

          {isAuthenticated && user?.userID !== listing.userID && (
            <div className="card mb-4 p-4">
              <h5 className="card-title mb-3">Contact Seller</h5>
              <textarea
                className="form-control mb-3"
                rows={3}
                placeholder="Write your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                disabled={isSendingMessage}
              ></textarea>
              <button
                className="btn btn-primary w-100"
                onClick={handleSendMessage}
                disabled={isSendingMessage}
              >
                {isSendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          )}

          {user?.userID === listing.userID && (
            <div className="alert alert-info">
              <p className="mb-0">This is your listing!</p>
              <button
                className="btn btn-sm btn-warning mt-2 me-2"
                onClick={() => navigate(`/edit-listing/${listing.itemID}`)}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { apiError } from '../api/apiService';
import Alert from '../components/Alert';
import ListingForm from '../components/ListingForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { FurnitureItem } from '../types';

export default function EditListingPage() {
  const { listingId } = useParams(); const { user } = useAuth(); const navigate = useNavigate(); const [listing, setListing] = useState<FurnitureItem>(); const [error, setError] = useState('');
  useEffect(() => { api.listing(Number(listingId)).then((item) => { if (item.owner.id !== user?.id && !user?.is_staff) { navigate('/dashboard', { replace: true }); return; } setListing(item); }).catch((reason) => setError(apiError(reason))); }, [listingId, navigate, user]);
  if (error) return <div className="container page-section"><Alert message={error} /></div>;
  if (!listing) return <LoadingSpinner fullScreen message="Loading listing" />;
  return <div className="container narrow-page page-section"><header className="page-header"><div><span className="eyebrow">Edit listing</span><h1>{listing.title}</h1><p>Keep the details current so offers stay relevant.</p></div></header><ListingForm listing={listing} submitLabel="Save changes" onSubmit={async (input) => { const updated = await api.updateListing(listing.id, input); navigate(`/listings/${updated.id}`); }} /></div>;
}

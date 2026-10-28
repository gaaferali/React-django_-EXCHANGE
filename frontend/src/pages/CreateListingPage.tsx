import { useNavigate } from 'react-router-dom';
import api from '../api/apiService';
import ListingForm from '../components/ListingForm';

export default function CreateListingPage() {
  const navigate = useNavigate();
  return <div className="container narrow-page page-section"><header className="page-header"><div><span className="eyebrow">New listing</span><h1>List a piece of furniture</h1><p>Accurate details and clear photos make better matches.</p></div></header><ListingForm submitLabel="Publish listing" onSubmit={async (input) => { const listing = await api.createListing(input); navigate(`/listings/${listing.id}`); }} /></div>;
}

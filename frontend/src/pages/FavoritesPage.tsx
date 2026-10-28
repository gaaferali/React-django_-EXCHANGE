import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { apiError } from '../api/apiService';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import FurnitureCard from '../components/FurnitureCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { FurnitureItem } from '../types';

export default function FavoritesPage() {
  const [items, setItems] = useState<FurnitureItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { api.favorites({ page_size: 48 }).then((response) => setItems(response.results)).catch((reason) => setError(apiError(reason))).finally(() => setLoading(false)); }, []);
  const remove = async (item: FurnitureItem) => { try { await api.setFavorite(item.id, false); setItems((current) => current.filter((value) => value.id !== item.id)); } catch (reason) { setError(apiError(reason)); } };
  return <div className="container page-section"><header className="page-header"><div><span className="eyebrow">Saved furniture</span><h1>Your favorites</h1><p>Keep a short list while you compare options.</p></div></header>{error && <Alert message={error} />}{loading ? <LoadingSpinner message="Loading saved listings" /> : items.length ? <div className="listing-grid">{items.map((item) => <FurnitureCard key={item.id} item={{ ...item, is_favorited: true }} onFavorite={remove} />)}</div> : <EmptyState title="Nothing saved yet" description="Save listings from the marketplace so you can return to them here." action={<Link className="button button-primary" to="/marketplace">Browse furniture</Link>} />}</div>;
}

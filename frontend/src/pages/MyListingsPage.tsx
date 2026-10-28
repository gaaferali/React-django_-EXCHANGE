import { Edit3, Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { apiError } from '../api/apiService';
import placeholder from '../assets/furniture-placeholder.svg';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import type { FurnitureItem } from '../types';

export default function MyListingsPage() {
  const [items, setItems] = useState<FurnitureItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = () => { setLoading(true); api.myListings({ page_size: 48 }).then((response) => setItems(response.results)).catch((reason) => setError(apiError(reason))).finally(() => setLoading(false)); };
  useEffect(load, []);
  const remove = async (item: FurnitureItem) => { if (!window.confirm(`Remove “${item.title}” from the marketplace?`)) return; try { await api.deleteListing(item.id); setItems((current) => current.map((value) => value.id === item.id ? { ...value, status: 'inactive' } : value)); } catch (reason) { setError(apiError(reason)); } };
  const active = items.filter((item) => item.status === 'available').length;
  return <div className="container page-section"><header className="page-header"><div><span className="eyebrow">Seller dashboard</span><h1>My listings</h1><p>{active} active · {items.length} total</p></div><Link className="button button-primary" to="/listings/new"><Plus size={18} /> List an item</Link></header>{error && <Alert message={error} onClose={() => setError('')} />}{loading ? <LoadingSpinner message="Loading your listings" /> : items.length ? <div className="manage-list">{items.map((item) => <article key={item.id} className="manage-row"><img src={item.cover_image_url || placeholder} alt="" /><div className="manage-main"><div className="detail-labels"><span>{item.category_display}</span><span className={`status status-${item.status}`}>{item.status}</span></div><h2>{item.title}</h2><p>{item.listing_type_display} · {item.condition_display}</p></div><div className="manage-price">{item.listing_type === 'exchange' ? 'Exchange' : `$${Number(item.price).toLocaleString()}`}</div><div className="manage-actions"><Link to={`/listings/${item.id}`} aria-label={`View ${item.title}`}><Eye size={18} /></Link>{item.status === 'available' && <Link to={`/listings/${item.id}/edit`} aria-label={`Edit ${item.title}`}><Edit3 size={18} /></Link>}{item.status !== 'inactive' && <button type="button" onClick={() => remove(item)} aria-label={`Remove ${item.title}`}><Trash2 size={18} /></button>}</div></article>)}</div> : <EmptyState title="No listings yet" description="Create your first listing to start receiving purchase or exchange offers." action={<Link className="button button-primary" to="/listings/new">Create a listing</Link>} />}</div>;
}

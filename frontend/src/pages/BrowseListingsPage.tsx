import { ArrowRight, Search, ShieldCheck, Sofa, Sparkles, Truck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { apiError } from '../api/apiService';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import FurnitureCard from '../components/FurnitureCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { FurnitureItem, ListingMetadata } from '../types';

const DEFAULT_METADATA: ListingMetadata = { categories: [], conditions: [], listing_types: [] };

export default function BrowseListingsPage({ home = false }: { home?: boolean }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [metadata, setMetadata] = useState(DEFAULT_METADATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [listingType, setListingType] = useState('');
  const [ordering, setOrdering] = useState('-created_at');

  useEffect(() => { api.metadata().then(setMetadata).catch(() => undefined); }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    api.listings({ page, page_size: home ? 8 : 12, search: search || undefined, category: category || undefined, condition: condition || undefined, listing_type: listingType || undefined, ordering })
      .then((response) => { if (active) { setItems(response.results); setCount(response.count); setError(''); } })
      .catch((reason) => active && setError(apiError(reason)))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, category, condition, listingType, ordering, home]);

  const submitSearch = (event: FormEvent) => { event.preventDefault(); setPage(1); setCategory((value) => value); setLoading(true); api.listings({ page: 1, page_size: home ? 8 : 12, search: search || undefined, category: category || undefined, condition: condition || undefined, listing_type: listingType || undefined, ordering }).then((response) => { setItems(response.results); setCount(response.count); setError(''); }).catch((reason) => setError(apiError(reason))).finally(() => setLoading(false)); };
  const chooseCategory = (value: string) => { setCategory(value); setPage(1); if (home) navigate(`/marketplace?category=${value}`); };
  const toggleFavorite = async (item: FurnitureItem) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await api.setFavorite(item.id, !item.is_favorited);
      setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, is_favorited: !candidate.is_favorited } : candidate));
    } catch (reason) { setError(apiError(reason)); }
  };
  const totalPages = Math.ceil(count / (home ? 8 : 12));

  return (
    <>
      {home && (
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy"><span className="eyebrow">Local furniture marketplace</span><h1>Quality furniture deserves a second home.</h1><p>Buy useful pieces nearby or propose a direct furniture exchange. Clear listings, secure account controls, and one place to manage every offer.</p>
              <form className="hero-search" onSubmit={submitSearch}><Search size={20} /><label className="sr-only" htmlFor="hero-search">Search furniture</label><input id="hero-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tables, chairs, storage..." /><button className="button button-primary" type="submit">Search</button></form>
              <div className="trust-row"><span><ShieldCheck size={17} /> Owner-controlled offers</span><span><Sparkles size={17} /> Reuse quality furniture</span><span><Truck size={17} /> Arrange collection directly</span></div>
            </div>
            <div className="hero-visual" aria-hidden="true"><div className="room-shape"><Sofa size={104} strokeWidth={1.25} /><span>Sell it. Swap it. Keep it in use.</span></div></div>
          </div>
        </section>
      )}
      <div className="container page-section">
        {home && <section className="category-section"><div className="section-heading"><div><span className="eyebrow">Browse by room</span><h2>Find what your space needs</h2></div><Link to="/marketplace" className="text-link">View everything <ArrowRight size={17} /></Link></div><div className="category-strip">{metadata.categories.slice(0, 8).map((choice) => <button key={choice.value} type="button" onClick={() => chooseCategory(choice.value)}><span>{choice.label.charAt(0)}</span>{choice.label}</button>)}</div></section>}
        {!home && (
          <header className="page-header"><div><span className="eyebrow">Marketplace</span><h1>Furniture near you</h1><p>{count} available {count === 1 ? 'listing' : 'listings'}</p></div><Link className="button button-primary" to="/listings/new">List an item</Link></header>
        )}
        {!home && <form className="filter-bar" onSubmit={submitSearch}><div className="search-field"><Search size={18} /><input aria-label="Search listings" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search listings" /></div><select aria-label="Category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="">All categories</option>{metadata.categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label="Condition" value={condition} onChange={(event) => { setCondition(event.target.value); setPage(1); }}><option value="">Any condition</option>{metadata.conditions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label="Listing type" value={listingType} onChange={(event) => { setListingType(event.target.value); setPage(1); }}><option value="">Sale or exchange</option>{metadata.listing_types.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label="Sort listings" value={ordering} onChange={(event) => setOrdering(event.target.value)}><option value="-created_at">Newest</option><option value="price">Price: low to high</option><option value="-price">Price: high to low</option></select><button className="button button-secondary" type="submit">Apply</button></form>}
        {error && <Alert message={error} onClose={() => setError('')} />}
        <section className={home ? 'featured-section' : ''}><div className="section-heading"><div><span className="eyebrow">{home ? 'Recently listed' : 'Results'}</span><h2>{home ? 'Fresh finds for your home' : 'Available furniture'}</h2></div>{home && <Link to="/marketplace" className="text-link">Browse marketplace <ArrowRight size={17} /></Link>}</div>
          {loading ? <LoadingSpinner message="Loading furniture" /> : items.length ? <div className="listing-grid">{items.map((item) => <FurnitureCard key={item.id} item={item} onFavorite={toggleFavorite} />)}</div> : <EmptyState title="No furniture found" description="Try a different search or remove one of the filters." />}
        </section>
        {!home && totalPages > 1 && <nav className="pagination" aria-label="Listing pages"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></nav>}
      </div>
      {home && <section className="sell-cta"><div className="container"><div><span className="eyebrow">Ready to make space?</span><h2>List a piece in a few clear steps.</h2><p>Add honest details and photos, choose sale, exchange, or both, then manage offers from your dashboard.</p></div><Link className="button button-light" to="/listings/new">List your furniture <ArrowRight size={18} /></Link></div></section>}
    </>
  );
}

import { Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import placeholder from '../assets/furniture-placeholder.svg';
import type { FurnitureItem } from '../types';

export function formatPrice(value: string, listingType: FurnitureItem['listing_type']) {
  if (listingType === 'exchange') return 'Exchange only';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value));
}

interface Props {
  item: FurnitureItem;
  onFavorite?: (item: FurnitureItem) => void;
}

export default function FurnitureCard({ item, onFavorite }: Props) {
  return (
    <article className="listing-card">
      <Link className="listing-image-link" to={`/listings/${item.id}`} aria-label={`View ${item.title}`}>
        <img className="listing-card-image" src={item.cover_image_url || placeholder} alt={item.cover_image_url ? item.title : ''} loading="lazy" />
      </Link>
      {onFavorite && (
        <button className={`favorite-button${item.is_favorited ? ' selected' : ''}`} type="button" onClick={() => onFavorite(item)} aria-label={item.is_favorited ? 'Remove from saved listings' : 'Save listing'}>
          <Heart size={19} fill={item.is_favorited ? 'currentColor' : 'none'} />
        </button>
      )}
      <div className="listing-card-body">
        <div className="listing-card-meta"><span>{item.condition_display}</span><span>{item.listing_type_display}</span></div>
        <Link to={`/listings/${item.id}`} className="listing-title">{item.title}</Link>
        <strong className="listing-price">{formatPrice(item.price, item.listing_type)}</strong>
        <div className="listing-location"><MapPin size={15} /><span>{item.location || item.owner.location || 'Location not provided'}</span></div>
      </div>
    </article>
  );
}

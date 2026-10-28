import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import FurnitureCard, { formatPrice } from './FurnitureCard';
import type { FurnitureItem } from '../types';

const listing: FurnitureItem = {
  id: 42,
  owner: { id: 1, name: 'Amina', profile_image_url: null, location: 'Khartoum' },
  title: 'Oak dining table',
  description: 'Solid table',
  price: '240.00',
  cover_image_url: null,
  images: [],
  status: 'available',
  condition: 'good',
  condition_display: 'Good',
  category: 'table',
  category_display: 'Tables',
  listing_type: 'both',
  listing_type_display: 'Sale or exchange',
  location: 'Khartoum',
  is_featured: false,
  is_favorited: false,
  created_at: '2026-10-28T10:00:00Z',
  updated_at: '2026-10-28T10:00:00Z',
};

describe('FurnitureCard', () => {
  it('shows marketplace information and links to the listing', () => {
    render(<MemoryRouter><FurnitureCard item={listing} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Oak dining table' })).toHaveAttribute('href', '/listings/42');
    expect(screen.getByText('$240')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('labels exchange-only listings without a fake price', () => {
    expect(formatPrice('0.00', 'exchange')).toBe('Exchange only');
  });
});

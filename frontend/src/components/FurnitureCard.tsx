import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FurnitureItem } from '../types';
import { PLACEHOLDERS } from '../constants/uiOptions';
import './FurnitureCard.css';

interface FurnitureCardProps {
  item: FurnitureItem;
  onDelete?: (itemID: number) => void;
  showActions?: boolean;
}

const FurnitureCard: React.FC<FurnitureCardProps> = ({
  item,
  onDelete,
  showActions = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="card furniture-card h-100">
      <div className="furniture-image-container">
        <img
          src={item.imagePath || PLACEHOLDERS.DEFAULT_FURNITURE_IMAGE}
          className="card-img-top"
          alt={item.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <span className={`badge position-absolute top-0 end-0 m-2 status-${item.status}`}>
          {item.status}
        </span>
      </div>
      <div className="card-body">
        <h5 className="card-title">{item.title}</h5>
        <p className="card-text text-truncate text-muted">{item.description}</p>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-info">{item.category}</span>
          <span className="badge bg-secondary">{item.condition}</span>
        </div>
        <h6 className="text-success fw-bold mb-3">${item.price.toFixed(2)}</h6>
        <div className="d-grid gap-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/listing/${item.itemID}`)}
          >
            View Details
          </button>
          {showActions && (
            <>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => navigate(`/edit-listing/${item.itemID}`)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete?.(item.itemID)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FurnitureCard;

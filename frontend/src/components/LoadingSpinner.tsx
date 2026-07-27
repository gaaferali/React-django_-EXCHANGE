import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message = 'Loading...',
}) => {
  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        <div className="spinner-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-inline text-center my-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

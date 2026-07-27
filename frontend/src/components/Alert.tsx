import React, { useEffect } from 'react';

interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  dismissible = true,
  autoClose = true,
  autoCloseTime = 5000,
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, onClose]);

  return (
    <div
      className={`alert alert-${type} ${dismissible ? 'alert-dismissible fade show' : ''}`}
      role="alert"
    >
      {message}
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="alert"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

export default Alert;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../api/apiService';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { CreateListingRequest } from '../types';
import { PLACEHOLDERS } from '../constants/uiOptions';
import { UI_CONSTANTS, MESSAGES, VALIDATION_RULES } from '../constants/config';
import './ListingForm.css';

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    imageFile: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(MESSAGES.IMAGE_SIZE_LIMIT);
        return;
      }

      setFormData((prev) => ({ ...prev, imageFile: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError(MESSAGES.TITLE_REQUIRED);
      return false;
    }
    if (!formData.description.trim()) {
      setError(MESSAGES.DESCRIPTION_REQUIRED);
      return false;
    }
    if (formData.description.length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
      setError(`Description must be at least ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} characters.`);
      return false;
    }
    if (!formData.category) {
      setError(MESSAGES.CATEGORY_REQUIRED);
      return false;
    }
    if (!formData.condition) {
      setError(MESSAGES.CONDITION_REQUIRED);
      return false;
    }
    if (!formData.price) {
      setError(MESSAGES.PRICE_REQUIRED);
      return false;
    }
    if (parseFloat(formData.price) <= 0 || parseFloat(formData.price) > VALIDATION_RULES.PRICE_MAX_VALUE) {
      setError(MESSAGES.PRICE_INVALID);
      return false;
    }
    if (!formData.imageFile) {
      setError(MESSAGES.IMAGE_REQUIRED);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const data: CreateListingRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        price: parseFloat(formData.price),
        imageFile: formData.imageFile!,
      };

      await apiService.createListing(data);
      setSuccess(MESSAGES.LISTING_CREATED);
      setTimeout(() => navigate('/my-listings'), 1500);
    } catch (err: any) {
      setError(err.message || MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Creating listing..." />;
  }

  return (
    <div className="listing-form-page">
      <div className="container py-4">
        <h1 className="mb-4">{UI_CONSTANTS.PAGE_TITLES.CREATE_LISTING}</h1>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="row">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit} className="card p-4">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter furniture item title"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description *
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your furniture item (min 10 characters)"
                  rows={5}
                  disabled={isLoading}
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="category" className="form-label">
                    Category *
                  </label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Select category</option>
                    {PLACEHOLDERS.CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="condition" className="form-label">
                    Condition *
                  </label>
                  <select
                    className="form-select"
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Select condition</option>
                    {PLACEHOLDERS.CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="price" className="form-label">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="imageFile" className="form-label">
                  Upload Image *
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="imageFile"
                  name="imageFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
                <small className="form-text text-muted">
                  Max size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                </small>
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                  {isLoading ? 'Creating...' : UI_CONSTANTS.BUTTONS.SUBMIT}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/my-listings')}
                  disabled={isLoading}
                >
                  {UI_CONSTANTS.BUTTONS.CANCEL}
                </button>
              </div>
            </form>
          </div>

          {/* Image Preview */}
          {preview && (
            <div className="col-lg-4">
              <div className="card">
                <h5 className="card-header">Image Preview</h5>
                <div className="card-body text-center">
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;

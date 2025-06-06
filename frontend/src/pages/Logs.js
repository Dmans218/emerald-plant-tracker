import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Camera, Droplets, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { plantsApi, logsApi } from '../utils/api';

const LOG_TYPES = [
  { value: 'watering', label: '💧 Watering', icon: '💧' },
  { value: 'feeding', label: '🌿 Feeding', icon: '🌿' },
  { value: 'pruning', label: '✂️ Pruning', icon: '✂️' },
  { value: 'training', label: '🎯 Training', icon: '🎯' },
  { value: 'observation', label: '👁️ Observation', icon: '👁️' },
  { value: 'photo', label: '📸 Photo', icon: '📸' },
  { value: 'harvest', label: '🌾 Harvest', icon: '🌾' },
  { value: 'environment', label: '🌡️ Environment', icon: '🌡️' }
];

const Logs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plantId = searchParams.get('plant_id');
  
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      plant_id: plantId || '',
      type: 'observation',
      logged_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      growth_stage: ''
    }
  });

  const watchedPlantId = watch('plant_id');
  const watchedType = watch('type');

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    // When plant selection changes, update the growth stage
    if (watchedPlantId) {
      const plant = plants.find(p => p.id === parseInt(watchedPlantId));
      if (plant) {
        setSelectedPlant(plant);
        setValue('growth_stage', plant.stage);
        toast.info(`Growth stage set to ${plant.stage} based on ${plant.name}'s current stage`);
      }
    } else {
      setSelectedPlant(null);
      setValue('growth_stage', '');
    }
  }, [watchedPlantId, plants, setValue]);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const data = await plantsApi.getAll({ archived: false });
      setPlants(data);
    } catch (error) {
      toast.error('Failed to load plants');
      console.error('Plants fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (watchedType === 'photo' && selectedFile) {
        // Handle photo upload
        const formData = new FormData();
        formData.append('photo', selectedFile);
        formData.append('plant_id', data.plant_id);
        formData.append('description', data.description || '');
        
        setUploadingPhoto(true);
        await logsApi.uploadPhoto(formData);
        toast.success('Photo uploaded successfully');
      } else {
        // Handle regular log
        await logsApi.create({
          ...data,
          value: data.value ? parseFloat(data.value) : null
        });
        toast.success('Log entry added successfully');
      }
      
      // Navigate to plant detail page
      navigate(`/plants/${data.plant_id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to create log entry');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const removeSelectedPhoto = () => {
    setSelectedFile(null);
    setPhotoPreview(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">📝 Add Activity Log</h1>
            <p className="dashboard-subtitle">Record plant activities and observations</p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Log Form */}
      <div className="dashboard-section">
        <div className="section-content">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Plant Selection */}
            <div className="form-group">
              <label className="label">Select Plant *</label>
              <select
                className="select"
                {...register('plant_id', { required: 'Please select a plant' })}
              >
                <option value="">Choose a plant...</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name} {plant.strain && `(${plant.strain})`}
                    {plant.grow_tent && ` - ${plant.grow_tent}`}
                  </option>
                ))}
              </select>
              {errors.plant_id && <p className="text-error text-sm mt-1">{errors.plant_id.message}</p>}
            </div>

            {/* Log Type */}
            <div className="form-group">
              <label className="label">Activity Type *</label>
              <div className="grid grid-3 gap-3">
                {LOG_TYPES.map(type => (
                  <label
                    key={type.value}
                    className={`log-type-option ${watchedType === type.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      value={type.value}
                      {...register('type', { required: 'Please select an activity type' })}
                      className="sr-only"
                    />
                    <span className="log-type-icon">{type.icon}</span>
                    <span className="log-type-label">{type.label.split(' ')[1]}</span>
                  </label>
                ))}
              </div>
              {errors.type && <p className="text-error text-sm mt-1">{errors.type.message}</p>}
            </div>

            {/* Growth Stage */}
            <div className="form-group">
              <label className="label">Growth Stage at Time of Activity</label>
              <select
                className="select"
                {...register('growth_stage')}
              >
                <option value="">Select stage...</option>
                <option value="seedling">🌱 Seedling</option>
                <option value="vegetative">🌿 Vegetative</option>
                <option value="flowering">🌸 Flowering</option>
                <option value="harvest">🌾 Harvest</option>
                <option value="cured">📦 Cured</option>
              </select>
              {selectedPlant && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-selected based on {selectedPlant.name}'s current stage
                </p>
              )}
            </div>

            {/* Photo Upload for Photo Type */}
            {watchedType === 'photo' && (
              <div className="form-group">
                <label className="label">Upload Photo *</label>
                {!photoPreview ? (
                  <div className="photo-upload-zone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-input"
                    />
                    <label htmlFor="photo-input" className="photo-upload-label">
                      <Camera className="w-8 h-8 mb-2" />
                      <span>Click to select photo</span>
                      <span className="text-xs text-gray-500">or drag and drop</span>
                    </label>
                  </div>
                ) : (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Preview" className="photo-preview-img" />
                    <button
                      type="button"
                      onClick={removeSelectedPhoto}
                      className="photo-remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Value and Unit for specific types */}
            {['watering', 'feeding'].includes(watchedType) && (
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="label">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    {...register('value')}
                    placeholder="e.g., 1.5"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Unit</label>
                  <select className="select" {...register('unit')}>
                    <option value="">Select unit...</option>
                    <option value="L">Liters (L)</option>
                    <option value="gal">Gallons (gal)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="g">Grams (g)</option>
                    <option value="tsp">Teaspoons (tsp)</option>
                    <option value="tbsp">Tablespoons (tbsp)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="form-group">
              <label className="label">
                {watchedType === 'photo' ? 'Photo Caption' : 'Notes / Description'}
              </label>
              <textarea
                className="input textarea"
                {...register('description')}
                placeholder={
                  watchedType === 'photo' 
                    ? 'Add a caption for this photo...' 
                    : 'Describe the activity, observations, or any important details...'
                }
                rows={4}
              />
            </div>

            {/* Date & Time */}
            <div className="form-group">
              <label className="label">Date & Time</label>
              <input
                type="datetime-local"
                className="input"
                {...register('logged_at')}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || uploadingPhoto}
                className="btn btn-primary"
              >
                {(isSubmitting || uploadingPhoto) && <div className="loading"></div>}
                {watchedType === 'photo' ? 'Upload Photo' : 'Add Log Entry'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Logs; 
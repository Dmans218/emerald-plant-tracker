import React, { useEffect, useState } from 'react';
import { logsApi } from '../utils/api';

const LogModal = ({ isOpen, onClose, onSuccess, plantId, logToEdit = null }) => {
  const [formData, setFormData] = useState({
    logged_at: '',
    type: 'observation',
    description: '',
    notes: '',
    ph_level: '',
    ec_tds: '',
    water_amount: '',
    height_cm: '',
    nutrient_info: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logTypes = [
    { value: 'watering', label: 'Watering' },
    { value: 'feeding', label: 'Feeding/Nutrients' },
    { value: 'environmental', label: 'Environment' },
    { value: 'observation', label: 'Observation' },
    { value: 'training', label: 'Training' },
    { value: 'transplant', label: 'Transplant' },
    { value: 'pest_disease', label: 'Pest/Disease' },
    { value: 'measurement', label: 'Measurement' }
  ];

  useEffect(() => {
    if (isOpen) {
      if (logToEdit) {
        setFormData({
          logged_at: logToEdit.logged_at ? new Date(logToEdit.logged_at).toISOString().split('T')[0] : '',
          type: logToEdit.type || 'observation',
          description: logToEdit.description || '',
          notes: logToEdit.notes || '',
          ph_level: logToEdit.ph_level || '',
          ec_tds: logToEdit.ec_tds || '',
          water_amount: logToEdit.water_amount || '',
          height_cm: logToEdit.height_cm || '',
          nutrient_info: logToEdit.nutrient_info || ''
        });
      } else {
        setFormData({
          logged_at: new Date().toISOString().split('T')[0],
          type: 'observation',
          description: '',
          notes: '',
          ph_level: '',
          ec_tds: '',
          water_amount: '',
          height_cm: '',
          nutrient_info: ''
        });
      }
    }
  }, [isOpen, logToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        plant_id: plantId,
        // Convert empty strings to null for numeric fields
        ph_level: formData.ph_level ? parseFloat(formData.ph_level) : null,
        ec_tds: formData.ec_tds ? parseFloat(formData.ec_tds) : null,
        water_amount: formData.water_amount ? parseFloat(formData.water_amount) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null
      };

      if (logToEdit) {
        await logsApi.update(logToEdit.id, submitData);
      } else {
        await logsApi.create(submitData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to save log: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{logToEdit ? 'Edit Log Entry' : 'Add Log Entry'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="logged_at">Date *</label>
            <input
              type="date"
              id="logged_at"
              name="logged_at"
              value={formData.logged_at}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              {logTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the activity"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes and observations..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height_cm">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                id="height_cm"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
                placeholder="Plant height in cm"
                inputMode="decimal"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label htmlFor="water_amount">Water Amount (L)</label>
              <input
                type="number"
                step="0.1"
                id="water_amount"
                name="water_amount"
                value={formData.water_amount}
                onChange={handleChange}
                placeholder="Water volume in liters"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ph_level">pH Level</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                id="ph_level"
                name="ph_level"
                value={formData.ph_level}
                onChange={handleChange}
                placeholder="pH (0-14)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ec_tds">EC/TDS (ppm)</label>
              <input
                type="number"
                step="1"
                id="ec_tds"
                name="ec_tds"
                value={formData.ec_tds}
                onChange={handleChange}
                placeholder="EC/TDS in ppm"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nutrient_info">Nutrient Information</label>
            <input
              type="text"
              id="nutrient_info"
              name="nutrient_info"
              value={formData.nutrient_info}
              onChange={handleChange}
              placeholder="Nutrient brand, type, mixing ratio, etc."
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (logToEdit ? 'Update Log' : 'Add Log')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogModal;

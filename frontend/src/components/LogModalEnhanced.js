import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useVoiceInput from '../hooks/useVoiceInput';
import { logsApi } from '../utils/api';
import MobileFormField from './forms/MobileFormField';
import MobileSelect from './forms/MobileSelect';

const LogModalEnhanced = ({ isOpen, onClose, onSuccess, plantId, logToEdit = null }) => {
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
  const [voiceField, setVoiceField] = useState(null); // Track which field is using voice

  // Voice input for notes field
  const handleVoiceResult = (text, metadata) => {
    if (voiceField && metadata.isFinal) {
      setFormData(prev => ({
        ...prev,
        [voiceField]: text
      }));
      setVoiceField(null); // Stop voice input after getting result
    }
  };

  const voiceInput = useVoiceInput(handleVoiceResult, {
    cannabisMode: true,
    timeout: 15000 // 15 seconds for longer descriptions
  });

  const logTypes = [
    { value: 'watering', label: '💧 Watering' },
    { value: 'feeding', label: '🧪 Feeding/Nutrients' },
    { value: 'environmental', label: '🌡️ Environment' },
    { value: 'observation', label: '👁️ Observation' },
    { value: 'training', label: '✂️ Training' },
    { value: 'transplant', label: '🪴 Transplant' },
    { value: 'pest_disease', label: '🐛 Pest/Disease' },
    { value: 'measurement', label: '📏 Measurement' }
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

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVoiceStart = (field) => {
    setVoiceField(field);
    voiceInput.startListening();
  };

  const handleVoiceStop = () => {
    setVoiceField(null);
    voiceInput.stopListening();
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
        toast.success('Log updated successfully!');
      } else {
        await logsApi.create(submitData);
        toast.success('Log added successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save log: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 50,
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(100, 116, 139, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
          background: 'rgba(30, 41, 59, 0.5)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📝 {logToEdit ? 'Edit Log Entry' : 'Add Log Entry'}
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '44px',
              minHeight: '44px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div style={{
          padding: '2rem',
          maxHeight: 'calc(90vh - 200px)',
          overflowY: 'auto'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Date Field */}
            <MobileFormField
              label="Date"
              type="date"
              value={formData.logged_at}
              onChange={handleChange('logged_at')}
              required
            />

            {/* Log Type */}
            <MobileSelect
              label="Activity Type"
              value={formData.type}
              onChange={handleChange('type')}
              options={logTypes}
              required
            />

            {/* Description with Voice */}
            <MobileFormField
              label="Description"
              type="text"
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="Brief description of the activity"
              voiceEnabled={voiceInput.isSupported}
              onVoiceStart={() => handleVoiceStart('description')}
              onVoiceStop={handleVoiceStop}
              isListening={voiceField === 'description' && voiceInput.isListening}
              cannabisType="notes"
            />

            {/* Height Measurement */}
            <MobileFormField
              label="Plant Height"
              type="number"
              step="0.1"
              value={formData.height_cm}
              onChange={handleChange('height_cm')}
              placeholder="25.5"
              unit="cm"
              cannabisType="measurement"
            />

            {/* Water Amount */}
            <MobileFormField
              label="Water Amount"
              type="number"
              step="0.1"
              value={formData.water_amount}
              onChange={handleChange('water_amount')}
              placeholder="2.5"
              unit="L"
              cannabisType="measurement"
            />

            {/* pH Level */}
            <MobileFormField
              label="pH Level"
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={formData.ph_level}
              onChange={handleChange('ph_level')}
              placeholder="6.5"
              cannabisType="ph"
            />

            {/* EC/TDS */}
            <MobileFormField
              label="EC/TDS"
              type="number"
              step="1"
              value={formData.ec_tds}
              onChange={handleChange('ec_tds')}
              placeholder="800"
              unit="ppm"
              cannabisType="ppm"
            />

            {/* Nutrient Information with Voice */}
            <MobileFormField
              label="Nutrient Information"
              type="text"
              value={formData.nutrient_info}
              onChange={handleChange('nutrient_info')}
              placeholder="e.g., General Hydroponics Flora Series, 5ml/L"
              voiceEnabled={voiceInput.isSupported}
              onVoiceStart={() => handleVoiceStart('nutrient_info')}
              onVoiceStop={handleVoiceStop}
              isListening={voiceField === 'nutrient_info' && voiceInput.isListening}
              cannabisType="notes"
            />

            {/* Notes with Voice */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                lineHeight: '1.25'
              }}>
                Notes
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  placeholder="Additional notes and observations..."
                  rows={3}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: voiceInput.isSupported ? '0.75rem 48px 0.75rem 1rem' : '0.75rem 1rem',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4ade80';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />

                {/* Voice Button for Notes */}
                {voiceInput.isSupported && (
                  <button
                    type="button"
                    onClick={() => {
                      if (voiceField === 'notes' && voiceInput.isListening) {
                        handleVoiceStop();
                      } else {
                        handleVoiceStart('notes');
                      }
                    }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      background: (voiceField === 'notes' && voiceInput.isListening) ? '#ef4444' : 'rgba(74, 222, 128, 0.1)',
                      border: (voiceField === 'notes' && voiceInput.isListening) ? '1px solid #ef4444' : '1px solid rgba(74, 222, 128, 0.3)',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '32px',
                      minHeight: '32px',
                      transition: 'all 0.2s ease'
                    }}
                    aria-label={(voiceField === 'notes' && voiceInput.isListening) ? 'Stop voice input' : 'Start voice input'}
                  >
                    {(voiceField === 'notes' && voiceInput.isListening) ? '🎤' : '🎙️'}
                  </button>
                )}
              </div>

              {/* Voice Status */}
              {voiceField === 'notes' && voiceInput.isListening && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  lineHeight: '1.25'
                }}>
                  🎤 Listening... Speak your notes now
                </p>
              )}
            </div>

          </form>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(100, 116, 139, 0.2)',
          background: 'rgba(30, 41, 59, 0.3)'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(100, 116, 139, 0.1)',
              color: '#cbd5e1',
              borderRadius: '12px',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: '44px'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              background: isSubmitting ? 'rgba(100, 116, 139, 0.3)' : 'linear-gradient(135deg, #4ade80, #22c55e)',
              color: 'white',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(74, 222, 128, 0.3)',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isSubmitting && <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />}
            {isSubmitting ? 'Saving...' : (logToEdit ? 'Update Log' : 'Add Log')}
          </button>
        </div>
      </div>

             {/* Add CSS for spinner animation */}
       <style>{`
         @keyframes spin {
           0% { transform: rotate(0deg); }
           100% { transform: rotate(360deg); }
         }
         @keyframes fadeIn {
           from { opacity: 0; }
           to { opacity: 1; }
         }
       `}</style>
    </div>
  );
};

export default LogModalEnhanced;

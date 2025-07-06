import { ChevronDown } from 'lucide-react';
import React from 'react';

const MobileSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  cannabisType,
  style = {},
  ...props
}) => {
  // Enhanced select styles for mobile
  const selectStyles = {
    width: '100%',
    minHeight: '44px', // WCAG minimum touch target
    padding: '0.75rem 3rem 0.75rem 1rem', // Extra right padding for arrow
    fontSize: '16px', // Prevents zoom on iOS
    lineHeight: '1.5',
    background: 'rgba(15, 23, 42, 0.6)',
    border: error ? '2px solid #ef4444' : '1px solid rgba(100, 116, 139, 0.3)',
    borderRadius: '12px',
    color: '#f8fafc',
    outline: 'none',
    transition: 'all 0.2s ease',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    cursor: 'pointer',
    ...style
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#4ade80';
    e.target.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = error ? '#ef4444' : 'rgba(100, 116, 139, 0.3)';
    e.target.style.boxShadow = 'none';
  };

  // Cannabis-specific option sets
  const getCannabisOptions = () => {
    switch (cannabisType) {
      case 'growth-stage':
        return [
          { value: '', label: 'Select Growth Stage' },
          { value: 'seedling', label: '🌱 Seedling (1-3 weeks)' },
          { value: 'vegetative', label: '🌿 Vegetative (3-16 weeks)' },
          { value: 'pre-flower', label: '🌺 Pre-Flower (1-2 weeks)' },
          { value: 'flowering', label: '🌸 Flowering (6-12 weeks)' },
          { value: 'late-flower', label: '🌼 Late Flower (final 2 weeks)' },
          { value: 'harvest', label: '✂️ Harvest' },
          { value: 'drying', label: '🌾 Drying (7-14 days)' },
          { value: 'curing', label: '📦 Curing (2-8 weeks)' }
        ];
      case 'strain-type':
        return [
          { value: '', label: 'Select Strain Type' },
          { value: 'indica', label: '🍇 Indica' },
          { value: 'sativa', label: '🌿 Sativa' },
          { value: 'hybrid', label: '🌸 Hybrid' },
          { value: 'auto', label: '⚡ Autoflower' },
          { value: 'unknown', label: '❓ Unknown' }
        ];
      case 'training-technique':
        return [
          { value: '', label: 'Select Training Technique' },
          { value: 'none', label: '🌿 Natural Growth' },
          { value: 'lst', label: '🪢 LST (Low Stress Training)' },
          { value: 'hst', label: '✂️ HST (High Stress Training)' },
          { value: 'topping', label: '🔝 Topping' },
          { value: 'fiming', label: '👆 FIMing' },
          { value: 'scrog', label: '🕸️ SCROG (Screen of Green)' },
          { value: 'sog', label: '🌊 SOG (Sea of Green)' },
          { value: 'supercropping', label: '💪 Supercropping' },
          { value: 'defoliation', label: '🍃 Defoliation' }
        ];
      case 'grow-medium':
        return [
          { value: '', label: 'Select Growing Medium' },
          { value: 'soil', label: '🌱 Soil' },
          { value: 'coco', label: '🥥 Coco Coir' },
          { value: 'hydro', label: '💧 Hydroponic' },
          { value: 'soilless', label: '🌿 Soilless Mix' },
          { value: 'dwc', label: '🫧 Deep Water Culture' },
          { value: 'nft', label: '🌊 NFT (Nutrient Film)' },
          { value: 'aero', label: '💨 Aeroponics' }
        ];
      case 'nutrient-brand':
        return [
          { value: '', label: 'Select Nutrient Brand' },
          { value: 'general-hydroponics', label: '🧪 General Hydroponics' },
          { value: 'advanced-nutrients', label: '⚗️ Advanced Nutrients' },
          { value: 'fox-farm', label: '🦊 Fox Farm' },
          { value: 'canna', label: '🌿 Canna' },
          { value: 'jacks', label: '🔧 Jack\'s 321' },
          { value: 'megacrop', label: '🌾 MegaCrop' },
          { value: 'custom', label: '🔧 Custom Mix' }
        ];
      case 'feeding-strength':
        return [
          { value: '', label: 'Select Feeding Strength' },
          { value: 'light', label: '🌱 Light (25-50% strength)' },
          { value: 'medium', label: '🌿 Medium (75% strength)' },
          { value: 'aggressive', label: '💪 Aggressive (100% strength)' }
        ];
      default:
        return options;
    }
  };

  const optionsToRender = cannabisType ? getCannabisOptions() : options;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Label */}
      <label style={{
        display: 'block',
        color: '#e2e8f0',
        fontSize: '0.875rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        lineHeight: '1.25'
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>

      {/* Select Container */}
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={onChange}
          style={selectStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        >
          {!cannabisType && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {optionsToRender.map((option, index) => (
            <option
              key={index}
              value={option.value || option}
              style={{
                backgroundColor: '#2d3748',
                color: '#e2e8f0',
                padding: '0.5rem'
              }}
            >
              {option.label || option}
            </option>
          ))}
        </select>

        {/* Custom Arrow */}
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#94a3b8'
        }}>
          <ChevronDown style={{ width: '20px', height: '20px' }} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p style={{
          color: '#ef4444',
          fontSize: '0.75rem',
          marginTop: '0.25rem',
          lineHeight: '1.25'
        }}>
          {error}
        </p>
      )}

      {/* Cannabis-specific help text */}
      {cannabisType && (
        <p style={{
          color: '#94a3b8',
          fontSize: '0.75rem',
          marginTop: '0.25rem',
          lineHeight: '1.25'
        }}>
          {cannabisType === 'growth-stage' && 'Select the current growth stage of your plant'}
          {cannabisType === 'strain-type' && 'Choose the genetic type of your strain'}
          {cannabisType === 'training-technique' && 'Select the training method you\'re using'}
          {cannabisType === 'grow-medium' && 'Choose your growing medium for optimal nutrient calculations'}
          {cannabisType === 'nutrient-brand' && 'Select your preferred nutrient brand'}
          {cannabisType === 'feeding-strength' && 'Choose feeding strength based on plant response'}
        </p>
      )}
    </div>
  );
};

export default MobileSelect;

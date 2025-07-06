import { Mic, MicOff } from 'lucide-react';
import React from 'react';

const MobileFormField = ({
  label,
  type = 'text',
  inputMode,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  step,
  min,
  max,
  autoComplete = 'off',
  voiceEnabled = false,
  onVoiceStart,
  onVoiceStop,
  isListening = false,
  unit,
  cannabisType,
  style = {},
  ...props
}) => {
  // Determine appropriate inputMode based on type and cannabis context
  const getInputMode = () => {
    if (inputMode) return inputMode;

    // Cannabis-specific input modes
    if (cannabisType === 'temperature' || cannabisType === 'humidity' || cannabisType === 'ph') {
      return 'decimal';
    }
    if (cannabisType === 'ppm' || cannabisType === 'ppfd' || cannabisType === 'co2') {
      return 'numeric';
    }
    if (cannabisType === 'strain' || cannabisType === 'notes') {
      return 'text';
    }

    // Standard input modes
    if (type === 'number') {
      return step && step !== '1' ? 'decimal' : 'numeric';
    }
    if (type === 'email') return 'email';
    if (type === 'tel') return 'tel';
    if (type === 'search') return 'search';

    return 'text';
  };

  // Get appropriate autocomplete value
  const getAutoComplete = () => {
    if (autoComplete !== 'off') return autoComplete;

    // Cannabis-specific autocomplete hints
    if (cannabisType === 'strain') return 'off'; // Prevent browser strain suggestions
    if (cannabisType === 'notes') return 'off';

    return 'off';
  };

  // Enhanced input styles for mobile
  const inputStyles = {
    width: '100%',
    minHeight: '44px', // WCAG minimum touch target
    padding: '0.75rem 1rem',
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
    MozAppearance: 'textfield',
    ...style
  };

  // Voice button styles
  const voiceButtonStyles = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: isListening ? '#ef4444' : 'rgba(74, 222, 128, 0.1)',
    border: isListening ? '1px solid #ef4444' : '1px solid rgba(74, 222, 128, 0.3)',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    minHeight: '32px',
    transition: 'all 0.2s ease'
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#4ade80';
    e.target.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.1)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = error ? '#ef4444' : 'rgba(100, 116, 139, 0.3)';
    e.target.style.boxShadow = 'none';
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      onVoiceStop?.();
    } else {
      onVoiceStart?.();
    }
  };

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
        {unit && <span style={{ color: '#94a3b8', fontWeight: '400' }}> ({unit})</span>}
      </label>

      {/* Input Container */}
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          inputMode={getInputMode()}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
          autoComplete={getAutoComplete()}
          style={{
            ...inputStyles,
            paddingRight: voiceEnabled ? '48px' : '1rem'
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Voice Input Button */}
        {voiceEnabled && (
          <button
            type="button"
            onClick={handleVoiceToggle}
            style={voiceButtonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isListening ? '#dc2626' : 'rgba(74, 222, 128, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isListening ? '#ef4444' : 'rgba(74, 222, 128, 0.1)';
            }}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            {isListening ? (
              <MicOff style={{ width: '16px', height: '16px', color: '#fff' }} />
            ) : (
              <Mic style={{ width: '16px', height: '16px', color: '#4ade80' }} />
            )}
          </button>
        )}
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
          {cannabisType === 'ph' && 'Optimal range: 5.5-6.5 (hydro), 6.0-7.0 (soil)'}
          {cannabisType === 'temperature' && 'Optimal range: 70-85°F (21-29°C)'}
          {cannabisType === 'humidity' && 'Optimal range: 40-60% (veg), 30-50% (flower)'}
          {cannabisType === 'ppm' && 'Typical range: 400-800 (veg), 800-1400 (flower)'}
          {cannabisType === 'ppfd' && 'Optimal range: 400-600 (veg), 600-1000 (flower)'}
          {cannabisType === 'co2' && 'Enhanced range: 1000-1500 ppm with adequate ventilation'}
        </p>
      )}
    </div>
  );
};

export default MobileFormField;

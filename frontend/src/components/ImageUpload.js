import { AlertCircle, Camera, CheckCircle, Loader, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { parseEnvironmentalData } from '../utils/ocrParser';

// CSS animations for the modal
const modalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

// Inject styles safely
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = modalStyles; // Use textContent instead of innerHTML for security
  if (!document.head.querySelector('style[data-image-upload-styles]')) {
    styleElement.setAttribute('data-image-upload-styles', 'true');
    document.head.appendChild(styleElement);
  }
}

const ImageUpload = ({ onDataParsed, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      processImage(file);
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processImage = async (file) => {
    setIsProcessing(true);
    setParsedData(null);

    try {
      const result = await parseEnvironmentalData(file);
      setParsedData(result);

      if (result.success) {
        toast.success(`Successfully parsed ${Object.keys(result.parsedValues).length} values!`);
      } else {
        toast.error(result.message || 'Could not extract data from image');
      }
    } catch {
      toast.error('Error processing image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseData = () => {
    if (parsedData && parsedData.success) {
      onDataParsed(parsedData);
      onClose();
    }
  };

  const clearImage = () => {
    setPreview(null);
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    }}>
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
        overflow: 'hidden',
        animation: 'modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(100, 116, 139, 0.2)',
          background: 'rgba(30, 41, 59, 0.5)'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📷 Upload or Take Photo
          </h3>
          <button
            data-testid="imageupload-close-btn"
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
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div style={{
          padding: '2rem',
          maxHeight: 'calc(90vh - 140px)',
          overflowY: 'auto'
        }}>
          <p style={{
            margin: '0 0 1.5rem 0',
            color: '#cbd5e1',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}>
            Take a photo of your grow app, nutrient label, or environmental readings.
            On mobile, tap "Choose File" to access your camera directly. We&apos;ll automatically extract values using OCR.
          </p>

          {!preview ? (
            <div
              style={{
                border: '2px dashed rgba(100, 116, 139, 0.3)',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'rgba(15, 23, 42, 0.3)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4ade80';
                e.currentTarget.style.background = 'rgba(74, 222, 128, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(74, 222, 128, 0.1)',
                    borderRadius: '50%',
                    border: '1px solid rgba(74, 222, 128, 0.2)'
                  }}>
                    <Camera style={{ width: '48px', height: '48px', color: '#4ade80' }} />
                  </div>
                </div>
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#f8fafc'
                }}>
                  Drop image here, click to browse, or take photo
                </h4>
                <p style={{
                  margin: '0 0 1.5rem 0',
                  color: '#94a3b8',
                  fontSize: '0.875rem'
                }}>
                  Supports JPG, PNG, WebP formats
                </p>
                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                  color: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(74, 222, 128, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 222, 128, 0.3)';
                }}
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div>
              <div style={{
                position: 'relative',
                marginBottom: '1.5rem'
              }}>
                <img
                  src={preview}
                  alt="Screenshot preview"
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    border: '1px solid rgba(100, 116, 139, 0.2)',
                    background: 'rgba(15, 23, 42, 0.5)'
                  }}
                />
                <button
                  onClick={clearImage}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isProcessing && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  marginBottom: '1.5rem'
                }}>
                  <Loader className="w-5 h-5 animate-spin" style={{ color: '#3b82f6' }} />
                  <span style={{ color: '#3b82f6', fontWeight: '500' }}>Processing image...</span>
                </div>
              )}

              {parsedData && !isProcessing && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${parsedData.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    {parsedData.success ? (
                      <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                    ) : (
                      <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                    )}
                    <h4 style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: parsedData.success ? '#22c55e' : '#ef4444'
                    }}>
                      {parsedData.success ? 'Data Extracted Successfully!' : 'No Data Found'}
                    </h4>
                  </div>

                  {parsedData.success ? (
                    <div>
                      <h5 style={{
                        margin: '0 0 1rem 0',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#f8fafc',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Extracted Values:
                      </h5>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.75rem'
                      }}>
                        {Object.entries(parsedData.parsedValues).map(([key, value]) => (
                          <div
                            key={key}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.75rem',
                              background: 'rgba(30, 41, 59, 0.5)',
                              borderRadius: '8px',
                              border: '1px solid rgba(100, 116, 139, 0.2)'
                            }}
                          >
                            <span style={{
                              color: '#94a3b8',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}>
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </span>
                            <span style={{
                              color: '#f8fafc',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{
                        margin: '0 0 0.5rem 0',
                        color: '#cbd5e1',
                        fontSize: '0.875rem'
                      }}>
                        {parsedData.message}
                      </p>
                      <p style={{
                        margin: 0,
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                        fontStyle: 'italic'
                      }}>
                        Make sure the screenshot clearly shows the environmental readings with good contrast.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(100, 116, 139, 0.2)',
          background: 'rgba(30, 41, 59, 0.3)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(100, 116, 139, 0.1)',
              color: '#cbd5e1',
              borderRadius: '12px',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)';
              e.currentTarget.style.color = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            Cancel
          </button>
          {parsedData && parsedData.success && (
            <button
              onClick={handleUseData}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                color: 'white',
                borderRadius: '12px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(74, 222, 128, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 222, 128, 0.3)';
              }}
            >
              Use This Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;

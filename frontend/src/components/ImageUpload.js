import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { parseEnvironmentalData } from '../utils/ocrParser';
import toast from 'react-hot-toast';

const ImageUpload = ({ onDataParsed, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [rawOcrText, setRawOcrText] = useState(null);
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
    setRawOcrText(null);

    try {
      const result = await parseEnvironmentalData(file);
      setParsedData(result);
      if (result.ocrRawText) setRawOcrText(result.ocrRawText);

      if (result.success) {
        toast.success(`Successfully parsed ${Object.keys(result.parsedValues).length} values!`);
      } else {
        toast.error(result.message || 'Could not extract data from image');
        if (result.ocrRawText) {
          toast('OCR Raw Text: ' + result.ocrRawText.slice(0, 300));
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
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
    <div className="image-upload-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>📱 Upload App Screenshot</h3>
          <button onClick={onClose} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <p className="upload-instructions">
            Take a screenshot of your Spider Farmer app showing environmental readings and upload it here. 
            We'll automatically extract the temperature, humidity, VPD, and other values.
          </p>

          {!preview ? (
            <div
              className="upload-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-zone-content">
                <div className="upload-icon">
                  <Camera className="w-12 h-12" />
                </div>
                <h4>Drop screenshot here or click to browse</h4>
                <p>Supports JPG, PNG, WebP formats</p>
                <div className="upload-buttons">
                  <button className="btn btn-primary">
                    <Upload className="w-4 h-4" />
                    Choose File
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="preview-section">
              <div className="image-preview">
                <img src={preview} alt="Screenshot preview" />
                <button onClick={clearImage} className="clear-image-btn">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isProcessing && (
                <div className="processing-status">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing image...</span>
                </div>
              )}

              {parsedData && !isProcessing && (
                <div className="parsed-results">
                  <div className="results-header">
                    {parsedData.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h4>
                      {parsedData.success ? 'Data Extracted Successfully!' : 'No Data Found'}
                    </h4>
                  </div>

                  {parsedData.success ? (
                    <div className="extracted-values">
                      <h5>Extracted Values:</h5>
                      <div className="values-grid">
                        {Object.entries(parsedData.parsedValues).map(([key, value]) => (
                          <div key={key} className="value-item">
                            <span className="value-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                            <span className="value-data">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="no-data-message">
                      <p>{parsedData.message}</p>
                      <p className="help-text">
                        Make sure the screenshot clearly shows the environmental readings with good contrast.
                      </p>
                      {rawOcrText && (
                        <div className="mt-4 p-2 bg-gray-900 text-xs text-gray-300 rounded">
                          <strong>OCR Raw Text:</strong>
                          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{rawOcrText}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          {parsedData && parsedData.success && (
            <button onClick={handleUseData} className="btn btn-primary">
              Use This Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload; 
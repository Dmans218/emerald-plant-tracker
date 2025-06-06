import EXIF from 'exif-js';

// Extract EXIF data from image file
const getImageMetadata = (file) => {
  return new Promise((resolve) => {
    EXIF.getData(file, function() {
      const dateTime = EXIF.getTag(this, "DateTime") || 
                      EXIF.getTag(this, "DateTimeOriginal") || 
                      EXIF.getTag(this, "DateTimeDigitized");
      
      let timestamp = null;
      
      if (dateTime) {
        // EXIF date format is "YYYY:MM:DD HH:MM:SS"
        // Convert to ISO format for JavaScript Date
        const isoDateString = dateTime.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
        timestamp = new Date(isoDateString).toISOString();
      }
      
      const make = EXIF.getTag(this, "Make") || "";
      const model = EXIF.getTag(this, "Model") || "";
      const camera = [make, model].filter(Boolean).join(" ") || "Unknown";
      
      resolve({
        timestamp: timestamp,
        camera: camera,
        orientation: EXIF.getTag(this, "Orientation")
      });
    });
  });
};

// Parse environmental data from Spider Farmer app screenshot using server-side OCR
export const parseSpiderFarmerScreenshot = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/api/environment/ocr', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Server OCR result:', result);
    
    return result;
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      temperature: null,
      humidity: null,
      ph: null,
      co2: null,
      vpd: null,
      ppfd: null,
      success: false,
      error: error.message,
      parsedValues: {},
      ocrRawText: null
    };
  }
};

// Helper function to preprocess image for better OCR
export const preprocessImageForOCR = (canvas, context) => {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale and increase contrast
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    
    // Increase contrast (simple threshold)
    const contrast = gray > 128 ? 255 : 0;
    
    data[i] = contrast;     // Red
    data[i + 1] = contrast; // Green
    data[i + 2] = contrast; // Blue
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

// Parse different app layouts/formats
export const parseEnvironmentalData = async (imageFile) => {
  try {
    // Extract image metadata (including timestamp) first
    const metadata = await getImageMetadata(imageFile);
    console.log('Image metadata:', metadata);
    
    // Try Spider Farmer format first
    const spiderFarmerResult = await parseSpiderFarmerScreenshot(imageFile);
    
    if (spiderFarmerResult.success) {
      return {
        ...spiderFarmerResult,
        source: 'Spider Farmer App',
        metadata: metadata,
        timestamp: metadata.timestamp
      };
    }

    // Could add other app parsers here in the future
    return {
      ...spiderFarmerResult,
      source: 'Unknown',
      metadata: metadata,
      timestamp: metadata.timestamp,
      message: 'Could not parse environmental data from image. Please ensure the image shows clear readings from a supported app.'
    };
  } catch (error) {
    console.error('Error parsing image:', error);
    return {
      temperature: null,
      humidity: null,
      ph: null,
      co2: null,
      vpd: null,
      ppfd: null,
      success: false,
      error: error.message,
      parsedValues: {},
      metadata: null,
      timestamp: null
    };
  }
}; 
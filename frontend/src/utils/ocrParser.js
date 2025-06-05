import Tesseract from 'tesseract.js';
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

// Parse environmental data from Spider Farmer app screenshot
export const parseSpiderFarmerScreenshot = async (imageFile) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
      logger: m => console.log(m),
      tessedit_char_whitelist: '0123456789.°C%kPa ppm μmol/s-+:VPDCOTemperatureHumidityAir ',
    });

    console.log('OCR Raw Text:', text);

    // Initialize result object
    const result = {
      temperature: null,
      humidity: null,
      ph: null,
      co2: null,
      vpd: null,
      ppfd: null,
      success: false,
      parsedValues: {}
    };

    // Clean text for better analysis
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('Text lines:', lines);

    // Extract all numbers with context for smarter parsing
    const numberPattern = /(\d+\.?\d*)/g;
    const allNumbers = [];
    let match;
    while ((match = numberPattern.exec(text)) !== null) {
      const number = parseFloat(match[1]);
      const index = match.index;
      const contextBefore = text.substring(Math.max(0, index - 20), index).toLowerCase();
      const contextAfter = text.substring(index, Math.min(text.length, index + 20)).toLowerCase();
      allNumbers.push({
        value: number,
        text: match[1],
        index: index,
        contextBefore: contextBefore,
        contextAfter: contextAfter,
        fullContext: contextBefore + match[1] + contextAfter
      });
    }
    
    console.log('Numbers with context:', allNumbers);

    // Parse Temperature - look for temperature in proper range with °C
    for (const num of allNumbers) {
      if (!result.temperature && num.value >= 15 && num.value <= 40) {
        const context = num.fullContext;
        // Check if it's near temperature indicators and has degree symbol
        if ((context.includes('temp') || context.includes('air')) && 
            (context.includes('°') || context.includes('º')) &&
            !context.includes('vpd') && !context.includes('%')) {
          result.temperature = num.value;
          result.parsedValues.temperature = `${num.value}°C`;
          console.log('Found temperature:', num.value, 'Context:', context);
          break;
        }
      }
    }

    // Parse Humidity - look for values that appear after "Air Humi" or "Humi" keywords
    for (const num of allNumbers) {
      if (!result.humidity && num.value >= 20 && num.value <= 100) {
        const context = num.fullContext;
        const beforeText = num.contextBefore;
        const afterText = num.contextAfter;
        
        // Check if this number appears after humidity keywords
        const afterHumidityLabel = beforeText.includes('humi') || beforeText.includes('humid');
        const notTemperature = !context.includes('°') && !context.includes('temp');
        const notVPD = !context.includes('vpd') && !context.includes('kpa');
        const notInHeader = !beforeText.includes('mm') && !beforeText.includes('c&c') && !beforeText.includes('®');
        
        // Prioritize numbers that come after humidity labels
        if (afterHumidityLabel && notTemperature && notVPD && notInHeader) {
          result.humidity = num.value;
          result.parsedValues.humidity = `${num.value}%`;
          console.log('Found humidity after label:', num.value, 'Context:', context);
          break;
        }
      }
    }
    
    // Fallback: look for numbers in a data row structure (like "21.7 < 78.1 0.57")
    if (!result.humidity) {
      for (const num of allNumbers) {
        if (num.value >= 50 && num.value <= 100) {
          const context = num.fullContext;
          const beforeText = num.contextBefore;
          const afterText = num.contextAfter;
          
          // Look for numbers in a sequence that could be temp, humidity, vpd
          const inDataRow = (beforeText.includes('21') || beforeText.includes('22') || beforeText.includes('20')) && 
                           (afterText.includes('0.') || context.includes('<'));
          const notInHeader = !beforeText.includes('mm') && !beforeText.includes('®') && !beforeText.includes('¢');
          
          if (inDataRow && notInHeader) {
            result.humidity = num.value;
            result.parsedValues.humidity = `${num.value}%`;
            console.log('Found humidity in data row:', num.value, 'Context:', context);
            break;
          }
        }
      }
    }

    // Parse VPD - look for small decimal values with kPa context  
    for (const num of allNumbers) {
      if (!result.vpd && num.value >= 0.1 && num.value <= 5.0) {
        const context = num.fullContext;
        // VPD should be small decimal near "VPD" text or "kPa"
        if (context.includes('vpd') || 
            (context.includes('kpa') && num.value < 10) ||
            (num.value < 2.0 && context.includes('kpa'))) {
          result.vpd = num.value;
          result.parsedValues.vpd = `${num.value} kPa`;
          console.log('Found VPD:', num.value, 'Context:', context);
          break;
        }
      }
    }

    // Fallback parsing if direct context matching fails
    if (!result.temperature || !result.humidity || !result.vpd) {
      console.log('Using fallback parsing...');
      
      // Sort numbers by value to help identify them
      const sortedNumbers = [...allNumbers].sort((a, b) => a.value - b.value);
      console.log('Sorted numbers:', sortedNumbers.map(n => n.value));
      
      // If we don't have temperature, look for number around 20-25 (room temp)
      if (!result.temperature) {
        const tempCandidate = sortedNumbers.find(n => n.value >= 18 && n.value <= 30);
        if (tempCandidate && !tempCandidate.fullContext.includes('%')) {
          result.temperature = tempCandidate.value;
          result.parsedValues.temperature = `${tempCandidate.value}°C`;
          console.log('Fallback temperature:', tempCandidate.value);
        }
      }
      
             // If we don't have humidity, look for numbers with % symbol, prioritizing higher values
       if (!result.humidity) {
         // First try to find numbers with % that are in typical humidity range (50-90%)
         const humidCandidate = sortedNumbers.reverse().find(n => 
           n.value >= 50 && n.value <= 100 && 
           n.fullContext.includes('%') &&
           !n.fullContext.includes('°') &&
           !n.fullContext.includes('vpd') &&
           !n.fullContext.includes('kpa')
         );
         
         // If not found, try broader range (30-100%)
         const humidCandidate2 = humidCandidate || sortedNumbers.find(n => 
           n.value >= 30 && n.value <= 100 && 
           n.fullContext.includes('%') &&
           !n.fullContext.includes('°')
         );
         
         if (humidCandidate || humidCandidate2) {
           const candidate = humidCandidate || humidCandidate2;
           result.humidity = candidate.value;
           result.parsedValues.humidity = `${candidate.value}%`;
           console.log('Fallback humidity:', candidate.value, 'Context:', candidate.fullContext);
         }
       }
      
      // If we don't have VPD, look for small decimals
      if (!result.vpd) {
        const vpdCandidate = sortedNumbers.find(n => 
          n.value >= 0.1 && n.value <= 2.0 && 
          n.text.includes('.')
        );
        if (vpdCandidate) {
          result.vpd = vpdCandidate.value;
          result.parsedValues.vpd = `${vpdCandidate.value} kPa`;
          console.log('Fallback VPD:', vpdCandidate.value);
        }
      }
    }

        // Parse CO2 (ppm pattern)
    let co2Match = text.match(/co\s*[₂2]?\s*[:-]?\s*(\d+)/i) || 
                     text.match(/(\d+)\s*ppm/i);
    
    // Look for numbers in CO2 range
    if (!co2Match && allNumbers.length > 0) {
      for (const num of allNumbers) {
        const val = parseFloat(num);
        if (val >= 300 && val <= 2000) { // Typical CO2 range
          const numIndex = text.indexOf(num);
          const surrounding = text.substring(Math.max(0, numIndex - 15), numIndex + 15).toLowerCase();
          if (surrounding.includes('co2') || surrounding.includes('ppm')) {
            co2Match = [null, num];
            break;
          }
        }
      }
    }
    
    if (co2Match) {
      result.co2 = parseFloat(co2Match[1]);
      result.parsedValues.co2 = `${co2Match[1]} ppm`;
    }

        // Parse PPFD (μmol pattern)
    let ppfdMatch = text.match(/ppfd\s*[:-]?\s*(\d+)/i) ||
                      text.match(/(\d+)\s*[μu]mol/i);
    
    // Look for numbers in PPFD range
    if (!ppfdMatch && allNumbers.length > 0) {
      for (const num of allNumbers) {
        const val = parseFloat(num);
        if (val >= 100 && val <= 2000) { // Typical PPFD range
          const numIndex = text.indexOf(num);
          const surrounding = text.substring(Math.max(0, numIndex - 15), numIndex + 15).toLowerCase();
          if (surrounding.includes('ppfd') || surrounding.includes('μmol') || surrounding.includes('umol')) {
            ppfdMatch = [null, num];
            break;
          }
        }
      }
    }
    
    if (ppfdMatch) {
      result.ppfd = parseFloat(ppfdMatch[1]);
      result.parsedValues.ppfd = `${ppfdMatch[1]} μmol/m²/s`;
    }

    // Parse pH
    let phMatch = text.match(/ph\s*[:-]?\s*(\d+\.?\d*)/i);
    if (!phMatch && allNumbers.length > 0) {
      for (const num of allNumbers) {
        const val = parseFloat(num);
        if (val >= 4.0 && val <= 9.0) { // Typical pH range
          const numIndex = text.indexOf(num);
          const surrounding = text.substring(Math.max(0, numIndex - 10), numIndex + 10).toLowerCase();
          if (surrounding.includes('ph')) {
            phMatch = [null, num];
            break;
          }
        }
      }
    }
    
    if (phMatch) {
      result.ph = parseFloat(phMatch[1]);
      result.parsedValues.ph = phMatch[1];
    }

    // Check if we found at least one value
    result.success = Object.values(result).some(val => val !== null && typeof val === 'number');

    console.log('Parsed result:', result);
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
      parsedValues: {}
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
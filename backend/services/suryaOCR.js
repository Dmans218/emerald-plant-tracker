const axios = require('axios');
const sharp = require('sharp');
const Jimp = require('jimp');

class SuryaOCRService {
  constructor() {
    // Surya OCR endpoint (using local Docker container or cloud service)
    this.suryaEndpoint = process.env.SURYA_ENDPOINT || 'http://localhost:8501';
    this.fallbackToTesseract = true;
  }

  /**
   * Enhanced OCR processing with brand-specific optimization
   */
  async processImage(imagePath, brand = 'auto') {
    try {
      console.log(`Processing image with Surya OCR for brand: ${brand}`);
      
      // Preprocess image for better OCR accuracy
      const preprocessedImage = await this.preprocessImage(imagePath, brand);
      
      // Try Surya OCR first
      let ocrResult = await this.extractTextWithSurya(preprocessedImage);
      
      // Fallback to enhanced Tesseract if Surya fails
      if (!ocrResult || ocrResult.length < 10) {
        console.log('Surya OCR failed, falling back to enhanced Tesseract');
        ocrResult = await this.extractTextWithTesseract(preprocessedImage);
      }
      
      // Parse environmental data based on detected brand
      const detectedBrand = brand === 'auto' ? this.detectBrand(ocrResult) : brand;
      const environmentalData = this.parseEnvironmentalData(ocrResult, detectedBrand);
      
      return {
        success: true,
        text: ocrResult,
        brand: detectedBrand,
        data: environmentalData,
        confidence: this.calculateConfidence(environmentalData)
      };
      
    } catch (error) {
      console.error('SuryaOCR processing error:', error);
      return {
        success: false,
        error: error.message,
        brand: 'unknown',
        data: {}
      };
    }
  }

  /**
   * Image preprocessing optimized for different controller brands
   */
  async preprocessImage(imagePath, brand) {
    try {
      let image = sharp(imagePath);
      
      // Get image metadata
      const metadata = await image.metadata();
      console.log(`Original image: ${metadata.width}x${metadata.height}`);
      
      // Brand-specific preprocessing
      switch (brand.toLowerCase()) {
        case 'spider-farmer':
          // Spider Farmer has dark backgrounds with white text
          image = image
            .resize({ width: 1200, height: 800, fit: 'contain' })
            .normalize()
            .linear(1.5, -(128 * 0.5)) // Increase contrast
            .threshold(128); // Convert to black/white
          break;
          
        case 'ac-infinity':
          // AC Infinity has LCD-style displays
          image = image
            .resize({ width: 1000, height: 600, fit: 'contain' })
            .modulate({ brightness: 1.2, saturation: 0.8 })
            .sharpen();
          break;
          
        case 'vivosun':
          // Vivosun has colorful touchscreen interfaces
          image = image
            .resize({ width: 800, height: 480, fit: 'contain' })
            .removeAlpha()
            .normalize();
          break;
          
        case 'mars-hydro':
          // Mars Hydro has LED display style
          image = image
            .resize({ width: 800, height: 600, fit: 'contain' })
            .greyscale()
            .normalize()
            .sharpen();
          break;
          
        default:
          // General preprocessing for unknown brands
          image = image
            .resize({ width: 1000, height: 800, fit: 'contain' })
            .normalize()
            .sharpen();
      }
      
      // Save preprocessed image to buffer
      const buffer = await image.png().toBuffer();
      
      // Create temporary file path for processed image
      const processedPath = imagePath.replace(/\.[^/.]+$/, '_processed.png');
      await sharp(buffer).png().toFile(processedPath);
      
      return processedPath;
      
    } catch (error) {
      console.error('Image preprocessing error:', error);
      return imagePath; // Return original if preprocessing fails
    }
  }

  /**
   * Extract text using Surya OCR
   */
  async extractTextWithSurya(imagePath) {
    try {
      // Read image file
      const imageBuffer = await sharp(imagePath).png().toBuffer();
      const base64Image = imageBuffer.toString('base64');
      
      // Call Surya OCR API
      const response = await axios.post(`${this.suryaEndpoint}/ocr`, {
        image: base64Image,
        language: 'en',
        enhance: true
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.text) {
        console.log('Surya OCR extracted text:', response.data.text.substring(0, 200) + '...');
        return response.data.text;
      }
      
      throw new Error('No text returned from Surya OCR');
      
    } catch (error) {
      console.error('Surya OCR API error:', error.message);
      throw error;
    }
  }

  /**
   * Enhanced Tesseract fallback
   */
  async extractTextWithTesseract(imagePath) {
    const { createWorker } = require('tesseract.js');
    
    try {
      const worker = await createWorker('eng');
      
      // Configure Tesseract for better number recognition
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.,°CcFf%kKpPaAvVdDHhTtMmRrEe:- ',
        tessedit_pageseg_mode: 6, // Uniform block of text
      });
      
      const { data } = await worker.recognize(imagePath);
      await worker.terminate();
      
      console.log('Enhanced Tesseract extracted text:', data.text.substring(0, 200) + '...');
      return data.text;
      
    } catch (error) {
      console.error('Enhanced Tesseract error:', error);
      throw error;
    }
  }

  /**
   * Detect controller brand from OCR text
   */
  detectBrand(text) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('spider') || textLower.includes('sf-') || textLower.includes('se3000') || textLower.includes('se5000')) {
      return 'spider-farmer';
    }
    
    if (textLower.includes('ac infinity') || textLower.includes('controller 69') || textLower.includes('uis') || textLower.includes('cloudline')) {
      return 'ac-infinity';
    }
    
    if (textLower.includes('vivosun') || textLower.includes('growhub') || textLower.includes('e42') || textLower.includes('aerolight')) {
      return 'vivosun';
    }
    
    if (textLower.includes('mars hydro') || textLower.includes('controller 43') || textLower.includes('fc-') || textLower.includes('marspro')) {
      return 'mars-hydro';
    }
    
    if (textLower.includes('inkbird') || textLower.includes('itc-') || textLower.includes('humidity controller')) {
      return 'inkbird';
    }
    
    return 'unknown';
  }

  /**
   * Brand-specific environmental data parsing
   */
  parseEnvironmentalData(text, brand) {
    console.log(`Parsing environmental data for brand: ${brand}`);
    
    switch (brand) {
      case 'spider-farmer':
        return this.parseSpiderFarmerData(text);
      case 'ac-infinity':
        return this.parseACInfinityData(text);
      case 'vivosun':
        return this.parseVivosunData(text);
      case 'mars-hydro':
        return this.parseMarsHydroData(text);
      default:
        return this.parseGenericData(text);
    }
  }

  /**
   * Spider Farmer specific parsing
   */
  parseSpiderFarmerData(text) {
    const result = {
      temperature: null,
      humidity: null,
      vpd: null,
      ph: null,
      co2: null,
      ppfd: null
    };

    // Enhanced regex patterns for Spider Farmer displays
    const patterns = {
      // Look for three decimal numbers in sequence (temp, humidity, VPD)
      sequencePattern: /(\d+\.\d+)\s+(\d+\.\d+)\s+(\d+\.\d+)/g,
      
      // Individual patterns with context
      temperature: /(?:temp|temperature|°c|celsius)[\s:]*(\d+\.?\d*)/gi,
      humidity: /(?:hum|humidity|rh|%|percent)[\s:]*(\d+\.?\d*)/gi,
      vpd: /(?:vpd|vapor|pressure|deficit|kpa)[\s:]*(\d+\.?\d*)/gi,
      ph: /(?:ph|acid|alkaline)[\s:]*(\d+\.?\d*)/gi,
      co2: /(?:co2|carbon|ppm)[\s:]*(\d+\.?\d*)/gi,
      ppfd: /(?:ppfd|par|light|umol)[\s:]*(\d+\.?\d*)/gi
    };

    // Try sequence pattern first (most reliable for Spider Farmer)
    const sequenceMatch = patterns.sequencePattern.exec(text);
    if (sequenceMatch) {
      const [, temp, hum, vpd] = sequenceMatch;
      
      // Validate ranges
      const tempVal = parseFloat(temp);
      const humVal = parseFloat(hum);
      const vpdVal = parseFloat(vpd);
      
      if (tempVal >= 15 && tempVal <= 50) result.temperature = tempVal;
      if (humVal >= 30 && humVal <= 100) result.humidity = humVal;
      if (vpdVal >= 0.1 && vpdVal <= 3.0) result.vpd = vpdVal;
      
      console.log(`Spider Farmer sequence found: T:${tempVal} H:${humVal} VPD:${vpdVal}`);
    }

    // Fill in missing values with individual patterns
    if (!result.temperature) {
      const tempMatch = patterns.temperature.exec(text);
      if (tempMatch) {
        const temp = parseFloat(tempMatch[1]);
        if (temp >= 15 && temp <= 50) result.temperature = temp;
      }
    }

    if (!result.humidity) {
      const humMatch = patterns.humidity.exec(text);
      if (humMatch) {
        const hum = parseFloat(humMatch[1]);
        if (hum >= 30 && hum <= 100) result.humidity = hum;
      }
    }

    if (!result.vpd) {
      const vpdMatch = patterns.vpd.exec(text);
      if (vpdMatch) {
        const vpd = parseFloat(vpdMatch[1]);
        if (vpd >= 0.1 && vpd <= 3.0) result.vpd = vpd;
      }
    }

    return result;
  }

  /**
   * AC Infinity specific parsing
   */
  parseACInfinityData(text) {
    const result = {
      temperature: null,
      humidity: null,
      vpd: null,
      ph: null,
      co2: null,
      ppfd: null
    };

    // AC Infinity controllers display data differently
    const patterns = {
      temperature: /(?:temp|t)[\s:]*(\d+\.?\d*)[\s°]*[cf]/gi,
      humidity: /(?:humidity|rh|h)[\s:]*(\d+\.?\d*)[\s%]/gi,
      vpd: /(?:vpd|deficit)[\s:]*(\d+\.?\d*)[\s]*kpa/gi,
      trigger: /(?:trigger|alert)[\s:]*(\d+\.?\d*)/gi
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = pattern.exec(text);
      if (match && key !== 'trigger') {
        const value = parseFloat(match[1]);
        
        switch (key) {
          case 'temperature':
            if (value >= 15 && value <= 50) result.temperature = value;
            break;
          case 'humidity':
            if (value >= 30 && value <= 100) result.humidity = value;
            break;
          case 'vpd':
            if (value >= 0.1 && value <= 3.0) result.vpd = value;
            break;
        }
      }
    });

    return result;
  }

  /**
   * Vivosun specific parsing
   */
  parseVivosunData(text) {
    const result = {
      temperature: null,
      humidity: null,
      vpd: null,
      ph: null,
      co2: null,
      ppfd: null
    };

    // Vivosun GrowHub displays data on touchscreen interface
    const patterns = {
      temperature: /(\d+\.?\d*)\s*°[cf]/gi,
      humidity: /(\d+\.?\d*)\s*%/gi,
      vpd: /vpd[\s:]*(\d+\.?\d*)/gi,
      inside: /inside[\s:]*(\d+\.?\d*)/gi,
      outside: /outside[\s:]*(\d+\.?\d*)/gi
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const matches = [...text.matchAll(pattern)];
      
      matches.forEach(match => {
        const value = parseFloat(match[1]);
        
        switch (key) {
          case 'temperature':
            if (value >= 15 && value <= 50 && !result.temperature) {
              result.temperature = value;
            }
            break;
          case 'humidity':
            if (value >= 30 && value <= 100 && !result.humidity) {
              result.humidity = value;
            }
            break;
          case 'vpd':
            if (value >= 0.1 && value <= 3.0) result.vpd = value;
            break;
        }
      });
    });

    return result;
  }

  /**
   * Mars Hydro specific parsing
   */
  parseMarsHydroData(text) {
    const result = {
      temperature: null,
      humidity: null,
      vpd: null,
      ph: null,
      co2: null,
      ppfd: null
    };

    // Mars Hydro Controller 43 patterns
    const patterns = {
      temperature: /(?:temp|temperature)[\s:]*(\d+\.?\d*)/gi,
      humidity: /(?:humidity|rh)[\s:]*(\d+\.?\d*)/gi,
      vpd: /vpd[\s:]*(\d+\.?\d*)/gi,
      co2: /co2[\s:]*(\d+)/gi,
      ppfd: /ppfd[\s:]*(\d+)/gi,
      alert: /(?:alert|warning|alarm)/gi
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = pattern.exec(text);
      if (match && key !== 'alert') {
        const value = parseFloat(match[1]);
        
        switch (key) {
          case 'temperature':
            if (value >= 15 && value <= 50) result.temperature = value;
            break;
          case 'humidity':
            if (value >= 30 && value <= 100) result.humidity = value;
            break;
          case 'vpd':
            if (value >= 0.1 && value <= 3.0) result.vpd = value;
            break;
          case 'co2':
            if (value >= 300 && value <= 2000) result.co2 = value;
            break;
          case 'ppfd':
            if (value >= 0 && value <= 2000) result.ppfd = value;
            break;
        }
      }
    });

    return result;
  }

  /**
   * Generic parsing for unknown brands
   */
  parseGenericData(text) {
    const result = {
      temperature: null,
      humidity: null,
      vpd: null,
      ph: null,
      co2: null,
      ppfd: null
    };

    // Extract all numbers with context
    const numberMatches = [...text.matchAll(/(\d+\.?\d*)\s*([°cfhkpa%]+)/gi)];
    
    numberMatches.forEach(match => {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('°') || unit.includes('c') || unit.includes('f')) {
        if (value >= 15 && value <= 50 && !result.temperature) {
          result.temperature = value;
        }
      } else if (unit.includes('%')) {
        if (value >= 30 && value <= 100 && !result.humidity) {
          result.humidity = value;
        }
      } else if (unit.includes('kpa')) {
        if (value >= 0.1 && value <= 3.0) {
          result.vpd = value;
        }
      }
    });

    return result;
  }

  /**
   * Calculate confidence score based on extracted data
   */
  calculateConfidence(data) {
    let score = 0;
    let maxScore = 0;
    
    const checks = [
      { key: 'temperature', weight: 30, min: 15, max: 50 },
      { key: 'humidity', weight: 30, min: 30, max: 100 },
      { key: 'vpd', weight: 25, min: 0.1, max: 3.0 },
      { key: 'ph', weight: 10, min: 4.0, max: 8.0 },
      { key: 'co2', weight: 5, min: 300, max: 2000 }
    ];
    
    checks.forEach(check => {
      maxScore += check.weight;
      if (data[check.key] !== null) {
        const value = data[check.key];
        if (value >= check.min && value <= check.max) {
          score += check.weight;
        }
      }
    });
    
    return Math.round((score / maxScore) * 100);
  }
}

module.exports = SuryaOCRService; 
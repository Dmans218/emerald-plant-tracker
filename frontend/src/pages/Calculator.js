import React, { useState, useEffect } from 'react';
import { Calculator, Beaker, Droplets, TrendingUp, Info, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const NutrientCalculator = () => {
  const [selectedBrand, setSelectedBrand] = useState('general-hydroponics');
  const [growthStage, setGrowthStage] = useState('vegetative');
  const [tankSize, setTankSize] = useState(50);
  const [waterType, setWaterType] = useState('soft');
  const [growMedium, setGrowMedium] = useState('hydro');
  const [feedingStrength, setFeedingStrength] = useState('medium');
  const [wateringMethod, setWateringMethod] = useState('hand-watering');
  const [calculations, setCalculations] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Set smart defaults on component mount
  useEffect(() => {
    // Default to vegetative with medium strength (good starting point)
    if (growthStage === 'vegetative' && feedingStrength === 'medium') {
      // Already optimal, no change needed
    }
  }, [growthStage, feedingStrength]);

  // Smart handlers for interconnected growth stage and feeding strength
  const handleGrowthStageChange = (newStage) => {
    setGrowthStage(newStage);
    
    // Auto-adjust feeding strength based on growth stage
    if (newStage === 'vegetative') {
      // Vegetative: prefer light to medium feeding
      if (feedingStrength === 'aggressive') {
        setFeedingStrength('medium');
        toast.success('🌱 Adjusted to medium strength for vegetative stage');
      }
    } else if (newStage === 'flowering') {
      // Flowering: prefer medium to aggressive feeding
      if (feedingStrength === 'light') {
        setFeedingStrength('medium');
        toast.success('🌸 Adjusted to medium strength for flowering stage');
      }
    }
  };

  const handleFeedingStrengthChange = (newStrength) => {
    setFeedingStrength(newStrength);
    
    // Suggest appropriate growth stage based on feeding strength
    if (newStrength === 'light' && growthStage === 'flowering') {
      toast('💡 Light feeding is typically used in vegetative stage', {
        icon: '💡',
        duration: 3000
      });
    } else if (newStrength === 'aggressive' && growthStage === 'vegetative') {
      toast('💡 Aggressive feeding is typically used in flowering stage', {
        icon: '💡',
        duration: 3000
      });
    }
  };

  // Nutrient brand data based on research
  const nutrientBrands = {
    'general-hydroponics': {
      name: 'General Hydroponics FloraSeries',
      description: 'The O.G. 3-Part Hydroponic-Based Nutrient System',
      products: {
        vegetative: [
          { name: 'FloraMicro', ratio: 5.0, unit: 'ml/gal' },  // Official GH: 1-2 tsp/gal = 5-10ml/gal, using medium
          { name: 'FloraGro', ratio: 7.5, unit: 'ml/gal' },   // Official GH: 1-3 tsp/gal = 5-15ml/gal, using medium
          { name: 'FloraBloom', ratio: 2.5, unit: 'ml/gal' }  // Official GH: 1 tsp/gal = 5ml/gal, reduced for veg
        ],
        flowering: [
          { name: 'FloraMicro', ratio: 7.5, unit: 'ml/gal' }, // Official GH: 2 tsp/gal = 10ml/gal, adjusted
          { name: 'FloraGro', ratio: 2.5, unit: 'ml/gal' },  // Official GH: 1-2 tsp/gal = 5-10ml/gal, using lower
          { name: 'FloraBloom', ratio: 10.0, unit: 'ml/gal' } // Official GH: 2-3 tsp/gal = 10-15ml/gal, using medium
        ],
        supplements: [
          { name: 'CaliMagic', ratio: 2.5, unit: 'ml/gal', optional: true },    // 0.5 tsp/gal = 2.5ml/gal
          { name: 'Armor Si', ratio: 1.25, unit: 'ml/gal', optional: true },    // 0.25 tsp/gal = 1.25ml/gal
          { name: 'Hydroguard', ratio: 5.0, unit: 'ml/gal', hydroOnly: true }   // 1 tsp/gal = 5ml/gal
        ]
      },
      strengthMultipliers: {
        light: 0.5,
        medium: 0.75,
        aggressive: 1.0
      }
    },
    'advanced-nutrients': {
      name: 'Advanced Nutrients pH Perfect GMB',
      description: 'pH Perfect Technology for Cannabis - Micro/Grow/Bloom',
      products: {
        vegetative: [
          { name: 'pH Perfect Micro', ratio: 4.0, unit: 'ml/L' },  // Official AN: 4ml/L each component
          { name: 'pH Perfect Grow', ratio: 4.0, unit: 'ml/L' },   // Official AN: 4ml/L each component
          { name: 'pH Perfect Bloom', ratio: 4.0, unit: 'ml/L' }   // Official AN: 4ml/L each component
        ],
        flowering: [
          { name: 'pH Perfect Micro', ratio: 4.0, unit: 'ml/L' },  // Official AN: 4ml/L each component
          { name: 'pH Perfect Grow', ratio: 4.0, unit: 'ml/L' },   // Official AN: 4ml/L each component 
          { name: 'pH Perfect Bloom', ratio: 4.0, unit: 'ml/L' }   // Official AN: 4ml/L each component
        ],
        supplements: [
          { name: 'Voodoo Juice', ratio: 2.0, unit: 'ml/L', optional: true },                        // Standard AN supplement ratio
          { name: 'Big Bud', ratio: 2.0, unit: 'ml/L', optional: true, floweringOnly: true },        // Standard AN supplement ratio
          { name: 'Overdrive', ratio: 2.0, unit: 'ml/L', optional: true, floweringOnly: true },      // Standard AN supplement ratio
          { name: 'B-52', ratio: 2.0, unit: 'ml/L', optional: true },                               // Standard AN supplement ratio
          { name: 'Bud Candy', ratio: 2.0, unit: 'ml/L', optional: true, floweringOnly: true }      // Standard AN supplement ratio
        ]
      },
      strengthMultipliers: {
        light: 0.5,
        medium: 0.75,
        aggressive: 1.0
      }
    },
    'fox-farm': {
      name: 'Fox Farm Trio',
      description: 'Natural & Organic Based Plant Food',
      products: {
        vegetative: [
          { name: 'Grow Big', ratio: 1.0, unit: 'tsp/gal' },
          { name: 'Big Bloom', ratio: 2.0, unit: 'tsp/gal' }
        ],
        flowering: [
          { name: 'Tiger Bloom', ratio: 1.0, unit: 'tsp/gal' },
          { name: 'Big Bloom', ratio: 2.0, unit: 'tsp/gal' }
        ],
        supplements: [
          { name: 'Cal-Mag', ratio: 1.0, unit: 'tsp/gal', optional: true }
        ]
      },
      strengthMultipliers: {
        light: 0.5,
        medium: 0.75,
        aggressive: 1.0
      }
    },
    'canna': {
      name: 'Canna Coco',
      description: 'Specifically designed for Coco Coir',
      products: {
        vegetative: [
          { name: 'Canna Coco A', ratio: 4.0, unit: 'ml/L' },  // Official CANNA: 40ml/10L = 4ml/L base dosage
          { name: 'Canna Coco B', ratio: 4.0, unit: 'ml/L' }   // Official CANNA: 40ml/10L = 4ml/L base dosage
        ],
        flowering: [
          { name: 'Canna Coco A', ratio: 4.0, unit: 'ml/L' },  // Official CANNA: same for veg and flower
          { name: 'Canna Coco B', ratio: 4.0, unit: 'ml/L' }   // Official CANNA: same for veg and flower
        ],
        supplements: [
          { name: 'Rhizotonic', ratio: 4.0, unit: 'ml/L', optional: true },    // Official CANNA: 40ml/10L
          { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },      // Official CANNA: 25ml/10L
          { name: 'Cannaboost', ratio: 2.0, unit: 'ml/L', optional: true },    // Official CANNA: 20ml/10L
          { name: 'PK 13/14', ratio: 1.5, unit: 'ml/L', optional: true, floweringOnly: true }  // Official CANNA: 15ml/10L in flower
        ]
      },
      strengthMultipliers: {
        light: 0.6,
        medium: 0.8,
        aggressive: 1.0
      }
    },
    'jack-nutrients': {
      name: 'Jack\'s Nutrients 321',
      description: 'Professional Dry Nutrients - Ultra Concentrated',
      products: {
        vegetative: [
          { name: 'Jack\'s 5-12-26', ratio: 3.6, unit: 'g/gal' },
          { name: 'Epsom Salt', ratio: 1.2, unit: 'g/gal' },
          { name: 'Calcium Nitrate', ratio: 2.4, unit: 'g/gal' }
        ],
        flowering: [
          { name: 'Jack\'s 5-12-26', ratio: 3.6, unit: 'g/gal' },
          { name: 'Epsom Salt', ratio: 1.2, unit: 'g/gal' },
          { name: 'Calcium Nitrate', ratio: 2.4, unit: 'g/gal' }
        ],
        supplements: [
          { name: 'Jack\'s Bloom 10-30-20', ratio: 3.5, unit: 'g/gal', optional: true, floweringOnly: true }
        ]
      },
      strengthMultipliers: {
        light: 0.5,
        medium: 0.8,
        aggressive: 1.0
      }
    },
    'megacrop': {
      name: 'MegaCrop by Greenleaf',
      description: 'All-in-One Complete Nutrient - Seed to Harvest',
      products: {
        vegetative: [
          { name: 'MegaCrop', ratio: 5.0, unit: 'g/gal' }
        ],
        flowering: [
          { name: 'MegaCrop', ratio: 6.0, unit: 'g/gal' }
        ],
        supplements: [
          { name: 'Bud Explosion PK', ratio: 1.0, unit: 'g/gal', optional: true, floweringOnly: true },
          { name: 'Sweet Candy', ratio: 0.5, unit: 'g/gal', optional: true },
          { name: 'CalMag Pro', ratio: 1.0, unit: 'g/gal', optional: true }
        ]
      },
      strengthMultipliers: {
        light: 0.7,
        medium: 0.85,
        aggressive: 1.0
      }
    },
    'botanicare': {
      name: 'Botanicare Pure Blend Pro',
      description: 'Premium Natural & Organic Based Nutrients',
      products: {
        vegetative: [
          { name: 'Pure Blend Pro Grow', ratio: 1.0, unit: 'tsp/gal' }
        ],
        flowering: [
          { name: 'Pure Blend Pro Bloom', ratio: 1.0, unit: 'tsp/gal' }
        ],
        supplements: [
          { name: 'Cal-Mag Plus', ratio: 1.0, unit: 'tsp/gal', optional: true },
          { name: 'Hydroguard', ratio: 2.0, unit: 'ml/L', hydroOnly: true }
        ]
      },
      strengthMultipliers: {
        light: 0.5,
        medium: 0.75,
        aggressive: 1.0
      }
    },
    'dyna-gro': {
      name: 'Dyna-Gro Foliage Pro + Bloom',
      description: 'Simple 2-Part System - Originally for Orchids',
      products: {
        vegetative: [
          { name: 'Foliage Pro 9-3-6', ratio: 1.0, unit: 'tsp/gal' }
        ],
        flowering: [
          { name: 'Bloom 3-12-6', ratio: 1.0, unit: 'tsp/gal' }
        ],
        supplements: [
          { name: 'Pro-TeKt (Silica)', ratio: 0.5, unit: 'tsp/gal', optional: true }
        ]
      },
      strengthMultipliers: {
        light: 0.5,
        medium: 0.75,
        aggressive: 1.0
      }
    },
    'house-garden': {
      name: 'House & Garden Aqua Flakes',
      description: 'Premium Dutch Nutrients - Tested on Cannabis',
      products: {
        vegetative: [
          { name: 'Aqua Flakes A', ratio: 2.7, unit: 'ml/L' },
          { name: 'Aqua Flakes B', ratio: 2.7, unit: 'ml/L' }
        ],
        flowering: [
          { name: 'Aqua Flakes A', ratio: 2.7, unit: 'ml/L' },
          { name: 'Aqua Flakes B', ratio: 2.7, unit: 'ml/L' }
        ],
        supplements: [
          { name: 'Roots Excelurator', ratio: 1.1, unit: 'ml/L', optional: true },
          { name: 'Bud XL', ratio: 1.0, unit: 'ml/L', optional: true, floweringOnly: true },
          { name: 'Shooting Powder', ratio: 65.0, unit: 'mg/L', optional: true, floweringOnly: true }
        ]
      },
      strengthMultipliers: {
        light: 0.6,
        medium: 0.8,
        aggressive: 1.0
      }
    },
    'nectar-gods': {
      name: 'Nectar for the Gods',
      description: 'Calcium-Based Organic Nutrient Line',
      products: {
        vegetative: [
          { name: 'Medusa\'s Magic', ratio: 2.0, unit: 'tsp/gal' },
          { name: 'Gaia Mania', ratio: 1.0, unit: 'tsp/gal' }
        ],
        flowering: [
          { name: 'Medusa\'s Magic', ratio: 2.0, unit: 'tsp/gal' },
          { name: 'Herculean Harvest', ratio: 1.0, unit: 'tsp/gal' }
        ],
        supplements: [
          { name: 'Zeus Juice', ratio: 1.0, unit: 'tsp/gal', optional: true }
        ]
      },
      strengthMultipliers: {
        light: 0.5,
        medium: 0.75,
        aggressive: 1.0
      }
    }
  };

  const calculateNutrients = () => {
    const brand = nutrientBrands[selectedBrand];
    const products = brand.products[growthStage];
    const supplements = brand.products.supplements;
    let multiplier = brand.strengthMultipliers[feedingStrength];
    
    // Apply watering method adjustments
    const wateringAdjustments = {
      'hand-watering': 1.0,      // Standard concentration
      'drip-irrigation': 0.8,    // Reduce to prevent clogging and salt buildup
      'bottom-wicking': 0.7,     // Lower concentration for passive uptake
      'recirculating': 0.9,      // Slightly reduced for system stability
      'flood-drain': 1.0,        // Standard concentration like hand watering
      'aeroponic': 0.6          // Much lower for misting systems
    };
    
    multiplier *= wateringAdjustments[wateringMethod] || 1.0;
    
    // Convert tank size to appropriate units
    const tankVolume = tankSize; // Already in liters
    
    const calculations = {
      tankSize: tankSize,
      brand: brand.name,
      stage: growthStage,
      strength: feedingStrength,
      wateringMethod: wateringMethod,
      baseNutrients: [],
      supplements: [],
      totalCost: 0,
      instructions: []
    };

    // Calculate base nutrients
    products.forEach(product => {
      let amount = product.ratio * multiplier;
      
      if (product.unit === 'tsp/gal') {
        // Convert teaspoons per gallon to ml per tank
        // 1 tsp = 4.92892 ml, 1 gallon = 3.78541 L
        amount = (amount * 4.92892 * tankVolume) / 3.78541;
        calculations.baseNutrients.push({
          name: product.name,
          amount: Math.round(amount * 10) / 10,
          unit: 'ml',
          originalRatio: product.ratio,
          originalUnit: product.unit
        });
      } else if (product.unit === 'g/gal') {
        // Convert grams per gallon to grams per tank
        // 1 gallon = 3.78541 L
        amount = (amount * tankVolume) / 3.78541;
        calculations.baseNutrients.push({
          name: product.name,
          amount: Math.round(amount * 10) / 10,
          unit: 'g',
          originalRatio: product.ratio,
          originalUnit: product.unit
        });
      } else if (product.unit === 'mg/L') {
        // Convert mg/L to mg per tank
        amount = amount * tankVolume;
        calculations.baseNutrients.push({
          name: product.name,
          amount: Math.round(amount * 10) / 10,
          unit: 'mg',
          originalRatio: product.ratio,
          originalUnit: product.unit
        });
      } else {
        // ml/L - multiply by tank volume
        amount = amount * tankVolume;
        calculations.baseNutrients.push({
          name: product.name,
          amount: Math.round(amount * 10) / 10,
          unit: 'ml',
          originalRatio: product.ratio,
          originalUnit: product.unit
        });
      }
    });

              // Calculate supplements
     supplements.forEach(supplement => {
       if (supplement.hydroOnly && growMedium !== 'hydro' && growMedium !== 'soilless') return;
       if (supplement.floweringOnly && growthStage !== 'flowering') return;
       
       // Handle CalMag based on water type
       let isCalMag = supplement.name.toLowerCase().includes('cal') || 
                      supplement.name.toLowerCase().includes('mag') ||
                      supplement.name.toLowerCase().includes('calimagic');
       
       let amount = supplement.ratio * multiplier;
       let adjustedOptional = supplement.optional;
       
       // Adjust CalMag recommendations based on water type
       if (isCalMag) {
         if (waterType === 'hard') {
           adjustedOptional = true; // Make it optional for hard water
         } else if (waterType === 'soft') {
           adjustedOptional = false; // Make it recommended for soft/RO water
         }
       }
       
       let unit = 'ml';
       if (supplement.unit === 'tsp/gal') {
         amount = (amount * 4.92892 * tankVolume) / 3.78541;
         unit = 'ml';
       } else if (supplement.unit === 'g/gal') {
         amount = (amount * tankVolume) / 3.78541;
         unit = 'g';
       } else if (supplement.unit === 'mg/L') {
         amount = amount * tankVolume;
         unit = 'mg';
       } else {
         amount = amount * tankVolume;
         unit = 'ml';
       }
       
       calculations.supplements.push({
         name: supplement.name,
         amount: Math.round(amount * 10) / 10,
         unit: unit,
         optional: adjustedOptional,
         originalRatio: supplement.ratio,
         originalUnit: supplement.unit,
         waterTypeNote: isCalMag ? (waterType === 'soft' ? 'Essential for RO/soft water' : 'May not be needed - test your tap water first') : null
       });
     });

    // Add mixing instructions
    calculations.instructions = [
      "1. Start with clean, pH-adjusted water in your tank",
      "2. Add nutrients in the order listed (important for some brands)",
      "3. Mix thoroughly between each addition",
      "4. Check and adjust pH to 5.5-6.5 for hydro/coco/soilless, 6.0-7.0 for soil",
      "5. Check PPM/EC levels and adjust if needed",
      "6. Use within 7-10 days for best results"
    ];

    // Add watering method specific instructions
    const wateringInstructions = {
      'hand-watering': [
        "7. Water slowly and evenly until runoff appears",
        "8. Allow proper wet/dry cycle between waterings"
      ],
      'drip-irrigation': [
        "7. Check emitters regularly for clogs (use filtered solution)",
        "8. Run system for shorter, more frequent cycles",
        "9. Monitor EC buildup in medium over time"
      ],
      'bottom-wicking': [
        "7. Fill reservoir and allow plants to uptake slowly",
        "8. Top-water occasionally to prevent salt accumulation",
        "9. Monitor water level and refill as needed"
      ],
      'recirculating': [
        "7. Monitor solution EC/pH daily, adjust as needed",
        "8. Change reservoir completely every 7-10 days",
        "9. Keep solution temperature 65-68°F (18-20°C)"
      ],
      'flood-drain': [
        "7. Flood for 15-30 minutes, then drain completely",
        "8. Ensure good air gaps for root oxygenation",
        "9. Run 2-4 cycles per day depending on medium"
      ],
      'aeroponic': [
        "7. Use fine spray nozzles (avoid clogging)",
        "8. Run misting cycles every 15-30 minutes",
        "9. Keep solution temperature cool and well-oxygenated"
      ]
    };

    if (wateringInstructions[wateringMethod]) {
      calculations.instructions.push(...wateringInstructions[wateringMethod]);
    }

    if (selectedBrand === 'general-hydroponics') {
      calculations.instructions.splice(1, 1, 
        "2. Add in order: Armor Si first (if using), then CaliMagic, then FloraMicro, FloraGro, FloraBloom"
      );
    } else if (selectedBrand === 'advanced-nutrients') {
      calculations.instructions.splice(1, 1, 
        "2. Add in order: pH Perfect Micro first, then Grow, then Bloom (pH adjusts automatically)"
      );
    } else if (selectedBrand === 'jack-nutrients') {
      calculations.instructions.splice(1, 1, 
        "2. Add dry nutrients in order: 5-12-26 first, then Epsom Salt, then Calcium Nitrate",
        "3. Mix each thoroughly before adding the next (prevents precipitation)"
      );
    } else if (selectedBrand === 'megacrop') {
      calculations.instructions.splice(1, 1, 
        "2. Add MegaCrop slowly while stirring (white clumps will dissolve in 12 hours)"
      );
    } else if (selectedBrand === 'house-garden') {
      calculations.instructions.splice(1, 1, 
        "2. Add in order: Part A first, mix well, then Part B (never mix concentrates directly)"
      );
    }

    setCalculations(calculations);
  };

  const copyToClipboard = () => {
    if (!calculations) return;
    
    let text = `🧪 Nutrient Recipe - ${calculations.brand}\n`;
    text += `📊 Tank Size: ${calculations.tankSize}L\n`;
    text += `🌱 Stage: ${calculations.stage}\n`;
    text += `💪 Strength: ${calculations.strength}\n`;
    text += `🚿 Watering: ${calculations.wateringMethod.replace('-', ' ')}\n\n`;
    
    text += `Base Nutrients:\n`;
    calculations.baseNutrients.forEach(nutrient => {
      text += `• ${nutrient.name}: ${nutrient.amount}${nutrient.unit}\n`;
    });
    
    if (calculations.supplements.length > 0) {
      text += `\nSupplements:\n`;
      calculations.supplements.forEach(supplement => {
        text += `• ${supplement.name}: ${supplement.amount}${supplement.unit} ${supplement.optional ? '(optional)' : ''}\n`;
      });
    }
    
    text += `\nInstructions:\n`;
    calculations.instructions.forEach(instruction => {
      text += `${instruction}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedToClipboard(true);
    toast.success('Recipe copied to clipboard!');
    setTimeout(() => setCopiedToClipboard(false), 3000);
  };

  useEffect(() => {
    calculateNutrients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, growthStage, tankSize, waterType, growMedium, feedingStrength, wateringMethod]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🧪 Cannabis Nutrient Calculator</h1>
          <p className="text-gray-600 mt-1">Calculate precise nutrient mixing ratios for your grow</p>
        </div>
        {calculations && (
          <button
            onClick={copyToClipboard}
            className="btn btn-secondary"
            title="Copy recipe to clipboard"
          >
            {copiedToClipboard ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Copy Recipe
          </button>
        )}
      </div>

      {/* Quick Reference - Moved to Top */}
      <div className="card quick-reference-card mb-6">
        <h2 className="section-title">📚 Quick Reference</h2>
        <div className="quick-reference-grid">
          <div className="quick-reference-section">
            <div className="quick-reference-header">
              <span className="quick-reference-icon">🌱</span>
              <span className="quick-reference-title">Growth Stages</span>
            </div>
            <div className="quick-reference-list">
              <div>🌿 <strong>Vegetative:</strong> Higher N, Light-Medium strength</div>
              <div>🌸 <strong>Flowering:</strong> Higher P&K, Medium-Aggressive strength</div>
            </div>
          </div>
          <div className="quick-reference-section">
            <div className="quick-reference-header">
              <span className="quick-reference-icon">💧</span>
              <span className="quick-reference-title">PPM Guidelines</span>
            </div>
            <div className="quick-reference-list">
              <div>🌿 Light: 300-600 PPM</div>
              <div>🌱 Medium: 600-1200 PPM</div>
              <div>💪 Aggressive: 1200-1600 PPM</div>
            </div>
          </div>
          <div className="quick-reference-section">
            <div className="quick-reference-header">
              <span className="quick-reference-icon">🧪</span>
              <span className="quick-reference-title">pH Ranges</span>
            </div>
            <div className="quick-reference-list">
              <div>💧 Hydro/Coco: 5.5-6.5</div>
              <div>🌾 Soilless: 5.5-6.5</div>
              <div>🌍 Soil: 6.0-7.0</div>
            </div>
          </div>
          <div className="quick-reference-section">
            <div className="quick-reference-header">
              <span className="quick-reference-icon">🚿</span>
              <span className="quick-reference-title">Watering Method</span>
            </div>
            <div className="quick-reference-list">
              <div>🪣 Hand: Standard (100%)</div>
              <div>💧 Drip: Reduced (80%)</div>
              <div>⬆️ Wicking: Lower (70%)</div>
              <div>💨 Aero: Very Low (60%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Settings */}
      <div className="card mb-6">
        <h2 className="section-title flex items-center gap-2 mb-2">
          <Calculator className="w-6 h-6 text-primary" /> Calculator Settings
        </h2>
        <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
          <span className="font-semibold text-yellow-400">Smart Feeding Guide</span>
          <Info className="w-4 h-4 text-yellow-400" />
          <span>
            Growth stage and feeding strength work together. The calculator automatically adjusts recommendations:
            <span className="block text-xs text-gray-500 mt-1">
              <b>Vegetative:</b> Light to Medium strength (avoid aggressive feeding)
              <span className="mx-2">|</span>
              <b>Flowering:</b> Medium to Aggressive strength (avoid light feeding for optimal yields)
            </span>
          </span>
        </div>
        <div className="grid grid-2 gap-4 mb-0">
          {/* Nutrient Brand */}
          <div className="form-group">
            <label className="label">Nutrient Brand</label>
            <select
              className="select"
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
            >
              {Object.entries(nutrientBrands).map(([key, brand]) => (
                <option key={key} value={key}>{brand.name}</option>
              ))}
            </select>
            <span className="text-xs text-gray-500 mt-1 block">{nutrientBrands[selectedBrand].description}</span>
          </div>
          {/* Growth Stage */}
          <div className="form-group">
            <label className="label">Growth Stage</label>
            <select
              className="select"
              value={growthStage}
              onChange={e => handleGrowthStageChange(e.target.value)}
            >
              <option value="vegetative">🌱 Vegetative</option>
              <option value="flowering">🌸 Flowering</option>
            </select>
            <span className="text-xs text-gray-500 mt-1 block">
              {growthStage === 'vegetative' ? 'Typically uses light to medium feeding strength' : 'Medium to aggressive feeding for optimal yields'}
            </span>
          </div>
          {/* Watering Method (moved up) */}
          <div className="form-group">
            <label className="label">Watering Method</label>
            <select
              className="select"
              value={wateringMethod}
              onChange={e => setWateringMethod(e.target.value)}
            >
              <option value="hand-watering">🪣 Hand Watering</option>
              <option value="drip-irrigation">💧 Drip Irrigation</option>
              <option value="bottom-wicking">⬆️ Bottom Wicking</option>
              <option value="recirculating">🔄 Recirculating DWC/RDWC</option>
              <option value="flood-drain">🌊 Flood & Drain (Ebb & Flow)</option>
              <option value="aeroponic">💨 Aeroponic</option>
            </select>
            <span className="text-xs text-gray-500 mt-1 block">
              {wateringMethod === 'hand-watering' && '🪣 Standard watering with can or hose'}
              {wateringMethod === 'drip-irrigation' && '💧 Automated drip lines - lower concentration'}
              {wateringMethod === 'bottom-wicking' && '⬆️ Passive uptake - reduced strength'}
              {wateringMethod === 'recirculating' && '🔄 Continuous circulation - stable concentration'}
              {wateringMethod === 'flood-drain' && '🌊 Periodic flooding - standard strength'}
              {wateringMethod === 'aeroponic' && '💨 Misting system - very low concentration'}
            </span>
          </div>
          {/* Feeding Strength */}
          <div className="form-group">
            <label className="label">Feeding Strength</label>
            <select
              className={`select ${
                (feedingStrength === 'light' && growthStage === 'flowering') ||
                (feedingStrength === 'aggressive' && growthStage === 'vegetative')
                  ? 'border-amber-300 bg-amber-50'
                  : ''
              }`}
              value={feedingStrength}
              onChange={e => handleFeedingStrengthChange(e.target.value)}
            >
              <option value="light">🌿 Light (50% strength)</option>
              <option value="medium">🌱 Medium (75% strength)</option>
              <option value="aggressive">💪 Aggressive (100% strength)</option>
            </select>
            <span className={`text-xs mt-1 block ${
              (feedingStrength === 'light' && growthStage === 'flowering') ||
              (feedingStrength === 'aggressive' && growthStage === 'vegetative')
                ? 'text-amber-600'
                : 'text-gray-500'
            }`}>
              {feedingStrength === 'light' && growthStage === 'vegetative' && '🌿 Perfect for early vegetative growth'}
              {feedingStrength === 'light' && growthStage === 'flowering' && '⚠️ Light feeding might limit flowering potential'}
              {feedingStrength === 'medium' && '🌱 Balanced strength - good for most plants'}
              {feedingStrength === 'aggressive' && growthStage === 'flowering' && '💪 Maximum strength for heavy feeding flowering plants'}
              {feedingStrength === 'aggressive' && growthStage === 'vegetative' && '⚠️ High strength - monitor for nutrient burn'}
            </span>
          </div>
          {/* Grow Medium */}
          <div className="form-group">
            <label className="label">Grow Medium</label>
            <select
              className="select"
              value={growMedium}
              onChange={e => setGrowMedium(e.target.value)}
            >
              <option value="hydro">💧 Hydroponic/DWC</option>
              <option value="soilless">🌾 Soilless/Peat (ASB WP420, Pro-Mix, etc.)</option>
              <option value="coco">🥥 Coco Coir</option>
              <option value="soil">🌍 Soil</option>
            </select>
          </div>
          {/* Water Type */}
          <div className="form-group">
            <label className="label">Water Type</label>
            <select
              className="select"
              value={waterType}
              onChange={e => setWaterType(e.target.value)}
            >
              <option value="soft">💧 Soft Water (RO/Distilled)</option>
              <option value="hard">🪨 Hard Water (Tap)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {calculations && (
        <div className="space-y-6">
          {/* Recipe Card */}
          <div className="card">
            <h2 className="section-title">📋 Your Nutrient Recipe</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Beaker className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">
                  {calculations.brand} - {calculations.stage} stage
                </h3>
              </div>
              {/* Tank Size input - now inline and compact */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-700">Tank Size (Liters):</span>
                <input
                  type="number"
                  className="input"
                  style={{ maxWidth: '120px', minWidth: '80px' }}
                  value={tankSize}
                  onChange={e => setTankSize(parseFloat(e.target.value) || 50)}
                  min="1"
                  max="1000"
                  step="1"
                  placeholder="Liters"
                  aria-label="Tank Size (Liters)"
                />
                <span className="text-sm text-gray-500">L</span>
                <span className="ml-4 text-green-700">
                  at {calculations.strength} strength
                </span>
              </div>
              {wateringMethod !== 'hand-watering' && (
                <span className="block text-sm mt-1">
                  📊 Adjusted for {wateringMethod.replace('-', ' ')} system
                </span>
              )}
            </div>

            {/* Base Nutrients */}
            <div className="mb-7">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Base Nutrients (Required)
              </h3>
              <div className="nutrient-list">
                {calculations.baseNutrients.map((nutrient, index) => (
                  <div key={index} className="nutrient-list-row">
                    <span className="nutrient-list-name">{nutrient.name}</span>
                    <span className="nutrient-list-amount">{nutrient.amount} {nutrient.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplements */}
            {calculations.supplements.length > 0 && (
              <div className="mb-7">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-purple-500" />
                  Supplements {calculations.supplements.some(s => s.optional) && '(Optional)'}
                </h3>
                <div className="nutrient-list">
                  {calculations.supplements.map((supplement, index) => (
                    <div key={index} className="nutrient-list-row">
                      <span className={`nutrient-list-name ${supplement.optional ? 'text-purple-700' : 'text-orange-700'}`}>{supplement.name} {supplement.optional && '(Optional)'}</span>
                      <span className={`nutrient-list-amount ${supplement.optional ? 'text-purple-600' : 'text-orange-600'}`}>{supplement.amount} {supplement.unit}</span>
                    </div>
                  ))}
                </div>
                {calculations.supplements.some(s => s.waterTypeNote) && (
                  <div className="text-xs text-gray-600 mt-2 ml-1">
                    {calculations.supplements.filter(s => s.waterTypeNote).map((s, i) => (
                      <div key={i}>💧 {s.name}: {s.waterTypeNote}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="mb-7">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-500" />
                Mixing Instructions
              </h3>
              <div className="space-y-2">
                {calculations.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3 p-2">
                    <span className="text-amber-600 font-bold text-sm">{index + 1}</span>
                    <span className="text-gray-700">{instruction.replace(/^[0-9]+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Always start with lower concentrations and increase gradually</li>
                <li>• Monitor plants for signs of nutrient burn or deficiency</li>
                <li>• Hard tap water: CalMag may not be needed - test your water first</li>
                <li>• Soft/RO water: CalMag often essential to replace missing minerals</li>
                <li>• Dry nutrients: Mix slowly to prevent clumping</li>
                <li>• Change nutrient solution every 7-14 days</li>
              </ul>
            </div>
          </div>


        </div>
      )}
    </div>
  );
};

export default NutrientCalculator; 
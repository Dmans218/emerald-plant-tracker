import { Beaker, Calculator, CheckCircle, Copy, FlaskConical, Info } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { nutrientsAPI } from '../utils/api';

const NutrientCalculator = () => {
  // Load saved preferences from localStorage or use defaults
  const loadPreference = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`nutrientCalculator_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [selectedBrand, setSelectedBrand] = useState(() =>
    loadPreference('selectedBrand', 'general-hydroponics')
  );
  const [growthStage, setGrowthStage] = useState(() => loadPreference('growthStage', 'vegetative'));
  const [tankSize, setTankSize] = useState(() => loadPreference('tankSize', 50));
  const [selectedOptionals, setSelectedOptionals] = useState(() =>
    loadPreference('selectedOptionals', [])
  );
  const [growMedium, setGrowMedium] = useState(() => loadPreference('growMedium', 'hydro'));
  const [feedingStrength, setFeedingStrength] = useState(() =>
    loadPreference('feedingStrength', 'medium')
  );
  const [wateringMethod, setWateringMethod] = useState(() =>
    loadPreference('wateringMethod', 'hand-watering')
  );
  const [calculations, setCalculations] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // New state for API data
  const [nutrientBrands, setNutrientBrands] = useState({});
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for custom dropdown
  const [supplementsDropdownOpen, setSupplementsDropdownOpen] = useState(false);

  // Fetch available brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await nutrientsAPI.getBrands();
        if (response.success) {
          setAvailableBrands(response.data);
          // Load the first brand data by default
          if (response.data.length > 0) {
            const defaultBrandId =
              response.data.find(brand => brand.id === selectedBrand)?.id || response.data[0].id;
            setSelectedBrand(defaultBrandId);
          }
        } else {
          throw new Error(response.error || 'Failed to fetch brands');
        }
      } catch (err) {
        console.error('Error fetching nutrient brands:', err);
        setError('Failed to load nutrient brands. Please try refreshing the page.');
        toast.error('Failed to load nutrient brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Fetch specific brand data when selectedBrand changes
  useEffect(() => {
    const fetchBrandData = async () => {
      if (!selectedBrand || !availableBrands.length) return;

      try {
        const response = await nutrientsAPI.getBrandData(selectedBrand);
        if (response.success) {
          setNutrientBrands(prev => ({
            ...prev,
            [selectedBrand]: response.data,
          }));
        } else {
          throw new Error(response.error || 'Failed to fetch brand data');
        }
      } catch (err) {
        console.error('Error fetching brand data:', err);
        toast.error('Failed to load brand data');
      }
    };

    fetchBrandData();
  }, [selectedBrand, availableBrands]);

  // Save preferences to localStorage
  const savePreference = (key, value) => {
    try {
      localStorage.setItem(`nutrientCalculator_${key}`, JSON.stringify(value));
    } catch {
      // Failed to save preference
    }
  };

  // Set smart defaults on component mount
  useEffect(() => {
    // Default to vegetative with medium strength (good starting point)
    if (growthStage === 'vegetative' && feedingStrength === 'medium') {
      // Already optimal, no change needed
    }
  }, [growthStage, feedingStrength]);

  // Smart handlers for interconnected growth stage and feeding strength
  const handleGrowthStageChange = newStage => {
    setGrowthStage(newStage);
    savePreference('growthStage', newStage);

    // Auto-adjust feeding strength based on growth stage
    if (newStage === 'seedling') {
      // Seedlings: always use light feeding
      if (feedingStrength !== 'light') {
        setFeedingStrength('light');
        savePreference('feedingStrength', 'light');
        toast.success('🌱 Adjusted to light strength for seedling stage');
      }
    } else if (newStage === 'vegetative') {
      // Vegetative: prefer light to medium feeding
      if (feedingStrength === 'aggressive') {
        setFeedingStrength('medium');
        savePreference('feedingStrength', 'medium');
        toast.success('🌿 Adjusted to medium strength for vegetative stage');
      }
    } else if (newStage === 'flowering') {
      // Flowering: prefer medium to aggressive feeding
      if (feedingStrength === 'light') {
        setFeedingStrength('medium');
        savePreference('feedingStrength', 'medium');
        toast.success('🌸 Adjusted to medium strength for flowering stage');
      }
    }
  };

  const handleFeedingStrengthChange = newStrength => {
    setFeedingStrength(newStrength);
    savePreference('feedingStrength', newStrength);

    // Smart warnings for strength vs. growth stage mismatches
    if (newStrength === 'aggressive' && growthStage === 'seedling') {
      toast.error('⚠️ Aggressive feeding may burn seedlings. Consider light strength.');
    } else if (newStrength === 'light' && growthStage === 'flowering') {
      toast('💡 Light feeding during flowering may reduce yields. Consider medium or aggressive.');
    }
  };

  const handleBrandChange = brand => {
    setSelectedBrand(brand);
    savePreference('selectedBrand', brand);
    // Reset selected optionals when brand changes
    setSelectedOptionals([]);
    savePreference('selectedOptionals', []);
  };

  const handleTankSizeChange = size => {
    setTankSize(size);
    savePreference('tankSize', size);
  };

  const handleOptionalsChange = (optionalName, isSelected) => {
    const newOptionals = isSelected
      ? [...selectedOptionals, optionalName]
      : selectedOptionals.filter(name => name !== optionalName);

    setSelectedOptionals(newOptionals);
    savePreference('selectedOptionals', newOptionals);
  };

  const handleGrowMediumChange = medium => {
    setGrowMedium(medium);
    savePreference('growMedium', medium);
  };

  const handleWateringMethodChange = method => {
    setWateringMethod(method);
    savePreference('wateringMethod', method);
  };

  const calculateNutrients = useCallback(() => {
    const brand = nutrientBrands[selectedBrand];
    if (!brand) {
      console.log('No brand data available for calculation');
      setCalculations(null);
      return;
    }

    console.log('Calculating nutrients for:', {
      brand: brand.name,
      stage: growthStage,
      strength: feedingStrength,
      selectedOptionals,
    });

    const products = brand.products[growthStage] || [];
    const supplements = brand.products.supplements || [];
    let multiplier = brand.strengthMultipliers[feedingStrength];

    // Apply watering method adjustments using brand-specific multipliers
    const wateringMultiplier = brand.wateringMethodMultipliers?.[wateringMethod] || 1.0;
    multiplier *= wateringMultiplier;

    // Convert tank size to appropriate units
    const tankVolume = tankSize; // Already in liters

    const newCalculations = {
      tankSize: tankSize,
      brand: brand.name,
      stage: growthStage,
      strength: feedingStrength,
      wateringMethod: wateringMethod,
      baseNutrients: [],
      supplements: [],
      totalCost: 0,
      instructions: [],
      targetEC: brand.targetEC?.[growthStage]?.[feedingStrength] || null,
      targetTDS: brand.targetTDS?.[growthStage]?.[feedingStrength] || null,
    };

    // Calculate base nutrients
    products.forEach(product => {
      let amount = product.ratio * multiplier;

      if (product.unit === 'tsp/gal') {
        // Convert teaspoons per gallon to ml per tank
        // 1 tsp = 4.92892 ml, 1 gallon = 3.78541 L
        amount = (amount * 4.92892 * tankVolume) / 3.78541;
        newCalculations.baseNutrients.push({
          name: product.name,
          amount: Math.round(amount * 10) / 10,
          unit: 'ml',
          originalRatio: product.ratio,
          originalUnit: product.unit,
        });
      } else if (product.unit === 'g/gal') {
        // Convert grams per gallon to grams per tank
        // 1 gallon = 3.78541 L
        amount = (amount * tankVolume) / 3.78541;
        newCalculations.baseNutrients.push({
          name: product.name,
          amount: Math.round(amount * 10) / 10,
          unit: 'g',
          originalRatio: product.ratio,
          originalUnit: product.unit,
        });
      } else if (product.unit === 'mg/L') {
        // Convert mg/L to mg per tank
        amount = amount * tankVolume;
        newCalculations.baseNutrients.push({
          name: product.name,
          amount: Math.round(amount * 10) / 10,
          unit: 'mg',
          originalRatio: product.ratio,
          originalUnit: product.unit,
        });
      } else {
        // ml/gal - convert to ml/L first, then multiply by tank volume
        // 1 gallon = 3.78541 L
        amount = (amount * tankVolume) / 3.78541;
        newCalculations.baseNutrients.push({
          name: product.name,
          amount: Math.round(amount * 10) / 10,
          unit: 'ml',
          originalRatio: product.ratio,
          originalUnit: product.unit,
        });
      }
    });

    // Calculate supplements - ONLY include selected ones
    const preBaseSupplements = [];
    const postBaseSupplements = [];

    supplements.forEach(supplement => {
      // Skip if not selected by user
      if (!selectedOptionals.includes(supplement.name)) {
        return;
      }

      // Handle hydro-only supplements for simplified medium types
      const isHydroMedium = growMedium === 'hydro' || growMedium === 'perlite';
      if (supplement.hydroOnly && !isHydroMedium) return;
      if (supplement.floweringOnly && growthStage !== 'flowering') return;

      let amount = supplement.ratio * multiplier;

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
        // ml/gal - convert to ml/L first, then multiply by tank volume
        // 1 gallon = 3.78541 L
        amount = (amount * tankVolume) / 3.78541;
        unit = 'ml';
      }

      const supplementData = {
        name: supplement.name,
        amount: Math.round(amount * 10) / 10,
        unit: unit,
        optional: supplement.optional,
        originalRatio: supplement.ratio,
        originalUnit: supplement.unit,
        waterTypeNote: null,
      };

      // Categorize supplements based on mixing order
      const lowerName = supplement.name.toLowerCase();
      if (
        lowerName.includes('armor') ||
        lowerName.includes('silica') ||
        lowerName.includes('si') ||
        lowerName.includes('cal') ||
        lowerName.includes('mag') ||
        lowerName.includes('calimagic')
      ) {
        // Silica and CalMag go BEFORE base nutrients
        preBaseSupplements.push(supplementData);
      } else {
        // Everything else goes AFTER base nutrients
        postBaseSupplements.push(supplementData);
      }
    });

    // Store both categories
    newCalculations.preBaseSupplements = preBaseSupplements;
    newCalculations.postBaseSupplements = postBaseSupplements;
    newCalculations.supplements = [...preBaseSupplements, ...postBaseSupplements]; // Keep for backward compatibility

    // Sort pre-base supplements: Silica first, then CalMag
    newCalculations.preBaseSupplements.sort((a, b) => {
      const getMixingPriority = name => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('armor') || lowerName.includes('silica') || lowerName.includes('si'))
          return 1; // Silica first
        if (
          lowerName.includes('cal') ||
          lowerName.includes('mag') ||
          lowerName.includes('calimagic')
        )
          return 2; // CalMag second
        return 3; // Everything else
      };

      return getMixingPriority(a.name) - getMixingPriority(b.name);
    });

    // Sort post-base supplements by name for consistency
    newCalculations.postBaseSupplements.sort((a, b) => a.name.localeCompare(b.name));

    // Update combined list for backward compatibility
    newCalculations.supplements = [
      ...newCalculations.preBaseSupplements,
      ...newCalculations.postBaseSupplements,
    ];

    // Add mixing instructions
    newCalculations.instructions = [
      '1. Start with clean, pH-adjusted water in your tank',
      '2. Add nutrients in the order listed (important for some brands)',
      '3. Mix thoroughly between each addition',
      '4. Check and adjust pH to 5.5-6.5 for hydro/coco/soilless, 6.0-7.0 for soil',
      '5. Check PPM/EC levels and adjust if needed',
      '6. Use within 7-10 days for best results',
    ];

    // Add watering method specific instructions
    const wateringInstructions = {
      'hand-watering': [
        '7. Water slowly and evenly until runoff appears',
        '8. Allow proper wet/dry cycle between waterings',
      ],
      'drip-system': [
        '7. Check emitters regularly for clogs (use filtered solution)',
        '8. Run system for shorter, more frequent cycles',
        '9. Monitor EC buildup in medium over time',
      ],
      'bottom-wicking': [
        '7. Fill reservoir and allow plants to uptake slowly',
        '8. Top-water occasionally to prevent salt accumulation',
        '9. Monitor water level and refill as needed',
      ],
      'deep-water-culture': [
        '7. Monitor solution EC/pH daily, adjust as needed',
        '8. Change reservoir completely every 7-10 days',
        '9. Keep solution temperature 65-68°F (18-20°C)',
      ],
      'ebb-flow': [
        '7. Flood for 15-30 minutes, then drain completely',
        '8. Ensure good air gaps for root oxygenation',
        '9. Run 2-4 cycles per day depending on medium',
      ],
      aeroponics: [
        '7. Use fine spray nozzles (avoid clogging)',
        '8. Run misting cycles every 15-30 minutes',
        '9. Keep solution temperature cool and well-oxygenated',
      ],
    };

    if (wateringInstructions[wateringMethod]) {
      newCalculations.instructions.push(...wateringInstructions[wateringMethod]);
    }

    if (selectedBrand === 'general-hydroponics') {
      newCalculations.instructions.splice(
        1,
        1,
        '2. Add in order: Armor Si first (if using), then CaliMagic, then FloraMicro, FloraGro, FloraBloom'
      );
    } else if (selectedBrand === 'advanced-nutrients') {
      newCalculations.instructions.splice(
        1,
        1,
        '2. Add in order: pH Perfect Micro first, then Grow, then Bloom (pH adjusts automatically)'
      );
    } else if (selectedBrand === 'jack-nutrients') {
      newCalculations.instructions.splice(
        1,
        1,
        '2. Add dry nutrients in order: 5-12-26 first, then Epsom Salt, then Calcium Nitrate',
        '3. Mix each thoroughly before adding the next (prevents precipitation)'
      );
    } else if (selectedBrand === 'megacrop') {
      newCalculations.instructions.splice(
        1,
        1,
        '2. Add MegaCrop slowly while stirring (white clumps will dissolve in 12 hours)'
      );
    } else if (selectedBrand === 'house-garden') {
      newCalculations.instructions.splice(
        1,
        1,
        '2. Add in order: Part A first, mix well, then Part B (never mix concentrates directly)'
      );
    }

    console.log('Calculation result:', newCalculations);
    setCalculations(newCalculations);
  }, [
    selectedBrand,
    growthStage,
    tankSize,
    selectedOptionals,
    growMedium,
    feedingStrength,
    wateringMethod,
    nutrientBrands,
  ]);

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

  // Single useEffect to trigger calculations when dependencies change
  useEffect(() => {
    if (selectedBrand && nutrientBrands[selectedBrand]) {
      console.log('Triggering calculation for brand:', selectedBrand);
      calculateNutrients();
    }
  }, [calculateNutrients, selectedBrand, nutrientBrands]);

  // Click outside handler for supplements dropdown
  useEffect(() => {
    const handleClickOutside = event => {
      // Check if click is outside the dropdown
      if (supplementsDropdownOpen && !event.target.closest('.supplements-dropdown')) {
        setSupplementsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [supplementsDropdownOpen]);

  // Add CSS for dark dropdown options and loading spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      select option {
        background-color: #2d3748 !important;
        color: #e2e8f0 !important;
      }
      select option:hover {
        background-color: #4a5568 !important;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .supplements-dropdown {
        z-index: 999999998 !important;
        position: relative !important;
      }
      .supplements-dropdown-content {
        z-index: 999999999 !important;
        position: absolute !important;
        background: #2d3748 !important;
        border: 1px solid var(--border) !important;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4) !important;
      }
      .supplements-dropdown .stat-card {
        overflow: visible !important;
        z-index: 999999998 !important;
        position: relative !important;
      }
      /* Ensure all parent containers allow the dropdown to render above */
      .dashboard-page section {
        overflow: visible !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--primary-color)',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Loading nutrient database...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
            flexDirection: 'column',
            gap: '1rem',
            padding: '2rem',
          }}
        >
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
              maxWidth: '500px',
            }}
          >
            <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error Loading Nutrient Data</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Ultra-Modern Header */}
      <header className="dashboard-header" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">
              <Calculator
                className="w-8 h-8"
                style={{ display: 'inline-block', marginRight: '0.75rem', verticalAlign: 'middle' }}
              />
              Nutrient Calculator
            </h1>
            <p className="dashboard-subtitle">
              Calculate precise nutrient mixing ratios for your grow
            </p>
          </div>

          <div className="header-actions">
            {calculations && (
              <button
                onClick={copyToClipboard}
                className="btn btn-outline flex items-center gap-2 py-2 px-4"
                style={{ borderRadius: '8px' }}
              >
                {copiedToClipboard ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                Copy Recipe
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Quick Reference - Horizontal Card */}
      <section
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          animation: 'fadeInUp 0.8s ease-out 0.2s both',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}
        >
          <Info className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
          <h2
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            Quick Reference
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
              e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            }}
          >
            <h3
              style={{
                color: '#10b981',
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              🌱 Growth Stages
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <div>
                <strong>Vegetative:</strong> Higher N, Light-Medium strength
              </div>
              <div>
                <strong>Flowering:</strong> Higher P&K, Medium-Aggressive strength
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
            }}
          >
            <h3
              style={{
                color: '#3b82f6',
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              💧 PPM Guidelines
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <div>
                <strong>Light:</strong> 300-600 PPM
              </div>
              <div>
                <strong>Medium:</strong> 600-1200 PPM
              </div>
              <div>
                <strong>Aggressive:</strong> 1200-1600 PPM
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
              e.target.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'rgba(245, 158, 11, 0.2)';
            }}
          >
            <h3
              style={{
                color: '#f59e0b',
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              🧪 pH Ranges
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <div>
                <strong>Hydro/Coco:</strong> 5.5-6.5
              </div>
              <div>
                <strong>Soil:</strong> 6.0-7.0
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)';
            }}
          >
            <h3
              style={{
                color: '#8b5cf6',
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              🚿 Water Methods
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <div>
                <strong>Hand:</strong> Standard (100%)
              </div>
              <div>
                <strong>Drip:</strong> Reduced (80%)
              </div>
              <div>
                <strong>Aero:</strong> Very Low (60%)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Settings - 2x3 Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Calculator Settings */}
        <section
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '2rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            animation: 'fadeInUp 0.8s ease-out 0.4s both',
            position: 'relative',
            zIndex: 999999997,
            overflow: 'visible',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <Beaker className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
            <h2
              style={{
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              Calculator Settings
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              overflow: 'visible',
            }}
          >
            <div
              className="stat-card"
              style={{
                animation: 'fadeInUp 0.8s ease-out 0.1s both',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Nutrient Brand
              </label>
              <select
                value={selectedBrand}
                onChange={e => handleBrandChange(e.target.value)}
                disabled={loading || availableBrands.length === 0}
                style={{
                  width: '100%',
                  background: '#2d3748',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <option value="">Loading nutrient brands...</option>
                ) : availableBrands.length === 0 ? (
                  <option value="">No brands available</option>
                ) : (
                  availableBrands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))
                )}
              </select>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                  margin: '0.25rem 0 0 0',
                }}
              >
                {nutrientBrands[selectedBrand]?.description || 'Professional nutrient system'}
              </p>
            </div>

            <div
              className="stat-card"
              style={{
                animation: 'fadeInUp 0.8s ease-out 0.2s both',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Growth Stage
              </label>
              <select
                value={growthStage}
                onChange={e => handleGrowthStageChange(e.target.value)}
                style={{
                  width: '100%',
                  background: '#2d3748',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="seedling">🌱 Seedling</option>
                <option value="vegetative">🌿 Vegetative</option>
                <option value="flowering">🌸 Flowering</option>
              </select>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                  margin: '0.25rem 0 0 0',
                }}
              >
                {growthStage === 'seedling'
                  ? 'Very young plants - use minimal nutrients to prevent burn'
                  : growthStage === 'vegetative'
                    ? 'Focusing on leaf and stem growth - moderate feeding'
                    : growthStage === 'flowering'
                      ? 'Bud development stage - increased nutrient demand'
                      : 'Select growth stage for optimal feeding'}
              </p>
            </div>

            <div
              className="stat-card"
              style={{
                animation: 'fadeInUp 0.8s ease-out 0.3s both',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Feeding Strength
              </label>
              <select
                value={feedingStrength}
                onChange={e => handleFeedingStrengthChange(e.target.value)}
                style={{
                  width: '100%',
                  background: '#2d3748',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="light">🟢 Light (50% strength)</option>
                <option value="medium">🟡 Medium (75% strength)</option>
                <option value="aggressive">🔴 Aggressive (100% strength)</option>
              </select>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                  margin: '0.25rem 0 0 0',
                }}
              >
                Balanced strength - good for most plants
              </p>
            </div>

            <div
              className="stat-card"
              style={{
                animation: 'fadeInUp 0.8s ease-out 0.4s both',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Grow Medium
              </label>
              <select
                value={growMedium}
                onChange={e => handleGrowMediumChange(e.target.value)}
                style={{
                  width: '100%',
                  background: '#2d3748',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="hydro">💧 Hydroponic (DWC, Clay Pebbles, Rockwool)</option>
                <option value="coco">🥥 Coco/Soilless (Coco Coir, Peat Mixes)</option>
                <option value="soil">🌱 Soil (Organic, Living Soil)</option>
                <option value="perlite">⚪ Inert Media (Perlite, Vermiculite)</option>
              </select>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                  margin: '0.25rem 0 0 0',
                }}
              >
                Consolidated mediums with similar nutrient requirements
              </p>
            </div>

            <div
              className="stat-card supplements-dropdown"
              style={{
                animation: 'fadeInUp 0.8s ease-out 0.5s both',
                position: 'relative',
                overflow: 'visible',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Optional Supplements
              </label>

              {/* Custom Dropdown Button */}
              <div
                onClick={() => setSupplementsDropdownOpen(!supplementsDropdownOpen)}
                style={{
                  width: '100%',
                  background: '#2d3748',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.target.style.borderColor = 'var(--primary-color)';
                }}
                onMouseLeave={e => {
                  e.target.style.borderColor = 'var(--border)';
                }}
              >
                <span
                  style={{
                    color:
                      selectedOptionals.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {selectedOptionals.length === 0
                    ? 'Select supplements...'
                    : selectedOptionals.length === 1
                      ? selectedOptionals[0]
                      : `${selectedOptionals.length} supplements selected`}
                </span>
                <span
                  style={{
                    color: 'var(--text-muted)',
                    transform: supplementsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  ▼
                </span>
              </div>

              {/* Dropdown Content */}
              {supplementsDropdownOpen && (
                <div
                  className="supplements-dropdown-content"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.25rem)',
                    left: '0',
                    right: '0',
                    zIndex: 999999999,
                    background: '#2d3748',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '0.5rem',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  {nutrientBrands[selectedBrand]?.products?.supplements?.length > 0 ? (
                    nutrientBrands[selectedBrand].products.supplements
                      .filter(supplement => {
                        // Filter by growth stage and medium compatibility
                        if (supplement.floweringOnly && growthStage !== 'flowering') return false;
                        if (supplement.hydroOnly && growMedium !== 'hydro') return false;
                        if (supplement.earlyGrowth && growthStage === 'flowering') return false;
                        return true;
                      })
                      .map((supplement, index) => (
                        <label
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            borderRadius: '6px',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseEnter={e => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={e => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedOptionals.includes(supplement.name)}
                            onChange={e => handleOptionalsChange(supplement.name, e.target.checked)}
                            style={{
                              width: '16px',
                              height: '16px',
                              accentColor: 'var(--primary-color)',
                            }}
                          />
                          <span style={{ flex: 1 }}>
                            {supplement.name}
                            {supplement.floweringOnly && (
                              <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>
                                {' '}
                                (flower only)
                              </span>
                            )}
                            {supplement.hydroOnly && (
                              <span style={{ color: '#06b6d4', fontSize: '0.75rem' }}>
                                {' '}
                                (hydro only)
                              </span>
                            )}
                            {supplement.earlyGrowth && (
                              <span style={{ color: '#10b981', fontSize: '0.75rem' }}>
                                {' '}
                                (early growth)
                              </span>
                            )}
                          </span>
                        </label>
                      ))
                  ) : (
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        margin: '0.5rem 0',
                        textAlign: 'center',
                      }}
                    >
                      {loading ? 'Loading...' : 'No supplements available'}
                    </p>
                  )}
                </div>
              )}

              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                  margin: '0.25rem 0 0 0',
                }}
              >
                Select only the supplements you actually have
              </p>
            </div>

            <div
              className="stat-card"
              style={{
                animation: 'fadeInUp 0.8s ease-out 0.6s both',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Watering Method
              </label>
              <select
                value={wateringMethod}
                onChange={e => handleWateringMethodChange(e.target.value)}
                style={{
                  width: '100%',
                  background: '#2d3748',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="hand-watering">🚿 Hand Watering (100%)</option>
                <option value="drip-system">💧 Drip System (80%)</option>
                <option value="bottom-wicking">⬆️ Bottom Wicking (90%)</option>
                <option value="aeroponics">🌪️ Aeroponics (60%)</option>
                <option value="deep-water-culture">🌊 Deep Water Culture (100%)</option>
                <option value="ebb-flow">🔄 Ebb & Flow (85%)</option>
              </select>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                  margin: '0.25rem 0 0 0',
                }}
              >
                Adjusts nutrient concentration for delivery method
              </p>
            </div>
          </div>
        </section>

        {/* Your Nutrient Recipe - Stylish and Modern */}
        <section>
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '1.5rem',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              animation: 'fadeInUp 0.8s ease-out 0.6s both',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FlaskConical className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />
                <h2
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    margin: 0,
                  }}
                >
                  Your Nutrient Recipe
                </h2>
              </div>

              {/* Tank Size Input in Recipe Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    fontWeight: '500',
                  }}
                >
                  Tank Size (L)
                </label>
                <input
                  type="number"
                  value={tankSize}
                  onChange={e => handleTankSizeChange(Number(e.target.value))}
                  style={{
                    width: '80px',
                    background: '#2d3748',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                  }}
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            {calculations ? (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Recipe Header */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    animation: 'fadeInUp 0.8s ease-out 0.1s both',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                    e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--primary-color)',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {calculations.brand} - {calculations.stage} stage
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                    For {calculations.tankSize}L tank at {calculations.strength} strength
                    {calculations.targetEC && (
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        • Target: {calculations.targetEC} EC / {calculations.targetTDS} TDS (ppm)
                      </span>
                    )}
                  </p>
                </div>
                {/* Vertical Recipe Layout for Clear Mixing Order */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Pre-Base Supplements First */}
                  {calculations.preBaseSupplements &&
                    calculations.preBaseSupplements.length > 0 && (
                      <div
                        className="stat-card"
                        style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
                      >
                        <h4
                          style={{
                            color: '#f59e0b',
                            fontWeight: '600',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          ⚡ Step 1: Pre-Base Supplements (Add first - before base nutrients)
                        </h4>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {calculations.preBaseSupplements.map((supplement, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                minHeight: '60px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={e => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                                e.target.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                              }}
                              onMouseLeave={e => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                                e.target.style.borderColor = 'rgba(245, 158, 11, 0.2)';
                              }}
                            >
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                              >
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: '#f59e0b',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {index + 1}
                                </div>
                                <span
                                  style={{
                                    fontWeight: '500',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                  }}
                                >
                                  {supplement.name}
                                </span>
                              </div>
                              <span
                                style={{
                                  color: '#f59e0b',
                                  fontWeight: '600',
                                  fontFamily: 'monospace',
                                  fontSize: '1rem',
                                }}
                              >
                                {supplement.amount} {supplement.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.75rem',
                            margin: '0.75rem 0 0 0',
                          }}
                        >
                          💡 Add in exact order shown.
                          {(() => {
                            const hasSilica = calculations.preBaseSupplements.some(
                              s =>
                                s.name.toLowerCase().includes('armor') ||
                                s.name.toLowerCase().includes('silica') ||
                                s.name.toLowerCase().includes('si')
                            );
                            const hasCalMag = calculations.preBaseSupplements.some(
                              s =>
                                s.name.toLowerCase().includes('cal') ||
                                s.name.toLowerCase().includes('mag') ||
                                s.name.toLowerCase().includes('calimagic')
                            );

                            if (hasSilica && hasCalMag) {
                              return ' Silica dissolves poorly if added after CalMag.';
                            } else if (hasCalMag) {
                              return ' CalMag may not be needed with hard water - test first.';
                            } else {
                              return ' Follow manufacturer recommendations for dosing.';
                            }
                          })()}
                        </p>
                      </div>
                    )}

                  {/* Base Nutrients */}
                  <div
                    className="stat-card"
                    style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}
                  >
                    <h4
                      style={{
                        color: '#3b82f6',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      ⚗️ Step{' '}
                      {calculations.preBaseSupplements && calculations.preBaseSupplements.length > 0
                        ? '2'
                        : '1'}
                      : Base Nutrients (Add in this order)
                    </h4>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {calculations.baseNutrients.map((nutrient, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            minHeight: '60px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                            e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                          }}
                          onMouseLeave={e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#3b82f6',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                              }}
                            >
                              {index + 1}
                            </div>
                            <span
                              style={{
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                              }}
                            >
                              {nutrient.name}
                            </span>
                          </div>
                          <span
                            style={{
                              color: '#3b82f6',
                              fontWeight: '600',
                              fontFamily: 'monospace',
                              fontSize: '1rem',
                            }}
                          >
                            {nutrient.amount} {nutrient.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.75rem',
                        margin: '0.75rem 0 0 0',
                      }}
                    >
                      💡 Mix thoroughly between each addition. These are your core nutrients -
                      essential for plant growth.
                    </p>
                  </div>

                  {/* Post-Base Supplements */}
                  {calculations.postBaseSupplements &&
                    calculations.postBaseSupplements.length > 0 && (
                      <div
                        className="stat-card"
                        style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}
                      >
                        <h4
                          style={{
                            color: '#10b981',
                            fontWeight: '600',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          🧪 Step{' '}
                          {calculations.preBaseSupplements &&
                          calculations.preBaseSupplements.length > 0
                            ? '3'
                            : '2'}
                          : Post-Base Supplements (Add after base nutrients)
                        </h4>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {calculations.postBaseSupplements.map((supplement, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                minHeight: '60px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={e => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                                e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                              }}
                              onMouseLeave={e => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                                e.target.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                              }}
                            >
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                              >
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {index + 1}
                                </div>
                                <span
                                  style={{
                                    fontWeight: '500',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                  }}
                                >
                                  {supplement.name}
                                </span>
                              </div>
                              <span
                                style={{
                                  color: '#10b981',
                                  fontWeight: '600',
                                  fontFamily: 'monospace',
                                  fontSize: '1rem',
                                }}
                              >
                                {supplement.amount} {supplement.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.75rem',
                            margin: '0.75rem 0 0 0',
                          }}
                        >
                          💡 Add these supplements after base nutrients are mixed. These enhance
                          nutrient uptake and plant health.
                        </p>
                      </div>
                    )}
                </div>
                {/* Mixing Instructions */}
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    animation: 'fadeInUp 0.8s ease-out 0.4s both',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                  }}
                >
                  <h4
                    style={{
                      color: '#ef4444',
                      fontWeight: '600',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    🥼 Step{' '}
                    {(() => {
                      let stepNum = 1;
                      if (
                        calculations.preBaseSupplements &&
                        calculations.preBaseSupplements.length > 0
                      )
                        stepNum++;
                      stepNum++; // Base nutrients
                      if (
                        calculations.postBaseSupplements &&
                        calculations.postBaseSupplements.length > 0
                      )
                        stepNum++;
                      return stepNum;
                    })()}
                    : Final Mixing Instructions
                  </h4>
                  <ol
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      paddingLeft: '1.25rem',
                      margin: 0,
                    }}
                  >
                    <li>
                      <strong>Start with clean water</strong> - Use RO or distilled water if
                      possible
                    </li>
                    {calculations.supplements.length > 0 && (
                      <li>
                        <strong>Add supplements in order</strong> -{' '}
                        {(() => {
                          const hasSilica = calculations.supplements.some(
                            s =>
                              s.name.toLowerCase().includes('armor') ||
                              s.name.toLowerCase().includes('silica') ||
                              s.name.toLowerCase().includes('si')
                          );
                          const hasCalMag = calculations.supplements.some(
                            s =>
                              s.name.toLowerCase().includes('cal') ||
                              s.name.toLowerCase().includes('mag') ||
                              s.name.toLowerCase().includes('calimagic')
                          );

                          if (hasSilica && hasCalMag) {
                            return 'Silica first (if using), then CalMag, then others';
                          } else if (hasSilica) {
                            return 'Silica first, then other supplements';
                          } else if (hasCalMag) {
                            return 'CalMag first, then other supplements';
                          } else {
                            return 'Follow the order shown above';
                          }
                        })()}
                      </li>
                    )}
                    <li>
                      <strong>Add base nutrients in order</strong> - Follow the numbered steps above
                    </li>
                    <li>
                      <strong>Mix thoroughly</strong> - Stir for 30 seconds between each addition
                    </li>
                    <li>
                      <strong>Check pH</strong> - Adjust to 5.5-6.5 for hydro/coco, 6.0-7.0 for soil
                    </li>
                    <li>
                      <strong>Check TDS/PPM</strong> - Should match your feeding strength guidelines
                      {calculations.targetTDS ? ` (target: ${calculations.targetTDS} ppm)` : ''}
                    </li>
                    <li>
                      <strong>Use fresh</strong> - Mix fresh every 7-10 days for best results
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  color: 'var(--text-muted)',
                }}
              >
                <FlaskConical
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: 'var(--text-muted)' }}
                />
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Select your nutrient preferences above
                </h3>
                <p style={{ fontSize: '0.875rem' }}>
                  Choose your brand, growth stage, and any supplements to generate your custom
                  nutrient recipe
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NutrientCalculator;

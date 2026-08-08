import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calculator, Info, Beaker, Copy, CheckCircle, FlaskConical, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

import nutrientBrands from '../data/nutrients';
import PageHeader from '../components/PageHeader';

const LITERS_PER_GALLON = 3.78541;
const ML_PER_TSP = 4.92892;

const isWeeklyBrand = (brand) => brand?.scheduleMode === 'weekly';

const getScheduleWeeks = (brand, strength) =>
  brand?.schedules?.[strength]?.weeks || [];

const findNearestWeekNumber = (weeks, targetWeek) => {
  if (!weeks.length) return targetWeek;
  if (weeks.some((w) => w.weekNumber === targetWeek)) return targetWeek;
  let nearest = weeks[0].weekNumber;
  let best = Math.abs(nearest - targetWeek);
  weeks.forEach((w) => {
    const dist = Math.abs(w.weekNumber - targetWeek);
    if (dist < best) {
      best = dist;
      nearest = w.weekNumber;
    }
  });
  return nearest;
};

const convertDose = (ratio, unit, tankLiters) => {
  if (unit === 'tsp/gal') {
    return {
      amount: Math.round(((ratio * ML_PER_TSP * tankLiters) / LITERS_PER_GALLON) * 10) / 10,
      unit: 'ml'
    };
  }
  if (unit === 'g/gal') {
    return {
      amount: Math.round(((ratio * tankLiters) / LITERS_PER_GALLON) * 10) / 10,
      unit: 'g'
    };
  }
  if (unit === 'mg/L') {
    return {
      amount: Math.round(ratio * tankLiters * 10) / 10,
      unit: 'mg'
    };
  }
  if (unit === 'ml/L') {
    return {
      amount: Math.round(ratio * tankLiters * 10) / 10,
      unit: 'ml'
    };
  }
  // ml/gal (default chart unit)
  return {
    amount: Math.round(((ratio * tankLiters) / LITERS_PER_GALLON) * 10) / 10,
    unit: 'ml'
  };
};

const isFloweringPhase = (growthStage) => {
  if (!growthStage) return false;
  const lower = growthStage.toLowerCase();
  return (
    lower.includes('bloom') ||
    lower.includes('flower') ||
    lower.includes('ripen') ||
    lower.includes('flush')
  );
};

const NutrientCalculator = () => {
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
  const [growthStage, setGrowthStage] = useState(() =>
    loadPreference('growthStage', 'vegetative')
  );
  const [feedWeek, setFeedWeek] = useState(() => loadPreference('feedWeek', 1));
  const [tankSize, setTankSize] = useState(() => loadPreference('tankSize', 50));
  const [waterType, setWaterType] = useState(() => loadPreference('waterType', 'soft'));
  const [growMedium, setGrowMedium] = useState(() => loadPreference('growMedium', 'hydro'));
  const [feedingStrength, setFeedingStrength] = useState(() =>
    loadPreference('feedingStrength', 'medium')
  );
  const [wateringMethod, setWateringMethod] = useState(() =>
    loadPreference('wateringMethod', 'hand-watering')
  );
  const [calculations, setCalculations] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [refOpen, setRefOpen] = useState(false);

  const savePreference = (key, value) => {
    try {
      localStorage.setItem(`nutrientCalculator_${key}`, JSON.stringify(value));
    } catch {
      // Failed to save preference
    }
  };

  const brand = nutrientBrands[selectedBrand];
  const weeklyMode = isWeeklyBrand(brand);
  const scheduleWeeks = useMemo(
    () => getScheduleWeeks(brand, feedingStrength),
    [brand, feedingStrength]
  );

  // Keep feed week valid when brand/strength schedule changes
  useEffect(() => {
    if (!weeklyMode || !scheduleWeeks.length) return;
    const snapped = findNearestWeekNumber(scheduleWeeks, feedWeek);
    if (snapped !== feedWeek) {
      setFeedWeek(snapped);
      savePreference('feedWeek', snapped);
    }
  }, [weeklyMode, scheduleWeeks, feedWeek]);

  const handleGrowthStageChange = (newStage) => {
    setGrowthStage(newStage);
    savePreference('growthStage', newStage);

    if (newStage === 'seedling') {
      if (feedingStrength !== 'light') {
        setFeedingStrength('light');
        savePreference('feedingStrength', 'light');
        toast.success('Adjusted to light strength for seedling stage');
      }
    } else if (newStage === 'vegetative') {
      if (feedingStrength === 'aggressive') {
        setFeedingStrength('medium');
        savePreference('feedingStrength', 'medium');
        toast.success('Adjusted to medium strength for vegetative stage');
      }
    } else if (newStage === 'flowering') {
      if (feedingStrength === 'light') {
        setFeedingStrength('medium');
        savePreference('feedingStrength', 'medium');
        toast.success('Adjusted to medium strength for flowering stage');
      }
    }
  };

  const handleFeedingStrengthChange = (newStrength) => {
    setFeedingStrength(newStrength);
    savePreference('feedingStrength', newStrength);

    const nextBrand = nutrientBrands[selectedBrand];
    if (isWeeklyBrand(nextBrand)) {
      const weeks = getScheduleWeeks(nextBrand, newStrength);
      const snapped = findNearestWeekNumber(weeks, feedWeek);
      if (snapped !== feedWeek) {
        setFeedWeek(snapped);
        savePreference('feedWeek', snapped);
      }
      return;
    }

    if (newStrength === 'light' && growthStage === 'flowering') {
      toast('Light feeding is typically used for seedlings or young plants', {
        icon: '💡',
        duration: 3000
      });
    } else if (
      newStrength === 'aggressive' &&
      (growthStage === 'vegetative' || growthStage === 'seedling')
    ) {
      toast('Aggressive feeding is typically used in flowering stage', {
        icon: '💡',
        duration: 3000
      });
    } else if (newStrength === 'medium' && growthStage === 'seedling') {
      toast('Consider using light feeding for seedlings to prevent burn', {
        icon: '💡',
        duration: 3000
      });
    }
  };

  const handleFeedWeekChange = (week) => {
    setFeedWeek(week);
    savePreference('feedWeek', week);
  };

  const handleBrandChange = (nextBrandKey) => {
    setSelectedBrand(nextBrandKey);
    savePreference('selectedBrand', nextBrandKey);

    const nextBrand = nutrientBrands[nextBrandKey];
    if (isWeeklyBrand(nextBrand)) {
      const weeks = getScheduleWeeks(nextBrand, feedingStrength);
      const snapped = findNearestWeekNumber(weeks, feedWeek);
      setFeedWeek(snapped);
      savePreference('feedWeek', snapped);
    }
  };

  const handleTankSizeChange = (size) => {
    setTankSize(size);
    savePreference('tankSize', size);
  };

  const handleWaterTypeChange = (type) => {
    setWaterType(type);
    savePreference('waterType', type);
  };

  const handleGrowMediumChange = (medium) => {
    setGrowMedium(medium);
    savePreference('growMedium', medium);
  };

  const handleWateringMethodChange = (method) => {
    setWateringMethod(method);
    savePreference('wateringMethod', method);
  };

  const calculateNutrients = useCallback(() => {
    const activeBrand = nutrientBrands[selectedBrand];
    if (!activeBrand) return;

    const weekly = isWeeklyBrand(activeBrand);
    const weeks = getScheduleWeeks(activeBrand, feedingStrength);
    const selectedWeek = weekly
      ? weeks.find((w) => w.weekNumber === feedWeek) || weeks[0]
      : null;

    let products = [];
    let multiplier = 1;
    let stageLabel = growthStage;
    let targetEC = null;
    let targetTDS = null;
    let isFlush = false;
    let weekLabel = null;
    let phaseTitle = null;

    let weekOptionalProducts = [];

    if (weekly && selectedWeek) {
      const weekProducts = selectedWeek.products || [];
      products = weekProducts.filter((product) => !product.optional);
      weekOptionalProducts = weekProducts.filter((product) => product.optional);
      multiplier = 1;
      stageLabel = selectedWeek.phaseTitle || selectedWeek.growthStage;
      targetEC = selectedWeek.ecRange || null;
      targetTDS = selectedWeek.ppmRange500 || null;
      isFlush = Boolean(selectedWeek.flush);
      weekLabel = selectedWeek.label;
      phaseTitle = selectedWeek.phaseTitle;
    } else {
      products = activeBrand.products?.[growthStage] || [];
      multiplier = activeBrand.strengthMultipliers?.[feedingStrength] ?? 1;
      const wateringMultiplier =
        activeBrand.wateringMethodMultipliers?.[wateringMethod] || 1.0;
      multiplier *= wateringMultiplier;
      targetEC = activeBrand.targetEC?.[growthStage]?.[feedingStrength] ?? null;
      targetTDS = activeBrand.targetTDS?.[growthStage]?.[feedingStrength] ?? null;
    }

    const tankVolume = tankSize;

    const next = {
      tankSize: tankSize,
      brand: activeBrand.name,
      stage: stageLabel,
      weekLabel,
      phaseTitle,
      strength: feedingStrength,
      wateringMethod: wateringMethod,
      weekly,
      flush: isFlush,
      baseNutrients: [],
      supplements: [],
      totalCost: 0,
      instructions: [],
      targetEC,
      targetTDS
    };

    if (!isFlush) {
      products.forEach((product) => {
        const scaled = product.ratio * multiplier;
        const { amount, unit } = convertDose(scaled, product.unit, tankVolume);
        next.baseNutrients.push({
          name: product.name,
          amount,
          unit,
          originalRatio: product.ratio,
          originalUnit: product.unit
        });
      });
    }

    const brandSupplements = activeBrand.products?.supplements || [];
    const supplements = [...weekOptionalProducts, ...brandSupplements];
    const floweringContext = weekly
      ? isFloweringPhase(selectedWeek?.growthStage)
      : growthStage === 'flowering';

    if (!isFlush) {
      supplements.forEach((supplement) => {
        const isHydroMedium = growMedium === 'hydro' || growMedium === 'perlite';
        if (supplement.hydroOnly && !isHydroMedium) return;
        if (supplement.floweringOnly && !floweringContext) return;

        const isCalMag =
          supplement.name.toLowerCase().includes('cal') ||
          supplement.name.toLowerCase().includes('mag') ||
          supplement.name.toLowerCase().includes('calimagic');

        // Weekly charts use absolute doses; supplements keep chart ratios without strength/watering scale
        const supplementMultiplier = weekly ? 1 : multiplier;
        let amountRatio = supplement.ratio * supplementMultiplier;
        let adjustedOptional = Boolean(supplement.optional);

        if (isCalMag) {
          if (waterType === 'hard') {
            adjustedOptional = true;
          } else if (waterType === 'soft') {
            adjustedOptional = false;
          }
        }

        const { amount, unit } = convertDose(amountRatio, supplement.unit, tankVolume);

        next.supplements.push({
          name: supplement.name,
          amount,
          unit,
          optional: adjustedOptional,
          originalRatio: supplement.ratio,
          originalUnit: supplement.unit,
          waterTypeNote: isCalMag
            ? waterType === 'soft'
              ? 'Essential for RO/soft water'
              : 'May not be needed - test your tap water first'
            : null
        });
      });
    }

    next.supplements.sort((a, b) => {
      const getMixingPriority = (name) => {
        const lowerName = name.toLowerCase();
        if (
          lowerName.includes('armor') ||
          lowerName.includes('silica') ||
          lowerName.includes('si')
        )
          return 1;
        if (
          lowerName.includes('cal') ||
          lowerName.includes('mag') ||
          lowerName.includes('calimagic')
        )
          return 2;
        if (
          lowerName.includes('hydro') ||
          lowerName.includes('guard') ||
          lowerName.includes('beneficial')
        )
          return 3;
        return 4;
      };

      return getMixingPriority(a.name) - getMixingPriority(b.name);
    });

    if (isFlush) {
      next.instructions = [
        '1. Flush with plain pH-adjusted water only — no nutrients',
        '2. Match water pH to your medium (5.5–6.5 hydro/coco, 6.0–7.0 soil)',
        '3. Continue until runoff EC is near your source water'
      ];
    } else {
      next.instructions = [
        '1. Start with clean, pH-adjusted water in your tank',
        '2. Add nutrients in the order listed (important for some brands)',
        '3. Mix thoroughly between each addition',
        '4. Check and adjust pH to 5.5-6.5 for hydro/coco/soilless, 6.0-7.0 for soil',
        '5. Check PPM/EC levels and adjust if needed',
        '6. Use within 7-10 days for best results'
      ];

      const wateringInstructions = {
        'hand-watering': [
          '7. Water slowly and evenly until runoff appears',
          '8. Allow proper wet/dry cycle between waterings'
        ],
        'drip-system': [
          '7. Check emitters regularly for clogs (use filtered solution)',
          '8. Run system for shorter, more frequent cycles',
          '9. Monitor EC buildup in medium over time'
        ],
        'bottom-wicking': [
          '7. Fill reservoir and allow plants to uptake slowly',
          '8. Top-water occasionally to prevent salt accumulation',
          '9. Monitor water level and refill as needed'
        ],
        'deep-water-culture': [
          '7. Monitor solution EC/pH daily, adjust as needed',
          '8. Change reservoir completely every 7-10 days',
          '9. Keep solution temperature 65-68°F (18-20°C)'
        ],
        'ebb-flow': [
          '7. Flood for 15-30 minutes, then drain completely',
          '8. Ensure good air gaps for root oxygenation',
          '9. Run 2-4 cycles per day depending on medium'
        ],
        aeroponics: [
          '7. Use fine spray nozzles (avoid clogging)',
          '8. Run misting cycles every 15-30 minutes',
          '9. Keep solution temperature cool and well-oxygenated'
        ]
      };

      if (wateringInstructions[wateringMethod]) {
        next.instructions.push(...wateringInstructions[wateringMethod]);
      }

      if (selectedBrand === 'general-hydroponics') {
        next.instructions.splice(
          1,
          1,
          '2. Add in order: Armor Si first (if using), then CaliMagic, then FloraMicro, FloraGro, FloraBloom'
        );
      } else if (selectedBrand === 'canna') {
        next.instructions.splice(
          1,
          1,
          '2. Add Canna Coco A first, mix well, then Canna Coco B (never mix A+B concentrates)'
        );
      } else if (selectedBrand === 'house-garden') {
        next.instructions.splice(
          1,
          1,
          '2. Add Aqua Flakes A first, mix well, then Aqua Flakes B (never mix concentrates directly)'
        );
      } else if (selectedBrand === 'botanicare') {
        next.instructions.splice(
          1,
          1,
          '2. Add Cal-Mag Plus (if using), then Pure Blend Pro Grow or Bloom for this week'
        );
      } else if (selectedBrand === 'advanced-nutrients') {
        next.instructions.splice(
          1,
          1,
          '2. Add in order: pH Perfect Micro first, then Grow, then Bloom (pH adjusts automatically)'
        );
      } else if (selectedBrand === 'fox-farm') {
        next.instructions.splice(
          1,
          1,
          '2. Never mix concentrates together — dilute each into water separately (Big Bloom, Grow Big, Tiger Bloom)'
        );
      } else if (selectedBrand === 'jack-nutrients') {
        next.instructions.splice(
          1,
          1,
          '2. Add dry nutrients in order: Part A (or clone/bloom formula) first, then Epsom Salt, then Calcium Nitrate',
          '3. Mix each thoroughly before adding the next (prevents precipitation)'
        );
      } else if (selectedBrand === 'megacrop') {
        next.instructions.splice(
          1,
          1,
          '2. Add MegaCrop slowly while stirring (white clumps will dissolve in 12 hours)'
        );
      } else if (selectedBrand === 'dyna-gro') {
        next.instructions.splice(
          1,
          1,
          '2. Add Pro-TeKt first (if using) into nearly full reservoir, mix, then Foliage-Pro / Bloom — never mix concentrates'
        );
      } else if (selectedBrand === 'nectar-gods') {
        next.instructions.splice(
          1,
          1,
          '2. Mix nutrients in chart order (top to bottom), stir continuously, then adjust pH with Olympus Up / Hades Down'
        );
      }
    }

    setCalculations(next);
  }, [
    selectedBrand,
    growthStage,
    feedWeek,
    tankSize,
    waterType,
    growMedium,
    feedingStrength,
    wateringMethod
  ]);

  const copyToClipboard = () => {
    if (!calculations) return;

    let text = `Nutrient Recipe - ${calculations.brand}\n`;
    text += `Tank Size: ${calculations.tankSize}L\n`;
    if (calculations.weekly && calculations.weekLabel) {
      text += `Week: ${calculations.weekLabel}`;
      if (calculations.phaseTitle) text += ` (${calculations.phaseTitle})`;
      text += `\n`;
    } else {
      text += `Stage: ${calculations.stage}\n`;
    }
    text += `Strength: ${calculations.strength}\n`;
    text += `Watering: ${calculations.wateringMethod.replace('-', ' ')}\n\n`;

    if (calculations.flush) {
      text += `Flush — water only (no nutrients)\n\n`;
    } else {
      text += `Base Nutrients:\n`;
      calculations.baseNutrients.forEach((nutrient) => {
        text += `• ${nutrient.name}: ${nutrient.amount}${nutrient.unit}\n`;
      });

      if (calculations.supplements.length > 0) {
        text += `\nSupplements:\n`;
        calculations.supplements.forEach((supplement) => {
          text += `• ${supplement.name}: ${supplement.amount}${supplement.unit} ${
            supplement.optional ? '(optional)' : ''
          }\n`;
        });
      }
      text += `\n`;
    }

    text += `Instructions:\n`;
    calculations.instructions.forEach((instruction) => {
      text += `${instruction}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedToClipboard(true);
    toast.success('Recipe copied to clipboard!');
    setTimeout(() => setCopiedToClipboard(false), 3000);
  };

  useEffect(() => {
    calculateNutrients();
  }, [calculateNutrients]);

  const getSupplementTip = () => {
    if (!calculations?.supplements?.length) return null;
    const hasSilica = calculations.supplements.some(
      (s) =>
        s.name.toLowerCase().includes('armor') ||
        s.name.toLowerCase().includes('silica') ||
        s.name.toLowerCase().includes('si')
    );
    const hasCalMag = calculations.supplements.some(
      (s) =>
        s.name.toLowerCase().includes('cal') ||
        s.name.toLowerCase().includes('mag') ||
        s.name.toLowerCase().includes('calimagic')
    );
    if (hasSilica && hasCalMag) {
      return 'Add in order shown. Silica dissolves poorly if added after CalMag.';
    }
    if (hasCalMag) {
      return 'CalMag may not be needed with hard water — test first.';
    }
    return 'Follow manufacturer recommendations for dosing.';
  };

  return (
    <div className="dashboard-page">
      <div className="calculator-page">
        <PageHeader
          icon={Calculator}
          title="Calculator"
          subtitle={
            weeklyMode
              ? 'Official weekly chart doses for your tank (liters) and brand'
              : 'Precise mixing ratios for your tank, stage, and brand'
          }
          actions={
            calculations ? (
              <button
                type="button"
                onClick={copyToClipboard}
                className="btn btn-outline flex items-center gap-2"
              >
                {copiedToClipboard ? (
                  <CheckCircle className="w-4 h-4" style={{ color: '#4ade80' }} />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copy Recipe
              </button>
            ) : null
          }
        />

      <div className="calc-workspace">
        {/* Controls */}
        <section className="calc-panel">
          <h2 className="calc-panel-title">
            <Beaker />
            Setup
          </h2>

          <div className="calc-fields">
            <div className="calc-field">
              <label htmlFor="calc-brand">Nutrient brand</label>
              <select
                id="calc-brand"
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
              >
                {Object.entries(nutrientBrands).map(([key, brandOption]) => (
                  <option key={key} value={key}>
                    {brandOption.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="calc-field">
              <label htmlFor="calc-strength">Feeding strength</label>
              <select
                id="calc-strength"
                value={feedingStrength}
                onChange={(e) => handleFeedingStrengthChange(e.target.value)}
              >
                {brand?.scheduleStrengthHint === 'canna-ranges' ? (
                  <>
                    <option value="light">Light (low chart range)</option>
                    <option value="medium">Normal (mid chart range)</option>
                    <option value="aggressive">Heavy (high chart range)</option>
                  </>
                ) : brand?.scheduleStrengthHint === 'an-recipes' ? (
                  <>
                    <option value="light">Top-Shelf recipe</option>
                    <option value="medium">Top-Shelf recipe</option>
                    <option value="aggressive">Master recipe</option>
                  </>
                ) : brand?.scheduleStrengthHint === 'nftg-regimen' ? (
                  <>
                    <option value="light">Spartan regimen</option>
                    <option value="medium">Greek regimen</option>
                    <option value="aggressive">Roman regimen</option>
                  </>
                ) : brand?.scheduleStrengthHint === 'dyna-system' ? (
                  <>
                    <option value="light">Soil / drain-to-waste</option>
                    <option value="medium">Soil / drain-to-waste</option>
                    <option value="aggressive">Recirculating hydro</option>
                  </>
                ) : (
                  <>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="aggressive">Aggressive</option>
                  </>
                )}
              </select>
              {weeklyMode && brand?.scheduleStrengthHint === 'single-chart' && (
                <p className="calc-field-hint">
                  This brand publishes one rate schedule — strength does not change doses.
                </p>
              )}
              {weeklyMode && brand?.scheduleStrengthHint === 'canna-ranges' && (
                <p className="calc-field-hint">
                  Maps to the low / mid / high ends of CANNA&apos;s official ml/10L ranges.
                </p>
              )}
              {weeklyMode && brand?.scheduleStrengthHint === 'an-recipes' && (
                <p className="calc-field-hint">
                  Official Top-Shelf (light/medium) or Master (aggressive) recipe — same base
                  Grow/Micro/Bloom rates.
                </p>
              )}
              {weeklyMode && brand?.scheduleStrengthHint === 'nftg-regimen' && (
                <p className="calc-field-hint">
                  Maps to official Spartan / Greek / Roman feeding regimens (ml/gal).
                </p>
              )}
              {weeklyMode && brand?.scheduleStrengthHint === 'dyna-system' && (
                <p className="calc-field-hint">
                  Soil/DTW chart for light &amp; medium; recirculating chart for aggressive.
                </p>
              )}
              {weeklyMode &&
                !brand?.scheduleStrengthHint && (
                  <p className="calc-field-hint">
                    Maps to the manufacturer Light / Medium / Aggressive weekly charts.
                  </p>
                )}
            </div>

            {weeklyMode ? (
              <div className="calc-field">
                <label htmlFor="calc-week">Feed week</label>
                <select
                  id="calc-week"
                  value={feedWeek}
                  onChange={(e) => handleFeedWeekChange(Number(e.target.value))}
                >
                  {scheduleWeeks.map((week) => (
                    <option key={week.weekNumber} value={week.weekNumber}>
                      {week.label}
                      {week.phaseTitle ? ` · ${week.phaseTitle}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="calc-field">
                <label htmlFor="calc-stage">Growth stage</label>
                <select
                  id="calc-stage"
                  value={growthStage}
                  onChange={(e) => handleGrowthStageChange(e.target.value)}
                >
                  <option value="seedling">Seedling</option>
                  <option value="vegetative">Vegetative</option>
                  <option value="flowering">Flowering</option>
                </select>
              </div>
            )}

            <div className="calc-field">
              <label htmlFor="calc-method">Watering method</label>
              <select
                id="calc-method"
                value={wateringMethod}
                onChange={(e) => handleWateringMethodChange(e.target.value)}
              >
                <option value="hand-watering">Hand watering</option>
                <option value="drip-system">Drip system</option>
                <option value="bottom-wicking">Bottom / wicking</option>
                <option value="deep-water-culture">Deep water culture</option>
                <option value="ebb-flow">Ebb &amp; flow</option>
                <option value="aeroponics">Aeroponics</option>
              </select>
              {weeklyMode && (
                <p className="calc-field-hint">
                  Used for mixing notes only — does not change chart doses.
                </p>
              )}
            </div>

            <div className="calc-field">
              <label htmlFor="calc-water">Water type</label>
              <select
                id="calc-water"
                value={waterType}
                onChange={(e) => handleWaterTypeChange(e.target.value)}
              >
                <option value="soft">RO / Soft</option>
                <option value="hard">Hard tap</option>
              </select>
              <p className="calc-field-hint">
                Soft water usually needs CalMag; hard water often does not.
              </p>
            </div>

            <div className="calc-field">
              <label htmlFor="calc-medium">Grow medium</label>
              <select
                id="calc-medium"
                value={growMedium}
                onChange={(e) => handleGrowMediumChange(e.target.value)}
              >
                <option value="hydro">Hydroponic</option>
                <option value="coco">Coco / Soilless</option>
                <option value="soil">Soil</option>
                <option value="perlite">Inert (perlite / rockwool)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Recipe */}
        <section className="calc-panel calc-recipe-panel">
          <div className="calc-recipe-head">
            <h2 className="calc-panel-title" style={{ marginBottom: 0 }}>
              <FlaskConical />
              Your recipe
            </h2>
            {calculations &&
              (calculations.targetEC != null || calculations.targetTDS != null) && (
                <div className="calc-target-row">
                  {calculations.targetEC != null && (
                    <span className="calc-target-pill">
                      EC <strong>{calculations.targetEC}</strong>
                    </span>
                  )}
                  {calculations.targetTDS != null && (
                    <span className="calc-target-pill">
                      TDS <strong>{calculations.targetTDS}</strong>
                      <span className="calc-target-unit">ppm</span>
                    </span>
                  )}
                </div>
              )}
            <div className="calc-tank-control">
              <label htmlFor="calc-tank">Tank size</label>
              <div className="calc-tank-input-wrap">
                <input
                  id="calc-tank"
                  type="number"
                  min={1}
                  max={1000}
                  value={tankSize}
                  onChange={(e) => handleTankSizeChange(Number(e.target.value))}
                />
                <span className="calc-tank-unit">L</span>
              </div>
            </div>
          </div>

          {!calculations ? (
            <p className="calc-empty-recipe">Adjust setup to generate a mix.</p>
          ) : (
            <>
              <div className="calc-recipe-summary">
                <div className="calc-recipe-tags">
                  <span className="calc-tag calc-tag--brand">{calculations.brand}</span>
                  {calculations.weekly && calculations.weekLabel ? (
                    <span className="calc-tag">
                      {calculations.weekLabel}
                      {calculations.phaseTitle ? ` · ${calculations.phaseTitle}` : ''}
                    </span>
                  ) : (
                    <span className="calc-tag">{calculations.stage}</span>
                  )}
                  <span className="calc-tag">{calculations.strength}</span>
                  <span className="calc-tag">
                    {calculations.wateringMethod.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>

              {calculations.flush ? (
                <div className="calc-mix-sheet">
                  <div className="calc-mix-section calc-mix-section--blue">
                    Flush · water only
                  </div>
                  <p className="calc-step-note calc-step-note--inset">
                    No nutrients this week. Use plain pH-adjusted water until runoff EC
                    approaches your source water.
                  </p>
                </div>
              ) : (
                <div className="calc-mix-sheet">
                  {calculations.supplements.length > 0 && (
                    <>
                      <div className="calc-mix-section calc-mix-section--amber">
                        Step 1 · Supplements · add first
                      </div>
                      <table className="calc-mix-table">
                        <tbody>
                          {calculations.supplements.map((supplement, index) => (
                            <tr key={supplement.name}>
                              <td className="calc-mix-ord">
                                <span className="calc-step-num calc-step-num--amber">
                                  {index + 1}
                                </span>
                              </td>
                              <td className="calc-mix-name">
                                {supplement.name}
                                {supplement.optional && (
                                  <span className="calc-optional">optional</span>
                                )}
                              </td>
                              <td className="calc-mix-amount calc-mix-amount--amber">
                                {supplement.amount}&nbsp;{supplement.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {getSupplementTip() && (
                        <p className="calc-step-note calc-step-note--inset">
                          {getSupplementTip()}
                        </p>
                      )}
                    </>
                  )}

                  <div className="calc-mix-section calc-mix-section--blue">
                    Step {calculations.supplements.length > 0 ? '2' : '1'} · Base nutrients
                  </div>
                  <table className="calc-mix-table">
                    <tbody>
                      {calculations.baseNutrients.map((nutrient, index) => (
                        <tr key={nutrient.name}>
                          <td className="calc-mix-ord">
                            <span className="calc-step-num calc-step-num--blue">
                              {index + 1}
                            </span>
                          </td>
                          <td className="calc-mix-name">{nutrient.name}</td>
                          <td className="calc-mix-amount calc-mix-amount--blue">
                            {nutrient.amount}&nbsp;{nutrient.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="calc-step-note calc-step-note--inset">
                    Mix thoroughly between each addition. Chart rates are ml/gal,
                    scaled to your tank in liters.
                  </p>
                </div>
              )}

              <details className="calc-howto">
                <summary>Mixing checklist &amp; method notes</summary>
                <ol>
                  {calculations.instructions.map((line) => (
                    <li key={line}>{line.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              </details>
            </>
          )}
        </section>
      </div>

      {/* Collapsible cheat sheet — below recipe so setup stays first */}
      <div className="calc-ref">
        <button
          type="button"
          className="calc-ref-toggle"
          aria-expanded={refOpen}
          onClick={() => setRefOpen((o) => !o)}
        >
          <span className="calc-ref-toggle-main">
            <Info />
            Quick reference
          </span>
          <span className="calc-chips" aria-hidden={!refOpen ? undefined : true}>
            <span className="calc-chip">
              <strong>Veg</strong> higher N
            </span>
            <span className="calc-chip">
              <strong>Flower</strong> P&amp;K
            </span>
            <span className="calc-chip">
              <strong>PPM</strong> 300–1600
            </span>
            <span className="calc-chip">
              <strong>pH</strong> 5.5–7.0
            </span>
          </span>
          <ChevronDown className="calc-ref-chevron w-4 h-4" />
        </button>

        {refOpen && (
          <div className="calc-ref-body">
            <div className="calc-ref-item calc-ref-item--green">
              <h3>Growth stages</h3>
              <div>
                <strong>Vegetative:</strong> Higher N, light–medium strength
              </div>
              <div>
                <strong>Flowering:</strong> Higher P&amp;K, medium–aggressive
              </div>
            </div>
            <div className="calc-ref-item calc-ref-item--blue">
              <h3>PPM guidelines</h3>
              <div>
                <strong>Light:</strong> 300–600 PPM
              </div>
              <div>
                <strong>Medium:</strong> 600–1200 PPM
              </div>
              <div>
                <strong>Aggressive:</strong> 1200–1600 PPM
              </div>
            </div>
            <div className="calc-ref-item calc-ref-item--amber">
              <h3>pH ranges</h3>
              <div>
                <strong>Hydro/Coco:</strong> 5.5–6.5
              </div>
              <div>
                <strong>Soil:</strong> 6.0–7.0
              </div>
            </div>
            <div className="calc-ref-item calc-ref-item--violet">
              <h3>Water quality</h3>
              <div>
                <strong>RO/Soft:</strong> Use CalMag
              </div>
              <div>
                <strong>Hard tap:</strong> Test, often optional CalMag
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default NutrientCalculator;

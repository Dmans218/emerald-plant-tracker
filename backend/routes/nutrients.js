const express = require('express');
const router = express.Router();
const nutrientData = require('../models/nutrientData');

// Get all nutrient brands
router.get('/brands', (req, res) => {
  try {
    const brands = Object.keys(nutrientData.nutrientBrands).map(key => ({
      id: key,
      name: nutrientData.nutrientBrands[key].name,
      description: nutrientData.nutrientBrands[key].description,
    }));

    res.json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('Error fetching nutrient brands:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nutrient brands',
    });
  }
});

// Get specific brand data
router.get('/brands/:brandId', (req, res) => {
  try {
    const { brandId } = req.params;
    const brand = nutrientData.nutrientBrands[brandId];

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: brandId,
        ...brand,
      },
    });
  } catch (error) {
    console.error('Error fetching brand data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brand data',
    });
  }
});

// Calculate nutrient mix for specific parameters
router.post('/calculate', (req, res) => {
  try {
    const {
      brandId,
      growthStage,
      tankSize,
      waterType,
      feedingStrength,
      wateringMethod,
      growMedium,
    } = req.body;

    const brand = nutrientData.nutrientBrands[brandId];

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found',
      });
    }

    // Get base products for the growth stage
    const products = brand.products[growthStage] || [];
    const supplements = brand.products.supplements || [];

    // Apply strength multiplier
    const strengthMultiplier =
      brand.strengthMultipliers[feedingStrength] || 1.0;

    // Apply watering method multiplier
    const wateringMultiplier =
      brand.wateringMethodMultipliers[wateringMethod] || 1.0;

    // Calculate final ratios
    const calculations = products.map(product => ({
      ...product,
      amount: (
        product.ratio *
        strengthMultiplier *
        wateringMultiplier *
        tankSize
      ).toFixed(2),
      totalCost: 0, // Could be enhanced with pricing data
    }));

    // Add relevant supplements
    const applicableSupplements = supplements
      .filter(supplement => {
        if (supplement.floweringOnly && growthStage !== 'flowering')
          return false;
        if (supplement.hydroOnly && growMedium !== 'hydro') return false;
        if (supplement.earlyGrowth && growthStage === 'flowering') return false;
        return true;
      })
      .map(supplement => ({
        ...supplement,
        amount: (
          supplement.ratio *
          strengthMultiplier *
          wateringMultiplier *
          tankSize
        ).toFixed(2),
        totalCost: 0,
      }));

    // Get target EC/TDS values
    const targetEC = brand.targetEC[growthStage]?.[feedingStrength] || 1.0;
    const targetTDS = brand.targetTDS[growthStage]?.[feedingStrength] || 500;

    res.json({
      success: true,
      data: {
        brand: {
          id: brandId,
          name: brand.name,
          description: brand.description,
        },
        parameters: {
          growthStage,
          tankSize,
          waterType,
          feedingStrength,
          wateringMethod,
          growMedium,
        },
        calculations: {
          products: calculations,
          supplements: applicableSupplements,
          targetEC,
          targetTDS,
          strengthMultiplier,
          wateringMultiplier,
        },
      },
    });
  } catch (error) {
    console.error('Error calculating nutrients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate nutrients',
    });
  }
});

module.exports = router;

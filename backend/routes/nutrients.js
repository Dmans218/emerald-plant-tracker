const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Get all nutrient brands
router.get('/brands', async (req, res) => {
  try {
    const brandsResult = await query(`
      SELECT brand_key as id, name, description, created_at, updated_at
      FROM nutrient_brands 
      ORDER BY name
    `);

    res.json({
      success: true,
      data: brandsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching nutrient brands:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nutrient brands',
    });
  }
});

// Get specific brand data with all related information
router.get('/brands/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    
    // Get brand basic info
    const brandResult = await query(`
      SELECT * FROM nutrient_brands WHERE brand_key = $1
    `, [brandId]);

    if (brandResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found',
      });
    }

    const brand = brandResult.rows[0];

    // Get products by growth stage
    const productsResult = await query(`
      SELECT growth_stage, name, ratio, unit, is_optional, is_flowering_only, 
             is_hydro_only, is_early_growth, week_range
      FROM nutrient_products 
      WHERE brand_id = $1
      ORDER BY growth_stage, name
    `, [brand.id]);

    // Get strength multipliers
    const multipliersResult = await query(`
      SELECT multiplier_type, multiplier_key, multiplier_value
      FROM nutrient_multipliers 
      WHERE brand_id = $1
    `, [brand.id]);

    // Get target values
    const targetsResult = await query(`
      SELECT growth_stage, feeding_strength, target_ec, target_tds
      FROM nutrient_targets 
      WHERE brand_id = $1
    `, [brand.id]);

    // Get weekly schedules if available
    const schedulesResult = await query(`
      SELECT growth_stage, week_number, product_name, ratio
      FROM nutrient_weekly_schedules 
      WHERE brand_id = $1
      ORDER BY growth_stage, week_number
    `, [brand.id]);

    // Format data to match frontend expectations
    const products = {};
    productsResult.rows.forEach(product => {
      if (!products[product.growth_stage]) {
        products[product.growth_stage] = [];
      }
      
      const productData = {
        name: product.name,
        ratio: parseFloat(product.ratio),
        unit: product.unit,
      };

      if (product.is_optional) productData.optional = true;
      if (product.is_flowering_only) productData.floweringOnly = true;
      if (product.is_hydro_only) productData.hydroOnly = true;
      if (product.is_early_growth) productData.earlyGrowth = true;
      if (product.week_range) productData.week = JSON.parse(product.week_range);

      products[product.growth_stage].push(productData);
    });

    // Format multipliers
    const strengthMultipliers = {};
    const wateringMethodMultipliers = {};
    
    multipliersResult.rows.forEach(mult => {
      if (mult.multiplier_type === 'strength') {
        strengthMultipliers[mult.multiplier_key] = parseFloat(mult.multiplier_value);
      } else if (mult.multiplier_type === 'watering_method') {
        wateringMethodMultipliers[mult.multiplier_key] = parseFloat(mult.multiplier_value);
      }
    });

    // Format targets
    const targetEC = {};
    const targetTDS = {};
    
    targetsResult.rows.forEach(target => {
      if (!targetEC[target.growth_stage]) {
        targetEC[target.growth_stage] = {};
        targetTDS[target.growth_stage] = {};
      }
      
      if (target.target_ec) {
        targetEC[target.growth_stage][target.feeding_strength] = parseFloat(target.target_ec);
      }
      if (target.target_tds) {
        targetTDS[target.growth_stage][target.feeding_strength] = parseInt(target.target_tds);
      }
    });

    // Format weekly schedule if available
    let weeklySchedule = null;
    if (schedulesResult.rows.length > 0) {
      weeklySchedule = {};
      schedulesResult.rows.forEach(schedule => {
        if (!weeklySchedule[schedule.growth_stage]) {
          weeklySchedule[schedule.growth_stage] = {};
        }
        
        const weekKey = schedule.week_number === 99 ? 'flush' : `week${schedule.week_number}`;
        
        if (!weeklySchedule[schedule.growth_stage][weekKey]) {
          weeklySchedule[schedule.growth_stage][weekKey] = {};
        }
        
        weeklySchedule[schedule.growth_stage][weekKey][schedule.product_name] = parseFloat(schedule.ratio);
      });
    }

    const brandData = {
      id: brand.brand_key,
      name: brand.name,
      description: brand.description,
      products,
      strengthMultipliers,
      wateringMethodMultipliers,
      targetEC,
      targetTDS,
    };

    if (weeklySchedule) {
      brandData.weeklySchedule = weeklySchedule;
    }

    res.json({
      success: true,
      data: brandData,
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

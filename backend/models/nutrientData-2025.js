// Updated 2025 nutrient data based on current vendor feeding charts
// Sources: Official vendor websites and feeding charts - January 2025
// This replaces outdated hardcoded data with current accurate ratios

const nutrientBrands = {
  'general-hydroponics': {
    name: 'General Hydroponics Flora Series (2025 Reformulated)',
    description: 'Original 3-Part System - Newly Reformulated by GH R&D Team',
    products: {
      seedling: [
        { name: 'FloraMicro', ratio: 1.25, unit: 'ml/gal' }, // Light strength week 1
        { name: 'FloraGro', ratio: 1.25, unit: 'ml/gal' },
        { name: 'FloraBloom', ratio: 1.25, unit: 'ml/gal' },
      ],
      vegetative: [
        { name: 'FloraMicro', ratio: 7.5, unit: 'ml/gal' }, // Medium strength typical veg
        { name: 'FloraGro', ratio: 12.5, unit: 'ml/gal' },
        { name: 'FloraBloom', ratio: 2.5, unit: 'ml/gal' },
      ],
      flowering: [
        { name: 'FloraMicro', ratio: 5.0, unit: 'ml/gal' }, // Medium strength typical flower
        { name: 'FloraGro', ratio: 2.5, unit: 'ml/gal' },
        { name: 'FloraBloom', ratio: 10.0, unit: 'ml/gal' },
      ],
      supplements: [
        { name: 'CALiMAGic', ratio: 2.5, unit: 'ml/gal', optional: true },
        { name: 'RapidStart', ratio: 1.25, unit: 'ml/gal', optional: true, earlyGrowth: true },
        { name: 'Floralicious Plus', ratio: 1.25, unit: 'ml/gal', optional: true },
        { name: 'Liquid KoolBloom', ratio: 1.25, unit: 'ml/gal', optional: true, floweringOnly: true },
        { name: 'Dry KoolBloom', ratio: 0.25, unit: 'g/gal', optional: true, floweringOnly: true },
        { name: 'ArmorSi', ratio: 1.25, unit: 'ml/gal', optional: true },
        { name: 'FloraKleen', ratio: 7.5, unit: 'ml/gal', optional: true, flushOnly: true },
        { name: 'Diamond Nectar', ratio: 1.25, unit: 'ml/gal', optional: true },
        { name: 'FloraNectar', ratio: 1.25, unit: 'ml/gal', optional: true },
        { name: 'FloraBlend', ratio: 1.25, unit: 'ml/gal', optional: true },
      ],
    },
    strengthMultipliers: {
      light: 0.5,     // For light feeders or sensitive plants
      medium: 1.0,    // Standard feeding strength
      aggressive: 1.5, // Heavy feeders
    },
    targetEC: {
      seedling: { light: 0.3, medium: 0.6, aggressive: 0.9 },
      vegetative: { light: 0.8, medium: 1.2, aggressive: 1.6 },
      flowering: { light: 1.0, medium: 1.6, aggressive: 2.2 },
    },
    targetTDS: {
      seedling: { light: 150, medium: 300, aggressive: 450 },
      vegetative: { light: 400, medium: 600, aggressive: 800 },
      flowering: { light: 500, medium: 800, aggressive: 1100 },
    },
    wateringMethodMultipliers: {
      'hand-watering': 1.0,
      'drip-system': 0.9,
      'bottom-wicking': 0.95,
      'aeroponics': 0.7,
      'deep-water-culture': 1.0,
      'ebb-flow': 1.0,
    },
    weeklySchedule: {
      vegetative: {
        week1: { micro: 1.25, gro: 1.25, bloom: 1.25 }, // Light start
        week2: { micro: 3.75, gro: 6.25, bloom: 1.25 }, // Building up
        week3: { micro: 6.25, gro: 10.0, bloom: 2.5 },  // Mid veg
        week4: { micro: 7.5, gro: 12.5, bloom: 2.5 },   // Full veg strength
      },
      flowering: {
        week1: { micro: 6.25, gro: 6.25, bloom: 6.25 }, // Transition
        week2: { micro: 5.0, gro: 5.0, bloom: 7.5 },    // Early flower
        week3: { micro: 5.0, gro: 2.5, bloom: 10.0 },   // Peak bloom
        week4: { micro: 5.0, gro: 2.5, bloom: 10.0 },   // Peak bloom
        week5: { micro: 5.0, gro: 2.5, bloom: 10.0 },   // Peak bloom
        week6: { micro: 3.75, gro: 1.25, bloom: 7.5 },  // Late flower
        week7: { micro: 2.5, gro: 0, bloom: 5.0 },      // Final weeks
        week8: { micro: 1.25, gro: 0, bloom: 2.5 },     // Pre-flush
        flush: { micro: 0, gro: 0, bloom: 0 },          // Final flush
      },
    },
  },
  'advanced-nutrients': {
    name: 'Advanced Nutrients pH Perfect Sensi (2025)',
    description: 'pH Perfect Technology - Automatic pH Balancing 5.5-6.3',
    products: {
      seedling: [
        { name: 'pH Perfect Sensi Grow A', ratio: 4.0, unit: 'ml/gal' }, // Beginner level
        { name: 'pH Perfect Sensi Grow B', ratio: 4.0, unit: 'ml/gal' },
      ],
      vegetative: [
        { name: 'pH Perfect Sensi Grow A', ratio: 16.0, unit: 'ml/gal' }, // Expert level
        { name: 'pH Perfect Sensi Grow B', ratio: 16.0, unit: 'ml/gal' },
      ],
      flowering: [
        { name: 'pH Perfect Sensi Bloom A', ratio: 16.0, unit: 'ml/gal' }, // Expert level
        { name: 'pH Perfect Sensi Bloom B', ratio: 16.0, unit: 'ml/gal' },
      ],
      supplements: [
        { name: 'Voodoo Juice', ratio: 8.0, unit: 'ml/gal', optional: true, week: [1, 2] },
        { name: 'Piranha', ratio: 8.0, unit: 'ml/gal', optional: true, week: [1, 2] },
        { name: 'Tarantula', ratio: 8.0, unit: 'ml/gal', optional: true, week: [1, 2] },
        { name: 'B-52', ratio: 8.0, unit: 'ml/gal', optional: true },
        { name: 'Big Bud', ratio: 8.0, unit: 'ml/gal', optional: true, floweringOnly: true, week: [2, 3, 4] },
        { name: 'Overdrive', ratio: 8.0, unit: 'ml/gal', optional: true, floweringOnly: true, week: [6, 7] },
        { name: 'Bud Candy', ratio: 8.0, unit: 'ml/gal', optional: true, floweringOnly: true },
        { name: 'Rhino Skin', ratio: 4.0, unit: 'ml/gal', optional: true },
        { name: 'Sensizym', ratio: 8.0, unit: 'ml/gal', optional: true },
        { name: 'CarboLoad', ratio: 8.0, unit: 'ml/gal', optional: true },
        { name: 'Nirvana', ratio: 16.0, unit: 'ml/gal', optional: true },
        { name: 'Flawless Finish', ratio: 8.0, unit: 'ml/gal', optional: true, flushOnly: true },
      ],
    },
    strengthMultipliers: {
      hobbyist: 0.5,    // Beginner strength
      expert: 1.0,      // Full strength
      professional: 1.25, // Heavy feeding
    },
    targetEC: {
      seedling: { hobbyist: 0.4, expert: 0.8, professional: 1.0 },
      vegetative: { hobbyist: 0.8, expert: 1.6, professional: 2.0 },
      flowering: { hobbyist: 1.0, expert: 2.0, professional: 2.4 },
    },
    targetTDS: {
      seedling: { hobbyist: 200, expert: 400, professional: 500 },
      vegetative: { hobbyist: 400, expert: 800, professional: 1000 },
      flowering: { hobbyist: 500, expert: 1000, professional: 1200 },
    },
    wateringMethodMultipliers: {
      'hand-watering': 1.0,
      'drip-system': 0.9,
      'bottom-wicking': 0.95,
      'aeroponics': 0.7,
      'deep-water-culture': 1.0,
      'ebb-flow': 1.0,
    },
    weeklySchedule: {
      vegetative: {
        week1: { sensiA: 4.0, sensiB: 4.0 },   // Hobbyist start
        week2: { sensiA: 8.0, sensiB: 8.0 },   // Building up
        week3: { sensiA: 12.0, sensiB: 12.0 }, // Expert level
        week4: { sensiA: 16.0, sensiB: 16.0 }, // Full strength
      },
      flowering: {
        week1: { sensiA: 16.0, sensiB: 16.0 }, // Transition
        week2: { sensiA: 16.0, sensiB: 16.0 }, // Early flower
        week3: { sensiA: 16.0, sensiB: 16.0 }, // Peak bloom
        week4: { sensiA: 16.0, sensiB: 16.0 }, // Peak bloom
        week5: { sensiA: 16.0, sensiB: 16.0 }, // Peak bloom
        week6: { sensiA: 16.0, sensiB: 16.0 }, // Late flower
        week7: { sensiA: 16.0, sensiB: 16.0 }, // Final weeks
        week8: { sensiA: 8.0, sensiB: 8.0 },   // Pre-flush
        flush: { sensiA: 0, sensiB: 0 },       // Final flush
      },
    },
  },
  'fox-farm': {
    name: 'Fox Farm Soil Trio (2025)',
    description: 'Classic Natural & Organic 3-Part System',
    products: {
      seedling: [
        { name: 'Big Bloom', ratio: 7.5, unit: 'ml/gal' }, // 2 tbsp/gal
      ],
      vegetative: [
        { name: 'Grow Big', ratio: 7.5, unit: 'ml/gal' },  // 2 tbsp/gal
        { name: 'Big Bloom', ratio: 15.0, unit: 'ml/gal' }, // 4 tbsp/gal
      ],
      flowering: [
        { name: 'Tiger Bloom', ratio: 7.5, unit: 'ml/gal' }, // 2 tbsp/gal
        { name: 'Big Bloom', ratio: 15.0, unit: 'ml/gal' },  // 4 tbsp/gal
        { name: 'Grow Big', ratio: 3.75, unit: 'ml/gal', earlyFlower: true }, // 1 tbsp first weeks
      ],
      supplements: [
        { name: 'Open Sesame', ratio: 1.25, unit: 'g/gal', optional: true, floweringOnly: true, week: [1, 2] },
        { name: 'Beastie Bloomz', ratio: 1.25, unit: 'g/gal', optional: true, floweringOnly: true, week: [3, 4, 5] },
        { name: 'Cha Ching', ratio: 1.25, unit: 'g/gal', optional: true, floweringOnly: true, week: [6, 7] },
        { name: 'Sledgehammer', ratio: 7.5, unit: 'ml/gal', optional: true, flushOnly: true },
        { name: 'Kelp Me Kelp You', ratio: 3.75, unit: 'ml/gal', optional: true },
        { name: 'Microbe Brew', ratio: 7.5, unit: 'ml/gal', optional: true },
        { name: 'Wholly Mackerel', ratio: 3.75, unit: 'ml/gal', optional: true },
      ],
    },
    strengthMultipliers: {
      light: 0.5,      // Conservative feeding
      medium: 1.0,     // Standard strength
      aggressive: 1.5, // Heavy feeding
    },
    targetEC: {
      seedling: { light: 0.4, medium: 0.6, aggressive: 0.8 },
      vegetative: { light: 0.8, medium: 1.2, aggressive: 1.6 },
      flowering: { light: 1.0, medium: 1.4, aggressive: 1.8 },
    },
    targetTDS: {
      seedling: { light: 200, medium: 300, aggressive: 400 },
      vegetative: { light: 400, medium: 600, aggressive: 800 },
      flowering: { light: 500, medium: 700, aggressive: 900 },
    },
    wateringMethodMultipliers: {
      'hand-watering': 1.0,
      'drip-system': 0.9,
      'bottom-wicking': 0.95,
      'aeroponics': 0.8,
      'deep-water-culture': 0.9,
      'ebb-flow': 0.95,
    },
    weeklySchedule: {
      vegetative: {
        week1: { bigBloom: 7.5, growBig: 3.75 },   // Light start
        week2: { bigBloom: 11.25, growBig: 5.625 }, // Building up
        week3: { bigBloom: 15.0, growBig: 7.5 },    // Full strength
        week4: { bigBloom: 15.0, growBig: 7.5 },    // Full strength
      },
      flowering: {
        week1: { bigBloom: 15.0, tigerBloom: 3.75, growBig: 3.75 }, // Transition
        week2: { bigBloom: 15.0, tigerBloom: 7.5, growBig: 3.75 },  // Early flower
        week3: { bigBloom: 15.0, tigerBloom: 7.5 },                 // Drop Grow Big
        week4: { bigBloom: 15.0, tigerBloom: 7.5 },                 // Peak bloom
        week5: { bigBloom: 15.0, tigerBloom: 7.5 },                 // Peak bloom
        week6: { bigBloom: 15.0, tigerBloom: 7.5 },                 // Late flower
        week7: { bigBloom: 11.25, tigerBloom: 5.625 },              // Taper down
        week8: { bigBloom: 7.5, tigerBloom: 3.75 },                 // Pre-flush
        flush: { bigBloom: 0, tigerBloom: 0 },                      // Final flush
      },
    },
  },
  'canna': {
    name: 'Canna Coco A+B (2025)',
    description: 'Medium-Specific Coco Coir Formulation - Dutch Research',
    products: {
      seedling: [
        { name: 'Canna Coco A', ratio: 7.5, unit: 'ml/gal' },  // 2ml/L converted
        { name: 'Canna Coco B', ratio: 7.5, unit: 'ml/gal' },
      ],
      vegetative: [
        { name: 'Canna Coco A', ratio: 15.0, unit: 'ml/gal' }, // 4ml/L converted
        { name: 'Canna Coco B', ratio: 15.0, unit: 'ml/gal' },
      ],
      flowering: [
        { name: 'Canna Coco A', ratio: 18.75, unit: 'ml/gal' }, // 5ml/L converted
        { name: 'Canna Coco B', ratio: 18.75, unit: 'ml/gal' },
      ],
      supplements: [
        { name: 'Rhizotonic', ratio: 15.0, unit: 'ml/gal', optional: true, earlyGrowth: true },
        { name: 'Cannazym', ratio: 9.4, unit: 'ml/gal', optional: true },
        { name: 'Cannaboost', ratio: 7.5, unit: 'ml/gal', optional: true, floweringOnly: true },
        { name: 'PK 13/14', ratio: 5.65, unit: 'ml/gal', optional: true, floweringOnly: true, week: [3, 4] },
        { name: 'Cannastart', ratio: 11.3, unit: 'ml/gal', optional: true, earlyGrowth: true },
        { name: 'Cannacure', ratio: 9.4, unit: 'ml/gal', optional: true },
      ],
    },
    strengthMultipliers: {
      conservative: 0.6,  // Light feeding
      moderate: 0.8,      // Medium feeding  
      intensive: 1.0,     // Full strength
    },
    targetEC: {
      seedling: { conservative: 0.8, moderate: 1.0, intensive: 1.2 },
      vegetative: { conservative: 1.2, moderate: 1.5, intensive: 1.8 },
      flowering: { conservative: 1.4, moderate: 1.8, intensive: 2.2 },
    },
    targetTDS: {
      seedling: { conservative: 400, moderate: 500, intensive: 600 },
      vegetative: { conservative: 600, moderate: 750, intensive: 900 },
      flowering: { conservative: 700, moderate: 900, intensive: 1100 },
    },
    wateringMethodMultipliers: {
      'hand-watering': 1.0,
      'drip-system': 0.9,
      'bottom-wicking': 0.95,
      'aeroponics': 0.7,
      'deep-water-culture': 0.9,
      'ebb-flow': 0.95,
    },
    weeklySchedule: {
      vegetative: {
        week1: { cocoA: 7.5, cocoB: 7.5 },     // Light start 
        week2: { cocoA: 11.25, cocoB: 11.25 }, // Building up
        week3: { cocoA: 15.0, cocoB: 15.0 },   // Full veg strength
        week4: { cocoA: 15.0, cocoB: 15.0 },   // Full veg strength
      },
      flowering: {
        week1: { cocoA: 15.0, cocoB: 15.0 },   // Transition
        week2: { cocoA: 18.75, cocoB: 18.75 }, // Early flower
        week3: { cocoA: 18.75, cocoB: 18.75 }, // Peak bloom
        week4: { cocoA: 18.75, cocoB: 18.75 }, // Peak bloom
        week5: { cocoA: 18.75, cocoB: 18.75 }, // Peak bloom
        week6: { cocoA: 15.0, cocoB: 15.0 },   // Late flower
        week7: { cocoA: 11.25, cocoB: 11.25 }, // Taper down
        week8: { cocoA: 7.5, cocoB: 7.5 },     // Pre-flush
        flush: { cocoA: 0, cocoB: 0 },         // Final flush
      },
    },
  },
};

module.exports = {
  nutrientBrands
}; 
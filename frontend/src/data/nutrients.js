// Nutrient brand database (extracted from Calculator page)
const nutrientBrands = {
    'general-hydroponics': {
      name: 'General Hydroponics FloraSeries',
      description: 'The O.G. 3-Part Hydroponic-Based Nutrient System',
      scheduleMode: 'weekly',
      // Official FloraSeries Professional 3-Part weekly charts (ml/gal)
      schedules: {
        light: {
          weeks: [
            {
              weekNumber: 1,
              label: "Grow — Week 1",
              phaseTitle: "Seedling / Clone",
              growthStage: "Seedling/Clone",
              photoperiod: "18H",
              ecRange: "0.4–0.5",
              ppmRange500: "200–300",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 1.8, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 1.8, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 1.8, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: "Grow — Week 2",
              phaseTitle: "Early Growth",
              growthStage: "Early Growth",
              photoperiod: "18H",
              ecRange: "0.9–1.1",
              ppmRange500: "400–550",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 3.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 3.4, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 2.6, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: "Grow — Week 3",
              phaseTitle: "Early Growth",
              growthStage: "Early Growth",
              photoperiod: "18H",
              ecRange: "1.2–1.4",
              ppmRange500: "550–750",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 4.9, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 4.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 3.4, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: "Grow — Week 4",
              phaseTitle: "Late Growth",
              growthStage: "Late Growth",
              photoperiod: "18H",
              ecRange: "1.4–1.7",
              ppmRange500: "700–900",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 5.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 4.2, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: "Bloom — Week 1",
              phaseTitle: "Early Bloom",
              growthStage: "Early Bloom",
              photoperiod: "12H",
              ecRange: "2.0–2.4",
              ppmRange500: "1000–1200",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 7.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 6.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 8.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: "Bloom — Week 2",
              phaseTitle: "Early Bloom",
              growthStage: "Early Bloom",
              photoperiod: "12H",
              ecRange: "2.0–2.4",
              ppmRange500: "1000–1200",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 7.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 6.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 8.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 7,
              label: "Bloom — Week 3",
              phaseTitle: "Mid Bloom",
              growthStage: "Mid Bloom",
              photoperiod: "12H",
              ecRange: "1.4–1.7",
              ppmRange500: "700–850",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 4.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 4.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 6.6, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 8,
              label: "Bloom — Week 4",
              phaseTitle: "Mid Bloom",
              growthStage: "Mid Bloom",
              photoperiod: "12H",
              ecRange: "1.4–1.7",
              ppmRange500: "700–850",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 4.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 4.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 6.6, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 9,
              label: "Bloom — Week 5",
              phaseTitle: "Mid Bloom",
              growthStage: "Mid Bloom",
              photoperiod: "12H",
              ecRange: "1.4–1.7",
              ppmRange500: "700–850",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 4.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 4.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 6.6, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 10,
              label: "Bloom — Week 6",
              phaseTitle: "Late Bloom",
              growthStage: "Late Bloom",
              photoperiod: "12H",
              ecRange: "0.9–1.1",
              ppmRange500: "450–600",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 3.3, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 3.3, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 4, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 11,
              label: "Bloom — Week 7",
              phaseTitle: "Late Bloom",
              growthStage: "Late Bloom",
              photoperiod: "12H",
              ecRange: "0.9–1.1",
              ppmRange500: "450–600",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 3.3, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 3.3, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 4, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 12,
              label: "Bloom — Week 8",
              phaseTitle: "Ripen",
              growthStage: "Ripen",
              photoperiod: "12H",
              ecRange: "0.6–0.8",
              ppmRange500: "300–400",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 2, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 2, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 3.2, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 13,
              label: "Bloom — Week 9",
              phaseTitle: "Flush",
              growthStage: "Flush",
              photoperiod: "12H",
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        medium: {
          weeks: [
            {
              weekNumber: 1,
              label: "Grow — Week 1",
              phaseTitle: "Seedling / Clone",
              growthStage: "Seedling/Clone",
              photoperiod: "18H",
              ecRange: "0.5–0.6",
              ppmRange500: "250–350",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 2, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 2, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 2, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: "Grow — Week 2",
              phaseTitle: "Early Growth",
              growthStage: "Early Growth",
              photoperiod: "18H",
              ecRange: "1.0–1.2",
              ppmRange500: "500–650",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 4.2, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 3.8, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 3, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: "Grow — Week 3",
              phaseTitle: "Early Growth",
              growthStage: "Early Growth",
              photoperiod: "18H",
              ecRange: "1.3–1.6",
              ppmRange500: "650–850",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 5.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 5.2, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 3.8, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: "Grow — Week 4",
              phaseTitle: "Late Growth",
              growthStage: "Late Growth",
              photoperiod: "18H",
              ecRange: "1.6–2.0",
              ppmRange500: "800–1000",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 6.8, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 6.4, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 4.8, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: "Bloom — Week 1",
              phaseTitle: "Early Bloom",
              growthStage: "Early Bloom",
              photoperiod: "12H",
              ecRange: "1.6–1.9",
              ppmRange500: "800–1000",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 6.1, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 5.3, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 6.8, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: "Bloom — Week 2",
              phaseTitle: "Early Bloom",
              growthStage: "Early Bloom",
              photoperiod: "12H",
              ecRange: "1.6–1.9",
              ppmRange500: "800–1000",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 6.1, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 5.3, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 6.8, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 7,
              label: "Bloom — Week 3",
              phaseTitle: "Mid Bloom",
              growthStage: "Mid Bloom",
              photoperiod: "12H",
              ecRange: "1.6–1.9",
              ppmRange500: "800–1000",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 5.3, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 5.3, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 7.6, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 8,
              label: "Bloom — Week 4",
              phaseTitle: "Mid Bloom",
              growthStage: "Mid Bloom",
              photoperiod: "12H",
              ecRange: "1.6–1.9",
              ppmRange500: "800–1000",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 5.3, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 5.3, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 7.6, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 9,
              label: "Bloom — Week 5",
              phaseTitle: "Mid Bloom",
              growthStage: "Mid Bloom",
              photoperiod: "12H",
              ecRange: "1.6–1.9",
              ppmRange500: "800–1000",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 5.3, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 5.3, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 7.6, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 12,
              label: "Bloom — Week 8",
              phaseTitle: "Ripen",
              growthStage: "Ripen",
              photoperiod: "12H",
              ecRange: "0.7–0.9",
              ppmRange500: "350–450",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 2.3, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 2.3, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 3.6, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 13,
              label: "Bloom — Week 9",
              phaseTitle: "Flush",
              growthStage: "Flush",
              photoperiod: "12H",
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        aggressive: {
          weeks: [
            {
              weekNumber: 2,
              label: "Grow — Week 2",
              phaseTitle: "Early Growth",
              growthStage: "Early Growth",
              photoperiod: "18H",
              ecRange: "1.3–1.5",
              ppmRange500: "600–800",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 5.2, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 4.8, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 3.7, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: "Grow — Week 3",
              phaseTitle: "Early Growth",
              growthStage: "Early Growth",
              photoperiod: "18H",
              ecRange: "1.7–2.1",
              ppmRange500: "850–1050",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 7, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 6.5, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 4.8, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: "Grow — Week 4",
              phaseTitle: "Late Growth",
              growthStage: "Late Growth",
              photoperiod: "18H",
              ecRange: "2.0–2.5",
              ppmRange500: "1050–1250",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 8.5, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 8, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 6, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: "Bloom — Week 1",
              phaseTitle: "Early Bloom",
              growthStage: "Early Bloom",
              photoperiod: "12H",
              ecRange: "2.0–2.4",
              ppmRange500: "1000–1200",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 7.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 6.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 8.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: "Bloom — Week 2",
              phaseTitle: "Early Bloom",
              growthStage: "Early Bloom",
              photoperiod: "12H",
              ecRange: "2.0–2.4",
              ppmRange500: "1000–1200",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 7.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 6.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 8.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 7,
              label: "Bloom — Week 3",
              phaseTitle: "Mid Bloom",
              growthStage: "Mid Bloom",
              photoperiod: "12H",
              ecRange: "1.9–2.4",
              ppmRange500: "950–1200",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 6.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 6.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 9.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 8,
              label: "Bloom — Week 4",
              phaseTitle: "Mid Bloom",
              growthStage: "Mid Bloom",
              photoperiod: "12H",
              ecRange: "1.9–2.4",
              ppmRange500: "950–1200",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 6.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 6.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 9.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 9,
              label: "Bloom — Week 5",
              phaseTitle: "Mid Bloom",
              growthStage: "Mid Bloom",
              photoperiod: "12H",
              ecRange: "1.9–2.4",
              ppmRange500: "950–1200",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 6.6, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 6.6, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 9.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 10,
              label: "Bloom — Week 6",
              phaseTitle: "Late Bloom",
              growthStage: "Late Bloom",
              photoperiod: "12H",
              ecRange: "1.3–1.6",
              ppmRange500: "650–800",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 4.7, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 4.7, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 5.7, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 11,
              label: "Bloom — Week 7",
              phaseTitle: "Late Bloom",
              growthStage: "Late Bloom",
              photoperiod: "12H",
              ecRange: "1.3–1.6",
              ppmRange500: "650–800",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 4.7, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 4.7, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 5.7, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 12,
              label: "Bloom — Week 8",
              phaseTitle: "Ripen",
              growthStage: "Ripen",
              photoperiod: "12H",
              ecRange: "0.9–1.1",
              ppmRange500: "450–550",
              flush: false,
              products: [
                { name: "FloraMicro", ratio: 2.8, unit: 'ml/gal' },
                { name: "FloraGro", ratio: 2.8, unit: 'ml/gal' },
                { name: "FloraBloom", ratio: 4.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 13,
              label: "Bloom — Week 9",
              phaseTitle: "Flush",
              growthStage: "Flush",
              photoperiod: "12H",
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
      },
      products: {
        supplements: [
          { name: 'CaliMagic', ratio: 2.5, unit: 'ml/gal', optional: true },
          { name: 'Armor Si', ratio: 1.25, unit: 'ml/gal', optional: true },
          { name: 'Hydroguard', ratio: 5.0, unit: 'ml/gal', hydroOnly: true }
        ]
      }
    },
    'advanced-nutrients': {
      name: 'Advanced Nutrients pH Perfect GMB',
      description: 'pH Perfect Technology for Cannabis - Micro/Grow/Bloom',
      scheduleMode: 'weekly',
      scheduleStrengthHint: 'an-recipes',
      // Official pH Perfect GMB Global chart (ml/L): Top-Shelf = light/medium, Master = aggressive
      schedules: {
        light: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Grow — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 1, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 1, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 1, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 2,
              label: 'Grow — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 2, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 2, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 2, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Grow — Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 3, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 3, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 3, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Grow — Week 4',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Bloom — Week 1',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Ignitor', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Bloom — Week 2',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Ignitor', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Bloom — Week 3',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Bloom — Week 4',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Bloom — Week 5',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Bloom — Week 6',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Overdrive', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Bloom — Week 7',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Overdrive', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 12,
              label: 'Bloom — Week 8',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        medium: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Grow — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 1, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 1, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 1, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 2,
              label: 'Grow — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 2, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 2, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 2, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Grow — Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 3, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 3, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 3, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Grow — Week 4',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Bloom — Week 1',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Ignitor', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Bloom — Week 2',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Ignitor', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Bloom — Week 3',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Bloom — Week 4',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Bloom — Week 5',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Bloom — Week 6',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Overdrive', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Bloom — Week 7',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Overdrive', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 12,
              label: 'Bloom — Week 8',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        aggressive: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Grow — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 1, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 1, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 1, unit: 'ml/L' },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Tarantula', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Piranha', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 2,
              label: 'Grow — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 2, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 2, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 2, unit: 'ml/L' },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Tarantula', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Piranha', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Grow — Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 3, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 3, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 3, unit: 'ml/L' },
                { name: 'Rhino Skin', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Grow — Week 4',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Rhino Skin', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Bloom — Week 1',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Tarantula', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Piranha', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Factor X', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Rhino Skin', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Ignitor', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Bloom — Week 2',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Voodoo Juice', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Tarantula', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Piranha', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Factor X', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Rhino Skin', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Ignitor', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Bloom — Week 3',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Bud Factor X', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Rhino Skin', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Nirvana', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Bloom — Week 4',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Bud Factor X', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Rhino Skin', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Nirvana', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Bloom — Week 5',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Bud Factor X', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Rhino Skin', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Nirvana', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Big Bud', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Bloom — Week 6',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Bud Factor X', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Rhino Skin', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Nirvana', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Overdrive', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Bloom — Week 7',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'pH Perfect Grow', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Micro', ratio: 4, unit: 'ml/L' },
                { name: 'pH Perfect Bloom', ratio: 4, unit: 'ml/L' },
                { name: 'Bud Factor X', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Rhino Skin', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'B-52', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Nirvana', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Overdrive', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Sensizym', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Bud Candy', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 12,
              label: 'Bloom — Week 8',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
      },
      products: {
        supplements: []
      }
    },
    'fox-farm': {
      name: 'Fox Farm Trio',
      description: 'Natural & Organic Based Plant Food',
      scheduleMode: 'weekly',
      scheduleStrengthHint: 'single-chart',
      // Official FoxFarm Soil Feeding Schedule (tsp/gal)
      schedules: {
        light: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Seedlings / Cuttings',
              phaseTitle: 'Seedlings / Cuttings',
              growthStage: 'Seedlings / Cuttings',
              photoperiod: '18H',
              ecRange: '1.00–1.20',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '1.10–1.30',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '1.70–2.10',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '2.60–3.00',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Week 4',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '2.40–2.80',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Week 5',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.50–2.90',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Week 6',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.50–2.90',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Week 7',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.60–3.00',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Week 8',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '3.40–3.80',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Week 9',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '3.00–3.40',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 1, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Week 10',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.10–2.50',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 12,
              label: 'Week 11',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '1.80–2.20',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 13,
              label: 'Week 12',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '1.40–1.80',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
              ]
            },
          ]
        },
        medium: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Seedlings / Cuttings',
              phaseTitle: 'Seedlings / Cuttings',
              growthStage: 'Seedlings / Cuttings',
              photoperiod: '18H',
              ecRange: '1.00–1.20',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '1.10–1.30',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '1.70–2.10',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '2.60–3.00',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Week 4',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '2.40–2.80',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Week 5',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.50–2.90',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Week 6',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.50–2.90',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Week 7',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.60–3.00',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Week 8',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '3.40–3.80',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Week 9',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '3.00–3.40',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 1, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Week 10',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.10–2.50',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 12,
              label: 'Week 11',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '1.80–2.20',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 13,
              label: 'Week 12',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '1.40–1.80',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
              ]
            },
          ]
        },
        aggressive: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Seedlings / Cuttings',
              phaseTitle: 'Seedlings / Cuttings',
              growthStage: 'Seedlings / Cuttings',
              photoperiod: '18H',
              ecRange: '1.00–1.20',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '1.10–1.30',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '1.70–2.10',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '2.60–3.00',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 6, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Week 4',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '2.40–2.80',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Week 5',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.50–2.90',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Week 6',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.50–2.90',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Week 7',
              phaseTitle: 'Early Bloom',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.60–3.00',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Week 8',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '3.40–3.80',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 2, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Week 9',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '3.00–3.40',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Grow Big', ratio: 1, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
                { name: 'Cal-Mag', ratio: 1, unit: 'tsp/gal', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Week 10',
              phaseTitle: 'Mid Bloom',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.10–2.50',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 12,
              label: 'Week 11',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '1.80–2.20',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 2, unit: 'tsp/gal' },
              ]
            },
            {
              weekNumber: 13,
              label: 'Week 12',
              phaseTitle: 'Late Bloom',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '1.40–1.80',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Big Bloom', ratio: 3, unit: 'tsp/gal' },
                { name: 'Tiger Bloom', ratio: 1, unit: 'tsp/gal' },
              ]
            },
          ]
        },
      },
      products: {
        supplements: []
      }
    },
    'canna': {
      name: 'Canna Coco',
      description: 'Specifically designed for Coco Coir',
      scheduleMode: 'weekly',
      scheduleStrengthHint: 'canna-ranges',
      // Official CANNA Coco grow schedule (ml/10L ranges → ml/L; light/mid/high)
      schedules: {
        light: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Rooting — Days 1–5',
              phaseTitle: 'Rooting',
              growthStage: 'Rooting',
              photoperiod: '18H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.6, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.6, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 4, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 2,
              label: 'Rooting — Days 6–25',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.6, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.6, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Generative — Week 1',
              phaseTitle: 'Generative I',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.9, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.9, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Generative — Week 2',
              phaseTitle: 'Generative I',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.9, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.9, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Generative — Week 3',
              phaseTitle: 'Generative I',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.9, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.9, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Generative — Week 4',
              phaseTitle: 'Generative I',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.9, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.9, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Generative — Week 5',
              phaseTitle: 'Generative I',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.9, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.9, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Generative — Week 6',
              phaseTitle: 'Generative II',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '2.4–2.9',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.9, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.9, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'PK 13/14', ratio: 1.5, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Generative — Week 7',
              phaseTitle: 'Generative III',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.6, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.6, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Generative — Week 8',
              phaseTitle: 'Generative IV',
              growthStage: 'Ripen',
              photoperiod: '12H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.6, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.6, unit: 'ml/L' },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Generative — Week 9',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              photoperiod: '12H',
              ecRange: '0.4',
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        medium: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Rooting — Days 1–5',
              phaseTitle: 'Rooting',
              growthStage: 'Rooting',
              photoperiod: '18H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.95, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.95, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 4, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 2,
              label: 'Rooting — Days 6–25',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.95, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.95, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Generative — Week 1',
              phaseTitle: 'Generative I',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.3, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.3, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Generative — Week 2',
              phaseTitle: 'Generative I',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.3, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.3, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Generative — Week 3',
              phaseTitle: 'Generative I',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.3, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.3, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 3, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Generative — Week 4',
              phaseTitle: 'Generative I',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.3, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.3, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 3, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Generative — Week 5',
              phaseTitle: 'Generative I',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.3, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.3, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 3, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Generative — Week 6',
              phaseTitle: 'Generative II',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '2.4–2.9',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.3, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.3, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 3, unit: 'ml/L', optional: true },
                { name: 'PK 13/14', ratio: 1.5, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Generative — Week 7',
              phaseTitle: 'Generative III',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.95, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.95, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 3, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Generative — Week 8',
              phaseTitle: 'Generative IV',
              growthStage: 'Ripen',
              photoperiod: '12H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 2.95, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 2.95, unit: 'ml/L' },
                { name: 'Cannazym', ratio: 3.75, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 3, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Generative — Week 9',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              photoperiod: '12H',
              ecRange: '0.4',
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        aggressive: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Rooting — Days 1–5',
              phaseTitle: 'Rooting',
              growthStage: 'Rooting',
              photoperiod: '18H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.3, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.3, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 4, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 2,
              label: 'Rooting — Days 6–25',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.3, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.3, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Generative — Week 1',
              phaseTitle: 'Generative I',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.7, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.7, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Generative — Week 2',
              phaseTitle: 'Generative I',
              growthStage: 'Early Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.7, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.7, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 2, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 2, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Generative — Week 3',
              phaseTitle: 'Generative I',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.7, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.7, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 4, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Generative — Week 4',
              phaseTitle: 'Generative I',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.7, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.7, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 4, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Generative — Week 5',
              phaseTitle: 'Generative I',
              growthStage: 'Mid Bloom',
              photoperiod: '12H',
              ecRange: '2.0–2.4',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.7, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.7, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 4, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Generative — Week 6',
              phaseTitle: 'Generative II',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '2.4–2.9',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.7, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.7, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 4, unit: 'ml/L', optional: true },
                { name: 'PK 13/14', ratio: 1.5, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Generative — Week 7',
              phaseTitle: 'Generative III',
              growthStage: 'Late Bloom',
              photoperiod: '12H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.3, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.3, unit: 'ml/L' },
                { name: 'Rhizotonic', ratio: 0.5, unit: 'ml/L', optional: true },
                { name: 'Cannazym', ratio: 2.5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 4, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Generative — Week 8',
              phaseTitle: 'Generative IV',
              growthStage: 'Ripen',
              photoperiod: '12H',
              ecRange: '1.8–2.2',
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Canna Coco A', ratio: 3.3, unit: 'ml/L' },
                { name: 'Canna Coco B', ratio: 3.3, unit: 'ml/L' },
                { name: 'Cannazym', ratio: 5, unit: 'ml/L', optional: true },
                { name: 'Cannaboost', ratio: 4, unit: 'ml/L', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Generative — Week 9',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              photoperiod: '12H',
              ecRange: '0.4',
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
      },
      products: {
        supplements: []
      }
    },
    'jack-nutrients': {
      name: "Jack's Nutrients 321",
      description: 'Professional Dry Nutrients - Ultra Concentrated',
      scheduleMode: 'weekly',
      scheduleStrengthHint: 'single-chart',
      // Official Jack's 321 bulletin + Cannabis/Hemp nutrition schedule (g/gal)
      schedules: {
        light: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Clone',
              phaseTitle: 'Clone',
              growthStage: 'Clone',
              ecRange: '1.0–1.2',
              ppmRange500: '500–600',
              flush: false,
              products: [
                { name: "Jack's 15-6-17 Clone", ratio: 3.15, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Vegetative',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              ecRange: '1.8–2.4',
              ppmRange500: '900–1200',
              flush: false,
              products: [
                { name: "Jack's 5-12-26", ratio: 3.6, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 1.1, unit: 'g/gal' },
                { name: 'Calcium Nitrate', ratio: 2.4, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Bud Set',
              phaseTitle: 'Bud Set',
              growthStage: 'Bud Set',
              ecRange: '1.8–2.1',
              ppmRange500: '900–1050',
              flush: false,
              products: [
                { name: "Jack's Bloom 10-30-20", ratio: 5.68, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 0.99, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: 'Flower',
              phaseTitle: 'Flower',
              growthStage: 'Flower',
              ecRange: '1.8–2.4',
              ppmRange500: '900–1200',
              flush: false,
              products: [
                { name: "Jack's 5-12-26", ratio: 3.6, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 1.1, unit: 'g/gal' },
                { name: 'Calcium Nitrate', ratio: 2.4, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: 'Late Flower',
              phaseTitle: 'Late Flower',
              growthStage: 'Late Flower',
              ecRange: '2.2–2.6',
              ppmRange500: '1100–1300',
              flush: false,
              products: [
                { name: "Jack's 0-12-26", ratio: 3.79, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 0.99, unit: 'g/gal' },
                { name: 'Calcium Nitrate', ratio: 2.52, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: 'Harvest / Flush',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        medium: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Clone',
              phaseTitle: 'Clone',
              growthStage: 'Clone',
              ecRange: '1.0–1.2',
              ppmRange500: '500–600',
              flush: false,
              products: [
                { name: "Jack's 15-6-17 Clone", ratio: 3.15, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Vegetative',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              ecRange: '1.8–2.4',
              ppmRange500: '900–1200',
              flush: false,
              products: [
                { name: "Jack's 5-12-26", ratio: 3.6, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 1.1, unit: 'g/gal' },
                { name: 'Calcium Nitrate', ratio: 2.4, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Bud Set',
              phaseTitle: 'Bud Set',
              growthStage: 'Bud Set',
              ecRange: '1.8–2.1',
              ppmRange500: '900–1050',
              flush: false,
              products: [
                { name: "Jack's Bloom 10-30-20", ratio: 5.68, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 0.99, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: 'Flower',
              phaseTitle: 'Flower',
              growthStage: 'Flower',
              ecRange: '1.8–2.4',
              ppmRange500: '900–1200',
              flush: false,
              products: [
                { name: "Jack's 5-12-26", ratio: 3.6, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 1.1, unit: 'g/gal' },
                { name: 'Calcium Nitrate', ratio: 2.4, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: 'Late Flower',
              phaseTitle: 'Late Flower',
              growthStage: 'Late Flower',
              ecRange: '2.2–2.6',
              ppmRange500: '1100–1300',
              flush: false,
              products: [
                { name: "Jack's 0-12-26", ratio: 3.79, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 0.99, unit: 'g/gal' },
                { name: 'Calcium Nitrate', ratio: 2.52, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: 'Harvest / Flush',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        aggressive: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Clone',
              phaseTitle: 'Clone',
              growthStage: 'Clone',
              ecRange: '1.0–1.2',
              ppmRange500: '500–600',
              flush: false,
              products: [
                { name: "Jack's 15-6-17 Clone", ratio: 3.15, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Vegetative',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              ecRange: '1.8–2.4',
              ppmRange500: '900–1200',
              flush: false,
              products: [
                { name: "Jack's 5-12-26", ratio: 3.6, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 1.1, unit: 'g/gal' },
                { name: 'Calcium Nitrate', ratio: 2.4, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Bud Set',
              phaseTitle: 'Bud Set',
              growthStage: 'Bud Set',
              ecRange: '1.8–2.1',
              ppmRange500: '900–1050',
              flush: false,
              products: [
                { name: "Jack's Bloom 10-30-20", ratio: 5.68, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 0.99, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: 'Flower',
              phaseTitle: 'Flower',
              growthStage: 'Flower',
              ecRange: '1.8–2.4',
              ppmRange500: '900–1200',
              flush: false,
              products: [
                { name: "Jack's 5-12-26", ratio: 3.6, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 1.1, unit: 'g/gal' },
                { name: 'Calcium Nitrate', ratio: 2.4, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: 'Late Flower',
              phaseTitle: 'Late Flower',
              growthStage: 'Late Flower',
              ecRange: '2.2–2.6',
              ppmRange500: '1100–1300',
              flush: false,
              products: [
                { name: "Jack's 0-12-26", ratio: 3.79, unit: 'g/gal' },
                { name: 'Epsom Salt', ratio: 0.99, unit: 'g/gal' },
                { name: 'Calcium Nitrate', ratio: 2.52, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: 'Harvest / Flush',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
      },
      products: {
        supplements: []
      }
    },
    'megacrop': {
      name: 'MegaCrop by Greenleaf',
      description: 'All-in-One Complete Nutrient - Seed to Harvest',
      scheduleMode: 'weekly',
      scheduleStrengthHint: 'single-chart',
      // Official MegaCrop 1-Part calculator rates (g/gal)
      schedules: {
        light: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Veg 1 — Seedling',
              phaseTitle: 'Veg 1',
              growthStage: 'Seedling/Small Plants',
              ecRange: '0.55',
              ppmRange500: '277',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 2, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg 2 — Normal Veg',
              phaseTitle: 'Veg 2',
              growthStage: 'Normal Veg',
              ecRange: '1.11',
              ppmRange500: '555',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 4, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg 3 — Extended Veg',
              phaseTitle: 'Veg 3',
              growthStage: 'Extended Veg',
              ecRange: '1.25',
              ppmRange500: '625',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 4.5, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: 'Bloom — Weeks 1–2',
              phaseTitle: 'Bloom Weeks 1–2',
              growthStage: 'Early Bloom',
              ecRange: '1.39',
              ppmRange500: '695',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 5, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: 'Bloom — Weeks 3–4',
              phaseTitle: 'Bloom Weeks 3–4',
              growthStage: 'Mid Bloom',
              ecRange: '1.53',
              ppmRange500: '765',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 5.5, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: 'Bloom — Week 5–Harvest',
              phaseTitle: 'Bloom Week 5–Harvest',
              growthStage: 'Late Bloom',
              ecRange: '1.67',
              ppmRange500: '835',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 6, unit: 'g/gal' },
              ]
            },
          ]
        },
        medium: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Veg 1 — Seedling',
              phaseTitle: 'Veg 1',
              growthStage: 'Seedling/Small Plants',
              ecRange: '0.55',
              ppmRange500: '277',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 2, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg 2 — Normal Veg',
              phaseTitle: 'Veg 2',
              growthStage: 'Normal Veg',
              ecRange: '1.11',
              ppmRange500: '555',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 4, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg 3 — Extended Veg',
              phaseTitle: 'Veg 3',
              growthStage: 'Extended Veg',
              ecRange: '1.25',
              ppmRange500: '625',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 4.5, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: 'Bloom — Weeks 1–2',
              phaseTitle: 'Bloom Weeks 1–2',
              growthStage: 'Early Bloom',
              ecRange: '1.39',
              ppmRange500: '695',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 5, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: 'Bloom — Weeks 3–4',
              phaseTitle: 'Bloom Weeks 3–4',
              growthStage: 'Mid Bloom',
              ecRange: '1.53',
              ppmRange500: '765',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 5.5, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: 'Bloom — Week 5–Harvest',
              phaseTitle: 'Bloom Week 5–Harvest',
              growthStage: 'Late Bloom',
              ecRange: '1.67',
              ppmRange500: '835',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 6, unit: 'g/gal' },
              ]
            },
          ]
        },
        aggressive: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Veg 1 — Seedling',
              phaseTitle: 'Veg 1',
              growthStage: 'Seedling/Small Plants',
              ecRange: '0.55',
              ppmRange500: '277',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 2, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg 2 — Normal Veg',
              phaseTitle: 'Veg 2',
              growthStage: 'Normal Veg',
              ecRange: '1.11',
              ppmRange500: '555',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 4, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg 3 — Extended Veg',
              phaseTitle: 'Veg 3',
              growthStage: 'Extended Veg',
              ecRange: '1.25',
              ppmRange500: '625',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 4.5, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: 'Bloom — Weeks 1–2',
              phaseTitle: 'Bloom Weeks 1–2',
              growthStage: 'Early Bloom',
              ecRange: '1.39',
              ppmRange500: '695',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 5, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: 'Bloom — Weeks 3–4',
              phaseTitle: 'Bloom Weeks 3–4',
              growthStage: 'Mid Bloom',
              ecRange: '1.53',
              ppmRange500: '765',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 5.5, unit: 'g/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: 'Bloom — Week 5–Harvest',
              phaseTitle: 'Bloom Week 5–Harvest',
              growthStage: 'Late Bloom',
              ecRange: '1.67',
              ppmRange500: '835',
              flush: false,
              products: [
                { name: 'MegaCrop', ratio: 6, unit: 'g/gal' },
              ]
            },
          ]
        },
      },
      products: {
        supplements: [
          { name: 'Bud Explosion PK', ratio: 1.0, unit: 'g/gal', optional: true, floweringOnly: true },
          { name: 'CalMag Pro', ratio: 1.0, unit: 'g/gal', optional: true }
        ]
      }
    },
    'botanicare': {
      name: 'Botanicare Pure Blend Pro',
      description: 'Premium Natural & Organic Based Nutrients',
      scheduleMode: 'weekly',
      scheduleStrengthHint: 'single-chart',
      // Official Pure Blend Pro Standard weekly chart (ml/gal)
      schedules: {
        light: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Grow — Week 1',
              phaseTitle: 'Seedlings / Clones',
              growthStage: 'Seedlings / Clones',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 7, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 15, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 18, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: 'Veg — Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 20, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: 'Bloom — Week 1',
              phaseTitle: 'Bloom Transition',
              growthStage: 'Bloom Transition',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 25, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: 'Bloom — Week 2',
              phaseTitle: 'Bloom Transition',
              growthStage: 'Bloom Transition',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 25, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 7,
              label: 'Bloom — Week 3',
              phaseTitle: 'Bloom Transition',
              growthStage: 'Bloom Transition',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 27, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 8,
              label: 'Bloom — Week 4',
              phaseTitle: 'Flowering / Fruiting',
              growthStage: 'Flowering / Fruiting',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 30, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 9,
              label: 'Bloom — Week 5',
              phaseTitle: 'Flowering / Fruiting',
              growthStage: 'Flowering / Fruiting',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 30, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 10,
              label: 'Bloom — Week 6',
              phaseTitle: 'Flowering / Fruiting',
              growthStage: 'Flowering / Fruiting',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 30, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 11,
              label: 'Bloom — Week 7',
              phaseTitle: 'Ripening',
              growthStage: 'Ripening',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 25, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 12,
              label: 'Bloom — Week 8',
              phaseTitle: 'Ripening',
              growthStage: 'Ripening',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 20, unit: 'ml/gal' },
              ]
            },
          ]
        },
        medium: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Grow — Week 1',
              phaseTitle: 'Seedlings / Clones',
              growthStage: 'Seedlings / Clones',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 7, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 15, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 18, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: 'Veg — Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 20, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: 'Bloom — Week 1',
              phaseTitle: 'Bloom Transition',
              growthStage: 'Bloom Transition',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 25, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: 'Bloom — Week 2',
              phaseTitle: 'Bloom Transition',
              growthStage: 'Bloom Transition',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 25, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 7,
              label: 'Bloom — Week 3',
              phaseTitle: 'Bloom Transition',
              growthStage: 'Bloom Transition',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 27, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 8,
              label: 'Bloom — Week 4',
              phaseTitle: 'Flowering / Fruiting',
              growthStage: 'Flowering / Fruiting',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 30, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 9,
              label: 'Bloom — Week 5',
              phaseTitle: 'Flowering / Fruiting',
              growthStage: 'Flowering / Fruiting',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 30, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 10,
              label: 'Bloom — Week 6',
              phaseTitle: 'Flowering / Fruiting',
              growthStage: 'Flowering / Fruiting',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 30, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 11,
              label: 'Bloom — Week 7',
              phaseTitle: 'Ripening',
              growthStage: 'Ripening',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 25, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 12,
              label: 'Bloom — Week 8',
              phaseTitle: 'Ripening',
              growthStage: 'Ripening',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 20, unit: 'ml/gal' },
              ]
            },
          ]
        },
        aggressive: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Grow — Week 1',
              phaseTitle: 'Seedlings / Clones',
              growthStage: 'Seedlings / Clones',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 7, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 15, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 18, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: 'Veg — Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Grow', ratio: 20, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: 'Bloom — Week 1',
              phaseTitle: 'Bloom Transition',
              growthStage: 'Bloom Transition',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 25, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: 'Bloom — Week 2',
              phaseTitle: 'Bloom Transition',
              growthStage: 'Bloom Transition',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 25, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 7,
              label: 'Bloom — Week 3',
              phaseTitle: 'Bloom Transition',
              growthStage: 'Bloom Transition',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 27, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 8,
              label: 'Bloom — Week 4',
              phaseTitle: 'Flowering / Fruiting',
              growthStage: 'Flowering / Fruiting',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 30, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 9,
              label: 'Bloom — Week 5',
              phaseTitle: 'Flowering / Fruiting',
              growthStage: 'Flowering / Fruiting',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 30, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 10,
              label: 'Bloom — Week 6',
              phaseTitle: 'Flowering / Fruiting',
              growthStage: 'Flowering / Fruiting',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 30, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 11,
              label: 'Bloom — Week 7',
              phaseTitle: 'Ripening',
              growthStage: 'Ripening',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 25, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 12,
              label: 'Bloom — Week 8',
              phaseTitle: 'Ripening',
              growthStage: 'Ripening',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Pure Blend Pro Bloom', ratio: 20, unit: 'ml/gal' },
              ]
            },
          ]
        },
      },
      products: {
        supplements: [
          { name: 'Cal-Mag Plus', ratio: 5.0, unit: 'ml/gal', optional: true },
          { name: 'Hydroguard', ratio: 2.0, unit: 'ml/L', hydroOnly: true }
        ]
      }
    },
    'dyna-gro': {
      name: 'Dyna-Gro Foliage Pro + Bloom',
      description: 'Simple 2-Part System - Originally for Orchids',
      scheduleMode: 'weekly',
      scheduleStrengthHint: 'dyna-system',
      // Official Dyna-Gro feed chart (ml/gal): Soil/DTW = light/medium, Recirculating = aggressive
      schedules: {
        light: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Veg — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '345',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 2.5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '420',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg — Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '575',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Veg — Week 4',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '575',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Flower — Week 1',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '885',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Flower — Week 2',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1060',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Flower — Week 3',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1215',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Flower — Week 4',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1215',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Flower — Week 5',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1390',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 10, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Flower — Week 6',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1080',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Flower — Week 7',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '615',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 12,
              label: 'Flower — Week 8',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '615',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 13,
              label: 'Flush — Week 9',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        medium: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Veg — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '345',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 2.5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '420',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg — Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '575',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Veg — Week 4',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '575',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Flower — Week 1',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '885',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Flower — Week 2',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1060',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Flower — Week 3',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1215',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Flower — Week 4',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1215',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Flower — Week 5',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1390',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 10, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Flower — Week 6',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1080',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Flower — Week 7',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '615',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 12,
              label: 'Flower — Week 8',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '615',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 13,
              label: 'Flush — Week 9',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        aggressive: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Veg — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '420',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '690',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 10, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg — Week 3',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '845',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Veg — Week 4',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              photoperiod: '18H',
              ecRange: null,
              ppmRange500: '1000',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Flower — Week 1',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1040',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Flower — Week 2',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1215',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Flower — Week 3',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1215',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Flower — Week 4',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1215',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Foliage Pro 9-3-6', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Flower — Week 5',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1390',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 10, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Flower — Week 6',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1080',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Flower — Week 7',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '1080',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 10, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 12,
              label: 'Flower — Week 8',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: '615',
              flush: false,
              products: [
                { name: 'Pro-TeKt (Silica)', ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'Bloom 3-12-6', ratio: 5, unit: 'ml/gal' },
                { name: 'Mag-Pro', ratio: 2.5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 13,
              label: 'Flush — Week 9',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              photoperiod: '12H',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
      },
      products: {
        supplements: []
      }
    },
    'house-garden': {
      name: 'House & Garden Aqua Flakes',
      description: 'Premium Dutch Nutrients - Tested on Cannabis',
      scheduleMode: 'weekly',
      scheduleStrengthHint: 'single-chart',
      // Official US 8-week Aqua Flakes chart (ml/gal) + flush
      schedules: {
        light: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Cuttings / Seedlings',
              phaseTitle: 'Cuttings / Seedlings',
              growthStage: 'Cuttings / Seedlings',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 5.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 5.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 6, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 6, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Flower — Week 1',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 6.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 6.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Flower — Week 2',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Flower — Week 3',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 8.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 8.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Flower — Week 4',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 9.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 9.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Flower — Week 5',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 9, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 9, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Top Booster', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Flower — Week 6',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Shooting Powder', ratio: 2.6, unit: 'g/gal', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Flower — Week 7',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Shooting Powder', ratio: 5.2, unit: 'g/gal', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Flower — Week 8',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Shooting Powder', ratio: 5.2, unit: 'g/gal', optional: true },
              ]
            },
            {
              weekNumber: 12,
              label: 'Flush',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        medium: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Cuttings / Seedlings',
              phaseTitle: 'Cuttings / Seedlings',
              growthStage: 'Cuttings / Seedlings',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 5.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 5.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 6, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 6, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Flower — Week 1',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 6.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 6.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Flower — Week 2',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Flower — Week 3',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 8.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 8.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Flower — Week 4',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 9.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 9.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Flower — Week 5',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 9, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 9, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Top Booster', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Flower — Week 6',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Shooting Powder', ratio: 2.6, unit: 'g/gal', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Flower — Week 7',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Shooting Powder', ratio: 5.2, unit: 'g/gal', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Flower — Week 8',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Shooting Powder', ratio: 5.2, unit: 'g/gal', optional: true },
              ]
            },
            {
              weekNumber: 12,
              label: 'Flush',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        aggressive: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Cuttings / Seedlings',
              phaseTitle: 'Cuttings / Seedlings',
              growthStage: 'Cuttings / Seedlings',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 2.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 2,
              label: 'Veg — Week 1',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 5.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 5.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Veg — Week 2',
              phaseTitle: 'Vegetative',
              growthStage: 'Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 6, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 6, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Flower — Week 1',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 6.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 6.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Flower — Week 2',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Flower — Week 3',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 8.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 8.5, unit: 'ml/gal' },
                { name: 'Roots Excelurator', ratio: 1, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Flower — Week 4',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 9.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 9.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Flower — Week 5',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 9, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 9, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Top Booster', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 9,
              label: 'Flower — Week 6',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Shooting Powder', ratio: 2.6, unit: 'g/gal', optional: true },
              ]
            },
            {
              weekNumber: 10,
              label: 'Flower — Week 7',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Shooting Powder', ratio: 5.2, unit: 'g/gal', optional: true },
              ]
            },
            {
              weekNumber: 11,
              label: 'Flower — Week 8',
              phaseTitle: 'Flowering',
              growthStage: 'Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: 'Aqua Flakes A', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Aqua Flakes B', ratio: 7.5, unit: 'ml/gal' },
                { name: 'Bud-XL', ratio: 3.8, unit: 'ml/gal', optional: true },
                { name: 'Shooting Powder', ratio: 5.2, unit: 'g/gal', optional: true },
              ]
            },
            {
              weekNumber: 12,
              label: 'Flush',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
      },
      products: {
        supplements: []
      }
    },
    'nectar-gods': {
      name: 'Nectar for the Gods',
      description: 'Calcium-Based Organic Nutrient Line',
      scheduleMode: 'weekly',
      scheduleStrengthHint: 'nftg-regimen',
      // Official NFTG regimens (ml/gal): Spartan=light, Greek=medium, Roman=aggressive
      schedules: {
        light: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Seed / Clone',
              phaseTitle: 'Seed / Clone',
              growthStage: 'Seed / Clone',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 5, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 5, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Early Vegetative',
              phaseTitle: 'Early Vegetative',
              growthStage: 'Early Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 5, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 3,
              label: 'Mid Vegetative',
              phaseTitle: 'Mid Vegetative',
              growthStage: 'Mid Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 15, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 5, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 4,
              label: 'Late Vegetative',
              phaseTitle: 'Late Vegetative',
              growthStage: 'Late Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 15, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 5, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 5,
              label: 'Early Flowering',
              phaseTitle: 'Early Flowering',
              growthStage: 'Early Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 15, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 30, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 7.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 6,
              label: 'Mid Flowering',
              phaseTitle: 'Mid Flowering',
              growthStage: 'Mid Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 15, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 60, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 7.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 7,
              label: 'Late Flowering',
              phaseTitle: 'Late Flowering',
              growthStage: 'Late Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 45, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 7.5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 8,
              label: 'Flush',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        medium: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Seed / Clone',
              phaseTitle: 'Seed / Clone',
              growthStage: 'Seed / Clone',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 5, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 5, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Early Vegetative',
              phaseTitle: 'Early Vegetative',
              growthStage: 'Early Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 5, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 5, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Mid Vegetative',
              phaseTitle: 'Mid Vegetative',
              growthStage: 'Mid Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 10, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 10, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'The Kraken', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Late Vegetative',
              phaseTitle: 'Late Vegetative',
              growthStage: 'Late Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 15, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 10, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'The Kraken', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Early Flowering',
              phaseTitle: 'Early Flowering',
              growthStage: 'Early Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 30, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 7.5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 15, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 7.5, unit: 'ml/gal', optional: true },
                { name: "Aphrodite's Extraction", ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'The Kraken', ratio: 10, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Mid Flowering',
              phaseTitle: 'Mid Flowering',
              growthStage: 'Mid Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 60, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 7.5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 30, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 7.5, unit: 'ml/gal', optional: true },
                { name: "Aphrodite's Extraction", ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'The Kraken', ratio: 10, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Late Flowering',
              phaseTitle: 'Late Flowering',
              growthStage: 'Late Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 5, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 60, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 7.5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 15, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 5, unit: 'ml/gal', optional: true },
                { name: "Aphrodite's Extraction", ratio: 10, unit: 'ml/gal', optional: true },
                { name: 'The Kraken', ratio: 10, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Flush',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
        aggressive: {
          weeks: [
            {
              weekNumber: 1,
              label: 'Seed / Clone',
              phaseTitle: 'Seed / Clone',
              growthStage: 'Seed / Clone',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 5, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 5, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
              ]
            },
            {
              weekNumber: 2,
              label: 'Early Vegetative',
              phaseTitle: 'Early Vegetative',
              growthStage: 'Early Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 5, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 5, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 5, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 5, unit: 'ml/gal', optional: true },
                { name: "Aphrodite's Extraction", ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 3,
              label: 'Mid Vegetative',
              phaseTitle: 'Mid Vegetative',
              growthStage: 'Mid Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 10, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 10, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 5, unit: 'ml/gal', optional: true },
                { name: "Aphrodite's Extraction", ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'The Kraken', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 4,
              label: 'Late Vegetative',
              phaseTitle: 'Late Vegetative',
              growthStage: 'Late Vegetative',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 15, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 10, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 5, unit: 'ml/gal', optional: true },
                { name: "Aphrodite's Extraction", ratio: 5, unit: 'ml/gal', optional: true },
                { name: 'The Kraken', ratio: 5, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 5,
              label: 'Early Flowering',
              phaseTitle: 'Early Flowering',
              growthStage: 'Early Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 30, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 7.5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 15, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 7.5, unit: 'ml/gal', optional: true },
                { name: "Aphrodite's Extraction", ratio: 10, unit: 'ml/gal', optional: true },
                { name: 'The Kraken', ratio: 10, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 6,
              label: 'Mid Flowering',
              phaseTitle: 'Mid Flowering',
              growthStage: 'Mid Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 10, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 60, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 7.5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 30, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 7.5, unit: 'ml/gal', optional: true },
                { name: "Aphrodite's Extraction", ratio: 10, unit: 'ml/gal', optional: true },
                { name: 'The Kraken', ratio: 10, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 7,
              label: 'Late Flowering',
              phaseTitle: 'Late Flowering',
              growthStage: 'Late Flowering',
              ecRange: null,
              ppmRange500: null,
              flush: false,
              products: [
                { name: "Medusa's Magic", ratio: 5, unit: 'ml/gal' },
                { name: 'Gaia Mania', ratio: 10, unit: 'ml/gal' },
                { name: 'Herculean Harvest', ratio: 60, unit: 'ml/gal' },
                { name: 'Zeus Juice', ratio: 7.5, unit: 'ml/gal' },
                { name: "Athena's Aminas", ratio: 15, unit: 'ml/gal', optional: true },
                { name: "Demeter's Destiny", ratio: 5, unit: 'ml/gal', optional: true },
                { name: "Aphrodite's Extraction", ratio: 15, unit: 'ml/gal', optional: true },
                { name: 'The Kraken', ratio: 10, unit: 'ml/gal', optional: true },
              ]
            },
            {
              weekNumber: 8,
              label: 'Flush',
              phaseTitle: 'Flush',
              growthStage: 'Flush',
              ecRange: null,
              ppmRange500: null,
              flush: true,
              products: []
            },
          ]
        },
      },
      products: {
        supplements: []
      }
    }

  };

export default nutrientBrands;

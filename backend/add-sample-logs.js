const { init, getDb, close } = require('./database');

async function addSampleLogs() {
  await init();
  const db = getDb();

  // Sample cannabis cultivation logs
  const sampleLogs = [
    {
      plant_id: 1,
      type: 'watering',
      description: 'Regular watering with pH balanced water',
      notes: 'Plants showing healthy growth. Soil was dry about 2 inches down.',
      water_amount: 1.5,
      ph_level: 6.2,
      logged_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      plant_id: 1,
      type: 'feeding',
      description: 'Weekly nutrient feeding - vegetative nutrients',
      notes: 'Applied vegetative nutrient mix. Plants responding well to feeding schedule.',
      water_amount: 1.2,
      ph_level: 6.0,
      ec_tds: 850,
      nutrient_info: 'NPK 20-10-20, Cal-Mag 2ml/L, B-52 1ml/L',
      logged_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      plant_id: 1,
      type: 'environmental',
      description: 'Daily environmental check',
      notes: 'Perfect VPD range. Slight increase in humidity due to weather.',
      temperature: 24.5,
      humidity: 62,
      light_intensity: 800,
      co2_level: 1200,
      logged_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      plant_id: 1,
      type: 'training',
      description: 'LST (Low Stress Training) - bent main cola',
      notes: 'Gently bent the main cola to encourage horizontal growth. Used soft plant ties. No stress signs observed.',
      logged_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
      plant_id: 1,
      type: 'observation',
      description: 'Daily plant inspection',
      notes: 'New growth looking healthy. Internodal spacing is tight. Beginning to show signs of maturity.',
      height_cm: 28.5,
      logged_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      plant_id: 1,
      type: 'measurement',
      description: 'Weekly height measurement',
      notes: 'Growth rate of 2.5cm this week. Steady vegetative growth.',
      height_cm: 26.0,
      logged_at: new Date(Date.now() - 604800000).toISOString() // 1 week ago
    }
  ];

  console.log('🌱 Adding sample cultivation logs...');

  for (const log of sampleLogs) {
    const sql = `
      INSERT INTO logs (
        plant_id, type, description, notes, water_amount, ph_level, 
        ec_tds, temperature, humidity, light_intensity, co2_level, 
        nutrient_info, height_cm, logged_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.run(sql, [
        log.plant_id, log.type, log.description, log.notes, 
        log.water_amount, log.ph_level, log.ec_tds, log.temperature, 
        log.humidity, log.light_intensity, log.co2_level, 
        log.nutrient_info, log.height_cm, log.logged_at
      ], function(err) {
        if (err) {
          console.error('Error adding log:', err);
          reject(err);
        } else {
          console.log(`✅ Added ${log.type} log: ${log.description}`);
          resolve();
        }
      });
    });
  }

  console.log('🎉 Sample logs added successfully!');
  await close();
}

addSampleLogs().catch(console.error);

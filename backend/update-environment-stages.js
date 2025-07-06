const { query } = require('./config/database');

const updateEnvironmentStages = async () => {
  console.log('🔧 Updating existing environment logs with stage data...');

  try {
    // First, let's see how many logs need updating
    const countResult = await query(`
      SELECT COUNT(*) as count 
      FROM environment_logs 
      WHERE stage IS NULL OR stage = ''
    `);

    const needsUpdate = parseInt(countResult.rows[0].count);
    console.log(`📊 Found ${needsUpdate} environment logs without stage data`);

    if (needsUpdate === 0) {
      console.log('✅ All environment logs already have stage data');
      return;
    }

    // Try to get stage data from plants in the same tent during similar timeframes
    const smartUpdateResult = await query(`
      UPDATE environment_logs 
      SET stage = (
        SELECT p.stage 
        FROM plants p 
        WHERE p.grow_tent = environment_logs.grow_tent 
        AND p.created_at <= environment_logs.logged_at
        AND (p.archived_at IS NULL OR p.archived_at > environment_logs.logged_at)
        ORDER BY ABS(EXTRACT(EPOCH FROM (p.created_at - environment_logs.logged_at)))
        LIMIT 1
      )
      WHERE (stage IS NULL OR stage = '')
      AND EXISTS (
        SELECT 1 FROM plants p 
        WHERE p.grow_tent = environment_logs.grow_tent
      )
    `);

    console.log(`📈 Smart-updated ${smartUpdateResult.rowCount} logs with stage data from plants`);

    // For any remaining logs without stage data, set a default based on date
    // If recent (last 3 months), assume Vegetative, older assume Flower
    const defaultUpdateResult = await query(`
      UPDATE environment_logs 
      SET stage = CASE 
        WHEN logged_at > NOW() - INTERVAL '3 months' THEN 'Vegetative'
        ELSE 'Flower'
      END
      WHERE stage IS NULL OR stage = ''
    `);

    console.log(`📅 Default-updated ${defaultUpdateResult.rowCount} logs with time-based stage estimates`);

    // Show summary of stage distribution
    const summaryResult = await query(`
      SELECT stage, COUNT(*) as count, 
             MIN(logged_at) as earliest, 
             MAX(logged_at) as latest
      FROM environment_logs 
      WHERE stage IS NOT NULL AND stage != ''
      GROUP BY stage 
      ORDER BY count DESC
    `);

    console.log('\n📊 Stage distribution after update:');
    summaryResult.rows.forEach(row => {
      console.log(`  ${row.stage}: ${row.count} logs (${row.earliest.toDateString()} to ${row.latest.toDateString()})`);
    });

    console.log('\n✅ Environment stage update completed successfully');

  } catch (error) {
    console.error('❌ Error updating environment stages:', error);
    throw error;
  }
};

module.exports = {
  updateEnvironmentStages
};

// Run update if this file is executed directly
if (require.main === module) {
  updateEnvironmentStages().then(() => {
    console.log('✅ Update completed successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Update failed:', error);
    process.exit(1);
  });
} 
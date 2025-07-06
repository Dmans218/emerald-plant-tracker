const { query } = require('./config/database');

const bulkUpdateStages = async (options = {}) => {
  console.log('🚀 Starting bulk stage assignment for environment logs...');
  
  const {
    dryRun = false,
    tentFilter = null,
    dateFrom = null,
    dateTo = null,
    stageAssignments = null
  } = options;

  try {
    // Get current stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(stage) as logs_with_stage,
        COUNT(*) - COUNT(stage) as logs_without_stage,
        MIN(logged_at) as earliest_date,
        MAX(logged_at) as latest_date
      FROM environment_logs
      ${tentFilter ? `WHERE grow_tent = $1` : 'WHERE 1=1'}
    `, tentFilter ? [tentFilter] : []);

    const stats = statsResult.rows[0];
    console.log('\n📊 Current Database Stats:');
    console.log(`   Total logs: ${stats.total_logs}`);
    console.log(`   With stage: ${stats.logs_with_stage}`);
    console.log(`   Without stage: ${stats.logs_without_stage}`);
    console.log(`   Date range: ${stats.earliest_date?.toDateString()} to ${stats.latest_date?.toDateString()}`);

    if (stats.logs_without_stage == 0) {
      console.log('✅ All logs already have stage assignments');
      return;
    }

    // Method 1: Use custom stage assignments if provided
    if (stageAssignments && Array.isArray(stageAssignments)) {
      await applyCustomStageAssignments(stageAssignments, dryRun);
      return;
    }

    // Method 2: Smart chronological assignment
    await applySmartChronologicalAssignment(tentFilter, dateFrom, dateTo, dryRun);

  } catch (error) {
    console.error('❌ Error in bulk stage assignment:', error);
    throw error;
  }
};

const applyCustomStageAssignments = async (assignments, dryRun) => {
  console.log('\n🎯 Applying custom stage assignments...');
  
  for (const assignment of assignments) {
    const { stage, conditions } = assignment;
    
    let whereClause = 'WHERE (stage IS NULL OR stage = \'\')';
    const params = [stage];
    let paramIndex = 2;

    // Build WHERE clause from conditions
    if (conditions.tent) {
      whereClause += ` AND grow_tent = $${paramIndex++}`;
      params.push(conditions.tent);
    }
    
    if (conditions.dateFrom) {
      whereClause += ` AND logged_at >= $${paramIndex++}`;
      params.push(conditions.dateFrom);
    }
    
    if (conditions.dateTo) {
      whereClause += ` AND logged_at <= $${paramIndex++}`;
      params.push(conditions.dateTo);
    }

    if (conditions.temperatureMin) {
      whereClause += ` AND temperature >= $${paramIndex++}`;
      params.push(conditions.temperatureMin);
    }

    if (conditions.temperatureMax) {
      whereClause += ` AND temperature <= $${paramIndex++}`;
      params.push(conditions.temperatureMax);
    }

    const sql = `
      UPDATE environment_logs 
      SET stage = $1 
      ${whereClause}
      RETURNING id, logged_at, grow_tent
    `;

    if (dryRun) {
      const countSql = `SELECT COUNT(*) as count FROM environment_logs ${whereClause.replace('SET stage = $1', '')}`;
      const countResult = await query(countSql, params.slice(1));
      console.log(`   🔍 [DRY RUN] Would update ${countResult.rows[0].count} records to "${stage}"`);
    } else {
      const result = await query(sql, params);
      console.log(`   ✅ Updated ${result.rows.length} records to "${stage}"`);
    }
  }
};

const applySmartChronologicalAssignment = async (tentFilter, dateFrom, dateTo, dryRun) => {
  console.log('\n🧠 Applying smart chronological stage assignment...');
  
  // Get date range for smart assignment
  let whereClause = 'WHERE (stage IS NULL OR stage = \'\')';
  const params = [];
  let paramIndex = 1;

  if (tentFilter) {
    whereClause += ` AND grow_tent = $${paramIndex++}`;
    params.push(tentFilter);
  }

  if (dateFrom) {
    whereClause += ` AND logged_at >= $${paramIndex++}`;
    params.push(dateFrom);
  }

  if (dateTo) {
    whereClause += ` AND logged_at <= $${paramIndex++}`;
    params.push(dateTo);
  }

  // Get the date range of records without stages
  const rangeResult = await query(`
    SELECT 
      MIN(logged_at) as start_date,
      MAX(logged_at) as end_date,
      COUNT(*) as total_records
    FROM environment_logs 
    ${whereClause}
  `, params);

  const { start_date, end_date, total_records } = rangeResult.rows[0];
  
  if (!start_date || total_records == 0) {
    console.log('   ℹ️  No records found matching criteria');
    return;
  }

  console.log(`   📅 Processing ${total_records} records from ${start_date.toDateString()} to ${end_date.toDateString()}`);

  // Calculate time periods (assuming a typical grow cycle)
  const totalDays = Math.ceil((end_date - start_date) / (1000 * 60 * 60 * 24));
  console.log(`   ⏱️  Total time span: ${totalDays} days`);

  // Smart stage assignments based on typical cannabis grow timeline
  const stageAssignments = [];

  if (totalDays <= 30) {
    // Short period - likely all one stage
    stageAssignments.push({
      stage: 'Vegetative',
      startDate: start_date,
      endDate: end_date,
      reason: 'Short time period, assuming vegetative'
    });
  } else if (totalDays <= 90) {
    // Medium period - veg to flower transition
    const vegEnd = new Date(start_date.getTime() + (totalDays * 0.4 * 24 * 60 * 60 * 1000)); // 40% veg
    const flowerStart = vegEnd;
    
    stageAssignments.push(
      {
        stage: 'Vegetative',
        startDate: start_date,
        endDate: vegEnd,
        reason: 'First 40% of timeline'
      },
      {
        stage: 'Flower',
        startDate: flowerStart,
        endDate: end_date,
        reason: 'Last 60% of timeline'
      }
    );
  } else {
    // Long period - full cycle
    const vegEnd = new Date(start_date.getTime() + (totalDays * 0.3 * 24 * 60 * 60 * 1000)); // 30% veg
    const flowerEnd = new Date(start_date.getTime() + (totalDays * 0.85 * 24 * 60 * 60 * 1000)); // 55% flower
    
    stageAssignments.push(
      {
        stage: 'Vegetative',
        startDate: start_date,
        endDate: vegEnd,
        reason: 'First 30% of timeline'
      },
      {
        stage: 'Flower',
        startDate: vegEnd,
        endDate: flowerEnd,
        reason: 'Middle 55% of timeline'
      },
      {
        stage: 'Late Flower',
        startDate: flowerEnd,
        endDate: end_date,
        reason: 'Final 15% of timeline'
      }
    );
  }

  // Apply the smart assignments
  for (const assignment of stageAssignments) {
    const { stage, startDate, endDate, reason } = assignment;
    
    // Build proper WHERE clause for date range filtering
    let updateWhereClause = 'WHERE (stage IS NULL OR stage = \'\')';
    const updateParams = [stage];
    let updateParamIndex = 2;

    // Add original filters (tent, dateFrom, dateTo if they exist)
    if (tentFilter) {
      updateWhereClause += ` AND grow_tent = $${updateParamIndex++}`;
      updateParams.push(tentFilter);
    }
    
    if (dateFrom) {
      updateWhereClause += ` AND logged_at >= $${updateParamIndex++}`;
      updateParams.push(dateFrom);
    }
    
    if (dateTo) {
      updateWhereClause += ` AND logged_at <= $${updateParamIndex++}`;
      updateParams.push(dateTo);
    }

    // Add stage assignment date range
    updateWhereClause += ` AND logged_at >= $${updateParamIndex++} AND logged_at <= $${updateParamIndex++}`;
    updateParams.push(startDate.toISOString(), endDate.toISOString());

    if (dryRun) {
      const countResult = await query(`
        SELECT COUNT(*) as count 
        FROM environment_logs 
        ${updateWhereClause}
      `, updateParams.slice(1)); // Remove stage parameter for count query
      
      console.log(`   🔍 [DRY RUN] Would set ${countResult.rows[0].count} records to "${stage}" (${reason})`);
      console.log(`      📅 ${startDate.toDateString()} to ${endDate.toDateString()}`);
    } else {
      const updateResult = await query(`
        UPDATE environment_logs 
        SET stage = $1 
        ${updateWhereClause}
        RETURNING id
      `, updateParams);

      console.log(`   ✅ Set ${updateResult.rows.length} records to "${stage}" (${reason})`);
      console.log(`      📅 ${startDate.toDateString()} to ${endDate.toDateString()}`);
    }
  }
};

// Bulk update by conditions
const bulkUpdateByConditions = async (stage, conditions, dryRun = false) => {
  console.log(`\n🎯 Bulk updating records to "${stage}"...`);
  
  let whereClause = 'WHERE 1=1';
  const params = [stage];
  let paramIndex = 2;

  // Build conditions
  if (conditions.tent) {
    whereClause += ` AND grow_tent = $${paramIndex++}`;
    params.push(conditions.tent);
  }
  
  if (conditions.dateFrom) {
    whereClause += ` AND logged_at >= $${paramIndex++}`;
    params.push(conditions.dateFrom);
  }
  
  if (conditions.dateTo) {
    whereClause += ` AND logged_at <= $${paramIndex++}`;
    params.push(conditions.dateTo);
  }

  if (conditions.onlyEmpty) {
    whereClause += ` AND (stage IS NULL OR stage = '')`;
  }

  const sql = `
    UPDATE environment_logs 
    SET stage = $1 
    ${whereClause}
    RETURNING id, logged_at, grow_tent, stage
  `;

  if (dryRun) {
    const countSql = `SELECT COUNT(*) as count FROM environment_logs ${whereClause.replace('SET stage = $1', '')}`;
    const countResult = await query(countSql, params.slice(1));
    console.log(`   🔍 [DRY RUN] Would update ${countResult.rows[0].count} records`);
    return { updated: 0, wouldUpdate: countResult.rows[0].count };
  } else {
    const result = await query(sql, params);
    console.log(`   ✅ Updated ${result.rows.length} records to "${stage}"`);
    return { updated: result.rows.length };
  }
};

// CLI interface
const runCLI = async () => {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--tent':
        options.tentFilter = args[++i];
        break;
      case '--date-from':
        options.dateFrom = args[++i];
        break;
      case '--date-to':
        options.dateTo = args[++i];
        break;
    }
  }

  console.log('🌱 Emerald Plant Tracker - Bulk Stage Assignment');
  console.log('================================================');
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }

  await bulkUpdateStages(options);
  
  console.log('\n✅ Bulk stage assignment completed!');
};

module.exports = {
  bulkUpdateStages,
  bulkUpdateByConditions,
  applyCustomStageAssignments,
  applySmartChronologicalAssignment
};

// Run CLI if called directly
if (require.main === module) {
  runCLI().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Bulk update failed:', error);
    process.exit(1);
  });
} 
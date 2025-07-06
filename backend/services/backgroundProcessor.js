const cron = require('node-cron');
const { query } = require('../config/database');
const AnalyticsEngine = require('./analyticsEngine');
const AnalyticsModel = require('../models/analytics');

/**
 * Background Processing Service
 * Handles periodic analytics processing and maintenance tasks
 */

class BackgroundProcessor {
  static isRunning = false;
  static jobs = new Map();

  /**
   * Start all background processing jobs
   */
  static start() {
    if (this.isRunning) {
      console.log('⚠️ Background processor already running');
      return;
    }

    console.log('🚀 Starting background analytics processor...');
    this.isRunning = true;

    // Schedule analytics processing for active plants (every 6 hours)
    this.scheduleAnalyticsProcessing();

    // Schedule cleanup of old analytics data (daily at 2 AM)
    this.scheduleAnalyticsCleanup();

    // Schedule health monitoring (every hour)
    this.scheduleHealthMonitoring();

    console.log('✅ Background processor started successfully');
  }

  /**
   * Stop all background processing jobs
   */
  static stop() {
    if (!this.isRunning) {
      console.log('⚠️ Background processor not running');
      return;
    }

    console.log('🛑 Stopping background analytics processor...');

    // Stop all cron jobs
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`  ✅ Stopped job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;

    console.log('✅ Background processor stopped');
  }

  /**
   * Schedule periodic analytics processing for active plants
   */
  static scheduleAnalyticsProcessing() {
    // Run every 6 hours: 0 */6 * * *
    const job = cron.schedule(
      '0 */6 * * *',
      async () => {
        console.log('📊 Starting scheduled analytics processing...');

        try {
          await this.processActivePlants();
          console.log('✅ Scheduled analytics processing completed');
        } catch (error) {
          console.error('❌ Scheduled analytics processing failed:', error);
        }
      },
      {
        scheduled: false,
        timezone: 'UTC',
      }
    );

    job.start();
    this.jobs.set('analytics_processing', job);
    console.log('📅 Scheduled analytics processing (every 6 hours)');
  }

  /**
   * Schedule cleanup of old analytics data
   */
  static scheduleAnalyticsCleanup() {
    // Run daily at 2 AM UTC: 0 2 * * *
    const job = cron.schedule(
      '0 2 * * *',
      async () => {
        console.log('🧹 Starting scheduled analytics cleanup...');

        try {
          await this.cleanupOldAnalytics();
          console.log('✅ Scheduled analytics cleanup completed');
        } catch (error) {
          console.error('❌ Scheduled analytics cleanup failed:', error);
        }
      },
      {
        scheduled: false,
        timezone: 'UTC',
      }
    );

    job.start();
    this.jobs.set('analytics_cleanup', job);
    console.log('📅 Scheduled analytics cleanup (daily at 2 AM UTC)');
  }

  /**
   * Schedule health monitoring
   */
  static scheduleHealthMonitoring() {
    // Run every hour: 0 * * * *
    const job = cron.schedule(
      '0 * * * *',
      async () => {
        try {
          await this.performHealthCheck();
        } catch (error) {
          console.error('❌ Health monitoring failed:', error);
        }
      },
      {
        scheduled: false,
        timezone: 'UTC',
      }
    );

    job.start();
    this.jobs.set('health_monitoring', job);
    console.log('📅 Scheduled health monitoring (hourly)');
  }

  /**
   * Process analytics for all active plants
   */
  static async processActivePlants() {
    const startTime = Date.now();

    try {
      // Get all active plants (not harvested)
      const plantsResult = await query(`
        SELECT id, name, stage as growth_stage
        FROM plants
        WHERE stage != 'harvest'
          AND stage != 'archived'
        ORDER BY id
      `);

      const activePlants = plantsResult.rows;
      console.log(`📋 Found ${activePlants.length} active plants to process`);

      if (activePlants.length === 0) {
        console.log('ℹ️ No active plants found, skipping processing');
        return;
      }

      // Process plants in batches to avoid overwhelming the system
      const batchSize = 5;
      const results = {
        processed: 0,
        skipped: 0,
        errors: 0,
      };

      for (let i = 0; i < activePlants.length; i += batchSize) {
        const batch = activePlants.slice(i, i + batchSize);

        console.log(
          `🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            activePlants.length / batchSize
          )}`
        );

        const batchPromises = batch.map(async plant => {
          try {
            // Check if recent analytics exist (within last 6 hours)
            const existingAnalytics = await AnalyticsModel.getLatest(plant.id);
            if (
              existingAnalytics &&
              this.isRecentCalculation(existingAnalytics.calculation_date, 6)
            ) {
              console.log(
                `  ⏭️ Skipping plant ${plant.id} (${plant.name}) - recent analytics found`
              );
              results.skipped++;
              return;
            }

            console.log(
              `  🔬 Processing plant ${plant.id} (${plant.name}) - ${plant.growth_stage}`
            );
            await AnalyticsEngine.processHistoricalData(plant.id, {
              forceRecalculation: false,
            });
            results.processed++;
          } catch (error) {
            console.error(`  ❌ Error processing plant ${plant.id}:`, error.message);
            results.errors++;
          }
        });

        await Promise.all(batchPromises);

        // Small delay between batches to prevent overwhelming the database
        if (i + batchSize < activePlants.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const processingTime = Date.now() - startTime;
      console.log(`📊 Analytics processing completed in ${processingTime}ms:`);
      console.log(`  ✅ Processed: ${results.processed}`);
      console.log(`  ⏭️ Skipped: ${results.skipped}`);
      console.log(`  ❌ Errors: ${results.errors}`);
    } catch (error) {
      console.error('❌ Failed to process active plants:', error);
      throw error;
    }
  }

  /**
   * Clean up old analytics data
   */
  static async cleanupOldAnalytics() {
    const startTime = Date.now();

    try {
      // Keep analytics data for 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      console.log(`🗑️ Cleaning up analytics data older than ${cutoffDate.toISOString()}`);

      const result = await query(
        `
        DELETE FROM analytics_data
        WHERE calculation_date < $1
      `,
        [cutoffDate]
      );

      const deletedCount = result.rowCount;
      const processingTime = Date.now() - startTime;

      console.log(
        `✅ Cleanup completed in ${processingTime}ms - deleted ${deletedCount} old records`
      );

      // Also clean up orphaned analytics (plants that no longer exist)
      const orphanResult = await query(`
        DELETE FROM analytics_data
        WHERE plant_id NOT IN (SELECT id FROM plants)
      `);

      const orphanCount = orphanResult.rowCount;
      if (orphanCount > 0) {
        console.log(`🧹 Removed ${orphanCount} orphaned analytics records`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup old analytics:', error);
      throw error;
    }
  }

  /**
   * Perform health check on the analytics system
   */
  static async performHealthCheck() {
    try {
      // Check database connectivity
      await query('SELECT 1 as health_check');

      // Check analytics table health
      const analyticsCount = await query(`
        SELECT COUNT(*) as total_count,
               COUNT(CASE WHEN calculation_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_count
        FROM analytics_data
      `);

      const { total_count, recent_count } = analyticsCount.rows[0];

      // Check for plants without recent analytics
      const plantsWithoutAnalytics = await query(`
        SELECT COUNT(*) as count
        FROM plants p
        LEFT JOIN analytics_data a ON p.id = a.plant_id
          AND a.calculation_date >= CURRENT_DATE - INTERVAL '24 hours'
        WHERE p.stage NOT IN ('harvest', 'archived')
          AND a.plant_id IS NULL
      `);

      const plantsNeedingAnalytics = parseInt(plantsWithoutAnalytics.rows[0].count);

      // Log health status
      if (plantsNeedingAnalytics > 0) {
        console.log(
          `⚠️ Health check: ${plantsNeedingAnalytics} active plants need analytics processing`
        );
      }

      // Log analytics statistics every 6 hours (when this aligns with processing)
      const currentHour = new Date().getHours();
      if (currentHour % 6 === 0) {
        console.log(
          `📈 Analytics health: ${total_count} total records, ${recent_count} from last 7 days`
        );
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  /**
   * Process analytics for a specific plant immediately
   * @param {number} plantId - Plant ID to process
   * @param {Object} options - Processing options
   */
  static async processPlantImmediately(plantId, options = {}) {
    console.log(`🚀 Immediate processing requested for plant ${plantId}`);

    try {
      const analytics = await AnalyticsEngine.processHistoricalData(plantId, {
        forceRecalculation: true,
        ...options,
      });

      console.log(`✅ Immediate processing completed for plant ${plantId}`);
      return analytics;
    } catch (error) {
      console.error(`❌ Immediate processing failed for plant ${plantId}:`, error);
      throw error;
    }
  }

  /**
   * Get background processor status
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      jobCount: this.jobs.size,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
    };
  }

  /**
   * Check if a calculation is recent
   * @param {Date} calculationDate - Date of calculation
   * @param {number} hoursThreshold - Hours threshold
   * @returns {boolean} True if recent
   */
  static isRecentCalculation(calculationDate, hoursThreshold = 24) {
    const now = new Date();
    const calcDate = new Date(calculationDate);
    const hoursDiff = (now - calcDate) / (1000 * 60 * 60);

    return hoursDiff < hoursThreshold;
  }

  /**
   * Force processing of all active plants (manual trigger)
   */
  static async forceProcessAllPlants() {
    console.log('🔄 Manual processing of all active plants requested');

    try {
      await this.processActivePlants();
      console.log('✅ Manual processing completed successfully');
    } catch (error) {
      console.error('❌ Manual processing failed:', error);
      throw error;
    }
  }
}

// Initialize start time when class is loaded
BackgroundProcessor.startTime = Date.now();

module.exports = BackgroundProcessor;

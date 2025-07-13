#!/usr/bin/env node

/**
 * Test AI Recommendations System
 * Simple test to verify the recommendation engine works
 */

const recommendationEngine = require('./services/ai/recommendationEngine');
const { logger } = require('./utils/logger');

const testRecommendations = async () => {
  try {
    console.log('🧪 Testing AI Recommendation Engine...');
    
    // Test with a sample plant ID (assuming plant 1 exists)
    const plantId = 1;
    
    console.log(`📊 Generating recommendations for plant ${plantId}...`);
    
    const recommendations = await recommendationEngine.generateRecommendations(plantId, {
      forceRefresh: true
    });
    
    console.log('✅ Recommendations generated successfully!');
    console.log(`📈 Found ${recommendations.totalRecommendations} recommendations`);
    console.log(`🎯 Overall confidence: ${(recommendations.confidence * 100).toFixed(1)}%`);
    
    if (recommendations.recommendations.length > 0) {
      console.log('\n🔍 Sample recommendations:');
      recommendations.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`\n${index + 1}. ${rec.title}`);
        console.log(`   Priority: ${rec.priority.toUpperCase()}`);
        console.log(`   Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
        console.log(`   Category: ${rec.category}`);
        console.log(`   Description: ${rec.description}`);
      });
    } else {
      console.log('\n📝 No recommendations generated - this is normal if plant data is optimal');
    }
    
    console.log('\n🎉 AI Recommendation Engine test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testRecommendations();
}

module.exports = { testRecommendations }; 
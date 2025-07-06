// Analytics API utility functions
const API_BASE =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:420";

export const analyticsAPI = {
  // Get analytics for a specific plant
  async getPlantAnalytics(plantId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append("limit", options.limit);
      if (options.offset) params.append("offset", options.offset);

      const response = await fetch(
        `${API_BASE}/api/analytics/${plantId}?${params}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching plant analytics:", error);
      throw error;
    }
  },

  // Get latest analytics for a plant
  async getLatestAnalytics(plantId) {
    try {
      const response = await fetch(
        `${API_BASE}/api/analytics/${plantId}/latest`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch latest analytics: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching latest analytics:", error);
      throw error;
    }
  },

  // Get trend data for charts
  async getTrendData(plantId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.days) params.append("days", options.days);
      if (options.metric) params.append("metric", options.metric);

      const response = await fetch(
        `${API_BASE}/api/analytics/${plantId}/trends?${params}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch trend data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching trend data:", error);
      throw error;
    }
  },

  // Process analytics for a plant
  async processAnalytics(plantId) {
    try {
      const response = await fetch(
        `${API_BASE}/api/analytics/${plantId}/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to process analytics: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error processing analytics:", error);
      throw error;
    }
  },

  // Batch process analytics for multiple plants
  async batchProcessAnalytics(plantIds) {
    try {
      const response = await fetch(`${API_BASE}/api/analytics/batch-process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plantIds }),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to batch process analytics: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Error batch processing analytics:", error);
      throw error;
    }
  },

  // Get analytics service health
  async getHealthStatus() {
    try {
      const response = await fetch(`${API_BASE}/api/analytics/health`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch health status: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching health status:", error);
      throw error;
    }
  },

  // NEW DEEP-DIVE ANALYTICS ENDPOINTS

  // Get comprehensive deep-dive analytics for a plant
  async getDeepDiveAnalytics(plantId) {
    try {
      const response = await fetch(
        `${API_BASE}/api/analytics/${plantId}/deep-dive`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch deep-dive analytics: ${response.statusText}`
        );
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching deep-dive analytics:", error);
      throw error;
    }
  },

  // Get strain-specific analytics and genetic potential comparison
  async getStrainAnalysis(plantId) {
    try {
      const response = await fetch(
        `${API_BASE}/api/analytics/${plantId}/strain-analysis`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch strain analysis: ${response.statusText}`
        );
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching strain analysis:", error);
      throw error;
    }
  },

  // Get growth stage progression and milestone tracking
  async getGrowthTimeline(plantId) {
    try {
      const response = await fetch(
        `${API_BASE}/api/analytics/${plantId}/growth-timeline`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch growth timeline: ${response.statusText}`
        );
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching growth timeline:", error);
      throw error;
    }
  },

  // Get environmental impact correlation analysis
  async getEnvironmentalCorrelation(plantId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.days) params.append("days", options.days);
      if (options.metrics) params.append("metrics", options.metrics.join(","));

      const response = await fetch(
        `${API_BASE}/api/analytics/${plantId}/environmental-correlation?${params}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch environmental correlation: ${response.statusText}`
        );
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching environmental correlation:", error);
      throw error;
    }
  },

  // Get historical comparison with previous grows
  async getHistoricalComparison(plantId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.compareStrain !== undefined)
        params.append("compare_strain", options.compareStrain);
      if (options.compareMedium !== undefined)
        params.append("compare_medium", options.compareMedium);
      if (options.limit) params.append("limit", options.limit);

      const response = await fetch(
        `${API_BASE}/api/analytics/${plantId}/historical-comparison?${params}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch historical comparison: ${response.statusText}`
        );
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching historical comparison:", error);
      throw error;
    }
  },
};

// Data processing utilities
export const processAnalyticsData = {
  // Format analytics data for display
  formatAnalyticsData(analytics) {
    if (!analytics) return null;

    return {
      yieldPrediction: {
        value: Math.round(analytics.yield_prediction || 0),
        unit: "grams",
        formatted: `${Math.round(analytics.yield_prediction || 0)}g`,
      },
      growthRate: {
        value: parseFloat((analytics.growth_rate || 0).toFixed(1)),
        unit: "cm/day",
        formatted: `${parseFloat(
          (analytics.growth_rate || 0).toFixed(1)
        )} cm/day`,
      },
      environmentalEfficiency: {
        value: Math.round(analytics.environmental_efficiency || 0),
        unit: "%",
        formatted: `${Math.round(analytics.environmental_efficiency || 0)}%`,
      },
      recommendations: analytics.recommendations || [],
      processedAt: new Date(analytics.processed_at).toLocaleDateString(),
      processingTime: analytics.processing_time_ms
        ? `${analytics.processing_time_ms}ms`
        : null,
    };
  },

  // Process trend data for charts
  formatTrendData(trends, metric) {
    if (!trends || !Array.isArray(trends)) return null;

    const labels = trends.map((item) => {
      const date = new Date(item.processed_at);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    });

    const data = trends.map((item) => {
      switch (metric) {
        case "yield":
          return Math.round(item.yield_prediction || 0);
        case "growth":
          return parseFloat((item.growth_rate || 0).toFixed(1));
        case "efficiency":
          return Math.round(item.environmental_efficiency || 0);
        default:
          return 0;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: this.getMetricLabel(metric),
          data,
          borderColor: this.getMetricColor(metric),
          backgroundColor: `${this.getMetricColor(metric)}20`,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  },

  // Get metric display label
  getMetricLabel(metric) {
    const labels = {
      yield: "Yield Prediction (g)",
      growth: "Growth Rate (cm/day)",
      efficiency: "Environmental Efficiency (%)",
    };
    return labels[metric] || metric;
  },

  // Get metric color
  getMetricColor(metric) {
    const colors = {
      yield: "#10b981",
      growth: "#3b82f6",
      efficiency: "#f59e0b",
    };
    return colors[metric] || "#6b7280";
  },

  // Calculate trend direction and percentage
  calculateTrend(current, previous) {
    if (!current || !previous) return null;

    const change = current - previous;
    const percentChange = Math.abs((change / previous) * 100);

    return {
      direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
      value: `${change > 0 ? "+" : ""}${percentChange.toFixed(1)}%`,
      absolute: change,
    };
  },

  // Process recommendations for display
  formatRecommendations(recommendations) {
    if (!recommendations || !Array.isArray(recommendations)) return [];

    return recommendations.map((rec) => ({
      ...rec,
      priority: rec.priority || "medium",
      category: rec.category || "general",
      title: rec.title || rec.message || "Recommendation",
      summary: rec.summary || this.truncateText(rec.description, 100),
      actions: rec.actions || [],
    }));
  },

  // Truncate text for summaries
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  },

  // Get status based on efficiency score
  getEfficiencyStatus(efficiency) {
    if (efficiency >= 80) return "excellent";
    if (efficiency >= 60) return "good";
    if (efficiency >= 40) return "warning";
    return "critical";
  },

  // Get yield status based on prediction and strain type
  getYieldStatus(prediction, strainType = "hybrid") {
    const expectedYields = {
      indica: { min: 120, max: 180 },
      sativa: { min: 100, max: 160 },
      hybrid: { min: 110, max: 170 },
      auto: { min: 50, max: 100 },
    };

    const expected = expectedYields[strainType] || expectedYields.hybrid;

    if (prediction >= expected.max) return "excellent";
    if (prediction >= expected.min) return "good";
    if (prediction >= expected.min * 0.7) return "warning";
    return "critical";
  },

  // Create summary statistics
  createSummaryStats(analytics) {
    if (!analytics || !Array.isArray(analytics)) return null;

    const latest = analytics[0];
    const previous = analytics[1];

    if (!latest) return null;

    const formatted = this.formatAnalyticsData(latest);
    const trends = previous
      ? {
          yield: this.calculateTrend(
            latest.yield_prediction,
            previous.yield_prediction
          ),
          growth: this.calculateTrend(latest.growth_rate, previous.growth_rate),
          efficiency: this.calculateTrend(
            latest.environmental_efficiency,
            previous.environmental_efficiency
          ),
        }
      : {};

    return {
      current: formatted,
      trends,
      status: {
        yield: this.getYieldStatus(latest.yield_prediction),
        efficiency: this.getEfficiencyStatus(latest.environmental_efficiency),
      },
      lastUpdated: formatted.processedAt,
    };
  },
};

// Cannabis-specific analytics utilities
export const cannabisAnalytics = {
  // Get optimal ranges for different growth stages
  getOptimalRanges(stage) {
    const ranges = {
      seedling: {
        temperature: { min: 70, max: 80, unit: "°F" },
        humidity: { min: 65, max: 75, unit: "%" },
        vpd: { min: 0.4, max: 0.8, unit: "kPa" },
        light: { min: 200, max: 400, unit: "PPFD" },
      },
      vegetative: {
        temperature: { min: 70, max: 85, unit: "°F" },
        humidity: { min: 55, max: 70, unit: "%" },
        vpd: { min: 0.8, max: 1.2, unit: "kPa" },
        light: { min: 400, max: 600, unit: "PPFD" },
      },
      flowering: {
        temperature: { min: 65, max: 80, unit: "°F" },
        humidity: { min: 40, max: 55, unit: "%" },
        vpd: { min: 1.0, max: 1.5, unit: "kPa" },
        light: { min: 600, max: 1000, unit: "PPFD" },
      },
    };

    return ranges[stage?.toLowerCase()] || ranges.vegetative;
  },

  // Calculate VPD (Vapor Pressure Deficit)
  calculateVPD(temperature, humidity) {
    if (!temperature || !humidity) return null;

    // Convert Fahrenheit to Celsius
    const tempC = ((temperature - 32) * 5) / 9;

    // Calculate saturation vapor pressure
    const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));

    // Calculate actual vapor pressure
    const avp = svp * (humidity / 100);

    // Calculate VPD
    const vpd = svp - avp;

    return Math.round(vpd * 100) / 100; // Round to 2 decimal places
  },

  // Get growth stage recommendations
  getStageRecommendations(stage, currentConditions) {
    const optimal = this.getOptimalRanges(stage);
    const recommendations = [];

    if (currentConditions.temperature < optimal.temperature.min) {
      recommendations.push({
        priority: "high",
        category: "environment",
        title: "Temperature too low",
        message: `Increase temperature to ${optimal.temperature.min}-${optimal.temperature.max}°F for optimal ${stage} growth`,
        actions: [
          "Adjust heating system",
          "Check ventilation",
          "Monitor daily temperature swings",
        ],
      });
    } else if (currentConditions.temperature > optimal.temperature.max) {
      recommendations.push({
        priority: "high",
        category: "environment",
        title: "Temperature too high",
        message: `Reduce temperature to ${optimal.temperature.min}-${optimal.temperature.max}°F for optimal ${stage} growth`,
        actions: [
          "Increase ventilation",
          "Add air conditioning",
          "Adjust lighting schedule",
        ],
      });
    }

    if (currentConditions.humidity < optimal.humidity.min) {
      recommendations.push({
        priority: "medium",
        category: "humidity",
        title: "Humidity too low",
        message: `Increase humidity to ${optimal.humidity.min}-${optimal.humidity.max}% for ${stage} stage`,
        actions: [
          "Add humidifier",
          "Reduce ventilation temporarily",
          "Place water containers in grow space",
        ],
      });
    } else if (currentConditions.humidity > optimal.humidity.max) {
      recommendations.push({
        priority: "high",
        category: "humidity",
        title: "Humidity too high",
        message: `Reduce humidity to ${optimal.humidity.min}-${optimal.humidity.max}% to prevent mold in ${stage} stage`,
        actions: [
          "Increase ventilation",
          "Add dehumidifier",
          "Check for water leaks",
        ],
      });
    }

    return recommendations;
  },
};

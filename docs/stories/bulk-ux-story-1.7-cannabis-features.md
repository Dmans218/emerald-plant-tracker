# Story 1.7: Cannabis-Specific Smart Features

## Story Information

- **Epic**: Bulk Data Management UX Enhancements
- **Story ID**: 1.7
- **Priority**: Medium
- **Estimated Points**: 8
- **Status**: Draft

## User Story

**As a** cannabis cultivator managing cultivation cycles
**I want** bulk operations that understand cannabis cultivation patterns
**So that** I can perform operations that align with best practices

## Acceptance Criteria

- [ ] Growth stage-aware bulk operations
- [ ] Environmental range validation (cannabis-specific)
- [ ] Nutrient schedule integration with bulk changes
- [ ] Compliance tracking for regulatory requirements
- [ ] Seasonal adjustment recommendations
- [ ] Environmental ranges follow cannabis cultivation standards
- [ ] Nutrient schedules update correctly with bulk changes
- [ ] Compliance data is properly tracked and reportable

## Technical Requirements

### Frontend Components

- `CannabisStageAwareSelector` growth stage-aware selection
- `EnvironmentalValidator` cannabis-specific validation
- `NutrientScheduleIntegrator` nutrient integration
- `ComplianceTracker` regulatory compliance tracking
- `SeasonalAdjuster` seasonal recommendations
- `CannabisBestPractices` cultivation guidance
- `StrainSpecificLogic` strain-aware operations

### Backend API Endpoints

- `GET /api/cannabis/growth-stages` - Get cannabis growth stages
- `GET /api/cannabis/environmental-ranges` - Get stage-specific ranges
- `POST /api/cannabis/validate-environmental` - Validate cannabis ranges
- `GET /api/cannabis/nutrient-schedules` - Get nutrient schedules
- `POST /api/cannabis/update-nutrients` - Update nutrient schedules
- `GET /api/cannabis/compliance-requirements` - Get compliance rules
- `POST /api/cannabis/track-compliance` - Track compliance data

### Data Models

- `CannabisGrowthStage` - Growth stage definitions
- `EnvironmentalRange` - Stage-specific environmental ranges
- `NutrientSchedule` - Cannabis nutrient schedules
- `ComplianceRequirement` - Regulatory requirements
- `SeasonalAdjustment` - Seasonal recommendations

## Implementation Tasks

1. [ ] Create `CannabisStageAwareSelector` component
2. [ ] Implement `EnvironmentalValidator` with cannabis ranges
3. [ ] Build `NutrientScheduleIntegrator` component
4. [ ] Add `ComplianceTracker` for regulatory tracking
5. [ ] Create `SeasonalAdjuster` with recommendations
6. [ ] Implement cannabis-specific validation rules
7. [ ] Add strain-specific logic and recommendations
8. [ ] Create cannabis best practices guidance
9. [ ] Build environmental range validation
10. [ ] Implement nutrient schedule updates
11. [ ] Add compliance data tracking
12. [ ] Create seasonal adjustment logic
13. [ ] Write cannabis-specific tests
14. [ ] Add accessibility features for cannabis guidance

## UI/UX Specifications

### Cannabis Stage Aware Selector

```jsx
const CannabisStageAwareSelector = ({ plants, onSelectionChange }) => {
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedPlants, setSelectedPlants] = useState([]);
  
  const growthStages = [
    { id: 'germination', name: 'Germination', duration: '3-7 days' },
    { id: 'seedling', name: 'Seedling', duration: '1-2 weeks' },
    { id: 'vegetative', name: 'Vegetative', duration: '3-8 weeks' },
    { id: 'flowering', name: 'Flowering', duration: '8-12 weeks' },
    { id: 'harvest', name: 'Harvest', duration: '1-2 weeks' }
  ];
  
  const handleStageChange = (stageId) => {
    setSelectedStage(stageId);
    if (stageId === 'all') {
      setSelectedPlants(plants);
    } else {
      const stagePlants = plants.filter(plant => plant.growthStage === stageId);
      setSelectedPlants(stagePlants);
    }
    onSelectionChange(selectedPlants);
  };
  
  return (
    <div className="cannabis-stage-selector">
      <div className="stage-selector-header">
        <h4 className="text-green-500 font-semibold">Growth Stage Selection</h4>
        <p className="text-gray-400 text-sm">
          Select plants by growth stage for targeted operations
        </p>
      </div>
      
      <div className="stage-buttons grid grid-cols-2 gap-2">
        <Button
          onClick={() => handleStageChange('all')}
          className={`stage-button ${selectedStage === 'all' ? 'bg-green-600' : 'bg-gray-700'}`}
        >
          All Stages
        </Button>
        {growthStages.map(stage => (
          <Button
            key={stage.id}
            onClick={() => handleStageChange(stage.id)}
            className={`stage-button ${selectedStage === stage.id ? 'bg-green-600' : 'bg-gray-700'}`}
          >
            <div className="stage-info">
              <span className="stage-name">{stage.name}</span>
              <span className="stage-duration text-xs">{stage.duration}</span>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="stage-summary mt-4">
        <div className="summary-stats">
          <span className="stat">
            <strong>{selectedPlants.length}</strong> plants selected
          </span>
          {selectedStage !== 'all' && (
            <span className="stat">
              Stage: <strong>{growthStages.find(s => s.id === selectedStage)?.name}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
```

### Environmental Validator

```jsx
const EnvironmentalValidator = ({ stage, environmentalData, onValidation }) => {
  const cannabisRanges = {
    germination: {
      temperature: { min: 20, max: 25, unit: '°C' },
      humidity: { min: 70, max: 80, unit: '%' },
      light: { hours: '18-24', intensity: 'Low' }
    },
    seedling: {
      temperature: { min: 22, max: 26, unit: '°C' },
      humidity: { min: 65, max: 75, unit: '%' },
      light: { hours: '18-24', intensity: 'Medium' }
    },
    vegetative: {
      temperature: { min: 22, max: 28, unit: '°C' },
      humidity: { min: 60, max: 70, unit: '%' },
      light: { hours: '18-24', intensity: 'High' }
    },
    flowering: {
      temperature: { min: 20, max: 26, unit: '°C' },
      humidity: { min: 50, max: 60, unit: '%' },
      light: { hours: '12', intensity: 'High' }
    }
  };
  
  const validateEnvironmental = (data) => {
    const ranges = cannabisRanges[stage];
    const errors = [];
    const warnings = [];
    
    // Temperature validation
    if (data.temperature < ranges.temperature.min || data.temperature > ranges.temperature.max) {
      errors.push({
        field: 'temperature',
        message: `Temperature should be between ${ranges.temperature.min}-${ranges.temperature.max}°C for ${stage} stage`
      });
    }
    
    // Humidity validation
    if (data.humidity < ranges.humidity.min || data.humidity > ranges.humidity.max) {
      errors.push({
        field: 'humidity',
        message: `Humidity should be between ${ranges.humidity.min}-${ranges.humidity.max}% for ${stage} stage`
      });
    }
    
    // VPD calculation and validation
    const vpd = calculateVPD(data.temperature, data.humidity);
    if (vpd < 0.4 || vpd > 1.6) {
      warnings.push({
        field: 'vpd',
        message: `VPD of ${vpd.toFixed(2)} kPa is outside optimal range (0.4-1.6 kPa)`
      });
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
  };
  
  return (
    <div className="environmental-validator">
      <div className="validator-header">
        <h4 className="text-blue-500 font-semibold">Environmental Validation</h4>
        <p className="text-gray-400 text-sm">
          Cannabis-specific ranges for {stage} stage
        </p>
      </div>
      
      <div className="range-display">
        {Object.entries(cannabisRanges[stage]).map(([key, range]) => (
          <div key={key} className="range-item">
            <span className="range-label capitalize">{key}:</span>
            <span className="range-value">
              {range.min}-{range.max} {range.unit || range.hours}
            </span>
          </div>
        ))}
      </div>
      
      <div className="validation-results">
        {/* Validation results display */}
      </div>
    </div>
  );
};
```

### Nutrient Schedule Integrator

```jsx
const NutrientScheduleIntegrator = ({ stage, strain, onScheduleUpdate }) => {
  const cannabisNutrientSchedules = {
    germination: {
      nutrients: 'None',
      notes: 'Seeds contain all necessary nutrients'
    },
    seedling: {
      nutrients: 'Light feeding',
      ec: { min: 0.5, max: 0.8 },
      ph: { min: 6.0, max: 6.5 }
    },
    vegetative: {
      nutrients: 'High nitrogen',
      ec: { min: 1.2, max: 1.8 },
      ph: { min: 5.8, max: 6.2 }
    },
    flowering: {
      nutrients: 'High phosphorus/potassium',
      ec: { min: 1.5, max: 2.2 },
      ph: { min: 6.0, max: 6.5 }
    }
  };
  
  const strainSpecificAdjustments = {
    'indica': { ec: 0.1, ph: -0.1 },
    'sativa': { ec: -0.1, ph: 0.1 },
    'hybrid': { ec: 0, ph: 0 }
  };
  
  const getAdjustedSchedule = (baseSchedule, strain) => {
    const adjustment = strainSpecificAdjustments[strain] || { ec: 0, ph: 0 };
    
    return {
      ...baseSchedule,
      ec: {
        min: baseSchedule.ec.min + adjustment.ec,
        max: baseSchedule.ec.max + adjustment.ec
      },
      ph: {
        min: baseSchedule.ph.min + adjustment.ph,
        max: baseSchedule.ph.max + adjustment.ph
      }
    };
  };
  
  return (
    <div className="nutrient-schedule-integrator">
      <div className="schedule-header">
        <h4 className="text-purple-500 font-semibold">Nutrient Schedule</h4>
        <p className="text-gray-400 text-sm">
          Automatic nutrient adjustments for {stage} stage
        </p>
      </div>
      
      <div className="schedule-display">
        <div className="current-schedule">
          <h5>Current Schedule</h5>
          <div className="schedule-details">
            <div className="nutrient-type">
              <span className="label">Nutrients:</span>
              <span className="value">{cannabisNutrientSchedules[stage].nutrients}</span>
            </div>
            <div className="ec-range">
              <span className="label">EC Range:</span>
              <span className="value">
                {cannabisNutrientSchedules[stage].ec.min}-{cannabisNutrientSchedules[stage].ec.max}
              </span>
            </div>
            <div className="ph-range">
              <span className="label">pH Range:</span>
              <span className="value">
                {cannabisNutrientSchedules[stage].ph.min}-{cannabisNutrientSchedules[stage].ph.max}
              </span>
            </div>
          </div>
        </div>
        
        {strain && (
          <div className="strain-adjustment">
            <h5>Strain Adjustment ({strain})</h5>
            <div className="adjustment-details">
              <span className="adjustment">
                EC: {strainSpecificAdjustments[strain]?.ec > 0 ? '+' : ''}{strainSpecificAdjustments[strain]?.ec}
              </span>
              <span className="adjustment">
                pH: {strainSpecificAdjustments[strain]?.ph > 0 ? '+' : ''}{strainSpecificAdjustments[strain]?.ph}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="schedule-actions">
        <Button 
          onClick={() => onScheduleUpdate(getAdjustedSchedule(cannabisNutrientSchedules[stage], strain))}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Update Nutrient Schedule
        </Button>
      </div>
    </div>
  );
};
```

### Compliance Tracker

```jsx
const ComplianceTracker = ({ operation, onComplianceUpdate }) => {
  const complianceRequirements = {
    environmental: [
      'Temperature logs maintained',
      'Humidity levels recorded',
      'Light cycle documented'
    ],
    nutrients: [
      'Nutrient application logged',
      'EC/pH levels recorded',
      'Flush cycles documented'
    ],
    growth: [
      'Growth stage transitions logged',
      'Plant health monitoring',
      'Pest/disease tracking'
    ]
  };
  
  const trackCompliance = (operationType, data) => {
    const requirements = complianceRequirements[operationType] || [];
    const complianceData = {
      operationType,
      timestamp: new Date().toISOString(),
      requirements: requirements.map(req => ({
        requirement: req,
        met: true, // Logic to determine if met
        notes: ''
      })),
      data: data
    };
    
    onComplianceUpdate(complianceData);
  };
  
  return (
    <div className="compliance-tracker">
      <div className="compliance-header">
        <h4 className="text-orange-500 font-semibold">Compliance Tracking</h4>
        <p className="text-gray-400 text-sm">
          Automatic compliance logging for regulatory requirements
        </p>
      </div>
      
      <div className="compliance-requirements">
        {Object.entries(complianceRequirements).map(([category, requirements]) => (
          <div key={category} className="requirement-category">
            <h5 className="category-title capitalize">{category}</h5>
            <ul className="requirement-list">
              {requirements.map((req, index) => (
                <li key={index} className="requirement-item">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="compliance-actions">
        <Button 
          onClick={() => trackCompliance(operation.type, operation.data)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Log Compliance Data
        </Button>
      </div>
    </div>
  );
};
```

## Cannabis-Specific Logic

### Growth Stage Transitions

```javascript
const cannabisGrowthStageLogic = {
  // Automatic stage transitions based on time
  autoTransition: (plant, currentDate) => {
    const stageDurations = {
      germination: 7, // days
      seedling: 14,
      vegetative: 56,
      flowering: 84
    };
    
    const daysInStage = Math.floor((currentDate - plant.stageStartDate) / (1000 * 60 * 60 * 24));
    const currentStage = plant.growthStage;
    
    if (daysInStage >= stageDurations[currentStage]) {
      return getNextStage(currentStage);
    }
    
    return currentStage;
  },
  
  // Environmental adjustments for stage transitions
  getEnvironmentalAdjustments: (fromStage, toStage) => {
    const adjustments = {
      'seedling-vegetative': {
        temperature: { min: 22, max: 28 },
        humidity: { min: 60, max: 70 },
        light: { hours: 18, intensity: 'High' }
      },
      'vegetative-flowering': {
        temperature: { min: 20, max: 26 },
        humidity: { min: 50, max: 60 },
        light: { hours: 12, intensity: 'High' }
      }
    };
    
    const key = `${fromStage}-${toStage}`;
    return adjustments[key] || null;
  }
};
```

### Seasonal Adjustments

```javascript
const seasonalAdjustments = {
  // Seasonal temperature adjustments
  getSeasonalAdjustment: (month, latitude) => {
    const seasonalFactors = {
      winter: { temperature: -2, humidity: +5 },
      spring: { temperature: 0, humidity: 0 },
      summer: { temperature: +2, humidity: -5 },
      fall: { temperature: 0, humidity: 0 }
    };
    
    const season = getSeason(month, latitude);
    return seasonalFactors[season];
  },
  
  // Daylight adjustment recommendations
  getDaylightAdjustment: (month, latitude) => {
    const daylightHours = getDaylightHours(month, latitude);
    const recommendedHours = {
      vegetative: Math.min(18, daylightHours + 2),
      flowering: 12
    };
    
    return recommendedHours;
  }
};
```

## Integration Points

- Existing plant and environment data models
- Current nutrient calculator system
- Growth stage tracking system
- Environmental logging system
- Compliance reporting system

## Definition of Done

- [ ] All acceptance criteria implemented and tested
- [ ] Growth stage-aware operations work correctly
- [ ] Environmental validation follows cannabis standards
- [ ] Nutrient schedules update automatically
- [ ] Compliance data is properly tracked
- [ ] Seasonal adjustments provide relevant recommendations
- [ ] Strain-specific logic works for different cannabis types
- [ ] Unit tests pass with >90% coverage
- [ ] Integration tests verify cannabis-specific features
- [ ] Performance: cannabis logic executes in <500ms
- [ ] Accessibility: cannabis guidance is screen reader friendly
- [ ] Mobile responsive design implemented
- [ ] Code review completed and approved

## Notes

- Ensure cannabis-specific ranges are based on scientific research
- Consider different cannabis strains and their specific needs
- Provide clear guidance on best practices for each growth stage
- Maintain compliance with local cannabis cultivation regulations
- Consider environmental factors specific to cannabis cultivation
- Provide educational content about cannabis cultivation science

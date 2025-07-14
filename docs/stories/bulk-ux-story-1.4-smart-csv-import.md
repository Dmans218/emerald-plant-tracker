# Story 1.4: Smart CSV Import with Growth Stage Mapping

## Story Information

- **Epic**: Bulk Data Management UX Enhancements
- **Story ID**: 1.4
- **Priority**: Medium
- **Estimated Points**: 21
- **Status**: Draft

## User Story

**As a** cannabis cultivator importing historical data
**I want** intelligent CSV import that understands cannabis growth stages
**So that** I can import data with proper stage transitions and environmental presets

## Acceptance Criteria

- [ ] CSV template downloads with growth stage columns
- [ ] Drag-and-drop column mapping interface
- [ ] Real-time validation with cannabis-specific rules
- [ ] Growth stage transition logic with date-based changes
- [ ] Environmental preset integration (Veg Stage: 22-26°C, 60-70% humidity)
- [ ] Imported data maintains referential integrity
- [ ] Growth stage transitions create proper environmental log entries
- [ ] Nutrient schedules adjust automatically with stage changes

## Technical Requirements

### Frontend Components

- `CSVImportWizard` main import wizard
- `ColumnMapping` drag-and-drop interface
- `GrowthStageMapper` cannabis-specific mapping
- `CSVPreview` data preview with validation
- `TemplateDownloader` CSV template generator
- `ValidationDisplay` real-time error display

### Backend API Endpoints

- `POST /api/import/csv-template` - Generate template
- `POST /api/import/validate` - Validate CSV data
- `POST /api/import/process` - Process validated import
- `GET /api/growth-stages` - Get available growth stages
- `GET /api/environmental-presets` - Get stage-specific presets

### Data Models

- `CSVImportJob` - Import job tracking
- `ColumnMapping` - Column mapping configuration
- `GrowthStageTransition` - Stage transition rules
- `EnvironmentalPreset` - Stage-specific environmental settings

## Implementation Tasks

1. [ ] Create `CSVImportWizard` component structure
2. [ ] Implement `TemplateDownloader` with cannabis-specific templates
3. [ ] Build `ColumnMapping` drag-and-drop interface
4. [ ] Create `GrowthStageMapper` with cannabis logic
5. [ ] Implement `CSVPreview` with real-time validation
6. [ ] Add cannabis-specific validation rules
7. [ ] Create growth stage transition logic
8. [ ] Implement environmental preset integration
9. [ ] Build backend CSV processing pipeline
10. [ ] Add nutrient schedule adjustment logic
11. [ ] Implement import job tracking
12. [ ] Create error handling and recovery
13. [ ] Add progress indicators for large imports
14. [ ] Implement rollback functionality
15. [ ] Write comprehensive tests for import flow
16. [ ] Add accessibility features
17. [ ] Create import history and audit trail

## UI/UX Specifications

### CSV Import Wizard

```jsx
const CSVImportWizard = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="2xl">
    <div className="csv-import-wizard bg-gray-900 text-white">
      <div className="wizard-header">
        <h2 className="text-xl font-bold text-green-500">Smart CSV Import</h2>
        <p className="text-gray-400">Import your cultivation data with cannabis-specific intelligence</p>
      </div>
      
      <div className="wizard-steps">
        <Step1: TemplateDownload />
        <Step2: FileUpload />
        <Step3: ColumnMapping />
        <Step4: GrowthStageMapping />
        <Step5: ValidationPreview />
        <Step6: ConfirmImport />
      </div>
    </div>
  </Modal>
);
```

### Column Mapping Interface

```jsx
const ColumnMapping = ({ csvHeaders, availableFields }) => (
  <div className="column-mapping">
    <div className="csv-columns">
      {csvHeaders.map(header => (
        <div key={header} className="csv-column" draggable>
          {header}
        </div>
      ))}
    </div>
    
    <div className="field-mappings">
      {availableFields.map(field => (
        <div key={field.name} className="field-mapping" onDrop={handleDrop}>
          <label>{field.label}</label>
          <div className="mapped-column">
            {mappings[field.name] || 'Drop CSV column here'}
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

### Growth Stage Mapper

```jsx
const GrowthStageMapper = ({ data, onMappingChange }) => (
  <div className="growth-stage-mapper">
    <h3>Growth Stage Intelligence</h3>
    
    <div className="stage-transitions">
      {growthStages.map(stage => (
        <div key={stage.name} className="stage-config">
          <h4>{stage.name}</h4>
          <EnvironmentalPreset preset={stage.preset} />
          <NutrientSchedule schedule={stage.nutrientSchedule} />
          <DateRangeSelector 
            startDate={stage.startDate}
            endDate={stage.endDate}
            onChange={handleStageChange}
          />
        </div>
      ))}
    </div>
  </div>
);
```

## Cannabis-Specific Logic

### Growth Stage Transitions

```javascript
const cannabisGrowthStages = [
  {
    name: 'Germination',
    duration: '3-7 days',
    temperature: { min: 20, max: 25 },
    humidity: { min: 70, max: 80 },
    light: '18-24 hours',
    nutrients: 'None'
  },
  {
    name: 'Seedling',
    duration: '1-2 weeks',
    temperature: { min: 22, max: 26 },
    humidity: { min: 65, max: 75 },
    light: '18-24 hours',
    nutrients: 'Light feeding'
  },
  {
    name: 'Vegetative',
    duration: '3-8 weeks',
    temperature: { min: 22, max: 28 },
    humidity: { min: 60, max: 70 },
    light: '18-24 hours',
    nutrients: 'High nitrogen'
  },
  {
    name: 'Flowering',
    duration: '8-12 weeks',
    temperature: { min: 20, max: 26 },
    humidity: { min: 50, max: 60 },
    light: '12 hours',
    nutrients: 'High phosphorus/potassium'
  }
];
```

### Environmental Preset Integration

```javascript
const applyEnvironmentalPreset = (stage, dateRange) => {
  return {
    temperature_min: stage.temperature.min,
    temperature_max: stage.temperature.max,
    humidity_min: stage.humidity.min,
    humidity_max: stage.humidity.max,
    light_hours: stage.light,
    start_date: dateRange.start,
    end_date: dateRange.end,
    nutrient_schedule: stage.nutrients
  };
};
```

## CSV Template Structure

```csv
Date,Plant_ID,Growth_Stage,Temperature,Humidity,Light_Hours,pH,EC,Notes
2024-01-01,PLANT001,Seedling,24.5,68,18,6.2,1.2,Healthy growth
2024-01-02,PLANT001,Seedling,25.1,70,18,6.1,1.3,Good progress
```

## Validation Rules

### Cannabis-Specific Validation

- Temperature ranges: 18-32°C (cannabis tolerance)
- Humidity ranges: 40-80% (stage-dependent)
- pH ranges: 5.5-7.0 (optimal for cannabis)
- EC ranges: 0.5-3.0 (stage-dependent)
- Growth stage transitions: logical progression
- Date consistency: no future dates, logical progression

### Data Integrity Validation

- Required fields present
- Data type validation
- Referential integrity (plant IDs exist)
- Duplicate detection
- Date range validation

## Integration Points

- Existing plant and environment data models
- Current nutrient calculator system
- Growth stage tracking system
- Environmental logging system
- Audit trail system

## Definition of Done

- [ ] All acceptance criteria implemented and tested
- [ ] CSV import wizard follows cannabis aesthetic
- [ ] Growth stage transitions work correctly
- [ ] Environmental presets apply automatically
- [ ] Nutrient schedules adjust with stage changes
- [ ] Import maintains data integrity
- [ ] Validation catches cannabis-specific issues
- [ ] Large imports (>1000 records) process efficiently
- [ ] Rollback functionality works correctly
- [ ] Unit tests pass with >90% coverage
- [ ] Integration tests verify complete import flow
- [ ] Performance: 1000 records import in <30 seconds
- [ ] Accessibility: full keyboard navigation support
- [ ] Mobile responsive design implemented
- [ ] Import history and audit trail functional
- [ ] Code review completed and approved

## Notes

- Consider cannabis cultivation best practices in validation
- Ensure import doesn't disrupt existing data
- Provide clear feedback for validation errors
- Support common CSV formats and encodings
- Consider batch processing for large imports
- Maintain cannabis-specific terminology throughout

# Story 1.2: Progressive Disclosure Wizard

## Story Information

- **Epic**: Bulk Data Management UX Enhancements
- **Story ID**: 1.2
- **Priority**: High
- **Estimated Points**: 13
- **Status**: Draft

## User Story

**As a** cannabis cultivator performing bulk operations
**I want** a step-by-step wizard that guides me through complex bulk operations
**So that** I can complete operations confidently without making errors

## Acceptance Criteria

- [ ] 4-step wizard: Select Data → Choose Operation → Preview → Confirm
- [ ] Contextual help tooltips for each operation type
- [ ] Smart defaults based on selected data patterns
- [ ] Ability to go back and modify previous steps
- [ ] Wizard integrates with existing form validation
- [ ] All current bulk operations work through wizard
- [ ] Wizard state persists if user navigates away

## Technical Requirements

### Frontend Components

- `BulkOperationWizard` main wizard component
- `WizardStep` reusable step component
- `StepIndicator` progress indicator
- `ContextualHelp` tooltip system
- `SmartDefaults` component for auto-suggestions

### Wizard Steps

1. **Select Data Step**: Enhanced selection interface
2. **Choose Operation Step**: Operation type and parameters
3. **Preview Step**: Before/after comparison
4. **Confirm Step**: Final confirmation and execution

### State Management

- Wizard state machine (React state or XState)
- Step validation and navigation logic
- Smart defaults calculation
- State persistence across navigation

## Implementation Tasks

1. [ ] Create `BulkOperationWizard` component structure
2. [ ] Implement `WizardStep` component with navigation
3. [ ] Create `StepIndicator` progress component
4. [ ] Build Select Data step with enhanced selection
5. [ ] Build Choose Operation step with smart defaults
6. [ ] Build Preview step with before/after comparison
7. [ ] Build Confirm step with final validation
8. [ ] Implement contextual help tooltip system
9. [ ] Add smart defaults logic based on data patterns
10. [ ] Implement wizard state persistence
11. [ ] Add step validation and error handling
12. [ ] Integrate with existing bulk edit functionality
13. [ ] Write comprehensive tests for wizard flow
14. [ ] Add accessibility features (keyboard navigation)

## UI/UX Specifications

### Wizard Structure

```jsx
const BulkOperationWizard = ({ isOpen, onClose, initialData }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="xl">
    <div className="wizard-container bg-gray-900 text-white">
      <StepIndicator currentStep={currentStep} totalSteps={4} />
      
      <div className="wizard-content">
        {currentStep === 1 && <SelectDataStep />}
        {currentStep === 2 && <ChooseOperationStep />}
        {currentStep === 3 && <PreviewStep />}
        {currentStep === 4 && <ConfirmStep />}
      </div>
      
      <WizardNavigation 
        currentStep={currentStep}
        onNext={handleNext}
        onBack={handleBack}
        onCancel={onClose}
      />
    </div>
  </Modal>
);
```

### Step Indicator

```jsx
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="step-indicator flex justify-center mb-6">
    {Array.from({ length: totalSteps }, (_, i) => (
      <div key={i} className={`step ${i < currentStep ? 'completed' : i === currentStep ? 'current' : 'pending'}`}>
        <div className="step-number">{i + 1}</div>
        <div className="step-label">{getStepLabel(i + 1)}</div>
      </div>
    ))}
  </div>
);
```

### Contextual Help

```jsx
const ContextualHelp = ({ helpText, position = 'top' }) => (
  <div className="help-tooltip" data-position={position}>
    <InfoIcon className="w-4 h-4 text-green-500" />
    <div className="help-content bg-gray-800 border border-green-500 rounded p-2">
      {helpText}
    </div>
  </div>
);
```

## Smart Defaults Logic

### Data Pattern Analysis

- Analyze selected data for common patterns
- Suggest operation types based on data characteristics
- Pre-populate parameters based on historical operations
- Detect potential issues and warn users

### Example Smart Defaults

```javascript
const calculateSmartDefaults = (selectedData) => {
  const defaults = {};
  
  // Analyze temperature patterns
  if (selectedData.temperature_range) {
    defaults.temperature_adjustment = suggestTemperatureAdjustment(selectedData);
  }
  
  // Analyze growth stages
  if (selectedData.growth_stages) {
    defaults.stage_transition = suggestStageTransition(selectedData);
  }
  
  // Analyze time patterns
  if (selectedData.date_range) {
    defaults.schedule_adjustment = suggestScheduleAdjustment(selectedData);
  }
  
  return defaults;
};
```

## Integration Points

- Existing `BulkEditModal.js` component
- Current form validation system
- Existing bulk operation API endpoints
- Cannabis-specific business logic

## Definition of Done

- [ ] All acceptance criteria implemented and tested
- [ ] Wizard follows cannabis aesthetic and UX patterns
- [ ] Smart defaults provide relevant suggestions
- [ ] Contextual help is informative and accessible
- [ ] Wizard state persists correctly across navigation
- [ ] All existing bulk operations work through wizard
- [ ] Unit tests pass with >90% coverage
- [ ] Integration tests verify complete wizard flow
- [ ] Performance: step transitions in <200ms
- [ ] Accessibility: full keyboard navigation support
- [ ] Mobile responsive design implemented
- [ ] Code review completed and approved

## Notes

- Wizard should feel intuitive and not overwhelming
- Smart defaults should be helpful but not prescriptive
- Contextual help should be cannabis-cultivation specific
- Consider progressive disclosure for complex operations
- Ensure wizard works well on mobile devices

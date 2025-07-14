# Story 1.3: Advanced Preview & Comparison

## Story Information

- **Epic**: Bulk Data Management UX Enhancements
- **Story ID**: 1.3
- **Priority**: High
- **Estimated Points**: 8
- **Status**: Draft

## User Story

**As a** cannabis cultivator making bulk changes
**I want** to see exactly what will change before confirming
**So that** I can verify the operation will produce the expected results

## Acceptance Criteria

- [ ] Before/after comparison view of changes
- [ ] Change summary showing affected records and modifications
- [ ] Preview of which records will be skipped due to validation errors
- [ ] Visual indicators for different types of changes
- [ ] Preview data matches actual bulk operation results
- [ ] Performance remains under 2 seconds for preview generation
- [ ] Preview works for all existing bulk operation types

## Technical Requirements

### Frontend Components

- `ChangePreview` main preview component
- `BeforeAfterComparison` side-by-side view
- `ChangeSummary` summary display
- `ValidationPreview` error preview
- `ChangeIndicator` visual change markers
- `PreviewLoader` loading state for preview generation

### Backend API Endpoints

- `POST /api/environment/bulk-preview` - Generate preview data
- `GET /api/environment/bulk-validation` - Get validation rules
- `POST /api/environment/bulk-simulate` - Simulate bulk operation

### State Management

- Preview state management
- Change tracking and comparison
- Validation error aggregation
- Performance optimization for large datasets

## Implementation Tasks

1. [ ] Create `ChangePreview` component structure
2. [ ] Implement `BeforeAfterComparison` view
3. [ ] Build `ChangeSummary` component
4. [ ] Create `ValidationPreview` for error display
5. [ ] Add `ChangeIndicator` visual markers
6. [ ] Implement preview generation API endpoint
7. [ ] Add validation simulation logic
8. [ ] Create performance optimization for large datasets
9. [ ] Add preview caching mechanism
10. [ ] Implement real-time preview updates
11. [ ] Write unit tests for preview components
12. [ ] Add integration tests for preview workflow

## UI/UX Specifications

### Change Preview Component

```jsx
const ChangePreview = ({ selectedData, operation, onConfirm, onCancel }) => (
  <div className="change-preview bg-gray-900 text-white">
    <div className="preview-header">
      <h3 className="text-lg font-bold text-green-500">Preview Changes</h3>
      <p className="text-gray-400">Review what will be changed before confirming</p>
    </div>
    
    <div className="preview-content">
      <ChangeSummary 
        affectedRecords={previewData.affectedCount}
        changes={previewData.changes}
        errors={previewData.errors}
      />
      
      <BeforeAfterComparison 
        beforeData={previewData.before}
        afterData={previewData.after}
        changes={previewData.changes}
      />
      
      <ValidationPreview 
        errors={previewData.validationErrors}
        warnings={previewData.warnings}
      />
    </div>
    
    <div className="preview-actions">
      <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
        Confirm Changes
      </Button>
      <Button onClick={onCancel} variant="outline" className="border-gray-600">
        Cancel
      </Button>
    </div>
  </div>
);
```

### Before/After Comparison

```jsx
const BeforeAfterComparison = ({ beforeData, afterData, changes }) => (
  <div className="comparison-view">
    <div className="comparison-header">
      <h4>Before vs After</h4>
      <div className="change-count">
        {changes.length} changes detected
      </div>
    </div>
    
    <div className="comparison-table">
      <table className="w-full">
        <thead>
          <tr>
            <th>Field</th>
            <th>Before</th>
            <th>After</th>
            <th>Change Type</th>
          </tr>
        </thead>
        <tbody>
          {changes.map(change => (
            <tr key={change.field} className="change-row">
              <td>{change.field}</td>
              <td className="before-value">{change.before}</td>
              <td className="after-value">{change.after}</td>
              <td>
                <ChangeIndicator type={change.type} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
```

### Change Summary

```jsx
const ChangeSummary = ({ affectedRecords, changes, errors }) => (
  <div className="change-summary bg-gray-800 border border-green-500 rounded-lg p-4">
    <div className="summary-stats grid grid-cols-3 gap-4">
      <div className="stat">
        <div className="stat-value text-green-500">{affectedRecords}</div>
        <div className="stat-label">Records Affected</div>
      </div>
      <div className="stat">
        <div className="stat-value text-blue-500">{changes.length}</div>
        <div className="stat-label">Changes Made</div>
      </div>
      <div className="stat">
        <div className="stat-value text-red-500">{errors.length}</div>
        <div className="stat-label">Validation Errors</div>
      </div>
    </div>
    
    {errors.length > 0 && (
      <div className="error-summary mt-4">
        <h5 className="text-red-400 font-semibold">Validation Issues</h5>
        <ul className="error-list">
          {errors.map(error => (
            <li key={error.id} className="text-red-300">
              {error.message}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
```

### Change Indicator

```jsx
const ChangeIndicator = ({ type }) => {
  const indicators = {
    add: { icon: 'Plus', color: 'text-green-500', label: 'Added' },
    update: { icon: 'Edit', color: 'text-blue-500', label: 'Updated' },
    delete: { icon: 'Trash', color: 'text-red-500', label: 'Deleted' },
    unchanged: { icon: 'Minus', color: 'text-gray-500', label: 'Unchanged' }
  };
  
  const indicator = indicators[type];
  
  return (
    <div className={`change-indicator flex items-center ${indicator.color}`}>
      <Icon name={indicator.icon} className="w-4 h-4 mr-1" />
      <span className="text-sm">{indicator.label}</span>
    </div>
  );
};
```

## Performance Optimization

### Preview Generation Strategy

```javascript
const generatePreview = async (selectedData, operation) => {
  // Use Web Workers for heavy computation
  const worker = new Worker('/workers/preview-generator.js');
  
  return new Promise((resolve) => {
    worker.postMessage({ selectedData, operation });
    worker.onmessage = (event) => {
      resolve(event.data);
    };
  });
};

// Caching strategy for repeated previews
const previewCache = new Map();
const getCachedPreview = (key) => {
  const cached = previewCache.get(key);
  if (cached && Date.now() - cached.timestamp < 30000) {
    return cached.data;
  }
  return null;
};
```

### Large Dataset Handling

```javascript
const handleLargeDataset = (data, maxRecords = 1000) => {
  if (data.length > maxRecords) {
    return {
      preview: data.slice(0, maxRecords),
      warning: `Showing preview of first ${maxRecords} records. Full operation will affect ${data.length} records.`
    };
  }
  return { preview: data, warning: null };
};
```

## Integration Points

- Existing `BulkEditModal.js` component
- Current bulk operation API endpoints
- Existing validation system
- Performance monitoring system

## Definition of Done

- [ ] All acceptance criteria implemented and tested
- [ ] Preview components follow cannabis aesthetic
- [ ] Before/after comparison is clear and intuitive
- [ ] Performance: preview generation in <2 seconds
- [ ] Validation errors are clearly displayed
- [ ] Preview data matches actual operation results
- [ ] Unit tests pass with >90% coverage
- [ ] Integration tests verify preview workflow
- [ ] Large datasets (>1000 records) handled efficiently
- [ ] Accessibility: keyboard navigation and screen reader support
- [ ] Mobile responsive design implemented
- [ ] Code review completed and approved

## Notes

- Preview should be fast enough for real-time feedback
- Consider progressive loading for very large datasets
- Ensure preview accurately reflects actual operation results
- Provide clear visual distinction between different change types
- Maintain cannabis-specific terminology in change descriptions

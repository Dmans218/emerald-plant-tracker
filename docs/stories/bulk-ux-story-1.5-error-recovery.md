# Story 1.5: Error Prevention & Recovery System

## Story Information

- **Epic**: Bulk Data Management UX Enhancements
- **Story ID**: 1.5
- **Priority**: High
- **Estimated Points**: 13
- **Status**: Draft

## User Story

**As a** cannabis cultivator performing bulk operations
**I want** robust error prevention and recovery mechanisms
**So that** I can confidently perform operations knowing I can recover from mistakes

## Acceptance Criteria

- [ ] Confirmation dialogs for operations affecting >10 records
- [ ] Partial success handling with detailed reporting
- [ ] Undo capability for recent bulk operations
- [ ] Change history log with rollback options
- [ ] Validation preview showing potential issues
- [ ] Undo operations restore exact previous state
- [ ] Change history integrates with existing audit trails
- [ ] Error recovery doesn't affect data integrity

## Technical Requirements

### Frontend Components

- `ConfirmationDialog` enhanced confirmation component
- `PartialSuccessReport` detailed success/failure reporting
- `UndoManager` undo/redo functionality
- `ChangeHistory` operation history display
- `ValidationPreview` pre-operation validation
- `ErrorBoundary` error handling wrapper
- `RecoveryOptions` recovery action interface

### Backend API Endpoints

- `POST /api/environment/bulk-undo` - Undo last bulk operation
- `GET /api/environment/bulk-history` - Get operation history
- `POST /api/environment/bulk-rollback` - Rollback to specific point
- `GET /api/environment/bulk-validation-preview` - Preview validation issues
- `POST /api/environment/bulk-confirm` - Enhanced confirmation endpoint

### Data Models

- `BulkOperation` - Operation tracking model
- `OperationHistory` - History and audit trail
- `UndoStack` - Undo/redo state management
- `ValidationResult` - Pre-operation validation

### Database Schema Changes

```sql
-- Bulk operation tracking
CREATE TABLE bulk_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_type TEXT NOT NULL,
    affected_records INTEGER NOT NULL,
    success_count INTEGER NOT NULL,
    error_count INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Operation details for undo
CREATE TABLE bulk_operation_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_id INTEGER NOT NULL,
    record_id INTEGER NOT NULL,
    table_name TEXT NOT NULL,
    before_state TEXT, -- JSON
    after_state TEXT, -- JSON
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    FOREIGN KEY (operation_id) REFERENCES bulk_operations(id)
);

-- Undo stack
CREATE TABLE undo_stack (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (operation_id) REFERENCES bulk_operations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Implementation Tasks

1. [ ] Create `ConfirmationDialog` with cannabis aesthetic
2. [ ] Implement `PartialSuccessReport` component
3. [ ] Build `UndoManager` with undo/redo stack
4. [ ] Create `ChangeHistory` operation history display
5. [ ] Add `ValidationPreview` pre-operation validation
6. [ ] Implement backend undo/redo API endpoints
7. [ ] Create database schema for operation tracking
8. [ ] Add operation history and audit trail
9. [ ] Implement rollback functionality
10. [ ] Add error boundary and recovery options
11. [ ] Create confirmation flow for large operations
12. [ ] Add partial success handling logic
13. [ ] Implement undo stack management
14. [ ] Write comprehensive tests for recovery system
15. [ ] Add accessibility features for error handling

## UI/UX Specifications

### Enhanced Confirmation Dialog

```jsx
const ConfirmationDialog = ({ operation, affectedCount, onConfirm, onCancel }) => (
  <Modal isOpen={true} onClose={onCancel} size="lg">
    <div className="confirmation-dialog bg-gray-900 text-white">
      <div className="dialog-header">
        <AlertTriangle className="w-8 h-8 text-yellow-500" />
        <h3 className="text-lg font-bold">Confirm Bulk Operation</h3>
      </div>
      
      <div className="dialog-content">
        <div className="operation-summary">
          <p>You're about to perform: <strong>{operation.type}</strong></p>
          <p>This will affect <strong className="text-red-400">{affectedCount} records</strong></p>
        </div>
        
        {affectedCount > 10 && (
          <div className="warning-box bg-yellow-900 border border-yellow-500 rounded p-3">
            <p className="text-yellow-300">
              ⚠️ This operation affects many records. Consider reviewing the preview first.
            </p>
          </div>
        )}
        
        <div className="safety-features">
          <p className="text-gray-400 text-sm">
            ✓ This operation can be undone within 24 hours
            ✓ You'll receive a detailed report of results
            ✓ Failed records will be clearly identified
          </p>
        </div>
      </div>
      
      <div className="dialog-actions">
        <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
          Confirm Operation
        </Button>
        <Button onClick={onCancel} variant="outline" className="border-gray-600">
          Cancel
        </Button>
      </div>
    </div>
  </Modal>
);
```

### Partial Success Report

```jsx
const PartialSuccessReport = ({ operation, results }) => (
  <div className="partial-success-report bg-gray-800 border border-green-500 rounded-lg p-4">
    <div className="report-header">
      <h4 className="text-green-500 font-semibold">Operation Results</h4>
      <span className="text-sm text-gray-400">
        {new Date().toLocaleString()}
      </span>
    </div>
    
    <div className="results-summary grid grid-cols-3 gap-4 my-4">
      <div className="result-stat">
        <div className="stat-value text-green-500">{results.successCount}</div>
        <div className="stat-label">Successful</div>
      </div>
      <div className="result-stat">
        <div className="stat-value text-red-500">{results.errorCount}</div>
        <div className="stat-label">Failed</div>
      </div>
      <div className="result-stat">
        <div className="stat-value text-blue-500">{results.skippedCount}</div>
        <div className="stat-label">Skipped</div>
      </div>
    </div>
    
    {results.errors.length > 0 && (
      <div className="error-details">
        <h5 className="text-red-400 font-semibold mb-2">Failed Records</h5>
        <div className="error-list max-h-40 overflow-y-auto">
          {results.errors.map(error => (
            <div key={error.id} className="error-item text-red-300 text-sm">
              <span className="font-mono">ID: {error.recordId}</span>
              <span className="ml-2">{error.message}</span>
            </div>
          ))}
        </div>
      </div>
    )}
    
    <div className="recovery-options mt-4">
      <Button 
        onClick={() => handleUndo(operation.id)}
        variant="outline" 
        className="border-yellow-500 text-yellow-500"
      >
        Undo Operation
      </Button>
      <Button 
        onClick={() => handleRetryFailed(results.errors)}
        variant="outline" 
        className="border-blue-500 text-blue-500 ml-2"
      >
        Retry Failed
      </Button>
    </div>
  </div>
);
```

### Undo Manager

```jsx
const UndoManager = ({ operations, onUndo, onRedo }) => (
  <div className="undo-manager">
    <div className="undo-header">
      <h4>Recent Operations</h4>
      <p className="text-sm text-gray-400">
        Operations can be undone within 24 hours
      </p>
    </div>
    
    <div className="undo-list">
      {operations.map(operation => (
        <div key={operation.id} className="undo-item bg-gray-800 rounded p-3 mb-2">
          <div className="operation-info">
            <span className="operation-type font-semibold">
              {operation.type}
            </span>
            <span className="operation-time text-sm text-gray-400">
              {formatTimeAgo(operation.createdAt)}
            </span>
          </div>
          
          <div className="operation-stats text-sm text-gray-300">
            {operation.affectedRecords} records affected
          </div>
          
          <div className="undo-actions">
            <Button 
              onClick={() => onUndo(operation.id)}
              size="sm"
              variant="outline"
              className="border-yellow-500 text-yellow-500"
            >
              Undo
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

### Change History

```jsx
const ChangeHistory = ({ history, onRollback }) => (
  <div className="change-history">
    <div className="history-header">
      <h4>Operation History</h4>
      <div className="history-filters">
        <Select defaultValue="all">
          <option value="all">All Operations</option>
          <option value="environment">Environment</option>
          <option value="nutrients">Nutrients</option>
          <option value="stages">Growth Stages</option>
        </Select>
      </div>
    </div>
    
    <div className="history-timeline">
      {history.map(entry => (
        <div key={entry.id} className="history-entry">
          <div className="entry-header">
            <span className="entry-type">{entry.type}</span>
            <span className="entry-time">{formatDateTime(entry.createdAt)}</span>
          </div>
          
          <div className="entry-details">
            <span className="entry-user">{entry.userName}</span>
            <span className="entry-records">{entry.affectedRecords} records</span>
          </div>
          
          <div className="entry-actions">
            <Button 
              onClick={() => onRollback(entry.id)}
              size="sm"
              variant="outline"
              className="border-blue-500 text-blue-500"
            >
              Rollback to This Point
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

## Error Prevention Strategies

### Pre-Operation Validation

```javascript
const validateBulkOperation = async (selectedData, operation) => {
  const validationResults = {
    errors: [],
    warnings: [],
    canProceed: true
  };
  
  // Check for potential issues
  if (selectedData.length > 100) {
    validationResults.warnings.push({
      type: 'large_operation',
      message: `This operation will affect ${selectedData.length} records. Consider breaking it into smaller batches.`
    });
  }
  
  // Check for data consistency issues
  const consistencyIssues = await checkDataConsistency(selectedData);
  validationResults.errors.push(...consistencyIssues);
  
  // Check for permission issues
  const permissionIssues = await checkPermissions(operation);
  validationResults.errors.push(...permissionIssues);
  
  validationResults.canProceed = validationResults.errors.length === 0;
  
  return validationResults;
};
```

### Undo Stack Management

```javascript
class UndoManager {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.maxStackSize = 50;
  }
  
  pushOperation(operation) {
    this.undoStack.push(operation);
    this.redoStack = []; // Clear redo stack on new operation
    
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
  }
  
  undo() {
    if (this.undoStack.length === 0) return null;
    
    const operation = this.undoStack.pop();
    this.redoStack.push(operation);
    
    return operation;
  }
  
  redo() {
    if (this.redoStack.length === 0) return null;
    
    const operation = this.redoStack.pop();
    this.undoStack.push(operation);
    
    return operation;
  }
}
```

## Integration Points

- Existing `BulkEditModal.js` component
- Current audit trail system
- Existing user authentication
- Database transaction system
- Error logging system

## Definition of Done

- [ ] All acceptance criteria implemented and tested
- [ ] Confirmation dialogs work for all operation types
- [ ] Partial success reporting is comprehensive
- [ ] Undo functionality works correctly
- [ ] Change history integrates with audit trails
- [ ] Validation preview prevents errors
- [ ] Database schema changes implemented
- [ ] Unit tests pass with >90% coverage
- [ ] Integration tests verify recovery workflow
- [ ] Performance: undo operations complete in <1 second
- [ ] Accessibility: error messages are screen reader friendly
- [ ] Mobile responsive design implemented
- [ ] Code review completed and approved

## Notes

- Undo operations should be fast and reliable
- Consider implementing operation batching for large datasets
- Ensure error messages are cannabis-cultivation specific
- Provide clear guidance on when operations can be undone
- Maintain data integrity during all recovery operations

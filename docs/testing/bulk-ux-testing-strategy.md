# Bulk UX Testing Strategy

## Overview
This document outlines the comprehensive testing strategy for the bulk data management UX enhancements, ensuring quality, performance, and reliability across all features.

## Testing Pyramid

### 1. Unit Tests (70% of tests)
**Coverage Target**: >90% for all components and utilities

#### Frontend Unit Tests
```javascript
// Example: SelectionSummary component test
describe('SelectionSummary', () => {
  it('should display correct count and range', () => {
    const props = {
      selectedCount: 25,
      dateRange: '2024-01-01 to 2024-01-31',
      tent: 'Tent A'
    };
    
    render(<SelectionSummary {...props} />);
    
    expect(screen.getByText('25 records selected')).toBeInTheDocument();
    expect(screen.getByText('from Tent A (2024-01-01 to 2024-01-31)')).toBeInTheDocument();
  });
  
  it('should handle empty selection', () => {
    const props = {
      selectedCount: 0,
      dateRange: '',
      tent: ''
    };
    
    render(<SelectionSummary {...props} />);
    
    expect(screen.getByText('0 records selected')).toBeInTheDocument();
  });
});
```

#### Backend Unit Tests
```javascript
// Example: Bulk operation validation test
describe('BulkOperationValidator', () => {
  it('should validate cannabis environmental ranges', () => {
    const validator = new BulkOperationValidator();
    const data = {
      stage: 'vegetative',
      temperature: 25.0,
      humidity: 65
    };
    
    const result = validator.validateEnvironmental(data);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should reject invalid temperature for vegetative stage', () => {
    const validator = new BulkOperationValidator();
    const data = {
      stage: 'vegetative',
      temperature: 35.0, // Too high
      humidity: 65
    };
    
    const result = validator.validateEnvironmental(data);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('temperature');
  });
});
```

### 2. Integration Tests (20% of tests)
**Focus**: Component interactions and API integration

#### Frontend Integration Tests
```javascript
// Example: Bulk wizard flow test
describe('BulkOperationWizard Integration', () => {
  it('should complete full wizard flow', async () => {
    render(<BulkOperationWizard isOpen={true} />);
    
    // Step 1: Select Data
    await user.click(screen.getByText('Select All'));
    await user.click(screen.getByText('Next'));
    
    // Step 2: Choose Operation
    await user.click(screen.getByText('Update Temperature'));
    await user.type(screen.getByLabelText('Temperature'), '25.0');
    await user.click(screen.getByText('Next'));
    
    // Step 3: Preview
    expect(screen.getByText('Preview Changes')).toBeInTheDocument();
    await user.click(screen.getByText('Next'));
    
    // Step 4: Confirm
    expect(screen.getByText('Confirm Operation')).toBeInTheDocument();
    await user.click(screen.getByText('Complete'));
    
    expect(mockOnComplete).toHaveBeenCalledWith({
      selectedData: mockSelectedData,
      operation: { type: 'update_temperature', temperature: 25.0 }
    });
  });
});
```

#### API Integration Tests
```javascript
// Example: Bulk operation API test
describe('Bulk Operation API Integration', () => {
  it('should process bulk temperature update', async () => {
    const request = {
      selectedIds: [1, 2, 3],
      operation: {
        type: 'update_temperature',
        temperature: 25.0
      }
    };
    
    const response = await request(app)
      .post('/api/environment/bulk-update')
      .send(request)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.affectedRecords).toBe(3);
    expect(response.body.data.successCount).toBe(3);
  });
  
  it('should handle validation errors', async () => {
    const request = {
      selectedIds: [1, 2, 3],
      operation: {
        type: 'update_temperature',
        temperature: 35.0 // Invalid for vegetative stage
      }
    };
    
    const response = await request(app)
      .post('/api/environment/bulk-update')
      .send(request)
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### 3. End-to-End Tests (10% of tests)
**Focus**: Complete user workflows and critical paths

#### E2E Test Examples
```javascript
// Example: Complete bulk operation workflow
describe('Bulk Operation E2E', () => {
  it('should complete bulk temperature update workflow', async () => {
    // Setup test data
    await seedTestData();
    
    // Navigate to environment page
    await page.goto('/environment');
    
    // Select data for bulk operation
    await page.click('[data-testid="select-all-button"]');
    await page.click('[data-testid="bulk-edit-button"]');
    
    // Complete wizard
    await page.click('[data-testid="wizard-next"]');
    await page.fill('[data-testid="temperature-input"]', '25.0');
    await page.click('[data-testid="wizard-next"]');
    await page.click('[data-testid="wizard-next"]');
    await page.click('[data-testid="confirm-operation"]');
    
    // Verify results
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('text=3 records updated')).toBeVisible();
  });
  
  it('should handle CSV import workflow', async () => {
    await page.goto('/import');
    
    // Upload CSV file
    await page.setInputFiles('[data-testid="csv-upload"]', 'test-data.csv');
    
    // Map columns
    await page.selectOption('[data-testid="date-column"]', 'Date');
    await page.selectOption('[data-testid="temperature-column"]', 'Temperature');
    
    // Validate and import
    await page.click('[data-testid="validate-csv"]');
    await page.click('[data-testid="import-data"]');
    
    // Verify import results
    await expect(page.locator('[data-testid="import-success"]')).toBeVisible();
  });
});
```

## Performance Testing

### Load Testing
```javascript
// Example: Bulk operation performance test
describe('Bulk Operation Performance', () => {
  it('should handle 1000 records within 5 seconds', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .post('/api/environment/bulk-update')
      .send({
        selectedIds: Array.from({ length: 1000 }, (_, i) => i + 1),
        operation: { type: 'update_temperature', temperature: 25.0 }
      });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(5000); // 5 seconds
  });
  
  it('should generate preview within 2 seconds', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .post('/api/environment/bulk-preview')
      .send({
        selectedIds: Array.from({ length: 500 }, (_, i) => i + 1),
        operation: { type: 'update_temperature', temperature: 25.0 }
      });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(2000); // 2 seconds
  });
});
```

### Mobile Performance Testing
```javascript
// Example: Mobile interaction performance
describe('Mobile Performance', () => {
  it('should respond to touch interactions within 100ms', async () => {
    await page.goto('/environment');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    const startTime = Date.now();
    await page.tap('[data-testid="select-item"]');
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(100);
  });
});
```

## Accessibility Testing

### Screen Reader Testing
```javascript
// Example: Accessibility test
describe('Accessibility', () => {
  it('should be navigable with keyboard', async () => {
    render(<BulkOperationWizard isOpen={true} />);
    
    // Navigate with Tab key
    const focusableElements = screen.getAllByRole('button');
    expect(focusableElements).toHaveLength(4); // Back, Next, Cancel, Confirm
    
    // Test keyboard navigation
    await user.tab();
    expect(focusableElements[0]).toHaveFocus();
  });
  
  it('should have proper ARIA labels', () => {
    render(<SelectionSummary selectedCount={5} />);
    
    const summary = screen.getByRole('region', { name: /selection summary/i });
    expect(summary).toBeInTheDocument();
    
    const count = screen.getByText('5 records selected');
    expect(count).toHaveAttribute('aria-live', 'polite');
  });
});
```

## Cannabis-Specific Testing

### Domain Logic Testing
```javascript
// Example: Cannabis growth stage validation
describe('Cannabis Growth Stage Logic', () => {
  it('should validate environmental ranges for vegetative stage', () => {
    const validator = new CannabisEnvironmentalValidator();
    
    const validData = {
      stage: 'vegetative',
      temperature: 24.0,
      humidity: 65,
      lightHours: 18
    };
    
    const result = validator.validate(validData);
    expect(result.isValid).toBe(true);
  });
  
  it('should calculate VPD correctly', () => {
    const calculator = new VPDCalculator();
    
    const vpd = calculator.calculate(24.0, 65);
    expect(vpd).toBeCloseTo(1.2, 1);
  });
  
  it('should suggest nutrient adjustments for strain', () => {
    const advisor = new NutrientAdvisor();
    
    const suggestion = advisor.getSuggestion('indica', 'vegetative');
    expect(suggestion.ecAdjustment).toBe(0.1);
    expect(suggestion.phAdjustment).toBe(-0.1);
  });
});
```

## Error Handling Testing

### Error Scenarios
```javascript
// Example: Error handling tests
describe('Error Handling', () => {
  it('should handle network failures gracefully', async () => {
    // Mock network failure
    server.use(
      rest.post('/api/environment/bulk-update', (req, res, ctx) => {
        return res.networkError('Failed to connect');
      })
    );
    
    render(<BulkOperationWizard />);
    await user.click(screen.getByText('Confirm'));
    
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByText(/retry/i)).toBeInTheDocument();
  });
  
  it('should handle partial success scenarios', async () => {
    // Mock partial success response
    server.use(
      rest.post('/api/environment/bulk-update', (req, res, ctx) => {
        return res.json({
          success: true,
          data: {
            successCount: 3,
            errorCount: 2,
            errors: [
              { recordId: 4, error: 'Invalid temperature' },
              { recordId: 5, error: 'Record not found' }
            ]
          }
        });
      })
    );
    
    render(<BulkOperationWizard />);
    await user.click(screen.getByText('Confirm'));
    
    expect(screen.getByText('3 successful, 2 failed')).toBeInTheDocument();
    expect(screen.getByText('Invalid temperature')).toBeInTheDocument();
  });
});
```

## Test Data Management

### Test Data Setup
```javascript
// Example: Test data setup
const testData = {
  plants: [
    { id: 1, name: 'Plant A', growthStage: 'vegetative', tentId: 1 },
    { id: 2, name: 'Plant B', growthStage: 'flowering', tentId: 1 },
    { id: 3, name: 'Plant C', growthStage: 'vegetative', tentId: 2 }
  ],
  environmentalLogs: [
    { id: 1, plantId: 1, temperature: 24.0, humidity: 65, timestamp: '2024-01-15T10:00:00Z' },
    { id: 2, plantId: 2, temperature: 22.0, humidity: 55, timestamp: '2024-01-15T10:00:00Z' },
    { id: 3, plantId: 3, temperature: 25.0, humidity: 70, timestamp: '2024-01-15T10:00:00Z' }
  ],
  tents: [
    { id: 1, name: 'Tent A', location: 'Grow Room 1' },
    { id: 2, name: 'Tent B', location: 'Grow Room 2' }
  ]
};
```

## Continuous Integration

### CI/CD Pipeline
```yaml
# Example: GitHub Actions workflow
name: Bulk UX Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Environment Setup

### Local Development
```bash
# Setup test database
npm run db:test:setup

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:unit -- --grep "BulkOperation"
npm run test:integration -- --grep "Wizard"
npm run test:e2e -- --grep "CSV Import"
```

### Test Coverage Goals
- **Unit Tests**: >90% coverage
- **Integration Tests**: >80% coverage
- **E2E Tests**: All critical user paths
- **Performance Tests**: All performance requirements met
- **Accessibility Tests**: WCAG 2.1 AA compliance

## Monitoring and Reporting

### Test Metrics
- Test execution time
- Coverage trends
- Failure rates
- Performance regression detection
- Accessibility compliance status

### Quality Gates
- All tests must pass
- Coverage targets must be met
- Performance benchmarks must be achieved
- No accessibility violations
- No security vulnerabilities detected 
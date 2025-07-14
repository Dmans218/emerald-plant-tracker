# Bulk UX Backend API Specification

## Overview

This document specifies the backend API endpoints required to support the bulk data management UX enhancements for the Emerald Plant Tracker.

## Technical Stack

- **Database**: PostgreSQL (corrected from SQLite)
- **Backend**: Node.js 22, Express.js 5.1
- **Build System**: npm/yarn (corrected from Bun)
- **Testing**: Jest, Supertest

## Database Schema Changes

### New Tables for Bulk Operations

```sql
-- Bulk operation tracking
CREATE TABLE bulk_operations (
    id SERIAL PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    affected_records INTEGER NOT NULL,
    success_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    operation_data JSONB,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Operation details for undo functionality
CREATE TABLE bulk_operation_details (
    id SERIAL PRIMARY KEY,
    operation_id INTEGER NOT NULL,
    record_id INTEGER NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    before_state JSONB,
    after_state JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    FOREIGN KEY (operation_id) REFERENCES bulk_operations(id)
);

-- Undo stack management
CREATE TABLE undo_stack (
    id SERIAL PRIMARY KEY,
    operation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (operation_id) REFERENCES bulk_operations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Cannabis-specific data
CREATE TABLE cannabis_growth_stages (
    id SERIAL PRIMARY KEY,
    stage_name VARCHAR(50) NOT NULL,
    duration_min INTEGER,
    duration_max INTEGER,
    temperature_min DECIMAL(4,1),
    temperature_max DECIMAL(4,1),
    humidity_min INTEGER,
    humidity_max INTEGER,
    light_hours VARCHAR(20),
    light_intensity VARCHAR(20),
    nutrient_type VARCHAR(100),
    ec_min DECIMAL(3,2),
    ec_max DECIMAL(3,2),
    ph_min DECIMAL(3,1),
    ph_max DECIMAL(3,1)
);

-- Environmental presets
CREATE TABLE environmental_presets (
    id SERIAL PRIMARY KEY,
    stage_id INTEGER NOT NULL,
    preset_name VARCHAR(100),
    temperature_min DECIMAL(4,1),
    temperature_max DECIMAL(4,1),
    humidity_min INTEGER,
    humidity_max INTEGER,
    light_hours INTEGER,
    vpd_min DECIMAL(3,2),
    vpd_max DECIMAL(3,2),
    FOREIGN KEY (stage_id) REFERENCES cannabis_growth_stages(id)
);

-- Compliance tracking
CREATE TABLE compliance_logs (
    id SERIAL PRIMARY KEY,
    operation_id INTEGER NOT NULL,
    requirement_type VARCHAR(50) NOT NULL,
    requirement_name VARCHAR(200) NOT NULL,
    met BOOLEAN DEFAULT true,
    notes TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operation_id) REFERENCES bulk_operations(id)
);
```

## API Endpoints

### 1. Enhanced Selection & Preview

#### GET /api/environment/bulk-stats

Get statistics for selected data.

**Query Parameters:**

- `selectedIds` (array): Array of selected record IDs
- `dateRange` (string): Date range filter
- `tentId` (integer): Tent filter

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRecords": 150,
    "dateRange": "2024-01-01 to 2024-01-31",
    "tentLocation": "Tent A",
    "growthStages": {
      "vegetative": 45,
      "flowering": 105
    },
    "environmentalRanges": {
      "temperature": { "min": 22.1, "max": 26.8, "avg": 24.5 },
      "humidity": { "min": 58, "max": 72, "avg": 65 }
    }
  }
}
```

#### POST /api/environment/bulk-preview

Generate preview of bulk operation changes.

**Request Body:**

```json
{
  "selectedIds": [1, 2, 3, 4, 5],
  "operation": {
    "type": "update_temperature",
    "parameters": {
      "temperature": 25.0,
      "adjustment": "+2.0"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "affectedRecords": 5,
    "changes": [
      {
        "field": "temperature",
        "before": 23.0,
        "after": 25.0,
        "type": "update"
      }
    ],
    "validationErrors": [],
    "warnings": [
      {
        "type": "vpd_warning",
        "message": "VPD may be outside optimal range"
      }
    ]
  }
}
```

### 2. Progressive Wizard Support

#### POST /api/environment/bulk-wizard/validate-step

Validate wizard step data.

**Request Body:**

```json
{
  "step": 2,
  "data": {
    "operationType": "update_environmental",
    "parameters": {
      "temperature": 25.0,
      "humidity": 65
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "smartDefaults": {
      "suggestedTemperature": 24.5,
      "suggestedHumidity": 68
    }
  }
}
```

### 3. Error Prevention & Recovery

#### POST /api/environment/bulk-undo

Undo the last bulk operation.

**Request Body:**

```json
{
  "operationId": 123
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "undoneOperation": {
      "id": 123,
      "type": "update_temperature",
      "affectedRecords": 5
    },
    "restoredRecords": 5
  }
}
```

#### GET /api/environment/bulk-history

Get operation history for user.

**Query Parameters:**

- `userId` (integer): User ID
- `limit` (integer): Number of records to return
- `offset` (integer): Pagination offset
- `operationType` (string): Filter by operation type

**Response:**

```json
{
  "success": true,
  "data": {
    "operations": [
      {
        "id": 123,
        "type": "update_temperature",
        "affectedRecords": 5,
        "successCount": 5,
        "errorCount": 0,
        "createdAt": "2024-01-15T10:30:00Z",
        "status": "completed"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0
    }
  }
}
```

#### POST /api/environment/bulk-rollback

Rollback to a specific operation point.

**Request Body:**

```json
{
  "operationId": 123,
  "confirmRollback": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "rollbackOperation": {
      "id": 124,
      "type": "rollback",
      "targetOperationId": 123,
      "affectedRecords": 5
    }
  }
}
```

### 4. Smart CSV Import

#### GET /api/import/csv-template

Generate CSV template for import.

**Query Parameters:**

- `dataType` (string): Type of data to import (environmental, nutrients, etc.)

**Response:**

```json
{
  "success": true,
  "data": {
    "template": "Date,Plant_ID,Growth_Stage,Temperature,Humidity,Light_Hours,pH,EC,Notes\n2024-01-01,PLANT001,Seedling,24.5,68,18,6.2,1.2,Healthy growth",
    "columns": [
      { "name": "Date", "required": true, "type": "date" },
      { "name": "Plant_ID", "required": true, "type": "string" },
      { "name": "Growth_Stage", "required": true, "type": "enum", "values": ["germination", "seedling", "vegetative", "flowering"] }
    ]
  }
}
```

#### POST /api/import/validate

Validate CSV data before import.

**Request Body:**

```json
{
  "csvData": "Date,Plant_ID,Growth_Stage,Temperature\n2024-01-01,PLANT001,Seedling,24.5",
  "columnMapping": {
    "Date": "date",
    "Plant_ID": "plantId",
    "Growth_Stage": "growthStage",
    "Temperature": "temperature"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "validationResults": {
      "totalRows": 1,
      "validRows": 1,
      "invalidRows": 0,
      "errors": [],
      "warnings": []
    },
    "preview": [
      {
        "row": 1,
        "data": {
          "date": "2024-01-01",
          "plantId": "PLANT001",
          "growthStage": "seedling",
          "temperature": 24.5
        }
      }
    ]
  }
}
```

#### POST /api/import/process

Process validated CSV import.

**Request Body:**

```json
{
  "importJobId": "job_123",
  "columnMapping": {
    "Date": "date",
    "Plant_ID": "plantId",
    "Growth_Stage": "growthStage"
  },
  "options": {
    "createMissingPlants": true,
    "updateExisting": false,
    "applyGrowthStageTransitions": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "importJobId": "job_123",
    "status": "processing",
    "totalRecords": 100,
    "processedRecords": 0,
    "estimatedTime": "30 seconds"
  }
}
```

#### GET /api/import/status/:jobId

Get import job status.

**Response:**

```json
{
  "success": true,
  "data": {
    "importJobId": "job_123",
    "status": "completed",
    "totalRecords": 100,
    "processedRecords": 100,
    "successCount": 98,
    "errorCount": 2,
    "errors": [
      {
        "row": 45,
        "error": "Invalid plant ID: PLANT999"
      }
    ]
  }
}
```

### 5. Cannabis-Specific Features

#### GET /api/cannabis/growth-stages

Get cannabis growth stage definitions.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "stageName": "germination",
      "durationMin": 3,
      "durationMax": 7,
      "temperatureMin": 20.0,
      "temperatureMax": 25.0,
      "humidityMin": 70,
      "humidityMax": 80,
      "lightHours": "18-24",
      "lightIntensity": "Low",
      "nutrientType": "None",
      "ecMin": null,
      "ecMax": null,
      "phMin": null,
      "phMax": null
    }
  ]
}
```

#### POST /api/cannabis/validate-environmental

Validate environmental data against cannabis standards.

**Request Body:**

```json
{
  "stage": "vegetative",
  "environmentalData": {
    "temperature": 25.0,
    "humidity": 65,
    "lightHours": 18
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "vpd": 1.2,
    "recommendations": [
      "Consider increasing humidity to 70% for optimal VPD"
    ]
  }
}
```

#### GET /api/cannabis/nutrient-schedules

Get nutrient schedules for growth stages.

**Query Parameters:**

- `stage` (string): Growth stage
- `strain` (string): Cannabis strain type

**Response:**

```json
{
  "success": true,
  "data": {
    "stage": "vegetative",
    "strain": "hybrid",
    "nutrientType": "High nitrogen",
    "ecRange": { "min": 1.2, "max": 1.8 },
    "phRange": { "min": 5.8, "max": 6.2 },
    "adjustments": {
      "ec": 0,
      "ph": 0
    }
  }
}
```

#### POST /api/cannabis/update-nutrients

Update nutrient schedules for bulk operations.

**Request Body:**

```json
{
  "plantIds": [1, 2, 3, 4, 5],
  "stage": "flowering",
  "nutrientSchedule": {
    "ec": 1.8,
    "ph": 6.0,
    "nutrientType": "High phosphorus/potassium"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "updatedPlants": 5,
    "scheduleApplied": true,
    "nextFeedingDate": "2024-01-20"
  }
}
```

#### GET /api/cannabis/compliance-requirements

Get compliance requirements for operations.

**Query Parameters:**

- `operationType` (string): Type of operation
- `jurisdiction` (string): Legal jurisdiction

**Response:**

```json
{
  "success": true,
  "data": {
    "requirements": [
      {
        "category": "environmental",
        "requirements": [
          "Temperature logs maintained",
          "Humidity levels recorded",
          "Light cycle documented"
        ]
      }
    ]
  }
}
```

#### POST /api/cannabis/track-compliance

Track compliance data for operations.

**Request Body:**

```json
{
  "operationId": 123,
  "operationType": "environmental_update",
  "complianceData": {
    "temperatureLogged": true,
    "humidityLogged": true,
    "lightCycleLogged": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "complianceLogged": true,
    "requirementsMet": 3,
    "totalRequirements": 3
  }
}
```

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid temperature range for vegetative stage",
    "details": {
      "field": "temperature",
      "value": 35.0,
      "allowedRange": "22-28°C"
    }
  }
}
```

### Error Codes

- `VALIDATION_ERROR`: Data validation failed
- `PERMISSION_DENIED`: User lacks permission
- `OPERATION_FAILED`: Bulk operation failed
- `IMPORT_ERROR`: CSV import error
- `UNDO_FAILED`: Undo operation failed
- `COMPLIANCE_ERROR`: Compliance requirement not met

## Performance Requirements

### Response Time Targets

- **Selection/Preview**: <2 seconds
- **Validation**: <1 second
- **Bulk Operations**: <5 seconds for 1000 records
- **CSV Import**: <30 seconds for 1000 records
- **Undo Operations**: <1 second

### Database Optimization

- Indexes on frequently queried columns
- Batch processing for large operations
- Connection pooling
- Query optimization for complex joins

## Security Considerations

### Authentication & Authorization

- All endpoints require valid JWT token
- Role-based access control
- Operation logging for audit trails
- Input validation and sanitization

### Data Protection

- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting on bulk operations

## Testing Strategy

### Unit Tests

- Individual endpoint testing
- Validation logic testing
- Error handling testing
- Performance testing

### Integration Tests

- End-to-end workflow testing
- Database transaction testing
- API contract testing
- Load testing for bulk operations

### Test Data

- Mock cannabis cultivation data
- Various growth stages and environmental conditions
- Edge cases and error scenarios
- Large datasets for performance testing

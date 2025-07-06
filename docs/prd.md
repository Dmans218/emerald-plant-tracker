# Emerald Plant Tracker Brownfield Enhancement PRD

## Intro Project Analysis and Context

### Existing Project Overview

**Analysis Source**: IDE-based fresh analysis combined with existing project documentation

**Current Project State**: Emerald Plant Tracker is a comprehensive, self-hosted cannabis cultivation management application. The system provides advanced nutrient calculation capabilities, environmental monitoring, plant tracking, and complete grow documentation. Built as a full-stack JavaScript application with React frontend and Node.js/Express backend, it's designed for privacy-focused growers who want complete control over their cultivation data.

### Available Documentation Analysis

**Available Documentation**:

- [x] Tech Stack Documentation (README.md, package.json files)
- [x] Source Tree/Architecture (Project structure well-defined)
- [x] API Documentation (Route files with clear endpoints)
- [x] External API Documentation (OCR integration documented)
- [x] Technical Debt Documentation (Migration summaries, changelog)
- [x] Docker Configuration (Complete containerization setup)
- [x] Development Guidelines (.warp-rules, helper scripts)
- [x] Domain-Specific Documentation (Vendor feeding charts, CSV import guides)

### Enhancement Scope Definition

**Enhancement Type**:

- [x] New Feature Addition
- [x] Major Feature Modification
- [x] Integration with New Systems
- [x] Performance/Scalability Improvements

**Enhancement Description**: The Emerald Plant Tracker is positioned for significant enhancements including advanced analytics, AI-powered cultivation recommendations, expanded nutrient vendor support, mobile application development, and integration with IoT sensors for automated environmental monitoring.

**Impact Assessment**:

- [x] Significant Impact (substantial existing code changes)
- [x] Major Impact (architectural changes required)

### Goals and Background Context

#### Goals

- Establish comprehensive BMAD-driven development workflow for systematic feature enhancement
- Create structured approach for adding new nutrient vendors and calculation algorithms
- Implement advanced analytics and reporting capabilities for cultivation optimization
- Develop mobile-first responsive design improvements
- Enable IoT sensor integration for automated environmental data collection
- Add AI-powered cultivation recommendations based on historical data
- Implement advanced user management and multi-tenant capabilities
- Create comprehensive API for third-party integrations

#### Background Context

The Emerald Plant Tracker has evolved from a personal cultivation tool into a comprehensive cannabis management platform. With the recent migration to PostgreSQL and Bun-based build system, the application is now positioned for significant scalability improvements. The current system handles individual plant tracking, environmental monitoring, and nutrient calculations for 10+ professional brands, but lacks advanced analytics, mobile optimization, and AI-driven insights that modern cultivators require. The BMAD methodology will enable systematic enhancement of these capabilities while maintaining the privacy-focused, self-hosted architecture that defines the project.

### Change Log

| Change           | Date       | Version | Description                                           | Author      |
| ---------------- | ---------- | ------- | ----------------------------------------------------- | ----------- |
| Initial BMAD PRD | 2025-07-03 | v1.0    | Established brownfield PRD for systematic development | BMAD System |

## Requirements

### Functional

- FR1: The existing plant tracking system will integrate with advanced analytics dashboard without breaking current CRUD functionality
- FR2: The nutrient calculator will support dynamic vendor addition through admin interface while maintaining existing calculation accuracy
- FR3: Environmental monitoring will integrate with IoT sensors for automated data collection while preserving manual entry capabilities
- FR4: The system will provide AI-powered cultivation recommendations based on historical plant performance data
- FR5: Mobile-responsive interface will provide full functionality on tablets and smartphones
- FR6: Advanced reporting system will generate cultivation insights, yield predictions, and optimization recommendations
- FR7: Multi-tenant architecture will support multiple grow operations while maintaining data isolation
- FR8: RESTful API will enable third-party integrations while maintaining existing internal API functionality

### Non Functional

- NFR1: Enhancement must maintain existing performance characteristics with <2 second page load times
- NFR2: New features must not exceed current memory usage by more than 30%
- NFR3: System must maintain 99.9% uptime during enhancement rollouts
- NFR4: All new features must support offline-first operation for network-limited environments
- NFR5: Enhanced system must handle 10x current data volume without performance degradation
- NFR6: Mobile interface must achieve 90+ Lighthouse performance scores
- NFR7: AI recommendations must process within 5 seconds for real-time feedback
- NFR8: Multi-tenant architecture must maintain sub-100ms query response times

### Compatibility Requirements

- CR1: Existing REST API endpoints must maintain backward compatibility with current response schemas
- CR2: PostgreSQL database schema must support backward migration to current structure
- CR3: Docker container architecture must remain single-container deployable for simplicity
- CR4: Current Bun-based build system must continue to support development workflow
- CR5: Existing environmental data import/export functionality must remain intact
- CR6: Current nutrient calculation algorithms must produce identical results for existing vendor data

## User Interface Enhancement Goals

### Integration with Existing UI

New UI components will extend the current dark-theme cannabis aesthetic using the established Lucide React icon system and consistent card-based layout patterns. The enhancement will maintain the existing green (#22c55e) primary color scheme while introducing complementary colors for new feature differentiation. All new components will follow the established hover effects and smooth transition patterns.

### Modified/New Screens and Views

- **Enhanced Dashboard**: Advanced analytics cards, AI recommendation panel, quick-action shortcuts
- **Analytics Hub**: New comprehensive analytics dashboard with charts, trends, and insights
- **Mobile-Optimized Views**: Touch-friendly interfaces for all existing pages
- **IoT Integration Panel**: New sensor management and automated data collection interface
- **Advanced Calculator**: Enhanced nutrient calculator with vendor management and custom formulations
- **Multi-Tenant Management**: New admin interface for managing multiple grow operations
- **API Management Console**: New developer interface for third-party integration management

### UI Consistency Requirements

- Maintain existing dark theme with cannabis-green accent colors
- Preserve current card-based layout system with hover animations
- Continue using Lucide React icons for consistency
- Maintain responsive grid system for all new components
- Preserve existing toast notification system for user feedback
- Keep consistent typography scale and spacing system

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages**: JavaScript (ES2022), HTML5, CSS3
**Frontend Framework**: React 19.1 with React Router 7, React Hook Form 7.54
**Backend Framework**: Node.js 22 with Express.js 5.1
**Database**: PostgreSQL 16 (recently migrated from SQLite)
**Build System**: Bun (150x faster than previous CRACO setup)
**UI Libraries**: Lucide React icons, Chart.js 4.5, Recharts, React Hot Toast
**Specialized Libraries**: Tesseract.js for OCR functionality
**Infrastructure**: Docker with multi-stage Alpine Linux builds
**Development Tools**: ESLint 9, Prettier, Hot reload development

### Integration Approach

**Database Integration Strategy**: Extend existing PostgreSQL schema with new tables while maintaining current table structures. Use database migrations for schema evolution and maintain referential integrity with existing plant, environment, and log tables.

**API Integration Strategy**: Create new API endpoints following existing Express.js route patterns. Implement versioning strategy (v1, v2) to maintain compatibility while adding enhanced functionality. Preserve existing authentication and rate limiting middleware.

**Frontend Integration Strategy**: Develop new React components using established patterns and hooks. Integrate with existing React Router structure and maintain current state management approaches. Extend existing utility functions and API communication layer.

**Testing Integration Strategy**: Extend current test suite with new test files following existing naming conventions. Maintain separation between unit, integration, and end-to-end tests. Preserve existing CI/CD pipeline compatibility.

### Code Organization and Standards

**File Structure Approach**: Follow established patterns with `backend/routes/`, `frontend/src/components/`, `frontend/src/pages/` structure. New features will create dedicated subdirectories within existing structure.

**Naming Conventions**: Maintain camelCase for JavaScript, kebab-case for CSS classes, PascalCase for React components, and snake_case for database fields.

**Coding Standards**: Continue using ESLint 9 configuration with Prettier formatting. Maintain existing comment standards and JSDoc documentation patterns.

**Documentation Standards**: Follow established markdown documentation patterns. Maintain existing README structure and inline code documentation standards.

### Deployment and Operations

**Build Process Integration**: Extend existing Bun-based build process with new frontend assets. Maintain Docker multi-stage build optimization for production deployments.

**Deployment Strategy**: Preserve single-container Docker deployment model. Implement blue-green deployment strategy for zero-downtime updates. Maintain existing Docker Compose configuration compatibility.

**Monitoring and Logging**: Extend existing Express.js logging with structured logging for new features. Integrate with current error handling and maintain existing log rotation policies.

**Configuration Management**: Extend existing environment variable configuration. Maintain Docker secrets management and preserve existing configuration file patterns.

### Risk Assessment and Mitigation

**Technical Risks**:

- PostgreSQL migration complexity may impact new schema changes
- Bun build system is relatively new and may have compatibility issues with new dependencies
- React 19.1 concurrent features may conflict with new component architectures

**Integration Risks**:

- OCR functionality dependencies may conflict with new image processing features
- Chart.js and Recharts dual implementation may cause bundle size issues
- Docker Alpine Linux base may lack dependencies for new AI/ML features

**Deployment Risks**:

- Single-container architecture may become resource-constrained with new features
- Port 420 cannabis-themed configuration may conflict with enterprise deployments
- Self-hosted deployment model may limit scalability options

**Mitigation Strategies**:

- Implement comprehensive database migration testing with rollback procedures
- Establish Bun compatibility testing for all new dependencies
- Create feature flags for gradual rollout of new capabilities
- Implement container resource monitoring and scaling alerts
- Develop alternative port configuration for enterprise deployments

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: Multiple coordinated epics to manage the comprehensive enhancement scope while maintaining system stability and enabling parallel development streams.

## Epic 1: Advanced Analytics and AI Recommendations

**Epic Goal**: Transform the Emerald Plant Tracker from a data collection tool into an intelligent cultivation optimization platform by implementing advanced analytics, trend analysis, and AI-powered recommendations based on historical plant performance data.

**Integration Requirements**: Seamless integration with existing plant, environment, and log data structures. New analytics engine must operate without impacting current data collection performance.

### Story 1.1: Analytics Data Pipeline Foundation

As a cannabis cultivator,
I want the system to process my historical cultivation data into analytical insights,
so that I can understand patterns and trends in my growing operations.

#### Acceptance Criteria

- AC1: System processes existing plant, environment, and log data into structured analytics tables
- AC2: Analytics pipeline runs without impacting current application performance
- AC3: Historical data from PostgreSQL migration is properly integrated into analytics
- AC4: Data processing includes yield calculations, growth rate analysis, and environmental correlations

#### Integration Verification

- IV1: Existing plant CRUD operations continue to function with <2 second response times
- IV2: Current environmental logging maintains real-time data entry capabilities
- IV3: Analytics processing occurs in background without blocking user interactions

### Story 1.2: Advanced Dashboard with Cultivation Insights

As a cannabis cultivator,
I want to see comprehensive analytics and insights on my dashboard,
so that I can quickly understand my cultivation performance and identify optimization opportunities.

#### Acceptance Criteria

- AC1: Dashboard displays key performance indicators including average yield, growth rates, and environmental efficiency
- AC2: Interactive charts show trends over time using existing Chart.js and Recharts libraries
- AC3: Dashboard maintains existing dark theme and cannabis-green color scheme
- AC4: New analytics cards integrate seamlessly with existing dashboard layout

#### Integration Verification

- IV1: Existing dashboard quick-access features remain functional and visible
- IV2: Current plant status cards maintain their position and functionality
- IV3: Page load times remain under 2 seconds with new analytics components

### Story 1.3: AI-Powered Cultivation Recommendations

As a cannabis cultivator,
I want to receive intelligent recommendations based on my historical data,
so that I can optimize my growing techniques and improve yields.

#### Acceptance Criteria

- AC1: AI system analyzes historical plant performance and environmental data
- AC2: Recommendations include optimal nutrient timing, environmental adjustments, and harvest predictions
- AC3: Recommendation engine processes requests within 5 seconds
- AC4: Recommendations display in dedicated panel maintaining existing UI patterns

#### Integration Verification

- IV1: Existing nutrient calculator continues to provide manual calculations
- IV2: Current environmental monitoring functions remain unaffected
- IV3: AI recommendations complement rather than replace existing cultivation workflow

## Epic 2: Enhanced Mobile Experience and Responsive Design

**Epic Goal**: Transform the Emerald Plant Tracker into a mobile-first application that provides full functionality on tablets and smartphones while maintaining the desktop experience quality.

**Integration Requirements**: Responsive design must preserve all existing functionality while optimizing for touch interfaces and mobile workflows.

### Story 2.1: Mobile-Optimized Navigation and Layout

As a mobile cannabis cultivator,
I want to easily navigate and use all features on my smartphone or tablet,
so that I can manage my cultivation from anywhere in my grow space.

#### Acceptance Criteria

- AC1: Navigation adapts to mobile with collapsible menu and touch-friendly buttons
- AC2: All existing pages render properly on screen sizes from 320px to 1920px
- AC3: Touch targets meet minimum 44px accessibility standards
- AC4: Mobile layout maintains existing dark theme and visual hierarchy

#### Integration Verification

- IV1: Desktop navigation remains unchanged and fully functional
- IV2: Existing keyboard shortcuts continue to work on desktop
- IV3: All current features accessible through mobile interface

### Story 2.2: Touch-Optimized Data Entry and Forms

As a mobile cannabis cultivator,
I want to easily enter cultivation data using touch interfaces,
so that I can quickly log activities while working with my plants.

#### Acceptance Criteria

- AC1: Form inputs optimized for mobile keyboards with appropriate input types
- AC2: Image upload functionality works seamlessly on mobile devices
- AC3: Environmental data entry supports both manual and voice input
- AC4: OCR functionality processes images from mobile camera

#### Integration Verification

- IV1: Desktop form functionality remains unchanged
- IV2: Existing validation and error handling continues to work
- IV3: Current keyboard navigation preserved for desktop users

## Epic 3: IoT Sensor Integration and Automated Monitoring

**Epic Goal**: Enable automated environmental data collection through IoT sensor integration while preserving manual data entry capabilities and maintaining the self-hosted architecture.

**Integration Requirements**: IoT integration must work alongside existing manual environmental logging without disrupting current workflows or requiring external cloud services.

### Story 3.1: IoT Sensor Configuration and Management

As a tech-savvy cannabis cultivator,
I want to configure and manage IoT sensors for automated environmental monitoring,
so that I can reduce manual data entry while maintaining accurate cultivation records.

#### Acceptance Criteria

- AC1: Sensor management interface allows configuration of multiple IoT devices
- AC2: System supports common protocols (MQTT, HTTP, WebSocket) for sensor communication
- AC3: Sensor data validation ensures accuracy before database storage
- AC4: Configuration interface maintains existing UI patterns and dark theme

#### Integration Verification

- IV1: Manual environmental data entry remains fully functional
- IV2: Existing CSV import functionality continues to work
- IV3: Current environmental data display and charts show both manual and automated data

### Story 3.2: Automated Data Collection and Processing

As a cannabis cultivator with IoT sensors,
I want the system to automatically collect and process environmental data,
so that I have continuous monitoring without manual intervention.

#### Acceptance Criteria

- AC1: System automatically collects data from configured sensors at specified intervals
- AC2: Data processing includes validation, duplicate detection, and error handling
- AC3: Automated data integrates seamlessly with existing environmental database schema
- AC4: Background processing doesn't impact application performance

#### Integration Verification

- IV1: Existing manual environmental logging continues without interference
- IV2: Current environmental data visualization shows combined manual and automated data
- IV3: Database performance remains consistent with automated data insertion

## Epic 4: Advanced Nutrient Calculator and Vendor Management

**Epic Goal**: Enhance the nutrient calculator with dynamic vendor management, custom formulation capabilities, and improved accuracy while maintaining compatibility with existing vendor data.

**Integration Requirements**: Enhanced calculator must preserve all existing vendor calculations while adding new capabilities for custom formulations and vendor management.

### Story 4.1: Dynamic Vendor Management System

As a cannabis cultivator and system administrator,
I want to add and manage nutrient vendors through the interface,
so that I can keep the calculator current with new products and formulations.

#### Acceptance Criteria

- AC1: Admin interface allows adding new nutrient vendors with complete product lines
- AC2: Vendor management includes feeding schedules, ratios, and compatibility settings
- AC3: New vendor data integrates with existing calculation algorithms
- AC4: Vendor management preserves existing nutrient data and calculations

#### Integration Verification

- IV1: Existing vendor calculations produce identical results
- IV2: Current nutrient calculator interface remains functional
- IV3: Existing feeding schedule data maintains accuracy

### Story 4.2: Custom Formulation Builder

As an advanced cannabis cultivator,
I want to create custom nutrient formulations and feeding schedules,
so that I can optimize nutrition for my specific strains and growing conditions.

#### Acceptance Criteria

- AC1: Custom formulation builder allows creation of personalized nutrient schedules
- AC2: Custom formulations integrate with existing calculation engine
- AC3: Builder includes validation for nutrient ratios and compatibility
- AC4: Custom formulations can be saved, shared, and modified

#### Integration Verification

- IV1: Existing vendor formulations remain unchanged and accurate
- IV2: Current calculator maintains all existing functionality
- IV3: New custom formulations don't interfere with standard calculations

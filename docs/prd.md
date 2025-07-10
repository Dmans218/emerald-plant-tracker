# Emerald Plant Tracker Brownfield Enhancement PRD

## Intro Project Analysis and Context

### Project Reset and Context

**Analysis Source**: Fresh VS Code workspace analysis following code editor transition
**Reset Date**: July 6, 2025
**Context**: This PRD represents a fresh start for the Emerald Plant Tracker project following a transition between development environments. Previous development progress, including tent analytics aggregation fixes and dashboard improvements, has been completed and is now part of the stable baseline.

**Current Project State**: Emerald Plant Tracker is a mature, self-hosted cannabis cultivation management application with a solid foundation ready for systematic enhancement. The system provides comprehensive nutrient calculation capabilities, environmental monitoring, plant tracking, and grow documentation. Built as a full-stack JavaScript application with React 19.1 frontend and Node.js 22/Express.js 5.1 backend, it features a PostgreSQL 16 database and modern Bun build system.

### Available Documentation Analysis

**Comprehensive Documentation Available**:

- [x] Tech Stack Documentation (README.md, package.json files)
- [x] Source Tree/Architecture (Well-defined project structure)
- [x] API Documentation (Express.js routes with clear endpoints)
- [x] External API Documentation (OCR integration, analytics APIs)
- [x] Technical Debt Documentation (Migration summaries, CHANGELOG.md)
- [x] Docker Configuration (Complete containerization setup)
- [x] Development Guidelines (.warp-rules, helper scripts, PROJECT_STATUS.md)
- [x] Domain-Specific Documentation (Vendor feeding charts, CSV import guides)
- [x] BMAD Framework Integration (core-config.yaml, workflow management)

### Current System Assessment

**Functional Baseline**:

- Dashboard with tent analytics aggregation (recently completed)
- Plant management system with full CRUD operations
- Environmental monitoring with latest-per-tent data display
- Advanced nutrient calculator supporting 10+ professional brands
- OCR functionality for controller data extraction
- Docker deployment with PostgreSQL backend

**Enhancement Scope Definition**:

**Enhancement Type**:

- [x] Strategic Feature Addition (analytics, AI, mobile optimization)
- [x] Architectural Improvements (microservice patterns within monolith)
- [x] Integration Capabilities (IoT sensors, API ecosystem)
- [x] Performance/Scalability Enhancements

**Enhancement Description**: Transform the Emerald Plant Tracker from a comprehensive cultivation tool into an intelligent, AI-powered platform with advanced analytics, mobile-first design, IoT integration, and extensible API architecture while maintaining its privacy-focused, self-hosted foundation.

**Impact Assessment**:

- [x] Significant Impact (new analytics engine, AI processing layer)
- [x] Architectural Evolution (service layer separation, API versioning)
- [x] UI/UX Transformation (mobile-first responsive design)

### Strategic Goals and Background Context

#### Primary Goals

- **Analytics Intelligence**: Transform cultivation data into actionable insights with AI-powered recommendations
- **Mobile-First Experience**: Deliver full functionality across smartphones and tablets
- **IoT Integration**: Enable automated environmental monitoring while preserving manual workflows  
- **Extensible Architecture**: Create API ecosystem for third-party integrations
- **Enhanced Nutrient Management**: Dynamic vendor management with custom formulation capabilities
- **Systematic Development**: Implement BMAD-driven story-based development workflow

#### Background Context

The Emerald Plant Tracker has reached a mature state with a solid technical foundation. Recent improvements include PostgreSQL migration, Bun build system adoption, and dashboard analytics aggregation. The application currently serves individual growers but is positioned for significant capability expansion. Modern cultivators need advanced analytics, mobile accessibility, and automated monitoring - capabilities that require architectural evolution while maintaining the core privacy-focused, self-hosted principles that define the platform.

### Development Reset Acknowledgment

This PRD marks a fresh starting point following development environment transitions. Previous work has been successfully integrated into the stable baseline, and we now proceed with systematic enhancement planning using the BMAD methodology.

### Change Log

| Change              | Date       | Version | Description                                    | Author           |
| ------------------- | ---------- | ------- | ---------------------------------------------- | ---------------- |
| Initial BMAD PRD    | 2025-07-03 | v1.0    | Established brownfield PRD for development    | BMAD System      |
| Environment Reset   | 2025-07-06 | v1.1    | Updated PRD post-editor transition baseline   | BMAD Orchestrator |

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

### Current Technology Stack Assessment

**Core Technologies (Established Baseline)**:

**Languages**: JavaScript (ES2022), HTML5, CSS3
**Frontend Framework**: React 19.1 with React Router 7, React Hook Form 7.54  
**Backend Framework**: Node.js 22 with Express.js 5.1
**Database**: PostgreSQL 16 (successfully migrated from SQLite)
**Build System**: Bun (150x performance improvement over previous CRACO setup)
**UI Libraries**: Lucide React icons, Chart.js 4.5, Recharts, React Hot Toast
**Specialized Libraries**: Tesseract.js for OCR functionality
**Infrastructure**: Docker with multi-stage Alpine Linux builds
**Development Tools**: ESLint 9, Prettier, Hot reload development

**Recent Completions**: Dashboard tent analytics aggregation, PostgreSQL migration, Bun build system integration

### Integration Strategy for Enhancements

**Database Evolution Strategy**: Extend PostgreSQL schema through structured migrations while maintaining existing table integrity. New analytics, IoT, and AI tables will integrate seamlessly with current plant, environment, and log data structures.

**API Architecture Strategy**: Implement versioned endpoints (v1/v2) following established Express.js patterns. Maintain backward compatibility while introducing enhanced functionality. Preserve existing middleware and authentication systems.

**Frontend Enhancement Strategy**: Develop responsive React components using established design patterns and hooks. Integrate new analytics and mobile components with existing React Router structure. Extend current utility functions and state management approaches.

**Testing and Quality Strategy**: Expand test coverage using existing frameworks and naming conventions. Maintain clear separation between unit, integration, and end-to-end tests while adding coverage for new features.

### Development Standards and Organization

**File Structure Standards**: Maintain established patterns with `backend/routes/`, `frontend/src/components/`, `frontend/src/pages/` organization. New features create dedicated subdirectories within existing structure.

**Code Standards**: Continue ESLint 9 configuration with Prettier formatting. Maintain camelCase for JavaScript, kebab-case for CSS classes, PascalCase for React components, and snake_case for database fields.

**Documentation Standards**: Follow established markdown patterns and README structure. Maintain inline code documentation and JSDoc standards.

**Version Control**: Continue development on `dev` branch with feature branches for major enhancements.

### Deployment and Infrastructure Integration

**Container Strategy**: Extend existing Docker multi-stage builds with new dependencies. Maintain single-container deployment model while enabling horizontal scaling considerations.

**Environment Management**: Preserve existing environment variable configuration and Docker secrets management. Add new configuration for analytics, IoT, and AI features.

**Performance Monitoring**: Extend current Express.js logging with structured logging for new services. Maintain existing error handling patterns while adding monitoring for background processes.

**Self-Hosted Architecture**: Maintain privacy-focused, self-hosted deployment model. All AI/ML processing will use client-side or local server resources, avoiding cloud dependencies.

### Risk Assessment and Current State Mitigation

**Technical Risks and Current Mitigation**:

- **Database Schema Evolution**: PostgreSQL migration completed successfully. New schema changes will use tested migration patterns with rollback procedures.
- **Bun Build System Dependencies**: Recently adopted Bun is performing well with 150x speed improvement. Compatibility testing established for all new dependencies.
- **React 19.1 Concurrent Features**: Modern React version enables advanced patterns but requires careful state management for new analytics components.

**Integration Risks and Mitigation**:

- **OCR Functionality**: Tesseract.js integration stable. New image processing features will use modular approach to avoid conflicts.
- **Chart Libraries**: Chart.js and Recharts dual implementation working well. Bundle optimization strategies in place for new analytics components.
- **Docker Alpine Base**: Proven foundation supporting current features. AI/ML dependencies will use client-side libraries or Node.js compatible packages.

**Development Risks and Mitigation**:

- **Single-Container Architecture**: Current deployment model handles existing load efficiently. Resource monitoring and optimization strategies established for new features.
- **Port 420 Configuration**: Cannabis-themed port functional for target audience. Enterprise configuration alternatives documented for broader deployment.
- **Self-Hosted Requirements**: Privacy-focused architecture proven effective. All new AI/ML processing designed for local execution without cloud dependencies.

**Environment Transition Mitigation**:

- **Development Continuity**: Fresh VS Code environment properly configured with existing .warp-rules and development helpers.
- **Context Preservation**: All previous development progress integrated into stable baseline. BMAD framework properly configured for systematic enhancement.
- **Documentation Alignment**: All existing documentation validated and current. PRD represents accurate fresh starting point.

## Epic and Story Structure

### Development Reset and Workflow Initialization

**BMAD Framework Status**: Fully configured with core-config.yaml v4.26.0
**Current Baseline**: All previous development work integrated into stable foundation
**Workflow State**: Ready for systematic story-based development

**Completed Foundation Elements**:

- Dashboard with tent analytics aggregation functionality
- PostgreSQL database with analytics pipeline
- React 19.1 frontend with Chart.js/Recharts visualization
- Bun build system with optimized development workflow
- Docker containerization with Alpine Linux base

**Next Development Phase**: Systematic enhancement using BMAD story-driven approach

### Epic Approach

**Epic Structure Decision**: Coordinated multi-epic approach to manage comprehensive enhancement scope while maintaining system stability and enabling focused development streams.

**Epic Prioritization Strategy**: Begin with analytics foundation (Epic 1) as it leverages recently completed dashboard work, then proceed with mobile optimization (Epic 2), IoT integration (Epic 3), and nutrient calculator enhancements (Epic 4).

## Epic 1: Advanced Analytics and AI Recommendations

**Epic Goal**: Transform the Emerald Plant Tracker from a data collection tool into an intelligent cultivation optimization platform by implementing advanced analytics, trend analysis, and AI-powered recommendations based on historical plant performance data.

**Epic Status**: Ready to begin - builds on recently completed dashboard analytics foundation
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

**Epic Status**: Ready for development following Epic 1 completion
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

**Epic Status**: Planned for development following mobile optimization
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

**Epic Status**: Final epic in current enhancement cycle
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

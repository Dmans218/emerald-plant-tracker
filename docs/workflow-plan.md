# Workflow Plan: Fix Tent Analytics Aggregation

<!-- WORKFLOW-PLAN-META
workflow-id: brownfield-tent-analytics-fix
status: active
created: 2025-07-04T18:36:00Z
updated: 2025-07-04T18:36:00Z
version: 1.0
-->

**Created Date**: July 4, 2025
**Project**: Emerald Plant Tracker - Analytics Dashboard
**Type**: Brownfield Enhancement
**Status**: Active
**Estimated Planning Duration**: 1-2 hours

## Objective

Fix the dashboard analytics display to show **tent-aggregated metrics** when a specific tent is selected, instead of continuing to show individual plant analytics. The backend tent APIs are working correctly and returning aggregated data, but the frontend is not properly consuming and displaying this aggregated information.

## Selected Workflow

**Workflow**: `brownfield-create-story`
**Reason**: This is a targeted bug fix/enhancement with clear scope - the tent selector exists but isn't properly switching to aggregated view.

## Problem Analysis

**Current State**:

- Tent selector dropdown works and fetches tent data successfully
- Backend `/api/analytics/tent/{name}/overview` returns correct aggregated data (199g average yield)
- Frontend displays individual plant data (SF-Left: 198g) instead of tent aggregates

**Root Cause**:

- Frontend tent selection logic fetches tent overview but doesn't properly update the analytics display
- Dashboard state management not switching between individual vs. aggregated views

## Workflow Steps

### Analysis Phase

- [ ] Step 1: Frontend Logic Audit <!-- step-id: 1.1, agent: dev, task: code-review -->

  - **Agent**: Dev
  - **Action**: Analyze `fetchTentAnalytics()` function and state management in Dashboard.js
  - **Output**: Understanding of current logic flow
  - **Finding**: Logic fetches tent data but doesn't properly format for display components

- [ ] Step 2: Data Flow Mapping <!-- step-id: 1.2, agent: dev, task: analysis -->
  - **Agent**: Dev
  - **Action**: Map how tent overview data should populate analytics cards
  - **Output**: Clear understanding of data transformation needed
  - **User Input**: Confirm expected behavior

### Implementation Phase

- [ ] Step 3: Fix Analytics State Logic <!-- step-id: 2.1, agent: dev, task: implement -->

  - **Agent**: Dev
  - **Action**: Update `fetchTentAnalytics()` to properly format tent overview data for analytics cards
  - **Output**: Fixed state management logic
  - **Details**:
    - Transform tent `averageAnalytics` to match analytics card format
    - Update plant name to show "{TentName} Average"
    - Update strain to show "{X} plants"

- [ ] Step 4: Update Analytics Cards Display <!-- step-id: 2.2, agent: dev, task: implement -->

  - **Agent**: Dev
  - **Action**: Ensure analytics cards properly display aggregated data when tent is selected
  - **Output**: Correct visual representation
  - **Details**:
    - Yield Prediction shows tent average (199g)
    - Growth Rate shows tent average (0.8 cm/day)
    - Environment Score shows tent average (0.17)

- [ ] Step 5: Enhance User Experience <!-- step-id: 2.3, agent: ux-expert, task: enhance -->
  - **Agent**: UX Expert
  - **Action**: Improve visual indicators when viewing tent vs individual analytics
  - **Output**: Clear visual distinction
  - **Details**:
    - Update card subtitles to clearly indicate "2 plants average"
    - Consider visual styling differences for aggregated views

### Testing Phase

- [ ] Step 6: Tent Selection Testing <!-- step-id: 3.1, agent: qa, task: test -->

  - **Agent**: QA
  - **Action**: Test tent selector dropdown functionality
  - **Output**: Verified correct behavior
  - **Test Cases**:
    - Select "All Tents" shows individual plant analytics
    - Select "Spiderfarmer" shows aggregated tent analytics
    - Data matches backend API responses

- [ ] Step 7: Cross-Browser Validation <!-- step-id: 3.2, agent: qa, task: test -->
  - **Agent**: QA
  - **Action**: Verify functionality across different browsers
  - **Output**: Confirmed compatibility

## Key Decision Points

1. **Display Strategy** (Step 2.2): <!-- decision-id: D1, status: pending -->
   - Trigger: How to clearly indicate aggregated vs individual data
   - Options:
     - A) Change card styling/color for aggregated views
     - B) Update titles/subtitles only
     - C) Add visual indicators (icons, badges)
   - Impact: User clarity and visual design consistency
   - Decision Made: _Pending - User Input Needed_

## Expected Outputs

### Code Changes

- [ ] Updated `fetchTentAnalytics()` function in Dashboard.js
- [ ] Improved data transformation logic for tent overview → analytics format
- [ ] Enhanced visual indicators for aggregated data display

### Testing Artifacts

- [ ] Test verification of tent selector functionality
- [ ] Documentation of expected vs actual behavior

## Prerequisites Checklist

Before starting this workflow, ensure you have:

- [x] Backend tent analytics APIs working (✅ Confirmed working)
- [x] Frontend tent selector UI implemented (✅ Dropdown exists)
- [x] Understanding of current data flow (✅ Analyzed)
- [ ] Clear definition of expected UX behavior

## Technical Implementation Details

**Files to Modify**:

- `frontend/src/pages/Dashboard.js` - Main logic fix
- Potentially analytics components if display changes needed

**API Endpoints** (Already Working):

- `GET /api/analytics/tents` - Lists available tents ✅
- `GET /api/analytics/tent/{name}/overview` - Returns aggregated data ✅

**Data Transformation Required**:

```javascript
// Transform tent overview to analytics format
tentOverview.averageAnalytics = {
  yieldPrediction: 199, // → analytics.yieldPrediction.value
  growthRate: 0.8, // → analytics.growthRate.value
  environmentalEfficiency: 0.17, // → analytics.environmentalEfficiency.overall
};
```

## Next Steps

1. **Immediate**: Review this plan and confirm the expected behavior for tent analytics display
2. **User Input Needed**: Decide on visual indication strategy for aggregated vs individual data
3. **Start Implementation**: Begin with Step 1 - Frontend Logic Audit
4. **Quick Fix Path**: `@dev.mdc` - Focus on data transformation logic first

## Risk Considerations

- **Low Risk**: Well-defined scope with working backend APIs
- **Testing**: Ensure tent switching doesn't break individual plant analytics view
- **UX**: Maintain clarity about what data is being displayed

## Notes

This is a focused enhancement with clear success criteria. The backend aggregation is working correctly - we just need to properly consume and display the aggregated data in the frontend when a tent is selected.

---

_Plan Status: Ready to execute - awaiting user confirmation on UX approach_

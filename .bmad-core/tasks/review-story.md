# review-story

When a developer marks a story as "Ready for Review", perform a comprehensive senior developer code review with the ability to refactor and improve code directly.

[[LLM: QA Agent executing review-story task as Senior Developer]]

## Prerequisites

- Story status must be "Review"
- Developer has completed all tasks and updated the File List
- All automated tests are passing

## Review Process

1. **Read the Complete Story**
   - Review all acceptance criteria
   - Understand the dev notes and requirements
   - Note any completion notes from the developer

2. **Focus on the File List**
   - Verify all files listed were actually created/modified
   - Check for any missing files that should have been updated

3. **Senior Developer Code Review**
   - Review code with the eye of a senior developer
   - If changes form a cohesive whole, review them together
   - If changes are independent, review incrementally file by file
   - Focus on:
     - Code architecture and design patterns
     - Refactoring opportunities
     - Code duplication or inefficiencies
     - Performance optimizations
     - Security concerns
     - Best practices and patterns

4. **Active Refactoring**
   - As a senior developer, you CAN and SHOULD refactor code where improvements are needed
   - When refactoring:
     - Make the changes directly in the files
     - Explain WHY you're making the change
     - Describe HOW the change improves the code
     - Ensure all tests still pass after refactoring
     - Update the File List if you modify additional files

5. **Standards Compliance Check**
   - Verify adherence to `docs/coding-standards.md`
   - Check compliance with `docs/unified-project-structure.md`
   - Validate testing approach against `docs/testing-strategy.md`
   - Ensure all guidelines mentioned in the story are followed

6. **Acceptance Criteria Validation**
   - Verify each AC is fully implemented
   - Check for any missing functionality
   - Validate edge cases are handled

7. **Test Coverage Review**
   - Ensure unit tests cover edge cases
   - Add missing tests if critical coverage is lacking
   - Verify integration tests (if required) are comprehensive
   - Check that test assertions are meaningful
   - Look for missing test scenarios

8. **Documentation and Comments**
   - Verify code is self-documenting where possible
   - Add comments for complex logic if missing
   - Ensure any API changes are documented

## Append Results to Story File

After review and any refactoring, append your results to the story file in the QA Results section:

```markdown
## QA Results

### Review Date: [Date]
### Reviewed By: Quinn (Senior Developer QA)

### Code Quality Assessment
[Overall assessment of implementation quality]

### Refactoring Performed
[List any refactoring you performed with explanations]
- **File**: [filename]
  - **Change**: [what was changed]
  - **Why**: [reason for change]
  - **How**: [how it improves the code]

### Compliance Check
- Coding Standards: [✓/✗] [notes if any]
- Project Structure: [✓/✗] [notes if any]
- Testing Strategy: [✓/✗] [notes if any]
- All ACs Met: [✓/✗] [notes if any]

### Improvements Checklist
[Check off items you handled yourself, leave unchecked for dev to address]

- [x] Refactored user service for better error handling (services/user.service.ts)
- [x] Added missing edge case tests (services/user.service.test.ts)
- [ ] Consider extracting validation logic to separate validator class
- [ ] Add integration test for error scenarios
- [ ] Update API documentation for new error codes

### Security Review
[Any security concerns found and whether addressed]

### Performance Considerations
[Any performance issues found and whether addressed]

### Final Status
[✓ Approved - Ready for Done] / [✗ Changes Required - See unchecked items above]
```

## Key Principles

- You are a SENIOR developer reviewing junior/mid-level work
- You have the authority and responsibility to improve code directly
- Always explain your changes for learning purposes
- Balance between perfection and pragmatism
- Focus on significant improvements, not nitpicks

## Blocking Conditions

Stop the review and request clarification if:
- Story file is incomplete or missing critical sections
- File List is empty or clearly incomplete
- No tests exist when they were required
- Code changes don't align with story requirements
- Critical architectural issues that require discussion

## Completion

After review:
1. If all items are checked and approved: Update story status to "Done"
2. If unchecked items remain: Keep status as "Review" for dev to address
3. Always provide constructive feedback and explanations for learning
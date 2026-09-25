# GitHub Issues for Tabbed UI Implementation

## Issue 1: Refactor HTML structure for tabbed Summary/Quiz interface

**Title:** [TABBED-UI] Refactor HTML structure to support tabs in results section
**Labels:** enhancement, frontend, ui, tabbed-interface
**Assignee:** @Bhargav-bit567

**Description:**
Wrap summaryCard and mcqCard inside separate tab containers with a tab-bar navigation above them.

**Acceptance Criteria:**
- [ ] Add tab-bar with Summary and Quiz buttons above result cards
- [ ] Add data-tab attributes to tab buttons and content containers
- [ ] Ensure semantic HTML with ARIA labels for accessibility
- [ ] Both cards remain in DOM (no destruction/recreation)
- [ ] HTML validates without errors

**Files to modify:**
- `frontend/index.html` - Main structure
- `frontend/index.css` - Base styling

---

## Issue 2: Implement CSS styling for tabbed interface

**Title:** [TABBED-UI] Add CSS styling for tabbed navigation
**Labels:** enhancement, frontend, ui, styling
**Assignee:** @Bhargav-bit567

**Description:**
Style the tab-bar with proper active/inactive states and create tab-content wrapper styling with smooth transitions.

**Acceptance Criteria:**
- [ ] Tab buttons have clear active/inactive visual states
- [ ] Smooth transitions between tab content
- [ ] Responsive behavior (mobile-friendly)
- [ ] No CSS conflicts with existing styles
- [ ] Hover states are visually distinct

**Files to modify:**
- `frontend/index.css` - Tab styling

---

## Issue 3: Create tab state management and switching logic

**Title:** [TABBED-UI] Implement tab switching logic in JavaScript
**Labels:** feature, frontend, javascript, state-management
**Assignee:** @Bhargav-bit567

**Description:**
Create a TabManager class to handle tab state independently per section. Implement event listeners for tab switching without losing quiz answers.

**Acceptance Criteria:**
- [ ] TabManager class created with methods: switchTab(), getActiveTab(), resetTab()
- [ ] Event listeners attached to all tab buttons
- [ ] Tab switching works for both main results and history panels
- [ ] Quiz answers persist when switching tabs
- [ ] No console errors during tab switching

**Files to modify:**
- `frontend/app.js` - Tab management logic

---

## Issue 4: Implement submit-then-review quiz flow

**Title:** [TABBED-UI] Refactor quiz submission for submit-then-review flow
**Labels:** feature, frontend, quiz, logic
**Assignee:** @Bhargav-bit567

**Description:**
Modify quiz submission to validate all answers before display, show score badge after submission, and display correct/incorrect feedback.

**Acceptance Criteria:**
- [ ] Validate that all questions are answered before allowing submission
- [ ] Store quiz submission state separately from tab state
- [ ] Show score badge only post-submission
- [ ] Display visual feedback (checkmarks/X marks) for each answer
- [ ] "Reset" button appears after submission to allow re-attempt

**Files to modify:**
- `frontend/app.js` - Quiz submission logic
- `frontend/index.css` - Quiz feedback styling

---

## Issue 5: Apply consistent tabbed UI to history panel

**Title:** [TABBED-UI] Update history panel tabs with consistent styling
**Labels:** enhancement, frontend, ui, history
**Assignee:** @Bhargav-bit567

**Description:**
Ensure history panel tabs use the same styling and TabManager logic as main results section for consistency.

**Acceptance Criteria:**
- [ ] History panel tabs match main results tab styling
- [ ] History panel uses same TabManager instance/logic
- [ ] Tab switching in history maintains consistent behavior
- [ ] Active tab is visually distinct

**Files to modify:**
- `frontend/index.html` - History panel structure
- `frontend/index.css` - Consistent tab styling
- `frontend/app.js` - TabManager integration

---

## Issue 6: Persist quiz answers when switching tabs

**Title:** [TABBED-UI] Implement state persistence for quiz answers
**Labels:** feature, frontend, state-management, quiz
**Assignee:** @Bhargav-bit567

**Description:**
Store quiz answers in memory during a session so switching between Summary and Quiz tabs preserves user input. Clear state on new file upload.

**Acceptance Criteria:**
- [ ] Quiz answers stored in memory (not localStorage)
- [ ] Answers persist when switching to Summary tab
- [ ] Answers cleared when new file is uploaded
- [ ] No data leakage between different quiz sessions
- [ ] Quiz state managed separately from tab state

**Files to modify:**
- `frontend/app.js` - State persistence logic

---

## Issue 7: Add completion indicators and score display on Quiz tab

**Title:** [TABBED-UI] Add visual feedback for tab completion
**Labels:** enhancement, frontend, ui, quiz
**Assignee:** @Bhargav-bit567

**Description:**
Show badge or icon on Quiz tab indicating completion status and display score on the tab or content area.

**Acceptance Criteria:**
- [ ] Quiz tab shows score badge after submission (e.g., "8/10")
- [ ] Badge hidden before submission
- [ ] Visual indicator distinguishes completed vs. incomplete quiz
- [ ] Score updates correctly after submission
- [ ] Badge is responsive and mobile-friendly

**Files to modify:**
- `frontend/index.html` - Score badge elements
- `frontend/index.css` - Badge styling
- `frontend/app.js` - Score display logic

---

## Issue 8: Test tabbed interface and polish for production

**Title:** [TABBED-UI] Test and polish tabbed UI (QA & Testing)
**Labels:** qa, testing, frontend
**Assignee:** @Bhargav-bit567

**Description:**
Comprehensive testing of the new tabbed UI including tab switching, state persistence, quiz flow, and responsive design.

**Acceptance Criteria:**
- [ ] Tab switching works without losing quiz progress
- [ ] Quiz submission shows correct results
- [ ] Mobile/tablet responsive design verified
- [ ] History panel tabs consistent with main results
- [ ] No console errors or warnings
- [ ] Keyboard navigation works (Tab key, Enter key)
- [ ] ARIA labels properly describe tab content
- [ ] Performance acceptable (no lag during tab switching)

**Files to test:**
- All frontend files for integration testing
- Cross-browser compatibility
- Mobile responsiveness

---

## How to Create These Issues

1. Go to: https://github.com/Bhargav-bit567/LearnForge/issues
2. Click "New issue"
3. Copy each issue template above
4. Create labels: `tabbed-interface`, `enhancement`, `feature`, `qa`, `testing`, `ui`, `styling`, `state-management`, `quiz`, `history`
5. Assign to yourself: @Bhargav-bit567

## Project Milestone

Create a milestone called "Interactive Tabbed UI v1.0" and assign all 8 issues to it for better tracking.
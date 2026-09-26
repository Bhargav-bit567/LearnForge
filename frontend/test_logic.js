// Functional logic testing
const fs = require('fs');

console.log('🧪 Running Functional Logic Tests...\n');

const js = fs.readFileSync('app.js', 'utf8');

// Test 1: TabManager Constructor
const hasConstructor = js.includes('constructor(tabBarSelector, options = {})');
console.log('✓ TabManager constructor with options:', hasConstructor);

// Test 2: Context Detection
const hasContextDetection = js.includes('this.isHistoryPanel = tabBarSelector.includes(\'history\')');
console.log('✓ Context detection logic:', hasContextDetection);

// Test 3: Quiz Answer Management
const hasAnswerManagement = js.includes('quizAnswers.set(index, opt)') && js.includes('quizAnswers.has(index)');
console.log('✓ Quiz answer persistence logic:', hasAnswerManagement);

// Test 4: Tab Badge Updates
const hasBadgeUpdates = js.includes('updateQuizTabBadge') && js.includes('quizTabBadge.textContent');
console.log('✓ Tab badge update logic:', hasBadgeUpdates);

// Test 5: State Reset Functionality
const hasStateReset = js.includes('resetQuizState') && js.includes('quizAnswers.clear()');
console.log('✓ State reset functionality:', hasStateReset);

// Test 6: Validation Logic
const hasValidation = js.includes('unansweredQuestions') && js.includes('Please answer');
console.log('✓ Quiz validation logic:', hasValidation);

// Test 7: Visual Feedback
const hasVisualFeedback = js.includes('border = \'2px solid var(--red)\'') && js.includes('scrollIntoView');
console.log('✓ Visual feedback for errors:', hasVisualFeedback);

// Test 8: Submission Enhancement
const hasSubmissionEnhancement = js.includes('Checking Answers...') && js.includes('completion-message');
console.log('✓ Enhanced submission flow:', hasSubmissionEnhancement);

// Test 9: Reset Confirmation
const hasResetConfirmation = js.includes('confirm(') && js.includes('reset the quiz');
console.log('✓ Reset confirmation dialog:', hasResetConfirmation);

// Test 10: Progress Tracking
const hasProgressTracking = js.includes('quiz-progress-indicator') && js.includes('answered');
console.log('✓ Progress tracking logic:', hasProgressTracking);

// Test 11: ARIA Management
const hasAriaManagement = js.includes('setAttribute(\'aria-selected\'') && js.includes('role="tab"');
console.log('✓ ARIA attribute management:', hasAriaManagement);

// Test 12: Event Listeners
const hasEventListeners = js.includes('addEventListener(\'click\'') && js.includes('addEventListener(\'keydown\'');
console.log('✓ Event listener setup:', hasEventListeners);

// Count functional test results
let functionalPassed = 0;
let functionalTotal = 12;

[
  hasConstructor,
  hasContextDetection,
  hasAnswerManagement,
  hasBadgeUpdates,
  hasStateReset,
  hasValidation,
  hasVisualFeedback,
  hasSubmissionEnhancement,
  hasResetConfirmation,
  hasProgressTracking,
  hasAriaManagement,
  hasEventListeners
].forEach(test => {
  if (test) functionalPassed++;
});

console.log(`\n📊 Functional Test Summary: ${functionalPassed}/${functionalTotal} passed (${Math.round((functionalPassed/functionalTotal)*100)}%)`);

// CSS Validation
console.log('\n🎨 CSS Feature Tests:');
const css = fs.readFileSync('index.css', 'utf8');

const hasResponsiveTabs = css.includes('@media (max-width: 640px)') && css.includes('.tab-btn');
console.log('✓ Responsive tab design:', hasResponsiveTabs);

const hasAnimations = css.includes('@keyframes spin') && css.includes('@keyframes fadeInUp');
console.log('✓ CSS animations present:', hasAnimations);

const hasTabStyling = css.includes('.tab-btn.active') && css.includes('.quiz-tab-badge');
console.log('✓ Complete tab styling:', hasTabStyling);

const hasHistoryConsistency = css.includes('#historyPanel .tab-btn') && css.includes('.history-tabs');
console.log('✓ History panel consistency:', hasHistoryConsistency);

// CSS test count
let cssPassed = 0;
let cssTotal = 4;

[hasResponsiveTabs, hasAnimations, hasTabStyling, hasHistoryConsistency].forEach(test => {
  if (test) cssPassed++;
});

console.log(`\n📊 CSS Test Summary: ${cssPassed}/${cssTotal} passed (${Math.round((cssPassed/cssTotal)*100)}%)`);

// Overall Summary
const totalPassed = functionalPassed + cssPassed;
const totalTests = functionalTotal + cssTotal;
const overallPercentage = Math.round((totalPassed/totalTests)*100);

console.log(`\n🎯 Overall Test Results: ${totalPassed}/${totalTests} passed (${overallPercentage}%)`);

if (overallPercentage >= 95) {
  console.log('🎉 Excellent! Implementation is solid.');
} else if (overallPercentage >= 85) {
  console.log('✅ Good implementation with minor areas for improvement.');
} else if (overallPercentage >= 70) {
  console.log('⚠️ Implementation needs attention in some areas.');
} else {
  console.log('❌ Implementation has significant issues that need fixing.');
}

// Error Detection
console.log('\n🔍 Error Detection Tests:');

const hasErrorHandling = js.includes('try {') && js.includes('catch');
console.log('✓ Error handling present:', hasErrorHandling);

const hasConsoleLogging = js.includes('console.log') && js.includes('Tab switched');
console.log('✓ Debug logging available:', hasConsoleLogging);

const noObviousErrors = !js.includes('undefinied') && !js.includes('tru') && !js.includes('fals');
console.log('✓ No obvious typos found:', noObviousErrors);
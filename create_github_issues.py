#!/usr/bin/env python3
"""
GitHub Issues Creator for LearnForge StudyPilot
Automates creation of development issues for agent collaboration
"""

import json
import subprocess
import sys
from typing import List, Dict

def create_issue_data() -> List[Dict]:
    """Define all GitHub issues to be created"""
    
    issues = [
        {
            "title": "[INTEGRATION] Test and validate new tabbed UI with backend API",
            "body": """## Description
The new tabbed UI frontend needs thorough testing with the existing Python FastAPI backend to ensure all functionality works seamlessly.

## Acceptance Criteria
- [ ] File upload works correctly with new tabbed interface
- [ ] Summary generation displays properly in Summary tab  
- [ ] MCQ generation works with Quiz tab functionality
- [ ] User authentication integrates with tab state management
- [ ] History panel loads correctly with existing API endpoints
- [ ] Error handling works across all API calls
- [ ] Performance testing shows no regression in API response times

## Technical Details
- Test all endpoints in `backend/app/main.py`
- Verify TabManager class doesn't interfere with API calls
- Check quiz state persistence during backend operations
- Validate error handling for network failures

## Files to Test
- `backend/app/main.py` - API endpoints
- `frontend/app.js` - API integration functions
- Network requests during tab switching

## Priority
**HIGH** - Blocking for production deployment

## Estimated Time
2-3 hours""",
            "labels": ["backend", "testing", "integration", "priority-high"]
        },
        
        {
            "title": "[FEATURE] Add True/False and Short Answer question types",
            "body": """## Description
Expand the quiz system beyond multiple choice to support True/False and Short Answer questions for more diverse assessment options.

## Acceptance Criteria
- [ ] True/False questions render with appropriate UI (radio buttons or toggle)
- [ ] Short answer questions display text input with character limits
- [ ] Quiz validation works for all question types
- [ ] Progress tracking includes all question types  
- [ ] Tab switching preserves answers for new question types
- [ ] Scoring system handles different question types correctly
- [ ] Mobile responsive design for new question layouts

## Technical Implementation
- Extend `renderMCQs()` function to handle multiple question types
- Update TabManager's `saveQuizAnswers()` and `restoreQuizAnswers()` methods
- Enhance validation logic for different input types
- Update progress indicator to count all questions regardless of type

## Files to Modify
- `frontend/app.js` - Quiz rendering and state management
- `frontend/index.css` - Styling for new question types
- Backend models (if question type data structure needs updates)

## Priority
**MEDIUM** - Enhancement feature

## Estimated Time  
4-6 hours""",
            "labels": ["feature", "frontend", "quiz", "priority-medium"]
        },
        
        {
            "title": "[FEATURE] Create comprehensive user dashboard with study analytics",
            "body": """## Description
Build an enhanced user dashboard that provides study analytics, progress tracking, and personalized insights for improved learning outcomes.

## Acceptance Criteria
- [ ] Dashboard tab added to main navigation or separate page
- [ ] Study streak tracking (consecutive days of activity)
- [ ] Performance analytics (average scores, improvement over time)
- [ ] Subject/topic breakdown of study materials
- [ ] Goal setting and progress toward goals
- [ ] Visual charts and graphs for data presentation
- [ ] Export functionality for study reports
- [ ] Mobile-optimized dashboard layout

## Features to Include
- Weekly/monthly activity summaries
- Quiz performance trends over time
- Most challenging topics identification  
- Study time tracking
- Achievement badges/milestones
- Personalized study recommendations

## Technical Requirements
- Data visualization library integration (Chart.js or similar)
- Enhanced backend endpoints for analytics data
- Local storage for offline dashboard features
- Responsive grid layout for dashboard widgets

## Priority
**MEDIUM** - User engagement feature

## Estimated Time
6-8 hours""",
            "labels": ["feature", "frontend", "analytics", "priority-medium"]
        },
        
        {
            "title": "[UI/UX] Complete theme migration and add theme customization",
            "body": """## Description  
Finalize the migration from green theme to modern dark blue/purple theme and add user customization options.

## Acceptance Criteria
- [ ] Remove all remaining green color references from CSS
- [ ] Add light/dark mode toggle functionality  
- [ ] Create theme presets (Professional, Ocean, Sunset, Classic)
- [ ] Implement theme persistence in localStorage
- [ ] Ensure all themes meet WCAG contrast requirements
- [ ] Add theme selection in user settings/profile
- [ ] Smooth transitions between theme changes

## Theme Options to Implement
1. **Dark Mode** (current): Dark blue/purple
2. **Light Mode**: Clean white/light gray with blue accents  
3. **Ocean Theme**: Blue/teal gradient
4. **Sunset Theme**: Orange/purple gradient
5. **Professional**: Neutral grays with subtle color accents

## Files to Modify
- `frontend/index.css` - Theme variables and classes
- `frontend/app.js` - Theme switching logic
- `frontend/index.html` - Theme selection UI

## Priority
**LOW** - Polish feature

## Estimated Time
3-4 hours""",
            "labels": ["ui", "theme", "customization", "priority-low"]
        },
        
        {
            "title": "[FEATURE] Implement advanced quiz features and gamification elements",
            "body": """## Description
Add gamification elements and advanced quiz features to increase user engagement and motivation.

## Acceptance Criteria
- [ ] Timed quiz mode with countdown timer
- [ ] Difficulty levels (Easy, Medium, Hard) with adaptive scoring
- [ ] Hint system for questions (with point deduction)
- [ ] Achievement system with unlockable badges
- [ ] Leaderboard functionality (optional social features)
- [ ] Quiz retake with improved scoring
- [ ] Study streaks and daily goals
- [ ] Progress bars and visual feedback for accomplishments

## Gamification Elements
- Points system based on speed and accuracy
- Badges for milestones (First Quiz, Perfect Score, Study Streak)
- Visual progress indicators
- Celebration animations for achievements
- Daily/weekly challenges

## Technical Implementation  
- Timer functionality with pause/resume
- Achievement tracking system
- Points calculation algorithm
- Badge notification system
- Progress visualization components

## Priority
**LOW** - Enhancement feature

## Estimated Time
5-7 hours""",
            "labels": ["feature", "gamification", "quiz", "priority-low"]
        },
        
        {
            "title": "[OPTIMIZATION] Implement performance optimizations and code organization",
            "body": """## Description
Optimize application performance, implement code splitting, and improve code organization for better maintainability.

## Acceptance Criteria
- [ ] Code splitting for large quiz sets (virtualization)
- [ ] Lazy loading for non-critical components
- [ ] Image optimization and compression
- [ ] CSS and JavaScript minification for production
- [ ] Implement service worker for offline functionality
- [ ] Bundle size analysis and optimization
- [ ] Performance monitoring and metrics collection  
- [ ] Code organization into modules/components

## Performance Targets
- Tab switching: <50ms
- Quiz loading: <200ms for 20+ questions
- Initial page load: <1s on 3G connection
- Bundle size: <500KB compressed

## Technical Implementation
- Implement intersection observer for quiz question rendering
- Add service worker for offline quiz taking
- Modularize JavaScript into separate files
- Implement CSS containment for performance
- Add performance monitoring dashboard

## Priority
**MEDIUM** - Quality improvement

## Estimated Time
4-5 hours""",
            "labels": ["performance", "optimization", "code-quality", "priority-medium"]
        },
        
        {
            "title": "[ACCESSIBILITY] Comprehensive accessibility audit and improvements",
            "body": """## Description
Conduct thorough accessibility testing and implement improvements to ensure exceptional accessibility beyond WCAG 2.1 compliance.

## Acceptance Criteria
- [ ] Screen reader testing with NVDA, JAWS, and VoiceOver
- [ ] Keyboard navigation testing for all interactive elements
- [ ] Color contrast validation for all theme options
- [ ] Focus management testing during tab switching
- [ ] ARIA label validation and optimization
- [ ] Voice control compatibility testing
- [ ] Mobile accessibility testing with TalkBack/VoiceOver
- [ ] Cognitive accessibility improvements (clear instructions, error prevention)

## Testing Tools
- axe-core accessibility testing
- WAVE Web Accessibility Evaluation Tool
- Color contrast analyzers
- Screen reader software testing  
- Keyboard navigation testing

## Improvements to Implement
- Enhanced focus indicators
- Better error message descriptions
- Improved heading structure
- Alternative text for visual elements
- Skip navigation links
- High contrast mode improvements

## Priority
**HIGH** - Compliance requirement

## Estimated Time
3-4 hours""",
            "labels": ["accessibility", "a11y", "wcag", "priority-high"]
        },
        
        {
            "title": "[MOBILE] Implement Progressive Web App features and mobile optimizations",
            "body": """## Description
Transform the web application into a Progressive Web App with mobile-first features and offline capabilities.

## Acceptance Criteria
- [ ] Service worker implementation for offline functionality
- [ ] Web app manifest for installation
- [ ] Offline quiz taking capability
- [ ] Push notifications for study reminders
- [ ] Background sync for quiz submissions
- [ ] App-like navigation and user experience
- [ ] Touch gestures for quiz navigation
- [ ] Mobile-specific UI optimizations

## PWA Features
- Install prompt for mobile devices
- Offline-first architecture
- Background synchronization
- Push notification system
- Mobile sharing capabilities
- Touch-friendly interactions

## Technical Requirements
- Service worker with caching strategies
- IndexedDB for offline data storage
- Web Push API integration
- Manifest.json configuration
- Mobile gesture recognition
- Responsive image loading

## Priority
**LOW** - Future enhancement

## Estimated Time
6-8 hours""",
            "labels": ["pwa", "mobile", "offline", "priority-low"]
        }
    ]
    
    return issues

def create_github_issue(issue_data: Dict, repo_owner: str, repo_name: str) -> bool:
    """Create a single GitHub issue using gh CLI"""
    
    try:
        # Prepare the gh CLI command
        cmd = [
            'gh', 'issue', 'create',
            '--repo', f'{repo_owner}/{repo_name}',
            '--title', issue_data['title'],
            '--body', issue_data['body']
        ]
        
        # Add labels if specified
        if 'labels' in issue_data and issue_data['labels']:
            for label in issue_data['labels']:
                cmd.extend(['--label', label])
        
        # Execute the command
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        print(f"✅ Created issue: {issue_data['title']}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to create issue: {issue_data['title']}")
        print(f"   Error: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error creating issue: {issue_data['title']}")
        print(f"   Error: {str(e)}")
        return False

def main():
    """Main function to create all GitHub issues"""
    
    print("🚀 GitHub Issues Creator for LearnForge StudyPilot")
    print("=" * 50)
    
    # Configuration
    repo_owner = "Bhargav-bit567"
    repo_name = "LearnForge"
    
    # Check if gh CLI is available
    try:
        subprocess.run(['gh', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ GitHub CLI (gh) is not installed or not in PATH")
        print("   Please install it from: https://cli.github.com/")
        print("   And authenticate with: gh auth login")
        sys.exit(1)
    
    # Check if user is authenticated
    try:
        result = subprocess.run(['gh', 'auth', 'status'], capture_output=True, check=True)
        print("✅ GitHub CLI authentication verified")
    except subprocess.CalledProcessError:
        print("❌ Not authenticated with GitHub CLI")
        print("   Please run: gh auth login")
        sys.exit(1)
    
    # Get all issues to create
    issues = create_issue_data()
    
    print(f"\n📋 Creating {len(issues)} GitHub issues...")
    print("-" * 40)
    
    # Create each issue
    created_count = 0
    for i, issue in enumerate(issues, 1):
        print(f"\n[{i}/{len(issues)}] Creating issue...")
        if create_github_issue(issue, repo_owner, repo_name):
            created_count += 1
    
    # Summary
    print("\n" + "=" * 50)
    print(f"🎉 Issue creation complete!")
    print(f"   Created: {created_count}/{len(issues)} issues")
    
    if created_count == len(issues):
        print("✅ All issues created successfully!")
        print(f"\n🔗 View issues at: https://github.com/{repo_owner}/{repo_name}/issues")
        print("\n🤖 Other agents can now:")
        print("   1. Browse available issues")
        print("   2. Assign themselves to issues")
        print("   3. Create feature branches")
        print("   4. Start collaborative development")
    else:
        failed_count = len(issues) - created_count
        print(f"⚠️  {failed_count} issues failed to create")
        print("   Please check the errors above and try again")
    
    print("\n📚 Next steps:")
    print("   • Read AGENT_HANDOFF.md for complete context")
    print("   • Use QUICK_START_FOR_AGENTS.md for setup")
    print("   • Follow development patterns in existing code")
    print("   • Run validation tests before submitting PRs")

if __name__ == "__main__":
    main()
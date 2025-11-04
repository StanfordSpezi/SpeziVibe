# Contributing to SpeziVibe

Thank you for your interest in contributing to SpeziVibe! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/SpeziVibe.git`
3. Install dependencies: `npm install`
4. Start the dev server: `npx expo start`

## Development Workflow

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes following our code style (see `.cursorrules`)
3. Test your changes thoroughly in both light and dark modes
4. Commit with clear, descriptive messages
5. Push to your fork and create a pull request

### Code Style

- **TypeScript**: Use strict typing, avoid `any`
- **Components**: Functional components with hooks
- **Naming**: `kebab-case` for files, `PascalCase` for components
- **Formatting**: The project uses standard TypeScript/React Native conventions
- **Comments**: Add comments for complex logic, not obvious code

### Testing Your Changes

Since this is a template project, testing is primarily manual:

1. **Visual Testing**: Check all affected screens in light and dark modes
2. **User Flows**: Test complete user journeys (onboarding, scheduling, etc.)
3. **Edge Cases**: Test with empty states, errors, boundary conditions
4. **Devices**: Test on both iOS and Android if possible

**Quick Testing Tips**:
- Use "Reset Onboarding" button in Explore tab
- Use "Reset Schedule Tasks" to refresh scheduler state
- Use "Test Questionnaires" to try forms without scheduling

## Common Contribution Areas

### 🎨 UI/UX Improvements
- Enhance existing screens
- Improve animations and transitions
- Refine dark mode styling
- Add accessibility features

### 📝 New Questionnaire Types
1. Add question type to `lib/questionnaires/types.ts`
2. Create component in `components/questionnaire-form.tsx`
3. Add validation logic
4. Create sample questionnaire

### 📅 Scheduler Enhancements
1. Add new task categories to `lib/scheduler/types.ts`
2. Update icon mapping in `app/(tabs)/schedule.tsx`
3. Add sample tasks to `lib/scheduler/sample-tasks.ts`
4. Document new features

### 📖 Documentation
- Improve README clarity
- Add code examples to ARCHITECTURE.md
- Update .cursorrules with new patterns
- Add inline code documentation

## Pull Request Guidelines

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Changes tested in light and dark modes
- [ ] No TypeScript errors or warnings
- [ ] Relevant documentation updated
- [ ] Clear PR description with context

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] UI/UX improvement
- [ ] Documentation update
- [ ] Refactoring

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots for UI changes
```

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about:
- Code organization
- Key systems (Scheduler, Questionnaires)
- Design patterns
- Extension points

## Need Help?

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open an issue with reproduction steps
- **Features**: Open an issue to discuss before implementing

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Remember this is a community project

## Recognition

Contributors will be:
- Credited in commit messages
- Listed in future releases
- Part of the Stanford Spezi ecosystem

Thank you for contributing to SpeziVibe! 🎉

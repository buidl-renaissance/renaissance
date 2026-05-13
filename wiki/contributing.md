# Contributing Guide

Welcome to the Renaissance project! This guide covers how to contribute effectively.

## Getting Started

1. Read the [Project Overview](./project-overview.md) to understand what we're building
2. Follow [Local Development Setup](./local-dev-setup.md) to get the app running
3. Review the [Architecture](./architecture.md) to understand the codebase structure

## Branch Naming Conventions

Use descriptive branch names with prefixes:

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feature/` | New features | `feature/add-event-reminders` |
| `fix/` | Bug fixes | `fix/calendar-scroll-crash` |
| `refactor/` | Code refactoring | `refactor/event-card-components` |
| `docs/` | Documentation | `docs/update-setup-guide` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `test/` | Test additions | `test/add-hook-tests` |

**Format:** `prefix/short-description`

**Examples:**
- `feature/farcaster-profile-view`
- `fix/bookmark-sync-issue`
- `refactor/split-calendar-screen`

## Commit Style

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(events): add RSVP confirmation modal

- Show confirmation before RSVP submission
- Add loading state during API call
- Handle error cases with toast notification

Closes #123
```

```
fix(calendar): prevent crash on empty event list

Handle null check in event grouping function
when no events are returned from API.
```

### Guidelines

- Use imperative mood ("add" not "added")
- Keep subject line under 50 characters
- Wrap body at 72 characters
- Reference issues in footer

## Pull Request Process

### Before Creating a PR

1. **Ensure tests pass** (when applicable)
2. **Verify the app runs** on both iOS and Android simulators
3. **Check for TypeScript errors**: `npx tsc --noEmit`
4. **Update documentation** if your changes affect it
5. **Keep changes focused** – one feature/fix per PR

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
- [ ] iOS Simulator
- [ ] Android Emulator
- [ ] Physical device

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. Create PR against `main` branch
2. Request review from team members
3. Address feedback and iterate
4. Squash and merge when approved

## Code Style Guidelines

### TypeScript

- Enable strict mode (`"strict": true`)
- Use explicit types for function parameters and return values
- Prefer interfaces over type aliases for object shapes
- Use `const` assertions where appropriate

```typescript
// Good
interface EventCardProps {
  event: DAEvent;
  onPress: (event: DAEvent) => void;
  showBookmark?: boolean;
}

// Avoid
type EventCardProps = {
  event: any;
  onPress: Function;
}
```

### React Components

- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic into custom hooks
- Use destructuring for props

```typescript
// Good
const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { title, startDate, venue } = event;
  
  return (
    <TouchableOpacity onPress={() => onPress(event)}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

// Avoid
function EventCard(props) {
  return (
    <TouchableOpacity onPress={() => props.onPress(props.event)}>
      <Text>{props.event.title}</Text>
    </TouchableOpacity>
  );
}
```

### Styling

- Use StyleSheet for performance
- Follow the theme system for colors
- Keep styles close to components
- Use semantic color tokens

```typescript
// Good
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 8,
  },
  title: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

// Avoid
<View style={{ backgroundColor: '#1E1E1E', padding: 16 }}>
```

### File Organization

- One component per file
- Group related files in directories
- Use index files for clean exports
- Follow existing naming conventions

### Imports

Order imports as:
1. React/React Native
2. Third-party libraries
3. Local components
4. Local utilities
5. Types/interfaces
6. Assets

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { EventCard } from '../Components/EventCard';
import { theme } from '../colors';

import { useEvents } from '../hooks/useEvents';
import { formatDate } from '../utils/formatDate';

import { DAEvent } from '../interfaces';
```

## Testing

### Current State

The project does not currently have a comprehensive test suite. When adding tests:

- Use Jest (included with Expo)
- Use React Native Testing Library for component tests
- Mock native modules appropriately

### Test File Naming

- `ComponentName.test.tsx` – Component tests
- `hookName.test.ts` – Hook tests
- `utilName.test.ts` – Utility tests

### Running Tests

```bash
# Run all tests
yarn test

# Run with coverage
yarn test --coverage

# Watch mode
yarn test --watch
```

## Documentation

### When to Update Docs

Update documentation when:
- Adding new features
- Changing API contracts
- Modifying configuration
- Adding new dependencies

### Documentation Files

- `wiki/` – Developer documentation
- Code comments – Complex logic only
- README.md – Project overview

## Questions & Support

- **Slack/Discord**: Join the buidl-renaissance community channels
- **GitHub Issues**: Report bugs or request features
- **Code Reviews**: Ask questions in PR comments

## License

By contributing to Renaissance, you agree that your contributions will be licensed under the project's license.

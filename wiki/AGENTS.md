# AGENTS.md

Instructions and context for AI agents working on the Renaissance codebase.

## Project Context

**Renaissance** is a React Native / Expo mobile application for event discovery and community engagement. The app aggregates events from multiple sources (Luma, Resident Advisor, Meetup, Instagram) and provides social features, Web3 wallet integration, and a rewards system.

### Key Technical Details

- **Framework**: React Native 0.81.5 + Expo SDK 54
- **Language**: TypeScript 5.9.x (strict mode)
- **State Management**: React Context API (no Redux)
- **Navigation**: React Navigation 6.x (Stack Navigator)
- **Package Manager**: Yarn (Classic)
- **Node Version**: >= 20.19.0

## Repository Structure Summary

```
renaissance/
├── App.tsx              # Entry point with providers
├── src/
│   ├── api/             # API client modules
│   ├── Components/      # Reusable UI components
│   ├── Screens/         # Screen components (views)
│   ├── Navigation/      # React Navigation config
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── config/          # App configuration
│   ├── interfaces/      # TypeScript interfaces
│   ├── dpop.ts          # Main API client
│   ├── colors.ts        # Theme definitions
│   └── interfaces.ts    # Core type definitions
├── wiki/                # Developer documentation
├── app.json             # Expo configuration
├── eas.json             # EAS Build profiles
└── package.json         # Dependencies
```

## Important Files to Understand

| File | Purpose |
|------|---------|
| `App.tsx` | App entry, provider hierarchy, deep linking |
| `src/dpop.ts` | Primary API client (auth, events, content) |
| `src/interfaces.ts` | Core TypeScript interfaces |
| `src/colors.ts` | Theme system (dark/light themes) |
| `src/Navigation/HomeNavigationStack.tsx` | All screen routes |
| `src/context/Auth.tsx` | Authentication state |
| `src/context/LocalStorage.tsx` | AsyncStorage wrapper |

## Coding Conventions

### General

- Use TypeScript with explicit types
- Functional components with hooks
- StyleSheet for styling (not inline styles)
- Theme colors from `src/colors.ts`

### Naming

- **Components**: PascalCase (`EventCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useEvents.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Interfaces**: PascalCase with descriptive names (`DAEvent`, `LumaEvent`)

### Component Pattern

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../colors';

interface Props {
  title: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<Props> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    padding: 16,
  },
  title: {
    color: theme.text,
    fontSize: 16,
  },
});
```

### Hook Pattern

```typescript
import { useState, useEffect } from 'react';

export const useMyData = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
```

## Common Tasks

### Adding a New Screen

1. Create screen file in `src/Screens/`
2. Add route in `src/Navigation/HomeNavigationStack.tsx`
3. Add type to `HomeNavigationStackParamList`

### Adding a New API Endpoint

1. Add function in `src/dpop.ts` or relevant `src/api/` module
2. Create hook in `src/hooks/` if needed
3. Add TypeScript interfaces

### Adding a Component

1. Create file in `src/Components/`
2. Follow component pattern above
3. Export from component file

### Modifying Theme

1. Edit `src/colors.ts`
2. Add to both `darkTheme` and `lightTheme`
3. Use semantic token names

## API Information

### Backend Services

- **Main API**: `https://api.detroiter.network`
- **Events API**: `https://events.builddetroit.xyz`
- **Storage**: `https://dpop.nyc3.digitaloceanspaces.com`

### Authentication

The app uses DPoP (Decentralized Proof of Participation) tokens stored in AsyncStorage:
- `DPoPToken` – JWT bearer token
- `DPoPUser` – User object
- `DPoPContact` – Contact/profile data

## Things to Avoid

- **Don't use Redux** – Use React Context instead
- **Don't add inline styles** – Use StyleSheet
- **Don't hardcode colors** – Use theme tokens
- **Don't create .md files** unless explicitly requested
- **Don't modify package.json** unless asked
- **Don't run `eas build` or `eas update`** unless asked
- **Don't git commit/push** unless asked

## Testing Changes

```bash
# Start dev server
yarn start

# Type check
npx tsc --noEmit

# Run on iOS
yarn ios

# Run on Android
yarn android
```

## Useful Commands

```bash
# Clear cache
npx expo start --clear

# Check for TS errors
npx tsc --noEmit

# Install dependencies
yarn install
```

## Documentation Reference

For detailed information, refer to the wiki:
- [Project Overview](./project-overview.md)
- [Repository Structure](./repo-structure.md)
- [Architecture](./architecture.md)
- [Local Dev Setup](./local-dev-setup.md)
- [Environment Config](./environment-config.md)
- [Tools & Dependencies](./tools.md)
- [Contributing](./contributing.md)

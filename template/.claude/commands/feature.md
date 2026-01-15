# Feature Generator

Create new features and screens for your digital health app.

## When to Use

Invoke `/feature` when you need to:
- Add a new tab or screen to the app
- Create a new feature with components
- Set up a new data flow

## Feature Structure

```
app/
  (tabs)/
    <feature>.tsx       # Tab screen
  <feature>/
    index.tsx           # Stack screen
    [id].tsx            # Dynamic route
components/
  <feature>/
    FeatureView.tsx
    FeatureCard.tsx
lib/
  <feature>-config.ts
  hooks/
    use<Feature>.ts
```

## Adding a Tab Screen

### 1. Create the Screen

```tsx
// app/(tabs)/feature.tsx
import { View, Text } from 'react-native';

export default function FeatureScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Feature Screen</Text>
    </View>
  );
}
```

### 2. Add to Tab Layout

Edit `app/(tabs)/_layout.tsx`:

```tsx
<Tabs.Screen
  name="feature"
  options={{
    title: 'Feature',
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="star.fill" color={color} />
    ),
  }}
/>
```

## Adding a Stack Screen

### 1. Create the Screen

```tsx
// app/feature/index.tsx
import { Stack } from 'expo-router';

export default function FeatureLayout() {
  return <Stack />;
}
```

### 2. Add to Root Layout

Edit `app/_layout.tsx`:

```tsx
<Stack.Screen name="feature" options={{ headerShown: false }} />
```

## Creating a Hook

```tsx
// lib/hooks/useFeature.ts
import { useState, useEffect } from 'react';
import { useStandard } from '../services';

export function useFeature() {
  const { backend } = useStandard();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await backend.getFeatureData();
        if (!cancelled) {
          setData(result);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true };
  }, [backend]);

  return { data, isLoading };
}
```

## Creating a Component

```tsx
// components/feature/FeatureCard.tsx
import { View, Text, StyleSheet } from 'react-native';

interface FeatureCardProps {
  title: string;
  description: string;
  onPress?: () => void;
}

export function FeatureCard({ title, description, onPress }: FeatureCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
```

## Connecting to Backend

If the feature needs data persistence:

### 1. Add to BackendService Interface

```typescript
// lib/services/types.ts
interface BackendService {
  // ... existing methods
  getFeatureData(): Promise<FeatureData[]>;
  saveFeatureData(data: FeatureData): Promise<void>;
}
```

### 2. Implement in Backend

```typescript
// lib/services/backends/local-storage.ts
async getFeatureData(): Promise<FeatureData[]> {
  const data = await AsyncStorage.getItem('feature-data');
  return data ? JSON.parse(data) : [];
}
```

## Key Patterns

1. **Use Standard** - Always access backend via `useStandard()`
2. **Cancellation Tokens** - Every async effect needs `let cancelled = false`
3. **Memoize Values** - Use `useMemo` for context provider values
4. **Declarative Guards** - Use `<Redirect href="..." />` for auth

## Checklist

- [ ] Screen file created in correct location
- [ ] Added to tab or stack layout
- [ ] Hook created with cancellation token
- [ ] Components follow project patterns
- [ ] Backend interface extended (if needed)
- [ ] TypeScript types defined

# @spezivibe/onboarding

Reusable onboarding components and utilities for React Native applications.

## Installation

```bash
npm install @spezivibe/onboarding
```

## Peer Dependencies

- `react` >= 18.0.0
- `react-native` >= 0.70.0
- `@react-native-async-storage/async-storage` >= 1.0.0

## Usage

### Hooks

#### useOnboardingStatus

Check if onboarding has been completed:

```tsx
import { useOnboardingStatus } from '@spezivibe/onboarding';

function App() {
  const isOnboardingCompleted = useOnboardingStatus();

  if (isOnboardingCompleted === null) {
    return <LoadingScreen />;
  }

  return isOnboardingCompleted ? <MainApp /> : <OnboardingFlow />;
}
```

#### markOnboardingCompleted / resetOnboardingStatus

```tsx
import { markOnboardingCompleted, resetOnboardingStatus } from '@spezivibe/onboarding';

// Mark onboarding as completed
await markOnboardingCompleted();

// Reset onboarding (for testing or re-onboarding)
await resetOnboardingStatus();
```

### Services

#### ConsentService

Manage user consent data:

```tsx
import { ConsentService } from '@spezivibe/onboarding';

// Save consent
const consentData = ConsentService.createConsentData('John', 'Doe', true);
await ConsentService.saveConsent(consentData);

// Get consent
const consent = await ConsentService.getConsent();

// Check if user has consented
const hasConsented = await ConsentService.hasConsented();

// Clear consent
await ConsentService.clearConsent();
```

### Components

#### PaginationDots

```tsx
import { PaginationDots } from '@spezivibe/onboarding';

<PaginationDots
  total={3}
  current={currentStep}
  isDark={colorScheme === 'dark'}
/>
```

#### FeatureCard

```tsx
import { FeatureCard } from '@spezivibe/onboarding';

<FeatureCard
  icon="sparkles"
  title="Personalized Experience"
  description="SpeziVibe adapts to your unique wellness journey."
  isDark={colorScheme === 'dark'}
  renderIcon={(name, size, color) => (
    <IconSymbol name={name} size={size} color={color} />
  )}
/>
```

#### ConsentCheckbox

```tsx
import { ConsentCheckbox } from '@spezivibe/onboarding';

<ConsentCheckbox
  checked={agreed}
  onToggle={() => setAgreed(!agreed)}
  label="I agree to the terms and conditions"
  isDark={colorScheme === 'dark'}
/>
```

#### OnboardingButton

```tsx
import { OnboardingButton } from '@spezivibe/onboarding';

<OnboardingButton
  label="Continue"
  onPress={handleNext}
  isDark={colorScheme === 'dark'}
/>
```

#### NameInputSection

```tsx
import { NameInputSection } from '@spezivibe/onboarding';

<NameInputSection
  givenName={givenName}
  familyName={familyName}
  onGivenNameChange={setGivenName}
  onFamilyNameChange={setFamilyName}
  isDark={colorScheme === 'dark'}
/>
```

## Customization

All components support custom colors via the `colors` prop:

```tsx
const customColors = {
  primaryLight: '#8C1515',
  primaryDark: '#B83A4B',
  inactiveLight: '#ddd',
  inactiveDark: '#333',
};

<OnboardingButton
  label="Continue"
  onPress={handleNext}
  colors={customColors}
/>
```

## License

MIT

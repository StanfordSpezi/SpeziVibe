# Test Generator

Generate Jest tests following project testing patterns for React Native and FHIR compliance.

## When to Use

Invoke `/test` when you need to:
- Create tests for new components or services
- Add missing test coverage
- Write FHIR mapping round-trip tests
- Test React hooks and providers

## Test Location and Naming

```
__tests__/<filename>.test.ts     # Unit tests
__tests__/<filename>.test.tsx    # Component tests
```

## Test Structure

```typescript
/**
 * Tests for [Module Name]
 */

import { ... } from '../module';

describe('ModuleName', () => {
  describe('FunctionOrClass', () => {
    describe('method or scenario', () => {
      it('should [expected behavior]', () => {
        // Arrange
        // Act
        // Assert
      });
    });
  });
});
```

## Key Testing Patterns

### Account Service Testing

Use `InMemoryAccountService` for auth testing:

```typescript
import { InMemoryAccountService } from '@spezivibe/account';

describe('AuthComponent', () => {
  let service: InMemoryAccountService;

  beforeEach(async () => {
    service = new InMemoryAccountService({ startUnauthenticated: true });
    await service.initialize();
  });

  it('should handle unauthenticated state', async () => {
    const isAuth = await service.isAuthenticated();
    expect(isAuth).toBe(false);
  });

  it('should login successfully', async () => {
    await service.login({ email: 'test@example.com', password: 'password' });
    const user = await service.getCurrentUser();
    expect(user?.email).toBe('test@example.com');
  });
});
```

### FHIR Mapping Round-Trip Tests

Critical for healthcare data integrity:

```typescript
import { taskToFhirTask, fhirTaskToTask } from '../lib/fhir-mapping';

describe('FHIR Task Mapping', () => {
  const sampleTask = {
    id: 'task-123',
    title: 'Daily Check-in',
    category: 'questionnaire',
    schedule: {
      startDate: new Date('2024-01-01'),
      recurrence: { type: 'daily', hour: 9, minute: 0 },
    },
    completionPolicy: { type: 'anytime' },
    createdAt: new Date('2024-01-01'),
  };

  it('should round-trip Task correctly', () => {
    const fhirTask = taskToFhirTask(sampleTask, 'patient-123');
    const roundTripped = fhirTaskToTask(fhirTask);

    expect(roundTripped.id).toBe(sampleTask.id);
    expect(roundTripped.title).toBe(sampleTask.title);
    expect(roundTripped.category).toBe(sampleTask.category);
  });
});
```

### React Component Testing

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useAccount } from '@spezivibe/account';

jest.mock('@spezivibe/account', () => ({
  ...jest.requireActual('@spezivibe/account'),
  useAccount: jest.fn(),
}));

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAccount.mockReturnValue({
      signedIn: true,
      isLoading: false,
      user: { uid: '123', email: 'test@example.com' },
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      resetPassword: jest.fn(),
      updateProfile: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it('renders user email', () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText('test@example.com')).toBeTruthy();
  });
});
```

## Running Tests

```bash
npm test                    # All tests
npm test -- --coverage      # With coverage
npm test -- --watch         # Watch mode
```

## Test Categories

1. **Unit Tests**: Individual functions and utilities
2. **Integration Tests**: Service interactions
3. **Round-trip Tests**: FHIR mappings (toFhir -> fromFhir)
4. **Edge Cases**: Null values, missing fields, invalid input
5. **Error Handling**: Network failures, validation errors

## Checklist

- [ ] Tests use descriptive names (`should [verb] when [condition]`)
- [ ] Arrange-Act-Assert structure
- [ ] Mocks cleared in beforeEach
- [ ] FHIR mappings have round-trip tests
- [ ] Edge cases covered (null, undefined, empty)
- [ ] Async tests use proper awaits

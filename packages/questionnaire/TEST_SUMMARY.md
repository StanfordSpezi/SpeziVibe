# Test Suite Summary - @spezivibe/questionnaire

Comprehensive test coverage for the questionnaire package.

## Test Structure

```
src/__tests__/
├── types.test.ts                          # Type definition tests
├── validation/
│   └── schema-builder.test.ts            # Validation logic tests
├── theme/
│   └── default-theme.test.ts             # Theme utilities tests
├── storage/
│   └── async-storage.test.ts             # Storage adapter tests
└── components/
    ├── TextQuestion.test.tsx             # Text question component tests
    ├── ScaleQuestion.test.tsx            # Scale question component tests
    ├── MultipleChoiceQuestion.test.tsx   # Multiple choice component tests
    ├── BooleanQuestion.test.tsx          # Boolean question component tests
    └── QuestionnaireForm.test.tsx        # Main form component tests
```

## Test Coverage

### 1. Type Definitions (`types.test.ts`)
- ✅ Valid question types
- ✅ Question interface validation
- ✅ Questionnaire structure
- ✅ Response format with metadata
- ✅ Theme interface

**Total: 12 tests**

### 2. Validation (`schema-builder.test.ts`)
- ✅ Text question validation (required/optional)
- ✅ Scale question min/max range validation
- ✅ Default scale ranges (1-10)
- ✅ Multiple choice validation
- ✅ Boolean question validation
- ✅ Date question validation
- ✅ Multiple questions validation
- ✅ Optional fields handling

**Total: 17 tests**

### 3. Theme Utilities (`default-theme.test.ts`)
- ✅ Default light theme structure
- ✅ Default dark theme structure
- ✅ Theme property validation (colors, spacing, borderRadius, fontSize)
- ✅ mergeTheme with undefined input
- ✅ mergeTheme partial colors
- ✅ mergeTheme partial spacing
- ✅ mergeTheme partial borderRadius
- ✅ mergeTheme partial fontSize
- ✅ mergeTheme multiple properties
- ✅ mergeTheme with default base theme

**Total: 18 tests**

### 4. Storage Adapter (`async-storage.test.ts`)
- ✅ Save new response
- ✅ Append to existing responses
- ✅ Replace response with same ID
- ✅ Error handling on save
- ✅ Get all responses
- ✅ Date deserialization
- ✅ Empty storage handling
- ✅ Error handling on read
- ✅ Filter by questionnaire ID
- ✅ Get by response ID
- ✅ Delete by ID
- ✅ Clear all responses

**Total: 15 tests**

### 5. Question Components

#### TextQuestion (`TextQuestion.test.tsx`)
- ✅ Render question title
- ✅ Render question description
- ✅ Render required asterisk
- ✅ Render placeholder
- ✅ Update formik on text change
- ✅ Display initial value
- ✅ Multiline support

**Total: 8 tests**

#### ScaleQuestion (`ScaleQuestion.test.tsx`)
- ✅ Render question title
- ✅ Render correct number of buttons
- ✅ Default range (1-10)
- ✅ Custom range support
- ✅ Update formik on button press
- ✅ Required indicator
- ✅ Description rendering

**Total: 7 tests**

#### MultipleChoiceQuestion (`MultipleChoiceQuestion.test.tsx`)
- ✅ Render question title
- ✅ Render all options
- ✅ Render description
- ✅ Required indicator
- ✅ Update formik on selection
- ✅ Handle numeric values
- ✅ Display initial value

**Total: 7 tests**

#### BooleanQuestion (`BooleanQuestion.test.tsx`)
- ✅ Render question title
- ✅ Render Yes/No buttons
- ✅ Render description
- ✅ Required indicator
- ✅ Update formik to true
- ✅ Update formik to false
- ✅ Display initial true value
- ✅ Display initial false value

**Total: 8 tests**

### 6. QuestionnaireForm (`QuestionnaireForm.test.tsx`)
- ✅ Render questionnaire title and description
- ✅ Render all questions
- ✅ Render submit button (default text)
- ✅ Render submit button (custom text)
- ✅ Render cancel button when provided
- ✅ Not render cancel button when not provided
- ✅ Call onCancel
- ✅ Call onSubmit with valid data
- ✅ Show alert on validation errors
- ✅ Apply custom theme
- ✅ Use initial values
- ✅ Handle async onSubmit
- ✅ Show alert on submission error
- ✅ Render different question types
- ✅ Custom cancel button text

**Total: 15 tests**

## Total Test Count

**107 tests** covering:
- Type definitions and interfaces
- Validation logic
- Theme system
- Storage operations
- All question components
- Main form component
- Error handling
- Edge cases

## Running Tests

### Run all tests
```bash
cd packages/questionnaire
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Technologies

- **Jest** - Testing framework
- **@testing-library/react-native** - Component testing utilities
- **react-test-renderer** - React component rendering

## Coverage Goals

Target coverage:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Key Testing Patterns

### 1. Component Testing with Formik
All question components are tested within a Formik context to ensure form integration works correctly.

```typescript
const renderWithFormik = (question: Question, initialValues = {}) => {
  return render(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      {(formik) => <TextQuestion question={question} formik={formik} theme={theme} />}
    </Formik>
  );
};
```

### 2. Async Testing
Async operations like form submission are tested with `waitFor`:

```typescript
await waitFor(() => {
  expect(onSubmit).toHaveBeenCalled();
});
```

### 3. Mock Testing
External dependencies like AsyncStorage are mocked:

```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));
```

## Continuous Integration

Tests should be run:
- On every commit
- Before merging pull requests
- Before publishing new versions

Example CI configuration:
```yaml
- name: Run tests
  run: |
    cd packages/questionnaire
    npm install
    npm test
```

## Future Test Enhancements

- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] Integration tests with real AsyncStorage
- [ ] E2E tests with example app
- [ ] Snapshot testing for components
- [ ] Test different React Native versions

## Test Maintenance

- Update tests when adding new features
- Keep tests DRY with shared utilities
- Document complex test scenarios
- Review and refactor tests regularly
- Maintain high coverage standards

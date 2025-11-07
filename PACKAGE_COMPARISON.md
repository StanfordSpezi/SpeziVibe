# Package Structure Comparison: SpeziQuestionnaire vs @spezivibe/questionnaire

## Overview

This document compares the structure of the official Stanford Spezi `SpeziQuestionnaire` package (Swift/iOS) with our `@spezivibe/questionnaire` package (React Native/TypeScript).

---

## Platform & Technology

### SpeziQuestionnaire (Official)
- **Platform**: iOS only
- **Language**: Swift
- **UI Framework**: SwiftUI + ResearchKit
- **Package Manager**: Swift Package Manager
- **Target**: iOS 17+

### @spezivibe/questionnaire (Ours)
- **Platform**: React Native (iOS + Android)
- **Language**: TypeScript
- **UI Framework**: React Native components
- **Package Manager**: npm
- **Target**: React Native 0.70+

---

## Package Structure

### SpeziQuestionnaire Structure

```
SpeziQuestionnaire/
├── Package.swift                      # Swift package definition
├── Sources/
│   ├── SpeziQuestionnaire/
│   │   ├── QuestionnaireView.swift   # Main view component
│   │   ├── QuestionnaireResult.swift # Result enum (completed/cancelled/failed)
│   │   ├── Export.swift              # Export utilities
│   │   ├── Identifier+Identifiable.swift
│   │   ├── Resources/
│   │   │   └── Localizable.xcstrings # Localization
│   │   └── SpeziQuestionnaire.docc/  # Documentation
│   └── SpeziTimedWalkTest/           # Additional module
└── Tests/
    ├── SpeziQuestionnaireTests/
    └── UITests/
```

**Key Files**: 4 Swift files (very minimal)

### @spezivibe/questionnaire Structure

```
packages/questionnaire/
├── package.json                       # npm package definition
├── src/
│   ├── types/
│   │   └── index.ts                  # Type definitions
│   ├── components/
│   │   ├── QuestionnaireForm.tsx     # Main form component
│   │   └── questions/                # Individual question components
│   │       ├── TextQuestion.tsx
│   │       ├── ScaleQuestion.tsx
│   │       ├── MultipleChoiceQuestion.tsx
│   │       └── BooleanQuestion.tsx
│   ├── validation/
│   │   └── schema-builder.ts         # Yup validation
│   ├── storage/
│   │   └── adapters/
│   │       └── async-storage.ts      # Storage implementation
│   ├── theme/
│   │   └── default-theme.ts          # Theme system
│   └── index.ts                       # Main exports
├── __tests__/                         # 107 tests
│   ├── types.test.ts
│   ├── validation/
│   ├── theme/
│   ├── storage/
│   └── components/
├── README.md
├── MIGRATION_GUIDE.md
├── EXAMPLES.md
└── CHANGELOG.md
```

**Key Files**: 29 source files + 10 test files

---

## Architectural Approach

### SpeziQuestionnaire (Wrapper Approach)

**Philosophy**: Thin wrapper around existing frameworks

- **Uses ResearchKit**: Leverages Apple's ResearchKit for questionnaire rendering
- **Uses ResearchKitOnFHIR**: Converts FHIR questionnaires to ResearchKit format
- **Uses FHIRModels**: Direct FHIR questionnaire support
- **Minimal Custom Code**: Only 4 Swift files - mostly glue code

**Benefits**:
- ✅ Leverages mature, battle-tested frameworks (ResearchKit)
- ✅ Standard FHIR compliance out of the box
- ✅ Minimal maintenance burden
- ✅ Apple-native UI/UX

**Trade-offs**:
- ❌ iOS only (no Android)
- ❌ Depends on ResearchKit (large dependency)
- ❌ Less customization flexibility
- ❌ Tied to FHIR format

### @spezivibe/questionnaire (Custom Implementation)

**Philosophy**: Ground-up custom implementation

- **Custom Components**: Built from scratch using React Native primitives
- **Custom Validation**: Uses Yup for schema validation
- **Custom Theming**: Fully customizable theme system
- **Custom Storage**: Abstract storage interface

**Benefits**:
- ✅ Cross-platform (iOS + Android)
- ✅ Highly customizable
- ✅ No heavy dependencies
- ✅ Flexible question format (not tied to FHIR)

**Trade-offs**:
- ❌ More code to maintain (29 files)
- ❌ Not FHIR-compliant by default
- ❌ More testing required (107 tests)
- ❌ No leverage of existing questionnaire frameworks

---

## Functionality Comparison

### SpeziQuestionnaire Features

1. **FHIR Compliance**: Native FHIR `Questionnaire` support
2. **ResearchKit Integration**: Full ResearchKit question types
3. **Completion Steps**: Optional completion messages
4. **Cancel Behavior**: Configurable cancel confirmation
5. **Result Handling**: Enum result (completed/cancelled/failed)
6. **Localization**: Built-in i18n support

### @spezivibe/questionnaire Features

1. **Question Types**: 5 types (text, scale, multipleChoice, boolean, date)
2. **Validation**: Real-time Yup validation
3. **Theming**: Custom light/dark themes
4. **Storage**: Abstract storage interface with adapters
5. **Form Management**: Formik integration
6. **Custom Rendering**: Full control over question UI
7. **Metadata Support**: Flexible metadata field in responses

---

## Result/Response Format

### SpeziQuestionnaire

```swift
public enum QuestionnaireResult {
    case completed(QuestionnaireResponse)  // FHIR QuestionnaireResponse
    case cancelled
    case failed
}
```

Uses standard **FHIR QuestionnaireResponse** format - fully compliant with HL7 FHIR spec.

### @spezivibe/questionnaire

```typescript
interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  completedAt: Date;
  answers: Record<string, any>;
  metadata?: Record<string, any>;  // Flexible app-specific data
}
```

Uses custom **simplified response format** - easier to work with but not FHIR-compliant.

---

## Testing Approach

### SpeziQuestionnaire

- **Unit Tests**: Basic tests in `SpeziQuestionnaireTests`
- **UI Tests**: Full UI testing suite in `UITests`
- **Coverage**: Not specified in repo
- **Test Count**: ~2-3 test files

### @spezivibe/questionnaire

- **Unit Tests**: Comprehensive unit tests for all modules
- **Component Tests**: All 4 question types + main form
- **Coverage Goal**: >80% across all categories
- **Test Count**: 107 tests across 10 files

---

## Documentation

### SpeziQuestionnaire

- **README**: Basic usage and example
- **API Docs**: SwiftUI DocC documentation
- **Citation**: Academic citation file (CITATION.cff)
- **Contributing**: Standard Spezi contribution guidelines

### @spezivibe/questionnaire

- **README**: Complete API reference and quick start
- **MIGRATION_GUIDE**: Step-by-step upgrade instructions
- **EXAMPLES**: Real-world usage patterns
- **CHANGELOG**: Version history and breaking changes
- **TEST_SUMMARY**: Detailed test documentation

---

## Dependencies

### SpeziQuestionnaire

```swift
dependencies: [
  .package(url: "https://github.com/StanfordSpezi/Spezi.git"),
  .package(url: "https://github.com/apple/FHIRModels.git"),
  .package(url: "https://github.com/StanfordBDHG/ResearchKit.git"),
  .package(url: "https://github.com/StanfordBDHG/ResearchKitOnFHIR.git")
]
```

**Heavy dependencies** - relies on large frameworks like ResearchKit.

### @spezivibe/questionnaire

```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-native": ">=0.70.0",
    "formik": "^2.4.0",
    "yup": "^1.0.0"
  }
}
```

**Lightweight dependencies** - only form management and validation libs.

---

## Key Philosophical Differences

### SpeziQuestionnaire
- **Leverage existing frameworks**: Don't reinvent the wheel
- **FHIR-first**: Built around FHIR standard
- **iOS-focused**: Apple ecosystem only
- **Research-oriented**: Built for clinical research use cases
- **Minimal custom code**: Thin wrapper approach

### @spezivibe/questionnaire
- **Custom implementation**: Full control over behavior
- **Format-agnostic**: Works with any JSON structure
- **Cross-platform**: iOS + Android support
- **App-oriented**: Built for general app use cases
- **Rich feature set**: More customization options

---

## Which Approach is Better?

### Use SpeziQuestionnaire Approach If:
- ✅ Building iOS-only apps
- ✅ Need FHIR compliance
- ✅ Want to leverage ResearchKit's mature features
- ✅ Prefer minimal custom code to maintain
- ✅ Target clinical/research applications

### Use @spezivibe/questionnaire Approach If:
- ✅ Need cross-platform support (iOS + Android)
- ✅ Want maximum customization flexibility
- ✅ Don't need FHIR compliance
- ✅ Prefer lighter dependencies
- ✅ Building consumer/wellness apps

---

## Recommendations for @spezivibe/questionnaire

Based on this comparison, here are potential improvements:

### 1. Consider FHIR Support (Optional)
Add an optional FHIR adapter to convert between our format and FHIR:

```typescript
export function toFHIRQuestionnaireResponse(
  response: QuestionnaireResponse
): FHIRQuestionnaireResponse {
  // Convert our format to FHIR
}
```

### 2. Simplify Code (Inspired by SpeziQuestionnaire)
Our package has 29 source files vs their 4. Could we leverage existing libraries more?

**Potential options**:
- Use existing form libraries instead of building custom question components
- Consider React Native Paper or similar for pre-built components

### 3. Add Localization Support
SpeziQuestionnaire has built-in i18n. We could add:

```typescript
interface Question {
  title: string | Record<string, string>;  // Support multiple languages
  titleKey?: string;  // i18n key
}
```

### 4. Add Cancel Behavior Options
Inspired by their `CancelBehavior` enum:

```typescript
type CancelBehavior = 'confirm' | 'immediate' | 'disabled';
```

### 5. Consider Enum for Results
Instead of just calling `onSubmit`, use a result enum like theirs:

```typescript
type QuestionnaireResult =
  | { status: 'completed'; answers: Record<string, any> }
  | { status: 'cancelled' }
  | { status: 'failed'; error: Error };
```

---

## Conclusion

**SpeziQuestionnaire** takes a **minimalist wrapper** approach, leveraging heavy-duty frameworks (ResearchKit) to provide FHIR-compliant questionnaires with minimal custom code.

**@spezivibe/questionnaire** takes a **custom implementation** approach, building everything from scratch for maximum flexibility and cross-platform support.

Both approaches are valid - the choice depends on:
- Platform requirements (iOS-only vs cross-platform)
- FHIR compliance needs
- Customization requirements
- Maintenance capacity

Our approach makes sense for React Native apps that need cross-platform support and don't require FHIR compliance. However, we could potentially adopt some of their design patterns (result enums, cancel behaviors) while maintaining our custom implementation.

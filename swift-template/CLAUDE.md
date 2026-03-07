# AI Coding Instructions — {{ProjectName}}

## Architecture

This is a Stanford Spezi iOS application using SwiftUI.

### Core Pattern: Standard

The `{{ProjectName}}Standard` is the central data handler. It conforms to the `Standard` protocol
and any constraint protocols required by configured modules (e.g., `HealthKitConstraint`).

**All data flows through the Standard.** Modules send data to it; it decides where data goes
(Firestore, local storage, etc.).

### Module Configuration

Modules are configured in `{{ProjectName}}Delegate` via the `Configuration` block:

```swift
Configuration(standard: {{ProjectName}}Standard()) {
    AccountConfiguration(...)
    HealthKit { ... }
    Scheduler()
    Notifications()
}
```

### Key Files

| File | Purpose |
|------|---------|
| `Sources/App.swift` | @main entry point |
| `Sources/Delegate.swift` | SpeziAppDelegate — module configuration |
| `Sources/Standard.swift` | Standard protocol — central data handler |
| `Sources/HomeView.swift` | Tab-based main navigation |
| `Sources/OnboardingFlow.swift` | Onboarding/consent flow |
| `Sources/SharedContext/FeatureFlags.swift` | Dev/test feature toggles |

## Commands

```bash
# Build
xcodebuild -scheme {{ProjectName}} -destination 'platform=iOS Simulator,name=iPhone 16'

# Test
xcodebuild test -scheme {{ProjectName}} -destination 'platform=iOS Simulator,name=iPhone 16'

# Regenerate Xcode project (after modifying project.yml)
xcodegen generate
```

## Critical Rules

1. **Always use Standard** — Data flows through the Standard, never import backends directly
2. **Module = Spezi Module** — Each capability is a Spezi `Module` configured in the Delegate
3. **@Observable for state** — Use `@Observable` macro, not `ObservableObject`
4. **Actor isolation** — Standard is an actor; respect Swift concurrency rules
5. **Cancellation** — Use structured concurrency (TaskGroup, withTaskCancellationHandler)
6. **Declarative navigation** — Use `ManagedNavigationStack` for onboarding flows
7. **Entitlements** — HealthKit, Push Notifications require capabilities in .entitlements

## Don't

- Add data handling logic outside the Standard
- Use UIKit unless absolutely necessary (SwiftUI-first)
- Ignore actor isolation warnings
- Skip `@MainActor` on UI-facing properties
- Commit without running tests

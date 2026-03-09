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

## Setup Checklist

Before building for the first time:

1. **Firebase Setup (one command):**
   ```bash
   ./scripts/firebase-setup.sh
   ```
   This automatically: creates Firebase project, registers iOS app, downloads GoogleService-Info.plist,
   enables Email/Password auth, creates Firestore database, deploys security rules, enables Storage.

   Or manually:
   - Go to [Firebase Console](https://console.firebase.google.com) → Create project → Add iOS app
   - Download `GoogleService-Info.plist` to `Sources/Resources/GoogleService-Info.plist`
   - Enable Authentication → Email/Password
   - Create Firestore database
   - Ensure the `BUNDLE_ID` in the plist matches `PRODUCT_BUNDLE_IDENTIFIER` in `project.yml`

2. **Code Signing** — Set your `DEVELOPMENT_TEAM` in `project.yml` (currently `YOUR_TEAM_ID`)

## Pre-Deploy Testing

**Every build is gated by smoke tests.** The `build-and-deploy.sh` script automatically runs these
before uploading to TestFlight:

- ✅ App launches without crashing
- ✅ App launches in offline mode (Firebase disabled)
- ✅ Home screen loads with tab bar
- ✅ All tabs are accessible
- ✅ Onboarding flow starts correctly
- ✅ Signup UI is reachable

If any test fails, the build is **blocked** from uploading. Fix the issue first.

```bash
# Run smoke tests manually
xcodebuild test -scheme {{ProjectName}} -destination 'platform=iOS Simulator,name=iPhone 16' \
  -only-testing:{{ProjectName}}UITests/SmokeTests -skipMacroValidation

# Deploy (tests run automatically before upload)
./scripts/build-and-deploy.sh

# Skip tests (not recommended)
./scripts/build-and-deploy.sh --skip-tests
```

## Commands

```bash
# Build
xcodebuild -scheme {{ProjectName}} -destination 'platform=iOS Simulator,name=iPhone 16'

# Test
xcodebuild test -scheme {{ProjectName}} -destination 'platform=iOS Simulator,name=iPhone 16'

# Regenerate Xcode project (after modifying project.yml)
xcodegen generate

# Build, archive, and upload to TestFlight (one command!)
./scripts/build-and-deploy.sh

# Bump build number + build + upload
./scripts/build-and-deploy.sh --bump

# Build only (no upload)
./scripts/build-and-deploy.sh --build-only
```

### Archive & Upload (manual)

```bash
# Archive with macro validation bypass
xcodebuild archive \
  -project {{ProjectName}}.xcodeproj \
  -scheme {{ProjectName}} \
  -destination "generic/platform=iOS" \
  -archivePath /tmp/{{ProjectName}}.xcarchive \
  -allowProvisioningUpdates \
  -skipMacroValidation \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=YOUR_TEAM_ID

# Export + upload
xcodebuild -exportArchive \
  -archivePath /tmp/{{ProjectName}}.xcarchive \
  -exportOptionsPlist export-options.plist \
  -exportPath /tmp/{{ProjectName}}-export \
  -allowProvisioningUpdates \
  -authenticationKeyPath ~/Downloads/AuthKey_YOUR_API_KEY_ID.p8 \
  -authenticationKeyID YOUR_API_KEY_ID \
  -authenticationKeyIssuerID YOUR_API_KEY_ISSUER
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

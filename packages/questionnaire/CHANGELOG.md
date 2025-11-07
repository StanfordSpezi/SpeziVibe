# Changelog

All notable changes to the `@spezivibe/questionnaire` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added
- Initial release of `@spezivibe/questionnaire` as an independent package
- Core questionnaire types: `Questionnaire`, `Question`, `QuestionnaireResponse`
- Support for 5 question types: `text`, `scale`, `multipleChoice`, `boolean`, `date`
- `QuestionnaireForm` component with Formik and Yup validation
- Modular question components: `TextQuestion`, `ScaleQuestion`, `MultipleChoiceQuestion`, `BooleanQuestion`
- Theme system with `QuestionnaireTheme` interface
- Default light and dark themes
- `mergeTheme()` utility for theme customization
- `QuestionnaireStorage` interface for storage abstraction
- `AsyncStorageAdapter` implementation for React Native AsyncStorage
- Validation schema builder using Yup
- Full TypeScript support with exported types
- Comprehensive README with API documentation
- Migration guide for upgrading from coupled implementation
- Examples documentation with real-world use cases

### Changed
- **Breaking:** Refactored `QuestionnaireResponse` type:
  - Added required `id` field
  - Removed `taskId` field (now in `metadata`)
  - Added optional `metadata` field for flexible app-specific data
- **Breaking:** `QuestionnaireForm` now requires `theme` prop (no longer uses internal `useColorScheme`)
- Extracted question components into separate files for better modularity
- Moved validation logic into dedicated `validation/schema-builder.ts`

### Removed
- **Breaking:** Removed dependency on app-specific `ThemedText` component
- **Breaking:** Removed dependency on app-specific `useColorScheme` hook
- **Breaking:** Removed direct scheduler integration (now handled by parent app)
- Removed hard-coded app color scheme

### Architecture
- Monorepo structure using npm workspaces
- Package located at `packages/questionnaire/`
- Main app imports from `@spezivibe/questionnaire`
- Peer dependencies: `react`, `react-native`, `formik`, `yup`
- Optional peer dependency: `@react-native-async-storage/async-storage`

### Migration Notes
See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed upgrade instructions.

Key changes for existing implementations:
1. Import from `@spezivibe/questionnaire` instead of local components
2. Pass `theme` prop explicitly to `QuestionnaireForm`
3. Update `QuestionnaireResponse` structure to include `id` and use `metadata`
4. Handle app-specific integrations (scheduler, storage) in parent components

### Documentation
- [README.md](./README.md) - Complete API reference and quick start
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Upgrade guide from coupled implementation
- [EXAMPLES.md](./EXAMPLES.md) - Real-world usage examples

---

## Future Roadmap

Planned features for future releases:

### [1.1.0] - Planned
- Date question component implementation
- Multi-select question type
- File upload question type
- Question validation messages customization
- Response editing capabilities
- Progress indicator for multi-page forms

### [1.2.0] - Planned
- Conditional question logic (show/hide based on answers)
- Question branching and skip logic
- Response analytics utilities
- Export responses to CSV/JSON
- Firebase storage adapter

### [2.0.0] - Planned
- Web support (React compatibility)
- Accessibility improvements (screen reader support)
- Animations and transitions
- Custom question component registration API
- Internationalization (i18n) support

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

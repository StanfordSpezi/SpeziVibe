/**
 * Backend Services Module
 *
 * This module provides an abstraction layer for different backend implementations,
 * allowing the app to use local storage or other backends
 * without changing the core business logic.
 */

export * from './types';
export * from './backend-factory';
export * from './config';
export { LocalStorageBackend } from './backends/local-storage';

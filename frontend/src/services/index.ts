/**
 * JeevanRaksha – Service Factory & Central Exports
 *
 * Provides a single entry point for DataService and SafetyService.
 * Allows instant runtime toggling between Mock Mode (synthetic data) and Firebase Mode (cloud DB).
 */

import type { DataService } from './DataService';
import { MockService } from './mock/MockService';
import { FirebaseService } from './FirebaseService';
import { SafetyService } from './SafetyService';

const MODE_KEY = 'jr_app_data_mode'; // 'MOCK' | 'FIREBASE'

let currentMode: 'MOCK' | 'FIREBASE' = (localStorage.getItem(MODE_KEY) as 'MOCK' | 'FIREBASE') || 'MOCK';

const mockInstance = new MockService();
const firebaseInstance = new FirebaseService();

let activeDataService: DataService = currentMode === 'FIREBASE' ? firebaseInstance : mockInstance;

export function getDataService(): DataService {
  return activeDataService;
}

export function getDataMode(): 'MOCK' | 'FIREBASE' {
  return currentMode;
}

export function setDataMode(mode: 'MOCK' | 'FIREBASE'): void {
  currentMode = mode;
  localStorage.setItem(MODE_KEY, mode);
  activeDataService = mode === 'FIREBASE' ? firebaseInstance : mockInstance;
  window.dispatchEvent(new CustomEvent('jr-mode-change', { detail: mode }));
}

export function isFirebaseConfigured(): boolean {
  return firebaseInstance.hasCredentials();
}

export { SafetyService };
export * from './types';
